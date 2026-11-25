import { randomUUID } from 'node:crypto';
import { readdir, lstat } from 'node:fs/promises';
import path from 'node:path';
import { ProjectFiles } from '../src/main/files';
import { atomicJSON } from '../src/main/config';
import type { Proposal } from '../src/shared/contracts';

const SLUG = /^[a-z0-9][a-z0-9-]{0,63}$/;

export interface SpecWorkflowInput {
  operation: 'init' | 'list' | 'status' | 'verify';
  feature?: string;
  title?: string;
  goal?: string;
}

export interface SpecHooks {
  approve(message: string, detail: string, signal?: AbortSignal): Promise<boolean>;
  validateEdit?: (session: string, project: string, proposal: Proposal, signal?: AbortSignal) => Promise<void>;
}

function parseRequirements(specText: string) {
  const reqs: Array<{ id: string; text: string }> = [];
  for (const line of specText.split(/\r?\n/)) {
    const m = /\b(REQ-\d{2,4})\b[:\s-]*(.*)$/i.exec(line.trim());
    if (m) reqs.push({ id: m[1].toUpperCase(), text: m[2].trim() });
  }
  return reqs;
}

function parseTasks(tasksText: string) {
  const tasks: Array<{ id?: string; done: boolean; text: string; reqRefs: string[]; fileRefs: string[] }> = [];
  for (const line of tasksText.split(/\r?\n/)) {
    const m = /^\s*[-*]\s+\[([ xX])\]\s+(.+)$/.exec(line);
    if (!m) continue;
    const text = m[2].trim();
    const idMatch = /^(T\d{2,4})\b/i.exec(text);
    const reqRefs = [...new Set((text.match(/\bREQ-\d{2,4}\b/gi) ?? []).map(s => s.toUpperCase()))];
    const fileRefs = [...new Set((text.match(/`([A-Za-z0-9_./-]+\.[A-Za-z0-9]{1,8})`/g) ?? []).map(s => s.slice(1, -1)))];
    tasks.push({ id: idMatch?.[1].toUpperCase(), done: m[1].toLowerCase() === 'x', text, reqRefs, fileRefs });
  }
  return tasks;
}

function defaultSpec(title: string, goal: string) {
  return `# ${title} — 기능 명세 (Spec)\n\n## 목표\n${goal || '요구사항의 목적과 배경을 구체적으로 적습니다.'}\n\n## 요구사항 및 수용 기준\n- **REQ-01**: 핵심 기능 동작과 정상 경로 기대 결과를 정의합니다.\n- **REQ-02**: 오류·경계 조건 및 기존 데이터/호환성 보존 기준을 정의합니다.\n\n## 비목표 (Out of Scope)\n- 이번 작업에서 변경하지 않을 범위를 명시합니다.\n`;
}

function defaultPlan(title: string) {
  return `# ${title} — 설계 및 영향 계획 (Plan)\n\n## 변경 대상 모듈 및 인터페이스\n- 대상 파일과 호출 계약을 실제 코드 근거와 함께 정리합니다.\n\n## 안전 경계 및 회귀 위험\n- 권한·경로·취소·실패 복구 경로와 기존 테스트 영향 범위를 검토합니다.\n\n## 검증 전략\n- 단위 테스트, 통합 테스트, 미실행 현장 수용 범위를 구분해 기록합니다.\n`;
}

function defaultTasks(title: string) {
  return `# ${title} — 구현 및 검증 체크리스트 (Tasks)\n\n- [ ] T01 (REQ-01) 핵심 모듈 인터페이스와 구현 작성\n- [ ] T02 (REQ-02) 오류·경계 조건 처리 및 회귀 방지\n- [ ] T03 (REQ-01, REQ-02) 대상 테스트 추가 및 실행 검증\n`;
}

/** Spec-Driven Development workflow manager operating on project-local specs/<feature>/. */
export class SpecWorkflow {
  constructor(private root: string) {}

  private validateSlug(feature?: string): string {
    const slug = (feature ?? '').trim().toLowerCase();
    if (!SLUG.test(slug)) {
      throw new Error('기능 슬러그(feature)는 영문 소문자·숫자·하이픈만 허용합니다 (예: user-auth-v2).');
    }
    return slug;
  }

  async call(session: string, project: string, input: SpecWorkflowInput, hooks: SpecHooks, signal?: AbortSignal) {
    signal?.throwIfAborted();
    const files = new ProjectFiles(project);

    if (input.operation === 'list') {
      const specsRoot = path.join(project, 'specs');
      const exists = await lstat(specsRoot).then(s => s.isDirectory() && !s.isSymbolicLink(), () => false);
      if (!exists) return { status: 'ok', specs: [] };
      const entries = await readdir(specsRoot, { withFileTypes: true });
      const specs = [];
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.isSymbolicLink() || !SLUG.test(entry.name)) continue;
        const specText = await files.read(`specs/${entry.name}/spec.md`).catch(() => '');
        const tasksText = await files.read(`specs/${entry.name}/tasks.md`).catch(() => '');
        const reqs = parseRequirements(specText);
        const tasks = parseTasks(tasksText);
        const done = tasks.filter(t => t.done).length;
        specs.push({
          feature: entry.name,
          requirements: reqs.length,
          tasksTotal: tasks.length,
          tasksDone: done,
          progressPercent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
        });
      }
      return { status: 'ok', specs };
    }

    const slug = this.validateSlug(input.feature);
    const base = `specs/${slug}`;

    if (input.operation === 'init') {
      const title = (input.title ?? slug).trim().slice(0, 120);
      const goal = (input.goal ?? '').trim().slice(0, 2000);
      const targets: Array<[string, string]> = [
        [`${base}/spec.md`, defaultSpec(title, goal)],
        [`${base}/plan.md`, defaultPlan(title)],
        [`${base}/tasks.md`, defaultTasks(title)],
      ];
      const proposals: Proposal[] = [];
      for (const [rel, content] of targets) {
        const exists = await files.read(rel).then(() => true, () => false);
        if (exists) continue;
        const proposal = await files.propose(randomUUID(), rel, content);
        await hooks.validateEdit?.(session, project, proposal, signal);
        proposals.push(proposal);
      }
      if (!proposals.length) {
        return { status: 'exists', feature: slug, directory: base, message: '이미 spec.md, plan.md, tasks.md가 모두 존재합니다.' };
      }
      const ok = await hooks.approve(
        `명세 주도 개발(Spec) 초기화: ${base}`,
        `프로젝트: ${project}\n생성 파일:\n${proposals.map(p => `- ${p.path}`).join('\n')}`,
        signal,
      );
      if (!ok) throw new Error('Spec 초기화를 취소했습니다.');
      signal?.throwIfAborted();
      await files.applyBatch(proposals, {
        signal,
        validate: proposal => hooks.validateEdit?.(session, project, proposal, signal) ?? Promise.resolve(),
        snapshot: proposal => atomicJSON(path.join(this.root, 'snapshots', session, proposal.id + '.json'), proposal),
        journal: { dir: path.join(this.root, 'batch-journals'), operation: 'spec_workflow_init', session },
      });
      return { status: 'created', feature: slug, directory: base, createdFiles: proposals.map(p => p.path) };
    }

    const specText = await files.read(`${base}/spec.md`).catch(() => '');
    const planText = await files.read(`${base}/plan.md`).catch(() => '');
    const tasksText = await files.read(`${base}/tasks.md`).catch(() => '');
    if (!specText && !planText && !tasksText) {
      throw new Error(`명세 폴더를 찾지 못했습니다: ${base} (먼저 spec_workflow(operation: "init")로 초기화하세요.)`);
    }
    const requirements = parseRequirements(specText);
    const tasks = parseTasks(tasksText);
    const done = tasks.filter(t => t.done).length;

    if (input.operation === 'status') {
      return {
        status: 'ok',
        feature: slug,
        filesPresent: { spec: !!specText, plan: !!planText, tasks: !!tasksText },
        requirements,
        tasks,
        tasksDone: done,
        tasksTotal: tasks.length,
        progressPercent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
      };
    }

    // operation === 'verify'
    const issues: string[] = [];
    if (!specText) issues.push('spec.md가 없습니다.');
    if (!planText) issues.push('plan.md가 없습니다.');
    if (!tasksText) issues.push('tasks.md가 없습니다.');
    if (!requirements.length) issues.push('spec.md에 REQ-01 형식의 요구사항 ID가 없습니다.');
    if (!tasks.length) issues.push('tasks.md에 체크리스트 항목(- [ ] / - [x])이 없습니다.');

    const coveredReqs = new Set(tasks.flatMap(t => t.reqRefs));
    const uncoveredRequirements = requirements.map(r => r.id).filter(id => !coveredReqs.has(id));
    if (uncoveredRequirements.length) {
      issues.push(`tasks.md에 연결되지 않은 요구사항: ${uncoveredRequirements.join(', ')}`);
    }
    const pendingTasks = tasks.filter(t => !t.done);
    if (pendingTasks.length) {
      issues.push(`미완료 태스크 ${pendingTasks.length}건: ${pendingTasks.map(t => t.id ?? t.text.slice(0, 40)).join(', ')}`);
    }
    const projectFileSet = new Set(await files.list());
    const missingReferencedFiles: string[] = [];
    for (const ref of new Set(tasks.flatMap(t => t.fileRefs))) {
      if (!projectFileSet.has(ref)) missingReferencedFiles.push(ref);
    }
    if (missingReferencedFiles.length) {
      issues.push(`태스크에 명시되었지만 프로젝트에 없는 파일: ${missingReferencedFiles.join(', ')}`);
    }
    return {
      status: issues.length ? 'incomplete' : 'verified',
      feature: slug,
      requirementsCount: requirements.length,
      tasksTotal: tasks.length,
      tasksDone: done,
      uncoveredRequirements,
      pendingTasksCount: pendingTasks.length,
      missingReferencedFiles,
      issues,
    };
  }
}

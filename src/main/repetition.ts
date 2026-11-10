const normalize = (text: string) => text.replace(/[\s\p{P}\p{S}]/gu, "");
export function withoutCode(text: string): string {
  const output: string[] = [];
  let fence: { char: string; size: number } | undefined;
  for (const line of text.split("\n")) {
    const marker = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (marker) {
      if (!fence) fence = { char: marker[0], size: marker.length };
      else if (fence.char === marker[0] && marker.length >= fence.size)
        fence = undefined;
      output.push("");
      continue;
    }
    if (fence || /^(?: {4}|\t)/.test(line)) {
      output.push("");
      continue;
    }
    output.push(line.replace(/`+[^`]*`+/g, ""));
  }
  return output.join("\n");
}
export function detectRepetition(assistantText: string): string | undefined {
  const plain = withoutCode(assistantText);
  const sentences = plain
    .split(/[.!?。！？\n]+/)
    .map(normalize)
    .filter(Boolean)
    .slice(-20);
  const counts = new Map<string, number>();
  for (const s of sentences) {
    if ([...s].length < 12) continue;
    const count = (counts.get(s) ?? 0) + 1;
    counts.set(s, count);
    if (count >= 4) return "최근 20문장 중 같은 문장이 4회 반복되었습니다.";
  }
  const compact = [...normalize(plain)].slice(-6000).join("");
  for (let size = 6; size <= 160; size++) {
    for (let end = compact.length; end >= size * 5; end--) {
      const phrase = compact.slice(end - size, end);
      if (compact.slice(end - size * 5, end) === phrase.repeat(5))
        return "같은 구절이 5회 연속 반복되었습니다.";
    }
  }
  return undefined;
}

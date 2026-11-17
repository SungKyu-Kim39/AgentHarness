---
name: egm-resolve
description: "설계 리뷰 지적 사항을 사용자와 검토하고 합의한 문서 수정을 반영합니다."
---

# EGM — Ned

Ned EGM adapter. Read canonical instructions and all requested reviewer/standard documents through read_skill id=egm-review-loop document=references/bundle/<canonical path>. Resolve upstream skills/, agents/, resources/, docs/ against that shared document root, not project files. Use Ned read_file/list_files/propose_edit for approved project documents. Use spawn_subagent role=goldfish reviewer=<persona stem> for every independent Goldfish review; never reuse a reviewer or pass parent conversation, private memory, or unsolicited earlier reports. Respect required stage inputs, user decisions and report completion. Missing reads/results mean incomplete review. At most two child agents execute; additional reviewers queue. Use subagent_status only for completion evidence when needed; results arrive automatically. No upstream task/CLI/plugin installer, network or extra MCP may run. Production code is outside the design workflow. Follow the user's explicit implementation instruction after leaving that workflow. For bootstrap document workers, use research children and let the parent write approved documentation. Preserve approval checkpoints. This bundle does not change the default agent or automatically review ordinary requests.

First read the complete canonical workflow: read_skill id=egm-review-loop document=references/bundle/skills/egm-resolve/SKILL.md. Use offset to read long documents completely.

export type StartupPhase = 'launch' | 'migration' | 'configuration' | 'engine' | 'editor';
export const startupLabels: Record<StartupPhase,string> = {
  launch: '실행 중', migration: '기존 설정과 작업 기록을 확인하고 있습니다.',
  configuration: '설정과 지식 서비스를 준비하고 있습니다.', engine: 'AI 작업 엔진을 준비하고 있습니다.', editor: '편집기를 열고 있습니다.',
};
export function startupDocument(icon: string) {
  // Only a locally read PNG data URL is accepted; no renderer file/network access.
  const safeIcon = /^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(icon) ? icon : '';
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'"><title>Ned · 실행 중</title><style>
  *{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}body{font-family:Segoe UI,Malgun Gothic,sans-serif;background:#111;color:#f8f8f8;display:flex;align-items:center;justify-content:center;text-align:center;-webkit-user-select:none}main{width:100%;padding:26px 32px}img{width:112px;height:112px;object-fit:contain}h1{font-size:19px;line-height:28px;margin:10px 0 7px;font-weight:600}p{font-size:12px;line-height:20px;color:#b6b6b6;margin:0;min-height:20px}.track{width:200px;height:3px;background:#333;overflow:hidden;margin:23px auto 0;border-radius:3px}.pulse{width:70px;height:100%;background:#fff;animation:progress 1.6s ease-in-out infinite}@keyframes progress{from{transform:translateX(-70px)}to{transform:translateX(200px)}}@media(prefers-reduced-motion:reduce){.pulse{animation:none;width:100%;background:#aaa}}
  </style></head><body><main>${safeIcon ? `<img src="${safeIcon}" alt="Ned">` : '<div style="font-size:64px;font-weight:800;letter-spacing:-4px">Ned</div>'}<h1>Ned 실행 중</h1><p id="stage" role="status" aria-live="polite">잠시만 기다려 주세요.</p><div class="track" aria-hidden="true"><div class="pulse"></div></div></main></body></html>`;
}

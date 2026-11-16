import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {Button} from '@astryxdesign/core/Button';
import '@astryxdesign/core/reset.css';
import '@astryxdesign/core/astryx.css';
import '@astryxdesign/theme-neutral/theme.css';
function App() {
  const [count, setCount] = useState(0);
  return <Theme theme={neutralTheme}><main style={{padding:32}}>
    <h1>Astryx로 시작하는 사내 UI</h1>
    <p>React 19와 Astryx의 실제 컴포넌트를 사용합니다. 외부 폰트·CDN·API를 호출하지 않습니다.</p>
    <Button onClick={()=>setCount(count+1)}>버튼을 누른 횟수: {count}</Button>
  </main></Theme>;
}
createRoot(document.getElementById('root')!).render(<App/>);

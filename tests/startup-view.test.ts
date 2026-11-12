import {test} from 'node:test';
import assert from 'node:assert/strict';
import {startupDocument,startupLabels} from '../distribution/ned/startup-view';
test('startup screen is local-only, branded, accessible and rejects arbitrary image URLs',()=>{
 const html=startupDocument('https://external.invalid/private.png');assert.ok(!html.includes('external.invalid'));assert.match(html,/Ned 실행 중/);assert.match(html,/role="status"/);assert.match(html,/prefers-reduced-motion/);assert.match(html,/script-src 'none'/);assert.ok(!/<script|<iframe/i.test(html));
 assert.ok(startupDocument('data:image/png;base64,YQ==').includes('src="data:image/png;base64,YQ=="'));
 assert.ok(startupLabels.engine.includes('AI'));
});

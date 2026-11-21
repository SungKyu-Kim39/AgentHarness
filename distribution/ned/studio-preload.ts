import { initializeStudioStorage } from './studio-policy';

// This isolated preload can write same-origin storage before the Studio modules run.
const option = '--ned-studio-origin=';
const origin = process.argv.find(arg => arg.startsWith(option))?.slice(option.length);
if (origin && location.origin === origin && location.pathname.startsWith('/studio/')) {
  initializeStudioStorage(origin, localStorage, sessionStorage);
}

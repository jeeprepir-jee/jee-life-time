const fs = require('node:fs');
const path = require('node:path');

const here = __dirname;
const output = path.join(here, 'dist');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.copyFileSync(path.join(here, 'app.html'), path.join(output, 'index.html'));
fs.writeFileSync(path.join(output, 'manifest.json'), JSON.stringify({
  name: 'Orbit — Personal Command Center',
  short_name: 'Orbit',
  description: 'Your personal planner, tasks, notes and learning inbox',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: '#0b1020',
  theme_color: '#101827',
  icons: [
    { src: './icon.svg', sizes: '192x192', type: 'image/svg+xml', purpose: 'any' },
    { src: './icon.svg', sizes: '512x512', type: 'image/svg+xml', purpose: 'any maskable' }
  ]
}, null, 2));
fs.writeFileSync(path.join(output, 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="112" fill="#101827"/><circle cx="256" cy="256" r="148" fill="none" stroke="#a7f3d0" stroke-width="36"/><circle cx="256" cy="256" r="66" fill="#93c5fd"/><circle cx="256" cy="256" r="22" fill="#101827"/></svg>');
fs.writeFileSync(path.join(output, 'sw.js'), `const CACHE='orbit-shell-v2';
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(['./','./manifest.json','./icon.svg']))));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key))))));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&new URL(event.request.url).origin===self.location.origin){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match('./'))));});
`);
if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Orbit build did not produce dist/index.html');
console.log('Orbit built from readable app.html into dist/.');

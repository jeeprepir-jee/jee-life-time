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
fs.writeFileSync(path.join(output, 'sw.js'), `const CACHE='orbit-shell-v3';
const SHELL=['./','./manifest.json','./icon.svg'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('orbit-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 const req=event.request;
 if(req.method!=='GET')return;
 const url=new URL(req.url);
 if(url.origin!==self.location.origin)return;
 if(req.mode==='navigate'){
  event.respondWith((async()=>{
   try{const response=await fetch(req);if(response.ok){const cache=await caches.open(CACHE);await cache.put('./',response.clone());}return response;}
   catch{return (await caches.match('./'))||Response.error();}
  })());
  return;
 }
 if(url.pathname.endsWith('/manifest.json')||url.pathname.endsWith('/icon.svg'))event.respondWith(caches.match(req).then(cached=>cached||fetch(req)));
});
`);
if (!fs.existsSync(path.join(output, 'index.html'))) throw new Error('Orbit build did not produce dist/index.html');
console.log('Orbit built from readable app.html into dist/.');

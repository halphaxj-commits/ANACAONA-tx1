const CACHE='scout-hub-v301';
const CORE=['./','./index.html'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET') return;
  const url=new URL(e.request.url);
  const isAppAsset=url.pathname.endsWith('.html')||url.pathname.endsWith('.js')||url.pathname.endsWith('.css');
  if(isAppAsset){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(x=>x||fetch(e.request).then(r=>{const c=r.clone();caches.open(CACHE).then(cache=>cache.put(e.request,c));return r}).catch(()=>caches.match('./index.html'))));
});

self.addEventListener('push',e=>{let d={title:'SCOUT HUB',body:'Nouvo notification'};try{d={...d,...(e.data?e.data.json():{})}}catch{};e.waitUntil(self.registration.showNotification(d.title,{body:d.body,tag:d.tag||'scout',icon:'./manifest.json',badge:'./manifest.json',renotify:true}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.matchAll({type:'window',includeUncontrolled:true}).then(cs=>{for(const c of cs){if('focus' in c)return c.focus()}return clients.openWindow('./')}))});

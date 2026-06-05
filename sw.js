/* HMG Academy Virtual Lab v7 — Service Worker
   Stale-while-revalidate for fast loads + always fresh content. */
var C='hmg-lab-v7';
var CORE=['./','./index.html','./manifest.json',
  './assets/css/style.css','./assets/js/lab-core.js','./assets/js/lab-equipment.js','./assets/js/main.js',
  './assets/images/hmg-academy-logo.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(CORE).catch(function(){})}));self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C}).map(function(k){return caches.delete(k);}));}));self.clients.claim();});
self.addEventListener('fetch',function(e){
  if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
  e.respondWith(
    caches.match(e.request).then(function(cached){
      var network=fetch(e.request).then(function(resp){
        if(resp&&resp.status===200){var clone=resp.clone();caches.open(C).then(function(ca){ca.put(e.request,clone).catch(function(){});});}
        return resp;
      }).catch(function(){return cached||new Response('Offline',{status:503,headers:{'Content-Type':'text/plain'}});});
      return cached||network;
    })
  );
});

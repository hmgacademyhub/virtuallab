var C='hmg-lab-v5';var A=['/','/index.html','/assets/css/style.css','/assets/js/lab-core.js'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(C).then(function(c){return c.addAll(A).catch(function(){})}));self.skipWaiting();});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==C}).map(function(k){return caches.delete(k)}))}));self.clients.claim();});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET'||!e.request.url.startsWith(self.location.origin))return;
e.respondWith(fetch(e.request).then(function(r){var c=r.clone();caches.open(C).then(function(ca){ca.put(e.request,c).catch(function(){})});return r;}).catch(function(){return caches.match(e.request).then(function(r){return r||new Response('Offline',{status:503})})}));});

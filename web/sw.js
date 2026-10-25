/* Service worker do Missão EEAR: guarda o app no aparelho para funcionar sem internet.
   A versão e a lista de arquivos são preenchidas por web/build.py a cada publicação. */
const VERSAO = '__VERSAO__', VERSAO_IMG = '__VERSAO_IMG__';
const CACHE = 'eear-' + VERSAO, CACHE_IMG = 'eear-img-' + VERSAO_IMG;
const ARQUIVOS = [/*__ARQUIVOS__*/];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('eear-') && k !== CACHE && k !== CACHE_IMG).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', ev => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (req.mode === 'navigate') {
    // a página abre do aparelho; sem cópia guardada, vem da rede
    ev.respondWith(caches.match('./', { cacheName: CACHE }).then(r => r || fetch(req)));
    return;
  }
  if (url.pathname.includes('/provas/')) {
    // imagens das provas: guardadas na primeira vez que a questão é aberta
    ev.respondWith(caches.open(CACHE_IMG).then(c => c.match(req).then(r => r || fetch(req).then(resp => {
      if (resp.ok) c.put(req, resp.clone());
      return resp;
    }))));
    return;
  }
  ev.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});

/* Identifica a liderança pela API pública de Web Locks, sem depender do texto transitório da interface. */
module.exports = (p, uid) => p.evaluate(async uid => {
  if (!navigator.locks || !navigator.locks.query) throw new Error('Sonda de liderança exige Web Locks.');
  const nome = 'auditoria-pagina-' + Math.random(), pronto = {};
  pronto.p = new Promise(r => { pronto.ok = r; });
  let soltar;
  const vida = navigator.locks.request(nome, () => new Promise(r => { soltar = r; pronto.ok(); }));
  await pronto.p; const q = await navigator.locks.query(), propria = q.held.find(x => x.name === nome), nuvem = q.held.find(x => x.name === 'eear-nuvem@firebase:' + uid);
  soltar(); await vida;
  return !!(propria && nuvem && propria.clientId && propria.clientId === nuvem.clientId);
}, uid);

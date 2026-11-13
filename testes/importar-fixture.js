/* Modifica o progresso pelo fluxo real de importação, respeitando a carga assíncrona da identidade. */
module.exports = async function importar(p, estado) {
  await p.waitForFunction(() => document.documentElement.dataset.armazenamento !== 'carregando');
  await p.evaluate(() => { const e = document.createElement('button'); e.dataset.a = 'tab'; e.dataset.v = 'plano'; document.body.appendChild(e); e.click(); e.remove(); });
  const clicar = a => p.evaluate(a => { const e = document.createElement('button'); e.dataset.a = a; document.body.appendChild(e); e.click(); e.remove(); }, a);
  await clicar('impabrir'); await p.fill('#imp-txt', JSON.stringify(estado)); await clicar('impok');
  await p.waitForFunction(() => !/Aguardando confirmação/.test((document.getElementById('sync') || {}).textContent || ''));
};

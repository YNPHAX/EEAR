/* Somente ações públicas e conteúdo do curso, sem invocar funções internas. */
async function responder(p, errar) {
  return p.evaluate(errar => {
    const texto = html => { const e = document.createElement('div'); e.innerHTML = html; return e.textContent.replace(/\s+/g, ' ').trim(); };
    const enun = document.querySelector('.q-enun').textContent.replace(/\s+/g, ' ').trim(), m = window.EEAR.modulos.find(m => m.id === 'POR01');
    const i = m.q.findIndex(q => texto(q[0]) === enun); if (i < 0) throw new Error('Questão não localizada pelo conteúdo público.');
    const q = m.q[i], certo = texto(q[1][q[2]]), b = [...document.querySelectorAll('[data-a="qresp"]')].find(b => (texto(b.querySelector('span:last-child').innerHTML) === certo) !== errar);
    if (!b) throw new Error('Alternativa não localizada.'); b.click(); return { id: 'POR01-' + i, errado: errar };
  }, errar);
}
async function plano(p) {
  await p.waitForFunction(() => document.documentElement.dataset.armazenamento !== 'carregando');
  await p.evaluate(() => { const b = document.createElement('button'); b.dataset.a = 'tab'; b.dataset.v = 'plano'; document.body.appendChild(b); b.click(); b.remove(); });
}
// O indicador existe na tela Plano. Navegar é preparação da observação; não espera nem força commits.
async function local(p) { await plano(p); await p.waitForFunction(() => document.querySelector('#sync')?.dataset.local === 'confirmado'); }
async function remoto(p) { await plano(p); await p.waitForFunction(() => document.querySelector('#sync')?.dataset.local === 'confirmado' && document.querySelector('#sync')?.dataset.nuvem === 'confirmado'); }
async function cairPagina(p, contexto, f) { const d = await contexto.newCDPSession(p), caiu = p.waitForEvent('crash'); d.send('Page.crash').catch(() => null); await caiu; await p.close(); const nova = await f.pagina(contexto); await local(nova); return nova; }
module.exports = { responder, local, remoto, cairPagina };

/* Várias abas da mesma conta no mesmo aparelho (F01 de auditoria/firebase-codex.md; curso/app/14-abas.js). As abas são
   páginas do mesmo contexto do navegador: dividem o localStorage e recebem o evento storage uma da outra. Uma aba
   "surda" ignora esse evento (como uma aba suspensa ou congelada), para provar que a gravação também une sozinha.
   Confere: nenhuma marcação some quando uma aba fecha; contagens não se perdem nem dobram; desmarcações e "Zerar" não
   voltam; certificados ficam; leitura atrasada (duas gravações quase juntas) se corrige; o que outra aba apagou não
   volta. Sem nuvem (o defeito é do armazenamento local); a reconexão com a nuvem fica na sonda de
   testes/firebase-auditoria.js. Usado por testes/plataforma.test.js. */
module.exports = async function testarAbas({ b, srv, base, ok }) {
  console.log('\n== várias abas da mesma conta neste aparelho');
  const K = 'missao-eear-v1', espera = ms => new Promise(r => setTimeout(r, ms));
  const D = new Date(), hj = D.getFullYear() + '-' + String(D.getMonth() + 1).padStart(2, '0') + '-' + String(D.getDate()).padStart(2, '0');
  const cert = { s: 'fis', mod: null, ids: ['FIS01'], h: 3, d: '2026-10-17', c: 'ABAS-CERT', o: 'curso', t: 1792195200000 };
  const semente = () => Object.assign(base({ certs: [cert] }), { t: Date.now() - 60000, feito: { 'T:base': true, 'T:apagar': true }, act: { [hj]: 2 } });
  const tem = (s, k) => !!(s && s.feito && s.feito[k]);
  async function aparelho() {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: 390, height: 844 } }), erros = [];
    const aba = async surda => {
      const p = await ctx.newPage(); p.on('pageerror', e => erros.push(e.message));
      if (surda) await p.addInitScript(() => window.addEventListener('storage', e => e.stopImmediatePropagation(), true));
      await p.goto(srv.url); await p.waitForTimeout(300);
      const clicar = (a, d) => p.evaluate(([a, d]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, d || {}); document.body.appendChild(x); x.click(); x.remove(); }, [a, d]);
      return { p, clicar, marcar: k => clicar('marcar', { k }) };
    };
    await ctx.addInitScript(([k, s]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, JSON.stringify(s)); }, [K, semente()]);
    const A = await aba(false);
    const ler = () => A.p.evaluate(k => JSON.parse(localStorage.getItem(k)), K).catch(() => null);
    /* A consolidação entre abas é assíncrona (vez da trava local): espera até 3 s a cópia ter a marcação k da outra aba e
       só então confere tudo (as asserções não mudam; com a máquina ocupada, 150 ms podiam não bastar). */
    const lerCom = async (k, p) => { const fim = Date.now() + 3000; let s; do { s = p ? await p.evaluate(c => JSON.parse(localStorage.getItem(c)), K).catch(() => null) : await ler(); if (tem(s, k)) break; await espera(100); } while (Date.now() < fim); return s; };
    return { ctx, erros, aba, A, ler, lerCom };
  }

  { // 1. a reprodução de F01, sem nuvem: duas abas estudam, a primeira fecha, a segunda continua
    const X = await aparelho(), B = await X.aba(false);
    await X.A.marcar('T:a1'); await espera(150); await B.marcar('T:b1'); await espera(150);
    await X.A.p.close(); await B.marcar('T:b2'); await espera(150);
    const s = await X.lerCom('T:b2', B.p);
    ok(['T:base', 'T:apagar', 'T:a1', 'T:b1', 'T:b2'].every(k => tem(s, k)) && s.act[hj] === 5 && !X.erros.length,
      `duas abas da mesma conta: a marcação da aba que fechou continua no aparelho e as contagens somam sem perder nem dobrar [feito: ${Object.keys(s.feito)} | atividade: ${s.act[hj]} (esperado 5)]`);
    await X.ctx.close();
  }
  { // 2. desmarcação numa aba e estudo na outra (que recebe o aviso e que não recebe): a desmarcação não volta
    for (const surda of [false, true]) {
      const X = await aparelho(), B = await X.aba(surda);
      await X.A.marcar('T:apagar'); await espera(150); // desmarca
      await B.marcar('T:b3'); await espera(150);
      const s = await X.lerCom('T:b3');
      ok(!tem(s, 'T:apagar') && tem(s, 'T:b3') && tem(s, 'T:base') && !X.erros.length, `desmarcar numa aba e estudar na outra${surda ? ' (aba suspensa, sem o aviso)' : ''}: a desmarcação não volta e o estudo fica`);
      await X.ctx.close();
    }
  }
  { // 3. "Zerar progresso" numa aba enquanto a outra (suspensa) estudava: o zerado fica, e o que a outra fez depois também
    const X = await aparelho(), B = await X.aba(true);
    await B.marcar('T:b-antes'); await espera(150);
    await X.A.p.reload(); await X.A.p.waitForTimeout(300); // A conhece o estudo de B antes de zerar
    await X.A.clicar('zerar'); await X.A.clicar('zerarok'); await espera(150);
    await B.marcar('T:b-depois'); await espera(150);
    const s = await X.lerCom('T:b-depois');
    ok(!tem(s, 'T:base') && !tem(s, 'T:b-antes') && tem(s, 'T:b-depois') && !(s.cfg.certs || []).length && s.cfg.certsZ > 0 && !X.erros.length,
      `"Zerar" numa aba: o que existia antes não volta pela outra aba (nem os certificados), e o que ela estudou depois fica [feito: ${Object.keys(s.feito)}]`);
    await X.ctx.close();
  }
  { // 4. certificados: as gravações das duas abas mantêm o certificado e o código
    const X = await aparelho(), B = await X.aba(true);
    await X.A.marcar('T:c1'); await espera(150); await B.marcar('T:c2'); await espera(150);
    const s = await X.lerCom('T:c2');
    ok((s.cfg.certs || []).length === 1 && JSON.stringify(s.cfg.certs[0]) === JSON.stringify(cert) && tem(s, 'T:c1') && tem(s, 'T:c2'), 'certificados: gravações de duas abas mantêm o mesmo registro, data e código');
    await X.ctx.close();
  }
  { // 5. leitura atrasada: a aba B lê a chave antiga e grava por cima da gravação de A; A percebe e une de volta
    const X = await aparelho(), B = await X.aba(true);
    const antigo = await B.p.evaluate(k => localStorage.getItem(k), K);
    await B.p.evaluate(([k, v]) => { const g = window.Storage.prototype.getItem; let uma = true; window.Storage.prototype.getItem = function (c) { if (c === k && uma) { uma = false; return v; } return g.call(this, c); }; }, [K, antigo]);
    await X.A.marcar('T:a5'); await espera(150);
    await B.marcar('T:b5'); await espera(400); // B grava sem a marcação de A (leitura atrasada); A recebe o aviso e une
    const s = await X.ler();
    ok(tem(s, 'T:a5') && tem(s, 'T:b5') && tem(s, 'T:base') && !X.erros.length, `duas gravações quase juntas (uma aba leu a chave atrasada): a outra aba percebe e une de volta, sem perder nada [feito: ${Object.keys(s.feito)}]`);
    await X.ctx.close();
  }
  { // 7. contagens com as duas abas marcando ao mesmo tempo (F09): 2 iniciais + 20 + 20 = 42, sem perder nem dobrar
    const X = await aparelho(), B = await X.aba(false);
    for (let i = 0; i < 20; i++) await Promise.all([X.A.marcar('T:pa' + i), B.marcar('T:pb' + i)]);
    await espera(1200);
    const s = await X.ler(), sb = await B.p.evaluate(k => JSON.parse(localStorage.getItem(k)), K);
    const todas = Array.from({ length: 20 }, (_, i) => i).every(i => tem(s, 'T:pa' + i) && tem(s, 'T:pb' + i));
    ok(s.act[hj] === 42 && sb.act[hj] === 42 && todas && !X.erros.length, `contagens com as duas abas marcando ao mesmo tempo: 42 de 42, todas as marcações [${s.act[hj]}]`);
    await X.ctx.close();
  }
  { // 6. a cópia deste aparelho foi apagada em outra aba (Plano › Dados › Apagar os dados deste aparelho): não volta
    //    pela aba aberta. (Uma aba suspensa durante a exclusão, que acorda com os dados antigos, une sem base e pode
    //    regravar a cópia local; apagar só é permitido quando a nuvem já tem tudo: auditoria/firebase-homologacao.md.)
    const X = await aparelho(), B = await X.aba(false);
    await X.A.clicar('dadosapagar'); await X.A.clicar('dadosapagarok'); await espera(150);
    await B.marcar('T:depois-de-apagar'); await espera(150);
    const s = await X.ler();
    ok(s && tem(s, 'T:depois-de-apagar') && !tem(s, 'T:base') && !tem(s, 'T:apagar') && !X.erros.length, `cópia apagada em outra aba: a aba aberta não regrava o que foi apagado; só o estudo novo fica [feito: ${s ? Object.keys(s.feito) : 'nada'}${X.erros.length ? ' | erro: ' + X.erros[0] : ''}]`);
    await X.ctx.close();
  }
};

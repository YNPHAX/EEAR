/* Testes de interface dos flashcards em telas de celular (simulação no Chromium, não substitui aparelho real).
   O aluno toca nos botões pelas coordenadas da tela, sem rolagem automática: se um botão estiver fora da área
   útil ou coberto pela barra de abas, o toque erra e o teste falha. Usado por testes/plataforma.test.js. */

/* Mede a tela atual do flashcard, sem rolar. Área útil: abaixo do topo fixo e acima da barra de abas (quando fixa). */
function medirTela() {
  const top = document.querySelector('.top'), nav = document.querySelector('nav.tabs');
  const y0 = top ? top.getBoundingClientRect().bottom : 0, y1 = nav && getComputedStyle(nav).position === 'fixed' ? nav.getBoundingClientRect().top : innerHeight;
  const livre = el => { if (!el) return false; const r = el.getBoundingClientRect(); if (r.top < y0 - 1 || r.bottom > y1 + 1) return false; const p = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!p && (p === el || el.contains(p)); };
  const fc = document.querySelector('.fc'), verso = fc && fc.querySelector('.verso');
  const bt = [...document.querySelectorAll('[data-a="fcaval"],[data-a="fcvirar"]')], topoBotoes = Math.min(y1, ...bt.map(x => x.getBoundingClientRect().top));
  const tag = fc ? fc.querySelector('.tag').innerText.replace(/\s+/g, ' ').trim() : '';
  return {
    tag, mod: tag.split(' ').pop(), frente: fc ? fc.children[1].textContent : '', verso: verso ? verso.textContent : null, scrollY: Math.round(window.scrollY),
    contador: livre(document.querySelector('.num')), barra: livre(document.querySelector('.meter')), botoes: bt.length > 0 && bt.every(livre),
    alvos: bt.map(x => { const r = x.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; }),
    inicioVerso: verso ? verso.getBoundingClientRect().top >= y0 - 1 && verso.getBoundingClientRect().top + 24 <= topoBotoes : null,
    lateral: document.documentElement.scrollWidth > innerWidth + 1,
    corte: fc ? [fc, ...fc.querySelectorAll('*')].some(e => e.scrollWidth > e.clientWidth + 1) : false,
    fonte: fc ? Math.min(parseFloat(getComputedStyle(fc.children[1]).fontSize), verso ? parseFloat(getComputedStyle(verso).fontSize) : 99) : 0
  };
}

module.exports = async function testarCelular({ E, b, srv, base, ok }) {
  console.log('\n== flashcards no celular (simulação: toque pelas coordenadas, sem rolagem automática)');
  /* Texto esperado de cada cartão, a partir dos dados: módulo + frente → verso. */
  const texto = html => html.replace(/<br\s*\/?>/gi, '').replace(/<\/?[a-z][^>]*>/gi, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  const esperado = {};
  E.modulos.forEach(m => (m.fc || []).forEach(c => { esperado[m.id + '|' + texto(c[0])] = texto(c[1]); }));
  const ativos = mat => E.modulos.filter(m => (!mat || m.m === mat) && (m.fc || []).length && (!m.modalidades || m.modalidades.includes('normal')));
  const telas = [[320, 568, null], [360, 640, 'fis'], [390, 844, 'fis'], [1280, 800, 'fis']];
  for (const [w, h, mat] of telas) {
    const nome = `${w}×${h} (${mat ? 'Física' : 'todas as matérias'})`, mods = ativos(mat), total = mods.reduce((n, m) => n + m.fc.length, 0);
    const movel = w < 820, ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: w, height: h }, isMobile: movel, hasTouch: movel });
    const p = await ctx.newPage(), erros = []; p.on('pageerror', e => erros.push(e.message));
    const mod = {}; mods.forEach(m => { mod[m.id] = { lido: '2026-11-01' }; });
    const st = Object.assign(base({ modalidade: 'normal' }), { mod, fc: {}, erros: {}, sims: [] });
    await p.addInitScript(s => { if (!sessionStorage.getItem('fixture-celular')) { localStorage.setItem('missao-eear-v1', s); sessionStorage.setItem('fixture-celular', '1'); } }, JSON.stringify(st)); await p.goto(srv.url); await p.waitForTimeout(250);
    await p.click('[data-a="tab"][data-v="treino"]');
    await p.locator(mat ? `[data-a="fcini"][data-s="${mat}"]` : '[data-a="fcini"]:not([data-s])').click();
    await p.waitForSelector('[data-a="fcvirar"]');
    const tocar = async ([x, y]) => { if (movel) await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); };
    const falhas = { frente: [], verso: [], proximo: [], texto: [], tela: [] }, vistos = new Set();
    let n = 0, errou = false;
    while (await p.locator('[data-a="fcvirar"]').count() && n < total + 5) {
      n++;
      const f = await p.evaluate(medirTela);
      if (n > 1 && !(f.scrollY === 0 && f.contador && f.barra)) falhas.proximo.push(f.tag);
      if (!f.contador || !f.barra || !f.botoes) falhas.frente.push(f.tag);
      await tocar(f.alvos[0]); await p.waitForTimeout(30);
      if (!await p.locator('.fc .verso').count()) { falhas.frente.push(f.tag + ' (o toque não revelou a resposta)'); await p.evaluate(() => document.querySelector('[data-a="fcvirar"]').click()); }
      const v = await p.evaluate(medirTela);
      if (!v.botoes || !v.inicioVerso) falhas.verso.push(v.tag);
      if (v.lateral || v.corte || v.fonte < 16) falhas.tela.push(v.tag);
      const fimVisivel = await p.evaluate(() => { // rolando até o fim, a resposta inteira fica acima dos botões fixos
        const y = window.scrollY; window.scrollTo(0, document.documentElement.scrollHeight);
        const ok = document.querySelector('.fc .verso').getBoundingClientRect().bottom <= document.querySelector('[data-a="fcaval"]').getBoundingClientRect().top;
        window.scrollTo(0, y); return ok;
      });
      if (!fimVisivel) falhas.tela.push(v.tag + ' (fim da resposta atrás dos botões)');
      const chave = v.mod + '|' + v.frente;
      if (!(chave in esperado) || esperado[chave] !== v.verso) falhas.texto.push(chave.slice(0, 60)); else vistos.add(chave);
      const antes = await p.locator('.num').innerText();
      const k = errou ? 1 : 0; errou = true; // o primeiro cartão é marcado como erro (volta no fim da fila); os demais, acerto
      const avancou = () => p.waitForFunction(a => { const el = document.querySelector('.num'); return !document.querySelector('.fc .verso') && (!el || el.innerText !== a || !document.querySelector('[data-a="fcvirar"]')); }, antes, { timeout: 2000 }).then(() => true, () => false);
      await tocar(v.alvos[k]);
      if (!await avancou()) { falhas.verso.push(v.tag + ' (o toque não avaliou)'); await p.evaluate(k => document.querySelectorAll('[data-a="fcaval"]')[k].click(), k); await avancou(); }
    }
    const salvo = JSON.parse(await p.evaluate(() => localStorage.getItem('missao-eear-v1')));
    const fim = await p.locator('.h1').innerText(), resumo = await p.locator('.card p').first().innerText();
    ok(!falhas.frente.length && !falhas.proximo.length, `${nome}: em cada cartão o contador, a barra e "Mostrar resposta" aparecem sem rolar, e o próximo cartão começa no topo${falhas.frente.concat(falhas.proximo).length ? ' — ' + falhas.frente.concat(falhas.proximo).slice(0, 3).join('; ') : ''}`);
    ok(!falhas.verso.length, `${nome}: depois de revelar, o começo da resposta e os botões Errei/Acertei aparecem sem rolar${falhas.verso.length ? ` — ${falhas.verso.length} falhas: ${falhas.verso.slice(0, 3).join('; ')}` : ''}`);
    ok(!falhas.tela.length, `${nome}: sem rolagem lateral, sem texto cortado, com fonte de pelo menos 16 px e com o fim da resposta visível ao rolar${falhas.tela.length ? ' — ' + falhas.tela.slice(0, 3).join('; ') : ''}`);
    ok(!falhas.texto.length && vistos.size === total && n === total + 1, `${nome}: os ${total} cartões aparecem com frente e verso completos, iguais aos dados (${vistos.size} conferidos, ${n} telas com o repetido)${falhas.texto.length ? ' — ' + falhas.texto.slice(0, 2).join('; ') : ''}`);
    const ids = mods.flatMap(m => m.fc.map((_, i) => m.id + '~' + i));
    ok(fim === 'Revisão concluída' && /\b1\b erro/.test(resumo) && ids.every(id => Array.isArray(salvo.fc[id])) && !erros.length, `${nome}: a sessão termina com 1 erro, todos os cartões ficam gravados no progresso e não há erro de JavaScript`);
    await ctx.close();
  }

  console.log('\n== fonte ampliada (tamanho de fonte padrão do navegador, pelo Chromium)');
  const clicar = (p, a, attrs) => p.evaluate(([a, attrs]) => { const x = document.createElement('button'); x.dataset.a = a; Object.assign(x.dataset, attrs); document.body.appendChild(x); x.click(); x.remove(); }, [a, attrs]);
  const passos = [['hoje', 'tab', { v: 'hoje' }], ['plano', 'tab', { v: 'plano' }], ['materias', 'tab', { v: 'materias' }], ['aula', 'mod', { id: 'POR01' }], ['quiz', 'quizmod', { id: 'POR01' }],
    ['treino', 'tab', { v: 'treino' }], ['flashcards', 'fcmod', { id: 'POR01' }], ['simulados', 'tab', { v: 'simulados' }], ['certificado', 'cert', { s: 'por' }]];
  for (const [w, px] of [[320, 24], [320, 32], [360, 32]]) {
    const ctx = await b.newContext({ serviceWorkers: 'block', viewport: { width: w, height: 640 }, isMobile: true, hasTouch: true }), p = await ctx.newPage(), erros = [];
    p.on('pageerror', e => erros.push(e.message));
    const cdp = await ctx.newCDPSession(p); await cdp.send('Page.enable'); await cdp.send('Page.setFontSizes', { fontSizes: { standard: px } });
    const st = Object.assign(base({ modalidade: 'normal' }), { sims: [{ d: '2026-10-03', tipo: 'completo', r: { por: [18, 24], ing: [15, 24], mat: [12, 24], fis: [10, 24] }, min: 200 }] });
    await p.addInitScript(s => { if (!sessionStorage.getItem('fixture-celular')) { localStorage.setItem('missao-eear-v1', s); sessionStorage.setItem('fixture-celular', '1'); } }, JSON.stringify(st)); await p.goto(srv.url); await p.waitForTimeout(200);
    const rolam = [];
    for (const [nome, a, attrs] of passos) {
      await clicar(p, a, attrs); await p.waitForTimeout(80);
      if (await p.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)) rolam.push(nome);
      if (nome === 'quiz') await clicar(p, 'sairquiz', {});
    }
    const corpo = await p.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
    ok(!rolam.length && corpo === px && !erros.length, `fonte do navegador em ${px} px (${Math.round(px / 16 * 100)}%), ${w} px: o texto acompanha a fonte escolhida e nenhuma das ${passos.length} telas rola para o lado${rolam.length ? ' — rolam: ' + rolam.join(', ') : ''}${corpo !== px ? ` — texto em ${corpo} px` : ''}`);
    await ctx.close();
  }
};

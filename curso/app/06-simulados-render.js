  /* ---------- simulados ---------- */
  function iniciarSim(tipo, s) {
    let ids = [], lim = 0;
    if (tipo === 'completo') { ORD.forEach(x => { ids = ids.concat(shuffle(amostraPeso(QS[x], 24))); }); lim = Number(S.cfg.tempoSim) || 260; }
    else if (tipo === 'materia') { ids = shuffle(amostraPeso(QS[s], 24)); lim = 60; }
    else if (tipo === 'prova') { const p = PROVA[s]; if (!p) return; ids = p.ids.slice(); lim = p.min || 240; }
    else if (tipo === 'oficial') { ORD.forEach(x => { ids = ids.concat(shuffle(QO[x].slice()).slice(0, 24)); }); lim = Number(S.cfg.tempoSim) || 260; }
    else { ORD.forEach(x => { ids = ids.concat(amostraDiag(x, 10)); }); lim = 0; }
    S.ativo = { tipo, materia: tipo === 'materia' ? s : null, prova: tipo === 'prova' ? s : null, ids, perms: permutar(ids), resp: {}, marc: {}, ini: Date.now(), lim, i: 0 };
    salvar();
    mapa = false;
    go('sim');
  }
  function restante() { const a = S.ativo; return a && a.lim ? Math.max(0, a.lim * 60 - Math.floor((Date.now() - a.ini) / 1000)) : null; }
  function ftempo(s) { const H = Math.floor(s / 3600), M = Math.floor((s % 3600) / 60), Se = s % 60; return (H ? H + ':' + pad(M) : M) + ':' + pad(Se); }
  function nomeSim(x, curto) {
    if (x.tipo === 'diag') return curto ? 'diagnóstico' : 'Diagnóstico';
    if (x.tipo === 'completo') return curto ? 'completo' : 'Simulado completo';
    if (x.tipo === 'prova') return (PROVA[x.prova] && PROVA[x.prova].nome) || 'Prova oficial';
    if (x.tipo === 'oficial') return curto ? 'oficial misto' : 'Simulado com questões oficiais';
    const mt = MATS[x.mat || x.materia], nm = mt ? mt.curto : 'matéria';  // histórico colado de outra versão pode trazer matéria desconhecida
    return curto ? nm : 'Simulado de ' + nm;
  }
  function vSim() {
    const a = S.ativo;
    if (!a) return vSimulados();
    const id = a.ids[a.i], q = Q[id], r = a.resp[id];
    const nResp = Object.keys(a.resp).length, rem = restante();
    const nome = nomeSim(a);
    let h = `<div class="simbar">${rem != null ? `<span class="timer num ${rem < 600 ? 'low' : ''}" id="timer">${ftempo(rem)}</span>` : '<span class="small muted">sem cronômetro</span>'}<span class="small muted num">${nResp}/${a.ids.length} respondidas</span><span style="flex:1"></span><button class="btn sm" data-a="simmapa">${mapa ? 'Fechar mapa' : 'Mapa'}</button><button class="btn sm pri" data-a="entregar">Entregar</button></div>`;
    if (pedindo === 'entregar') h += `<div class="confirm"><p>${nResp < a.ids.length ? `Faltam ${a.ids.length - nResp} questões. ` : ''}Entregar agora e ver a correção?</p><button class="btn sm" data-a="cancelar">Continuar respondendo</button><button class="btn sm pri" data-a="entregarok">Entregar</button></div>`;
    if (mapa) h += `<section class="card"><div class="qmap">${a.ids.map((x, k) => `<button data-a="simir" data-i="${k}" class="${a.resp[x] !== undefined ? 'ans' : ''} ${a.marc[x] ? 'mk' : ''} ${k === a.i ? 'cur' : ''}" aria-label="Questão ${k + 1}">${k + 1}</button>`).join('')}</div><span class="small muted">Contorno laranja embaixo = marcada para revisar.</span></section>`;
    h += `<div class="stack"><div class="eyebrow">${nome} · ${sig(q.m)} ${MATS[q.m].curto}</div><div class="row between"><b class="num">Questão ${a.i + 1} de ${a.ids.length}</b>${a.marc[id] ? '<span class="chip warn">marcada</span>' : ''}</div></div>`;
    h += `<section class="card"><div class="q-enun">${enun(q)}</div>${opcoes(q, a.perms[id], r, false, 'simresp')}</section>`;
    h += `<div class="row between"><button class="btn" data-a="simnav" data-d="-1" ${a.i === 0 ? 'disabled' : ''}>← Anterior</button><button class="btn sm" data-a="simmarc">${a.marc[id] ? 'Desmarcar' : 'Marcar para revisar'}</button><button class="btn ${r !== undefined ? 'pri' : ''}" data-a="simnav" data-d="1" ${a.i === a.ids.length - 1 ? 'disabled' : ''}>Próxima →</button></div>`;
    if (pedindo === 'descartar') h += `<div class="confirm"><p>Descartar este simulado? As respostas serão perdidas.</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="descartarok">Descartar</button></div>`;
    else h += `<div class="row"><button class="btn ghost" data-a="descartar">Descartar simulado</button></div>`;
    return h;
  }
  function entregar() {
    const a = S.ativo;
    if (!a) return;
    const r = {};
    a.ids.forEach(id => {
      const q = Q[id], pos = a.resp[id], ok = acertou(id, a.perms[id], pos);
      r[q.m] = r[q.m] || [0, 0];
      r[q.m][1]++;
      if (ok) r[q.m][0]++; else S.erros[id] = (S.erros[id] || 0) + 1;
    });
    const reg = { d: hoje(), tipo: a.tipo, mat: a.materia, prova: a.prova || null, r, min: Math.round((Date.now() - a.ini) / 60000) };
    reg.id = opId();
    S.sims.push(reg);
    if (a.tipo === 'diag') { S.diag = {}; ORD.forEach(s => { S.diag[s] = r[s] ? r[s][0] / r[s][1] : 0.5; }); }
    S.ult = { reg, ids: a.ids, perms: a.perms, resp: a.resp };
    S.ativo = null;
    marcarAtividade();
    salvar();
    go('res');
  }
  function vRes() {
    const u = S.ult;
    if (!u) return vSimulados();
    const reg = u.reg, ks = ORD.filter(s => reg.r[s]);
    const med = media(reg);
    const elimina = ks.some(s => reg.r[s][0] / reg.r[s][1] < 0.5) || med < 0.5;
    const nome = nomeSim(reg);
    let h = `<div class="stack"><div class="eyebrow">Debriefing · ${nome} · ${fdata(dnum(reg.d))}</div><h1 class="h1">${reg.tipo === 'diag' ? 'Seu ponto de partida' : (med >= META && !ks.some(s => reg.r[s][0] / reg.r[s][1] < META) ? 'Meta de 80% batida' : 'Resultado do simulado')}</h1></div>`;
    h += `<section class="card"><div class="row between"><div><div class="eyebrow">Média</div><span class="score num">${nota(med)}</span></div>${reg.tipo === 'completo' || reg.tipo === 'prova' || reg.tipo === 'oficial' ? `<span class="chip ${elimina ? 'bad' : (med >= META ? 'ok' : 'warn')}">${elimina ? 'Abaixo do mínimo do edital' : (med >= META ? 'Na meta do curso' : 'Acima do mínimo, abaixo da meta')}</span>` : ''}</div>
      <div class="tbl tbl-res" tabindex="0" role="region" aria-label="Notas por matéria"><table><thead><tr><th>Matéria</th><th class="num">Acertos</th><th class="num">Nota</th><th>Situação</th></tr></thead><tbody>${ks.map(s => { const x = reg.r[s][0] / reg.r[s][1]; return `<tr><td>${sig(s)} ${MATS[s].curto}</td><td class="num">${reg.r[s][0]}/${reg.r[s][1]}</td><td class="num">${nota(x)}</td><td>${x >= META ? '<span class="chip ok">meta</span>' : x >= 0.5 ? '<span class="chip warn">abaixo da meta</span>' : '<span class="chip bad">abaixo de 5</span>'}</td></tr>`; }).join('')}</tbody></table></div>
      <p class="small muted" style="margin:0">${reg.tipo === 'diag' ? 'O plano agora dá mais tempo às matérias com nota menor. ' : ''}Meta do curso: nota 8,0 em cada matéria. Mínimo do edital: 5,0 em cada matéria e média 5,0.${reg.min ? ' Tempo usado: ' + fh(reg.min / 60) + '.' : ''}</p></section>`;
    const porMod = {};
    u.ids.forEach(id => { if (Q[id].mod && MOD[Q[id].mod] && moduloAtivo(MOD[Q[id].mod]) && !acertou(id, u.perms[id], u.resp[id])) porMod[Q[id].mod] = (porMod[Q[id].mod] || 0) + 1; });
    const top = Object.keys(porMod).sort((a, b) => porMod[b] - porMod[a]).slice(0, 6);
    if (top.length) h += `<section class="card"><h2 class="h2">Onde você mais errou</h2><div class="mods">${top.map(id => `<button class="modrow" data-a="mod" data-id="${id}"><span class="sigla c-${MOD[id].m}">${id}</span><span class="mt">${MOD[id].t}</span><span class="chip bad">${plural(porMod[id], 'erro', 'erros')}</span></button>`).join('')}</div></section>`;
    h += `<section class="card"><h2 class="h2">Correção completa</h2>${u.ids.map((id, k) => {
      const q = Q[id], pos = u.resp[id], perm = u.perms[id], ok = acertou(id, perm, pos);
      return `<details class="rev"><summary>${q.src ? q.src.replace(/^.*· /, '') : k + 1}. ${sig(q.m)} ${q.anulada ? '<span class="chip">anulada</span>' : ok ? '<span class="chip ok">certa</span>' : pos === undefined ? '<span class="chip">em branco</span>' : '<span class="chip bad">errada</span>'} ${resumo(q.e)}</summary><div class="q-enun">${enun(q)}</div>${opcoes(q, perm, pos, true, '')}<div class="expl">${q.r}</div></details>`;
    }).join('')}</section>`;
    h += `<div class="row"><button class="btn pri" data-a="tab" data-v="treino">Ir para o caderno de erros</button><button class="btn" data-a="tab" data-v="simulados">Voltar aos simulados</button></div>`;
    return h;
  }
  function grafico() {
    const ss = S.sims.filter(x => x.tipo === 'completo' || x.tipo === 'prova' || x.tipo === 'oficial').slice(-12);
    if (ss.length < 1) return '';
    const W = 640, H = 220, L = 34, R = 12, T = 14, B = 30;
    const x = i => L + (ss.length === 1 ? (W - L - R) / 2 : i * (W - L - R) / (ss.length - 1));
    const y = v => T + (1 - v / 10) * (H - T - B);
    let g = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Médias dos simulados completos">`;
    [0, 5, 8, 10].forEach(v => { g += `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--line)" stroke-width="1" ${v === 5 || v === 8 ? 'stroke-dasharray="4 4"' : ''}/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="12" fill="var(--muted)" font-family="IBM Plex Mono, monospace">${v}</text>`; });
    g += `<text x="${W - R}" y="${y(8) - 6}" text-anchor="end" font-size="11" fill="var(--ok)">meta 8,0</text><text x="${W - R}" y="${y(5) - 6}" text-anchor="end" font-size="11" fill="var(--bad)">mínimo 5,0</text>`;
    const pts = ss.map((s, i) => [x(i), y(media(s) * 10)]);
    if (pts.length > 1) g += `<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--accent)" stroke-width="2.5" stroke-linejoin="round"/>`;
    pts.forEach((p, i) => { g += `<circle cx="${p[0]}" cy="${p[1]}" r="${i === pts.length - 1 ? 5 : 3.5}" fill="var(--accent)"/><text x="${p[0]}" y="${H - 10}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono, monospace">${fdata(dnum(ss[i].d))}</text>`; });
    return `<div class="chart">${g}</svg></div>`;
  }
  function vSimulados() {
    let h = `<div class="stack"><div class="eyebrow">Condições de prova</div><h1 class="h1">Simulados</h1></div>`;
    if (S.ativo) h += `<div class="banner acc"><p>Simulado em andamento: ${Object.keys(S.ativo.resp).length} de ${S.ativo.ids.length} respondidas.</p><button class="btn sm pri" data-a="go" data-v="sim">Continuar</button></div>`;
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Ponto de partida</div><h2 class="h2">Diagnóstico</h2><p class="small" style="margin:0">40 questões, 10 por matéria, sem cronômetro. Ajusta o peso de cada matéria no plano.</p><button class="btn ${S.diag ? '' : 'pri'}" data-a="simini" data-tipo="diag" ${S.ativo ? 'disabled' : ''}>${S.diag ? 'Refazer diagnóstico' : 'Começar'}</button></div>
      <div class="card"><div class="eyebrow">Como no dia da prova</div><h2 class="h2">Simulado completo</h2><p class="small" style="margin:0">96 questões, 24 por matéria, em ${fh((Number(S.cfg.tempoSim) || 260) / 60)}. Use folha de rascunho e nada de consulta.</p><button class="btn pri" data-a="simini" data-tipo="completo" ${S.ativo ? 'disabled' : ''}>Começar</button></div>
    </section>`;
    const okOf = ORD.every(x => QO[x].length >= 24);
    h += `<section class="card"><div class="eyebrow">100% fiel à prova</div><h2 class="h2">Provas anteriores oficiais</h2>${PROVAS.length
      ? `<p class="small" style="margin:0">Provas reais da EEAR, na ordem original e com o gabarito oficial. Faça como no dia: tempo de prova, rascunho e nada de consulta. Toque numa questão para ampliar.</p><div class="tasks">${PROVAS.map(p => { const feitas = S.sims.filter(x => x.prova === p.id); const ult = feitas[feitas.length - 1]; return `<div class="task"><span class="sigla">${(p.data || '').slice(0, 4)}</span><div class="tt"><b>${p.nome}</b><div class="small muted">${p.ids.length} questões · ${fh((p.min || 240) / 60)}${ult ? ' · última média ' + nota(media(ult)) : ''}</div></div><button class="btn sm pri" data-a="simini" data-tipo="prova" data-s="${p.id}" ${S.ativo ? 'disabled' : ''}>${ult ? 'Refazer' : 'Fazer'}</button></div>`; }).join('')}</div>
        <div class="row"><button class="btn" data-a="simini" data-tipo="oficial" ${S.ativo || !okOf ? 'disabled' : ''}>Simulado misto com questões oficiais (96)</button></div>`
      : `<p class="small" style="margin:0">As provas completas das quatro matérias entram aqui, na ordem original e com o gabarito oficial, assim que os PDFs da EEAR forem carregados. Até lá, use os simulados do curso abaixo.</p>`}</section>`;
    const reais = !apVisivel() ? [] : AP.sets.filter(x => x.tipo === 'test' && /prova/i.test(x.t));
    if (reais.length) h += `<section class="card"><div class="eyebrow">Provas reais da apostila</div><h2 class="h2">Inglês das provas da EEAR</h2><p class="small" style="margin:0">A parte de Inglês de ${plural(reais.length, 'prova real', 'provas reais')} da EEAR, com ${AP_PAG ? 'as páginas do livro' : 'a página do PDF da apostila'} e a folha de respostas corrigida pelo gabarito. Faça cada uma em 1 hora, como no dia.</p><div class="mods">${reais.map(x => apLinha(x)).join('')}</div></section>`;
    h += `<section class="card"><div class="eyebrow">Treino focado</div><h2 class="h2">Simulado por matéria</h2><p class="small" style="margin:0">24 questões em 1 hora.</p><div class="row">${ORD.map(s => `<button class="btn" data-a="simini" data-tipo="materia" data-s="${s}" ${S.ativo ? 'disabled' : ''}>${MATS[s].curto}</button>`).join('')}</div></section>`;
    const hist = S.sims.slice().reverse();
    h += `<section class="card"><div class="row between"><h2 class="h2">Histórico</h2>${S.ult ? '<button class="btn sm" data-a="go" data-v="res">Correção do último</button>' : ''}</div>${grafico()}`;
    h += hist.length ? `<div class="tbl tbl-res" tabindex="0" role="region" aria-label="Histórico de simulados"><table><thead><tr><th>Data</th><th>Tipo</th>${ORD.map(s => `<th class="num">${MATS[s].sigla}</th>`).join('')}<th class="num">Média</th></tr></thead><tbody>${hist.map(r => `<tr><td class="num">${fdata(dnum(r.d))}</td><td>${nomeSim(r, true)}</td>${ORD.map(s => `<td class="num">${r.r[s] ? nota(r.r[s][0] / r.r[s][1]) : '–'}</td>`).join('')}<td class="num"><b>${nota(media(r))}</b></td></tr>`).join('')}</tbody></table></div>` : '<p class="empty">Nenhum simulado feito ainda.</p>';
    h += `</section>`;
    return h;
  }

  /* ---------- render ---------- */
  function pararTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function iniciarTimer() {
    if (!S.ativo || !S.ativo.lim) return;
    timer = setInterval(() => {
      const rem = restante(), el = document.getElementById('timer');
      if (rem === null) return pararTimer();
      if (el) { el.textContent = ftempo(rem); el.classList.toggle('low', rem < 600); }
      if (rem <= 0) { pararTimer(); entregar(); }
    }, 1000);
  }
  function topo() {
    const el = document.getElementById('tminus');
    const n = dnum(S.cfg.prova) - HJ();
    if (!el) return;
    el.innerHTML = isNaN(n) ? '' : n > 0 ? `<b>T−${n} ${n === 1 ? 'DIA' : 'DIAS'}</b>prova ${fdata(dnum(S.cfg.prova))}` : n === 0 ? '<b>HOJE</b>dia da prova' : `<b>—</b>prova ${fdata(dnum(S.cfg.prova))}`;
  }
  function render() {
    pararTimer();
    let h = '';
    switch (V.v) {
      case 'plano': h = vPlano(); break;
      case 'materias': h = vMaterias(); break;
      case 'modulo': h = vModulo(); break;
      case 'quiz': h = vQuiz(); break;
      case 'fc': h = vFC(); break;
      case 'treino': h = vTreino(); break;
      case 'simulados': h = vSimulados(); break;
      case 'sim': h = vSim(); break;
      case 'res': h = vRes(); break;
      case 'apostila': h = vApostila(); break;
      case 'apset': h = vApSet(); break;
      case 'appags': h = vApPags(); break;
      case 'cert': h = vCert(); break;
      case 'inicio': h = vInicio(); break;
      default: h = vHoje();
    }
    document.body.classList.toggle('sem-nav', V.v === 'inicio');
    document.body.classList.toggle('sem-apostila', !apVisivel());
    if (!gravouLocal && V.v !== 'hoje') h = '<div class="banner warn" role="alert">O progresso não está sendo salvo neste aparelho. Mantenha esta aba aberta e copie o progresso em Plano › Dados.</div>' + h;
    if (!loc.carregado) h = '<div role="status" class="banner">Preparando seus dados. Aguarde para estudar.</div>' + h;
    if (loc.semIDB && gravouLocal) h = '<div class="banner warn" role="alert">Este navegador usa uma cópia de reserva sem proteção contra queda. Exporte o progresso em Plano › Dados antes de fechar.</div>' + h;
    app.innerHTML = h;
    if (!loc.carregado) app.querySelectorAll('button[data-a], input:not([readonly]), select').forEach(el => { if (!['tab', 'go', 'expcopiar', 'dadosver', 'dadosbaixar', 'cancelar'].includes(el.dataset.a)) el.disabled = true; });
    app.classList.toggle('largo', V.v === 'apset');
    app.classList.toggle('combarra', V.v === 'apset' && !!app.querySelector('.apbar'));
    lazyPaginas();
    let aba = ABA_DE[V.v];
    if (V.v === 'quiz' && QZ) aba = QZ.origem.tipo === 'mod' ? 'materias' : 'treino';
    document.querySelectorAll('.tab').forEach(b => { if (b.dataset.v === aba) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
    topo();
    syncInfo();
    if (V.v === 'sim') iniciarTimer();
  }


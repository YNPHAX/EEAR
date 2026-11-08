  /* ---------- aula: videoaula, roteiro e navegação ---------- */
  const dominado = m => ((S.mod[m.id] || {}).best || 0) >= META;
  function passos(m) {
    const r = S.mod[m.id] || {}, a = S.aula[m.id] || {}, vs = VA[m.id] || [];
    return [
      { k: 'v', txt: 'Assistir à videoaula', ok: !!a.v || !vs.length, sub: vs.length ? (EMBED ? 'marca sozinho quando você dá o play' : 'marca sozinho quando você abre o vídeo') : '' },
      { k: 't', txt: 'Ler o resumo da teoria', ok: !!r.lido },
      { k: 'e', txt: 'Ver os exemplos resolvidos', ok: !!a.e || !(m.ex || []).length },
      { k: 'q', txt: 'Fazer o quiz e tirar 80% ou mais', ok: dominado(m), sub: r.best != null ? 'melhor nota: ' + pct(r.best) : (m.q.length + ' questões no estilo da EEAR') },
      { k: 'f', txt: 'Revisar os flashcards', ok: (m.fc || []).some((_, i) => S.fc[m.id + '~' + i]) || !(m.fc || []).length }
    ];
  }
  const capaVideo = v => `<button class="pl-capa" data-a="play" data-vid="${v.id}" aria-label="Assistir: ${esc(v.t)}"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" onerror="this.remove()"><span class="pl-btn" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5z"/></svg></span></button>`;
  const iframeVideo = v => `<iframe src="https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0&playsinline=1" title="${esc(v.t)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
  const creditoVideo = v => `${v.c ? 'Vídeo de ' + esc(v.c) + ' no YouTube' : 'Vídeo do YouTube'} · <a href="${ytUrl(v.id)}" target="_blank" rel="noopener">abrir no YouTube</a>`;
  function linhaVideo(m, v, cur) {
    const tipo = { a: 'Aula', q: 'Questões', y: 'Provas da EEAR' }[v.k] || 'Aula';
    const fora = v.k === 'y' || !EMBED;
    const corpo = `<span class="vt">${tipo}</span><span class="vb"><b>${esc(v.t)}</b><span class="small muted">${esc(v.c || 'YouTube')}${fora ? ' · abre no YouTube' : ''}</span></span>`;
    return fora
      ? `<a class="vrow" href="${ytUrl(v.id)}" target="_blank" rel="noopener" data-a="vext" data-id="${m.id}">${corpo}<span class="vext" aria-hidden="true">↗</span></a>`
      : `<button class="vrow ${cur && cur.id === v.id ? 'on' : ''}" data-a="vsel" data-vid="${v.id}" aria-pressed="${!!(cur && cur.id === v.id)}">${corpo}<span class="vext" aria-hidden="true">▶</span></button>`;
  }
  function blocoVideo(m) {
    const vs = VA[m.id] || [];
    if (!vs.length) return `<section class="card"><h2 class="h2">Videoaula</h2><p class="small muted" style="margin:0">Este tópico ainda não tem videoaula escolhida. Use a busca abaixo da teoria.</p></section>`;
    const cur = EMBED ? vs.find(v => v.k !== 'y') : null;
    let h = '<section class="card video">';
    if (cur) h += `<div class="player" id="player">${capaVideo(cur)}</div><p class="small muted cred" id="cred">${creditoVideo(cur)}</p>`;
    else h += `<h2 class="h2">Videoaulas</h2><p class="small muted" style="margin:0">Os vídeos abrem no YouTube, em outra aba.</p>`;
    h += `<div class="vlist">${vs.map(v => linhaVideo(m, v, cur)).join('')}</div></section>`;
    return h;
  }
  function blocoRoteiro(m) {
    const ps = passos(m), feitos = ps.filter(p => p.ok).length, vs = VA[m.id] || [];
    const v0 = vs.find(v => v.k !== 'y') || vs[0];
    const acao = {
      v: v0 ? (EMBED && v0.k !== 'y' ? `<button class="btn sm" data-a="play" data-vid="${v0.id}">Assistir</button>` : `<a class="btn sm" href="${ytUrl(v0.id)}" target="_blank" rel="noopener" data-a="vext" data-id="${m.id}">Assistir</a>`) : '',
      t: '<button class="btn sm" data-a="aba" data-aba="teoria">Ler</button>',
      e: '<button class="btn sm" data-a="aba" data-aba="ex">Ver</button>',
      q: `<button class="btn sm ${dominado(m) ? '' : 'pri'}" data-a="quizmod" data-id="${m.id}">${(S.mod[m.id] || {}).tent ? 'Refazer' : 'Fazer'}</button>`,
      f: `<button class="btn sm" data-a="fcmod" data-id="${m.id}">Revisar</button>`
    };
    return `<section class="card"><div class="row between"><h2 class="h2">Roteiro da aula</h2><span class="small muted num" id="passos-n">${feitos} de ${ps.length}</span></div>
      <div class="meter"><i id="passos-m" style="width:${feitos / ps.length * 100}%"></i></div>
      <div class="tasks">${ps.map(p => `<div class="task ${p.ok ? 'done' : ''}" id="passo-${p.k}"><span class="check auto ${p.ok ? 'on' : ''}" role="img" aria-label="${p.ok ? 'Feito' : 'Pendente'}">${ICON_OK}</span><div class="tt"><b>${p.txt}</b>${p.sub ? `<div class="small muted">${p.sub}</div>` : ''}</div>${p.ok && p.k !== 'q' && p.k !== 'f' ? '<span></span>' : acao[p.k]}</div>`).join('')}</div>
      <p class="small muted" style="margin:0">A aula conta como concluída quando você tira 80% ou mais no quiz.</p></section>`;
  }
  function navAulas(m) {
    const ms = aulasDe(m.m), i = ms.indexOf(m), ant = ms[i - 1], prox = ms[i + 1];
    return `<div class="navaula">${ant ? `<button class="btn" data-a="mod" data-id="${ant.id}">← Aula ${i}</button>` : '<span></span>'}${prox ? `<button class="btn ${dominado(m) ? 'pri' : ''}" data-a="mod" data-id="${prox.id}">Próxima aula: ${esc(prox.t)} →</button>` : `<button class="btn" data-a="mat" data-s="${m.m}">Voltar à trilha de ${MATS[m.m].curto}</button>`}</div>`;
  }
  /* Marca "assistiu" sem redesenhar a tela (o vídeo continua tocando). */
  function marcarAssistido(id) {
    const a = S.aula[id] = S.aula[id] || {};
    if (a.v) return;
    a.v = hoje(); marcarAtividade(); salvar();
    const el = document.getElementById('passo-v');
    if (el) { el.classList.add('done'); const c = el.querySelector('.check'); if (c) c.classList.add('on'); const b = el.lastElementChild; if (b && b.matches('.btn')) b.replaceWith(document.createElement('span')); }
    const m = MOD[id], ps = m && passos(m);
    if (ps) { const f = ps.filter(p => p.ok).length, n = document.getElementById('passos-n'), mt = document.getElementById('passos-m'); if (n) n.textContent = f + ' de ' + ps.length; if (mt) mt.style.width = (f / ps.length * 100) + '%'; }
  }

  function vModulo() {
    const m = MOD[V.id];
    if (!m || !moduloAtivo(m)) return vMaterias();
    const aba = V.aba || 'aula';
    const r = S.mod[m.id] || {}, st = estMod(m.id);
    let h = `<button class="btn ghost back" data-a="mat" data-s="${m.m}">← Trilha de ${MATS[m.m].curto}</button>`;
    h += `<div class="stack"><div class="eyebrow">${sig(m.m)} Aula ${nAula(m)} de ${aulasDe(m.m).length} · ${m.id} · incidência ${bolinhas(m.peso)} · ${fh(m.h)}</div><h1 class="h1">${m.t}</h1><div class="row"><span class="chip ${st.k}">${st.txt}</span>${r.tent ? `<span class="small muted">${plural(r.tent, 'tentativa', 'tentativas')} no quiz</span>` : ''}</div></div>`;
    const ofi = OFI[m.id] || [];
    const aps = APMOD[m.id] || [];
    const abas = [['aula', 'Aula'], ['teoria', 'Teoria'], ['ex', 'Exemplos'], ['quiz', 'Quiz']].concat(apVisivel() ? [['ap', 'Apostila']] : [], [['prov', 'Provas'], ['cards', 'Cartões']]);
    h += `<div class="seg" role="group" aria-label="Partes da aula">${abas.map(a => `<button data-a="aba" data-aba="${a[0]}" aria-pressed="${a[0] === aba}">${a[1]}</button>`).join('')}</div>`;
    if (aba === 'aula') {
      h += blocoVideo(m) + blocoRoteiro(m);
    } else if (aba === 'teoria') {
      h += `<article class="card teoria b-${m.m}">${m.teoria}</article>`;
      const busca = VID[m.id] || m.t;
      h += `<section class="card"><h2 class="h2">Mais vídeos no YouTube</h2><p class="small muted" style="margin:0">${(VA[m.id] || []).length ? 'A videoaula escolhida está na aba Aula. ' : ''}Estes links abrem a busca do YouTube em outra aba.</p>
        <div class="stack"><a class="vlink" href="${yt(busca + ' aula')}" target="_blank" rel="noopener">Aula: ${busca}</a><a class="vlink" href="${yt('EEAR ' + busca + ' questão resolvida')}" target="_blank" rel="noopener">Questões da EEAR resolvidas sobre o tema</a></div>
        <div class="row small">${CANAIS[m.m].map(cn => `<a href="${yt(cn + ' ' + busca)}" target="_blank" rel="noopener">${cn}</a>`).join('<span class="muted">·</span>')}</div></section>`;
      h += `<div class="row"><button class="btn pri" data-a="quizmod" data-id="${m.id}">Fazer o quiz (meta 80%)</button><button class="btn" data-a="aba" data-aba="ex">Ver exemplos resolvidos</button></div>`;
    } else if (aba === 'ex') {
      h += (m.ex || []).map((x, i) => `<section class="card"><div class="eyebrow">Exemplo ${i + 1}</div><div class="q-enun">${x[0]}</div><details class="rev"><summary>Ver resolução</summary><div class="teoria">${x[1]}</div></details></section>`).join('') || '<p class="empty">Sem exemplos neste módulo.</p>';
      h += `<div class="row"><button class="btn pri" data-a="quizmod" data-id="${m.id}">Fazer o quiz (meta 80%)</button></div>`;
    } else if (aba === 'quiz') {
      h += `<section class="card"><h2 class="h2">Quiz do módulo</h2><p style="margin:0">São ${m.q.length} questões no estilo da EEAR, com correção comentada logo após cada resposta. O módulo fica dominado com ${Math.ceil(m.q.length * META)} acertos ou mais.</p>
        ${r.best != null ? `<div class="row"><span class="chip ${r.best >= META ? 'ok' : 'warn'}">Melhor nota: ${pct(r.best)}</span><span class="chip">Última: ${pct(r.last)}</span></div>` : ''}
        <div class="row"><button class="btn pri" data-a="quizmod" data-id="${m.id}">${r.tent ? 'Refazer o quiz' : 'Começar o quiz'}</button></div></section>`;
    } else if (aba === 'ap') {
      h += `<section class="card"><h2 class="h2">Exercícios da apostila</h2>${aps.length
        ? `<p style="margin:0">${plural(aps.length, 'conjunto', 'conjuntos')} das suas apostilas sobre este tópico, com ${AP_PAG ? 'as páginas originais' : 'a página do PDF'} e correção pelo gabarito do livro. Meta: 80% em cada um.</p><div class="mods">${aps.map(id => apLinha(APS[id], 'mod')).join('')}</div>`
        : '<p style="margin:0">As apostilas não têm um conjunto de exercícios específico deste tópico. Veja a aba Apostila para folhear o material.</p>'}</section>`;
    } else if (aba === 'prov') {
      h += `<section class="card"><h2 class="h2">Questões de provas anteriores</h2>${ofi.length
        ? `<p style="margin:0">${plural(ofi.length, 'questão oficial', 'questões oficiais')} da EEAR sobre este tópico, com a ordem original das alternativas e o gabarito oficial.</p><div class="row"><button class="btn pri" data-a="oficiaismod" data-id="${m.id}">Resolver ${ofi.length > 20 ? '20 sorteadas' : 'todas'}</button></div>`
        : `<p style="margin:0">Ainda não há questões oficiais deste tópico no curso. Elas entram aqui, com o gabarito oficial, quando as provas anteriores da EEAR forem carregadas.</p>`}</section>`;
    } else {
      h += `<section class="card"><h2 class="h2">Flashcards do módulo</h2><p style="margin:0">Estes cartões entram na sua revisão diária com repetição espaçada: quem você acerta volta depois de 1, 3, 7, 14, 30 e 60 dias; quem você erra volta amanhã.</p>
        <div class="row"><button class="btn pri" data-a="fcmod" data-id="${m.id}">Estudar os ${(m.fc || []).length} cartões</button></div></section>`;
      h += `<section class="card"><div class="tbl"><table><tbody>${(m.fc || []).map(c => `<tr><td>${c[0]}</td><td>${c[1]}</td></tr>`).join('')}</tbody></table></div></section>`;
    }
    h += navAulas(m);
    return h;
  }

  /* ---------- apostila ---------- */
  const grupoAp = s => s.tipo === 'sala' ? 'exercícios em sala' : (s.tipo === 'casa' || s.tipo === 'adicionais') ? 'exercícios para casa' : s.tipo === 'unit' ? 'units' : 'tests e provas reais';
  function apLinha(s, de) {
    return `<button class="modrow" data-a="apset" data-id="${s.id}" ${de ? `data-de="${de}"` : ''}><span class="sigla c-${s.m}">${apSigla(s)}</span><span><span class="mt">${apTitulo(s)}</span><br><span class="peso">${apTipo(s)} · ${s.nmc} questões${s.inc ? ' · gabarito pouco nítido' : ''}</span></span>${apChip(s.id)}</button>`;
  }
  function vApostila() {
    let h = `<div class="stack"><div class="eyebrow">Material do curso</div><h1 class="h1">Apostila</h1></div>`;
    if (!AP.sets.length) return h + '<p class="empty">A apostila ainda não foi carregada.</p>';
    if (!apVisivel()) return h + '<section class="card"><p style="margin:0">A aba Apostila é para quem estuda pelas apostilas do curso: ela traz a folha de respostas de cada conjunto de exercícios, corrigida pelo gabarito do livro.</p><div class="row"><button class="btn pri" data-a="apligar">Uso as apostilas: mostrar</button></div></section>';
    const l = V.l && LIVRO[V.l] ? V.l : (V.l = AP.livros[0].id);
    const s = V.s && MATS[V.s] ? V.s : (V.s = ORD[0]);
    h += AP_PAG ? `<p class="small" style="margin:0">As páginas originais das suas apostilas, com folha de respostas corrigida pelo gabarito impresso do livro. A meta é 80% em cada conjunto.</p>`
      : `<p class="small" style="margin:0">Folhas de respostas das suas apostilas, corrigidas pelo gabarito impresso do livro. Abra o PDF da apostila na página indicada em cada conjunto e marque as respostas aqui. A meta é 80% em cada conjunto.</p>`;
    h += `<div class="seg" role="group" aria-label="Livro">${AP.livros.map(x => `<button data-a="aplivro" data-l="${x.id}" aria-pressed="${x.id === l}">${x.curto}</button>`).join('')}</div>`;
    h += `<div class="seg" role="group" aria-label="Matéria">${ORD.map(x => `<button data-a="apmat" data-s="${x}" aria-pressed="${x === s}">${MATS[x].curto}</button>`).join('')}</div>`;
    const sets = AP.sets.filter(x => x.l === l && x.m === s);
    let tot = 0, fe = 0, ce = 0;
    sets.forEach(x => { const e = apEst(x.id); tot += e.total; fe += e.feitas; ce += e.certas; });
    h += `<section class="card b-${s}"><div class="row between"><h2 class="h2">${LIVRO[l].nome} · ${MATS[s].curto}</h2><span class="small muted num">${fe} de ${tot} corrigidas</span></div><div class="meter"><i style="width:${tot ? (fe / tot) * 100 : 0}%"></i></div>${fe ? `<span class="small muted">${pct(ce / fe)} de acerto nas questões corrigidas</span>` : ''}`;
    const grupos = [];
    sets.forEach(x => { const k = x.fr + ' · ' + grupoAp(x); let g = grupos.find(y => y.k === k); if (!g) grupos.push(g = { k, sets: [] }); g.sets.push(x); });
    h += grupos.length ? grupos.map(g => `<div class="aphead">${g.k.replace(/^(Matemática|Física) · /, '')}</div><div class="mods">${g.sets.map(x => apLinha(x)).join('')}</div>`).join('') : '<p class="empty">Este livro não tem exercícios desta matéria.</p>';
    h += `</section>`;
    const partes = LIVRO[l].partes.filter(p => AP.partes[p] && AP.partes[p].m === s);
    if (partes.length && AP_PAG) h += `<section class="card"><h2 class="h2">Folhear a apostila</h2><p class="small muted" style="margin:0">Teoria, exercícios comentados e exercícios na ordem do livro.</p><div class="row">${partes.map((p, i) => `<button class="btn" data-a="appags" data-part="${p}" data-p="1">${MATS[s].curto}${partes.length > 1 ? ' · parte ' + (i + 1) : ''} · ${AP.partes[p].n} págs.</button>`).join('')}</div></section>`;
    return h;
  }
  function fq(s, r, si, i, g) {
    const k = si + ':' + i, n = pad(i + 1);
    if (g === '*') return `<div class="fq open"><span class="n">${n}</span><span class="small muted">aberta</span></div>`;
    const marc = r.r[k], ok = r.ok[k], corr = ok !== undefined, cur = V.qk === k;
    return `<div class="fq ${corr ? (ok ? 'right' : 'wrong') : ''} ${cur ? 'cur' : ''}"><span class="n">${n}</span>${LETRAS.map(L => `<button class="${marc === L ? 'on' : ''} ${corr && L === g ? 'gab' : ''}" data-a="apm" data-k="${k}" data-l="${L}" ${corr ? 'disabled' : ''} aria-pressed="${marc === L}" aria-label="Questão ${i + 1}, ${L}">${L}</button>`).join('')}</div>`;
  }
  function folha(s, r) {
    const e = apEst(s.id), marc = Object.keys(r.r).length;
    const pend = s.itens.filter(x => x.g !== '*' && r.r[x.k] && r.ok[x.k] === undefined).length;
    const err = Object.keys(r.ok).filter(k => r.ok[k] === 0).length;
    let h = `<section class="card" id="folha"><div class="row between"><h2 class="h2">Folha de respostas</h2><span class="small muted num">${marc} de ${s.nmc} marcadas</span></div>`;
    if (e.feitas) {
      const tx = e.certas / e.feitas;
      h += `<div class="row between"><span class="score num">${e.certas}<small> de ${e.feitas} corrigidas</small></span><span class="chip ${tx >= META ? 'ok' : 'warn'}">${pct(tx)}</span></div>`;
      if (e.fim) h += `<p class="small" style="margin:0">${e.nota >= META ? 'Meta de 80% batida neste conjunto.' : 'Abaixo da meta de 80%. Releia a teoria da aula e refaça as erradas.'}${r.prim != null && r.tent > 1 ? ` Na primeira vez você fez ${pct(r.prim)}.` : ''}</p>`;
    }
    s.sec.forEach((sec, si) => {
      if (sec.g) {
        if (s.sec.length > 1 || sec.n !== s.t) h += `<div class="aphead">${sec.n}</div>`;
        h += `<div class="folha">${sec.g.split('').map((g, i) => fq(s, r, si, i, g)).join('')}</div>`;
      } else h += `<details class="rev"><summary>${sec.n}: respostas</summary><ol class="small">${sec.txt.map(t => `<li>${t}</li>`).join('')}</ol></details>`;
    });
    if (s.abertas) h += `<details class="rev"><summary>Respostas das questões abertas</summary><ul class="small">${s.abertas.map(t => `<li>${t}</li>`).join('')}</ul></details>`;
    h += `<div class="row"><button class="btn pri" data-a="apcorr" ${pend ? '' : 'disabled'}>Corrigir${pend ? ' ' + pend : ''}</button>${err ? `<button class="btn" data-a="aperr">Refazer as ${err} erradas</button>` : ''}${marc ? '<button class="btn ghost" data-a="aplimpar">Recomeçar</button>' : ''}</div>`;
    if (pedindo === 'aplimpar') h += '<div class="confirm"><p>Apagar as respostas deste conjunto e começar de novo?</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="aplimparok">Apagar</button></div>';
    h += `<p class="small muted" style="margin:0">Correção pelo gabarito impresso do livro. Dá para corrigir aos poucos: só as questões marcadas são corrigidas, e as erradas ficam guardadas para refazer.${s.gp ? (AP_PAG ? ` <button class="lnk" data-a="appags" data-part="${s.gp[0]}" data-p="${s.gp[1]}">Ver a página do gabarito</button>` : ` O gabarito impresso está na página ${s.gp[1]} do PDF ${apPdf(s.gp[0])}.`) : ''}</p></section>`;
    return h;
  }
  function apItens(s) { return s.itens.filter(x => x.g !== '*'); }
  /* Questão atual da barra de marcação: a escolhida ou a primeira ainda sem resposta. */
  function apAtual(s, r) {
    const its = apItens(s);
    let it = its.find(x => x.k === V.qk);
    if (!it) it = its.find(x => r.ok[x.k] === undefined && !r.r[x.k]) || its[0];
    V.qk = it ? it.k : null;
    return it;
  }
  function apBarra(s, r) {
    const it = apAtual(s, r);
    if (!it) return '';
    const marc = r.r[it.k], corr = r.ok[it.k] !== undefined;
    const sec = s.sec.length > 1 ? s.sec[it.si].n.split(' ')[0] + ' ' : '';
    return `<div class="apbar"><div class="apbar-in"><button class="btn sm ghost" data-a="apqi" data-d="-1" aria-label="Questão anterior">‹</button><span class="apq num">${sec}${pad(it.n)}</span><button class="btn sm ghost" data-a="apqi" data-d="1" aria-label="Próxima questão">›</button><span class="aplet">${LETRAS.map(L => `<button class="${marc === L ? 'on' : ''} ${corr && L === it.g ? 'gab' : ''}" data-a="apm" data-k="${it.k}" data-l="${L}" data-bar="1" ${corr ? 'disabled' : ''} aria-label="Marcar ${L}">${L}</button>`).join('')}</span><button class="btn sm fol" data-a="apfolha">Folha</button></div></div>`;
  }
  function apRegistro(id) {
    const r = S.ap[id] = S.ap[id] || {};
    if (!r.r || typeof r.r !== 'object') r.r = {};
    if (!r.ok || typeof r.ok !== 'object') r.ok = {};
    return r;
  }
  function vApSet() {
    const s = APS[V.id];
    if (!s) return vApostila();
    const r = S.ap[s.id] ? apRegistro(s.id) : { r: {}, ok: {} };
    const m0 = s.mods[0] && MOD[s.mods[0]];
    apAtual(s, r);
    let h = `<button class="btn ghost back" data-a="apvolta">← ${V.de === 'mod' && MOD[V.mod] ? MOD[V.mod].id : ({ hoje: 'Hoje', sim: 'Simulados', treino: 'Treino' })[V.de] || 'Apostila'}</button>`;
    h += `<div class="stack"><div class="eyebrow">${sig(s.m)} ${LIVRO[s.l].nome} · ${s.fr}</div><h1 class="h1">${apTitulo(s)}</h1><div class="row"><span class="chip">${apTipo(s)}</span>${apChip(s.id)}${s.mods.map(id => `<button class="chip lnkchip" data-a="mod" data-id="${id}" title="${MOD[id].t}">${id}</button>`).join('')}</div></div>`;
    if (s.inc) h += `<div class="banner warn"><p>A página do gabarito deste conjunto está pouco nítida no livro, e B e D podem se confundir. Se uma correção parecer errada, confira o gabarito impresso${s.gp && !AP_PAG ? ` (página ${s.gp[1]} do PDF)` : ''}.</p>${s.gp && AP_PAG ? `<button class="btn sm" data-a="appags" data-part="${s.gp[0]}" data-p="${s.gp[1]}">Ver gabarito impresso</button>` : ''}</div>`;
    h += '<div class="apgrid"><div class="appages">';
    if (s.pg && AP.partes[s.pg[0]] && !AP_PAG) {
      const part = s.pg[0], a = s.pg[1], b = s.pg[2];
      h += `<section class="card pdfref"><div class="eyebrow">Abra o PDF</div><h2 class="h2">${apPdf(part)}</h2><p style="margin:0">${a === b ? `Exercícios na página <b class="num">${a}</b>` : `Exercícios nas páginas <b class="num">${a}</b> a <b class="num">${b}</b>`} do PDF.${s.ini ? ` Teoria da aula: página <b class="num">${s.ini[1]}</b>${s.ini[0] !== part ? ' do PDF ' + apPdf(s.ini[0]) : ''}.` : ''}</p>${m0 ? `<p class="small muted" style="margin:0">Teoria resumida no módulo <button class="lnk" data-a="mod" data-id="${m0.id}">${m0.id} · ${m0.t}</button>.</p>` : ''}</section>`;
    } else if (s.pg && AP.partes[s.pg[0]]) {
      const part = s.pg[0], a = s.pg[1], n = AP.partes[part].n, fim = Math.min(n, s.pg[2] + (V.mais || 0));
      h += `<p class="small muted" style="margin:0">Toque numa página para ampliar.${m0 ? ` Teoria resumida no módulo ${m0.id}${s.ini ? ' e a do livro em "Ver a teoria da aula"' : ''}.` : ''}</p><div class="pgs">`;
      for (let p = a; p <= fim; p++) h += pgHtml(part, p);
      h += `</div><div class="row">${fim < n ? '<button class="btn sm" data-a="apmais">Mostrar a página seguinte</button>' : ''}<button class="btn sm" data-a="appags" data-part="${s.ini ? s.ini[0] : part}" data-p="${s.ini ? s.ini[1] : a}">${s.ini ? 'Ver a teoria da aula' : 'Folhear a partir daqui'}</button></div>`;
    } else h += '<p class="small muted">As páginas deste conjunto não foram localizadas automaticamente. Use "Folhear a apostila" na aba Apostila.</p>';
    h += `</div><aside class="apside">${folha(s, r)}</aside></div>`;
    h += apBarra(s, r);
    return h;
  }
  function vApPags() {
    const info = AP.partes[V.part];
    if (!info || !AP_PAG) return vApostila();
    const n = info.n, a = Math.max(1, Math.min(n, V.p || 1)), b = Math.min(n, a + 3);
    let h = '<button class="btn ghost back" data-a="apvolta">← Voltar</button>';
    h += `<div class="stack"><div class="eyebrow">${sig(info.m)} ${LIVRO[info.livro].nome}</div><h1 class="h1">${MATS[info.m].curto}${info.parte ? ' · parte ' + info.parte : ''}</h1></div>`;
    const idx = (info.idx || []);
    const nav = `<div class="row between"><button class="btn sm" data-a="appnav" data-p="${a - 4}" ${a > 1 ? '' : 'disabled'}>‹ Anteriores</button><span class="small muted num">${a === b ? a : a + '–' + b} de ${n}</span><button class="btn sm" data-a="appnav" data-p="${a + 4}" ${b < n ? '' : 'disabled'}>Próximas ›</button></div>`;
    if (idx.length) h += `<div class="field"><label for="ap-ir">Ir para</label><select id="ap-ir">${idx.map(x => `<option value="${x[0]}" ${x[0] <= a && a < x[0] + 4 ? 'selected' : ''}>${x[1]}</option>`).join('')}</select></div>`;
    h += nav + '<div class="pgs">';
    for (let p = a; p <= b; p++) h += pgHtml(V.part, p);
    h += '</div>' + nav;
    return h;
  }

  function opcoes(q, perm, resp, revelar, acao) {
    const cp = perm.indexOf(q.c);
    return `<div class="opts ${q.img ? 'letras' : ''}">${perm.map((oi, pos) => {
      let cls = '';
      if (revelar) { if (pos === cp) cls = 'right'; else if (pos === resp) cls = 'wrong'; }
      else if (pos === resp) cls = 'sel';
      return `<button class="opt ${cls}" ${acao ? `data-a="${acao}" data-p="${pos}"` : ''} ${revelar ? 'disabled' : ''} ${q.img ? `aria-label="Alternativa ${LETRAS[pos]}"` : ''}><span class="l">${LETRAS[pos]}</span>${q.img ? '' : `<span>${q.o[oi]}</span>`}</button>`;
    }).join('')}</div>`;
  }

  function iniciarQuiz(ids, titulo, origem) {
    const lista = shuffle(ids.slice());
    QZ = { ids: lista, perms: permutar(lista), i: 0, resp: {}, titulo, origem, fim: false };
    go('quiz');
  }
  function vQuiz() {
    const z = QZ;
    if (!z) return vHoje();
    if (z.fim) return vQuizFim();
    const id = z.ids[z.i], q = Q[id], perm = z.perms[id], r = z.resp[id], resp = r !== undefined;
    const cp = perm.indexOf(q.c), certo = resp && acertou(id, perm, r);
    let h = `<div class="row between"><button class="btn ghost back" data-a="sairquiz">← Sair</button><span class="small muted num">Questão ${z.i + 1} de ${z.ids.length}</span></div>`;
    h += `<div class="stack"><div class="eyebrow">${sig(q.m)} ${q.src ? 'Prova oficial' : q.mod} · ${z.titulo}</div><div class="meter b-${q.m}"><i style="width:${(z.i / z.ids.length) * 100}%"></i></div></div>`;
    h += `<section class="card"><div class="q-enun">${enun(q)}</div>${opcoes(q, perm, r, resp, resp ? '' : 'qresp')}`;
    if (resp) {
      h += `<div class="expl"><b class="${certo ? 'ok' : 'bad'}">${q.anulada ? 'Questão anulada: vale ponto para todos.' : certo ? 'Correta.' : 'Incorreta. A resposta é a ' + LETRAS[cp] + '.'}</b> ${q.r}</div>`;
      h += `<div class="row"><button class="btn pri" data-a="qprox">${z.i + 1 < z.ids.length ? 'Próxima questão' : 'Ver resultado'}</button></div>`;
    }
    h += `</section>`;
    return h;
  }
  function fecharQuiz() {
    const z = QZ;
    const ac = z.ids.filter(id => acertou(id, z.perms[id], z.resp[id])).length;
    const sc = ac / z.ids.length;
    z.ac = ac; z.sc = sc;
    if (z.origem.tipo === 'mod') {
      const r = S.mod[z.origem.id] = S.mod[z.origem.id] || {};
      r.tent = (r.tent || 0) + 1; r.last = sc;
      if (r.best == null || sc > r.best) r.best = sc;
      if (sc >= META && !r.ok) r.ok = hoje();
      if (!r.lido) r.lido = hoje();
      r.quando = hoje();
      if (z.origem.rev) S.feito[z.origem.rev] = true;
      registrarCerts(S);
    }
    marcarAtividade();
    z.fim = true;
    salvar();
  }
  function vQuizFim() {
    const z = QZ, mid = z.origem.tipo === 'mod' ? z.origem.id : null, m = mid && MOD[mid];
    const passou = z.sc >= META;
    const ativos = modulosAtivos(), iAtivo = m ? ativos.indexOf(m) : -1, proxM = iAtivo >= 0 ? ativos[iAtivo + 1] : null;
    const erradas = z.ids.filter(id => !acertou(id, z.perms[id], z.resp[id]));
    let h = `<div class="stack"><div class="eyebrow">Debriefing · ${z.titulo}</div><h1 class="h1">${m ? (passou ? 'Módulo dominado' : 'Ainda não chegou aos 80%') : (z.ac === z.ids.length ? 'Tudo certo' : 'Rodada concluída')}</h1></div>`;
    h += `<section class="card"><div class="row between"><span class="score num">${z.ac}<small> de ${z.ids.length}</small></span><span class="chip ${passou ? 'ok' : 'warn'}">${pct(z.sc)}</span></div>
      <p style="margin:0">${m ? (passou ? 'Você bateu a meta. O módulo entra nas revisões espaçadas pelos flashcards.' : `A meta é ${Math.ceil(z.ids.length * META)} acertos. Releia a teoria nos pontos das questões abaixo e refaça o quiz.`) : (z.origem.tipo === 'erros' ? 'As questões que você acertou saíram do caderno de erros.' : z.origem.tipo === 'oficial' ? 'Questões oficiais da EEAR, corrigidas pelo gabarito oficial. As erradas foram para o caderno de erros.' : '')}</p>
      <div class="row">${m ? `<button class="btn ${passou ? '' : 'pri'}" data-a="quizmod" data-id="${mid}">Refazer o quiz</button><button class="btn" data-a="mod" data-id="${mid}">Voltar à teoria</button>` : z.origem.tipo === 'oficial' ? `<button class="btn pri" data-a="mod" data-id="${z.origem.id}">Voltar ao módulo</button>` : `<button class="btn pri" data-a="tab" data-v="treino">Voltar ao treino</button>`}
      ${m && passou && proxM ? `<button class="btn pri" data-a="mod" data-id="${proxM.id}">Próximo módulo</button>` : ''}</div></section>`;
    if (erradas.length) h += `<section class="card"><h2 class="h2">Revise os erros</h2>${erradas.map(id => { const q = Q[id]; return `<details class="rev"><summary>${rotulo(q)} · ${resumo(q.e)}</summary><div class="q-enun">${enun(q)}</div><p><b>Resposta:</b> ${q.of ? LETRAS[q.c] + ') ' : ''}${q.o[q.c]}</p><div class="expl">${q.r}</div></details>`; }).join('')}</section>`;
    return h;
  }
  function resumo(html) {
    const t = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return t.length > 90 ? t.slice(0, 88) + '…' : t;
  }

  function iniciarFC(ids, titulo) {
    FC = { fila: shuffle(ids.slice()), i: 0, virado: false, ok: 0, err: 0, titulo, rep: {} };
    go('fc');
  }
  function vFC() {
    const f = FC;
    if (!f) return vTreino();
    let h = `<div class="row between"><button class="btn ghost back" data-a="tab" data-v="treino">← Treino</button><span class="small muted num">${Math.min(f.i + 1, f.fila.length)} de ${f.fila.length}</span></div>`;
    if (f.i >= f.fila.length) {
      h += `<div class="stack"><div class="eyebrow">Flashcards · ${f.titulo}</div><h1 class="h1">Revisão concluída</h1></div><section class="card"><p style="margin:0"><b>${f.ok}</b> ${f.ok === 1 ? 'acerto' : 'acertos'} e <b>${f.err}</b> ${f.err === 1 ? 'erro' : 'erros'}. Os cartões que você errou voltam amanhã.</p><div class="row"><button class="btn pri" data-a="tab" data-v="treino">Voltar ao treino</button></div></section>`;
      return h;
    }
    const c = CARDS[f.fila[f.i]], m = MOD[c.mod];
    h += `<div class="stack"><div class="eyebrow">Flashcards · ${f.titulo}</div><div class="meter b-${c.m}"><i style="width:${(f.i / f.fila.length) * 100}%"></i></div></div>`;
    h += `<div class="fc"><span class="chip tag">${sig(c.m)} ${m.id}</span><div>${c.f}</div>${f.virado ? `<div class="verso">${c.v}</div>` : ''}</div>`;
    h += f.virado
      ? `<div class="row" style="justify-content:center"><button class="btn" data-a="fcaval" data-ok="0">Errei</button><button class="btn pri" data-a="fcaval" data-ok="1">Acertei</button></div>`
      : `<div class="row" style="justify-content:center"><button class="btn pri" data-a="fcvirar">Mostrar resposta</button></div>`;
    return h;
  }

  function vTreino() {
    let h = `<div class="stack"><div class="eyebrow">Treino diário</div><h1 class="h1">Flashcards e erros</h1></div>`;
    const dv = devidos(), lib = liberados();
    h += `<section class="card"><div class="row between"><h2 class="h2">Flashcards</h2><span class="small muted">${lib.length} liberados de ${Object.keys(CARDS).length}</span></div>
      <p style="margin:0">${dv.length ? `<b>${dv.length}</b> para revisar hoje.` : (lib.length ? 'Nada pendente hoje. Volte amanhã.' : 'Os cartões de um módulo são liberados quando você abre a teoria dele.')}</p>
      <div class="row">${dv.length ? `<button class="btn pri" data-a="fcini">Revisar todos (${dv.length})</button>` : ''}${ORD.map(s => { const n = devidos(s).length; return n ? `<button class="btn sm" data-a="fcini" data-s="${s}">${MATS[s].curto} (${n})</button>` : ''; }).join('')}</div></section>`;
    const ne = nErros();
    h += `<section class="card"><div class="row between"><h2 class="h2">Caderno de erros</h2><span class="small muted">${plural(ne, 'questão', 'questões')}</span></div>
      <p style="margin:0">Toda questão que você erra em quiz ou simulado vem para cá. Ela sai quando você acerta de novo.</p>
      <div class="row">${ne ? `<button class="btn pri" data-a="errosini">Refazer erros (${Math.min(ne, 20)})</button>` : ''}${ORD.map(s => { const n = nErros(s); return n ? `<button class="btn sm" data-a="errosini" data-s="${s}">${MATS[s].curto} (${n})</button>` : ''; }).join('')}</div>`;
    if (ne) {
      h += ORD.map(s => {
        const ids = Object.keys(S.erros).filter(id => Q[id] && Q[id].m === s);
        if (!ids.length) return '';
        return `<details class="rev"><summary>${MATS[s].curto} · ${ids.length}</summary>${ids.map(id => { const q = Q[id]; return `<details class="rev"><summary>${rotulo(q)} · ${resumo(q.e)} <span class="chip bad">${S.erros[id]}x</span></summary><div class="q-enun">${enun(q)}</div><p><b>Resposta:</b> ${q.of ? LETRAS[q.c] + ') ' : ''}${q.o[q.c]}</p><div class="expl">${q.r}</div></details>`; }).join('')}</details>`;
      }).join('');
    }
    h += `</section>`;
    const comErro = AP.sets.filter(s => { const r = S.ap[s.id]; return r && r.ok && Object.keys(r.ok).some(k => r.ok[k] === 0); });
    if (apVisivel()) h += `<section class="card"><div class="row between"><h2 class="h2">Erros da apostila</h2><span class="small muted">${plural(nErrosAp(), 'questão', 'questões')}</span></div>${comErro.length ? `<p style="margin:0">Conjuntos com questões erradas. Abra e use "Refazer as erradas" depois de rever a teoria.</p><div class="mods">${comErro.map(s => apLinha(s)).join('')}</div>` : '<p class="small muted" style="margin:0">Nenhum erro pendente nas folhas de respostas da apostila.</p>'}</section>`;
    const abaixo = modulosAtivos().filter(m => { const r = S.mod[m.id]; return r && r.best != null && r.best < META; });
    h += `<section class="card"><h2 class="h2">Módulos abaixo de 80%</h2>${abaixo.length ? `<div class="mods">${abaixo.map(m => `<button class="modrow" data-a="mod" data-id="${m.id}"><span class="sigla c-${m.m}">${m.id}</span><span class="mt">${m.t}</span><span class="chip warn">${pct(S.mod[m.id].best)}</span></button>`).join('')}</div>` : '<p class="small muted" style="margin:0">Nenhum. Todo quiz feito está na meta.</p>'}</section>`;
    return h;
  }


  /* ---------- navegação ---------- */
  let V = { v: 'hoje' };
  /* A aba Apostila só volta aberta se existir nesta versão (a versão pública não tem a apostila). */
  try { const a = localStorage.getItem(LS_ABA); if (a && ['hoje', 'plano', 'materias', 'apostila', 'treino', 'simulados'].indexOf(a) >= 0 && (a !== 'apostila' || apVisivel())) V = { v: a }; } catch (e) { /* ignora */ }
  if (S.ativo) V = { v: 'sim' };
  else if (mostrarInicio()) V = { v: 'inicio' };
  let QZ = null, FC = null, timer = null, pedindo = null, mapa = false;
  const ABA_DE = { hoje: 'hoje', plano: 'plano', materias: 'materias', modulo: 'materias', quiz: null, fc: 'treino', treino: 'treino', simulados: 'simulados', sim: 'simulados', res: 'simulados', apostila: 'apostila', apset: 'apostila', appags: 'apostila', cert: 'materias', inicio: null };
  function go(v, extra) { V = Object.assign({ v }, extra || {}); pedindo = null; render(); window.scrollTo(0, 0); }

  /* ---------- componentes ---------- */
  const ICON_OK = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  function linhaTarefa(t) {
    const ok = feita(t), auto = AUTO[t.tipo];
    const chk = auto
      ? `<span class="check auto ${ok ? 'on' : ''}" title="Marca sozinha quando você termina" role="img" aria-label="${ok ? 'Concluída' : 'Pendente'}">${ICON_OK}</span>`
      : `<button class="check ${ok ? 'on' : ''}" data-a="marcar" data-k="${t.k}" aria-pressed="${ok}" aria-label="Marcar como concluída">${ICON_OK}</button>`;
    const m = t.mod && MOD[t.mod];
    let sub = '', bt = '';
    switch (t.tipo) {
      case 'teoria': sub = `${sig(m.m)} ${m.id} · ${fh(t.h)}`; bt = `<button class="btn sm" data-a="mod" data-id="${m.id}">Estudar</button>`; break;
      case 'quiz': sub = `${sig(m.m)} ${m.id} · ${plural(m.q.length, 'questão', 'questões')}`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}">Fazer</button>`; break;
      case 'rev': sub = `${sig(m.m)} ${m.id} · flashcards + quiz`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}" data-rev="${t.k}">Revisar</button>`; break;
      case 'quiz2': sub = `${sig(m.m)} ${m.id} · marca sozinha ao fazer o quiz`; bt = `<button class="btn sm" data-a="quizmod" data-id="${m.id}">Fazer</button>`; break;
      case 'marco': sub = 'Prova real ou simulado completo no mesmo horário'; bt = `<button class="btn sm pri" data-a="tab" data-v="simulados">Simulados</button>`; break;
      case 'diag': sub = 'Sem cronômetro · mostra suas matérias mais fracas'; bt = `<button class="btn sm pri" data-a="simini" data-tipo="diag">Começar</button>`; break;
      case 'sim': sub = 'Condições de prova, com cronômetro'; bt = `<button class="btn sm pri" data-a="simini" data-tipo="completo">Começar</button>`; break;
      case 'simmat': sub = '24 questões · 1h'; bt = `<button class="btn sm" data-a="tab" data-v="simulados">Escolher</button>`; break;
      case 'erros': case 'reforco': sub = plural(nErros(), 'questão', 'questões') + ' no caderno de erros'; bt = `<button class="btn sm" data-a="tab" data-v="treino">Abrir</button>`; break;
      case 'apost': { const st = APS[t.set], e = apEst(t.set); sub = `${sig(st.m)} ${apTipo(st)} · ${e.feitas}/${e.total} corrigidas · ${fh(t.h)}`; bt = `<button class="btn sm" data-a="apset" data-id="${st.id}">Abrir</button>`; break; }
      default: sub = '';
    }
    return `<div class="task ${ok ? 'done' : ''}">${chk}<div class="tt"><b>${t.txt}</b>${sub ? `<div class="small muted">${sub}</div>` : ''}</div>${bt || '<span></span>'}</div>`;
  }
  function blocoMaterias() {
    return ORD.map(s => {
      const p = progMat(s);
      return `<div class="subj b-${s}">${sig(s)}<span>${MATS[s].curto}</span><span class="small muted num">${p.dom}/${p.tot} dominados</span><div class="meter"><i style="width:${(p.dom / p.tot) * 100}%"></i></div></div>`;
    }).join('');
  }

  /* ---------- telas ---------- */
  function vHoje() {
    const p = plano(), hj = HJ(), prova = dnum(S.cfg.prova), d = p.dias.find(x => x.n === hj);
    let h = '';
    const novato = !S.diag && !Object.keys(S.mod).length && !S.sims.length;
    const primeiro = (S.cfg.nome || '').trim().split(/\s+/)[0];
    h += `<div class="stack"><div class="eyebrow">Briefing · ${flonga(hj)}</div><h1 class="h1">${hj >= prova ? (hj === prova ? 'Dia de prova' : 'Prova realizada') : (primeiro ? 'Missão de hoje, ' + esc(primeiro) : 'Missão de hoje')}</h1></div>`;
    h += cartaoContinuar(d);
    if (novato) {
      h += `<section class="card"><h2 class="h2">Comece aqui</h2>
        <ol class="stack" style="margin:0;padding-left:1.2em">
          <li><b>Confira a data da prova e suas horas por dia</b> na aba Plano. O cronograma se ajusta sozinho.</li>
          <li><b>Faça o diagnóstico</b>: 40 questões, sem cronômetro. O plano dá mais tempo às matérias em que você for pior.</li>
          <li><b>Siga o briefing do dia</b>: teoria, depois o quiz do módulo. O módulo só conta como dominado com 80% de acerto no quiz (8 em 10 na maioria das aulas).</li>
          <li><b>Revise os flashcards todo dia</b> e faça o simulado semanal em condições de prova.</li>
        </ol>
        <div class="row"><button class="btn pri" data-a="simini" data-tipo="diag">Fazer o diagnóstico</button><button class="btn" data-a="tab" data-v="plano">Ajustar o plano</button></div></section>`;
    }
    if (S.ativo) h += `<div class="banner acc"><p>Você tem um simulado em andamento.</p><button class="btn sm pri" data-a="go" data-v="sim">Continuar</button></div>`;
    h += avisoContas();
    if (!gravouLocal) h += `<div class="banner warn" role="alert"><p><b>Seu progresso não está sendo salvo neste aparelho</b> (armazenamento cheio ou bloqueado, como na navegação anônima). Para não perder o que estudou, copie o progresso em Plano › Dados.</p><button class="btn sm" data-a="tab" data-v="plano">Abrir o Plano</button></div>`;
    if (recuperar) {
      h += `<div class="banner warn"><p>Um progresso salvo antes neste aparelho não pôde ser aberto por esta versão do app. Guardamos uma cópia: copie e guarde antes de descartar.${msgRec ? ' ' + msgRec : ''}</p><button class="btn sm" data-a="reccopiar">Copiar</button><button class="btn sm" data-a="recdescartar">Descartar</button></div>`;
      if (pedindo === 'rec') h += `<div class="field"><label for="rec-txt">Selecione e copie a cópia do progresso</label><textarea id="rec-txt" class="codigo" readonly rows="4">${esc(recuperar)}</textarea></div>`;
    }
    const prox = CAL.map(x => ({ x, n: dnum(x.d) })).filter(o => o.n >= hj && o.n < prova).sort((a, b) => a.n - b.n)[0];
    if (prox) h += `<div class="banner acc"><p><b>${prox.x.nome}</b> em ${plural(prox.n - hj, 'dia', 'dias')} (${fdata(prox.n)}), antes da sua prova alvo. Se estiver inscrito, use como experiência real de prova.</p></div>`;
    const atr =p.dias.filter(x => x.n < hj).reduce((a, x) => a.concat(x.tar), []).filter(t => (t.tipo === 'teoria' || t.tipo === 'quiz' || t.tipo === 'diag') && !feita(t));
    if (atr.length && hj < prova) h += `<div class="banner warn"><p><b>${plural(atr.length, 'tarefa atrasada', 'tarefas atrasadas')}</b> de dias anteriores. Replaneje para redistribuir o que falta até a prova.</p><button class="btn sm" data-a="replanejar">Replanejar a partir de hoje</button></div>`;
    if (hj === prova) h += `<section class="card"><p style="margin:0">Hoje não estude conteúdo novo. Coma bem, chegue cedo, leia cada enunciado até o fim e marque o gabarito com calma. Boa prova.</p></section>`;
    else if (hj > prova) h += `<section class="card"><p style="margin:0">A data da prova configurada já passou. Ajuste a nova data na aba Plano para gerar outro cronograma.</p><div class="row"><button class="btn" data-a="tab" data-v="plano">Ajustar o plano</button></div></section>`;
    else if (d) {
      const total = d.tar.reduce((a, t) => a + (t.h || 0), 0);
      const tipoTxt = { estudo: 'Dia de estudo', simulado: 'Dia de simulado', revisao: 'Revisão final', vespera: 'Véspera da prova', marco: 'Dia de prova real' }[d.tipo];
      h += `<section class="card"><div class="row between"><h2 class="h2">${tipoTxt}</h2>${total ? `<span class="chip">${fh(total)} planejadas</span>` : ''}</div><div class="tasks">${d.tar.map(linhaTarefa).join('')}</div></section>`;
    } else if (hj < dnum(S.cfg.inicio)) h += `<section class="card"><p style="margin:0">Seu plano começa em ${fdata(dnum(S.cfg.inicio))}. Enquanto isso, faça o diagnóstico ou adiante um módulo.</p></section>`;
    else h += `<section class="card"><p style="margin:0">Hoje é folga no seu plano. Se quiser render mais, revise os flashcards pendentes.</p></section>`;
    const dv = devidos().length, ne = nErros();
    const abaixo = modulosAtivos().filter(m => { const r = S.mod[m.id]; return r && r.best != null && r.best < META; });
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Flashcards</div><div class="row between"><span class="score num">${dv}</span><button class="btn sm" data-a="fcini" ${dv ? '' : 'disabled'}>Revisar</button></div><span class="small muted">${dv ? 'cartões para revisar hoje' : (liberados().length ? 'Nada pendente hoje.' : 'Abra a teoria de um módulo para liberar os cartões dele.')}</span></div>
      <div class="card"><div class="eyebrow">Caderno de erros</div><div class="row between"><span class="score num">${ne}</span><button class="btn sm" data-a="tab" data-v="treino" ${ne ? '' : 'disabled'}>Refazer</button></div><span class="small muted">${abaixo.length ? plural(abaixo.length, 'módulo abaixo de 80%', 'módulos abaixo de 80%') : 'questões para refazer'}</span></div>
    </section>`;
    h += `<section class="card"><div class="row between"><h2 class="h2">Progresso</h2><span class="small muted">meta: 80% em cada aula</span></div><div class="stack">${blocoMaterias()}</div>${ultimoSimResumo()}<div class="sync" id="sync"></div></section>`;
    if (ORD.some(s => certOk(aulasDe(s))) || S.cfg.certs.length) h += cartaoCertificado('geral');
    return h;
  }
  /* Página de entrada do site: aparece para quem chega pela primeira vez. */
  function mostrarInicio() { return window.EEAR_SITE === 'site' && !S.t && !S.cfg.nome; }
  function vInicio() {
    const nQ = modulosAtivos().reduce((a, m) => a + m.q.length, 0), nV = Object.values(VA).reduce((a, v) => a + v.filter(x => x.k !== 'y').length, 0);
    const nOf = PROVAS.reduce((a, p) => a + p.ids.length, 0);
    let h = `<section class="hero"><div class="eyebrow">Missão EEAR · curso preparatório gratuito</div>
      <h1 class="hero-t">Sua aprovação no CFS da EEAR começa aqui</h1>
      <p class="hero-p">Aulas com vídeo, teoria resumida, questões comentadas, flashcards, simulados e as provas oficiais da EEAR com gabarito, num plano de estudos que vai até o dia da prova.</p>
      <form class="hero-f" onsubmit="return false"><div class="field"><label for="ini-nome">Como você quer ser chamado?</label><input id="ini-nome" maxlength="80" autocomplete="name" placeholder="Seu nome"></div><button class="btn pri" data-a="comecar">Começar o curso</button></form>
      <p class="small muted" style="margin:0">Grátis. Funciona no celular e no computador, e dá para instalar como app.</p></section>`;
    h += `<section class="nums">${[[modulosAtivos().length, 'aulas'], [nV, 'videoaulas'], [nQ, 'questões comentadas'], [nOf, 'questões de provas oficiais']].map(x => `<div><b class="num">${x[0]}</b><span>${x[1]}</span></div>`).join('')}</section>`;
    h += `<section class="card"><h2 class="h2">As quatro matérias da prova</h2><div class="stack">${ORD.map(s => `<div class="subj b-${s}">${sig(s)}<span>${MATS[s].nome}</span><span class="small muted num">${aulasDe(s).length} aulas</span></div>`).join('')}</div></section>`;
    h += `<section class="grid2">
      <div class="card"><div class="eyebrow">Como funciona</div><p style="margin:0">Cada aula tem videoaula, resumo, exemplos resolvidos e um quiz de questões comentadas no estilo da EEAR. A aula só conta como concluída com 80% de acerto.</p></div>
      <div class="card"><div class="eyebrow">Plano até a prova</div><p style="margin:0">Você diz a prova alvo e quantas horas tem por dia. O cronograma se monta sozinho, com revisões e simulados semanais.</p></div>
      <div class="card"><div class="eyebrow">Provas oficiais</div><p style="margin:0">Provas anteriores da EEAR na ordem original, com o gabarito oficial e cronômetro de prova.</p></div>
      <div class="card"><div class="eyebrow">Certificado</div><p style="margin:0">Ao concluir todas as aulas de uma matéria, você recebe o certificado de conclusão dela.</p></div>
    </section>`;
    h += cartaoConta();
    h += `<p class="small muted" style="margin:0">Missão EEAR é um curso da INPHAX. Curso livre de estudo, sem vínculo com a EEAR ou com a Força Aérea Brasileira. As videoaulas são vídeos gratuitos do YouTube, com o crédito de cada canal.<br>Contato: ${linkContato} · ${linksLegais}</p>`;
    return h;
  }
  /* Continuar de onde parei: a última aula aberta, ou a próxima do plano de hoje, ou a primeira ainda não concluída. */
  function cartaoContinuar(d) {
    let m = MOD[S.ultAula], de = 'Continuar de onde parei';
    if (m && !moduloAtivo(m)) m = null;
    if (!m || dominado(m)) {
      const t = d && d.tar.find(x => x.mod && MOD[x.mod] && moduloAtivo(MOD[x.mod]) && !dominado(MOD[x.mod]));
      m = t ? MOD[t.mod] : modulosAtivos().find(x => !dominado(x));
      de = S.ultAula ? 'Próxima aula' : 'Sua primeira aula';
    }
    if (!m) return '';
    const ps = passos(m), f = ps.filter(p => p.ok).length, prox = ps.find(p => !p.ok);
    return `<section class="card cont b-${m.m}"><div class="eyebrow">${de}</div>
      <div class="row between"><div class="tt"><b>${MATS[m.m].curto} · Aula ${nAula(m)}: ${esc(m.t)}</b><div class="small muted">${prox ? 'Próximo passo: ' + prox.txt.charAt(0).toLowerCase() + prox.txt.slice(1) : 'Todos os passos feitos'}</div></div><button class="btn pri" data-a="mod" data-id="${m.id}">${f ? 'Continuar' : 'Começar'}</button></div>
      <div class="meter"><i style="width:${f / ps.length * 100}%"></i></div></section>`;
  }
  function ultimoSimResumo() {
    const ss = S.sims.filter(x => x.tipo === 'completo');
    if (!ss.length) return '';
    const u = ss[ss.length - 1], med = media(u);
    return `<div class="row between small"><span class="muted">Último simulado completo (${fdata(dnum(u.d))})</span><b class="num">média ${nota(med)}</b></div>`;
  }
  function media(reg) { const ks = Object.keys(reg.r); return ks.reduce((a, s) => a + reg.r[s][0] / reg.r[s][1], 0) / ks.length; }

  function vPlano() {
    const p = plano(), c = S.cfg, hj = HJ();
    let h = `<div class="stack"><div class="eyebrow">Plano de voo</div><h1 class="h1">Cronograma até a prova</h1></div>`;
    h += `<section class="card"><h2 class="h2">Meta: aprovação até 2027</h2>
      <p class="small" style="margin:0">Até o fim de 2027 há três provas do CFS. Escolha a prova alvo; as anteriores entram no plano como dia de prova real.</p>
      <div class="tasks">${CAL.map(x => { const n = dnum(x.d), alvo = c.alvo === x.id, passou = n < hj; return `<div class="task"><span class="sigla">${x.d.slice(0, 4)}</span><div class="tt"><b>${x.nome} · ${fdata(n)}/${x.d.slice(0, 4)}</b><div class="small muted">${x.st}</div></div><span class="chip ${alvo ? 'acc' : passou ? '' : 'ok'}">${alvo ? 'alvo' : passou ? 'já passou' : n < dnum(c.prova) ? 'no caminho' : 'segunda chance'}</span></div>`; }).join('')}</div>
      <p class="small muted" style="margin:0">Datas de 2027 são estimativas feitas a partir dos editais anteriores. Quando sair o edital, ajuste em "Outra data".</p></section>`;
    h += `<section class="card"><h2 class="h2">Configuração</h2>
      <form class="form" id="cfg" onsubmit="return false">
        <div class="field"><label for="cfg-alvo">Prova alvo</label><select id="cfg-alvo">${CAL.map(x => `<option value="${x.id}" ${c.alvo === x.id ? 'selected' : ''}>${x.nome} (${fdata(dnum(x.d))}/${x.d.slice(0, 4)})</option>`).join('')}<option value="outra" ${c.alvo === 'outra' ? 'selected' : ''}>Outra data</option></select></div>
        <div class="field"><label for="cfg-modalidade">Modalidade</label><select id="cfg-modalidade"><option value="normal" ${c.modalidade !== 'bct' ? 'selected' : ''}>CFS normal · Inglês básico</option><option value="bct" ${c.modalidade === 'bct' ? 'selected' : ''}>CFS BCT · Inglês intermediário</option></select></div>
        <div class="field"><label for="cfg-prova">Data da prova</label><input type="date" id="cfg-prova" value="${esc(c.prova)}" ${c.alvo === 'outra' ? '' : 'disabled'}></div>
        <div class="field"><label for="cfg-inicio">Início do plano</label><input type="date" id="cfg-inicio" value="${esc(c.inicio)}"></div>
        <div class="field"><label for="cfg-horas">Horas por dia</label><select id="cfg-horas">${[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9, 10].map(x => `<option value="${x}" ${Number(c.horas) === x ? 'selected' : ''}>${fh(x)}</option>`).join('')}</select></div>
        <div class="field"><label for="cfg-sim">Simulado semanal</label><select id="cfg-sim">${[0, 1, 2, 3, 4, 5, 6].map(x => `<option value="${x}" ${Number(c.simDia) === x ? 'selected' : ''}>${DIAS_L[x]}</option>`).join('')}</select></div>
        <div class="field"><label for="cfg-tempo">Tempo do simulado completo</label><select id="cfg-tempo">${[180, 210, 240, 260].map(x => `<option value="${x}" ${Number(c.tempoSim) === x ? 'selected' : ''}>${fh(x / 60)}</option>`).join('')}</select></div>
        <div class="field" style="grid-column:1/-1"><span class="lab">Dias de estudo</span><div class="wk">${[1, 2, 3, 4, 5, 6, 0].map(x => `<label><input type="checkbox" id="cfg-d${x}" ${c.dias.indexOf(x) >= 0 ? 'checked' : ''}><span>${DIAS[x]}</span></label>`).join('')}</div></div>
        ${AP.sets.length ? `<label class="chk" style="grid-column:1/-1"><input type="checkbox" id="cfg-apostila" ${apVisivel() ? 'checked' : ''}><span>Uso as apostilas do curso: mostra a aba Apostila e põe os exercícios delas no plano</span></label>` : ''}
      </form>
      <div class="row"><button class="btn" data-a="replanejar">Replanejar a partir de hoje</button><span class="small muted">Recomeça o cronograma hoje e tira os módulos já dominados.</span></div>
    </section>`;
    p.av.forEach(a => { h += `<div class="banner warn"><p>${a}</p></div>`; });
    if (p.res) {
      const r = p.res;
      h += `<section class="card"><div class="grid2">
        <div><div class="eyebrow">Até a prova</div><div class="score num">${Math.max(0, r.prova - hj)}<small> dias</small></div><div class="small muted">prova em ${flonga(r.prova)}</div></div>
        <div><div class="eyebrow">Conteúdo</div><div class="score num">${modulosAtivos().filter(m => !(c.excl || []).includes(m.id)).length}<small> módulos</small></div><div class="small muted">${r.fimC ? 'teoria termina em ' + fdata(r.fimC) : 'tudo já coberto'} · ${plural(r.est, 'dia de estudo', 'dias de estudo')}</div></div>
      </div>
      <div class="tasks small">
        <div class="task"><span class="sigla">C1</span><div class="tt"><b>Ciclo 1: teoria completa</b><div class="muted">todos os módulos, com quiz, revisão de 7 dias${apVisivel() ? ' e os exercícios de aula da apostila (em sala, units e o Português)' : ''}</div></div><span class="num">${r.fimCiclo[0] ? 'até ' + fdata(r.fimCiclo[0]) : '—'}</span></div>
        <div class="task"><span class="sigla">C2</span><div class="tt"><b>Ciclo 2: revisão ativa</b><div class="muted">todos os módulos de novo, do que mais cai para o que menos cai${apVisivel() ? ', com os exercícios para casa e as provas reais da apostila' : ''}</div></div><span class="num">${r.fimCiclo[1] ? 'até ' + fdata(r.fimCiclo[1]) : r.fimCiclo[0] ? 'parcial' : 'sem tempo'}</span></div>
        <div class="task"><span class="sigla">C3</span><div class="tt"><b>Ciclo 3: o que mais cai</b><div class="muted">módulos de incidência média e alta</div></div><span class="num">${r.fimCiclo[2] ? 'até ' + fdata(r.fimCiclo[2]) : r.fimCiclo[1] ? 'parcial' : 'sem tempo'}</span></div>
      </div></section>`;
    }
    h += `<section class="card"><h2 class="h2">Como a prova funciona</h2>
      <ul class="stack small" style="margin:0;padding-left:1.2em">
        <li><b>96 questões objetivas</b>, 24 de cada matéria (Português, Inglês, Matemática e Física), com 4 alternativas.</li>
        <li><b>Eliminação</b>: nota abaixo de 5,0 em qualquer matéria ou média final abaixo de 5,0 (nota de 0 a 10). A classificação é pela média, então a meta do curso é 8,0: cerca de 19 acertos em 24 por matéria.</li>
        <li><b>Questões oficiais</b>: as provas anteriores da EEAR, com gabarito oficial, ficam na aba Simulados e na aba Provas de cada módulo.</li>
        <li style="overflow-wrap:break-word"><b>Datas</b>: confirme sempre no edital oficial, em ingresso.eear.fab.mil.br.</li>
        <li><b>Controle de Tráfego Aéreo (BCT)</b>: o inglês costuma ser cobrado em nível intermediário. Se for sua opção, dê peso extra a Inglês.</li>
      </ul></section>`;
    if (p.dias.length) {
      h += `<div class="days">`;
      let semana = -1, ns = 0;
      p.dias.forEach(d => {
        const ws = d.n - ((wday(d.n) + 6) % 7);
        if (ws !== semana) { semana = ws; ns++; h += `<div class="week">Semana ${ns} · ${fdata(ws)} a ${fdata(ws + 6)}</div>`; }
        const tipoTxt = { estudo: 'estudo', simulado: 'simulado', revisao: 'revisão', vespera: 'véspera', marco: 'prova' }[d.tipo];
        h += `<div class="day ${d.n === hj ? 'today' : ''} ${d.n < hj ? 'past' : ''}" ${d.n === hj ? 'id="dia-hoje"' : ''}><div class="dd"><b>${fdata(d.n)}</b>${DIAS[wday(d.n)]}<br>${tipoTxt}</div><ul>${d.tar.map(t => `<li class="${feita(t) ? 'done' : ''}">${t.mod ? sig(MOD[t.mod].m) + ' ' : ''}${t.txt}${t.h && (t.tipo === 'teoria' || t.tipo === 'apost') ? ` <span class="muted small">(${fh(t.h)})</span>` : ''}</li>`).join('')}</ul></div>`;
      });
      h += `</div>`;
    }
    h += cartaoConta();
    h += `<section class="card"><h2 class="h2">Dados</h2><p class="small muted" style="margin:0">Zerar apaga notas, flashcards, simulados, o caderno de erros e os certificados conquistados. A configuração do plano é mantida.</p>
      ${pedindo === 'zerar' ? `<div class="confirm"><p>Apagar todo o progresso? Isso não pode ser desfeito.</p><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="zerarok">Apagar</button></div>` : `<div class="row"><button class="btn" data-a="zerar">Zerar progresso</button></div>`}
      <div class="aphead">Levar o progresso para outro aparelho</div>
      <p class="small muted" style="margin:0">Copie o código do progresso aqui e cole no outro aparelho, em Plano › Dados › Colar progresso. Vale entre o site, o app e o link do curso.</p>
      <div class="row"><button class="btn" data-a="expcopiar">Copiar meu progresso</button><button class="btn" data-a="impabrir">Colar progresso</button></div>
      ${pedindo === 'exp' ? `<div class="field"><label for="exp-txt">Selecione e copie o código</label><textarea id="exp-txt" class="codigo" readonly rows="4">${esc(JSON.stringify(S))}</textarea></div>` : ''}
      ${pedindo === 'imp' ? `<div class="field"><label for="imp-txt">Cole aqui o código do outro aparelho</label><textarea id="imp-txt" class="codigo" rows="4"></textarea></div><div class="confirm"><p>O estudo do código será unido ao deste aparelho. As preferências do código serão carregadas.</p><label><input type="checkbox" id="imp-substituir"> Substituir o estudo deste aparelho pelo código, mantendo os certificados conquistados</label><button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="impok">Carregar progresso</button></div>` : ''}
      ${blocoDados()}
      ${msgDados ? `<p class="small" role="status" style="margin:0">${msgDados}</p>` : ''}
      <div class="sync" id="sync"></div></section>`;
    h += cartaoInstalar();
    h += cartaoSobre();
    return h;
  }
  /* Instalação como app: só no site (no app de Android e no link do curso ela não se aplica). */
  let instalar = null, msgDados = '', msgRec = '';
  window.addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); instalar = ev; if (V.v === 'plano') render(); });
  function cartaoInstalar() {
    if (window.EEAR_SITE !== 'site') return '';
    const sozinho = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    let h = '<section class="card"><h2 class="h2">Instalar no celular</h2>';
    if (sozinho) h += '<p style="margin:0">O app está instalado neste aparelho e funciona sem internet.</p>';
    else if (instalar) h += '<p style="margin:0">Instale o curso como app: ele ganha ícone na tela inicial e funciona sem internet.</p><div class="row"><button class="btn pri" data-a="instalar">Instalar o app</button></div>';
    else if (ios) h += '<p style="margin:0">No iPhone ou iPad, abra este site no Safari, toque em Compartilhar e depois em <b>Adicionar à Tela de Início</b>. O curso ganha ícone e funciona sem internet.</p>';
    else h += '<p style="margin:0">No Android, abra o menu do Chrome (⋮) e toque em <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>. O curso ganha ícone e funciona sem internet.</p>';
    if (!sozinho && !ios && window.EEAR_APK) h += `<p class="small muted" style="margin:0">Prefere o app de Android? <a href="${window.EEAR_APK}">Baixar o APK</a> e abrir o arquivo no celular.</p>`;
    h += '<div class="row"><button class="btn" data-a="compartilhar">Indicar o curso para alguém</button></div>';
    return h + '</section>';
  }

  function vMaterias() {
    const s = V.s && MATS[V.s] ? V.s : (V.s = ORD[0]);
    let h = `<div class="stack"><div class="eyebrow">Conteúdo programático</div><h1 class="h1">Matérias</h1></div>`;
    h += `<div class="seg" role="group" aria-label="Matéria">${ORD.map(x => `<button data-a="mat" data-s="${x}" aria-pressed="${x === s}">${MATS[x].curto}</button>`).join('')}</div>`;
    const p = progMat(s), ms = aulasDe(s), atual = ms.find(m => !dominado(m));
    const comecou = ms.some(m => S.mod[m.id] || S.aula[m.id]);
    h += `<section class="card b-${s}"><div class="row between"><h2 class="h2">${MATS[s].nome}</h2><span class="small muted num">${p.dom} de ${p.tot} aulas concluídas</span></div><div class="meter"><i style="width:${(p.dom / p.tot) * 100}%"></i></div>
      ${atual ? `<div class="row"><button class="btn pri" data-a="mod" data-id="${atual.id}">${comecou ? 'Continuar' : 'Começar'}: Aula ${nAula(atual)} · ${esc(atual.t)}</button></div>` : ''}
      <ol class="trilha">${ms.map((m, i) => {
        const st = estMod(m.id), ps = passos(m), f = ps.filter(x => x.ok).length, ok = dominado(m);
        return `<li><button class="trow ${ok ? 'ok' : m === atual ? 'cur' : ''}" data-a="mod" data-id="${m.id}"><span class="tn" aria-hidden="true">${ok ? ICON_OK : i + 1}</span><span class="tb"><span class="mt">${m.t}</span><span class="peso" title="Incidência estimada">Aula ${i + 1} · ${bolinhas(m.peso)} · ${fh(m.h)}${(VA[m.id] || []).length ? ' · videoaula' : ''}</span><span class="tprog" title="${f} de ${ps.length} passos"><i style="width:${f / ps.length * 100}%"></i></span></span><span class="chip ${st.k}">${st.txt}</span></button></li>`;
      }).join('')}</ol>
      <p class="small muted" style="margin:0">● incidência estimada na prova (●●● = cai muito). A barrinha mostra os passos feitos: vídeo, teoria, exemplos, quiz e flashcards.</p></section>`;
    h += cartaoCertificado(s);
    h += `<section class="card"><h2 class="h2">Mais vídeos de ${MATS[s].curto}</h2><p class="small muted" style="margin:0">Canais gratuitos para complementar as aulas. Os links abrem a busca do YouTube em outra aba.</p>
      <div class="stack">${CANAIS[s].map(cn => `<a class="vlink" href="${yt(cn)}" target="_blank" rel="noopener">${cn}</a>`).join('')}<a class="vlink" href="${yt('EEAR ' + MATS[s].curto + ' questões resolvidas')}" target="_blank" rel="noopener">Questões de ${MATS[s].curto} da EEAR resolvidas</a></div></section>`;
    return h;
  }

  /* ---------- certificado de conclusão (por matéria e do curso completo) ---------- */
  const certOk = ms => ms.every(m => dominado(m));
  function codigoCert(txt) {
    const fnv = semente => { let x = semente >>> 0; for (let i = 0; i < txt.length; i++) { x ^= txt.charCodeAt(i); x = Math.imul(x, 16777619) >>> 0; } return x; };
    const parte = x => (x % 1679616).toString(36).toUpperCase().padStart(4, '0');
    return parte(fnv(2166136261)) + '-' + parte(fnv(3735928559));
  }
  /* Certificados registrados de uma matéria (com a posição em S.cfg.certs), do mais recente para o mais antigo. */
  const certsDe = s => S.cfg.certs.map((r, i) => Object.assign({ i }, r)).filter(r => r.s === s).sort((a, b) => b.d.localeCompare(a.d) || b.ids.length - a.ids.length);
  const MODAL_NOME = { normal: 'CFS normal', bct: 'CFS BCT' };
  /* O registro do certificado que as aulas atuais liberam, se elas estiverem todas concluídas. */
  function certAtual(s) {
    const ms = s === 'geral' ? modulosAtivos() : aulasDe(s);
    if (!ms.length || !certOk(ms)) return null;
    const k = certChave({ s, mod: certModal(s) ? (S.cfg.modalidade || 'normal') : null, ids: ms.map(m => m.id) });
    if (!S.cfg.certs.some(r => certChave(r) === k)) registrarCerts(S);  // só na memória; vai para o disco no próximo estudo
    const i = S.cfg.certs.findIndex(r => certChave(r) === k);
    return i < 0 ? null : Object.assign({ i }, S.cfg.certs[i]);
  }
  function cartaoCertificado(s) {
    const ms = s === 'geral' ? modulosAtivos() : aulasDe(s), ok = certOk(ms), feitas = ms.filter(dominado).length;
    const nome = s === 'geral' ? 'do curso completo' : 'de ' + MATS[s].curto, atual = ok ? certAtual(s) : null;
    const regs = certsDe(s), outros = regs.filter(r => !atual || r.i !== atual.i);
    let h = `<section class="card cert-cta"><div class="row between"><h2 class="h2">Certificado ${nome}</h2><span class="chip ${ok || regs.length ? 'ok' : ''}">${ok ? 'liberado' : regs.length ? 'conquistado' : feitas + '/' + ms.length}</span></div>
      <p class="small" style="margin:0">${ok ? `Você concluiu ${s === 'geral' ? 'todas as aulas das quatro matérias' : 'todas as aulas desta matéria'} com 80% ou mais no quiz.` : `${regs.length ? 'O certificado que você já conquistou continua valendo e pode ser aberto e impresso abaixo. Para o certificado com as aulas atuais, conclua' : 'Conclua'} as ${ms.length} aulas ${s === 'geral' ? 'das quatro matérias ' : ''}com 80% ou mais no quiz${regs.length ? '' : ' para liberar o certificado'}. Faltam ${ms.length - feitas}.`}</p>
      ${ok ? `<div class="row"><button class="btn pri" data-a="cert" data-s="${s}">Ver o certificado</button></div>` : ''}`;
    if (outros.length) h += `<div class="stack">${outros.map(r => `<button class="btn" data-a="cert" data-s="${s}" data-i="${r.i}">Certificado de ${dataLonga(r.d)} · ${plural(r.ids.length, 'aula', 'aulas')}${r.mod ? ' · ' + MODAL_NOME[r.mod] : ''}</button>`).join('')}</div>`;
    return h + '</section>';
  }
  /* X da INPHAX, em vetor */
  const MARCA_X = '<svg viewBox="0 0 512 512" aria-hidden="true"><rect width="512" height="512" rx="40" fill="#0C0C0C"/><g fill="#EFEAE0"><path d="M88 82H168L424 430H344Z"/><path d="M344 82H424L338 200H258Z"/><path d="M190 291H270L168 430H88Z"/></g></svg>';
  const MARCA = '<span class="marca" role="img" aria-label="INPHAX"></span>';
  /* contato e páginas legais (privacidade.html e termos.html saem de web/legal/) */
  const CONTATO = 'suporteinphax@gmail.com';
  const linkContato = `<a href="mailto:${CONTATO}">${CONTATO}</a>`;
  const linksLegais = '<a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a> · <a href="termos.html" target="_blank" rel="noopener">Termos de uso</a>';
  function cartaoSobre() {
    return `<section class="card"><h2 class="h2">Sobre e contato</h2><p style="margin:0">Missão EEAR é um curso da INPHAX. Dúvidas, erros em alguma questão ou sugestões: ${linkContato}.</p><p class="small muted" style="margin:0">${linksLegais}. Curso livre de estudo, sem vínculo com a EEAR ou com a Força Aérea Brasileira.</p></section>`;
  }
  function vCert() {
    const s = V.s, geral = s === 'geral';
    let h = `<button class="btn ghost back no-print" ${geral ? 'data-a="tab" data-v="hoje"' : `data-a="mat" data-s="${s}"`}>← Voltar</button>`;
    /* Mostra um certificado registrado: o escolhido na lista (V.i), o das aulas atuais ou o mais recente conquistado. */
    let r = null;
    if (CERTS.includes(s)) {
      const x = V.i != null ? S.cfg.certs[V.i] : null;
      r = x && x.s === s ? x : certAtual(s) || certsDe(s)[0] || null;
    }
    if (!r) return h + '<p class="empty">Este certificado é liberado quando todas as aulas tiverem 80% ou mais no quiz.</p>';
    if (!S.cfg.nome || V.editNome) {
      return h + `<section class="card no-print"><h2 class="h2">Seu nome no certificado</h2><div class="field"><label for="cert-nome">Nome completo</label><input id="cert-nome" maxlength="80" value="${esc(S.cfg.nome || '')}" autocomplete="name"></div><div class="row"><button class="btn pri" data-a="certnome">Gerar o certificado</button></div></section>`;
    }
    const ms = r.ids, horas = r.h, data = r.d;
    const cod = r.c || codigoCert([S.cfg.nome, s, data].join('|'));
    h += `<article class="cert" id="cert"><div class="cert-in">
      <div class="cert-marca">${MARCA_X}${MARCA}</div>
      <div class="cert-por">Missão EEAR</div>
      <div class="eyebrow">Certificado de conclusão</div>
      <p class="cert-cert">Certificamos que</p>
      <h1 class="cert-nome">${esc(S.cfg.nome)}</h1>
      <p class="cert-txt">concluiu ${geral ? 'o <b>curso preparatório completo para o CFS da EEAR</b>, nas quatro matérias da prova (Língua Portuguesa, Língua Inglesa, Matemática e Física)' : `a matéria <b>${MATS[s].nome}</b> do curso preparatório para o CFS da EEAR`}, com ${ms.length} aulas e nota de pelo menos 80% no quiz de cada uma.</p>
      <div class="cert-dados"><div><span class="lab">Carga horária</span><b>${horas} horas</b></div><div><span class="lab">Concluído em</span><b>${dataLonga(data)}</b></div><div><span class="lab">Código</span><b class="num">${esc(cod)}</b></div></div>
      <div class="cert-ass"><span class="marca" role="img" aria-label="INPHAX"></span><span>emitido pela INPHAX</span></div>
      <p class="cert-nota">Curso livre de estudo, sem vínculo com a EEAR ou com a Força Aérea Brasileira. Não tem validade acadêmica.</p>
    </div></article>
    <div class="row no-print"><button class="btn pri" data-a="imprimir">Imprimir ou salvar em PDF</button><button class="btn" data-a="certnomeedit">Corrigir o nome</button></div>`;
    return h;
  }


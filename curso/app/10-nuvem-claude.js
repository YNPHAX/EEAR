  /* ---------- gravação no link do curso no Claude (nuvem sem transação) ----------
     A nuvem do Claude grava o documento inteiro, por último quem grava, sem transação. Dois aparelhos que liam juntos
     e gravavam em seguida perdiam o que o outro gravou (4 de 8 marcações simultâneas no teste), e pior: a base deste
     aparelho passava a ter o que a nuvem perdeu, e a próxima união tratava isso como apagado no outro aparelho.
     - Com a trava da nuvem (doc.acquire, cooperativa e de curta duração): ler, unir e gravar só com a trava; depois,
       ler de novo para conferir. A base só é registrada se a nuvem tem exatamente o que foi gravado e a trava ainda
       valia; senão, a união é refeita em seguida, com a base anterior (que não tem nada que a nuvem possa ter perdido).
     - Sem a trava (versão antiga da API, ou recusada): grava, mas apaga a base. A união sem base nunca trata ausência
       como apagamento, então nada se perde; o preço é que desmarcar algo pode voltar, e o aluno é avisado. Depois de
       gravar, confere a nuvem de novo pouco depois.
     Funções declaradas: conectar() só chega aqui depois de esperar a nuvem, com o arquivo inteiro já carregado. */
  /* A trava não pode ser liberada, só vence. Um nome novo a cada uso (em vez de renovar a mesma) e uma trava curta fazem
     os aparelhos se alternarem: quem grava sempre não deixa o outro esperando para sempre. */
  const TRAVA_MS = 5000;
  function holderNovo() { return 'aba-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36); }
  /* A trava pode criar o documento vazio, ou com campos dela: sem v e sem nenhum campo do progresso, é como se não existisse. */
  function lerDocClaude(snap) {
    const o = snap && snap.exists ? snap.data() : null;
    if (!o || typeof o !== 'object') return o || null;
    return !('v' in o) && !['t', 'cfg', 'mod', 'fc', 'sims'].some(k => k in o) ? null : o;
  }
  /* Comparação sem depender da ordem das chaves (a nuvem pode devolver o documento em outra ordem). */
  function canonico(x) { return Array.isArray(x) ? x.map(canonico) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => { o[k] = canonico(x[k]); return o; }, {}) : x; }
  function mesmoDoc(a, b) { return JSON.stringify(canonico(a)) === JSON.stringify(canonico(b)); }
  function ocupada(espera) { const e = new Error('nuvem ocupada por outro aparelho'); e.code = 'unavailable'; e.espera = espera; return e; }
  /* Devolve 'ok' (pode registrar a base), 'conferir' (gravou, mas outro gravou junto: refazer a união) ou 'semtrava'.
     Só quem tem a trava grava; se ela vencer no meio, é renovada com o mesmo nome antes de gravar (concedida só se
     ninguém a pegou nesse intervalo, e então ninguém gravou). A base só vale se a conferência terminou com a trava. */
  async function lerUnirGravar(ref, planejar) {
    const nome = holderNovo();
    const travar = async () => {
      const t = await ref.acquire({ holder: nome, ttlMs: TRAVA_MS });
      if (!t || !t.acquired) throw ocupada((Date.parse(t && t.expiresAt) || Date.now()) - Date.now());
      return Math.min(Date.parse(t.expiresAt) || Infinity, Date.now() + TRAVA_MS) - 1000; // margem para a resposta chegar
    };
    let fim = 0;
    if (typeof ref.acquire === 'function' && !nuvem.semTrava) {
      try { fim = await travar(); }
      catch (e) { if (e && e.code === 'unavailable') throw e; nuvem.semTrava = true; } // trava recusada: segue sem ela
    } else nuvem.semTrava = true;
    if (!fim) { const novo = planejar(lerDocClaude(await ref.get())); if (novo) await ref.set(novo); return novo ? 'semtrava' : 'semtrava-igual'; }
    const novo = planejar(lerDocClaude(await ref.get()));
    if (!novo) return 'ok';
    if (Date.now() > fim) fim = await travar();
    await ref.set(novo);
    const visto = lerDocClaude(await ref.get());
    return mesmoDoc(visto, novo) && Date.now() <= fim ? 'ok' : 'conferir';
  }
  /* Depois de uma união aplicada: registra a base só quando é seguro, e agenda a conferência quando não é. */
  function depoisDeGravar(modo, p) {
    if (modo === 'ok') { gravarBase(p.u, p.ep, p.id); return; }
    if (modo === 'conferir') { setTimeout(gravar, 2000 + Math.random() * 2000); return; }
    try { localStorage.removeItem(chave(BASE_K)); } catch (e) { /* sem armazenamento */ } // sem trava: união sem base
    if (modo === 'semtrava') setTimeout(gravar, 5000 + Math.random() * 2000);
  }

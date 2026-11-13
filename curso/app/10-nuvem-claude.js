  /* O backend legado (get/set/acquire) não possui transação, CAS ou fencing de escritores no servidor.
     Um set antigo pode chegar DEPOIS de get conferir a gravação: acquire é apenas cooperativo e expira.
     Nenhuma espera, assinatura do cliente ou releitura prova que esse snapshot permanecerá protegido.
     Bloqueio até existir um contrato servidor validado: não escreve, não migra snapshots automaticamente,
     não confirma remotamente e não autoriza apagar o checkpoint por uma BASE antiga. Firebase usa transação
     e envelope v2 monotônico; este bloqueio não altera sua implementação. Proposta: auditoria/sincronizacao-legada.md. */
  function bloquearNuvemLegada() {
    clearTimeout(nuvem.tRetry); clearTimeout(tSave);
    nuvem.legado = true; nuvem.ref = null; nuvem.refPausada = null; nuvem.on = false;
    nuvem.pendente = true; nuvem.semRede = false; nuvem.lida = false;
    syncInfo();
  }
  async function lerUnirGravar() {
    bloquearNuvemLegada();
    const e = new Error('Transporte sem proteção contra escritores legados bloqueado.'); e.code = 'legacy-unsafe'; throw e;
  }
  /* Comparação sem depender da ordem das chaves (a nuvem pode devolver o documento em outra ordem). */
  function canonico(x) { return Array.isArray(x) ? x.map(canonico) : x && typeof x === 'object' ? Object.keys(x).sort().reduce((o, k) => { o[k] = canonico(x[k]); return o; }, {}) : x; }
  /* Exclusão legada também fica bloqueada em exclusaoLiberada; helpers mantidos para ler esse formato antigo. */
  const TRAVA_MS = 5000;
  function holderNovo() { return 'aba-' + Math.random().toString(36).slice(2) + '-' + Date.now().toString(36); }
  function ocupada(espera) { const e = new Error('nuvem ocupada por outro aparelho'); e.code = 'unavailable'; e.espera = espera; return e; }
  function depoisDeGravar(modo, p) {
    if (modo === 'ok' && !nuvem.legado) gravarBase(p.u, p.ep, p.id);
  }

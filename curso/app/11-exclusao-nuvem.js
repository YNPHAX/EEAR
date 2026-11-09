  /* ---------- apagar o progresso da nuvem do curso no Claude, a pedido do próprio aluno ----------
     A API do curso no Claude grava o documento inteiro e não tem gravação condicional; as regras do curso só deixam
     cada aluno gravar progresso/<o próprio id>. Por isso:
     - a exclusão grava uma marca (v: 2, apagado: data, sem nenhum progresso) com a trava e confere a gravação. A marca
       tem v: 2 para que nenhuma versão a adote como progresso: a versão do PR #22 a trata como "versão mais nova" e não
       grava por cima; a versão antiga (sem união) não a lê como progresso e não apaga a cópia local dela;
     - outro aparelho com esta versão, ao encontrar a marca, para de sincronizar e mantém a cópia local; só volta a
       enviar se o aluno pedir ("Enviar de novo para a nuvem");
     - este aparelho guarda que apagou (missao-eear-v1-apagado@conta). Se depois encontrar progresso na nuvem, foi uma
       versão antiga, aberta em outro aparelho, que regravou às cegas: avisa e oferece apagar de novo, sem unir;
     - limite documentado: uma aba antiga já aberta no momento da exclusão regrava a cada estudo, e a API não tem como
       impedir. Este aparelho detecta e avisa; não há garantia contra isso enquanto houver abas antigas abertas. */
  function chaveApagado() { return chave('missao-eear-v1-apagado'); }
  function apagadoAqui() { try { return !!localStorage.getItem(chaveApagado()); } catch (e) { return false; } }
  function podeApagarNuvem() { return identidade.indexOf('claude:') === 0 && !!(nuvem.ref || nuvem.refPausada); }
  /* BLOQUEADA (verificação final, 2026-11-09): com o build real da versão publicada, uma aba antiga aberta antes da
     exclusão recolocou o progresso na nuvem. Fica desligada até o caminho novo com o antigo trancado nas regras
     (auditoria/verificacao-final.md, seção 5) ser implementado e validado no serviço real. Só os testes a ligam.
     O reconhecimento da marca de exclusão continua ativo. */
  function exclusaoLiberada() { return window.EEAR_EXCLUSAO_NUVEM === true; }
  /* A nuvem tem a marca de exclusão, ou regravaram depois de este aparelho apagar: nada é unido nem gravado. */
  function exclusaoNaNuvem(o) {
    if (o && typeof o === 'object' && o.apagado) return nuvem.reenviar ? { ignorar: true } : { apagado: String(o.apagado) };
    if (o && apagadoAqui() && !nuvem.reenviar) return { reapareceu: true };
    return null;
  }
  function pausarPorExclusao(ref, p) {
    nuvem.ref = null; nuvem.on = false; nuvem.refPausada = ref;
    nuvem.apagado = p.apagado || ''; nuvem.reapareceu = !!p.reapareceu;
  }
  async function apagarNuvem() {
    const ref = nuvem.ref || nuvem.refPausada, id = identidade;
    if (!exclusaoLiberada()) return;
    if (!ref || contaUI.ocupado || id.indexOf('claude:') !== 0) return;
    contaUI.ocupado = true; clearTimeout(tSave); nuvem.ref = null; // nada mais desta conta é enviado daqui
    for (let i = 0; nuvem.busy && i < 40; i++) await new Promise(r => setTimeout(r, 250)); // espera a gravação em curso
    const marca = { v: 2, apagado: new Date().toISOString(), t: Number.MAX_SAFE_INTEGER };
    let passo = 'gravar';
    try {
      if (typeof ref.acquire === 'function') { // trava ocupada (outro aparelho, ou este mesmo ao abrir): espera ela vencer
        for (let i = 0; ; i++) {
          let tr = null;
          try { tr = await ref.acquire({ holder: holderNovo(), ttlMs: TRAVA_MS }); } catch (e) { if (e && e.code === 'unavailable') throw e; }
          if (!tr || tr.acquired) break;
          if (i === 2) throw ocupada(0);
          await new Promise(r => setTimeout(r, Math.max(0, (Date.parse(tr.expiresAt) || Date.now()) - Date.now()) + 300));
        }
      }
      await ref.set(marca);
      passo = 'conferir';
      const snap = await ref.get(), o = snap && snap.exists ? snap.data() : null;
      if (!o || o.apagado !== marca.apagado) throw new Error('outra gravação depois da exclusão');
      if (identidade === id) {
        try { localStorage.setItem(chaveApagado(), JSON.stringify({ quando: marca.apagado })); localStorage.removeItem(chave(BASE_K)); } catch (e) { /* sem armazenamento */ }
        pausarPorExclusao(ref, { apagado: marca.apagado });
        msgDados = 'O progresso desta conta foi apagado da nuvem do curso. Este aparelho ainda tem uma cópia; para apagá-la também, use "Apagar os dados deste aparelho".';
        pedindo = null;
      }
    } catch (e) {
      if (passo === 'gravar') { nuvem.ref = ref; msgDados = 'Não foi possível apagar agora (sem conexão, ou outro aparelho gravando). Nada foi apagado da nuvem.'; }
      else { nuvem.refPausada = ref; msgDados = 'O pedido foi enviado, mas não deu para confirmar que a nuvem foi apagada (outro aparelho pode ter gravado ao mesmo tempo). Tente de novo.'; }
    }
    contaUI.ocupado = false; render();
  }
  /* Volta a enviar este aparelho para a nuvem, a pedido do aluno (desfaz a exclusão com o que este aparelho tem). */
  async function reenviarNuvem() {
    const ref = nuvem.refPausada;
    if (!ref || contaUI.ocupado) return;
    try { localStorage.removeItem(chaveApagado()); } catch (e) { /* sem armazenamento */ }
    nuvem.reenviar = true; nuvem.apagado = ''; nuvem.reapareceu = false; msgDados = '';
    await sincronizar(ref, nuvem.conta); // o pedido vale até uma gravação dar certo (conciliar o desliga), mesmo com a trava ocupada
    render();
  }
  function blocoNuvemClaude() {
    if (!podeApagarNuvem()) return '';
    const data = q => { const d = new Date(q); return isNaN(d) ? '' : ' em ' + d.toLocaleDateString('pt-BR'); };
    if (pedindo === 'nuvemapagar' && exclusaoLiberada()) {
      return `<div class="confirm"><p><b>Apagar meu progresso da nuvem do curso</b> apaga a cópia guardada na sua conta. Este aparelho mantém a cópia dele. Feche o curso nos outros aparelhos antes: uma versão antiga aberta pode gravar de novo.</p>
        <div class="field"><label for="nuvem-confirma">Digite APAGAR para confirmar</label><input id="nuvem-confirma" autocomplete="off"></div>
        <button class="btn sm" data-a="cancelar">Cancelar</button><button class="btn sm pri" data-a="nuvemapagarok">Apagar da nuvem</button></div>`;
    }
    if (nuvem.apagado || nuvem.reapareceu) {
      return `<div class="confirm"><p>${nuvem.apagado ? `O progresso desta conta foi apagado da nuvem do curso${data(nuvem.apagado)}. O que você estudar aqui fica só neste aparelho.` : 'Depois que você apagou o progresso da nuvem, uma versão antiga do curso, aberta em outro aparelho, gravou de novo. Feche ou recarregue o curso nos outros aparelhos e apague de novo.'}</p>${nuvem.reapareceu && exclusaoLiberada() ? '<button class="btn sm" data-a="nuvemapagar">Apagar de novo da nuvem</button>' : ''}<button class="btn sm" data-a="nuvemreenviar">Enviar de novo para a nuvem</button></div>`;
    }
    return exclusaoLiberada() ? '<div class="row"><button class="btn ghost" data-a="nuvemapagar">Apagar meu progresso da nuvem do curso</button></div>' : '';
  }
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-a]');
    if (!b) return;
    switch (b.dataset.a) {
      case 'nuvemapagar': if (!exclusaoLiberada()) break; msgDados = ''; pedindo = 'nuvemapagar'; render(); break;
      case 'nuvemapagarok': {
        const t = ((document.getElementById('nuvem-confirma') || {}).value || '').trim();
        if (t !== 'APAGAR') { msgDados = 'Digite APAGAR para confirmar. Nada foi apagado.'; render(); break; }
        apagarNuvem(); break;
      }
      case 'nuvemreenviar': reenviarNuvem(); break;
      default: break;
    }
  });

  /* ---------- caminho novo da nuvem do Claude (progresso2) e migração do caminho antigo ----------
     Versões antigas do app (a publicada no Claude) gravam o progresso inteiro por cima de progresso/<id>, às cegas, a
     cada estudo. O que existia só na nuvem podia ser coberto por elas, e nenhum aparelho novo tinha como recuperar.
     Barreira: esta versão sincroniza só em progresso2/<id>, que as versões antigas não conhecem, e as regras do curso,
     publicadas junto com ela, deixam progresso/<id> só para leitura dos alunos (auditoria/integracao-segura.md, seção 4):
     uma aba antiga aberta tem a gravação recusada e para de sincronizar, com o estudo guardado no aparelho dela.
     Migração: depois de sincronizar o caminho novo, o documento antigo é lido e unido ao progresso deste aparelho SEM
     base (nada se apaga). O resumo do documento antigo fica em cfg.migV1 (vai para a nuvem com o resto): se ele não
     mudar, não é unido de novo (desmarcações feitas depois não voltam); se mudar (gravação de uma aba antiga antes de
     as regras valerem, ou um período de reversão com a versão antiga no ar), é unido mais uma vez. O caminho antigo
     nunca é gravado por esta versão. Funções declaradas: conectar() as chama depois que o arquivo inteiro carregou. */
  function caminhoNuvem(id) { return 'progresso2/' + id; }
  function caminhoAntigo(id) { return 'progresso/' + id; }
  async function migrarCaminhoAntigo(refAntigo, conta) {
    if (nuvem.legado) return; // bloqueio real do transporte inseguro; nenhum snapshot remoto é importado automaticamente
    /* Espera a primeira leitura do caminho novo (para conhecer o cfg.migV1 da nuvem), até 60 s. */
    for (let i = 0; i < 120 && !nuvem.lida && nuvem.ref && nuvem.conta === conta; i++) await new Promise(r => setTimeout(r, 500));
    if (!nuvem.lida) return; // sem conseguir ler o caminho novo, não migra agora (tenta ao abrir de novo)
    if (!refAntigo || nuvem.conta !== conta || !nuvem.ref || nuvem.apagado || nuvem.reapareceu || nuvem.futura) return;
    let o = null;
    try { const s = await refAntigo.get(); o = s && s.exists ? s.data() : null; } catch (e) { return; } // tenta de novo ao abrir de novo
    if (!o || typeof o !== 'object' || o.v !== 1 || nuvem.conta !== conta) return; // nada a migrar (ou uma marca de exclusão)
    const h = resumoDoc(o);
    if (S.cfg.migV1 && S.cfg.migV1.h === h) return; // já unido
    const r = unirProgresso(null, mesclar(JSON.parse(JSON.stringify(S))), mesclar(semAssinatura(JSON.parse(JSON.stringify(o)))));
    if (r.perdido) { recuperar = JSON.stringify(r.perdido); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
    if (nuvem.conta !== conta) return;
    S = r.st; S.cfg.migV1 = { h, em: Date.now() };
    salvar(); // a próxima gravação leva a união para progresso2
    render();
  }

  /* Importação explícita de arquivo/código antigo, independente do transporte de sincronização.
     Identidade/e-mail do backup nunca escolhem uma conta de destino. O progresso só entra na identidade atual. */
  function lerImportacao(texto) {
    const o = JSON.parse(String(texto || '').trim());
    return o && o.app === 'Missão EEAR' && o.progresso ? o.progresso : o;
  }
  function importarCodigo(texto, substituir) {
    let o = null;
    try { o = lerImportacao(texto); } catch (e) { o = null; }
    if (!o || o.v !== 1) { msgDados = 'Esse código não é um progresso do Missão EEAR. Copie de novo no outro aparelho.'; render(); return; }
    // Importar acrescenta estudo; ausência no código antigo não é uma ordem de apagar progresso novo.
    const local = opCopiar(S), colado = mesclar(o);
    if (colado.cfg._ops && !opValida(colado.cfg._ops)) { quarentenar(JSON.stringify(o), identidade, 'importacao'); msgDados = 'O código usa operações incompatíveis ou ilegíveis. A cópia foi preservada para recuperação; nenhum progresso foi substituído.'; render(); return; }
    const conhecida = opValida(colado.cfg._ops) && mesmoConteudo(opPlano(colado), opPlano(opEstado(colado.cfg._ops)));
    const importado = conhecida ? opMeta(colado) : opVazio();
    const combinado = conhecida ? opCombinarEstados(S, colado) : S;
    loc.meta = opMeta(combinado); loc.vista = opCopiar(combinado);
    const l = opSemMeta(combinado), c = opSemMeta(colado); delete l.cfg.certsZ; delete c.cfg.certsZ;
    S = substituir ? mesclar(c) : unirProgresso(null, l, c).st;
    const certs = S.cfg.certs;
    S.cfg = Object.assign({}, colado.cfg, { certs });
    S.cfg.certsZ = Math.max(Number(local.cfg.certsZ) || 0, Number(colado.cfg.certsZ) || 0);
    juntarCerts(S.cfg, local.cfg, null); registrarCerts(S);
    pedindo = null; msgDados = substituir ? 'Progresso substituído conforme solicitado; certificados mantidos.' : 'Progresso importado sem apagar o estudo já guardado.'; salvar({ importado }); render();

  }
  function blocoMigracaoLegada() {
    return '<p class="small muted" role="note">Dados de versões anteriores: use Copiar meu progresso ou Baixar meus dados no perfil de origem e importe o código ou o conteúdo do arquivo na conta desejada. A sincronização antiga está desativada. Nenhuma conta ou nuvem antiga é convertida automaticamente.</p>';
  }

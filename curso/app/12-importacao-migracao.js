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
    const meta = opMeta(S); let hash;
    try { hash = identidadeImportacao(o); } catch (e) { msgDados = 'Não foi possível identificar este código com segurança. Nada foi alterado; preserve a cópia original.'; render(); return; }
    if (!conhecida && !opValida(colado.cfg._ops) && importacaoRecebida(meta, hash)) { pedindo = null; msgDados = loc.pendente || loc.confirmando || !gravouLocal ? 'Este código já está na fila. Aguarde a confirmação do armazenamento; mantenha a aba aberta.' : 'Este código já foi aplicado. O estudo novo, as correções e o Zerar foram mantidos.'; consolidar(); render(); return; }
    let importado;
    try {
      if (conhecida) importado = opMeta(colado);
      else if (opValida(colado.cfg._ops)) {
        const base = opEstado(colado.cfg._ops);
        importado = opUnir(opMeta(base), opDelta(opMeta(base), base, colado, 'e:editar:' + hash));
      } else importado = operacoesLegadas(meta, colado, hash, substituir);
    } catch (e) { msgDados = e.message; render(); return; }
    if (substituir && opValida(colado.cfg._ops) && mesmoConteudo(opUnir(meta, importado), meta)) {
      pedindo = null; msgDados = loc.pendente || loc.confirmando || !gravouLocal ? 'Este código já está na fila. Aguarde a confirmação do armazenamento; mantenha a aba aberta.' : 'Este código já foi aplicado. O estudo novo, as correções e o Zerar foram mantidos.'; consolidar(); render(); return;
    }
    if (substituir) importado = substituirContadores(meta, importado);
    const m = opUnir(meta, importado);
    const combinado = opEstado(m);
    S = substituir ? estadoSubstituido(m, importado, colado) : combinado;
    dadosContadores(S, m); // não recriar uma operação para números já representados pelos IDs importados
    const certs = S.cfg.certs, recebidas = combinado.cfg._importacoes;
    S.cfg = Object.assign({}, colado.cfg, { certs });
    ['fcv', 'fcAncora', 'certsZ'].forEach(k => { if (Object.prototype.hasOwnProperty.call(combinado.cfg, k)) S.cfg[k] = opCopiar(combinado.cfg[k]); else delete S.cfg[k]; });
    if (recebidas) S.cfg._importacoes = opCopiar(recebidas); else delete S.cfg._importacoes;
    S.cfg.certsZ = Math.max(Number(local.cfg.certsZ) || 0, Number(combinado.cfg.certsZ) || 0);
    juntarCerts(S.cfg, local.cfg, null); registrarCerts(S);
    loc.meta = m; loc.vista = opCopiar(combinado);
    pedindo = null; msgDados = substituir ? 'Progresso substituído conforme solicitado; certificados mantidos.' : 'Progresso importado sem apagar o estudo já guardado.'; salvar({ importado, idImportacao: hash }); render();

  }
  function blocoMigracaoLegada() {
    return '<p class="small muted" role="note">Dados de versões anteriores: use Copiar meu progresso ou Baixar meus dados no perfil de origem e importe o código ou o conteúdo do arquivo na conta desejada. A sincronização antiga está desativada. Nenhuma conta ou nuvem antiga é convertida automaticamente.</p>';
  }

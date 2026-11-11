  /* ---------- várias abas da mesma conta neste aparelho (auditoria/firebase-codex.md, F01) ----------
     Todas as abas e janelas do curso na mesma conta gravam a mesma chave local, mas cada uma tem a sua cópia na memória
     (S). Gravar S inteiro por cima apagava o que outra aba tinha guardado: com duas abas offline, a marcação da aba que
     fechou sumia do aparelho e nunca chegava à nuvem. Agora:
     - antes de gravar, a aba lê a chave; se outra aba gravou desde a última vez que esta leu ou gravou, as duas versões
       são unidas com unirProgresso (a mesma união da nuvem: marcações, desmarcações, contagens, certificados, "Zerar");
     - a base da união é a versão mais recente que as duas abas têm em comum, tirada da linhagem gravada à parte
       (chave ABAS_K: id desta gravação, ids das anteriores e um resumo do texto a que ela pertence). Sem versão comum
       conhecida (versão antiga do app, linhagem que não confere), a união é sem base: nada se apaga;
     - quando outra aba grava (evento storage), esta une na hora; se tinha algo que a outra não tinha (as duas gravaram
       quase juntas e uma leu a chave atrasada), grava a união de volta, e as duas convergem;
     - se outra aba apagou a cópia deste aparelho (sair apagando, excluir a conta), esta recarrega, sem regravar.
     O texto do progresso na chave local continua igual ao de antes (a linhagem fica em outra chave): versões antigas,
     cópias de recuperação e exportação não mudam. Funções declaradas: carregar(), salvar() e conciliar() as usam. */
  function resumoTexto(t) { let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; } return h.toString(36) + '.' + t.length.toString(36); }
  /* Linhagem da versão gravada na chave local, só se ela pertence a este texto (resumo confere). */
  function linhagemLocal(txt) {
    if (txt == null) return null;
    try { const m = JSON.parse(localStorage.getItem(chave(ABAS_K)) || 'null'); return m && typeof m.id === 'string' && Array.isArray(m.lin) && m.h === resumoTexto(txt) ? m : null; } catch (e) { return null; }
  }
  function estadoDe(txt) { try { const o = JSON.parse(txt); return o && o.v === 1 ? mesclar(o) : null; } catch (e) { return null; } }
  /* Esta aba passa a conhecer a versão txt (lida ou gravada por ela). */
  /* Versão sem linhagem (gravada por uma versão antiga do app, ou antes desta mudança): o id vem do próprio texto, então
     duas abas que leram o mesmo texto a chamam igual e ela serve de base comum. */
  function lembrarLocal(txt, st) {
    const m = linhagemLocal(txt), id = m ? m.id : txt != null ? 'h' + resumoTexto(txt) : '';
    abas.raw = txt; abas.id = id; abas.lin = (m ? m.lin : []).concat(id ? [id] : []).slice(-30);
    if (id && st) abas.hist = abas.hist.filter(h => h.id !== id).concat({ id, st: JSON.stringify(st) }).slice(-12);
  }
  /* A versão mais recente que esta aba conhece entre as que a gravação txt diz descender. */
  function baseComum(txt) {
    const m = linhagemLocal(txt);
    if (!m) return null; // gravada sem linhagem por uma versão antiga: união sem base (nada se apaga)
    for (let i = m.lin.length - 1; i >= 0; i--) { const h = abas.hist.find(x => x.id === m.lin[i]); if (h) return mesclar(JSON.parse(h.st)); }
    return null;
  }
  /* União do estado st desta aba com a versão txt gravada por outra aba. Ilegível: guarda a cópia e fica com st. */
  function unirOutraAba(st, txt) {
    const outro = estadoDe(txt);
    if (!outro) { recuperar = txt; try { localStorage.setItem(chave(LS_REC), txt); } catch (e) { /* sem espaço */ } return st; }
    const r = unirProgresso(baseComum(txt), mesclar(JSON.parse(JSON.stringify(st))), outro);
    if (r.perdido) { recuperar = JSON.stringify(r.perdido); try { localStorage.setItem(chave(LS_REC), recuperar); } catch (e) { /* sem espaço */ } }
    return r.st;
  }
  /* Grava st na chave local, unido ao que outra aba tenha gravado; devolve o estado gravado. Sem espaço, lança. */
  function gravarLocal(st) {
    let atual = null;
    try { atual = localStorage.getItem(chave(LS)); } catch (e) { /* sem armazenamento: a gravação abaixo lança */ }
    let u = st;
    if (atual != null && atual !== abas.raw) { u = unirOutraAba(st, atual); lembrarLocal(atual, estadoDe(atual)); }
    const txt = JSON.stringify(u), id = 'a' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const lin = abas.lin.slice(-29); // as versões de que esta gravação descende (a última é a que esta aba conhecia)
    try { localStorage.setItem(chave(ABAS_K), JSON.stringify({ id, lin, h: resumoTexto(txt) })); } catch (e) { /* sem linhagem: a próxima união é sem base */ }
    localStorage.setItem(chave(LS), txt);
    lembrarLocal(txt, u);
    return u;
  }
  window.addEventListener('storage', ev => {
    if (ev.storageArea !== localStorage || ev.key !== chave(LS) || ev.newValue === abas.raw) return;
    if (ev.newValue == null) { S = carregar(); render(); return; } // apagada em outra aba: não regrava o que foi apagado
    const antes = JSON.stringify(S), outro = estadoDe(ev.newValue);
    const u = unirOutraAba(S, ev.newValue);
    lembrarLocal(ev.newValue, outro);
    S = u;
    if (outro && !uIgual(u, outro)) { try { S = gravarLocal(S); } catch (e) { /* sem espaço: fica na memória e vai na próxima gravação */ } }
    if (JSON.stringify(S) === antes) return;
    render();
    if (nuvem.ref) { nuvem.pendente = true; clearTimeout(tSave); tSave = setTimeout(gravar, 1500); syncInfo(); }
  });

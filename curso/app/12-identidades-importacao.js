  /* SHA-256 síncrono: a aceitação do clique não antecede o cálculo da identidade.
     Sem rede/dependência e sem hash curto sujeito a colisões triviais. Vetores NIST em testes. */
  function hashImportacao(texto) {
    const bytes = new TextEncoder().encode(texto), tamanho = Math.ceil((bytes.length + 9) / 64) * 64;
    const dados = new Uint8Array(tamanho); dados.set(bytes); dados[bytes.length] = 128;
    const view = new DataView(dados.buffer); view.setUint32(tamanho - 8, Math.floor(bytes.length / 536870912)); view.setUint32(tamanho - 4, bytes.length * 8 >>> 0);
    const k = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    const h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19], w = new Int32Array(64), rot = (n, b) => n >>> b | n << 32 - b;
    for (let off = 0; off < tamanho; off += 64) {
      for (let i = 0; i < 64; i++) { if (i < 16) w[i] = view.getInt32(off + i * 4); else { const x = w[i - 15], y = w[i - 2]; w[i] = w[i - 16] + (rot(x, 7) ^ rot(x, 18) ^ x >>> 3) + w[i - 7] + (rot(y, 17) ^ rot(y, 19) ^ y >>> 10) | 0; } }
      let [a,b,c,d,e,f,g,z] = h;
      for (let i = 0; i < 64; i++) { const t = z + (rot(e, 6) ^ rot(e, 11) ^ rot(e, 25)) + (e & f ^ ~e & g) + k[i] + w[i] | 0, u = (rot(a, 2) ^ rot(a, 13) ^ rot(a, 22)) + (a & b ^ a & c ^ b & c) | 0; z = g; g = f; f = e; e = d + t | 0; d = c; c = b; b = a; a = t + u | 0; }
      [a,b,c,d,e,f,g,z].forEach((v, i) => { h[i] = h[i] + v | 0; });
    }
    return h.map(x => (x >>> 0).toString(16).padStart(8, '0')).join('');
  }
  function identidadeImportacao(o) {
    const x = opSemMeta(o); delete x.t; delete x._abas; delete x.sinc; delete x.ep; delete x.lin;
    if (x.cfg) { delete x.cfg._importacoes; if (o.cfg && opValida(o.cfg._ops)) x.cfg._origemOperacional = opCopiar(opMigrar(o.cfg._ops)); }
    const ordenar = x => Array.isArray(x) ? x.map(ordenar) : x && typeof x === 'object' ? Object.fromEntries(Object.keys(x).sort().map(k => [k, ordenar(x[k])])) : x;
    return hashImportacao('eear-importacao-v1\n' + JSON.stringify(ordenar(x)));
  }
  function reciboImportacao(hash) { return JSON.stringify(['cfg', '_importacoes', hash]); }
  function importacaoRecebida(m, hash) { const r = m.r[reciboImportacao(hash)], pre = 'i:' + hash; return !!(r && r.length === 3 && r[2] === true) || Object.values(m.c).concat(Object.values(m.s)).some(c => Object.keys(c.a).some(id => id === pre || id.startsWith(pre + ':'))); }
  function dadosContadores(st, m) {
    const origem = opPlano(opEstado(m)), campos = opPlano(st);
    [...new Set(Object.keys(campos).concat(Object.keys(m.c)))].forEach(k => {
      const p = opCaminho(k); if (!p || p.length < 2 || !opContador(p)) return;
      let o = st;
      for (const x of p.slice(0, -1)) { if (!o[x] || typeof o[x] !== 'object') { if (origem[k] === undefined) return; o[x] = {}; } o = o[x]; }
      if (origem[k] === undefined) delete o[p[p.length - 1]]; else o[p[p.length - 1]] = origem[k];
    });
  }
  /* Cópia sem proveniência: unidades estáveis do mesmo conteúdo. As unidades já cobertas pela
     história observada são tombstones, não uma subtração nem um novo UUID para a mesma diferença.
     e:* identifica alterações desta versão; nunca são consumidas como crédito de história antiga. */
  function operacoesLegadas(m, st, hash, substituir) {
    const d = opVazio(), campos = opPlano(st); d.n = Math.max(m.n, Date.now()) + 1;
    d.r[reciboImportacao(hash)] = [d.n, 'i:' + hash, true];
    // Também as marcações/cartões/simulados têm efeito estável. Importar uma cópia antiga
    // não cria uma edição posterior a um reset: o relógio zero fica abaixo das alterações reais.
    // Preferências são uma escolha atual da interface; certificados conservam IDs de conjunto.
    const origem = opSemente(st);
    Object.keys(origem.r).forEach(k => {
      const p = opCaminho(k), v = origem.r[k][2], atual = m.r[k];
      if ((p[0] === 'cfg' && !['fcv', 'fcAncora', 'certsZ'].includes(p[1])) || p[0] === 't' || opContador(p) || (p[0] === 'feito' && v !== true)) return;
      if (atual && (atual.length === 2 || atual[0] > 0 || JSON.stringify(atual[2]) === JSON.stringify(v))) return; // nada aceito além da alteração observada
      d.r[k] = [0, 'z:i:' + hash, opCopiar(v)];
    });
    Object.keys(origem.s).forEach(k => {
      const id = 'i:' + hash, atual = m.s[k], c = { a: { [id]: opCopiar(origem.s[k].a.legado) }, x: {} };
      if (atual && !Object.prototype.hasOwnProperty.call(atual.a, id)) { c.x[id] = true; c.o = { [id]: Object.fromEntries(Object.keys(atual.a).filter(x => !atual.x[x]).map(x => ['@coberto:' + x, true])) }; }
      d.s[k] = c;
    });
    let unidades = 0;
    Object.keys(campos).forEach(k => {
      const p = opCaminho(k); if (!p || p.length < 2 || !opContador(p)) return;
      // Como a união histórica: texto/nulo não é atividade. Não rejeitar os campos válidos do arquivo.
      const v = typeof campos[k] === 'number' ? campos[k] : 0; if (!Number.isFinite(v) || v < 0 || (!opMaximo(p) && !Number.isSafeInteger(v))) throw new Error('O código contém uma contagem inválida. Nenhum dado foi alterado.');
      const c = { a: {}, x: {} }, atual = m.c[k], pre = 'i:' + hash + ':', lidas = Object.fromEntries(Object.keys(atual && atual.l || {}).map(id => [id, true]));
      if (opMaximo(p)) {
        const id = 'i:' + hash; c.a[id] = v;
        const cobertas = !substituir && atual && !Object.prototype.hasOwnProperty.call(atual.a, id) ? opIdsVivos(atual).filter(x => atual.a[x] >= v) : [];
        if (cobertas.length) { c.x[id] = true; c.o = { [id]: Object.fromEntries(cobertas.map(x => ['@coberto:' + x, true])) }; }
      }
      else {
        unidades += v; if (unidades > 10000) throw new Error('Esta cópia antiga tem contagens grandes demais para uma migração segura. Preserve o arquivo; nenhum dado foi alterado.');
        let credito = 0, pos = 0;
        const cobertura = substituir || !atual ? [] : opIdsVivos(atual).filter(id => !id.startsWith('e:') && !id.startsWith(pre)).sort().map(id => ({ id, ate: credito += atual.a[id] }));
        for (let i = 0; i < v; i++) {
          const id = pre + i.toString(36); if (atual && Object.prototype.hasOwnProperty.call(atual.a, id)) continue;
          c.a[id] = 1;
          if (p[0] === 'erros' || i < credito) { c.o = c.o || {}; c.o[id] = p[0] === 'erros' ? opCopiar(lidas) : {}; }
          if (i < credito) { while (cobertura[pos].ate <= i) pos++; c.x[id] = true; c.o[id]['@coberto:' + cobertura[pos].id] = true; }
        }
      }
      d.c[k] = c;
    }); return d;
  }
  function substituirContadores(local, origem) {
    const d = opVazio();
    Object.keys(local.c).forEach(k => { const c = local.c[k], preservadas = (origem.c[k] || {}).a || {}; d.c[k] = { a: {}, x: {} }; Object.keys(c.a).forEach(id => { if (!Object.prototype.hasOwnProperty.call(preservadas, id)) d.c[k].x[id] = true; }); });
    return opUnir(origem, d); // as remoções precisam viajar no diário importado, não só na projeção em memória
  }
  function estadoSubstituido(m, origem, st) {
    const vista = opCopiar(m);
    // Só campos presentes na origem, mas com as remoções/versões mais novas já observadas no destino.
    const campos = opPlano(st);
    Object.keys(vista.r).forEach(k => { if (opCaminho(k)[0] !== 'cfg' && !Object.prototype.hasOwnProperty.call(origem.r, k) && !Object.prototype.hasOwnProperty.call(campos, k)) delete vista.r[k]; });
    return opEstado(vista);
  }

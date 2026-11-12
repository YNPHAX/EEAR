/* Segurança independente: matriz REST das regras com tokens legítimos do emulador e importação de tipos inválidos.
   Dados fictícios; nenhuma operação fora de 127.0.0.1. Não usa token owner nas sondas de autorização.
   Mesmas variáveis de F01; EEAR_SEGURANCA_CENARIOS permite selecionar regras,dias,excl,nome. */
const path = require('path'), { execFileSync } = require('child_process'), fixture = require('./f01-fixture.js');
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..'));
const seed = () => ({ v: 1, t: Date.now() - 10000, cfg: { nome: 'Segurança Fictícia', certs: [] }, mod: {}, fc: {}, sims: [], feito: { 'T:base': true }, act: {} });
const raiz = 'http://127.0.0.1:8180/v1/projects/demo-eear-f01/databases/(default)/documents';
const jsonReq = async (url, token, data, method) => {
  const r = await fetch(url, { method: method || (data ? 'POST' : 'GET'), headers: Object.assign({ 'content-type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), ...(data ? { body: JSON.stringify(data) } : {}) });
  return { status: r.status, json: await r.json() };
};

(async () => {
  console.log('Segurança noturna: alvo ' + execFileSync('git', ['rev-parse', 'HEAD'], { cwd: alvo, encoding: 'utf8' }).trim());
  if (fixture.emular(alvo, path.join(__dirname, 'noturna-seguranca.test.js'))) return;
  const f = await fixture.abrir(alvo), cenarios = (process.env.EEAR_SEGURANCA_CENARIOS || 'regras,dias,excl,nome').split(','); let falhas = 0;
  try {
    for (const nome of cenarios) {
      if (!['regras', 'dias', 'excl', 'nome'].includes(nome)) throw new Error('Cenário desconhecido: ' + nome);
      const ctx = await f.contexto();
      try {
        let passou = false, resultado;
        if (nome === 'regras') {
          const a = await f.conta('regras-extra-A', seed()), b = await f.conta('regras-extra-B', seed());
          const login = await jsonReq('http://127.0.0.1:9199/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo', null, { email: a.email, password: 'auditoria-f01-123', returnSecureToken: true });
          const token = login.json.idToken; if (!token) throw new Error('Não obteve token legítimo do emulador.');
          const resultados = [];
          const testar = async (caso, esperado, op) => { const r = await op; resultados.push({ caso, esperado, observado: r.status }); return r; };
          await testar('próprio get', 200, jsonReq(`${raiz}/alunos/${a.uid}`, token));
          await testar('outro UID get', 403, jsonReq(`${raiz}/alunos/${b.uid}`, token));
          await testar('sem autenticação', 403, jsonReq(`${raiz}/alunos/${a.uid}`, null));
          await testar('listagem', 403, jsonReq(`${raiz}/alunos`, token));
          await testar('subcoleção', 403, jsonReq(`${raiz}/alunos/${a.uid}/segredo/dado`, token));
          await testar('query só do UID próprio continua list', 403, jsonReq(`${raiz}:runQuery`, token, { structuredQuery: { from: [{ collectionId: 'alunos' }], where: { fieldFilter: { field: { fieldPath: '__name__' }, op: 'EQUAL', value: { referenceValue: `projects/demo-eear-f01/databases/(default)/documents/alunos/${a.uid}` } } } } }));
          await testar('agregação count', 403, jsonReq(`${raiz}:runAggregationQuery`, token, { structuredAggregationQuery: { structuredQuery: { from: [{ collectionId: 'alunos' }] }, aggregations: [{ alias: 'total', count: {} }] } }));
          const dados = seed(); dados.feito['T:nao-deve-entrar'] = true;
          const write = uid => ({ update: { name: `projects/demo-eear-f01/databases/(default)/documents/alunos/${uid}`, fields: { v: { integerValue: '1' }, dados: { stringValue: JSON.stringify(dados) }, t: { integerValue: String(dados.t) } } }, updateTransforms: [{ fieldPath: 'atualizado', setToServerValue: 'REQUEST_TIME' }] });
          await testar('batch misto próprio/outro UID', 403, jsonReq(`${raiz}:commit`, token, { writes: [write(a.uid), write(b.uid)] }));
          const intacto = !(await f.ler(a.uid)).feito['T:nao-deve-entrar'];
          passou = intacto && resultados.every(r => r.esperado === r.observado); resultado = { resultados, batchAtomicoPreservouProprio: intacto };
        } else {
          const A = await f.pagina(ctx), erros = []; A.on('pageerror', e => erros.push(e.message));
          await f.importar(A, seed()); const est = await f.estado(A);
          const invalido = nome === 'dias' ? null : {};
          est.cfg[nome] = invalido; await f.importar(A, est);
          await new Promise(r => setTimeout(r, 300)); await A.reload();
          for (const v of ['hoje', 'plano', 'materias', 'treino']) await f.clicar(A, 'tab', { v });
          await f.clicar(A, 'tab', { v: 'plano' });
          const acessoDados = await A.locator('[data-a="impabrir"]').count();
          const guardado = await A.evaluate(() => { const s = JSON.parse(localStorage.getItem('missao-eear-v1') || 'null'); return s && s.cfg; });
          passou = erros.length === 0 && acessoDados > 0;
          resultado = { campo: nome, tipoInvalido: invalido === null ? 'null' : 'objeto', erros: [...new Set(erros)], acessoDados, tipoPersistido: guardado && (guardado[nome] === null ? 'null' : typeof guardado[nome]), corpoCaracteres: (await A.locator('main').innerText()).length };
        }
        console.log(`${passou ? '✓' : '✗'} ${nome}: ${JSON.stringify(resultado)}`); if (!passou) falhas++;
      } catch (e) { console.log(`✗ ${nome}: FALHA DE PREPARAÇÃO/EXECUÇÃO: ${e.message}`); falhas++; }
      finally { await ctx.close(); }
    }
  } finally { await f.fechar(); }
  console.log(`Segurança noturna: ${falhas} falha(s) em ${cenarios.length} cenários.`); process.exitCode = falhas ? 1 : 0;
})().catch(e => { console.error(e); process.exitCode = 1; });

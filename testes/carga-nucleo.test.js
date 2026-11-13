/* Complemento quantitativo: núcleo de operações publicado, entregas em lotes e duplicadas.
   A normalização é identidade para o estado válido mínimo; NÃO mede UI, IndexedDB nem durabilidade.
   O teste de navegador carga-metadados cobre esses caminhos. Não compacta nem reimplementa a união. */
const fs = require('fs'), path = require('path'), vm = require('vm'), assert = require('assert'), nodeCrypto = require('crypto'), NodeBuffer = require('buffer').Buffer;
const alvo = path.resolve(process.env.EEAR_REPO_ALVO || path.join(__dirname, '..')), hj = new Date().toISOString().slice(0, 10);
const base = () => ({ v: 1, t: 0, cfg: { nome: 'Pessoa Fictícia Núcleo', certs: [] }, feito: {}, act: { [hj]: 2 }, erros: {}, sims: [], mod: {}, aula: {} });
const c = { window: {}, navigator: {}, loc: {}, novoEstado: base, mesclar: x => x, certValido: () => false, certChave: x => x.c };
vm.createContext(c); const fonte = fs.readFileSync(path.join(alvo, 'curso/app/14-abas.js'), 'utf8');
vm.runInContext(fonte + ';this.api={opSemente,opDelta,opUnir,opEstado,opValida,opVazio};', c);
const { opSemente, opDelta, opUnir, opEstado, opValida, opVazio } = c.api;
const medidas = []; let m = opSemente(base()), geradas = 0, primeiraAcima = null; const inicio = Date.now();
for (let lote = 0; lote < 120; lote++) {
  const antes = opEstado(m); delete antes.cfg._ops; let d = opVazio();
  for (let i = 0; i < 100; i++) {
    const depois = JSON.parse(JSON.stringify(antes)), id = 'o' + nodeCrypto.randomUUID();
    depois.feito['T:lote-' + (++geradas)] = true; depois.act[hj]++;
    d = opUnir(d, opDelta(m, antes, depois, id));
  }
  m = opUnir(m, d); assert(opValida(m));
  assert.strictEqual(opEstado(m).act[hj], 2 + geradas);
  assert.strictEqual(opEstado(opUnir(m, d)).act[hj], 2 + geradas); // ACK/repetição do lote não duplica
  if (geradas % 1000 === 0) {
    const st = opEstado(m), texto = JSON.stringify(st), bytes = NodeBuffer.byteLength(texto);
    const linha = { acoes: geradas, bytesEstado: bytes, bytesMeta: NodeBuffer.byteLength(JSON.stringify(m)), segundos: (Date.now() - inicio) / 1000 };
    medidas.push(linha); console.log('NÚCLEO ' + JSON.stringify(linha));
    if (!primeiraAcima && texto.length >= 900000) { primeiraAcima = linha; if (process.env.EEAR_CARGA_ESTADO) fs.writeFileSync(process.env.EEAR_CARGA_ESTADO, texto); }
  }
}
const antes = opEstado(m), zero = base(); zero.act = {}; zero.cfg.certsZ = Date.now();
m = opUnir(m, opDelta(m, antes, zero, 'reset-' + nodeCrypto.randomUUID()));
const novoAntes = opEstado(m), novo = JSON.parse(JSON.stringify(novoAntes)); novo.feito['T:depois'] = true; novo.act[hj] = 1;
m = opUnir(m, opDelta(m, novoAntes, novo, 'novo-' + nodeCrypto.randomUUID()));
const final = opEstado(m); assert.strictEqual(final.act[hj], 1); assert.deepStrictEqual(Object.keys(final.feito), ['T:depois']);
console.log('NÚCLEO RESET ' + JSON.stringify({ marcas: 1, atividade: 1, bytesEstado: NodeBuffer.byteLength(JSON.stringify(final)), bytesMeta: NodeBuffer.byteLength(JSON.stringify(m)) }));
console.log('Núcleo: 12.000 operações em lotes, repetição, contagens e reset passaram; primeiro ponto amostrado acima de 900.000: ' + JSON.stringify(primeiraAcima));
if (process.env.EEAR_CARGA_SAIDA) fs.writeFileSync(process.env.EEAR_CARGA_SAIDA, JSON.stringify({ alvo, sha256: nodeCrypto.createHash('sha256').update(fonte).digest('hex'), normalizador: 'identidade; estado mínimo válido', medidas, primeiraAcima }, null, 2));

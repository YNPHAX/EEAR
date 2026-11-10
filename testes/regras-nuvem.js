/* Modelo das regras de acesso do banco de dados (capability db) do Claude, para os testes da nuvem do curso no Claude.
   Segue o contrato do db (runtime 0.2.96): níveis view < interact < admin < owner (o dono atende a todos, menos self);
   sem regra, vale a regra padrão da raiz (leitura view, gravação interact); uma regra vale para o caminho e abaixo, e a
   mais funda manda; nível não declarado herda da regra acima; "P/{self}" é a subárvore do próprio leitor sob P: na
   dele, vale o que der mais entre a regra de P e a de {self}; na de outra pessoa, só a regra de P, e sem regra em P
   ninguém (nem o dono) vê a subárvore de outra pessoa.
   O modelo é calibrado com o que foi CONFIRMADO no serviço real (artifact privado de teste, 2026-11-10; ver
   auditoria/integracao-segura.md, seção 4): os casos de `confirmados` abaixo têm de dar o mesmo resultado aqui.
   Usado por testes/progresso2-nuvem.js e por testes/plataforma.test.js (testarRegras). */
const fs = require('fs'), path = require('path');
const REGRAS = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'web', 'regras-claude.json'), 'utf8'));
const NIVEIS = { view: 1, interact: 2, admin: 3, owner: 4 };
const atende = (nivel, minimo) => minimo !== 'self' && NIVEIS[nivel] >= NIVEIS[minimo];

/* Pode `nivel` (view|interact|admin|owner), na conta `uid`, fazer `acao` (read|write) em `caminho`? */
function pode(regras, nivel, uid, acao, caminho) {
  const segs = caminho.split('/');
  let ef = { read: 'view', write: 'interact' }, prefixoSelf = null, temRegraPrefixo = false;
  for (let i = 1; i <= segs.length; i++) {
    const p = segs.slice(0, i).join('/');
    const r = regras.find(x => x.path === p);
    if (r) ef = { read: r.read || ef.read, write: r.write || ef.write };
    const rs = regras.find(x => x.path === p + '/{self}');
    if (rs && i < segs.length) { prefixoSelf = { prefixo: p, dono: segs[i], regra: rs }; temRegraPrefixo = !!r; break; }
  }
  if (!prefixoSelf) return atende(nivel, ef[acao]);
  if (prefixoSelf.dono === uid) { // a própria subárvore: o que der mais entre a regra do prefixo e a de {self}
    const rs = prefixoSelf.regra, deSelf = { read: rs.read || ef.read, write: rs.write || ef.write };
    return atende(nivel, ef[acao]) || atende(nivel, deSelf[acao]);
  }
  return temRegraPrefixo && atende(nivel, ef[acao]); // subárvore de outra pessoa: só a regra do prefixo
}

/* Comportamentos confirmados no serviço real (nível interact = aluno Contributor; "eu" = a própria conta). */
const confirmados = [
  ['hoje', 'write', 'progresso/eu', true, 'fase 1: o aluno grava o próprio caminho antigo'],
  ['hoje', 'write', 'progresso/outro', false, 'fase 1: gravar o caminho antigo de outra conta é recusado'],
  ['propostas', 'read', 'progresso/eu', true, 'fase 2: o aluno lê o próprio documento antigo'],
  ['propostas', 'write', 'progresso/eu', false, 'fase 2: o aluno não grava o próprio documento antigo'],
  ['propostas', 'write', 'progresso2/eu', true, 'fase 2: o aluno grava o próprio documento novo'],
  ['propostas', 'read', 'progresso2/eu', true, 'fase 2: o aluno lê o próprio documento novo'],
  ['propostas', 'write', 'progresso2/outro', false, 'fase 2: gravar o documento novo de outra conta é recusado'],
  ['propostas', 'read', 'progresso2/outro', false, 'fase 2: o documento novo de outra conta é invisível'],
  ['propostas', 'read', 'progresso/outro', false, 'fase 2: o documento antigo de outra conta é invisível'],
  ['hoje', 'read', 'progresso2/outro', true, 'fase 3 (reversão com as regras de hoje): o documento novo de OUTRA conta fica legível (vazamento)'],
  ['hoje', 'write', 'progresso2/outro', true, 'fase 3 (reversão com as regras de hoje): o documento novo de OUTRA conta fica gravável (vazamento)'],
  ['reversao', 'write', 'progresso/eu', true, 'fase 4 (reversão corrigida): o aluno volta a gravar o caminho antigo'],
  ['reversao', 'read', 'progresso2/outro', false, 'fase 4 (reversão corrigida): o documento novo de outra conta continua invisível'],
  ['reversao', 'write', 'progresso2/outro', false, 'fase 4 (reversão corrigida): o documento novo de outra conta continua protegido'],
  ['reversao', 'read', 'progresso2/eu', true, 'fase 4 (reversão corrigida): o aluno ainda lê o próprio documento novo']
];

/* Conjunto de regras seguro para o curso: cobre progresso e progresso2 com prefixo restrito ao dono e {self}, e nenhum
   aluno lê ou grava o documento de outra conta em nenhum dos dois caminhos. */
function seguro(regras) {
  return ['progresso', 'progresso2'].every(p => regras.some(r => r.path === p && r.read === 'owner' && r.write === 'owner') && regras.some(r => r.path === p + '/{self}'))
    && ['read', 'write'].every(a => ['progresso/outro', 'progresso2/outro'].every(c => !pode(regras, 'interact', 'eu', a, c) && !pode(regras, 'admin', 'eu', a, c)));
}

function testarRegras(ok) {
  console.log('\n== regras da nuvem do curso no Claude (web/regras-claude.json; modelo calibrado com o serviço real)');
  const erradas = confirmados.filter(([conj, acao, cam, esperado]) => pode(REGRAS[conj], 'interact', 'eu', acao, cam) !== esperado);
  ok(!erradas.length, `o modelo reproduz os ${confirmados.length} comportamentos confirmados no serviço real` + (erradas.length ? ` — diverge: ${erradas.map(x => x[4]).join('; ')}` : ''));
  ok(!seguro(REGRAS.hoje) && pode(REGRAS.hoje, 'interact', 'eu', 'read', 'progresso2/outro') && pode(REGRAS.hoje, 'interact', 'eu', 'write', 'progresso2/outro'),
    'reproduz o vazamento: com as regras de hoje (sem regra para progresso2), um aluno lê e grava o progresso2 de outra conta');
  ok(seguro(REGRAS.propostas) && seguro(REGRAS.reversao), 'as regras propostas e as de reversão declaram progresso e progresso2 e isolam as contas (leitura e gravação)');
  ok(!pode(REGRAS.propostas, 'interact', 'eu', 'write', 'progresso/eu') && pode(REGRAS.reversao, 'interact', 'eu', 'write', 'progresso/eu') && pode(REGRAS.propostas, 'interact', 'eu', 'write', 'progresso2/eu') && pode(REGRAS.reversao, 'interact', 'eu', 'write', 'progresso2/eu'),
    'propostas: o caminho antigo fica só para leitura do aluno; reversão: volta a ser gravável, e o caminho novo continua gravável só pelo próprio aluno');
  ok(pode(REGRAS.propostas, 'owner', 'eu', 'read', 'progresso2/outro') && pode(REGRAS.propostas, 'owner', 'eu', 'write', 'progresso/outro'), 'o dono do curso continua lendo e gravando os dois caminhos (moderação e limpeza)');
}

module.exports = { REGRAS, pode, seguro, confirmados, testarRegras };

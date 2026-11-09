/* Compara o conteúdo pedagógico de duas cópias do repositório (por exemplo, a main antes e depois de um merge), item
   por item: aulas, questões e gabaritos, teoria, cartões, provas, vídeos e calendário. Só lê; não grava nada.
   Uso: node testes/comparar-conteudo.js <pasta da cópia A> <pasta da cópia B>
   Sai com código 1 se mudar algo além de cartões e teoria (questões, gabaritos, provas, ordem ou quantidade de aulas
   e de cartões), que nunca mudam sem autorização. */
const fs = require('fs'), path = require('path'), vm = require('vm');
function carregar(raiz) {
  const html = fs.readFileSync(path.join(raiz, 'curso', 'index.html'), 'utf8'), ctx = { console };
  ctx.window = ctx; vm.createContext(ctx);
  for (const m of html.matchAll(/src="dados\/([^"]+)"/g)) vm.runInContext(fs.readFileSync(path.join(raiz, 'curso', 'dados', m[1]), 'utf8'), ctx);
  return ctx.EEAR;
}
const [A, B] = process.argv.slice(2, 4).map(carregar), J = JSON.stringify, dif = {}, add = (k, id) => { (dif[k] = dif[k] || []).push(id); };
const ma = new Map(A.modulos.map(m => [m.id, m])), mb = new Map(B.modulos.map(m => [m.id, m]));
for (const [id, a] of ma) {
  const b = mb.get(id);
  if (!b) { add('aula removida', id); continue; }
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) if (J(a[k]) !== J(b[k])) add('campo ' + k, id);
}
for (const id of mb.keys()) if (!ma.has(id)) add('aula nova', id);
const ids = E => E.modulos.flatMap(m => (m.fc || []).map((f, i) => m.id + '~' + i));
if (J(A.modulos.map(m => m.id)) !== J(B.modulos.map(m => m.id))) add('ordem das aulas', '-');
if (J(ids(A)) !== J(ids(B))) add('ids ou ordem dos cartões', '-');
for (const k of Object.keys(A)) if (k !== 'modulos' && J(A[k]) !== J(B[k])) add('E.' + k, '-');
console.log(`aulas ${ma.size} → ${mb.size}; cartões ${ids(A).length} → ${ids(B).length}`);
for (const [k, v] of Object.entries(dif)) console.log(`${k}: ${v.length} — ${v.join(' ')}`);
const proibido = Object.keys(dif).filter(k => !['campo fc', 'campo teoria'].includes(k));
console.log(proibido.length ? `ATENÇÃO: mudou ${proibido.join(', ')}` : 'questões, gabaritos, provas, vídeos e calendário iguais');
process.exit(proibido.length ? 1 : 0);

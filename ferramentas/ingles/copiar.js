/* Cria as aulas de Inglês de cada opção do edital como cópia das 13 aulas atuais (ING01 a ING13):
   curso/dados/ing-basico.js (INGB01 a INGB13) e curso/dados/ing-bct.js (INGI01 a INGI14, sem o INGI12 por enquanto).
   Roda uma vez só: depois de criados, cada arquivo é editado sozinho e mudar um não muda o outro nem as aulas antigas.
   Uso: node ferramentas/ingles/copiar.js [--forcar]   (sem --forcar, não sobrescreve arquivos que já existem) */
const fs = require('fs'), path = require('path'), vm = require('vm');

const DADOS = path.join(__dirname, '..', '..', 'curso', 'dados');
const NIVEIS = {
  basico: { arq: 'ing-basico.js', pre: 'INGB', nome: 'nível básico (Opção 1 do edital: demais especialidades)', ids: {} },
  bct: { arq: 'ing-bct.js', pre: 'INGI', nome: 'nível intermediário (Controle de Tráfego Aéreo, BCT)', ids: { 12: 13, 13: 14 } }
};

const ctx = { EEAR: { modulos: [], videos: {}, videoaulas: {}, add(m) { this.modulos.push(m); } } };
vm.createContext(ctx);
['videos.js', 'videoaulas.js', 'ing1.js', 'ing2.js', 'ing3.js'].forEach(f => vm.runInContext(fs.readFileSync(path.join(DADOS, f), 'utf8'), ctx, { filename: f }));
const E = ctx.EEAR, ING = E.modulos.filter(m => /^ING\d\d$/.test(m.id));
if (ING.length !== 13) throw new Error('esperava 13 aulas de Inglês, achei ' + ING.length);

const lit = s => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n') + "'";
const val = v => Array.isArray(v) ? '[' + v.map(val).join(', ') + ']' : typeof v === 'string' ? lit(v) : JSON.stringify(v);
const lista = xs => '[\n' + xs.map(x => '    ' + val(x)).join(',\n') + '\n  ]';
const tmpl = s => { if (/`|\$\{/.test(s)) throw new Error('teoria com crase ou ${'); return '`' + s + '`'; };

for (const [nivel, N] of Object.entries(NIVEIS)) {
  const destino = path.join(DADOS, N.arq);
  if (fs.existsSync(destino) && !process.argv.includes('--forcar')) { console.log(N.arq + ' já existe: nada feito (use --forcar para recriar)'); continue; }
  const novoId = m => { const k = Number(m.id.slice(3)); return N.pre + String(N.ids[k] || k).padStart(2, '0'); };
  const out = [`/* Língua Inglesa, ${N.nome}: ${ING.map(novoId).join(', ')}.
   Criadas como cópia de ING01 a ING13 por ferramentas/ingles/copiar.js ("de" diz a aula de origem). Daqui em diante
   este arquivo é editado sozinho: mudar uma aula aqui não muda a outra opção nem as aulas antigas. */`];
  for (const m of ING) {
    out.push(`EEAR.add({
  id: '${novoId(m)}', m: 'ing', nivel: '${nivel}', de: '${m.id}', n: ${m.n}, t: ${lit(m.t)}, peso: ${m.peso}, h: ${m.h},
  teoria: ${tmpl(m.teoria)},
  ex: ${lista(m.ex)},
  q: ${lista(m.q)},
  fc: ${lista(m.fc)}
});`);
  }
  out.push('/* Videoaulas e termos de busca: os mesmos da aula de origem. */');
  out.push('Object.assign(EEAR.videos, {\n' + ING.filter(m => E.videos[m.id]).map(m => `  ${novoId(m)}: ${lit(E.videos[m.id])}`).join(',\n') + '\n});');
  out.push('Object.assign(EEAR.videoaulas, {\n' + ING.filter(m => E.videoaulas[m.id]).map(m => `  ${novoId(m)}: ${JSON.stringify(E.videoaulas[m.id])}`).join(',\n') + '\n});');
  fs.writeFileSync(destino, out.join('\n') + '\n');
  console.log(N.arq + ': ' + ING.length + ' aulas (' + ING.map(novoId).join(' ') + ')');
}

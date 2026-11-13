/* PROPOSTA de backend, somente modelo fictício: NÃO é implementação do serviço Claude, nem prova de suporte real.
   Mostra por que lease/releitura não bastam e quais garantias faltam antes de reabrir a sincronização legada.
   CAS validado no servidor e protocolo mínimo obrigatório, inclusive na rota set dos clientes antigos. */
const assert = require('assert');
const copiar = o => JSON.parse(JSON.stringify(o));
function servidor() {
  let rev = 0, st = { marcas: {}, ops: {} }, apagada = false;
  return {
    get: () => ({ rev, st: copiar(st) }),
    set: () => { throw new Error('escritor-incompativel'); },
    excluir: () => { apagada = true; rev++; },
    commit: ({ versao, esperado, operacoes }) => {
      if (apagada) throw new Error('conta-excluida');
      if (versao !== 3) throw new Error('escritor-incompativel');
      if (esperado !== rev) throw new Error('conflito');
      const novo = copiar(st);
      for (const o of operacoes) {
        if (!o || typeof o.id !== 'string' || !o.id || typeof o.marca !== 'string') throw new Error('formato-invalido');
        if (novo.ops[o.id] && novo.ops[o.id] !== o.marca) throw new Error('id-reutilizado');
        novo.ops[o.id] = o.marca; novo.marcas[o.marca] = true;
      }
      st = novo; rev++; return { rev, st: copiar(st) };
    }
  };
}
const s = servidor(), lidoAntigo = s.get(), B = s.get();
const confirmadoB = s.commit({ versao: 3, esperado: B.rev, operacoes: [{ id: 'B1', marca: 'T:b1' }] });
const confirmadoA = s.commit({ versao: 3, esperado: confirmadoB.rev, operacoes: [{ id: 'A1', marca: 'T:a1' }] });
assert.throws(() => s.set(lidoAntigo), /escritor-incompativel/);
assert.throws(() => s.commit({ versao: 2, esperado: confirmadoA.rev, operacoes: [] }), /escritor-incompativel/);
assert.throws(() => s.commit({ versao: 3, esperado: confirmadoB.rev, operacoes: [{ id: 'FECHA', marca: 'T:fecha' }] }), /conflito/);
// A atualização não envia um snapshot que poderia apagar A: o servidor aplica operações sobre a revisão atual.
const atualizado = s.commit({ versao: 3, esperado: s.get().rev, operacoes: [{ id: 'FECHA', marca: 'T:fecha' }] });
assert.deepStrictEqual(Object.keys(atualizado.st.marcas).sort(), ['T:a1', 'T:b1', 'T:fecha']);
// ACK perdido: a mesma identidade já aplicada não incrementa contagens nem duplica registros.
s.commit({ versao: 3, esperado: atualizado.rev, operacoes: [{ id: 'FECHA', marca: 'T:fecha' }] });
assert.strictEqual(Object.keys(s.get().st.ops).length, 3);
const antes = s.get(); assert.throws(() => s.commit({ versao: 3, esperado: antes.rev, operacoes: [{ id: 'NOVO', marca: 'novo' }, { id: 'FECHA', marca: 'outro' }] }), /id-reutilizado/);
assert.deepStrictEqual(s.get(), antes, 'Falha parcial não pode confirmar prefixo da transação.');
s.excluir(); assert.throws(() => s.commit({ versao: 3, esperado: s.get().rev, operacoes: [] }), /conta-excluida/);
console.log('✓ Modelo proposto: B -> A, escritor antigo rejeitado, CAS, união no servidor, ACK perdido idempotente, abort integral e conta excluída. Não habilita o runtime legado.');

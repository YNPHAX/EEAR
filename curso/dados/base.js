/* Missão EEAR — base de dados do curso.
   Cada arquivo de matéria chama EEAR.add({...}) com um módulo:
   id, m (matéria), n (ordem), t (título), peso (incidência estimada 1–3), h (horas ideais),
   teoria (HTML), ex (exemplos resolvidos [enunciado, resolução]), q (questões
   [enunciado, [A, B, C, D], índice da correta, comentário]) e fc (flashcards [frente, verso]). */
window.EEAR = {
  materias: {
    por: { nome: "Língua Portuguesa", curto: "Português", sigla: "POR" },
    ing: { nome: "Língua Inglesa", curto: "Inglês", sigla: "ING" },
    mat: { nome: "Matemática", curto: "Matemática", sigla: "MAT" },
    fis: { nome: "Física", curto: "Física", sigla: "FIS" }
  },
  ordem: ["por", "ing", "mat", "fis"],
  modulos: [],
  add: function (m) { this.modulos.push(m); }
};

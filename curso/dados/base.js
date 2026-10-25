/* Missão EEAR — base de dados do curso.
   Cada arquivo de matéria chama EEAR.add({...}) com um módulo:
   id, m (matéria), n (ordem), t (título), peso (incidência estimada 1–3), h (horas ideais),
   teoria (HTML), ex (exemplos resolvidos [enunciado, resolução]), q (questões
   [enunciado, [A, B, C, D], índice da correta, comentário]) e fc (flashcards [frente, verso]).

   Provas anteriores oficiais entram com EEAR.addProva({...}):
   id, nome ("CFS 1/2025"), data (aaaa-mm-dd), min (duração em minutos), fonte (URL do PDF),
   textos ({T1: '<div class="txt">…</div>'}) e q: [{n, m, mod, t, e, o: [A, B, C, D], c, r, anulada}],
   em que n é o número da questão na prova, mod o módulo do curso, t o texto de apoio,
   c o índice da alternativa do gabarito oficial e r um comentário. As alternativas mantêm a ordem original. */
window.EEAR = {
  materias: {
    por: { nome: "Língua Portuguesa", curto: "Português", sigla: "POR" },
    ing: { nome: "Língua Inglesa", curto: "Inglês", sigla: "ING" },
    mat: { nome: "Matemática", curto: "Matemática", sigla: "MAT" },
    fis: { nome: "Física", curto: "Física", sigla: "FIS" }
  },
  ordem: ["por", "ing", "mat", "fis"],
  /* Provas até a meta de 2027. Datas de 2027 são estimativas: os editais ainda não saíram. */
  calendario: [
    { id: "cfs2-2027", nome: "CFS 2/2027", d: "2026-11-22", st: "data divulgada pelos sites de concursos" },
    { id: "cfs1-2028", nome: "CFS 1/2028", d: "2027-05-30", st: "estimativa: o edital ainda não saiu" },
    { id: "cfs2-2028", nome: "CFS 2/2028", d: "2027-11-21", st: "estimativa: o edital ainda não saiu" }
  ],
  modulos: [],
  provas: [],
  videos: {},
  add: function (m) { this.modulos.push(m); },
  addProva: function (p) { this.provas.push(p); }
};

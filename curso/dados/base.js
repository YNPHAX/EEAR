/* Missão EEAR — base de dados do curso.
   Cada arquivo de matéria chama EEAR.add({...}) com um módulo:
   id, m (matéria), n (ordem), t (título), peso (incidência estimada 1–3), h (horas ideais),
   teoria (HTML), ex (exemplos resolvidos [enunciado, resolução]), q (questões
   [enunciado, [A, B, C, D], índice da correta, comentário]) e fc (flashcards [frente, verso]).
   Opcionais: modalidades (['normal'] ou ['bct'], quando a aula vale só para uma opção de Inglês do edital) e desde
   ('aaaa-mm', quando a aula entrou depois do registro de certificados). Toda aula nova precisa de desde: um certificado
   conquistado antes dela continua valendo, mas um progresso antigo nunca ganha certificado sem ela. Aulas novas e
   questões novas entram sempre no fim das listas, porque o progresso guarda a posição de cada questão e cartão.

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
  /* Calendário de provas: datas com edital publicado usam informação oficial; datas futuras sem edital permanecem estimativas. */
  calendario: [
    { id: "cfs2-2027", nome: "CFS 2/2027", d: "2026-11-22", st: "data oficial da EEAR" },
    { id: "cfs1-2028", nome: "CFS 1/2028", d: "2027-05-30", st: "estimativa: o edital ainda não saiu" },
    { id: "cfs2-2028", nome: "CFS 2/2028", d: "2027-11-21", st: "estimativa: o edital ainda não saiu" }
  ],
  modulos: [],
  provas: [],
  videos: {},
  add: function (m) { this.modulos.push(m); },
  addProva: function (p) { this.provas.push(p); }
};

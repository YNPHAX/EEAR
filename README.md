# EEAR

Curso preparatório para o CFS (Curso de Formação de Sargentos) da EEAR, em forma de app de estudo.

**Abrir o curso:** https://claude.ai/artifact/9N6CGipsZWHRKANjcguf1k

## O que tem no curso

- **64 módulos** seguindo o conteúdo programático da prova: Português (14), Inglês (13), Matemática (20) e Física (17).
- Em cada módulo: teoria resumida com fórmulas e regras, o que mais cai na prova, exemplos resolvidos, **quiz de 10 questões** com correção comentada e flashcards.
- **Regra dos 80%**: o módulo só conta como dominado com 8 acertos em 10. A meta nos simulados é nota 8,0 em cada matéria (o mínimo do edital é 5,0 em cada matéria e média 5,0).
- **Cronograma automático** até a data da prova: distribui os módulos pelos dias de estudo, agenda revisões de 7 dias, simulados semanais e uma reta final de revisão. Ele se ajusta às horas por dia, aos dias da semana e ao resultado do diagnóstico.
- **Diagnóstico** (40 questões) para descobrir as matérias mais fracas.
- **Simulado completo** (96 questões, 24 por matéria, com cronômetro) e simulado por matéria (24 questões em 1 h).
- **Flashcards com repetição espaçada** (revisão em 1, 3, 7, 14, 30 e 60 dias).
- **Caderno de erros**: toda questão errada volta para revisão até você acertar.

São 640 questões inéditas no estilo da EEAR, 498 flashcards e 192 exemplos resolvidos.

## Estrutura

```
curso/
  index.html      página do app (estilos e layout)
  app.js          lógica: plano, quizzes, flashcards, simulados, progresso
  dados/
    base.js       matérias e função EEAR.add
    por*.js       Língua Portuguesa
    ing*.js       Língua Inglesa
    mat*.js       Matemática
    fis*.js       Física
```

Cada módulo é um `EEAR.add({...})` com `id`, `t` (título), `peso` (incidência estimada de 1 a 3), `h` (horas ideais), `teoria` (HTML), `ex` (exemplos), `q` (questões `[enunciado, [A, B, C, D], índice da correta, comentário]`) e `fc` (flashcards `[frente, verso]`). Para acrescentar questões, basta incluir itens no array `q` do módulo.

## Sobre a prova

Segundo sites de concursos, a próxima prova é a do CFS 2/2027, prevista para 22/11/2026. São 96 questões objetivas com 4 alternativas. Confirme datas e regras no edital oficial, em https://ingresso.eear.fab.mil.br.

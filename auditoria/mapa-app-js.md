# Mapa do `curso/app.js` e plano de divisão

Levantamento de 2026-11-08, no commit `bd00222`. O arquivo tem 1.711 linhas e é o único acima do `max-lines` (350) do
`eslint.config.mjs`.

## Estrutura

O app inteiro é uma função imediata, `(function () { 'use strict'; … })();`. As seções abaixo compartilham variáveis
locais dessa função e se chamam diretamente.

| Seção | Linhas | Tamanho | Funções | Estado próprio (`let`) | Efeitos externos |
|---|---|---|---|---|---|
| cabeçalho e constantes | 1–77 | 77 | 8 | — | — |
| datas | 78–91 | 14 | 8 | — | — |
| utilidades | 92–124 | 33 | 15 | — | — |
| estado e persistência | 125–163 | 39 | 4 | `S` | — |
| certificados conquistados | 164–308 | 145 | 15 | `tSave` | localStorage, nuvem |
| conta do aluno (Firebase) | 309–398 | 90 | 6 | — | nuvem |
| status | 399–415 | 17 | 4 | — | — |
| versão dos flashcards | 416–459 | 44 | 8 | — | — |
| apostila: status e páginas | 460–524 | 65 | 13 | `io` | — |
| gerador do plano | 525–689 | 165 | 4 | `PL` | — |
| navegação | 690–699 | 10 | 1 | `V`, `QZ` | localStorage (aba) |
| componentes | 700–730 | 31 | 2 | — | — |
| telas | 731–919 | 189 | 9 | `instalar` | eventos do DOM |
| certificado de conclusão | 920–988 | 69 | 7 | — | — |
| aula (vídeo e roteiro) | 989–1095 | 107 | 11 | — | — |
| apostila | 1096–1324 | 229 | 20 | — | — |
| simulados | 1325–1440 | 116 | 9 | — | — |
| render | 1441–1491 | 51 | 4 | — | DOM |
| eventos | 1492–1712 | 221 | 2 | — | eventos do DOM, localStorage, DOM, nuvem |

Estado compartilhado por quase todas as seções: `S` (progresso do aluno, gravado em `missao-eear-v1`), `V` e `QZ`
(tela e quiz atuais), `PL` (plano calculado), `FC` (sessão de flashcards), `CARDS`, `MOD`, `Q` (índices montados a
partir de `window.EEAR`). As gravações passam por `salvar()`, que também fixa as âncoras das versões dos flashcards e
agenda a sincronização com a nuvem.

## Divisão feita (sem mudar o que é publicado)

O código-fonte do app fica em `curso/app/`, em sete arquivos com menos de 350 linhas, cortados nas fronteiras das
seções acima. `web/montar_app.py` junta os arquivos em ordem dentro da função imediata e grava `curso/app.js`, que
continua sendo o único arquivo do app publicado (lista `PUBLICAVEL` do verificador, `index.html` e service worker sem
mudança). A montagem reproduz o `app.js` anterior byte a byte, e o site montado ficou idêntico ao do commit `bd00222`.

| Arquivo | Seções | Linhas |
|---|---|---|
| `01-base.js` | constantes, datas, utilidades, estado e persistência | 161 |
| `02-progresso-nuvem.js` | certificados conquistados, conta e nuvem | 235 |
| `03-plano.js` | status, versões dos flashcards, apostila (status), gerador do plano | 291 |
| `04-telas.js` | navegação, componentes, telas, certificado de conclusão | 299 |
| `05-aula-apostila.js` | aula (vídeo e roteiro), apostila | 336 |
| `06-simulados-render.js` | simulados, render | 167 |
| `07-eventos.js` | eventos e inicialização | 219 |

Proteções contra divergência: `web/build.py` para se `curso/app.js` não for a montagem de `curso/app/`;
`python3 -I web/montar_app.py --conferir` faz a mesma checagem; os testes da plataforma também conferem. O ESLint
cobra `max-lines` nos arquivos de origem e as regras de escopo (`no-undef`, `no-unused-vars`) no `curso/app.js`
montado, onde todas as partes se enxergam.

Próximo passo possível, só se trouxer ganho claro: trocar a dependência implícita entre as partes por um objeto
compartilhado explícito, um arquivo por vez, mantendo o mesmo critério de aceite (site montado idêntico ou diferenças
revisadas e cobertas pelos testes).

Cobertura de regressão existente: `testes/plataforma.test.js` (entrada), `testes/dados.js` e `testes/versoes.js`
cobrem persistência, migração de certificados, versões dos flashcards com progresso antigo, sincronização simulada,
modalidades de Inglês, quizzes, simulados e telas.

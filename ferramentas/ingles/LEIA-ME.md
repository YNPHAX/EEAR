# Inglês por opção do edital: básico (Opção 1) e intermediário (BCT)

Branch `claude/ingles-modalidades`. Nada daqui está na `main` nem no ar.

## 1. Como o progresso antigo é preservado

O progresso fica no aparelho (`localStorage`, chave `missao-eear-v1`) e, com login, no mesmo documento da nuvem
(`alunos/{uid}/cursos/eear`). As notas, cartões e erros ficam presos ao id da aula ou da questão.

| O que o aluno já tem | Onde fica | O que esta versão faz |
|---|---|---|
| notas dos quizzes de ING01 a ING13 | `mod.ING01` … `mod.ING13` | guarda como está; nunca apaga nem muda |
| cartões de ING01 a ING13 | `fc["ING01~0"]` … | guarda como está |
| erros nas questões de ING01 a ING13 | `erros["ING01-3"]` … | guarda como está |
| erros nas questões de provas oficiais | `erros["P-<prova>-<n>"]` | guarda; os ids das questões de prova não mudam |
| vídeos vistos, passos feitos, tarefas do plano | `aula`, `feito` | guarda como está |
| histórico de simulados e o último resultado | `sims`, `ult` | guarda como está; as questões antigas continuam abrindo na correção |
| simulado em andamento | `ativo` | continua de onde parou |
| Português, Matemática e Física | `mod.POR…`, `mod.MAT…`, `mod.FIS…` | nada muda |

Regras:

1. **Nada é escolhido sozinho.** Quem já estuda continua vendo as 13 aulas de Inglês de sempre, com as notas de
   sempre, até escolher a opção. O app pergunta na tela Hoje e em Plano › Configuração.
2. **As aulas antigas não são apagadas.** ING01 a ING13 continuam no curso, sem nenhuma mudança. Depois da escolha,
   elas saem da trilha, mas a nota delas fica guardada e as questões delas continuam abrindo no histórico.
3. **Cada opção tem ids próprios:**
   - `INGB01` … `INGB13` no básico;
   - `INGI01` … `INGI14` no intermediário (o `INGI12`, discurso direto e indireto, ainda não foi escrito).

   Notas, cartões e erros de uma opção nunca aparecem na outra.
4. **Trocar de opção não apaga nada.** O progresso das duas fica guardado, e voltar para a anterior mostra tudo como
   estava.
5. **As notas antigas não são copiadas para as aulas novas.** Essa é a decisão pendente:
   - **A:** copiar a nota do quiz de ING01–13 para a aula equivalente da opção escolhida;
   - **B:** recomeçar o Inglês nas aulas novas.

   Como as aulas novas começam com o mesmo conteúdo das antigas, a opção A é segura hoje. Nada foi copiado até a
   sua decisão.
6. **Versões antigas do app** ignoram os campos novos (`cfg.modalidade`, `mod.INGB…`) e não os apagam: quem abrir uma
   versão antiga continua vendo o progresso antigo. Exceção conhecida: a tela "Correção do último" de uma versão
   antiga não abre se o último simulado tiver questões das aulas novas. O risco é baixo, porque o site se atualiza
   sozinho e o APK antigo guarda o progresso em outro lugar.
7. **Copiar e colar progresso** e a nuvem levam a opção junto, dentro de `cfg`.

## 2. O que muda no curso

- **Trilha, plano, quiz, cartões, caderno de erros, simulado completo e simulado por matéria:**
  - Português, Matemática e Física iguais para todos;
  - Inglês só das aulas da opção escolhida.
- **Provas anteriores:** cada prova tem a sua opção (`modalidade` em `ferramentas/provas/provas.json`). O aluno vê só as
  da opção dele. As questões de Inglês de cada prova apontam para a aula da opção (`INGB` ou `INGI`).
- **Simulado com questões oficiais:**
  - o Inglês vem só das provas da opção escolhida;
  - Português, Matemática e Física também vêm só das provas da opção. Assim, a mesma edição nunca entra duas
    vezes: as questões de Português, Matemática e Física são iguais na Opção 1 e na BCT da mesma edição;
  - sem opção escolhida, o botão pede a escolha. Antes, ele misturava o inglês das duas opções.
- **Certificado de Inglês e do curso completo:** diz o nível e exige as aulas de Inglês da opção.

## 3. Conteúdo das aulas novas

As 27 aulas novas (`curso/dados/ing-basico.js` e `curso/dados/ing-bct.js`) são **cópias** das 13 atuais, feitas
uma vez por `ferramentas/ingles/copiar.js`. Depois de criadas, cada arquivo é editado sozinho: mudar uma opção não
muda a outra nem as aulas antigas.

| Aula atual | Básico | Intermediário |
|---|---|---|
| ING01 a ING10 | INGB01 a INGB10 | INGI01 a INGI10 |
| ING11 (passiva e discurso indireto) | INGB11 | INGI11 (o discurso indireto vai para INGI12, quando for escrito) |
| ING12 (preposições, conectivos, quantificadores) | INGB12 | INGI13 |
| ING13 (gerúndio, phrasal verbs, tags, formação de palavras) | INGB13 | INGI14 |

Por enquanto, o conteúdo é o mesmo nas duas opções. Para diferenciar, é preciso escrever conteúdo novo, que só entra
com a sua revisão:

- **Básico:** sinônimos e antônimos, imperativo, pronomes e advérbios interrogativos. Avaliar se saem past perfect,
  present perfect continuous, third conditional e discurso indireto, que não estão no programa do básico.
- **Intermediário:**
  - determinantes e numerais;
  - voz reflexiva;
  - forma verbal enfática e tag answers;
  - marcadores do discurso e período composto;
  - pronomes e advérbios interrogativos;
  - a aula INGI12 (discurso direto e indireto), separada de INGI11.

**As condicionais ficam no intermediário.** A tabela aprovada tirava as condicionais do INGI10, mas as provas BCT
cobram condicionais e wish:

- CFS 1/2023 BCT, questões 27 e 40 (condicionais) e 33 (wish);
- CFS 1/2024 BCT, questão 48;
- CFS 2/2022 BCT, questão 31;
- CFS 2/2024 BCT, questão 48.

As videoaulas de cada aula nova são as mesmas da aula de origem.

Cada cópia guarda a aula de origem no campo `de` (por exemplo, o INGI13 tem `de: 'ING12'`). Ele serve para duas
coisas:
- na versão pessoal, os exercícios da apostila continuam ligados à aula certa da opção;
- se a opção A for aprovada, é por ele que as notas antigas seriam copiadas.

## 4. Testes

`testes/ingles.test.js` confere:
- a separação: aulas, cartões, caderno de erros, provas, simulado completo e simulado misto;
- a troca de opção, ida e volta;
- o progresso de antes (notas, cartões, erros e vídeos de ING01 a ING13), que continua inteiro depois da escolha;
- o certificado com o nível.

Os testes de navegador e de progresso abrem as aulas das três situações: sem opção, básico e BCT.

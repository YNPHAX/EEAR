# Auditoria de engenharia e qualidade

Análise de 2026-11-08, na branch `claude/engenharia-qualidade`, a partir de `a5340a0` (PR #18). Telas e aparelhos
foram **simulados no Chromium** (Playwright). Nenhum aparelho real, APK instalado, iOS ou Firebase real foi usado. Todos
os testes usam dados fictícios.

## Linha de base

- `node testes/plataforma.test.js`: 138 verificações, 0 falhas (2 min 51 s).
- ESLint 9.17.0: 0 erros e 0 avisos.
- `montar_app.py --conferir`, autoteste (172 casos), `validar` e `conferir-workflows`: OK.

## Arquitetura (resumo)

- **App:** uma página só, sem framework nem dependências. O código fica em `curso/app/01..07` e é montado em
  `curso/app.js`. O estado está em `S` (progresso), `V` (tela atual) e `FC`/`QZ` (sessões de flashcards e quiz, só na
  memória). Toda tela é redesenhada por `render()` com `innerHTML`, a partir de modelos de texto.
- **Persistência:** `localStorage` `missao-eear-v1`, com o progresso inteiro gravado a cada ação. `mesclar()`
  normaliza o que foi lido e completa campos novos. A nuvem (Firebase, desligada no repositório) guarda o mesmo JSON
  como texto.
- **Service worker:** a versão é o hash dos arquivos e a instalação é atômica (`addAll`), com cache primeiro e
  funcionamento offline. As imagens das provas entram no cache quando são abertas. Não encontrei defeito.
- **Avaliação:** a arquitetura atende ao uso atual e não precisa ser reescrita. O ponto frágil era a mistura de dados
  do aluno com HTML nos modelos de texto (veja Segurança).

## Achados

| # | Gravidade | Área | Achado | Situação |
|---|---|---|---|---|
| 1 | **Alta** | Segurança | XSS por progresso colado (Plano › Dados › Colar progresso): data da prova, início do plano, tentativas do quiz, contagem do caderno de erros e código do certificado entravam no HTML sem escape. Um "código de progresso" compartilhado num grupo executava script; com a nuvem ligada, o script iria para a conta e voltaria nos outros aparelhos. Reproduzido: o script executou 5 vezes. | **Corrigido** (`514ec57`) |
| 2 | **Alta** | Integridade | Progresso com entradas malformadas travava telas sem volta: simulados sem placar ou nulos deixavam Hoje e Plano em branco (e Plano › Dados, onde se zera ou cola o progresso, ficava inacessível). Simulado em andamento corrompido, ou com questão que saiu do curso numa atualização, quebrava a tela do simulado. | **Corrigido** (`514ec57`) |
| 3 | **Média** | Integridade | Progresso ilegível (JSON corrompido, ou formato de uma versão futura aberto por um app antigo em cache) era apagado no primeiro salvamento. | **Corrigido:** uma cópia exata fica em `missao-eear-v1-recuperar`, e a tela Hoje oferece copiá-la ou descartá-la |
| 4 | **Média** | Integridade | Com o armazenamento cheio ou bloqueado, o app dizia "Progresso salvo neste aparelho" sem salvar nada. | **Corrigido:** aviso em Hoje e em Plano › Dados |
| 5 | **Média** | Acessibilidade | As tabelas de notas e do histórico de simulados rolam na horizontal, mas não recebiam foco pelo teclado (axe: `scrollable-region-focusable`). | **Corrigido** (`7384575`) |
| 6 | **Alta (latente)** | Sincronização | A nuvem resolve conflitos por "último a gravar vence" com o documento inteiro. Exemplo: o aluno estuda offline no celular, depois estuda no computador; quando o celular conecta, o progresso offline dele é descartado (só os certificados são unidos). Hoje não afeta ninguém, porque o Firebase está desligado. | **Corrigido** na branch `claude/sync-acessibilidade` (união em três vias; veja `curso/app/08-uniao-nuvem.js`) |
| 7 | Média | Acessibilidade | Com a fonte do sistema ampliada a partir de 130% (em 320 px) ou de 175% (em 360 px), a página rola para o lado. A causa principal é a contagem "T−N DIAS" no topo, que não quebra linha; a barra de abas também não encolhe. Em 320 px com fonte normal, a contagem já ocupa 11 px da margem. | **Corrigido** na branch `claude/sync-acessibilidade` com consultas de contêiner em rem, sem mudar a aparência com a fonte padrão |
| 8 | Baixa | Dependências | `npm audit` em `app/`: 0 vulnerabilidades em produção; 3 moderadas (glob e minimatch, via `@capacitor/assets`), usadas só no CI para gerar ícones. | **Mantido:** a única correção sobe glob (13 → 14) e minimatch (10 → 11) de versão principal; o código vulnerável (rimraf em `cap migrate` e no build de iOS) não roda no fluxo do projeto. Detalhes no relatório da branch `claude/sync-acessibilidade` |
| 9 | Baixa | Privacidade | Com a nuvem ligada, o documento `alunos/{uid}` guarda nome e e-mail em campos separados, além do progresso. O e-mail já está no Firebase Auth; repetir no documento não é necessário. | **Documentado** para a revisão de LGPD |
| 10 | Baixa | Segurança | Não há Content-Security-Policy. Depois do item 1, nenhum vetor de injeção conhecido permanece, mas uma CSP seria a segunda barreira. Ela precisa liberar o gstatic (Firebase), o YouTube (nocookie) e as fontes. | **Documentado:** mexe no carregamento do Firebase e do YouTube; testar com o Firebase real |
| 11 | Baixa | Integridade | Quiz interrompido (app fechado no meio) não guarda as respostas parciais. Flashcards e simulados guardam a cada resposta. | Comportamento atual mantido (quiz curto); documentado |

### Proposta para o achado 6 (não implementada)

Trocar "último vence" por uma união campo a campo:
- **Aulas:** melhor nota e data mais antiga de domínio.
- **Flashcards:** o registro revisado mais recentemente.
- **Caderno de erros:** união.
- **Simulados:** união por data e tipo.
- **Configuração:** a mais recente.

Requisitos antes de ligar o Firebase:
- testes com dois aparelhos simulados e cenários offline;
- autorização, porque altera como o progresso é gravado.

## Desempenho (medido, sem otimização necessária)

Progresso grande: todas as aulas, os 542 cartões, 300 erros, 60 simulados (27 KB).

| Medida | Resultado |
|---|---|
| Carregamento com CPU 4× mais lenta (servidor local) | 110–125 ms até o DOM pronto |
| Render de cada tela (CPU 4×) | Hoje 4 ms, Plano 5 ms, Matérias 2 ms, Treino 28 ms, Simulados 4 ms |
| Memória JS após 200 e 400 trocas de tela | 2,3 → 2,5 → 2,5 MB (sem crescimento) |
| Download do núcleo (gzip) | `app.js` 44 KB, `index.html` 8 KB, dados do curso ≈ 175 KB; provas e imagens entram sob demanda |

Nenhum gargalo demonstrado; nada foi otimizado.

## Acessibilidade (simulada)

- **axe-core 4.10 (WCAG 2.1 A/AA):** rodou em Hoje, Plano, Matérias, Aula, Quiz, Treino, Flashcards, Simulados,
  Simulado e Certificado, nos temas claro e escuro, em 390 × 844 e 1280 × 800. Depois da correção 5, não há violações.
- **Teclado:** 57 paradas de foco em Hoje, Plano, Treino e Simulados, nos dois temas, todas com indicador visível. As
  caixas dos dias da semana mostram o foco no rótulo ao lado.
- **Refluxo:** em 320 px (equivale a 400% de zoom em 1280 px) e em 360 × 640, sem rolagem lateral com fonte normal.
  Com fonte ampliada, veja o achado 7.
- **Não testado:** leitores de tela reais (TalkBack, VoiceOver), orientação horizontal em aparelho e fonte do sistema
  no Android real. A ampliação de fonte foi simulada pelo tamanho da fonte da página.

## Auditoria pedagógica automatizada (somente leitura)

Escopo: 69 aulas, 689 questões de quiz, 542 flashcards e 2 provas oficiais publicadas (192 questões).

| Verificação | Resultado |
|---|---|
| IDs de aula duplicados | Nenhum |
| HTML desbalanceado (teoria, exemplos, questões, cartões) | Nenhum |
| Gabarito ausente ou fora de A–D; questão sem comentário | Nenhum |
| Alternativas repetidas (já coberto por `testes/dados.js`) | Nenhuma |
| Provas: número repetido, gabarito inválido, aula de referência inexistente, questão sem enunciado | Nenhum |
| Videoaulas ligadas a aula inexistente | Nenhuma |
| Flashcards com a mesma frente em aulas diferentes | Nenhum |
| Cartões com mais de 420 caracteres | Nenhum |

**9 sinais para revisão humana, todos conferidos à mão e corretos:**
- **8 questões em que o valor da alternativa certa não aparece no comentário:** MAT06-0, MAT06-1, MAT08-7, MAT10-4,
  MAT14-7, MAT16-0, MAT20-6 e FIS01-9. O valor está implícito, por exemplo "2⁵ = 32" para log₂ 32 = 5.
- **ING02-1 e ING02-5:** têm o mesmo enunciado genérico, mas cobram regras diferentes ("information" e "news").

**Sugestão opcional, que depende de você:** deixar o resultado explícito nesses 8 comentários, por exemplo "Ângulo
inscrito = metade do arco: 100° ÷ 2 = 50°" na MAT16-0. Nada foi alterado.

## Testes adicionados

`testes/robustez.js` tem 15 verificações; 10 falham na versão anterior e todas passam nesta:
- **Segurança:** progresso colado com HTML e script em todos os campos não executa nada, e o nome aparece como
  texto.
- **Progresso malformado:** 4 cenários abrem todas as telas sem erro, Plano › Dados continua acessível, e abrir o
  app não regrava o progresso.
- **Questão removida do curso:** o simulado em andamento continua com as questões restantes, mantém a resposta dada
  e registra a entrega.
- **Progresso ilegível:** JSON corrompido e formato futuro geram uma cópia exata antes de qualquer gravação, com
  aviso. "Descartar" apaga só a cópia, e um progresso válido não gera aviso.
- **Armazenamento que não grava:** o aluno vê o aviso, e com armazenamento normal nada é mostrado.

## Pendências que dependem do proprietário

1. Autorizar e especificar a união de progresso na nuvem (achado 6) antes de ligar o Firebase.
2. Decidir o desenho do topo para fontes ampliadas (achado 7).
3. Autorizar a atualização de `@capacitor/assets` (achado 8) ou aceitar o risco de build.
4. Revisão de LGPD: dados no documento da nuvem (achado 9) e política de privacidade para a versão paga.
5. Opcional: comentários com o resultado explícito nas 8 questões listadas.
6. Testes em aparelhos reais (Android, APK instalado, iOS) e com leitores de tela.

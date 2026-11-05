# Revisão das questões do curso (Etapa 2)

Data: novembro de 2026. Base: branch `claude/etapa2-completude`, criada a partir do PR #14 (`9feb4a0`).

Escopo: as 689 questões inéditas dos módulos em `curso/dados/` (642 que já existiam e 47 escritas nesta etapa). As
questões das provas oficiais (`curso/dados/provas.js`) usam o gabarito oficial da EEAR e não foram revisadas uma a uma
aqui; nesta etapa só mudou a aula ligada a 3 delas (seção 5).

Critério de cada questão: enunciado claro, alternativas distintas e plausíveis, exatamente uma alternativa correta,
gabarito e comentário corretos, e conteúdo coerente com o edital do CFS 2/2027.

Método: leitura de cada questão com o gabarito e o comentário; contas refeitas à mão em Matemática e Física; recálculo
automático de 107 itens numéricos de Física; busca automática por alternativas de mesmo valor e por enunciados que
falam em "destacado" sem destaque. As duas buscas automáticas passaram a fazer parte de `testes/plataforma.test.js`.

## 1. As 642 questões que já existiam

Cada linha: módulo, questões revisadas, resultado. "Corrigida" quer dizer que o problema foi resolvido nesta etapa
(seção 4).

### Matemática (200)
- MAT01: 1 a 10, ok (geratrizes 3/11 e 37/30, intervalos e partes de conjunto refeitos).
- MAT02: 1 a 10, ok.
- MAT03: 1 a 10, ok.
- MAT04: 1 a 10, ok. Observação: o comentário da q4 escreve "|−7|" para |3 − 10|; o resultado está certo e não foi alterado.
- MAT05: 1 a 10, ok.
- MAT06: 1 a 10, ok.
- MAT07: 1 a 10, ok (q10: 1,5; 4,5; 13,5 tem razão 3).
- MAT08: 1 a 10, ok (q3 refeita por Sarrus: 40 − 39 = 1).
- MAT09: 1 a 10, ok.
- MAT10: 1 a 10, ok. Observação: q7 e q8 tratam de binômio de Newton, que o edital do CFS 2/2027 não lista. Mantidas.
- MAT11: 1 a 10. **q5 corrigida**: tinha duas alternativas certas (B = 5/14 e D = 10/28 = 5/14). Demais ok.
- MAT12: 1 a 10. **q5 corrigida**: era ambígua (variância de 2, 4 e 6 é 8/3 se populacional e 4 se amostral, e 4 era a alternativa A). Observação: q5 e q7 (variância e desvio padrão) estão fora do item 4.5 do edital, que lista só moda, média e mediana. Mantidas. Demais ok.
- MAT13: 1 a 10, ok (leis dos senos e dos cossenos refeitas).
- MAT14: 1 a 10, ok.
- MAT15: 1 a 10, ok.
- MAT16: 1 a 10, ok (fórmula de Heron e potência de ponto refeitas).
- MAT17: 1 a 10, ok.
- MAT18: 1 a 10, ok.
- MAT19: 1 a 10, ok (quociente e fórmula de Moivre refeitos).
- MAT20: 1 a 10, ok (Ruffini e relações de Girard refeitos).

### Física (170)
- FIS01: 1 a 10, ok (72 km/h = 20 m/s; ordem de grandeza 10⁵; resultantes 10 N e 2 N; 5√3 N). A q2 tem formas equivalentes de 4,5 × 10⁻⁴ como distratores de propósito, porque pede a notação científica.
- FIS02: 1 a 10, ok (velocidades médias 80 e 40 km/h; encontro em 10 s; 1020 m).
- FIS03: 1 a 10, ok (Torricelli; queda livre 45 m e 20 m; v₀ = 2 m/s e a = 6 m/s²).
- FIS04: 1 a 10, ok (alcance 30 m; 45°; 2 Hz; 60 rpm).
- FIS05: 1 a 10, ok (elevador 720 N; blocos 12 N; 4000 N).
- FIS06: 1 a 10, ok (τ = 250 J; energia elástica 2 J; ΔEc = 150 000 J; 30 kWh).
- FIS07: 1 a 10, ok (recuo 2 m/s; explosão −4 m/s; força média 600 N).
- FIS08: 1 a 10, ok (4^(3/2) = 8; g' = 5 m/s²; g/4).
- FIS09: 1 a 10, ok (reações 200 N e 100 N; centro de massa em 3 m).
- FIS10: 1 a 10, ok (Stevin 3 × 10⁵ Pa; prensa 1000 N; empuxo 20 N).
- FIS11: 1 a 10, ok (77 °F; ΔF = 18 °F; ΔL = 3,6 cm; mistura a 35 °C).
- FIS12: 1 a 10, ok (Carnot 40%; τ = 600 J; p₂ = 3 atm).
- FIS13: 1 a 10, ok (λ = 0,5 m; T = π s e 0,2π s; eco a 340 m).
- FIS14: 1 a 10, ok (espelho: p' = 15 cm; Snell: 30°; lente: p' = 40 cm; 2 di).
- FIS15: 1 a 10, ok (2 × 10¹³ elétrons; 0,6 N; 9 × 10⁵ N/C; 6 × 10⁴ V; 1,2 × 10⁻⁴ J).
- FIS16: 1 a 10, ok (paralelo 2 Ω; gerador 2 A; misto 6 Ω).
- FIS17: 1 a 10, ok (B = 1 × 10⁻⁵ T; forças 1 × 10⁻⁴ N e 0,5 N; transformador 550 V; fem 2 V).

### Português (140)
- POR01: 1 a 10, ok (pressuposto e subentendido, coesão, concessão).
- POR02: 1 a 10, ok (táxi com 4 letras e 5 fonemas; chinelo com 6 fonemas; ex-ce-ção; psi-co-lo-gi-a). Observação: na q2, "quando" também tem o dígrafo vocálico "an", o que não muda o gabarito, porque "água" não tem dígrafo.
- POR03: 1 a 10, ok (Acordo Ortográfico: ideia, voo, autoescola, micro-ondas, antissocial).
- POR04: 1 a 10, ok (emudecer como parassintética; aglutinação e justaposição).
- POR05: 1 a 10. **q3 corrigida**: o distrator "ilhéu" também aparece em dicionários como adjetivo "relativo a ilha", então podia ser defendido. Demais ok.
- POR06: 1 a 10, ok (próclise, mesóclise, cujo, pronomes de tratamento).
- POR07: 1 a 10. **q5 corrigida**: o distrator "tinha aceito" é aceito por parte das gramáticas e do uso culto, então podia ser defendido. Demais ok.
- POR08: 1 a 10. **q4 corrigida**: falava em "oração destacada" sem destaque no texto. Demais ok.
- POR09: 1 a 10, ok (na q10, o destaque da alternativa A está em "o documento", objeto direto).
- POR10: 1 a 10. **q1 e q5 corrigidas**: falavam em "oração destacada" sem destaque no texto. Gabaritos ok.
- POR11: 1 a 10, ok (verbos impessoais, passiva sintética, meio-dia e meia, bastante(s), é necessário).
- POR12: 1 a 10, ok (aspirar a, implicar como transitivo direto, crase com Bahia, Roma e Recife, crase facultativa antes de possessivo).
- POR13: 1 a 10, ok (vírgula entre sujeito e verbo, zeugma, adjetiva explicativa).
- POR14: 1 a 10. **q4 corrigida**: erro de gênero no enunciado ("um gilete novo"). Gabaritos ok.

### Inglês (132)
- ING01: 1 a 10, ok (falsos cognatos pretend, actually, realize, library).
- ING02: 1 a 10, ok (plurais irregulares, incontáveis, a/an, genitivo).
- ING03: 1 a 11, ok (ours, its, each other, whose).
- ING04: 1 a 10, ok (comparativos, hardly, ordem dos adjetivos).
- ING05: 1 a 10. **q10 corrigida**: o distrator "We fly to Natal next Friday" também é inglês correto para viagem com horário fixo (presente simples de agenda). Gabaritos ok.
- ING06: 1 a 8, ok (fly/flew, did + verbo base, past continuous interrompido).
- ING07: 1 a 8, ok (since/for, ever/yet/just, ago com simple past).
- ING08: 1 a 8. **q8 corrigida**: o distrator "I meet the captain at 3 p.m. tomorrow" podia ser lido como agenda, pelo mesmo motivo da ING05 q10. Gabaritos ok.
- ING09: 1 a 9, ok (mustn't e don't have to, could, will be able to, might).
- ING10: 1 a 5, ok (zero, first e second conditional; unless).
- ING11: 1 a 5. **q1 corrigida**: afirmava que Santos Dumont fez "o primeiro avião", fato disputado fora do Brasil (a ING01 q3 já fala com cuidado em "one of the first powered flights in Europe"). Gabaritos ok.
- ING12: 1 a 10, ok (at/on/in, despite e although, much, a few, enough, on the plane).
- ING13: 1 a 12, ok (avoid + -ing, question tags, look forward to, remember + -ing).
- ING14: 1 a 5, ok (past perfect, present perfect continuous, future perfect e future continuous).
- ING15: 1 a 5, ok (backshift, will → would, pergunta indireta, forma enfática). Observação: na q1, "is" seria aceitável se o fato ainda vale, mas sem contexto o padrão escolar é o recuo para "was". Mantida.
- ING16: 1 a 6, ok (either, every, -ing e -ed, however, coordenação).

Total: 642 de 642 revisadas (MAT 200, FIS 170, POR 140, ING 132).

## 2. As 47 questões escritas nesta etapa

Cada questão nova foi conferida pelo mesmo critério depois de escrita. As contas de Física foram refeitas por script.
Todas foram acrescentadas no fim das listas, para não mudar os índices que o progresso salvo usa.

- FIS15 (Lei de Gauss e superfícies equipotenciais, item 5.5 do edital): q11 a q14. Conferidos o fluxo nulo com carga interna total zero e o campo de esfera condutora (0 dentro; 4,5 × 10⁵ N/C a 20 cm; distratores 7,2 × 10⁶ e 1,8 × 10⁶ N/C).
- FIS18 (Matéria e radiação, item 5.8 do edital), aula nova: q1 a q14. As q1 a q10 vêm de uma versão anterior desta aula, que estava só na branch `claude/eear-study-hydwqt`, e foram revisadas de novo (fóton de 1,0 × 10¹⁵ Hz com 6,6 × 10⁻¹⁹ J; Ec,máx = 1,5 eV; fissão com 3 nêutrons; meia-vida, 80 g → 10 g em 3 meias-vidas). As q11 a q14 são novas (radiografia, intensidade I/4, material ferromagnético, fotocélula).
- POR15 (Tipos de discurso), aula nova: q1 a q10. Conferidas as transposições (estou → estava; farei → faria, com "amanhã" → "no dia seguinte" quando o relato é feito dias depois; imperativo → imperfeito do subjuntivo; pergunta com "se"; este → aquele) e a identificação do discurso indireto livre.
- ING11 (voz passiva): q6 a q10 (futuro, past continuous, simple past, passagem para a ativa, pergunta na passiva).
- ING14 (BCT, perfect tenses): q6 a q10.
- ING15 (BCT, reported speech e forma enfática): q6 a q10. Na q9, o enunciado traz "yesterday", para que o present perfect fique errado sem discussão.
- ING16 (BCT, determiners, numerals e marcadores): q7 a q10.

Total: 47 novas (FIS 18, POR 10, ING 19). Com as 642 antigas, são 689 questões revisadas.

## 3. Verificação automática

- **Alternativas de mesmo valor na mesma questão** (por exemplo, 5/14 e 10/28): procura em todas as questões cujas alternativas são números, frações ou números com unidade (233 questões com as 4 alternativas numéricas). Ficam de fora as questões que pedem notação científica, em que as formas equivalentes são distratores de propósito (FIS01 q2). Antes das correções, a busca acusava a MAT11 q5; depois, nada. Está em `testes/plataforma.test.js`.
- **Enunciado que fala em termo "destacado" sem destaque marcado**: antes acusava POR08 q4, POR10 q1 e POR10 q5; depois, nada. Está em `testes/plataforma.test.js`.
- **Recálculo de 107 itens numéricos de Física** (FIS01 a FIS18), com a fórmula de cada um, conferindo o resultado com a alternativa marcada. Os 107 estão certos. Em 3 deles (FIS05 q5, FIS06 q1, FIS14 q3) o analisador de texto lê duas alternativas com o mesmo número inicial ("5" e "5√3"; "15 cm, real" e "15 cm, virtual"); essas foram conferidas à mão. O script desse recálculo foi temporário e não está no repositório.
- **Matemática**: as contas foram refeitas à mão (seção 1). Não há recálculo automático das 200 questões de Matemática.

Para conferir que os testes novos pegam os defeitos, `testes/plataforma.test.js` foi rodado também sobre os dados de antes
das correções (`9feb4a0`): acusou a MAT11 q5, as 3 orações sem destaque e as questões oficiais de física moderna fora da FIS18.

## 4. Correções aplicadas

As correções mudam só texto. A ordem das alternativas e o índice da alternativa correta continuam os mesmos, então o
progresso salvo (que guarda módulo e número da questão) continua valendo.

| Questão | Problema | Correção |
|---|---|---|
| MAT11 q5 | duas alternativas certas (5/14 e 10/28) | D "10/28" → "15/56"; o comentário explica 25/64 (com reposição) e 15/56 (vermelha e depois azul) |
| MAT12 q5 | variância populacional ou amostral | enunciado: "variância populacional (soma dos quadrados dos desvios dividida por n)"; o comentário cita a amostral (4) |
| POR05 q3 | distrator defensável ("ilhéu") | B → "fluvial" |
| POR07 q5 | distrator defensável ("tinha aceito") | B → "O preso foi soltado ontem." (com ser, o certo é "solto") |
| POR08 q4 | "oração destacada" sem destaque | oração sublinhada: "À medida que o avião subia" |
| POR10 q1 | "oração destacada" sem destaque | oração sublinhada: "que todos cheguem cedo" |
| POR10 q5 | "oração destacada" sem destaque | oração sublinhada: "de que a prova começa às 13h" |
| POR14 q4 | erro de gênero ("um gilete novo") | "uma gilete nova" |
| ING05 q10 | distrator também correto ("fly") | A → "flew" |
| ING08 q8 | distrator também correto ("meet") | A → "meets" |
| ING11 q1 | fato disputado ("The first airplane") | "The 14-bis ___ by Santos Dumont in 1906." |

## 5. Questões oficiais ligadas a outra aula

Três questões oficiais de física moderna estavam ligadas a aulas de outro assunto, porque a aula FIS18 não existia.
O assunto foi conferido pela imagem de cada questão, e o gabarito oficial foi recalculado:

- CFS 2/2025, questão 51 (efeito fotoelétrico, comprimento de onda do fóton): de FIS13 para FIS18. Gabarito oficial A, 1,5 × 10⁻⁷ m, confere.
- CFS 2/2025, questão 68 (átomo de Bohr, salto de n = 2 para n = 1): de FIS13 para FIS18. Gabarito oficial B (fóton emitido de 10,2 eV) confere.
- CFS 1/2025, questão 51 (fissão do urânio-235): de FIS01 para FIS18. Gabarito oficial B (três nêutrons) confere.

## 6. Limitações

- A revisão foi feita por um único revisor (Claude, assistente de IA), sem validação de professor de cada matéria.
- Não há dados de acerto dos alunos para medir a dificuldade real das questões.
- Pontos de gramática com divergência entre autores foram resolvidos trocando o distrator discutível; outros casos de uso variável podem existir.
- As questões das provas oficiais não foram revisadas uma a uma nesta etapa.

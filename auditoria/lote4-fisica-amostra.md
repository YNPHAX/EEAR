# Lote 4 — flashcards de Física: auditoria e amostra para aprovação

Levantamento de 2026-11-08 (branch `claude/continuidade-eear`). Nenhum cartão de Física foi alterado: este documento só
propõe mudanças, que dependem de aprovação.

## Auditoria dos 157 cartões (18 aulas)

| Classificação | Cartões |
|---|---|
| Regra ou definição direta, a reformular | 48 |
| Com erro ou imprecisão (classificação anterior) | 1 — FIS08~2 |
| Memorização (fórmulas, valores, unidades) | 99 |
| Já pedem aplicação | 9 |

Pontos encontrados nesta revisão, além da classificação anterior:

- **FIS08~2 (erro confirmado):** "T²/R³ = constante" sem dizer que só vale para corpos que orbitam o mesmo corpo central.
- **FIS02~0 (imprecisão):** "Velocidade média → Δs/Δt (distância total ÷ tempo total)" mistura a variação de posição
  (Δs) com a distância percorrida, que diferem quando o móvel volta. É uma pegadinha clássica de prova.
- **Hipóteses ausentes em cartões de memorização** (ajuste curto, sem mudar a fórmula): FIS04~2 (alcance máximo em 45°
  só com lançamento e chegada no mesmo nível, sem resistência do ar) e FIS06~5 (v = √(2gh) só partindo do repouso e
  sem perdas).
- Como em Matemática, parte dos 99 cartões de memorização ganha com aplicação curta (fórmula usada num caso numérico).
  A lista final é proposta na implementação, depois da aprovação desta amostra.

## Amostra (12 cartões de 12 aulas, todos com versão 2)

Contas conferidas por cálculo independente (g = 10 m/s² quando indicado).

| ID | Atual | Frente proposta | Verso proposto | Habilidade |
|---|---|---|---|---|
| FIS02~0 | Velocidade média → Δs/Δt (distância total ÷ tempo total) | Um carro anda 60 km para o norte em 1 h e volta 30 km para o sul em 0,5 h. Calcule a velocidade média (deslocamento ÷ tempo) e a rapidez média (distância percorrida ÷ tempo). | Deslocamento: 30 km para o norte em 1,5 h → velocidade média de 20 km/h, para o norte. Distância percorrida: 90 km → rapidez média de 60 km/h. As duas coincidem quando o móvel não muda de sentido, como nos trechos em sequência que o curso resolve com "distância total ÷ tempo total". | distinguir deslocamento e distância percorrida |
| FIS03~3 | Área do gráfico v × t → Deslocamento | No gráfico v × t, um corpo fica a 10 m/s durante 2 s e depois freia em linha reta até parar em mais 4 s. Qual é o deslocamento total? | É a área sob o gráfico: retângulo 10 · 2 = 20 m mais triângulo 4 · 10/2 = 20 m, total 40 m. | interpretar gráfico |
| FIS04~2 | Alcance do lançamento oblíquo → A = v₀²·sen 2θ/g (máximo em 45°) | Dois projéteis saem a 20 m/s, um a 30° e outro a 60°, e caem no mesmo nível (g = 10 m/s², sem resistência do ar). Qual vai mais longe? | Nenhum: sen 60° = sen 120°, então os dois alcançam 400 · (√3/2)/10 = 20√3 ≈ 34,6 m. Ângulos complementares dão o mesmo alcance; o máximo é em 45°. | aplicar fórmula e hipótese |
| FIS05~2 | 3ª lei de Newton → ação e reação | Um caminhão bate de frente num carro. Qual dos dois recebe a força maior? Qual sofre a maior aceleração? | As forças têm a mesma intensidade (ação e reação, em corpos diferentes). O carro sofre a maior aceleração, porque tem menor massa (a = F/m). | identificar erro de raciocínio |
| FIS06~5 | Velocidade após queda de altura h → v = √(2gh) | De que altura um objeto deve cair, a partir do repouso e sem resistência do ar, para chegar ao solo a 30 m/s (g = 10 m/s²)? | v² = 2gh → h = 30²/(2 · 10) = 45 m. A relação vale partindo do repouso e sem perdas de energia. | usar a fórmula ao contrário, com hipóteses |
| FIS07~7 | Massas iguais, choque elástico → trocam de velocidade | Numa mesma reta, a bola A (2 kg, 3 m/s) alcança por trás a bola B (2 kg, 1 m/s), que segue no mesmo sentido. A colisão é elástica e unidimensional. Quais são as velocidades depois? | Com massas iguais, numa colisão elástica unidimensional, as velocidades se trocam: A fica com 1 m/s e B com 3 m/s, ambas no mesmo sentido inicial. Conferência: Q = 8 kg·m/s e Ec = 10 J antes e depois. | aplicar propriedade e conferir |
| FIS08~2 | 3ª lei de Kepler → T²/R³ = constante | Dois satélites orbitam a Terra, e o período de B é 27 vezes o de A. Quantas vezes o raio da órbita de B é maior? A mesma constante vale para um satélite de Marte? | Mesmo corpo central: T²/R³ é igual para os dois, então (R_B/R_A)³ = 27² → R_B/R_A = 27^(2/3) = 9. Para Marte, não: a constante depende da massa do corpo central. | aplicar lei com hipótese (corrige o erro) |
| FIS10~7 | Peso aparente → P − E | Um bloco de 2 kg e 500 cm³ está totalmente submerso em água (g = 10 m/s²). Qual é o seu peso aparente? | P = 20 N; E = 1000 · 5 × 10⁻⁴ · 10 = 5 N. Peso aparente = 20 − 5 = 15 N. | calcular |
| FIS11~7 | Única propagação no vácuo → Irradiação | Por que a garrafa térmica tem vácuo entre as paredes, e por que essas paredes são espelhadas? | O vácuo impede a condução e a convecção, que precisam de meio material. As paredes espelhadas refletem a radiação térmica e reduzem a irradiação, a única forma de propagação que atravessa o vácuo. | interpretar fenômeno |
| FIS13~3 | O que não muda na refração → A frequência | Um som de 500 Hz passa do ar (340 m/s) para a água (1500 m/s). O que acontece com a frequência e com o comprimento de onda? | A frequência continua 500 Hz. O comprimento de onda passa de 0,68 m para 3 m (λ = v/f). | aplicar v = λf |
| FIS16~5 | Dois resistores em paralelo → produto/soma; mesma tensão | Resistores de 12 Ω e 4 Ω em paralelo são ligados a 12 V. Qual é a resistência equivalente e a corrente em cada um? | Req = 12 · 4/(12 + 4) = 3 Ω; corrente total 4 A. Mesma tensão nos dois: 12/12 = 1 A e 12/4 = 3 A (1 + 3 = 4 A). | calcular e verificar |
| FIS18~3 | Mais intensidade no efeito fotoelétrico → mais elétrons, mesma energia | Com luz acima da frequência de corte, compare: (a) dobrar a intensidade, mantendo a frequência; (b) aumentar a frequência. O que cada mudança altera nos elétrons emitidos? | (a) Aumenta o número de elétrons emitidos por segundo; a energia cinética máxima não muda. (b) A energia cinética máxima aumenta, porque Ec,máx = hf − W. | comparar grandezas |

Conferência com a teoria: cada resposta segue as fórmulas e conceitos das aulas FIS02 a FIS18 do próprio curso. Os
dados numéricos foram trocados onde repetiam quizzes das aulas (FIS03, FIS06, FIS07, FIS08, FIS11, FIS16 e FIS18);
na implementação, a comparação com os quizzes e o recálculo das contas serão automáticos, como nos lotes anteriores.

## Escopo final proposto (85 cartões distintos, todos com versão 2)

Contagem conferida por ID: 48 + 1 + 36 = 85, sem sobreposição. Ficam como estão os outros 72 dos 157 cartões
(memorização de fórmulas, constantes, unidades e os que já pedem aplicação). IDs, ordem e quantidade não mudam; o
progresso dos alunos passa pelo versionamento do Lote 0, como em Português, Inglês e Matemática.

### A. Diretos demais: 48 cartões (incluem a correção conceitual de FIS02~0)

- `FIS01~6` — Grandezas vetoriais
- `FIS02~0` — Velocidade média
- `FIS02~2` — Velocidade relativa: mesmo sentido
- `FIS02~3` — Velocidade relativa: sentidos opostos
- `FIS02~5` — Inclinação do gráfico s × t
- `FIS02~6` — Repouso e movimento
- `FIS02~7` — Deslocamento x distância
- `FIS03~3` — Área do gráfico v × t
- `FIS03~4` — Inclinação do gráfico v × t
- `FIS05~0` — 1ª lei de Newton
- `FIS05~2` — 3ª lei de Newton
- `FIS07~2` — Área do gráfico F × t
- `FIS07~6` — Coeficiente de restituição
- `FIS07~7` — Massas iguais, choque elástico
- `FIS08~0` — 1ª lei de Kepler
- `FIS08~1` — 2ª lei de Kepler
- `FIS09~2` — Alavanca interfixa
- `FIS09~3` — Alavanca inter-resistente
- `FIS09~4` — Alavanca interpotente
- `FIS09~6` — Centro de massa
- `FIS10~6` — Fração submersa de um corpo flutuante
- `FIS10~7` — Peso aparente
- `FIS11~7` — Única propagação no vácuo
- `FIS13~3` — O que não muda na refração
- `FIS13~4` — Altura do som
- `FIS13~7` — Polarização
- `FIS14~0` — Imagem no espelho plano
- `FIS14~6` — Condição de reflexão total
- `FIS14~7` — Correção da miopia e da hipermetropia
- `FIS15~2` — Eletrização por contato (esferas iguais)
- `FIS15~3` — Eletrização por indução
- `FIS15~9` — Superfície equipotencial
- `FIS16~4` — Resistores em série
- `FIS16~5` — Dois resistores em paralelo
- `FIS17~0` — Inseparabilidade dos polos
- `FIS17~1` — Polo norte geográfico da Terra
- `FIS17~6` — Lei de Lenz
- `FIS18~3` — Mais intensidade no efeito fotoelétrico
- `FIS18~4` — Dualidade da luz
- `FIS18~5` — Modelo de Thomson
- `FIS18~6` — Modelo de Rutherford
- `FIS18~7` — Modelo de Bohr
- `FIS18~10` — Radiação gama
- `FIS18~11` — Fissão x fusão
- `FIS18~13` — Espectro (menor → maior frequência)
- `FIS18~15` — Radiografia
- `FIS18~16` — Ferromagnéticos
- `FIS18~17` — Semicondutores

### B. Erro conceitual: 1 cartão

- `FIS08~2` — 3ª lei de Kepler: a constante T²/R³ só vale para corpos que orbitam o mesmo corpo central.

### C. Fórmulas que ganham aplicação: 36 cartões (FIS04~2 e FIS06~5 também ganham as hipóteses que faltam)

- `FIS01~3` — Limites da resultante de dois vetores
- `FIS01~5` — Ordem de grandeza
- `FIS02~1` — Função horária do MU
- `FIS03~2` — Equação de Torricelli
- `FIS03~5` — Altura máxima no lançamento vertical
- `FIS04~0` — Tempo de queda no lançamento horizontal
- `FIS04~2` — Alcance do lançamento oblíquo
- `FIS04~4` — rpm para Hz
- `FIS04~7` — Polias com correia
- `FIS05~3` — Força de atrito
- `FIS05~5` — Elevador subindo acelerado
- `FIS05~7` — Lei de Hooke
- `FIS06~0` — Trabalho de uma força
- `FIS06~5` — Velocidade após queda de altura h
- `FIS06~6` — Potência
- `FIS06~7` — Consumo em kWh
- `FIS07~1` — Impulso
- `FIS07~5` — Colisão perfeitamente inelástica
- `FIS08~4` — Gravidade na superfície
- `FIS09~5` — Gangorra em equilíbrio
- `FIS10~2` — Teorema de Stevin
- `FIS10~4` — Prensa hidráulica
- `FIS11~0` — Conversão entre escalas
- `FIS11~2` — Dilatação linear
- `FIS12~1` — Lei geral dos gases
- `FIS12~2` — 1ª lei da termodinâmica
- `FIS12~7` — Rendimento de Carnot
- `FIS13~1` — Período do pêndulo simples
- `FIS14~1` — Imagens entre dois espelhos
- `FIS14~2` — Equação de Gauss
- `FIS15~1` — Lei de Coulomb
- `FIS16~3` — Potência elétrica
- `FIS16~6` — Lei de Pouillet
- `FIS17~7` — Transformador
- `FIS18~1` — Efeito fotoelétrico
- `FIS18~12` — Meia-vida

Critério: a fórmula continua escrita no verso, mas a frente pede um caso numérico curto ou uma conclusão (proporção,
condição, hipótese). Ficam só como memorização as constantes, unidades e definições (por exemplo carga elementar,
calor latente do gelo, faixa audível, prefixos) e as fórmulas que já se aplicam diretamente nos quizzes da aula.

## Conferências feitas para este escopo

- **Edital** (CFS 2/2027, itens 5.1 a 5.8, cópia guardada na auditoria anterior): todos os temas dos 85 cartões estão
  no programa de Física, incluindo a física moderna do item 5.8 (aula FIS18).
- **Teoria**: os 12 exemplos foram conferidos frase a frase com a teoria das aulas; os demais 73 serão conferidos um a
  um na implementação, junto com o recálculo automático das contas.
- **Quizzes**: os 12 exemplos não repetem enunciados dos quizzes (sete foram trocados por isso); a comparação
  automática com os quizzes de cada aula será feita para os 85 na implementação.
- **Ponto da teoria para sua decisão (não alterado):** a teoria da FIS02 chama de "velocidade média" o resultado de uma
  ida e volta de 60 km em cada sentido (120 km em 3 h = 40 km/h). Numa ida e volta o deslocamento é nulo, então esse
  valor é a rapidez média (ou velocidade escalar média calculada pela distância percorrida). Proposta: acrescentar uma
  frase dizendo que, nas questões de trechos, "velocidade média" costuma significar distância total ÷ tempo total, e
  que a velocidade média pelo deslocamento é outra grandeza. O quiz 1 da aula (trechos no mesmo sentido) não muda.

## Testes previstos na implementação

1. Recálculo independente das contas dos cartões numéricos, exigindo o resultado no verso (como em Matemática).
2. Contagem: 157 cartões, 85 na versão 2 e 72 sem versão.
3. Progresso antigo com os cartões versionados (abrir não altera nada; reformulados voltam espalhados em até 7 dias).
4. Telas em 320×568, 360×740 e 390×844, builds, verificadores e ESLint.

## Implementação (2026-11-08, branch `claude/lote4-fisica`)

Autorizada pelo dono. Aplicada em quatro grupos por aula (FIS01–05, FIS06–09, FIS10–13, FIS14–18), com os testes de
dados após cada grupo.

- **84 cartões passaram à versão 2** (mesmo ID e posição; o progresso antigo continua valendo e o histórico não é
  apagado: os reformulados voltam à revisão espalhados em até 7 dias).
- **FIS17~1 ficou preservado** (73 cartões sem versão, em vez de 72): é um fato de memorização útil como está, e o
  quiz 1 da FIS17 já cobra a aplicação. Reescrevê-lo duplicaria o quiz.
- **Correção adicional encontrada na conferência individual:** FIS18~17 dizia que LEDs são de silício; LEDs usam
  outros semicondutores (compostos de gálio, por exemplo). A teoria da FIS18 já estava correta.
- **Teoria da FIS02 (autorizada):** distingue velocidade média (deslocamento ÷ tempo) e rapidez média (distância
  percorrida ÷ tempo); o exemplo de ida e volta foi mantido, com a velocidade média nula e a rapidez média de 40 km/h.
  Exemplos resolvidos e quizzes da aula não mudaram (são todos trechos no mesmo sentido).
- **Testes novos:** recálculo de 48 cartões numéricos (`testes/dados.js`), contagem 157/84/73 e progresso antigo de
  Física no navegador (`testes/versoes.js`).
- **Telas:** sem rolagem lateral nem texto cortado nas três resoluções. Para chegar aos botões de avaliação, 83
  cartões exigem rolar em 320×568 e 1 em 360×740 (FIS07~7); nenhum em 390×844. É o mesmo comportamento dos lotes
  já aprovados (Português: 100 em 320×568 e 2 em 360×740). Com a página rolada até o fim, os botões ficam livres em
  todas as resoluções.

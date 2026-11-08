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
| FIS02~0 | Velocidade média → Δs/Δt (distância total ÷ tempo total) | Um carro anda 60 km para o norte em 1 h e volta 30 km em 0,5 h. Qual é a velocidade escalar média (Δs/Δt)? E a distância percorrida dividida pelo tempo? | Δs = 60 − 30 = 30 km em 1,5 h: 20 km/h. Distância/tempo = 90/1,5 = 60 km/h. Os dois só coincidem quando o móvel não volta. | distinguir deslocamento e distância |
| FIS03~3 | Área do gráfico v × t → Deslocamento | No gráfico v × t, a velocidade sobe em linha reta de 0 a 20 m/s em 4 s. Qual é o deslocamento nesse intervalo? | Área do triângulo: 4 · 20/2 = 40 m. | interpretar gráfico |
| FIS04~2 | Alcance do lançamento oblíquo → A = v₀²·sen 2θ/g (máximo em 45°) | Dois projéteis saem a 20 m/s, um a 30° e outro a 60°, e caem no mesmo nível (g = 10 m/s², sem resistência do ar). Qual vai mais longe? | Nenhum: sen 60° = sen 120°, então os dois alcançam 400 · (√3/2)/10 = 20√3 ≈ 34,6 m. Ângulos complementares dão o mesmo alcance; o máximo é em 45°. | aplicar fórmula e hipótese |
| FIS05~2 | 3ª lei de Newton → ação e reação | Um caminhão bate de frente num carro. Qual dos dois recebe a força maior? Qual sofre a maior aceleração? | As forças têm a mesma intensidade (ação e reação, em corpos diferentes). O carro sofre a maior aceleração, porque tem menor massa (a = F/m). | identificar erro de raciocínio |
| FIS06~5 | Velocidade após queda de altura h → v = √(2gh) | Um objeto cai do repouso de 20 m de altura, sem resistência do ar (g = 10 m/s²). Com que velocidade chega ao solo? | v = √(2 · 10 · 20) = 20 m/s. A fórmula vale partindo do repouso e sem perdas de energia. | calcular com hipóteses |
| FIS07~7 | Massas iguais, choque elástico → trocam de velocidade | A bola A (2 kg, 3 m/s) bate de frente na bola B (2 kg, parada), em choque elástico. Quais são as velocidades depois? | A para (0 m/s) e B sai a 3 m/s: com massas iguais e choque elástico frontal, as velocidades se trocam. | aplicar propriedade |
| FIS08~2 | 3ª lei de Kepler → T²/R³ = constante | O satélite A orbita a Terra com raio R e período T. O satélite B orbita a Terra com raio 4R. Qual é o período de B? | Mesmo corpo central: T²/R³ é igual para os dois. T_B² = T² · 4³ = 64T² → T_B = 8T. A constante muda se o corpo central for outro. | aplicar lei com hipótese (corrige o erro) |
| FIS10~7 | Peso aparente → P − E | Um bloco de 2 kg e 500 cm³ está totalmente submerso em água (g = 10 m/s²). Qual é o seu peso aparente? | P = 20 N; E = 1000 · 5 × 10⁻⁴ · 10 = 5 N. Peso aparente = 20 − 5 = 15 N. | calcular |
| FIS11~7 | Única propagação no vácuo → Irradiação | Por que o calor do Sol chega à Terra através do vácuo, e por que a garrafa térmica tem vácuo entre as paredes? | A irradiação (ondas eletromagnéticas) não precisa de meio. O vácuo da garrafa impede a condução e a convecção; as paredes espelhadas reduzem a irradiação. | interpretar fenômeno |
| FIS13~3 | O que não muda na refração → A frequência | Um som de 500 Hz passa do ar (340 m/s) para a água (1500 m/s). O que acontece com a frequência e com o comprimento de onda? | A frequência continua 500 Hz. O comprimento de onda passa de 0,68 m para 3 m (λ = v/f). | aplicar v = λf |
| FIS16~5 | Dois resistores em paralelo → produto/soma; mesma tensão | Resistores de 6 Ω e 3 Ω em paralelo são ligados a 12 V. Qual é a resistência equivalente e a corrente em cada um? | Req = 6 · 3/(6 + 3) = 2 Ω; corrente total 6 A. Mesma tensão: 12/6 = 2 A e 12/3 = 4 A. | calcular e verificar |
| FIS18~3 | Mais intensidade no efeito fotoelétrico → mais elétrons, mesma energia | Uma luz acima da frequência de corte tem a intensidade dobrada, com a mesma frequência. O que acontece com o número de elétrons emitidos e com a energia cinética máxima de cada um? | O número de elétrons emitidos por segundo aumenta (proporcional à intensidade); a energia cinética máxima não muda, porque depende só da frequência (Ec = hf − W). | comparar grandezas |

Conferência com a teoria: cada resposta segue as fórmulas e conceitos das aulas FIS02 a FIS18 do próprio curso. Os
dados numéricos foram escolhidos para não repetir os quizzes das aulas; isso será conferido automaticamente na
implementação, como nos lotes anteriores.

## Proposta de escopo para a implementação

1. Reformular os 48 cartões diretos demais e corrigir FIS08~2 e FIS02~0 (versão 2).
2. Acrescentar a hipótese em FIS04~2 e FIS06~5 (versão 2, porque muda o que o cartão ensina).
3. Propor, com lista própria, os cartões de fórmula que ganham aplicação; os demais ficam como memorização.
4. Testes: recalcular as contas dos cartões numéricos e testar o progresso antigo com os cartões versionados.

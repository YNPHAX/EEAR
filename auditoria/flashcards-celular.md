# Flashcards em telas pequenas: auditoria e correção

Análise de 2026-11-08, na branch `claude/flashcards-celular` (a partir do PR #17). As telas foram **simuladas no
Chromium** (Playwright, com emulação de celular e toque); nenhum aparelho real foi usado.

## Como foi medido

O fluxo do aluno é percorrido cartão a cartão: abrir, tocar em "Mostrar resposta", tocar em "Errei" ou "Acertei" e
avançar. O toque vai para as coordenadas do botão na tela, sem a rolagem automática do Playwright. A área útil fica
abaixo do topo fixo e acima da barra de abas. Em 320 × 568 ela tem 437 px de altura.

## Problemas encontrados (antes)

Os números abaixo valem para cada cartão aberto a partir do topo, nos 518 cartões da modalidade normal.

| Tela | "Mostrar resposta" sem rolar | Errei/Acertei sem rolar | Maior rolagem necessária |
|---|---|---|---|
| 320 × 568 | 508 de 518 | 211 de 518 | 262 px |
| 360 × 640 | 518 | 365 de 518 | 195 px |
| 390 × 844 | 518 | 518 | 0 |
| 1280 × 800 | 518 | 518 | 0 |

1. **Botões de avaliação fora da tela.** Em 320 × 568, 59% dos cartões exigiam rolar depois de revelar a resposta.
   O toque na posição do botão caía na barra de abas fixa, o que tirava o aluno da sessão de revisão.
2. **A rolagem continuava no cartão seguinte.** Depois de avaliar, a tela não voltava ao topo (os quizzes já
   voltam). Se o aluno rolou num cartão longo, os cartões seguintes começavam rolados, com o contador escondido.

Não havia texto cortado, rolagem lateral nem fonte pequena no conteúdo (frente e verso em 17,9 px). A única fonte
menor é a etiqueta da matéria (11,8 px), que não é conteúdo.

## Correção

- Os botões do flashcard ("Mostrar resposta", "Errei" e "Acertei") ficam fixos logo acima da barra de abas
  (`position: sticky`). Em telas de 820 px ou mais, onde a barra fica no topo, ficam fixos no rodapé. A fileira
  continua no fluxo da página, então o fim da resposta aparece acima dela quando o aluno rola até o fim.
- Ao avaliar, a tela volta ao topo, como nos quizzes.
- Ao revelar, se o começo da resposta ficar atrás dos botões, a tela rola só o necessário para mostrá-lo.

O conteúdo dos cartões, as fontes e os espaçamentos do cartão não mudaram.

## Depois

Nas quatro telas, os 518 cartões passaram em todos os critérios:

- "Mostrar resposta", o começo da resposta e Errei/Acertei aparecem sem rolar;
- cada cartão começa no topo, com o contador visível;
- o fim da resposta fica visível ao rolar;
- não há texto cortado nem erro de JavaScript.

O teste `testes/celular.js` repete essas checagens no CI:

- em 320 × 568, com todas as matérias;
- em 360 × 640, 390 × 844 e 1280 × 800, com Física.

Contra a versão antiga, ele falha.

## Limitações

- Simulação no Chromium; não foi testado em aparelhos reais, no WebView do APK instalado nem no Safari/iOS.
- Teclados virtuais, zoom do sistema e fontes ampliadas nas configurações de acessibilidade do aparelho não foram
  simulados.
- Leitores de tela: a tela é redesenhada a cada toque e o foco não é levado ao verso. Isso já acontecia antes e não
  foi alterado.

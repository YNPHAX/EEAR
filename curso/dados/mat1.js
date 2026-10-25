/* Matemática — módulos 1 a 5 */
EEAR.add({
  id: 'MAT01', m: 'mat', n: 1, t: 'Conjuntos e conjuntos numéricos', peso: 1, h: 2,
  teoria: `
<h3>Noções</h3>
<ul>
<li>Pertinência (elemento): <b>∈</b>, <b>∉</b>. Inclusão (conjunto): <b>⊂</b>, <b>⊄</b>.</li>
<li>Um conjunto com <b>n</b> elementos tem <b>2<sup>n</sup></b> subconjuntos (incluindo ∅ e ele mesmo).</li>
<li>Operações: união (A ∪ B), interseção (A ∩ B), diferença (A − B: está em A e não em B), complementar.</li>
</ul>
<div class="f">n(A ∪ B) = n(A) + n(B) − n(A ∩ B)<br>n(A ∪ B ∪ C) = n(A)+n(B)+n(C) − n(A∩B) − n(A∩C) − n(B∩C) + n(A∩B∩C)</div>
<p>Em problemas com pesquisas, desenhe o <b>diagrama de Venn</b> e comece pela interseção.</p>
<h3>Conjuntos numéricos</h3>
<div class="f">ℕ = {0, 1, 2, 3, …}   ℤ = {…, −2, −1, 0, 1, 2, …}<br>ℚ = {a/b; a, b ∈ ℤ, b ≠ 0}  (decimais finitos e dízimas periódicas)<br>𝕀 = irracionais (√2, √3, π, e)   ℝ = ℚ ∪ 𝕀<br>ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ</div>
<h3>Fração geratriz</h3>
<ul>
<li>Dízima simples: período sobre tantos 9 quantos forem os algarismos do período: 0,333… = 3/9 = 1/3; 0,1212… = 12/99 = 4/33.</li>
<li>Dízima composta: (número até o fim do primeiro período − parte que não se repete) sobre (9 para cada algarismo do período, seguidos de 0 para cada algarismo do anteperíodo). Ex.: 0,1333… = (13 − 1)/90 = 12/90 = 2/15.</li>
<li>Com parte inteira: 1,2333… = (123 − 12)/90 = 111/90 = 37/30.</li>
</ul>
<h3>Intervalos</h3>
<p>[a, b] fechado (inclui extremos); (a, b) ou ]a, b[ aberto; [a, b) semiaberto. Para unir ou intersectar, desenhe os intervalos numa reta.</p>
<p class="dica">√9 = 3 é racional; √5 é irracional. Raiz de número que não é quadrado perfeito é irracional.</p>`,
  ex: [
    ['Numa turma de 50 alunos, 30 gostam de Física, 25 de Matemática e 8 não gostam de nenhuma. Quantos gostam das duas?', '<p>Gostam de pelo menos uma: 50 − 8 = 42. Então 42 = 30 + 25 − x → x = <b>13</b>.</p>'],
    ['Determine a fração geratriz de 0,4545…', '<p>Período 45 (dois algarismos): 45/99 = <b>5/11</b>.</p>'],
    ['Sendo A = [1, 5) e B = (3, 8], determine A ∩ B e A ∪ B.', '<p>A ∩ B = <b>(3, 5)</b> e A ∪ B = <b>[1, 8]</b>.</p>']
  ],
  q: [
    ['O número de subconjuntos de A = {1, 2, 3, 4} é', ['8', '12', '16', '4'], 2, '2⁴ = 16 subconjuntos.'],
    ['Numa escola, 30 alunos praticam vôlei, 25 praticam futebol e 10 praticam os dois. Se todos praticam ao menos um, o total de alunos é', ['55', '45', '35', '65'], 1, 'n(A ∪ B) = 30 + 25 − 10 = 45.'],
    ['A fração geratriz de 0,272727… é', ['27/100', '3/11', '27/90', '9/11'], 1, '27/99 = 3/11.'],
    ['É irracional o número', ['√9', '0,555…', '√5', '−2/3'], 2, '5 não é quadrado perfeito, logo √5 é irracional. 0,555… = 5/9 é racional.'],
    ['Sendo A = {1, 2, 3, 4, 5} e B = {4, 5, 6}, o conjunto A − B é', ['{6}', '{4, 5}', '{1, 2, 3}', '{1, 2, 3, 6}'], 2, 'A − B: elementos de A que não estão em B.'],
    ['A interseção dos intervalos [2, 7) e (5, 10] é', ['(5, 7)', '[5, 7]', '[2, 10]', '(2, 10)'], 0, 'Os números maiores que 5 e menores que 7: (5, 7).'],
    ['Assinale a afirmação verdadeira.', ['ℕ ⊂ ℤ', 'ℤ ⊂ ℕ', 'ℚ ⊂ ℤ', 'ℝ ⊂ ℚ'], 0, 'Todo natural é inteiro: ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ.'],
    ['Em uma pesquisa com 100 pessoas, 60 leem o jornal A, 50 leem o B e 20 leem os dois. Quantas não leem nenhum?', ['10', '20', '30', '0'], 0, 'Leem pelo menos um: 60 + 50 − 20 = 90. Nenhum: 100 − 90 = 10.'],
    ['A fração geratriz de 1,2333… é', ['37/30', '12/10', '111/99', '123/100'], 0, '(123 − 12)/90 = 111/90 = 37/30.'],
    ['Se o conjunto das partes de A tem 32 elementos, então A tem', ['5 elementos', '6 elementos', '16 elementos', '32 elementos'], 0, '2ⁿ = 32 → n = 5.']
  ],
  fc: [
    ['Número de subconjuntos de um conjunto com n elementos', '2ⁿ'],
    ['n(A ∪ B)', 'n(A) + n(B) − n(A ∩ B)'],
    ['Geratriz de 0,ababab…', 'ab/99'],
    ['Geratriz de 0,1333…', '(13 − 1)/90 = 2/15'],
    ['Inclusão dos conjuntos numéricos', 'ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ'],
    ['A − B', 'Elementos que estão em A e não estão em B.'],
    ['Exemplos de irracionais', '√2, √3, √5, π, e.']
  ]
});

EEAR.add({
  id: 'MAT02', m: 'mat', n: 2, t: 'Funções: conceitos, composta e inversa', peso: 2, h: 2.5,
  teoria: `
<h3>Definição</h3>
<p>Uma função f: A → B associa <b>cada</b> elemento de A a <b>um único</b> elemento de B. A é o <b>domínio</b>, B o <b>contradomínio</b> e o conjunto dos valores obtidos é a <b>imagem</b>.</p>
<p>No gráfico, a curva é função se qualquer reta vertical a corta em no máximo um ponto.</p>
<h3>Domínio de funções reais</h3>
<ul>
<li>Denominador diferente de zero: f(x) = 1/(x − 2) → x ≠ 2.</li>
<li>Radicando de raiz par maior ou igual a zero: f(x) = √(x − 3) → x ≥ 3.</li>
<li>Raiz par no denominador: radicando maior que zero: f(x) = 1/√(x − 1) → x &gt; 1.</li>
</ul>
<h3>Classificação</h3>
<ul>
<li><b>Injetora</b>: elementos diferentes têm imagens diferentes.</li>
<li><b>Sobrejetora</b>: a imagem é igual ao contradomínio.</li>
<li><b>Bijetora</b>: injetora e sobrejetora. Só as bijetoras têm inversa.</li>
<li><b>Par</b>: f(−x) = f(x) (gráfico simétrico ao eixo y, ex.: x², cos x). <b>Ímpar</b>: f(−x) = −f(x) (simétrico à origem, ex.: x³, sen x).</li>
<li><b>Crescente</b>: x aumenta e f(x) aumenta. <b>Decrescente</b>: x aumenta e f(x) diminui.</li>
</ul>
<h3>Função composta</h3>
<div class="f">(f ∘ g)(x) = f(g(x))   → primeiro aplica g, depois f</div>
<p>Ex.: f(x) = 2x + 1 e g(x) = x². f(g(3)) = f(9) = 19, enquanto g(f(3)) = g(7) = 49. Em geral f ∘ g ≠ g ∘ f.</p>
<h3>Função inversa</h3>
<ol><li>Troque f(x) por y.</li><li>Troque x por y e y por x.</li><li>Isole o novo y.</li></ol>
<p>Ex.: y = (x + 3)/2 → x = (y + 3)/2 → y = 2x − 3. Logo f<sup>−1</sup>(x) = 2x − 3. O gráfico da inversa é simétrico ao de f em relação à reta y = x.</p>
<p class="dica">Em "f(x + 1) = 2x + 5, calcule f(3)", não ache a lei: faça x + 1 = 3, então x = 2 e f(3) = 2·2 + 5 = 9.</p>`,
  ex: [
    ['Sendo f(x) = x² − 3x, calcule f(−2).', '<p>f(−2) = (−2)² − 3(−2) = 4 + 6 = <b>10</b>.</p>'],
    ['Determine o domínio de f(x) = √(6 − 2x).', '<p>6 − 2x ≥ 0 → x ≤ 3. D = {x ∈ ℝ | x ≤ 3}.</p>'],
    ['Sendo f(x) = 3x − 1 e g(x) = x + 4, determine (g ∘ f)(x).', '<p>g(f(x)) = (3x − 1) + 4 = <b>3x + 3</b>.</p>']
  ],
  q: [
    ['Sendo f(x) = 2x² − 3x + 1, o valor de f(2) é', ['1', '3', '5', '7'], 1, 'f(2) = 8 − 6 + 1 = 3.'],
    ['O domínio de f(x) = √(x − 3) é', ['x &gt; 3', 'x ≥ 3', 'x ≠ 3', 'x ≤ 3'], 1, 'Radicando ≥ 0: x − 3 ≥ 0 → x ≥ 3.'],
    ['O domínio da função f(x) = 1/(x² − 4) é', ['ℝ', 'ℝ − {2}', 'ℝ − {−2, 2}', 'ℝ − {4}'], 2, 'x² − 4 ≠ 0 → x ≠ ±2.'],
    ['Sendo f(x) = 2x + 1 e g(x) = x², o valor de f(g(3)) é', ['19', '49', '13', '18'], 0, 'g(3) = 9; f(9) = 19.'],
    ['A inversa de f(x) = (x + 3)/2 é', ['f⁻¹(x) = 2x + 3', 'f⁻¹(x) = 2x − 3', 'f⁻¹(x) = (x − 3)/2', 'f⁻¹(x) = 2/(x + 3)'], 1, 'x = (y + 3)/2 → 2x = y + 3 → y = 2x − 3.'],
    ['Se f(x) = 3x − 5 e f(a) = 10, então a vale', ['3', '5', '15', '25'], 1, '3a − 5 = 10 → a = 5.'],
    ['É uma função par:', ['f(x) = x³', 'f(x) = x²', 'f(x) = x + 1', 'f(x) = 2x'], 1, 'f(−x) = (−x)² = x² = f(x).'],
    ['Uma função que é injetora e sobrejetora é chamada', ['constante.', 'bijetora.', 'par.', 'periódica.'], 1, 'Injetora + sobrejetora = bijetora (e possui inversa).'],
    ['Sendo f(x) = x + 2 e g(x) = 3x, a lei de (g ∘ f)(x) é', ['3x + 2', '3x + 6', 'x + 6', '3x² + 6'], 1, 'g(f(x)) = 3(x + 2) = 3x + 6.'],
    ['Se f(x + 1) = 2x + 5, então f(3) é igual a', ['7', '9', '11', '13'], 1, 'x + 1 = 3 → x = 2 → f(3) = 2·2 + 5 = 9.']
  ],
  fc: [
    ['Condição de domínio: fração', 'Denominador ≠ 0.'],
    ['Condição de domínio: raiz par', 'Radicando ≥ 0 (> 0 se estiver no denominador).'],
    ['(f ∘ g)(x)', 'f(g(x)): aplica g primeiro.'],
    ['Como achar a inversa', 'Troque x por y e isole y.'],
    ['Função par x ímpar', 'Par: f(−x) = f(x). Ímpar: f(−x) = −f(x).'],
    ['Bijetora', 'Injetora e sobrejetora; só ela tem inversa.'],
    ['Teste da reta vertical', 'Gráfico é função se toda vertical corta no máximo uma vez.']
  ]
});

EEAR.add({
  id: 'MAT03', m: 'mat', n: 3, t: 'Função afim e função quadrática', peso: 3, h: 3,
  teoria: `
<h3>Função afim: f(x) = ax + b</h3>
<ul>
<li>Gráfico: reta. <b>a</b> = coeficiente angular (inclinação); <b>b</b> = coeficiente linear (onde a reta corta o eixo y).</li>
<li>a &gt; 0: crescente; a &lt; 0: decrescente; a = 0: constante.</li>
<li>Zero (raiz): x = −b/a.</li>
</ul>
<div class="f">a = (y₂ − y₁)/(x₂ − x₁)   (a partir de dois pontos)</div>
<p>Inequação do 1º grau: resolva como equação; ao multiplicar ou dividir por número negativo, <b>inverta o sinal</b>.</p>
<h3>Função quadrática: f(x) = ax² + bx + c (a ≠ 0)</h3>
<div class="f">Δ = b² − 4ac     x = (−b ± √Δ)/(2a)<br>Soma das raízes: S = −b/a     Produto: P = c/a<br>Vértice: x<sub>v</sub> = −b/(2a)     y<sub>v</sub> = −Δ/(4a)</div>
<ul>
<li>a &gt; 0: concavidade para cima, vértice é ponto de <b>mínimo</b>. a &lt; 0: para baixo, vértice é ponto de <b>máximo</b>.</li>
<li>Δ &gt; 0: duas raízes reais distintas; Δ = 0: duas iguais (toca o eixo x); Δ &lt; 0: nenhuma raiz real.</li>
<li>c é onde a parábola corta o eixo y.</li>
<li>Imagem: a &gt; 0 → [y<sub>v</sub>, +∞); a &lt; 0 → (−∞, y<sub>v</sub>].</li>
</ul>
<h3>Inequação do 2º grau</h3>
<p>Ache as raízes e faça o estudo do sinal. Para a &gt; 0, a função é negativa entre as raízes e positiva fora delas. Ex.: x² − 9 &lt; 0 → −3 &lt; x &lt; 3.</p>
<p class="dica">Problemas de "altura máxima", "lucro máximo" e "área máxima" são sempre o y do vértice. "Em que instante" ou "quantas unidades" é o x do vértice.</p>`,
  ex: [
    ['Determine a função afim cujo gráfico passa por (1, 3) e (3, 7).', '<p>a = (7 − 3)/(3 − 1) = 2. Em (1, 3): 3 = 2·1 + b → b = 1. Logo <b>f(x) = 2x + 1</b>.</p>'],
    ['Uma bola tem altura h(t) = −5t² + 20t (metros, t em segundos). Qual a altura máxima?', '<p>t<sub>v</sub> = −20/(2·(−5)) = 2 s. h(2) = −20 + 40 = <b>20 m</b>.</p>'],
    ['Resolva x² − 5x + 6 ≤ 0.', '<p>Raízes 2 e 3; a &gt; 0, então a função é negativa ou zero entre as raízes: <b>2 ≤ x ≤ 3</b>.</p>']
  ],
  q: [
    ['A função afim cujo gráfico passa pelos pontos (1, 3) e (3, 7) tem f(5) igual a', ['9', '10', '11', '13'], 2, 'a = 2, b = 1 → f(x) = 2x + 1 → f(5) = 11.'],
    ['O zero da função f(x) = 3x − 12 é', ['−4', '3', '4', '12'], 2, '3x − 12 = 0 → x = 4.'],
    ['As raízes de x² − 5x + 6 = 0 são', ['1 e 6', '2 e 3', '−2 e −3', '−1 e 6'], 1, 'Soma 5 e produto 6: 2 e 3.'],
    ['O vértice da parábola de f(x) = x² − 4x + 3 é', ['(2, −1)', '(−2, 15)', '(2, 1)', '(4, 3)'], 0, 'xᵥ = 4/2 = 2; f(2) = 4 − 8 + 3 = −1.'],
    ['O valor máximo de f(x) = −x² + 6x − 5 é', ['3', '4', '5', '9'], 1, 'xᵥ = 3; f(3) = −9 + 18 − 5 = 4.'],
    ['Na equação 2x² − 8x + 6 = 0, a soma e o produto das raízes são, respectivamente,', ['4 e 3', '−4 e 3', '8 e 6', '4 e −3'], 0, 'S = −b/a = 8/2 = 4; P = c/a = 6/2 = 3.'],
    ['O conjunto solução de x² − 9 &lt; 0 é', ['x &lt; −3 ou x &gt; 3', '−3 &lt; x &lt; 3', 'x &lt; 3', 'x &gt; −3'], 1, 'Com a &gt; 0, a função é negativa entre as raízes −3 e 3.'],
    ['O valor de k para que x² − 4x + k = 0 tenha duas raízes reais iguais é', ['2', '4', '8', '16'], 1, 'Δ = 16 − 4k = 0 → k = 4.'],
    ['A solução da inequação 2x − 3 &gt; 5 é', ['x &gt; 1', 'x &gt; 4', 'x &lt; 4', 'x &gt; 8'], 1, '2x &gt; 8 → x &gt; 4.'],
    ['Um projétil tem altura h(t) = −5t² + 20t, em metros. Sua altura máxima é', ['10 m', '15 m', '20 m', '40 m'], 2, 'tᵥ = 2 s e h(2) = −20 + 40 = 20 m.']
  ],
  fc: [
    ['Coeficiente angular por dois pontos', 'a = (y₂ − y₁)/(x₂ − x₁)'],
    ['Zero da função afim', 'x = −b/a'],
    ['Fórmula de Bhaskara', 'x = (−b ± √Δ)/2a, com Δ = b² − 4ac.'],
    ['Soma e produto das raízes', 'S = −b/a; P = c/a.'],
    ['Vértice da parábola', 'xᵥ = −b/2a; yᵥ = −Δ/4a.'],
    ['Sinal de Δ', '> 0: duas raízes; = 0: uma (dupla); < 0: nenhuma real.'],
    ['a > 0 na parábola', 'Concavidade para cima, vértice é mínimo.'],
    ['Inequação: multiplicou por negativo', 'Inverta o sinal da desigualdade.']
  ]
});

EEAR.add({
  id: 'MAT04', m: 'mat', n: 4, t: 'Função modular', peso: 1, h: 1.5,
  teoria: `
<h3>Módulo</h3>
<div class="f">|x| = x, se x ≥ 0     |x| = −x, se x &lt; 0<br>|x| é a distância de x até o zero: |−7| = 7, |3| = 3<br>√(x²) = |x|</div>
<p>O gráfico de f(x) = |x| tem forma de <b>V</b>, com vértice na origem. f(x) = |x − h| + k desloca o vértice para (h, k).</p>
<h3>Equações modulares</h3>
<ul>
<li>|x| = a, com a &gt; 0 → x = a ou x = −a.</li>
<li>|x| = a, com a &lt; 0 → não há solução.</li>
<li>|A| = |B| → A = B ou A = −B.</li>
</ul>
<p>Ex.: |x − 3| = 5 → x − 3 = 5 ou x − 3 = −5 → x = 8 ou x = −2.</p>
<h3>Inequações modulares (a &gt; 0)</h3>
<div class="f">|x| &lt; a  ⇔  −a &lt; x &lt; a<br>|x| &gt; a  ⇔  x &lt; −a  ou  x &gt; a</div>
<p>Ex.: |2x − 1| &lt; 5 → −5 &lt; 2x − 1 &lt; 5 → −4 &lt; 2x &lt; 6 → −2 &lt; x &lt; 3.</p>
<p class="dica">Módulo nunca é negativo. Se a equação pede |algo| = número negativo, a resposta é o conjunto vazio.</p>`,
  ex: [
    ['Resolva |x + 2| = 7.', '<p>x + 2 = 7 → x = 5, ou x + 2 = −7 → x = −9. S = {−9, 5}.</p>'],
    ['Resolva |x − 1| ≥ 3.', '<p>x − 1 ≤ −3 ou x − 1 ≥ 3 → <b>x ≤ −2 ou x ≥ 4</b>.</p>'],
    ['Qual a imagem de f(x) = |x| − 3?', '<p>|x| ≥ 0, então |x| − 3 ≥ −3. Im = <b>[−3, +∞)</b>.</p>']
  ],
  q: [
    ['O conjunto solução de |x − 3| = 5 é', ['{8}', '{−2, 8}', '{2, 8}', '{−8, 2}'], 1, 'x − 3 = ±5 → x = 8 ou x = −2.'],
    ['A solução de |2x − 1| &lt; 5 é', ['−2 &lt; x &lt; 3', 'x &lt; 3', '−3 &lt; x &lt; 2', 'x &lt; −2 ou x &gt; 3'], 0, '−5 &lt; 2x − 1 &lt; 5 → −4 &lt; 2x &lt; 6 → −2 &lt; x &lt; 3.'],
    ['A solução de |x| ≥ 4 é', ['−4 ≤ x ≤ 4', 'x ≥ 4', 'x ≤ −4 ou x ≥ 4', 'x ≤ 4'], 2, '|x| ≥ a → x ≤ −a ou x ≥ a.'],
    ['O valor de |−7| + |3 − 10| é', ['0', '7', '14', '−14'], 2, '|−7| = 7 e |−7| = 7; soma 14.'],
    ['Sendo f(x) = |x − 2|, o valor de f(−1) é', ['−3', '1', '3', '−1'], 2, '|−1 − 2| = |−3| = 3.'],
    ['O vértice do gráfico de f(x) = |x − 1| + 2 é o ponto', ['(1, 2)', '(−1, 2)', '(2, 1)', '(1, −2)'], 0, 'f(x) = |x − h| + k tem vértice em (h, k) = (1, 2).'],
    ['O valor de √((−5)²) é', ['−5', '5', '25', '±5'], 1, '√(x²) = |x| → |−5| = 5.'],
    ['O conjunto solução de |x + 1| = −3 é', ['{2}', '{−4}', '{−4, 2}', '∅'], 3, 'Módulo nunca é negativo: não há solução.'],
    ['A soma das raízes de |x − 4| = 2 é', ['4', '6', '8', '2'], 2, 'x = 6 ou x = 2; soma 8.'],
    ['A imagem de f(x) = |x| − 3 é', ['ℝ', '[0, +∞)', '[−3, +∞)', '[3, +∞)'], 2, '|x| ≥ 0 → |x| − 3 ≥ −3.']
  ],
  fc: [
    ['Definição de |x|', 'x se x ≥ 0; −x se x < 0.'],
    ['√(x²)', '|x|'],
    ['|x| = a (a > 0)', 'x = a ou x = −a.'],
    ['|x| < a', '−a < x < a.'],
    ['|x| > a', 'x < −a ou x > a.'],
    ['|x| = número negativo', 'Conjunto vazio.'],
    ['Vértice de f(x) = |x − h| + k', '(h, k).']
  ]
});

EEAR.add({
  id: 'MAT05', m: 'mat', n: 5, t: 'Função exponencial e equações exponenciais', peso: 2, h: 2,
  teoria: `
<h3>Propriedades das potências</h3>
<div class="f">a<sup>m</sup> · a<sup>n</sup> = a<sup>m+n</sup>     a<sup>m</sup> / a<sup>n</sup> = a<sup>m−n</sup>     (a<sup>m</sup>)<sup>n</sup> = a<sup>m·n</sup><br>a<sup>0</sup> = 1     a<sup>−n</sup> = 1/a<sup>n</sup>     a<sup>m/n</sup> = ⁿ√(a<sup>m</sup>)     (a·b)<sup>n</sup> = a<sup>n</sup>·b<sup>n</sup></div>
<h3>Função exponencial: f(x) = a<sup>x</sup> (a &gt; 0, a ≠ 1)</h3>
<ul>
<li>a &gt; 1: crescente. 0 &lt; a &lt; 1: decrescente.</li>
<li>Passa sempre por (0, 1). Domínio ℝ e imagem (0, +∞): nunca toca o eixo x.</li>
</ul>
<h3>Equações exponenciais</h3>
<p>Iguale as bases: a<sup>x</sup> = a<sup>y</sup> ⇔ x = y.</p>
<ul>
<li>2<sup>x+1</sup> = 32 → 2<sup>x+1</sup> = 2<sup>5</sup> → x = 4.</li>
<li>9<sup>x</sup> = 27 → 3<sup>2x</sup> = 3<sup>3</sup> → x = 3/2.</li>
<li>Equações que viram 2º grau: 4<sup>x</sup> − 3·2<sup>x</sup> + 2 = 0. Faça y = 2<sup>x</sup>: y² − 3y + 2 = 0 → y = 1 ou y = 2 → x = 0 ou x = 1.</li>
</ul>
<h3>Inequações exponenciais</h3>
<p>Com bases iguais: se a &gt; 1, <b>mantém</b> o sinal; se 0 &lt; a &lt; 1, <b>inverte</b>. Ex.: (1/2)<sup>x</sup> &gt; (1/2)<sup>3</sup> → x &lt; 3.</p>
<h3>Aplicações</h3>
<div class="f">Juros compostos: M = C(1 + i)<sup>t</sup><br>Crescimento: P(t) = P₀ · 2<sup>t/T</sup> (T = tempo para dobrar)<br>Decaimento: m(t) = m₀ · (1/2)<sup>t/T</sup> (T = meia-vida)</div>
<p class="dica">Decore as potências de 2 (até 2¹⁰ = 1024), de 3 (até 3⁶ = 729) e de 5 (até 5⁵ = 3125). Isso acelera muito a igualdade de bases.</p>`,
  ex: [
    ['Resolva 8<sup>x</sup> = 16.', '<p>2<sup>3x</sup> = 2<sup>4</sup> → 3x = 4 → <b>x = 4/3</b>.</p>'],
    ['Um capital de R$ 2.000 rende 10% ao mês em juros compostos. Qual o montante após 3 meses?', '<p>M = 2000 · 1,1³ = 2000 · 1,331 = <b>R$ 2.662</b>.</p>'],
    ['Uma substância tem meia-vida de 5 anos. De 80 g, quanto resta após 15 anos?', '<p>15/5 = 3 meias-vidas: 80 · (1/2)³ = <b>10 g</b>.</p>']
  ],
  q: [
    ['A solução de 2<sup>x+1</sup> = 32 é', ['x = 3', 'x = 4', 'x = 5', 'x = 16'], 1, '2ˣ⁺¹ = 2⁵ → x + 1 = 5 → x = 4.'],
    ['A solução de 9<sup>x</sup> = 27 é', ['x = 3', 'x = 2/3', 'x = 3/2', 'x = 1/3'], 2, '3²ˣ = 3³ → 2x = 3 → x = 3/2.'],
    ['O conjunto solução de (1/2)<sup>x</sup> &gt; 1/8 é', ['x &gt; 3', 'x &lt; 3', 'x &gt; −3', 'x &lt; −3'], 1, '(1/2)ˣ &gt; (1/2)³; como a base está entre 0 e 1, inverte: x &lt; 3.'],
    ['O conjunto solução de 4<sup>x</sup> − 3·2<sup>x</sup> + 2 = 0 é', ['{1, 2}', '{0, 1}', '{0, 2}', '{1}'], 1, 'y = 2ˣ: y² − 3y + 2 = 0 → y = 1 ou 2 → x = 0 ou 1.'],
    ['Uma colônia tem P(t) = 1000 · 2<sup>t</sup> bactérias, com t em horas. Após 3 horas, a população é', ['3000', '6000', '8000', '9000'], 2, 'P(3) = 1000 · 8 = 8000.'],
    ['Sendo f(x) = 3<sup>x</sup>, o valor de f(−1) é', ['−3', '1/3', '−1/3', '3'], 1, '3⁻¹ = 1/3.'],
    ['O valor de (2<sup>5</sup> · 2<sup>3</sup>) / 2<sup>6</sup> é', ['2', '4', '8', '16'], 1, '2⁵⁺³⁻⁶ = 2² = 4.'],
    ['As soluções de 5<sup>x² − x</sup> = 25 são', ['1 e 2', '−1 e 2', '−2 e 1', '0 e 2'], 1, 'x² − x = 2 → x² − x − 2 = 0 → x = 2 ou x = −1.'],
    ['É decrescente a função', ['f(x) = 2ˣ', 'f(x) = (0,5)ˣ', 'f(x) = 10ˣ', 'f(x) = (3/2)ˣ'], 1, 'Base entre 0 e 1: decrescente.'],
    ['Um capital de R$ 1.000,00 aplicado a juros compostos de 10% ao mês, após 2 meses, gera um montante de', ['R$ 1.200,00', 'R$ 1.210,00', 'R$ 1.100,00', 'R$ 1.221,00'], 1, 'M = 1000 · 1,1² = 1000 · 1,21 = 1210.']
  ],
  fc: [
    ['aᵐ · aⁿ e aᵐ / aⁿ', 'aᵐ⁺ⁿ e aᵐ⁻ⁿ'],
    ['a⁻ⁿ e a^(m/n)', '1/aⁿ e ⁿ√(aᵐ)'],
    ['Exponencial crescente ou decrescente?', 'Base > 1: crescente. 0 < base < 1: decrescente.'],
    ['Ponto fixo de f(x) = aˣ', '(0, 1). Imagem (0, +∞).'],
    ['Inequação com base entre 0 e 1', 'Inverte o sinal.'],
    ['Juros compostos', 'M = C(1 + i)ᵗ'],
    ['Meia-vida', 'm = m₀ · (1/2)^(t/T)'],
    ['4ˣ − k·2ˣ + c = 0', 'Substitua y = 2ˣ e resolva o 2º grau.']
  ]
});

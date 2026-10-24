/* Matemática — módulos 6 a 10 */
EEAR.add({
  id: 'MAT06', m: 'mat', n: 6, t: 'Logaritmos e função logarítmica', peso: 2, h: 2.5,
  teoria: `
<h3>Definição</h3>
<div class="f">log<sub>a</sub> b = x  ⇔  a<sup>x</sup> = b      (a &gt; 0, a ≠ 1, b &gt; 0)</div>
<p>a é a base e b o logaritmando. Quando a base não aparece, ela é 10: log 100 = 2.</p>
<h3>Consequências</h3>
<div class="f">log<sub>a</sub> 1 = 0     log<sub>a</sub> a = 1     log<sub>a</sub> a<sup>n</sup> = n     a<sup>log<sub>a</sub> b</sup> = b</div>
<h3>Propriedades operatórias</h3>
<div class="f">log<sub>a</sub>(b · c) = log<sub>a</sub> b + log<sub>a</sub> c<br>log<sub>a</sub>(b / c) = log<sub>a</sub> b − log<sub>a</sub> c<br>log<sub>a</sub> b<sup>n</sup> = n · log<sub>a</sub> b<br>Mudança de base: log<sub>a</sub> b = log<sub>c</sub> b / log<sub>c</sub> a</div>
<p>Com log 2 ≈ 0,30 e log 3 ≈ 0,48, a prova pede valores como: log 4 = 0,60; log 5 = log(10/2) = 0,70; log 6 = 0,78; log 8 = 0,90; log 12 = 1,08.</p>
<h3>Função logarítmica: f(x) = log<sub>a</sub> x</h3>
<ul>
<li>Domínio (0, +∞), imagem ℝ. Passa por (1, 0). É a inversa da exponencial.</li>
<li>a &gt; 1: crescente; 0 &lt; a &lt; 1: decrescente.</li>
</ul>
<h3>Equações logarítmicas</h3>
<ol>
<li>Escreva a <b>condição de existência</b> (logaritmando &gt; 0, base &gt; 0 e ≠ 1).</li>
<li>Resolva usando a definição ou as propriedades.</li>
<li>Descarte as soluções que violam a condição.</li>
</ol>
<p>Ex.: log<sub>2</sub> x + log<sub>2</sub>(x − 2) = 3 → x(x − 2) = 8 → x² − 2x − 8 = 0 → x = 4 ou x = −2. Como x &gt; 2, fica só <b>x = 4</b>.</p>
<p class="dica">Sempre teste a condição de existência no fim. A EEAR coloca a raiz "falsa" entre as alternativas.</p>`,
  ex: [
    ['Calcule log<sub>2</sub> 64 + log<sub>3</sub> 81.', '<p>2⁶ = 64 e 3⁴ = 81: 6 + 4 = <b>10</b>.</p>'],
    ['Dado log 2 = 0,30, calcule log 0,04.', '<p>0,04 = 4/100: log 4 − log 100 = 0,60 − 2 = <b>−1,40</b>.</p>'],
    ['Resolva log<sub>3</sub>(2x − 1) = 2.', '<p>2x − 1 = 3² = 9 → x = 5. Condição: 2·5 − 1 = 9 &gt; 0, ok. <b>x = 5</b>.</p>']
  ],
  q: [
    ['O valor de log<sub>2</sub> 32 é', ['4', '5', '6', '16'], 1, '2⁵ = 32.'],
    ['O valor de log<sub>3</sub> (1/9) é', ['2', '−2', '1/2', '−1/2'], 1, '3⁻² = 1/9.'],
    ['Sendo log 2 = 0,30 e log 3 = 0,48, o valor de log 6 é', ['0,78', '0,144', '0,18', '1,08'], 0, 'log 6 = log 2 + log 3 = 0,78.'],
    ['Sendo log 2 = 0,30, o valor de log 5 é', ['0,50', '0,70', '0,60', '1,50'], 1, 'log 5 = log(10/2) = 1 − 0,30 = 0,70.'],
    ['A solução de log<sub>2</sub>(x − 1) = 3 é', ['x = 7', 'x = 8', 'x = 9', 'x = 4'], 2, 'x − 1 = 2³ = 8 → x = 9.'],
    ['O valor de log<sub>4</sub> 8 é', ['2', '3/2', '2/3', '1/2'], 1, 'Mudança de base: log₂8 / log₂4 = 3/2.'],
    ['Sendo log 2 = 0,30, o valor de log 20 é', ['0,60', '1,30', '2,30', '0,03'], 1, 'log 20 = log 2 + log 10 = 0,30 + 1 = 1,30.'],
    ['O domínio da função f(x) = log(x − 5) é', ['x &gt; 0', 'x ≥ 5', 'x &gt; 5', 'x ≠ 5'], 2, 'Logaritmando positivo: x − 5 &gt; 0.'],
    ['Se log<sub>x</sub> 16 = 2, então x vale', ['4', '−4', '±4', '8'], 0, 'x² = 16 e a base deve ser positiva: x = 4.'],
    ['A solução de log<sub>2</sub> x + log<sub>2</sub>(x − 2) = 3 é', ['x = −2', 'x = 4', 'x = −2 ou x = 4', 'x = 2'], 1, 'x(x − 2) = 8 → x = 4 ou −2; a condição x &gt; 2 elimina −2.']
  ],
  fc: [
    ['Definição de logaritmo', 'logₐ b = x ⇔ aˣ = b (a > 0, a ≠ 1, b > 0).'],
    ['log do produto e do quociente', 'Soma e subtração dos logs.'],
    ['log de potência', 'logₐ bⁿ = n · logₐ b'],
    ['Mudança de base', 'logₐ b = log b / log a'],
    ['log 2 e log 3 (aprox.)', '0,30 e 0,48'],
    ['log 5 a partir de log 2', '1 − log 2 = 0,70'],
    ['logₐ 1 e logₐ a', '0 e 1'],
    ['Último passo da equação logarítmica', 'Verificar a condição de existência.']
  ]
});

EEAR.add({
  id: 'MAT07', m: 'mat', n: 7, t: 'Progressões aritmética e geométrica', peso: 2, h: 2.5,
  teoria: `
<h3>Progressão aritmética (PA)</h3>
<p>Cada termo é o anterior <b>somado</b> a uma razão r.</p>
<div class="f">a<sub>n</sub> = a<sub>1</sub> + (n − 1)·r<br>S<sub>n</sub> = (a<sub>1</sub> + a<sub>n</sub>)·n / 2<br>Termo médio: b = (a + c)/2  para (a, b, c) em PA</div>
<p>Três termos em PA: use (x − r, x, x + r), que simplifica a soma: 3x.</p>
<h3>Progressão geométrica (PG)</h3>
<p>Cada termo é o anterior <b>multiplicado</b> por uma razão q.</p>
<div class="f">a<sub>n</sub> = a<sub>1</sub> · q<sup>n−1</sup><br>S<sub>n</sub> = a<sub>1</sub>(q<sup>n</sup> − 1)/(q − 1)  (q ≠ 1)<br>Soma infinita (|q| &lt; 1): S = a<sub>1</sub>/(1 − q)<br>Termo médio: b² = a · c  para (a, b, c) em PG</div>
<p>Três termos em PG: use (x/q, x, x·q), que simplifica o produto: x³.</p>
<h3>Classificação</h3>
<ul>
<li>PA: r &gt; 0 crescente, r &lt; 0 decrescente, r = 0 constante.</li>
<li>PG: q &gt; 1 (com a₁ &gt; 0) crescente; 0 &lt; q &lt; 1 (com a₁ &gt; 0) decrescente; q &lt; 0 alternante.</li>
</ul>
<p class="dica">"Quantos múltiplos de 7 existem entre 10 e 100" é PA: ache o primeiro (14) e o último (98) e use aₙ = a₁ + (n − 1)r.</p>`,
  ex: [
    ['Calcule a soma dos 20 primeiros números ímpares.', '<p>PA (1, 3, 5, …): a₂₀ = 1 + 19·2 = 39. S = (1 + 39)·20/2 = <b>400</b>.</p>'],
    ['Na PG (3, 6, 12, …), qual é o 8º termo?', '<p>a₈ = 3·2⁷ = 3·128 = <b>384</b>.</p>'],
    ['Calcule 0,9 + 0,09 + 0,009 + …', '<p>PG infinita com a₁ = 0,9 e q = 0,1: S = 0,9/(1 − 0,1) = <b>1</b>.</p>']
  ],
  q: [
    ['O 20º termo da PA (3, 7, 11, …) é', ['76', '79', '80', '83'], 1, 'a₂₀ = 3 + 19·4 = 79.'],
    ['A soma dos 10 primeiros termos da PA (2, 5, 8, …) é', ['145', '155', '165', '290'], 1, 'a₁₀ = 2 + 9·3 = 29. S = (2 + 29)·10/2 = 155.'],
    ['O 6º termo da PG (2, 6, 18, …) é', ['162', '243', '486', '1458'], 2, 'a₆ = 2·3⁵ = 2·243 = 486.'],
    ['O valor da soma infinita 1 + 1/2 + 1/4 + 1/8 + … é', ['1,5', '2', '3', '∞'], 1, 'S = 1/(1 − 1/2) = 2.'],
    ['Três números em PA têm soma 15 e produto 80. O maior deles é', ['6', '7', '8', '10'], 2, '(5 − r)·5·(5 + r) = 80 → 25 − r² = 16 → r = 3: números 2, 5, 8.'],
    ['A soma dos 5 primeiros termos da PG (3, 6, 12, …) é', ['48', '93', '96', '189'], 1, 'S = 3(2⁵ − 1)/(2 − 1) = 3·31 = 93.'],
    ['Quantos múltiplos de 7 existem entre 10 e 100?', ['12', '13', '14', '15'], 1, 'De 14 a 98: 98 = 14 + (n − 1)·7 → n = 13.'],
    ['Numa PG, a₁ = 5 e a₄ = 40. A razão é', ['2', '3', '4', '8'], 0, '40 = 5·q³ → q³ = 8 → q = 2.'],
    ['Numa PA com a₁ = 10 e razão −3, o 8º termo é', ['−11', '−14', '11', '−8'], 0, 'a₈ = 10 + 7·(−3) = −11.'],
    ['Para que (x, x + 3, x + 12) seja uma PG, x deve valer', ['1', '1,5', '2', '3'], 1, '(x + 3)² = x(x + 12) → x² + 6x + 9 = x² + 12x → x = 1,5.']
  ],
  fc: [
    ['Termo geral da PA', 'aₙ = a₁ + (n − 1)r'],
    ['Soma da PA', 'Sₙ = (a₁ + aₙ)n/2'],
    ['Termo geral da PG', 'aₙ = a₁ · qⁿ⁻¹'],
    ['Soma finita da PG', 'Sₙ = a₁(qⁿ − 1)/(q − 1)'],
    ['Soma infinita da PG', 'S = a₁/(1 − q), com |q| < 1.'],
    ['Termo médio na PA e na PG', 'PA: média aritmética. PG: b² = a·c.'],
    ['Três termos em PA (notação)', 'x − r, x, x + r'],
    ['Três termos em PG (notação)', 'x/q, x, xq']
  ]
});

EEAR.add({
  id: 'MAT08', m: 'mat', n: 8, t: 'Matrizes e determinantes', peso: 2, h: 2.5,
  teoria: `
<h3>Matrizes</h3>
<ul>
<li>Matriz m × n: m linhas e n colunas. a<sub>ij</sub> é o elemento da linha i, coluna j.</li>
<li>Tipos: quadrada (m = n), identidade (1 na diagonal principal, 0 fora), nula, diagonal, triangular, transposta A<sup>t</sup> (linhas viram colunas).</li>
<li>Soma: elemento a elemento (mesma ordem). Produto por número: multiplica todos os elementos.</li>
</ul>
<h3>Produto de matrizes</h3>
<div class="f">A<sub>m×n</sub> · B<sub>n×p</sub> = C<sub>m×p</sub>   (colunas de A = linhas de B)<br>c<sub>ij</sub> = linha i de A "vezes" coluna j de B</div>
<p>O produto não é comutativo: em geral AB ≠ BA.</p>
<h3>Inversa (2 × 2)</h3>
<div class="f">A = [a b; c d] → A<sup>−1</sup> = (1/det A) · [d −b; −c a]   (existe se det A ≠ 0)</div>
<h3>Determinantes</h3>
<div class="f">2 × 2: det [a b; c d] = ad − bc<br>3 × 3 (Sarrus): repita as duas primeiras colunas; some os produtos das diagonais principais e subtraia os das secundárias</div>
<h3>Propriedades</h3>
<ul>
<li>Fila (linha ou coluna) nula, duas filas iguais ou proporcionais → det = 0.</li>
<li>Trocar duas filas de lugar troca o sinal do determinante.</li>
<li>Multiplicar uma fila por k multiplica o det por k. Para a matriz inteira de ordem n: det(kA) = k<sup>n</sup> · det A.</li>
<li>det(A<sup>t</sup>) = det A;  det(AB) = det A · det B;  det(A<sup>−1</sup>) = 1/det A.</li>
<li>Matriz triangular: det = produto da diagonal principal.</li>
</ul>
<p class="dica">det(2A) para A de ordem 3 é 8·det A, não 2·det A. É a pegadinha mais frequente do tema.</p>`,
  ex: [
    ['Construa A = (a<sub>ij</sub>)<sub>2×2</sub> com a<sub>ij</sub> = i + 2j.', '<p>a₁₁ = 3, a₁₂ = 5, a₂₁ = 4, a₂₂ = 6: A = [3 5; 4 6].</p>'],
    ['Calcule o determinante de [2 1 0; 1 3 1; 0 1 2].', '<p>Sarrus: (2·3·2 + 1·1·0 + 0·1·1) − (0·3·0 + 2·1·1 + 1·1·2) = 12 − 4 = <b>8</b>.</p>'],
    ['Se det A = 3 e A é de ordem 2, quanto vale det(3A)?', '<p>3² · 3 = <b>27</b>.</p>']
  ],
  q: [
    ['A matriz A = (a<sub>ij</sub>)<sub>2×2</sub>, com a<sub>ij</sub> = 2i − j, é', ['[1 0; 3 2]', '[1 3; 0 2]', '[1 2; 3 4]', '[0 1; 2 3]'], 0, 'a₁₁ = 1, a₁₂ = 0, a₂₁ = 3, a₂₂ = 2.'],
    ['O determinante de [3 2; 1 4] é', ['10', '14', '12', '2'], 0, '3·4 − 2·1 = 10.'],
    ['O determinante de [1 2 3; 0 1 4; 5 6 0] é', ['1', '−1', '0', '5'], 0, 'Sarrus: (0 + 40 + 0) − (15 + 24 + 0) = 1.'],
    ['Se A é 2 × 3 e B é 3 × 4, o produto AB tem ordem', ['3 × 3', '2 × 4', '4 × 2', 'não existe'], 1, 'Colunas de A = linhas de B = 3; o resultado é 2 × 4.'],
    ['Sendo A de ordem 3 com det A = 5, o valor de det(2A) é', ['10', '20', '40', '80'], 2, 'det(kA) = kⁿ det A = 2³·5 = 40.'],
    ['O produto [1 2; 0 1] · [3; 4] é', ['[11; 4]', '[3; 8]', '[7; 4]', '[11; 7]'], 0, 'Linha 1: 1·3 + 2·4 = 11. Linha 2: 0·3 + 1·4 = 4.'],
    ['A inversa de [2 1; 5 3] é', ['[3 −1; −5 2]', '[−3 1; 5 −2]', '[3 1; 5 2]', '[2 −5; −1 3]'], 0, 'det = 6 − 5 = 1. A⁻¹ = [3 −1; −5 2].'],
    ['Uma matriz quadrada com duas linhas iguais tem determinante', ['1', '0', 'igual ao dobro da diagonal', 'negativo'], 1, 'Filas iguais anulam o determinante.'],
    ['A transposta de [1 2 3; 4 5 6] tem ordem', ['2 × 3', '3 × 2', '3 × 3', '2 × 2'], 1, 'Linhas viram colunas: 2 × 3 → 3 × 2.'],
    ['Os valores de x para que det [x 2; 3 x] = 10 são', ['±2', '±4', '±√10', '4 e −2'], 1, 'x² − 6 = 10 → x² = 16 → x = ±4.']
  ],
  fc: [
    ['Condição para existir AB', 'Colunas de A = linhas de B.'],
    ['Ordem de A(m×n)·B(n×p)', 'm × p'],
    ['det 2×2', 'ad − bc'],
    ['det(kA) com A de ordem n', 'kⁿ · det A'],
    ['Quando det = 0', 'Fila nula, filas iguais ou proporcionais.'],
    ['Trocar duas filas', 'Troca o sinal do determinante.'],
    ['Inversa 2×2', '(1/det)·[d −b; −c a]'],
    ['det(AB) e det(A⁻¹)', 'det A · det B e 1/det A']
  ]
});

EEAR.add({
  id: 'MAT09', m: 'mat', n: 9, t: 'Sistemas lineares', peso: 1, h: 2,
  teoria: `
<h3>Métodos para sistemas 2 × 2</h3>
<ul>
<li><b>Substituição</b>: isole uma incógnita e substitua na outra equação.</li>
<li><b>Adição</b>: multiplique as equações para que uma incógnita tenha coeficientes opostos e some.</li>
</ul>
<h3>Classificação</h3>
<div class="tbl"><table><tbody>
<tr><td><b>SPD</b> (possível e determinado)</td><td>uma única solução; det dos coeficientes ≠ 0</td></tr>
<tr><td><b>SPI</b> (possível e indeterminado)</td><td>infinitas soluções; equações proporcionais (retas coincidentes)</td></tr>
<tr><td><b>SI</b> (impossível)</td><td>nenhuma solução; coeficientes proporcionais, termos independentes não (retas paralelas)</td></tr>
</tbody></table></div>
<p>Exemplos: {x + y = 2; 2x + 2y = 4} é SPI. {x + y = 2; x + y = 5} é SI.</p>
<h3>Regra de Cramer</h3>
<div class="f">x = D<sub>x</sub>/D,  y = D<sub>y</sub>/D,  z = D<sub>z</sub>/D   (D = det dos coeficientes ≠ 0)<br>D<sub>x</sub>: troque a coluna de x pela coluna dos termos independentes</div>
<h3>Escalonamento (3 × 3)</h3>
<p>Elimine incógnitas por combinação de linhas até chegar à forma triangular e resolva de baixo para cima.</p>
<h3>Discussão com parâmetro</h3>
<p>Se D ≠ 0, o sistema é SPD. Se D = 0, ele é SPI ou SI (verifique as equações).</p>
<p><b>Sistema homogêneo</b> (termos independentes nulos) é sempre possível: tem pelo menos a solução trivial (0, 0, 0).</p>
<p class="dica">Em problemas com texto, defina as incógnitas com clareza ("s = preço do suco") antes de montar as equações.</p>`,
  ex: [
    ['Resolva {2x + y = 7; x − y = 2}.', '<p>Somando: 3x = 9 → x = 3; y = 7 − 6 = 1. Solução (3, 1).</p>'],
    ['Para que valor de k o sistema {x + 2y = 3; 2x + ky = 6} é indeterminado?', '<p>D = k − 4 = 0 → k = 4. Com k = 4 a segunda equação é o dobro da primeira: SPI.</p>'],
    ['Resolva {x + y + z = 6; y + z = 5; z = 3}.', '<p>z = 3 → y = 2 → x = 1. Solução (1, 2, 3).</p>']
  ],
  q: [
    ['Se x + y = 10 e x − y = 4, então x · y vale', ['21', '24', '16', '40'], 0, 'x = 7 e y = 3; produto 21.'],
    ['A solução do sistema {2x + 3y = 12; x − y = 1} é', ['(3, 2)', '(2, 3)', '(1, 3)', '(3, 1)'], 0, 'x = y + 1 → 2y + 2 + 3y = 12 → y = 2, x = 3.'],
    ['O sistema {x + y = 2; 2x + 2y = 4} é', ['SPD', 'SPI', 'SI', 'homogêneo'], 1, 'A segunda equação é o dobro da primeira: infinitas soluções.'],
    ['O sistema {x + y = 2; x + y = 5} é', ['SPD', 'SPI', 'SI', 'trivial'], 2, 'Mesmo lado esquerdo com resultados diferentes: impossível.'],
    ['O sistema {kx + 2y = 1; 3x + y = 2} tem solução única para', ['k = 6', 'k ≠ 6', 'k = 2', 'k ≠ 2'], 1, 'D = k·1 − 2·3 = k − 6 ≠ 0 → k ≠ 6.'],
    ['No sistema {x + y + z = 6; y + z = 5; z = 3}, o valor de x é', ['1', '2', '3', '6'], 0, 'z = 3, y = 2, x = 1.'],
    ['Dois sucos e um sanduíche custam R$ 16,00; um suco e dois sanduíches custam R$ 20,00. O sanduíche custa', ['R$ 4,00', 'R$ 6,00', 'R$ 8,00', 'R$ 10,00'], 2, '2s + w = 16 e s + 2w = 20 → s = 4 e w = 8.'],
    ['Um sistema linear homogêneo é sempre', ['impossível.', 'possível.', 'indeterminado.', 'determinado.'], 1, 'Admite ao menos a solução trivial (todas as incógnitas iguais a zero).'],
    ['O sistema {2x − y = 3; 4x − 2y = 6} é', ['SPD', 'SPI', 'SI', 'sem classificação'], 1, 'D = −4 + 4 = 0 e a segunda equação é o dobro da primeira: SPI.'],
    ['A soma das idades de dois irmãos é 50 e a diferença é 10. A idade do mais velho é', ['25', '30', '35', '40'], 1, 'x + y = 50, x − y = 10 → x = 30.']
  ],
  fc: [
    ['SPD', 'Solução única; D ≠ 0.'],
    ['SPI', 'Infinitas soluções; equações proporcionais.'],
    ['SI', 'Sem solução; retas paralelas.'],
    ['Regra de Cramer', 'x = Dx/D, y = Dy/D.'],
    ['Sistema homogêneo', 'Sempre possível (solução trivial).'],
    ['Discussão: D = 0', 'SPI ou SI, verificar as equações.'],
    ['Método da adição', 'Deixe coeficientes opostos e some as equações.']
  ]
});

EEAR.add({
  id: 'MAT10', m: 'mat', n: 10, t: 'Análise combinatória e binômio de Newton', peso: 2, h: 3,
  teoria: `
<h3>Princípio fundamental da contagem</h3>
<p>Se uma decisão tem m opções e outra, independente, tem n opções, o total é <b>m · n</b>. Monte os "tracinhos" e preencha cada etapa.</p>
<h3>Fórmulas</h3>
<div class="f">n! = n·(n − 1)·…·1    0! = 1<br>Arranjo (ordem importa): A<sub>n,p</sub> = n!/(n − p)!<br>Combinação (ordem não importa): C<sub>n,p</sub> = n!/[p!(n − p)!]<br>Permutação: P<sub>n</sub> = n!<br>Permutação com repetição: n!/(a!·b!·…)</div>
<ul>
<li><b>A ordem importa?</b> (presidente e vice, senhas, pódio) → arranjo ou PFC.</li>
<li><b>A ordem não importa?</b> (comissões, grupos, apertos de mão, saladas) → combinação.</li>
<li>Anagramas: permutação das letras. ARARA: 5!/(3!·2!) = 10.</li>
</ul>
<h3>Binômio de Newton</h3>
<div class="f">(a + b)<sup>n</sup> tem n + 1 termos<br>Termo geral: T<sub>p+1</sub> = C<sub>n,p</sub> · a<sup>n−p</sup> · b<sup>p</sup><br>Soma dos coeficientes: substitua as variáveis por 1</div>
<p>Ex.: coeficiente de x³ em (x + 2)<sup>5</sup>: x<sup>5−p</sup> = x³ → p = 2 → C<sub>5,2</sub>·2² = 10·4 = 40.</p>
<p>Triângulo de Pascal: cada número é a soma dos dois acima; a linha n tem soma 2<sup>n</sup>.</p>
<p class="dica">Simplifique fatoriais cortando: 8!/6! = 8·7 = 56. Nunca calcule 8! inteiro.</p>`,
  ex: [
    ['Quantos números de 3 algarismos distintos podemos formar com 1, 2, 3, 4 e 5?', '<p>PFC: 5 · 4 · 3 = <b>60</b>.</p>'],
    ['De quantas maneiras se forma uma comissão de 3 pessoas entre 8?', '<p>C₈,₃ = 8·7·6/(3·2·1) = <b>56</b>.</p>'],
    ['Qual a soma dos coeficientes de (2x − 1)⁶?', '<p>x = 1: (2 − 1)⁶ = <b>1</b>.</p>']
  ],
  q: [
    ['O número de anagramas da palavra AMOR é', ['12', '16', '24', '120'], 2, '4! = 24.'],
    ['O número de anagramas da palavra ARARA é', ['10', '20', '60', '120'], 0, '5!/(3!·2!) = 120/12 = 10.'],
    ['O número de comissões de 3 pessoas que se pode formar com 8 pessoas é', ['24', '56', '336', '512'], 1, 'C₈,₃ = 56 (a ordem não importa).'],
    ['De quantas formas se escolhem um presidente e um vice entre 10 candidatos?', ['20', '45', '90', '100'], 2, 'A ordem importa: 10 · 9 = 90.'],
    ['Quantas senhas de 4 algarismos distintos podem ser formadas com os dígitos de 0 a 9?', ['10.000', '5.040', '210', '3.024'], 1, '10 · 9 · 8 · 7 = 5040.'],
    ['Quantos números de 3 algarismos distintos se formam com os dígitos 1, 2, 3, 4 e 5?', ['15', '60', '125', '20'], 1, '5 · 4 · 3 = 60.'],
    ['O coeficiente de x³ no desenvolvimento de (x + 2)⁵ é', ['10', '20', '40', '80'], 2, 'p = 2: C₅,₂ · 2² = 10 · 4 = 40.'],
    ['A soma dos coeficientes de (2x − 1)⁶ é', ['0', '1', '64', '729'], 1, 'Substituindo x = 1: (2 − 1)⁶ = 1.'],
    ['Numa reunião com 10 pessoas, cada uma cumprimenta todas as outras uma vez. O número de cumprimentos é', ['45', '90', '100', '20'], 0, 'C₁₀,₂ = 45 (a ordem não importa).'],
    ['O valor de 8!/6! é', ['2', '48', '56', '336'], 2, '8 · 7 = 56.']
  ],
  fc: [
    ['Arranjo x combinação', 'Arranjo: a ordem importa. Combinação: não importa.'],
    ['Fórmula do arranjo', 'Aₙ,ₚ = n!/(n − p)!'],
    ['Fórmula da combinação', 'Cₙ,ₚ = n!/[p!(n − p)!]'],
    ['Anagramas com letras repetidas', 'n!/(a!·b!·…)'],
    ['Termo geral do binômio', 'Tₚ₊₁ = Cₙ,ₚ · aⁿ⁻ᵖ · bᵖ'],
    ['Soma dos coeficientes de um binômio', 'Substitua as variáveis por 1.'],
    ['0!', '1'],
    ['Número de termos de (a + b)ⁿ', 'n + 1']
  ]
});

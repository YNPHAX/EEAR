/* Matemática — módulos 11 a 15 */
EEAR.add({
  id: 'MAT11', m: 'mat', n: 11, t: 'Probabilidade', peso: 2, h: 2.5,
  teoria: `
<h3>Conceitos</h3>
<p><b>Espaço amostral</b> (Ω): todos os resultados possíveis. <b>Evento</b>: subconjunto de Ω.</p>
<div class="f">P(A) = casos favoráveis / casos possíveis      0 ≤ P(A) ≤ 1<br>Complementar: P(não A) = 1 − P(A)<br>União: P(A ∪ B) = P(A) + P(B) − P(A ∩ B)<br>Independentes: P(A ∩ B) = P(A) · P(B)<br>Condicional: P(A | B) = P(A ∩ B) / P(B)</div>
<h3>Situações típicas</h3>
<ul>
<li><b>Um dado</b>: Ω tem 6 resultados. <b>Dois dados</b>: 36 pares. Soma 7 aparece 6 vezes: (1,6), (2,5), (3,4), (4,3), (5,2), (6,1).</li>
<li><b>Moedas</b>: n moedas têm 2<sup>n</sup> resultados.</li>
<li><b>Sem reposição</b>: o total diminui a cada retirada: P(duas vermelhas de 5V e 3A) = 5/8 · 4/7.</li>
<li><b>"Pelo menos um"</b>: use o complementar: P = 1 − P(nenhum).</li>
<li>"E" entre eventos sucessivos → multiplica. "Ou" entre eventos excludentes → soma.</li>
</ul>
<p class="dica">Na condicional, o espaço amostral encolhe para o grupo dado. "Sabendo que usa óculos, qual a chance de ser menino?" → conte só quem usa óculos.</p>`,
  ex: [
    ['Lançando dois dados, qual a probabilidade de a soma ser 8?', '<p>Pares: (2,6), (3,5), (4,4), (5,3), (6,2) = 5 casos. P = <b>5/36</b>.</p>'],
    ['Lançando uma moeda 3 vezes, qual a probabilidade de sair pelo menos uma cara?', '<p>P(nenhuma cara) = (1/2)³ = 1/8. P = 1 − 1/8 = <b>7/8</b>.</p>'],
    ['Numa urna há 4 bolas brancas e 6 pretas. Retiram-se duas sem reposição. Qual a probabilidade de ambas serem brancas?', '<p>4/10 · 3/9 = 12/90 = <b>2/15</b>.</p>']
  ],
  q: [
    ['Ao lançar um dado, a probabilidade de sair um número primo é', ['1/3', '1/2', '2/3', '1/6'], 1, 'Primos: 2, 3, 5 → 3/6 = 1/2.'],
    ['Lançando duas moedas, a probabilidade de saírem duas caras é', ['1/2', '1/3', '1/4', '3/4'], 2, 'Resultados: CC, CK, KC, KK → 1/4.'],
    ['Lançando dois dados, a probabilidade de a soma ser 7 é', ['1/6', '1/12', '7/36', '1/36'], 0, '6 casos em 36: 1/6.'],
    ['Uma urna tem 5 bolas vermelhas e 3 azuis. Retirando uma ao acaso, a probabilidade de ser azul é', ['3/5', '3/8', '5/8', '1/3'], 1, '3 azuis em 8 bolas.'],
    ['Da mesma urna (5 vermelhas e 3 azuis), retiram-se duas bolas sem reposição. A probabilidade de ambas serem vermelhas é', ['25/64', '5/14', '5/16', '10/28'], 1, '5/8 · 4/7 = 20/56 = 5/14.'],
    ['Sorteando um número de 1 a 20, a probabilidade de ele ser múltiplo de 3 ou de 5 é', ['9/20', '10/20', '8/20', '11/20'], 0, 'Múltiplos de 3: 6; de 5: 4; de ambos (15): 1. Total 6 + 4 − 1 = 9.'],
    ['Se a probabilidade de chover amanhã é 0,3, a probabilidade de não chover é', ['0,3', '0,5', '0,7', '1,3'], 2, 'Complementar: 1 − 0,3 = 0,7.'],
    ['A e B são independentes, com P(A) = 0,5 e P(B) = 0,4. Então P(A ∩ B) é', ['0,9', '0,2', '0,1', '0,45'], 1, 'Independentes: 0,5 · 0,4 = 0,2.'],
    ['Numa turma, 10 meninos e 6 meninas usam óculos. Sorteia-se um aluno que usa óculos. A probabilidade de ser menino é', ['5/8', '3/8', '10/40', '1/2'], 0, 'Espaço reduzido: 16 alunos de óculos, 10 meninos → 10/16 = 5/8.'],
    ['Lançando um dado duas vezes, a probabilidade de sair pelo menos um 6 é', ['1/3', '11/36', '1/6', '25/36'], 1, '1 − (5/6)² = 1 − 25/36 = 11/36.']
  ],
  fc: [
    ['Probabilidade clássica', 'Favoráveis / possíveis.'],
    ['Complementar', 'P(não A) = 1 − P(A).'],
    ['P(A ∪ B)', 'P(A) + P(B) − P(A ∩ B).'],
    ['Eventos independentes', 'P(A ∩ B) = P(A)·P(B).'],
    ['Condicional', 'P(A|B) = P(A ∩ B)/P(B): o espaço vira B.'],
    ['"Pelo menos um"', '1 − P(nenhum).'],
    ['Soma 7 com dois dados', '6/36 = 1/6.'],
    ['Sem reposição', 'O total diminui a cada retirada.']
  ]
});

EEAR.add({
  id: 'MAT12', m: 'mat', n: 12, t: 'Estatística', peso: 2, h: 2,
  teoria: `
<h3>Medidas de tendência central</h3>
<ul>
<li><b>Média aritmética</b>: soma dos valores dividida pela quantidade.</li>
<li><b>Média ponderada</b>: Σ(valor · peso) / Σ pesos.</li>
<li><b>Moda</b>: valor que mais aparece (pode haver mais de uma ou nenhuma).</li>
<li><b>Mediana</b>: valor central com os dados <b>em ordem</b>. Com quantidade par, é a média dos dois centrais.</li>
</ul>
<h3>Medidas de dispersão</h3>
<div class="f">Amplitude = maior valor − menor valor<br>Variância: σ² = Σ(x<sub>i</sub> − x̄)² / n<br>Desvio padrão: σ = √(variância)</div>
<p>Somar uma constante a todos os valores muda a média (soma a constante), mas <b>não</b> muda a variância nem o desvio padrão. Multiplicar todos por k multiplica a média e o desvio por k, e a variância por k².</p>
<h3>Frequências e gráficos</h3>
<ul>
<li>Frequência absoluta: quantas vezes o valor aparece. Relativa: absoluta ÷ total (em %). Acumulada: soma até a classe.</li>
<li>Gráfico de setores: ângulo = frequência relativa × 360°. 25% ↔ 90°.</li>
<li>Histograma: barras justapostas para classes (intervalos).</li>
</ul>
<p class="dica">Antes de achar a mediana, sempre coloque os dados em ordem crescente.</p>`,
  ex: [
    ['Calcule média, moda e mediana de 2, 5, 5, 6, 7, 11.', '<p>Média = 36/6 = 6. Moda = 5. Mediana = (5 + 6)/2 = 5,5.</p>'],
    ['A média de 4 provas é 7. Que nota a 5ª prova precisa ter para a média subir para 7,4?', '<p>Soma atual 28; nova soma 5 · 7,4 = 37. Nota: 37 − 28 = <b>9</b>.</p>'],
    ['Calcule o desvio padrão de 1, 3, 5.', '<p>Média 3. Desvios ao quadrado: 4, 0, 4. Variância = 8/3. σ = √(8/3) ≈ 1,63.</p>']
  ],
  q: [
    ['A média aritmética de 4, 6, 8, 10 e 12 é', ['6', '7', '8', '9'], 2, 'Soma 40 ÷ 5 = 8.'],
    ['A mediana de 3, 7, 1, 9, 5, 11 é', ['5', '6', '7', '9'], 1, 'Ordenando: 1, 3, 5, 7, 9, 11 → (5 + 7)/2 = 6.'],
    ['A moda de 2, 3, 3, 5, 7, 7, 7, 9 é', ['3', '5', '7', '9'], 2, '7 aparece três vezes.'],
    ['Um aluno tirou 6 numa prova de peso 2 e 8 numa de peso 3. A média ponderada é', ['7,0', '7,2', '7,5', '6,8'], 1, '(6·2 + 8·3)/5 = 36/5 = 7,2.'],
    ['A variância dos valores 2, 4 e 6 é', ['4', '8/3', '2', '√8'], 1, 'Média 4; (4 + 0 + 4)/3 = 8/3.'],
    ['Num gráfico de setores, uma categoria com 25% do total corresponde a um ângulo de', ['25°', '45°', '90°', '120°'], 2, '0,25 · 360° = 90°.'],
    ['Se somarmos 5 a cada valor de um conjunto de dados, o desvio padrão', ['aumenta 5.', 'não se altera.', 'é multiplicado por 5.', 'diminui 5.'], 1, 'Somar uma constante desloca os dados sem mudar a dispersão.'],
    ['A média de 5 números é 10. Incluindo o número 22, a nova média é', ['11', '12', '16', '13'], 1, '(50 + 22)/6 = 72/6 = 12.'],
    ['A amplitude dos dados 3, 8, 15 e 4 é', ['11', '12', '15', '7,5'], 1, '15 − 3 = 12.'],
    ['Numa turma de 40 alunos, 10 tiraram conceito A. A frequência relativa desse conceito é', ['10%', '25%', '40%', '4%'], 1, '10/40 = 0,25 = 25%.']
  ],
  fc: [
    ['Mediana com quantidade par', 'Média dos dois valores centrais (dados em ordem).'],
    ['Média ponderada', 'Σ(valor·peso)/Σpesos'],
    ['Moda', 'Valor mais frequente.'],
    ['Variância', 'Média dos quadrados dos desvios em relação à média.'],
    ['Desvio padrão', 'Raiz quadrada da variância.'],
    ['Somar constante aos dados', 'Média muda; desvio e variância não.'],
    ['Ângulo no gráfico de setores', 'Frequência relativa × 360°.']
  ]
});

EEAR.add({
  id: 'MAT13', m: 'mat', n: 13, t: 'Trigonometria no triângulo', peso: 2, h: 2.5,
  teoria: `
<h3>Triângulo retângulo</h3>
<div class="f">sen θ = cateto oposto / hipotenusa<br>cos θ = cateto adjacente / hipotenusa<br>tg θ = cateto oposto / cateto adjacente = sen θ / cos θ<br>sen² θ + cos² θ = 1</div>
<div class="tbl"><table><thead><tr><th></th><th>30°</th><th>45°</th><th>60°</th></tr></thead><tbody>
<tr><td>sen</td><td>1/2</td><td>√2/2</td><td>√3/2</td></tr>
<tr><td>cos</td><td>√3/2</td><td>√2/2</td><td>1/2</td></tr>
<tr><td>tg</td><td>√3/3</td><td>1</td><td>√3</td></tr>
</tbody></table></div>
<p>Ângulos complementares: sen θ = cos(90° − θ).</p>
<h3>Triângulos quaisquer</h3>
<div class="f">Lei dos senos: a/sen A = b/sen B = c/sen C = 2R  (R = raio da circunferência circunscrita)<br>Lei dos cossenos: a² = b² + c² − 2bc · cos A<br>Área: S = (1/2) · a · b · sen C</div>
<ul>
<li>Use a <b>lei dos senos</b> quando tiver pares "lado e ângulo oposto".</li>
<li>Use a <b>lei dos cossenos</b> com dois lados e o ângulo entre eles, ou com os três lados.</li>
<li>cos 120° = −1/2, sen 120° = √3/2, cos 150° = −√3/2, sen 150° = 1/2.</li>
</ul>
<p class="dica">Problemas de "ângulo de elevação", rampa, escada e sombra são triângulo retângulo. Desenhe e marque o ângulo antes de escolher sen, cos ou tg.</p>`,
  ex: [
    ['Uma torre projeta sombra de 20 m quando o Sol está a 60° de elevação. Qual a altura da torre?', '<p>tg 60° = h/20 → h = 20√3 m (≈ 34,6 m).</p>'],
    ['Num triângulo, b = 3, c = 5 e A = 120°. Calcule a.', '<p>a² = 9 + 25 − 2·3·5·(−1/2) = 34 + 15 = 49 → <b>a = 7</b>.</p>'],
    ['Calcule a área de um triângulo de lados 4 e 10 que formam 30°.', '<p>S = (1/2)·4·10·(1/2) = <b>10</b>.</p>']
  ],
  q: [
    ['Uma rampa de 10 m de comprimento forma 30° com o solo. A altura atingida no topo é', ['5 m', '5√3 m', '10√3 m', '8 m'], 0, 'sen 30° = h/10 → h = 10 · 1/2 = 5 m.'],
    ['Uma torre projeta uma sombra de 20 m quando o ângulo de elevação do Sol é 60°. A altura da torre é', ['20√3 m', '10√3 m', '20 m', '40 m'], 0, 'tg 60° = h/20 → h = 20√3 m.'],
    ['Sendo x um ângulo agudo com sen x = 3/5, o valor de tg x é', ['4/5', '3/4', '4/3', '5/3'], 1, 'cos x = 4/5 (sen² + cos² = 1) → tg = (3/5)/(4/5) = 3/4.'],
    ['Num triângulo, b = 3, c = 5 e o ângulo entre eles é 60°. O lado a mede', ['√19', '7', '√34', '4'], 0, 'a² = 9 + 25 − 2·3·5·(1/2) = 19.'],
    ['Num triângulo, a = 10, A = 30° e B = 45°. O lado b mede', ['5√2', '10√2', '10√3', '20'], 1, 'b = 10 · sen 45°/sen 30° = 10 · (√2/2)/(1/2) = 10√2.'],
    ['A área de um triângulo com lados 6 e 8 formando um ângulo de 30° é', ['12', '24', '48', '12√3'], 0, 'S = (1/2)·6·8·(1/2) = 12.'],
    ['Num triângulo, o lado oposto ao ângulo de 30° mede 6. O raio da circunferência circunscrita é', ['3', '6', '12', '6√3'], 1, '6/sen 30° = 2R → 12 = 2R → R = 6.'],
    ['Um avião decola e sobe em linha reta formando 30° com a pista. Depois de percorrer 2000 m nessa trajetória, sua altura é', ['1000 m', '1000√3 m', '2000√3 m', '1500 m'], 0, 'sen 30° = h/2000 → h = 1000 m.'],
    ['O valor de cos 60° + sen 30° é', ['1/2', '1', '√3', '√3/2'], 1, '1/2 + 1/2 = 1.'],
    ['Uma escada de 5 m está apoiada numa parede, com o pé a 3 m da parede. O cosseno do ângulo que a escada forma com o chão é', ['3/5', '4/5', '3/4', '5/3'], 0, 'cos = cateto adjacente (3) / hipotenusa (5).']
  ],
  fc: [
    ['sen, cos e tg no triângulo retângulo', 'Oposto/hip, adjacente/hip, oposto/adjacente.'],
    ['sen, cos e tg de 30°', '1/2, √3/2, √3/3'],
    ['sen, cos e tg de 45°', '√2/2, √2/2, 1'],
    ['sen, cos e tg de 60°', '√3/2, 1/2, √3'],
    ['Relação fundamental', 'sen² θ + cos² θ = 1'],
    ['Lei dos senos', 'a/sen A = b/sen B = c/sen C = 2R'],
    ['Lei dos cossenos', 'a² = b² + c² − 2bc·cos A'],
    ['Área com dois lados e o ângulo', 'S = (1/2)·a·b·sen C']
  ]
});

EEAR.add({
  id: 'MAT14', m: 'mat', n: 14, t: 'Trigonometria no ciclo: arcos, funções e identidades', peso: 3, h: 3,
  teoria: `
<h3>Arcos e radianos</h3>
<div class="f">π rad = 180°     ângulo em rad = graus · π/180<br>Comprimento do arco: ℓ = α · r  (α em radianos)</div>
<p>30° = π/6, 45° = π/4, 60° = π/3, 90° = π/2, 120° = 2π/3, 135° = 3π/4, 150° = 5π/6, 270° = 3π/2.</p>
<h3>Sinais por quadrante</h3>
<div class="tbl"><table><thead><tr><th></th><th>1º (0–90°)</th><th>2º (90–180°)</th><th>3º (180–270°)</th><th>4º (270–360°)</th></tr></thead><tbody>
<tr><td>sen</td><td>+</td><td>+</td><td>−</td><td>−</td></tr>
<tr><td>cos</td><td>+</td><td>−</td><td>−</td><td>+</td></tr>
<tr><td>tg</td><td>+</td><td>−</td><td>+</td><td>−</td></tr>
</tbody></table></div>
<h3>Redução ao 1º quadrante</h3>
<ul>
<li>2º quadrante: 180° − x (sen 150° = sen 30° = 1/2; cos 150° = −cos 30°).</li>
<li>3º quadrante: x − 180° (sen 210° = −sen 30° = −1/2).</li>
<li>4º quadrante: 360° − x (cos 300° = cos 60° = 1/2; sen 300° = −√3/2).</li>
<li>Arcos maiores que 360°: tire voltas inteiras (sen 390° = sen 30°).</li>
</ul>
<h3>Funções trigonométricas</h3>
<div class="f">f(x) = a + b·sen(cx + d)  ou  a + b·cos(cx + d)<br>Imagem: [a − |b|, a + |b|]     Período: 2π/|c|<br>tg x tem período π e não existe em x = π/2 + kπ</div>
<h3>Identidades</h3>
<div class="f">tg x = sen x/cos x   sec x = 1/cos x   cossec x = 1/sen x   cotg x = cos x/sen x<br>1 + tg² x = sec² x     1 + cotg² x = cossec² x<br>sen(a ± b) = sen a·cos b ± sen b·cos a<br>cos(a ± b) = cos a·cos b ∓ sen a·sen b<br>sen 2a = 2·sen a·cos a     cos 2a = cos² a − sen² a = 1 − 2sen² a</div>
<h3>Equações</h3>
<p>sen x = 1/2 em [0, 2π]: x = π/6 ou x = 5π/6 (1º e 2º quadrantes, onde o seno é positivo). cos x = 1/2: x = π/3 ou 5π/3.</p>
<p class="dica">Nas questões de imagem e período, identifique a, b e c e aplique as fórmulas: a cobrança é direta.</p>`,
  ex: [
    ['Calcule sen 75°.', '<p>sen(45° + 30°) = (√2/2)(√3/2) + (√2/2)(1/2) = <b>(√6 + √2)/4</b>.</p>'],
    ['Determine imagem e período de f(x) = 1 − 2cos(3x).', '<p>a = 1, |b| = 2: Im = [−1, 3]. Período = 2π/3.</p>'],
    ['Sendo sen x = 0,6 com x no 2º quadrante, calcule cos x e tg x.', '<p>cos² x = 1 − 0,36 = 0,64 → cos x = −0,8 (2º quadrante). tg x = 0,6/(−0,8) = −0,75.</p>']
  ],
  q: [
    ['O ângulo de 150° corresponde, em radianos, a', ['3π/4', '5π/6', '2π/3', '5π/3'], 1, '150 · π/180 = 5π/6.'],
    ['O valor de sen 210° é', ['1/2', '−1/2', '√3/2', '−√3/2'], 1, '3º quadrante: sen 210° = −sen 30° = −1/2.'],
    ['O valor de cos 120° é', ['1/2', '−1/2', '√3/2', '−√3/2'], 1, '2º quadrante: cos 120° = −cos 60° = −1/2.'],
    ['O período da função f(x) = 3·sen(2x) é', ['2π', 'π', 'π/2', '3π'], 1, 'Período = 2π/2 = π.'],
    ['A imagem da função f(x) = 2 + 3cos x é', ['[−1, 5]', '[2, 5]', '[−3, 3]', '[−1, 3]'], 0, '[2 − 3, 2 + 3] = [−1, 5].'],
    ['O valor de sen 75° é', ['(√6 + √2)/4', '(√6 − √2)/4', '√3/2', '(√3 + 1)/2'], 0, 'sen(45° + 30°) = sen45·cos30 + sen30·cos45 = (√6 + √2)/4.'],
    ['As soluções de sen x = 1/2 no intervalo [0, 2π] são', ['π/6 e 5π/6', 'π/3 e 2π/3', 'π/6 e 7π/6', 'π/3 e 5π/3'], 0, 'Seno positivo no 1º e 2º quadrantes: π/6 e π − π/6 = 5π/6.'],
    ['Se sen x = 0,6 e x pertence ao 2º quadrante, então cos x vale', ['0,8', '−0,8', '0,4', '−0,6'], 1, 'cos² x = 0,64; no 2º quadrante o cosseno é negativo.'],
    ['Se sen x = 3/5 e cos x = 4/5, então sen 2x é', ['6/5', '12/25', '24/25', '7/25'], 2, 'sen 2x = 2 · 3/5 · 4/5 = 24/25.'],
    ['Numa circunferência de raio 10 cm, um arco de 2 rad mede', ['5 cm', '10 cm', '20 cm', '20π cm'], 2, 'ℓ = α·r = 2 · 10 = 20 cm.']
  ],
  fc: [
    ['Conversão graus → radianos', 'Multiplique por π/180.'],
    ['Sinais no 2º quadrante', 'sen +, cos −, tg −.'],
    ['Sinais no 3º quadrante', 'sen −, cos −, tg +.'],
    ['Imagem de a + b·sen(cx)', '[a − |b|, a + |b|]'],
    ['Período de sen(cx) e de tg(cx)', '2π/|c| e π/|c|'],
    ['sen(a + b)', 'sen a·cos b + sen b·cos a'],
    ['cos(a + b)', 'cos a·cos b − sen a·sen b'],
    ['sen 2a e cos 2a', '2 sen a cos a; cos² a − sen² a']
  ]
});

EEAR.add({
  id: 'MAT15', m: 'mat', n: 15, t: 'Geometria plana: ângulos, triângulos e polígonos', peso: 3, h: 3,
  teoria: `
<h3>Ângulos</h3>
<ul>
<li>Complementares: somam 90°. Suplementares: somam 180°. Opostos pelo vértice: são iguais.</li>
<li>Paralelas cortadas por transversal: alternos internos e correspondentes são iguais; colaterais internos são suplementares.</li>
</ul>
<h3>Triângulos</h3>
<div class="f">Soma dos ângulos internos = 180°<br>Ângulo externo = soma dos dois internos não adjacentes</div>
<ul>
<li>Condição de existência: cada lado é menor que a soma dos outros dois.</li>
<li>Ao maior lado opõe-se o maior ângulo.</li>
<li>Congruência: LLL, LAL, ALA, LAAo.</li>
<li><b>Semelhança</b> (AA): lados proporcionais na razão k; perímetros na razão k; áreas na razão <b>k²</b>.</li>
</ul>
<h3>Teorema de Tales</h3>
<p>Retas paralelas cortadas por duas transversais determinam segmentos proporcionais: a/b = c/d.</p>
<h3>Triângulo retângulo: relações métricas</h3>
<div class="f">a² = b² + c²  (Pitágoras; a = hipotenusa)<br>h² = m · n     b² = a · m     c² = a · n     a · h = b · c<br>(m e n: projeções dos catetos sobre a hipotenusa; h: altura relativa à hipotenusa)</div>
<p>Ternos pitagóricos úteis: 3-4-5, 5-12-13, 8-15-17 e seus múltiplos (6-8-10, 9-12-15).</p>
<h3>Polígonos</h3>
<div class="f">Soma dos ângulos internos: S<sub>i</sub> = (n − 2) · 180°<br>Soma dos ângulos externos: 360°<br>Número de diagonais: d = n(n − 3)/2<br>Polígono regular: ângulo interno = S<sub>i</sub>/n; ângulo externo = 360°/n</div>
<h3>Pontos notáveis do triângulo</h3>
<ul>
<li><b>Baricentro</b> (medianas): divide cada mediana na razão 2 : 1 a partir do vértice.</li>
<li><b>Incentro</b> (bissetrizes): centro da circunferência inscrita.</li>
<li><b>Circuncentro</b> (mediatrizes): centro da circunferência circunscrita.</li>
<li><b>Ortocentro</b> (alturas).</li>
</ul>
<p class="dica">"Suplemento do complemento" de x é 180° − (90° − x) = 90° + x. Monte a expressão antes de substituir números.</p>`,
  ex: [
    ['Quanto mede cada ângulo interno de um octógono regular?', '<p>Sᵢ = 6 · 180° = 1080°; cada um: 1080°/8 = <b>135°</b>.</p>'],
    ['Num triângulo retângulo, as projeções dos catetos são 4 e 9. Calcule a altura relativa à hipotenusa.', '<p>h² = 4 · 9 = 36 → <b>h = 6</b>.</p>'],
    ['Dois triângulos semelhantes têm razão de semelhança 3. Se a área do menor é 5, qual a área do maior?', '<p>Razão das áreas = 3² = 9: 5 · 9 = <b>45</b>.</p>']
  ],
  q: [
    ['O suplemento do complemento de 40° mede', ['50°', '130°', '140°', '230°'], 1, 'Complemento: 50°. Suplemento de 50°: 130°.'],
    ['Os ângulos internos de um triângulo medem x, 2x e 3x. O maior ângulo mede', ['60°', '75°', '90°', '120°'], 2, '6x = 180° → x = 30°; maior: 90°.'],
    ['A soma dos ângulos internos de um hexágono é', ['540°', '720°', '900°', '1080°'], 1, '(6 − 2) · 180° = 720°.'],
    ['O número de diagonais de um octógono é', ['16', '20', '24', '40'], 1, '8 · 5/2 = 20.'],
    ['Cada ângulo interno de um pentágono regular mede', ['72°', '100°', '108°', '120°'], 2, 'Sᵢ = 540°; 540/5 = 108°.'],
    ['Num triângulo retângulo de catetos 6 e 8, a altura relativa à hipotenusa mede', ['4,8', '5', '7', '10'], 0, 'Hipotenusa 10; a·h = b·c → 10h = 48 → h = 4,8.'],
    ['Três retas paralelas cortam duas transversais. Numa delas, os segmentos medem 3 e 6; na outra, o segmento correspondente ao de 3 mede 4. O outro mede', ['6', '7', '8', '9'], 2, 'Tales: 3/6 = 4/x → x = 8.'],
    ['Dois triângulos semelhantes têm razão de semelhança 2. A razão entre suas áreas é', ['2', '4', '8', '√2'], 1, 'Áreas na razão k² = 4.'],
    ['Num triângulo, dois ângulos internos medem 50° e 60°. O ângulo externo adjacente ao terceiro ângulo mede', ['70°', '110°', '120°', '130°'], 1, 'Ângulo externo = soma dos internos não adjacentes = 50° + 60° = 110°.'],
    ['Num triângulo retângulo, a hipotenusa mede 13 cm e um dos catetos mede 5 cm. O outro cateto mede', ['8 cm', '12 cm', '√194 cm', '18 cm'], 1, 'Pitágoras: 169 = 25 + c² → c² = 144 → c = 12 (terno 5-12-13).']
  ],
  fc: [
    ['Complementares e suplementares', 'Somam 90° e 180°.'],
    ['Ângulo externo do triângulo', 'Soma dos dois internos não adjacentes.'],
    ['Soma dos ângulos internos de um polígono', '(n − 2)·180°'],
    ['Número de diagonais', 'n(n − 3)/2'],
    ['Relações métricas: altura', 'h² = m·n e a·h = b·c'],
    ['Semelhança: razão das áreas', 'k²'],
    ['Baricentro', 'Divide a mediana em 2:1 a partir do vértice.'],
    ['Ternos pitagóricos', '3-4-5, 5-12-13, 8-15-17.']
  ]
});

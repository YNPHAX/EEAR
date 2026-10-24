/* Matemática — módulos 16 a 20 */
EEAR.add({
  id: 'MAT16', m: 'mat', n: 16, t: 'Geometria plana: circunferência e áreas', peso: 3, h: 3,
  teoria: `
<h3>Ângulos na circunferência</h3>
<ul>
<li><b>Ângulo central</b>: vértice no centro; mede o mesmo que o arco.</li>
<li><b>Ângulo inscrito</b>: vértice na circunferência; mede <b>metade</b> do arco. Inscrito num semicírculo = 90°.</li>
<li>A reta tangente é perpendicular ao raio no ponto de tangência.</li>
<li>Quadrilátero inscrito: ângulos opostos são suplementares.</li>
</ul>
<h3>Potência de ponto</h3>
<div class="f">Duas cordas que se cruzam em P: PA · PB = PC · PD<br>Duas secantes por P externo: PA · PB = PC · PD (segmentos até cada ponto de corte)<br>Tangente e secante: PT² = PA · PB</div>
<h3>Comprimento e áreas</h3>
<div class="f">Circunferência: C = 2πr       Círculo: A = πr²<br>Setor de α graus: A = (α/360°) · πr²      Coroa: A = π(R² − r²)<br>Quadrado: l²     Retângulo: b · h     Paralelogramo: b · h<br>Triângulo: b·h/2   ou   (1/2)·a·b·sen C<br>Heron: A = √[p(p − a)(p − b)(p − c)], p = semiperímetro<br>Triângulo equilátero: A = l²√3/4,  altura = l√3/2<br>Trapézio: (B + b)·h/2     Losango: D·d/2<br>Hexágono regular: 6 · l²√3/4</div>
<p class="dica">O hexágono regular é formado por 6 triângulos equiláteros de lado igual ao lado do hexágono. E o lado do hexágono inscrito é igual ao raio.</p>`,
  ex: [
    ['Calcule a área de um triângulo de lados 13, 14 e 15.', '<p>p = 21. A = √(21·8·7·6) = √7056 = <b>84</b>.</p>'],
    ['Num círculo de raio 6 cm, qual a área de um setor de 120°?', '<p>(120/360)·π·36 = <b>12π cm²</b>.</p>'],
    ['De um ponto P externo, a tangente mede PT e a secante corta a circunferência em A e B, com PA = 4 e PB = 9. Calcule PT.', '<p>PT² = 4 · 9 = 36 → <b>PT = 6</b>.</p>']
  ],
  q: [
    ['Um ângulo inscrito determina na circunferência um arco de 100°. Esse ângulo mede', ['50°', '100°', '200°', '25°'], 0, 'Ângulo inscrito = metade do arco.'],
    ['A área de um círculo de diâmetro 10 cm é', ['10π cm²', '25π cm²', '100π cm²', '20π cm²'], 1, 'r = 5 → A = 25π.'],
    ['A área de um trapézio de bases 10 e 6 e altura 4 é', ['24', '32', '40', '64'], 1, '(10 + 6)·4/2 = 32.'],
    ['A área de um losango de diagonais 8 e 6 é', ['14', '24', '48', '28'], 1, '8·6/2 = 24.'],
    ['A área de um triângulo equilátero de lado 4 é', ['4√3', '8√3', '16√3', '2√3'], 0, 'l²√3/4 = 16√3/4 = 4√3.'],
    ['A área de um setor circular de 60° num círculo de raio 6 é', ['6π', '12π', '36π', '3π'], 0, '(60/360)·36π = 6π.'],
    ['Duas cordas se cruzam num ponto P. Numa delas, PA = 4 e PB = 6; na outra, PC = 3. Então PD mede', ['2', '4,5', '8', '12'], 2, 'PA·PB = PC·PD → 24 = 3·PD → PD = 8.'],
    ['De um ponto externo P, a secante corta a circunferência em A e B, com PA = 4 e PB = 9. O segmento tangente PT mede', ['5', '6', '13', '36'], 1, 'PT² = 4·9 = 36 → PT = 6.'],
    ['A área de um triângulo de lados 5, 5 e 6 é', ['12', '15', '24', '30'], 0, 'p = 8: √(8·3·3·2) = √144 = 12.'],
    ['A área de um hexágono regular de lado 2 é', ['6√3', '12√3', '3√3', '24'], 0, '6 · (4√3/4) = 6√3.']
  ],
  fc: [
    ['Ângulo inscrito', 'Metade do arco correspondente.'],
    ['Inscrito no semicírculo', '90°'],
    ['Cordas que se cruzam', 'PA·PB = PC·PD'],
    ['Tangente e secante', 'PT² = PA·PB'],
    ['Área do setor', '(α/360°)·πr²'],
    ['Área do triângulo equilátero', 'l²√3/4'],
    ['Fórmula de Heron', '√[p(p − a)(p − b)(p − c)]'],
    ['Área do trapézio e do losango', '(B + b)h/2 e D·d/2']
  ]
});

EEAR.add({
  id: 'MAT17', m: 'mat', n: 17, t: 'Geometria espacial', peso: 3, h: 3,
  teoria: `
<h3>Poliedros</h3>
<div class="f">Relação de Euler (poliedros convexos): V − A + F = 2</div>
<p>Contagem de arestas: some os lados de todas as faces e divida por 2 (cada aresta pertence a duas faces).</p>
<h3>Prismas e cubo</h3>
<div class="f">Prisma: V = A<sub>base</sub> · h     A<sub>total</sub> = 2·A<sub>base</sub> + A<sub>lateral</sub><br>Paralelepípedo: V = a·b·c     diagonal d = √(a² + b² + c²)<br>Cubo: V = a³     A<sub>total</sub> = 6a²     diagonal d = a√3</div>
<h3>Pirâmide</h3>
<div class="f">V = (A<sub>base</sub> · h)/3</div>
<h3>Cilindro</h3>
<div class="f">V = πr²h     A<sub>lateral</sub> = 2πrh     A<sub>total</sub> = 2πr(h + r)<br>Cilindro equilátero: h = 2r</div>
<h3>Cone</h3>
<div class="f">V = (πr²h)/3     geratriz: g² = r² + h²<br>A<sub>lateral</sub> = πrg     A<sub>total</sub> = πr(g + r)<br>Cone equilátero: g = 2r</div>
<h3>Esfera</h3>
<div class="f">V = (4/3)πr³     A<sub>superfície</sub> = 4πr²</div>
<h3>Semelhança de sólidos</h3>
<p>Se a razão entre medidas lineares é k, a razão entre áreas é k² e entre volumes é <b>k³</b>.</p>
<p>Conversões: 1 m³ = 1000 L; 1 dm³ = 1 L; 1 cm³ = 1 mL.</p>
<p class="dica">Volume de pirâmide e de cone tem o "dividido por 3". É o erro mais comum nas contas de espacial.</p>`,
  ex: [
    ['Um poliedro convexo tem 12 faces pentagonais. Quantos vértices tem?', '<p>A = 12·5/2 = 30. V − 30 + 12 = 2 → <b>V = 20</b> (dodecaedro).</p>'],
    ['Um cone tem raio 6 cm e geratriz 10 cm. Calcule o volume.', '<p>h² = 100 − 36 = 64 → h = 8. V = π·36·8/3 = <b>96π cm³</b>.</p>'],
    ['Uma caixa-d\'água cúbica tem aresta de 2 m. Quantos litros cabem nela?', '<p>V = 8 m³ = <b>8000 L</b>.</p>']
  ],
  q: [
    ['A diagonal de um cubo de aresta 3 cm mede', ['3√2 cm', '3√3 cm', '9 cm', '6 cm'], 1, 'd = a√3 = 3√3.'],
    ['Um poliedro convexo tem 6 faces e 8 vértices. O número de arestas é', ['10', '12', '14', '16'], 1, 'V − A + F = 2 → 8 − A + 6 = 2 → A = 12.'],
    ['O volume de um cilindro de raio 2 cm e altura 5 cm é', ['10π cm³', '20π cm³', '40π cm³', '20 cm³'], 1, 'πr²h = π·4·5 = 20π.'],
    ['O volume de um cone de raio 3 cm e altura 4 cm é', ['12π cm³', '36π cm³', '15π cm³', '9π cm³'], 0, 'π·9·4/3 = 12π.'],
    ['O volume de uma esfera de raio 3 cm é', ['12π cm³', '27π cm³', '36π cm³', '108π cm³'], 2, '(4/3)π·27 = 36π.'],
    ['A diagonal de um paralelepípedo de dimensões 2, 3 e 6 é', ['7', '11', '√11', '49'], 0, '√(4 + 9 + 36) = √49 = 7.'],
    ['O volume de uma pirâmide de base quadrada de lado 6 e altura 4 é', ['48', '144', '72', '24'], 0, '(36·4)/3 = 48.'],
    ['A área da superfície de uma esfera de raio 5 é', ['25π', '100π', '500π/3', '50π'], 1, '4πr² = 100π.'],
    ['Dois sólidos semelhantes têm razão de semelhança 2. A razão entre seus volumes é', ['2', '4', '6', '8'], 3, 'Volumes na razão k³ = 8.'],
    ['Um reservatório cilíndrico tem 2 m de diâmetro e 3 m de altura. Usando π = 3,14, sua capacidade é', ['9420 L', '37680 L', '942 L', '18840 L'], 0, 'r = 1 m: V = 3,14·1·3 = 9,42 m³ = 9420 L.']
  ],
  fc: [
    ['Relação de Euler', 'V − A + F = 2'],
    ['Volume do prisma e do cilindro', 'A_base · h (cilindro: πr²h)'],
    ['Volume da pirâmide e do cone', '(A_base · h)/3'],
    ['Diagonal do cubo e do paralelepípedo', 'a√3 e √(a² + b² + c²)'],
    ['Esfera: volume e área', '(4/3)πr³ e 4πr²'],
    ['Geratriz do cone', 'g² = r² + h²'],
    ['Semelhança de sólidos: volumes', 'Razão k³'],
    ['1 m³ em litros', '1000 L']
  ]
});

EEAR.add({
  id: 'MAT18', m: 'mat', n: 18, t: 'Geometria analítica: ponto, reta e circunferência', peso: 3, h: 3,
  teoria: `
<h3>Ponto</h3>
<div class="f">Distância: d<sub>AB</sub> = √[(x<sub>B</sub> − x<sub>A</sub>)² + (y<sub>B</sub> − y<sub>A</sub>)²]<br>Ponto médio: M = ((x<sub>A</sub> + x<sub>B</sub>)/2, (y<sub>A</sub> + y<sub>B</sub>)/2)<br>Baricentro: G = ((x<sub>A</sub> + x<sub>B</sub> + x<sub>C</sub>)/3, (y<sub>A</sub> + y<sub>B</sub> + y<sub>C</sub>)/3)<br>Área do triângulo: A = |D|/2, com D = det [x<sub>A</sub> y<sub>A</sub> 1; x<sub>B</sub> y<sub>B</sub> 1; x<sub>C</sub> y<sub>C</sub> 1]<br>Três pontos alinhados ⇔ D = 0</div>
<h3>Reta</h3>
<div class="f">Coeficiente angular: m = tg θ = (y<sub>B</sub> − y<sub>A</sub>)/(x<sub>B</sub> − x<sub>A</sub>)<br>Equação por um ponto: y − y₀ = m(x − x₀)<br>Reduzida: y = mx + n  (n = onde corta o eixo y)<br>Geral: ax + by + c = 0  →  m = −a/b<br>Paralelas: m₁ = m₂     Perpendiculares: m₁ · m₂ = −1<br>Distância de ponto à reta: d = |a·x₀ + b·y₀ + c| / √(a² + b²)</div>
<h3>Circunferência</h3>
<div class="f">Equação reduzida: (x − a)² + (y − b)² = r²   (centro (a, b), raio r)<br>Equação geral: x² + y² + Dx + Ey + F = 0<br>Centro = (−D/2, −E/2)     r² = a² + b² − F</div>
<p>Posição de um ponto: substitua na equação reduzida e compare com r² (menor: interno; igual: na circunferência; maior: externo). Posição de uma reta: compare a distância do centro à reta com r.</p>
<p class="dica">Na equação geral, os coeficientes de x² e y² precisam ser iguais (e iguais a 1 depois de dividir) para ser circunferência, e não pode haver termo xy.</p>`,
  ex: [
    ['Encontre a equação da reta que passa por (2, 1) e é perpendicular a y = 2x + 5.', '<p>m = −1/2. y − 1 = −1/2 (x − 2) → <b>y = −x/2 + 2</b>.</p>'],
    ['Determine centro e raio de x² + y² − 6x + 2y + 6 = 0.', '<p>Centro (3, −1). r² = 9 + 1 − 6 = 4 → <b>r = 2</b>.</p>'],
    ['Calcule a área do triângulo A(1, 1), B(5, 1), C(3, 4).', '<p>Base AB = 4 e altura 3 (diferença de y): A = 4·3/2 = <b>6</b>.</p>']
  ],
  q: [
    ['A distância entre A(1, 2) e B(4, 6) é', ['5', '7', '√7', '25'], 0, '√(3² + 4²) = 5.'],
    ['O ponto médio do segmento de extremos (2, −4) e (6, 8) é', ['(4, 2)', '(8, 4)', '(2, 6)', '(4, 6)'], 0, '((2 + 6)/2, (−4 + 8)/2) = (4, 2).'],
    ['O coeficiente angular da reta que passa por (1, 1) e (3, 5) é', ['1/2', '2', '4', '−2'], 1, '(5 − 1)/(3 − 1) = 2.'],
    ['A reta que passa por (0, 3) com coeficiente angular 2 tem equação', ['y = 3x + 2', 'y = 2x + 3', 'y = 2x − 3', 'y = −2x + 3'], 1, 'y = mx + n com m = 2 e n = 3.'],
    ['O coeficiente angular de uma reta perpendicular a y = 3x + 1 é', ['3', '−3', '1/3', '−1/3'], 3, 'm₁·m₂ = −1 → m₂ = −1/3.'],
    ['A distância da origem à reta 3x + 4y − 10 = 0 é', ['2', '10', '5', '10/7'], 0, '|0 + 0 − 10|/√(9 + 16) = 10/5 = 2.'],
    ['A circunferência x² + y² − 4x + 6y − 3 = 0 tem centro e raio', ['(2, −3) e 4', '(−2, 3) e 4', '(2, −3) e 16', '(4, −6) e 3'], 0, 'Centro (2, −3); r² = 4 + 9 + 3 = 16 → r = 4.'],
    ['A área do triângulo de vértices (0, 0), (4, 0) e (0, 3) é', ['12', '6', '7', '3,5'], 1, 'Triângulo retângulo de catetos 4 e 3: 4·3/2 = 6.'],
    ['Para que os pontos (1, 2), (3, 4) e (5, k) estejam alinhados, k deve ser', ['5', '6', '7', '8'], 1, 'Coeficiente angular constante: (4 − 2)/(3 − 1) = 1 → (k − 4)/2 = 1 → k = 6.'],
    ['A equação da circunferência de centro (1, 2) e raio 3 é', ['(x − 1)² + (y − 2)² = 3', '(x + 1)² + (y + 2)² = 9', '(x − 1)² + (y − 2)² = 9', '(x − 2)² + (y − 1)² = 9'], 2, '(x − a)² + (y − b)² = r² com a = 1, b = 2, r² = 9.']
  ],
  fc: [
    ['Distância entre dois pontos', '√(Δx² + Δy²)'],
    ['Coeficiente angular', 'm = Δy/Δx = tg θ'],
    ['Retas perpendiculares', 'm₁ · m₂ = −1'],
    ['Equação da reta por um ponto', 'y − y₀ = m(x − x₀)'],
    ['Distância ponto-reta', '|ax₀ + by₀ + c|/√(a² + b²)'],
    ['Circunferência reduzida', '(x − a)² + (y − b)² = r²'],
    ['Centro e raio pela equação geral', 'Centro (−D/2, −E/2); r² = a² + b² − F'],
    ['Pontos alinhados', 'Determinante dos pontos = 0']
  ]
});

EEAR.add({
  id: 'MAT19', m: 'mat', n: 19, t: 'Números complexos', peso: 2, h: 2,
  teoria: `
<h3>Forma algébrica: z = a + bi</h3>
<ul>
<li>i² = −1. a = parte real (Re), b = parte imaginária (Im).</li>
<li>Real: b = 0. Imaginário puro: a = 0 e b ≠ 0.</li>
<li>Conjugado: z̄ = a − bi. z · z̄ = a² + b².</li>
<li>Módulo: |z| = √(a² + b²).</li>
</ul>
<h3>Potências de i</h3>
<div class="f">i⁰ = 1   i¹ = i   i² = −1   i³ = −i   (ciclo de 4)<br>i<sup>n</sup> = i<sup>r</sup>, em que r é o resto da divisão de n por 4</div>
<h3>Operações</h3>
<ul>
<li>Soma: some partes reais e imaginárias.</li>
<li>Produto: distributiva, lembrando que i² = −1: (1 + i)² = 1 + 2i + i² = 2i.</li>
<li>Divisão: multiplique numerador e denominador pelo <b>conjugado do denominador</b>.</li>
</ul>
<h3>Forma trigonométrica</h3>
<div class="f">z = ρ(cos θ + i·sen θ),  ρ = |z|,  cos θ = a/ρ,  sen θ = b/ρ<br>Produto: multiplica os módulos e soma os argumentos<br>Divisão: divide os módulos e subtrai os argumentos<br>Moivre: z<sup>n</sup> = ρ<sup>n</sup>(cos nθ + i·sen nθ)</div>
<p>No plano de Argand-Gauss, z = a + bi é o ponto (a, b).</p>
<p class="dica">Para i elevado a um número grande, olhe só os dois últimos algarismos: o resto da divisão por 4 é o mesmo. i²⁰²⁶: 26 ÷ 4 deixa resto 2 → i² = −1.</p>`,
  ex: [
    ['Calcule (2 + i)/(1 − i).', '<p>Multiplique por (1 + i): (2 + 2i + i + i²)/(1 − i²) = (1 + 3i)/2 = <b>1/2 + 3i/2</b>.</p>'],
    ['Escreva z = 1 + i√3 na forma trigonométrica.', '<p>ρ = √(1 + 3) = 2. cos θ = 1/2 e sen θ = √3/2 → θ = 60°. z = 2(cos 60° + i sen 60°).</p>'],
    ['Calcule i³⁷.', '<p>37 = 4·9 + 1 → i³⁷ = i¹ = <b>i</b>.</p>']
  ],
  q: [
    ['O valor de i²⁰²⁶ é', ['1', 'i', '−1', '−i'], 2, '2026 ÷ 4 deixa resto 2 → i² = −1.'],
    ['A soma (2 + 3i) + (1 − i) é', ['3 + 2i', '3 + 4i', '1 + 4i', '3 − 2i'], 0, '(2 + 1) + (3 − 1)i = 3 + 2i.'],
    ['O produto (1 + i)(1 − i) é', ['0', '2', '−2', '2i'], 1, '1 − i² = 1 + 1 = 2.'],
    ['O módulo de z = 3 − 4i é', ['5', '7', '1', '25'], 0, '√(9 + 16) = 5.'],
    ['O valor de (1 + i)² é', ['2', '2i', '1 + i', '0'], 1, '1 + 2i + i² = 2i.'],
    ['O quociente (3 + i)/(1 − i) é igual a', ['1 + 2i', '2 + i', '1 − 2i', '3 + i'], 0, '(3 + i)(1 + i)/2 = (3 + 4i + i²)/2 = (2 + 4i)/2 = 1 + 2i.'],
    ['O conjugado de z = −2 + 5i é', ['2 − 5i', '−2 − 5i', '2 + 5i', '5 − 2i'], 1, 'Troca-se o sinal da parte imaginária.'],
    ['O módulo e o argumento de z = 1 + i são', ['√2 e 45°', '2 e 45°', '√2 e 90°', '1 e 45°'], 0, 'ρ = √2; cos θ = sen θ = √2/2 → θ = 45°.'],
    ['Se z = 2(cos 30° + i·sen 30°), então z³ é', ['8i', '6i', '8', '−8i'], 0, 'Moivre: 2³(cos 90° + i sen 90°) = 8i.'],
    ['Para que z = (x − 3) + 2i seja imaginário puro, x deve valer', ['−3', '0', '2', '3'], 3, 'Parte real nula: x − 3 = 0.']
  ],
  fc: [
    ['Potências de i', 'i⁰ = 1, i¹ = i, i² = −1, i³ = −i (ciclo de 4).'],
    ['Conjugado de a + bi', 'a − bi'],
    ['Módulo de a + bi', '√(a² + b²)'],
    ['Como dividir complexos', 'Multiplique pelo conjugado do denominador.'],
    ['Forma trigonométrica', 'z = ρ(cos θ + i sen θ)'],
    ['Produto na forma trigonométrica', 'Multiplica módulos e soma argumentos.'],
    ['Fórmula de Moivre', 'zⁿ = ρⁿ(cos nθ + i sen nθ)'],
    ['Imaginário puro', 'Parte real zero e imaginária diferente de zero.']
  ]
});

EEAR.add({
  id: 'MAT20', m: 'mat', n: 20, t: 'Polinômios e equações algébricas', peso: 2, h: 2.5,
  teoria: `
<h3>Conceitos</h3>
<ul>
<li>Grau: maior expoente com coeficiente não nulo. Grau de P·Q = grau P + grau Q.</li>
<li>Valor numérico: P(a) é o resultado de trocar x por a. P(1) = soma dos coeficientes. P(0) = termo independente.</li>
<li>Raiz: a é raiz se P(a) = 0.</li>
<li>Polinômios idênticos: coeficientes dos termos de mesmo grau são iguais.</li>
</ul>
<h3>Divisão</h3>
<div class="f">P(x) = D(x) · Q(x) + R(x),   grau R &lt; grau D<br>Teorema do resto: o resto da divisão de P(x) por (x − a) é P(a)<br>D'Alembert: P(x) é divisível por (x − a) ⇔ P(a) = 0</div>
<p><b>Briot-Ruffini</b> (divisão por x − a): repita o primeiro coeficiente; multiplique por a e some ao próximo; o último número é o resto.</p>
<p>Ex.: x³ − 6x² + 11x − 6 por x − 1: coeficientes 1, −6, 11, −6 → 1, −5, 6, <b>0</b>. Quociente x² − 5x + 6, resto 0.</p>
<h3>Equações algébricas</h3>
<ul>
<li><b>Teorema fundamental</b>: equação de grau n tem exatamente n raízes complexas (contando multiplicidade).</li>
<li>Coeficientes reais: se a + bi é raiz, então a − bi também é.</li>
<li>Conhecendo uma raiz, divida por (x − raiz) e reduza o grau.</li>
</ul>
<h3>Relações de Girard (ax³ + bx² + cx + d = 0)</h3>
<div class="f">x₁ + x₂ + x₃ = −b/a<br>x₁x₂ + x₁x₃ + x₂x₃ = c/a<br>x₁ · x₂ · x₃ = −d/a</div>
<p>Para grau 2: soma −b/a e produto c/a.</p>
<p class="dica">"Calcule o resto da divisão por x − 2" não exige dividir: basta calcular P(2). Para divisão por x + 3, calcule P(−3).</p>`,
  ex: [
    ['Calcule o resto da divisão de P(x) = 2x³ − x + 4 por x + 1.', '<p>P(−1) = −2 + 1 + 4 = <b>3</b>.</p>'],
    ['Resolva x³ − 7x + 6 = 0, sabendo que 1 é raiz.', '<p>Briot-Ruffini com 1: coeficientes 1, 0, −7, 6 → 1, 1, −6, 0. Quociente x² + x − 6 = 0 → x = 2 ou x = −3. S = {−3, 1, 2}.</p>'],
    ['A equação x³ − 6x² + 11x − 6 = 0 tem raízes a, b e c. Calcule a + b + c e abc.', '<p>Soma = 6/1 = <b>6</b>; produto = −(−6)/1 = <b>6</b>.</p>']
  ],
  q: [
    ['Sendo P(x) = x³ − 2x² + x − 5, o valor de P(2) é', ['−3', '−1', '1', '3'], 0, '8 − 8 + 2 − 5 = −3.'],
    ['O resto da divisão de P(x) = x³ + 2x − 1 por (x − 1) é', ['0', '1', '2', '3'], 2, 'Teorema do resto: P(1) = 1 + 2 − 1 = 2.'],
    ['Para que P(x) = x³ + kx − 6 seja divisível por (x − 2), k deve valer', ['−1', '1', '3', '−3'], 0, 'P(2) = 8 + 2k − 6 = 0 → k = −1.'],
    ['A soma das raízes de 2x³ − 6x² + 4x − 1 = 0 é', ['3', '−3', '2', '1/2'], 0, '−b/a = 6/2 = 3.'],
    ['O produto das raízes de x³ − 4x² + x + 6 = 0 é', ['6', '−6', '4', '1'], 1, '−d/a = −6.'],
    ['Um polinômio de coeficientes reais tem raiz 2 + i. Outra raiz certamente é', ['−2 + i', '2 − i', '−2 − i', 'i'], 1, 'As raízes complexas aparecem em pares conjugados.'],
    ['Se P tem grau 3 e Q tem grau 2, o produto P·Q tem grau', ['5', '6', '3', '1'], 0, 'Os graus se somam.'],
    ['Se ax² + (b − 1)x + 3 ≡ 2x² + 5x + c, então a + b + c é', ['8', '10', '11', '9'], 2, 'a = 2, b − 1 = 5 → b = 6, c = 3: soma 11.'],
    ['O quociente da divisão de x³ − 6x² + 11x − 6 por (x − 1) é', ['x² − 5x + 6', 'x² − 7x + 18', 'x² + 5x − 6', 'x² − 6x + 11'], 0, 'Briot-Ruffini: 1, −5, 6 e resto 0.'],
    ['Sabendo que 1 é raiz de x³ − 7x + 6 = 0, as outras raízes são', ['2 e 3', '−2 e 3', '2 e −3', '−1 e 6'], 2, 'Quociente x² + x − 6 = 0 → x = 2 ou x = −3.']
  ],
  fc: [
    ['Teorema do resto', 'Resto de P(x) ÷ (x − a) = P(a).'],
    ['D\'Alembert', 'P divisível por (x − a) ⇔ P(a) = 0.'],
    ['P(1) e P(0)', 'Soma dos coeficientes e termo independente.'],
    ['Girard (grau 3): soma', '−b/a'],
    ['Girard (grau 3): produto', '−d/a'],
    ['Girard (grau 3): soma dos produtos dois a dois', 'c/a'],
    ['Raiz complexa com coeficientes reais', 'O conjugado também é raiz.'],
    ['Grau do produto', 'Soma dos graus.']
  ]
});

/* Física — módulos 14 a 17 */
EEAR.add({
  id: 'FIS14', m: 'fis', n: 14, t: 'Óptica geométrica', peso: 3, h: 3,
  teoria: `
<h3>Princípios</h3>
<ul>
<li>Propagação retilínea (explica sombra, penumbra, eclipses e a câmara escura).</li>
<li>Independência dos raios e reversibilidade.</li>
</ul>
<div class="f">Câmara escura: o/i = p/p'   (objeto/imagem = distância do objeto/profundidade da câmara)</div>
<h3>Reflexão e espelho plano</h3>
<ul>
<li>Ângulo de incidência = ângulo de reflexão (medidos em relação à normal).</li>
<li>Imagem no espelho plano: virtual, direita, mesmo tamanho, simétrica (à mesma distância atrás do espelho) e enantiomorfa (troca direita e esquerda).</li>
<li>Espelho que se afasta d: a imagem se afasta 2d do objeto. Espelho que gira α: o raio refletido gira 2α.</li>
</ul>
<div class="f">Dois espelhos planos com ângulo α: n = 360°/α − 1 imagens</div>
<h3>Espelhos esféricos</h3>
<div class="f">f = R/2     1/f = 1/p + 1/p'     A = i/o = −p'/p<br>Côncavo: f &gt; 0     Convexo: f &lt; 0     p' &gt; 0: imagem real; p' &lt; 0: virtual</div>
<ul>
<li><b>Convexo</b>: imagem sempre virtual, direita e menor (retrovisores, espelhos de segurança).</li>
<li><b>Côncavo</b>: objeto além do centro → real, invertida, menor; no centro → real, invertida, igual; entre C e F → real, invertida, maior; no foco → imprópria; entre F e o espelho → virtual, direita, maior (espelho de maquiagem).</li>
</ul>
<h3>Refração</h3>
<div class="f">Índice de refração: n = c/v   (c = 3 × 10⁸ m/s, n ≥ 1)<br>Lei de Snell: n₁·sen θ₁ = n₂·sen θ₂<br>Ângulo limite: sen L = n<sub>menor</sub>/n<sub>maior</sub></div>
<ul>
<li>Ao passar para um meio mais refringente (n maior), a luz se aproxima da normal e fica mais lenta.</li>
<li><b>Reflexão total</b>: a luz vai do meio mais refringente para o menos refringente, com ângulo de incidência maior que o limite (fibra óptica, brilho do diamante).</li>
</ul>
<h3>Lentes</h3>
<div class="f">Mesmas equações: 1/f = 1/p + 1/p'   A = −p'/p<br>Vergência: V = 1/f   (f em metros; unidade: dioptria, "grau")<br>Convergente: f &gt; 0     Divergente: f &lt; 0</div>
<p>Lente divergente dá sempre imagem virtual, direita e menor. A convergente se comporta como o espelho côncavo.</p>
<h3>Olho humano</h3>
<ul>
<li><b>Miopia</b>: imagem antes da retina; não vê bem de longe; corrige com lente <b>divergente</b>.</li>
<li><b>Hipermetropia</b>: imagem depois da retina; não vê bem de perto; corrige com lente <b>convergente</b>.</li>
<li><b>Presbiopia</b> (vista cansada): convergente. <b>Astigmatismo</b>: lente cilíndrica.</li>
</ul>
<p class="dica">Na equação de Gauss, o sinal decide tudo: f negativo para convexo e divergente; p' negativo significa imagem virtual.</p>`,
  ex: [
    ['Um objeto está a 30 cm de um espelho côncavo de foco 10 cm. Onde se forma a imagem e como ela é?', '<p>1/p\' = 1/10 − 1/30 = 2/30 → p\' = 15 cm. Real (p\' &gt; 0), invertida e menor (A = −15/30 = −0,5).</p>'],
    ['Uma luz passa do ar (n = 1) para o vidro (n = √3) com incidência de 60°. Qual o ângulo de refração?', '<p>sen θ₂ = sen 60°/√3 = (√3/2)/√3 = 1/2 → <b>θ₂ = 30°</b>.</p>'],
    ['Uma lente tem vergência de −2 di. Que tipo é e qual sua distância focal?', '<p>Divergente, f = 1/(−2) = <b>−0,5 m</b>. Serve para corrigir miopia.</p>']
  ],
  q: [
    ['Uma pessoa está a 2 m de um espelho plano. A distância entre ela e sua imagem é', ['1 m', '2 m', '4 m', '8 m'], 2, 'A imagem fica 2 m atrás do espelho: 2 + 2 = 4 m.'],
    ['Dois espelhos planos formam um ângulo de 60°. O número de imagens de um objeto entre eles é', ['4', '5', '6', '7'], 1, 'n = 360/60 − 1 = 5.'],
    ['Um objeto a 30 cm de um espelho côncavo de distância focal 10 cm forma imagem a', ['7,5 cm, virtual', '15 cm, real', '20 cm, real', '15 cm, virtual'], 1, '1/p\' = 1/10 − 1/30 = 1/15 → p\' = 15 cm, positivo: real.'],
    ['A imagem formada por um espelho convexo é sempre', ['real, invertida e maior.', 'virtual, direita e menor.', 'real, direita e menor.', 'virtual, invertida e maior.'], 1, 'Por isso ele é usado em retrovisores: amplia o campo visual.'],
    ['A luz se propaga num meio com velocidade de 2 × 10⁸ m/s. O índice de refração desse meio é', ['0,67', '1,5', '2', '6'], 1, 'n = c/v = 3×10⁸ / 2×10⁸ = 1,5.'],
    ['Um raio passa do ar (n = 1) para um vidro de índice √3, com ângulo de incidência de 60°. O ângulo de refração é', ['30°', '45°', '60°', '90°'], 0, 'sen θ₂ = sen 60°/√3 = 1/2 → θ₂ = 30°.'],
    ['A reflexão total pode ocorrer quando a luz', ['passa do ar para a água.', 'passa de um meio mais refringente para um menos refringente, com incidência maior que o ângulo limite.', 'incide perpendicularmente.', 'passa por uma lente convergente.'], 1, 'É o princípio da fibra óptica.'],
    ['A miopia é corrigida com lentes', ['convergentes.', 'divergentes.', 'cilíndricas.', 'bifocais, sempre.'], 1, 'O míope forma a imagem antes da retina; a lente divergente "empurra" a imagem para trás.'],
    ['Um objeto está a 40 cm de uma lente convergente de foco 20 cm. A imagem é', ['virtual e maior.', 'real, invertida e do mesmo tamanho, a 40 cm.', 'real e direita, a 20 cm.', 'imprópria.'], 1, '1/p\' = 1/20 − 1/40 = 1/40 → p\' = 40 cm; A = −1.'],
    ['Uma lente de distância focal 0,5 m tem vergência de', ['0,5 di', '2 di', '5 di', '20 di'], 1, 'V = 1/f = 1/0,5 = 2 di.']
  ],
  fc: [
    ['Imagem no espelho plano', 'Virtual, direita, mesmo tamanho, simétrica.'],
    ['Imagens entre dois espelhos', 'n = 360°/α − 1'],
    ['Equação de Gauss', '1/f = 1/p + 1/p\''],
    ['Espelho convexo', 'Imagem sempre virtual, direita e menor.'],
    ['Índice de refração', 'n = c/v'],
    ['Lei de Snell', 'n₁ sen θ₁ = n₂ sen θ₂'],
    ['Condição de reflexão total', 'Do meio mais refringente para o menos, ângulo > limite.'],
    ['Correção da miopia e da hipermetropia', 'Divergente e convergente.']
  ]
});

EEAR.add({
  id: 'FIS15', m: 'fis', n: 15, t: 'Eletrostática', peso: 3, h: 3,
  teoria: `
<h3>Carga elétrica</h3>
<div class="f">Q = n · e     e = 1,6 × 10⁻¹⁹ C<br>μC = 10⁻⁶ C     nC = 10⁻⁹ C</div>
<p>Cargas de mesmo sinal se repelem; de sinais opostos se atraem. A carga total de um sistema isolado se conserva. Corpo positivo perdeu elétrons; negativo ganhou.</p>
<h3>Processos de eletrização</h3>
<ul>
<li><b>Atrito</b>: os corpos ficam com cargas de mesmo módulo e sinais opostos.</li>
<li><b>Contato</b>: os corpos ficam com cargas de mesmo sinal. Esferas idênticas dividem igualmente a soma: (+6 μC) e (−2 μC) → +2 μC cada.</li>
<li><b>Indução</b>: aproxima-se um indutor; ligando o induzido à terra e depois desligando, ele fica com carga de sinal <b>oposto</b> ao do indutor.</li>
</ul>
<h3>Lei de Coulomb</h3>
<div class="f">F = k·|Q·q|/d²     k = 9 × 10⁹ N·m²/C²  (no vácuo)</div>
<p>Dobrando a distância, a força cai para 1/4; triplicando, para 1/9.</p>
<h3>Campo elétrico</h3>
<div class="f">E = F/q     Carga puntiforme: E = k·|Q|/d²   (N/C)</div>
<p>As linhas de campo <b>saem</b> das cargas positivas e <b>chegam</b> nas negativas. Carga positiva sofre força no sentido do campo; negativa, no sentido oposto.</p>
<h3>Potencial e trabalho</h3>
<div class="f">Potencial: V = k·Q/d   (escalar, com sinal; volt = J/C)<br>Trabalho da força elétrica: τ<sub>AB</sub> = q·(V<sub>A</sub> − V<sub>B</sub>)<br>Campo uniforme: U = E·d</div>
<h3>Condutores em equilíbrio</h3>
<ul>
<li>As cargas ficam na superfície externa e o campo no interior é nulo (gaiola de Faraday: por isso é seguro ficar dentro do carro durante uma tempestade).</li>
<li>Poder das pontas: a carga se concentra nas regiões pontiagudas (para-raios).</li>
<li>Esfera condutora de raio R com carga Q: dentro dela, E = 0 e o potencial é constante, V = k·Q/R. Fora (d ≥ R), ela age como se toda a carga estivesse no centro: E = k·Q/d² e V = k·Q/d.</li>
</ul>
<h3>Superfícies equipotenciais</h3>
<ul>
<li>São superfícies em que todos os pontos têm o mesmo potencial. Elas são sempre <b>perpendiculares</b> às linhas de campo.</li>
<li>Levar uma carga de um ponto a outro da mesma equipotencial não exige trabalho da força elétrica: U = 0, então τ = q·U = 0.</li>
<li>Carga puntiforme: esferas concêntricas em volta dela. Campo uniforme: planos paralelos entre si, perpendiculares às linhas.</li>
<li>O campo aponta no sentido em que o potencial <b>diminui</b>.</li>
</ul>
<h3>Lei de Gauss</h3>
<div class="f">Fluxo elétrico por uma superfície fechada: Φ = Q<sub>interna</sub>/ε₀     ε₀ ≈ 8,85 × 10⁻¹² C²/(N·m²)     k = 1/(4π·ε₀)</div>
<ul>
<li>Só a carga <b>dentro</b> da superfície fechada conta. A forma e o tamanho da superfície não mudam o fluxo total.</li>
<li>Uma carga de fora cria linhas que entram e saem da superfície: o saldo dela no fluxo é zero.</li>
<li>Se a carga interna total é zero (por exemplo, +q e −q dentro), o fluxo total é nulo.</li>
<li>Aplicada a uma esfera em volta de uma carga puntiforme, a lei de Gauss dá E·4πd² = Q/ε₀, ou seja, E = k·Q/d²: a mesma lei de Coulomb.</li>
<li>No interior de um condutor em equilíbrio, E = 0. Por Gauss, uma superfície fechada traçada ali dentro não envolve carga: o excesso de carga fica na superfície externa. É a base da <b>blindagem eletrostática</b>.</li>
</ul>
<h3>Capacitores</h3>
<div class="f">C = Q/U   (farad)     Energia: E = Q·U/2 = C·U²/2</div>
<p class="dica">Coulomb e campo têm d²; potencial tem d. Trocar um pelo outro é o erro mais comum do tema.</p>`,
  ex: [
    ['Quantos elétrons um corpo perdeu para ficar com +4,8 μC?', '<p>n = 4,8×10⁻⁶ / 1,6×10⁻¹⁹ = <b>3 × 10¹³ elétrons</b>.</p>'],
    ['Duas cargas de 1 μC estão a 3 cm uma da outra. Qual a força entre elas?', '<p>F = 9×10⁹ · 10⁻¹² / (9×10⁻⁴) = <b>10 N</b> (repulsão).</p>'],
    ['Uma carga de 3 μC vai de um ponto de 200 V para um de 50 V. Qual o trabalho da força elétrica?', '<p>τ = 3×10⁻⁶ · (200 − 50) = <b>4,5 × 10⁻⁴ J</b>.</p>'],
    ['Uma esfera condutora de raio 0,1 m tem carga de 1 μC, em equilíbrio (k = 9 × 10⁹). Calcule o campo e o potencial no centro e a 0,3 m do centro.', '<p>No centro: <b>E = 0</b> e o potencial é o da superfície, V = 9×10⁹ · 10⁻⁶ / 0,1 = <b>9 × 10⁴ V</b>.<br>A 0,3 m: E = 9×10⁹ · 10⁻⁶ / 0,09 = <b>1 × 10⁵ N/C</b> e V = 9×10⁹ · 10⁻⁶ / 0,3 = <b>3 × 10⁴ V</b>.</p>']
  ],
  q: [
    ['Um corpo com carga de −3,2 μC tem excesso de', ['2 × 10¹³ elétrons', '2 × 10¹⁹ elétrons', '5 × 10¹² elétrons', '3,2 × 10¹⁹ elétrons'], 0, 'n = 3,2×10⁻⁶ / 1,6×10⁻¹⁹ = 2×10¹³.'],
    ['Duas cargas de 2 μC e 3 μC estão a 0,3 m no vácuo (k = 9 × 10⁹). A força entre elas é', ['0,06 N', '0,6 N', '6 N', '0,18 N'], 1, 'F = 9×10⁹ · 6×10⁻¹² / 0,09 = 0,6 N.'],
    ['Se a distância entre duas cargas triplicar, a força elétrica entre elas', ['triplica.', 'fica 9 vezes menor.', 'fica 3 vezes menor.', 'fica 9 vezes maior.'], 1, 'F ∝ 1/d²: 1/3² = 1/9.'],
    ['Duas esferas condutoras idênticas, com +6 μC e −2 μC, são colocadas em contato e separadas. Cada uma fica com', ['+4 μC', '+2 μC', '+3 μC e −1 μC', '−2 μC'], 1, '(6 − 2)/2 = +2 μC.'],
    ['Na eletrização por atrito, os corpos adquirem cargas', ['de mesmo sinal.', 'de sinais opostos e mesmo módulo.', 'nulas.', 'de mesmo sinal e módulos diferentes.'], 1, 'Um corpo perde elétrons e o outro ganha a mesma quantidade.'],
    ['O campo elétrico de uma carga de 4 μC a 0,2 m de distância (k = 9 × 10⁹) tem intensidade', ['1,8 × 10⁵ N/C', '9 × 10⁵ N/C', '9 × 10⁴ N/C', '3,6 × 10⁵ N/C'], 1, 'E = 9×10⁹ · 4×10⁻⁶ / 0,04 = 9×10⁵ N/C.'],
    ['O potencial elétrico criado por uma carga de 2 μC a 0,3 m (k = 9 × 10⁹) é', ['6 × 10⁴ V', '2 × 10⁵ V', '6 × 10³ V', '1,8 × 10⁴ V'], 0, 'V = 9×10⁹ · 2×10⁻⁶ / 0,3 = 6×10⁴ V.'],
    ['Num campo elétrico uniforme de 1000 V/m, a diferença de potencial entre dois pontos separados por 5 cm na direção do campo é', ['5 V', '50 V', '500 V', '20 V'], 1, 'U = E·d = 1000·0,05 = 50 V.'],
    ['No interior de um condutor eletrizado em equilíbrio eletrostático, o campo elétrico é', ['máximo.', 'nulo.', 'igual ao da superfície.', 'infinito.'], 1, 'As cargas se distribuem na superfície e o campo interno se anula.'],
    ['Uma carga de 2 μC se desloca de A (100 V) para B (40 V). O trabalho da força elétrica é', ['1,2 × 10⁻⁴ J', '2,8 × 10⁻⁴ J', '1,2 × 10⁻² J', '6 × 10⁻⁵ J'], 0, 'τ = q(VA − VB) = 2×10⁻⁶ · 60 = 1,2×10⁻⁴ J.'],
    ['Pela lei de Gauss, o fluxo do campo elétrico através de uma superfície fechada depende', ['só da carga elétrica total no interior da superfície.', 'da forma e do tamanho da superfície.', 'de todas as cargas, dentro e fora da superfície.', 'só das cargas que estão fora da superfície.'], 0, 'Φ = Q interna/ε₀. Uma carga de fora tem linhas que entram e saem, com saldo zero, e a forma da superfície não altera o fluxo total.'],
    ['Uma superfície fechada envolve uma carga de +3 μC e outra de −3 μC. O fluxo elétrico total através dela é', ['nulo.', 'proporcional a 6 μC.', 'proporcional a 3 μC.', 'infinito.'], 0, 'A carga interna total é +3 − 3 = 0, então Φ = 0/ε₀ = 0.'],
    ['Uma esfera condutora de raio 10 cm tem carga de 2 μC, em equilíbrio (k = 9 × 10⁹). O campo elétrico a 5 cm e a 20 cm do centro vale, respectivamente,', ['0 e 4,5 × 10⁵ N/C', '7,2 × 10⁶ N/C e 4,5 × 10⁵ N/C', '0 e 0', '1,8 × 10⁶ N/C e 4,5 × 10⁵ N/C'], 0, 'A 5 cm o ponto está dentro do condutor: E = 0. A 20 cm: E = 9×10⁹ · 2×10⁻⁶ / 0,04 = 4,5×10⁵ N/C.'],
    ['Sobre as superfícies equipotenciais de um campo elétrico, é correto afirmar que', ['o trabalho da força elétrica para levar uma carga entre dois pontos da mesma superfície é nulo.', 'elas são paralelas às linhas de campo.', 'o campo elétrico é nulo sobre elas.', 'só existem no interior de condutores.'], 0, 'Na mesma equipotencial, U = 0, então τ = q·U = 0. Elas são perpendiculares às linhas de campo, e o campo sobre elas não precisa ser nulo.']
  ],
  fc: [
    ['Carga elementar', 'e = 1,6 × 10⁻¹⁹ C'],
    ['Lei de Coulomb', 'F = k|Qq|/d²'],
    ['Eletrização por contato (esferas iguais)', 'Mesmo sinal; dividem a soma das cargas.'],
    ['Eletrização por indução', 'Induzido fica com sinal oposto ao do indutor.'],
    ['Campo de carga puntiforme', 'E = k|Q|/d²'],
    ['Potencial de carga puntiforme', 'V = kQ/d (com sinal)'],
    ['Trabalho da força elétrica', 'τ = q(VA − VB)'],
    ['Campo uniforme', 'U = E·d'],
    ['Lei de Gauss', 'Fluxo por superfície fechada = Q interna/ε₀; carga de fora não conta.'],
    ['Superfície equipotencial', 'Perpendicular às linhas de campo; trabalho nulo sobre ela.'],
    ['Esfera condutora carregada', 'Dentro: E = 0 e V = kQ/R. Fora: como carga puntiforme no centro.']
  ]
});

EEAR.add({
  id: 'FIS16', m: 'fis', n: 16, t: 'Eletrodinâmica: corrente, resistores e circuitos', peso: 3, h: 3,
  teoria: `
<h3>Corrente elétrica</h3>
<div class="f">i = Q/Δt   (A = C/s)     Q = n·e<br>Gráfico i × t: a área é a carga</div>
<h3>Leis de Ohm</h3>
<div class="f">1ª lei: U = R·i<br>2ª lei: R = ρ·L/A   (ρ = resistividade; L = comprimento; A = área da seção)</div>
<p>Dobrar o comprimento dobra R; dobrar a área reduz R à metade.</p>
<h3>Potência e energia</h3>
<div class="f">P = U·i = R·i² = U²/R     E = P·Δt   (kWh = kW × h)</div>
<p>Lâmpada "60 W – 120 V": i = 60/120 = 0,5 A e R = 120²/60 = 240 Ω.</p>
<h3>Associação de resistores</h3>
<div class="f">Série: R<sub>eq</sub> = R₁ + R₂ + …   (mesma corrente)<br>Paralelo: 1/R<sub>eq</sub> = 1/R₁ + 1/R₂ + …   (mesma tensão)<br>Dois em paralelo: R<sub>eq</sub> = R₁·R₂/(R₁ + R₂)     n iguais em paralelo: R/n</div>
<p>Em paralelo, R<sub>eq</sub> é sempre menor que o menor resistor. As tomadas de uma casa estão em paralelo.</p>
<h3>Geradores e circuito simples</h3>
<div class="f">Gerador real: U = ε − r·i     Corrente de curto-circuito: i<sub>cc</sub> = ε/r<br>Circuito simples (lei de Pouillet): i = ε/(R + r)</div>
<h3>Instrumentos</h3>
<ul>
<li><b>Amperímetro</b>: mede corrente, ligado em <b>série</b>; ideal tem resistência nula.</li>
<li><b>Voltímetro</b>: mede tensão, ligado em <b>paralelo</b>; ideal tem resistência infinita.</li>
</ul>
<h3>Leis de Kirchhoff e ponte de Wheatstone</h3>
<ul>
<li>Nós: a soma das correntes que chegam é igual à soma das que saem.</li>
<li>Malhas: a soma das tensões numa malha fechada é zero.</li>
<li>Ponte equilibrada (galvanômetro marca zero): R₁·R₃ = R₂·R₄ (produtos cruzados iguais).</li>
</ul>
<p class="dica">Em circuitos mistos, resolva de dentro para fora: primeiro os paralelos, depois some com os de série.</p>`,
  ex: [
    ['Calcule a resistência equivalente de 4 Ω em série com um paralelo de 6 Ω e 3 Ω.', '<p>Paralelo: 6·3/9 = 2 Ω. Total: 4 + 2 = <b>6 Ω</b>.</p>'],
    ['Um gerador de ε = 12 V e r = 1 Ω alimenta um resistor de 5 Ω. Calcule a corrente e a tensão nos terminais.', '<p>i = 12/6 = 2 A. U = 12 − 1·2 = <b>10 V</b>.</p>'],
    ['Um aparelho de 1500 W funciona 2 h por dia durante 30 dias. Qual o consumo?', '<p>1,5 kW · 2 h · 30 = <b>90 kWh</b>.</p>']
  ],
  q: [
    ['Um resistor de 4 Ω é submetido a 12 V. A corrente que o atravessa é', ['0,33 A', '3 A', '48 A', '16 A'], 1, 'i = U/R = 12/4 = 3 A.'],
    ['Uma corrente de 2 A passa por um fio durante 10 s. A carga que atravessa a seção é', ['5 C', '12 C', '20 C', '0,2 C'], 2, 'Q = i·Δt = 20 C.'],
    ['Três resistores de 2 Ω, 3 Ω e 5 Ω em série têm resistência equivalente de', ['1 Ω', '10 Ω', '30 Ω', '0,97 Ω'], 1, 'Série: soma = 10 Ω.'],
    ['Resistores de 6 Ω e 3 Ω em paralelo equivalem a', ['2 Ω', '4,5 Ω', '9 Ω', '18 Ω'], 0, '6·3/(6 + 3) = 18/9 = 2 Ω.'],
    ['Uma lâmpada de 60 W ligada em 120 V é percorrida por uma corrente de', ['0,5 A', '2 A', '7200 A', '60 A'], 0, 'i = P/U = 60/120 = 0,5 A.'],
    ['Um aparelho de 1000 W funcionando por 3 h consome', ['0,3 kWh', '3 kWh', '30 kWh', '3000 kWh'], 1, 'E = 1 kW · 3 h = 3 kWh.'],
    ['Um gerador de fem 12 V e resistência interna 1 Ω está ligado a um resistor de 5 Ω. A corrente no circuito é', ['2 A', '2,4 A', '12 A', '1 A'], 0, 'i = ε/(R + r) = 12/6 = 2 A.'],
    ['Se o comprimento de um fio dobra e a área da seção também dobra, sua resistência', ['dobra.', 'quadruplica.', 'não muda.', 'cai pela metade.'], 2, 'R = ρL/A: 2L/2A mantém a razão.'],
    ['O amperímetro ideal deve ser ligado', ['em paralelo, com resistência infinita.', 'em série, com resistência nula.', 'em série, com resistência infinita.', 'em paralelo, com resistência nula.'], 1, 'Ele precisa ser atravessado pela corrente sem alterá-la.'],
    ['Um resistor de 4 Ω está em série com a associação em paralelo de 6 Ω e 3 Ω. A resistência equivalente é', ['6 Ω', '13 Ω', '2 Ω', '7 Ω'], 0, 'Paralelo: 2 Ω; em série com 4 Ω: 6 Ω.']
  ],
  fc: [
    ['Corrente elétrica', 'i = Q/Δt'],
    ['1ª lei de Ohm', 'U = R·i'],
    ['2ª lei de Ohm', 'R = ρL/A'],
    ['Potência elétrica', 'P = U·i = Ri² = U²/R'],
    ['Resistores em série', 'Soma das resistências; mesma corrente.'],
    ['Dois resistores em paralelo', 'Produto/soma; mesma tensão.'],
    ['Lei de Pouillet', 'i = ε/(R + r)'],
    ['Amperímetro x voltímetro', 'Série (R = 0) x paralelo (R infinita).']
  ]
});

EEAR.add({
  id: 'FIS17', m: 'fis', n: 17, t: 'Magnetismo e eletromagnetismo', peso: 2, h: 3,
  teoria: `
<h3>Ímãs</h3>
<ul>
<li>Polos de mesmo nome se repelem; de nomes diferentes se atraem.</li>
<li><b>Inseparabilidade</b>: quebrando um ímã, cada pedaço vira um ímã completo, com norte e sul.</li>
<li>Linhas de campo saem do norte e entram no sul (por fora do ímã).</li>
<li>A Terra é um grande ímã: o polo norte geográfico fica perto do polo <b>sul magnético</b>. Por isso o norte da bússola aponta para o norte geográfico.</li>
</ul>
<h3>Campo magnético gerado por corrente</h3>
<div class="f">Fio longo: B = μ₀·i/(2π·d)<br>Centro de espira circular: B = μ₀·i/(2R)<br>Solenoide: B = μ₀·N·i/L<br>μ₀ = 4π × 10⁻⁷ T·m/A</div>
<p>Sentido: regra da mão direita (polegar na corrente, dedos curvados indicam o campo).</p>
<h3>Força magnética</h3>
<div class="f">Sobre carga em movimento: F = |q|·v·B·sen θ<br>Sobre fio com corrente: F = B·i·L·sen θ</div>
<ul>
<li>Carga parada ou movendo-se paralela ao campo (θ = 0°): F = 0.</li>
<li>Carga lançada perpendicular a B faz MCU: R = m·v/(|q|·B).</li>
<li>A força magnética é perpendicular à velocidade: não realiza trabalho nem muda o módulo da velocidade.</li>
<li>Fios paralelos com correntes no mesmo sentido se <b>atraem</b>; em sentidos opostos se repelem.</li>
</ul>
<h3>Indução eletromagnética</h3>
<div class="f">Fluxo: Φ = B·A·cos θ   (weber)<br>Lei de Faraday: |ε| = ΔΦ/Δt<br>Condutor em movimento: ε = B·L·v</div>
<ul>
<li><b>Lei de Lenz</b>: a corrente induzida surge com sentido que se opõe à variação do fluxo que a criou.</li>
<li><b>Transformador</b>: U₁/U₂ = N₁/N₂ (e i₁/i₂ = N₂/N₁). Só funciona com corrente <b>alternada</b>, que produz fluxo variável.</li>
<li>Geradores de usinas e dínamos funcionam por indução.</li>
</ul>
<p class="dica">Para haver corrente induzida, o fluxo precisa variar: ímã parado perto da espira não induz nada.</p>`,
  ex: [
    ['Calcule o campo de um fio longo com 20 A a 10 cm de distância.', '<p>B = 4π×10⁻⁷·20/(2π·0,1) = <b>4 × 10⁻⁵ T</b>.</p>'],
    ['Um transformador tem 200 espiras no primário e 50 no secundário. Ligado a 220 V, qual a tensão de saída?', '<p>U₂ = 220·50/200 = <b>55 V</b> (rebaixador).</p>'],
    ['O fluxo numa espira cai de 0,8 Wb para 0,2 Wb em 0,3 s. Qual a fem induzida?', '<p>|ε| = 0,6/0,3 = <b>2 V</b>.</p>']
  ],
  q: [
    ['Ao partir um ímã ao meio, obtêm-se', ['um polo norte e um polo sul isolados.', 'dois ímãs, cada um com polo norte e polo sul.', 'dois pedaços sem magnetismo.', 'dois polos norte.'], 1, 'Princípio da inseparabilidade dos polos.'],
    ['O polo norte da agulha de uma bússola aponta para o norte geográfico porque ali se encontra', ['o polo norte magnético da Terra.', 'o polo sul magnético da Terra.', 'o equador magnético.', 'um campo elétrico.'], 1, 'Polos opostos se atraem: o norte da agulha é atraído pelo sul magnético.'],
    ['Um fio longo é percorrido por 10 A. O campo magnético a 0,2 m dele é (μ₀ = 4π × 10⁻⁷ T·m/A)', ['1 × 10⁻⁵ T', '2 × 10⁻⁵ T', '1 × 10⁻⁶ T', '5 × 10⁻⁶ T'], 0, 'B = 4π×10⁻⁷·10/(2π·0,2) = 1×10⁻⁵ T.'],
    ['Uma carga de 2 μC se move a 100 m/s perpendicularmente a um campo de 0,5 T. A força magnética vale', ['1 × 10⁻⁴ N', '1 × 10⁻² N', '100 N', '4 × 10⁻⁴ N'], 0, 'F = qvB = 2×10⁻⁶·100·0,5 = 1×10⁻⁴ N.'],
    ['Uma carga elétrica que se move paralelamente às linhas de um campo magnético uniforme', ['sofre força máxima.', 'não sofre força magnética.', 'faz movimento circular.', 'para imediatamente.'], 1, 'θ = 0° → sen θ = 0 → F = 0.'],
    ['Um fio de 0,5 m, com corrente de 5 A, está perpendicular a um campo de 0,2 T. A força sobre ele é', ['0,5 N', '2 N', '5 N', '0,1 N'], 0, 'F = B·i·L = 0,2·5·0,5 = 0,5 N.'],
    ['Dois fios paralelos percorridos por correntes no mesmo sentido', ['se repelem.', 'se atraem.', 'não interagem.', 'giram.'], 1, 'Correntes de mesmo sentido: atração.'],
    ['Um transformador tem 100 espiras no primário e 500 no secundário. Ligado a 110 V, fornece', ['22 V', '110 V', '550 V', '5500 V'], 2, 'U₂ = 110·500/100 = 550 V.'],
    ['Um transformador não funciona ligado a uma bateria (corrente contínua) porque', ['a tensão é muito baixa.', 'não há variação de fluxo magnético.', 'a corrente é alta demais.', 'a bateria não tem polos.'], 1, 'A indução exige fluxo variável, que só a corrente alternada produz.'],
    ['O fluxo magnético numa espira varia de 0,5 Wb para 0,1 Wb em 0,2 s. A fem induzida tem módulo', ['0,08 V', '2 V', '3 V', '0,4 V'], 1, '|ε| = ΔΦ/Δt = 0,4/0,2 = 2 V.']
  ],
  fc: [
    ['Inseparabilidade dos polos', 'Partindo um ímã, cada pedaço tem norte e sul.'],
    ['Polo norte geográfico da Terra', 'Fica perto do polo sul magnético.'],
    ['Campo de fio longo', 'B = μ₀i/(2πd)'],
    ['Força sobre carga em movimento', 'F = |q|vB sen θ'],
    ['Força sobre fio', 'F = B·i·L·sen θ'],
    ['Lei de Faraday', '|ε| = ΔΦ/Δt'],
    ['Lei de Lenz', 'A corrente induzida se opõe à variação do fluxo.'],
    ['Transformador', 'U₁/U₂ = N₁/N₂; só com corrente alternada.']
  ]
});

EEAR.add({
  id: 'FIS18', m: 'fis', n: 18, t: 'Matéria e radiação: física moderna, espectro e radioatividade', peso: 2, h: 3, desde: '2026-11',
  teoria: `
<h3>A luz é onda e partícula</h3>
<ul>
<li><b>Como onda</b>, a luz explica a difração, a interferência e a polarização.</li>
<li><b>Como partícula</b> (o <b>fóton</b>), explica o efeito fotoelétrico. É a <b>dualidade onda-partícula</b>: essa é a natureza corpuscular das ondas eletromagnéticas.</li>
<li>A energia de cada fóton depende só da frequência: quanto maior a frequência (menor o comprimento de onda), maior a energia.</li>
</ul>
<div class="f">E = h·f = h·c/λ     c = λ·f = 3 × 10⁸ m/s (no vácuo)<br>h ≈ 6,6 × 10⁻³⁴ J·s ≈ 4,1 × 10⁻¹⁵ eV·s   ·   1 eV = 1,6 × 10⁻¹⁹ J</div>
<p>A prova pode dar a constante de Planck com outro arredondamento (por exemplo, 4,2 × 10⁻¹⁵ eV·s). Use sempre o valor do enunciado.</p>
<h3>Espectro eletromagnético e suas tecnologias</h3>
<p>Todas as faixas são ondas eletromagnéticas e andam a c no vácuo. Da menor para a maior frequência (e energia do fóton):</p>
<div class="tbl"><table><thead><tr><th>Faixa</th><th>Usos e exemplos</th></tr></thead><tbody>
<tr><td>Ondas de rádio</td><td>rádio AM e FM, TV, comunicação entre torre e aeronave</td></tr>
<tr><td>Micro-ondas</td><td>forno de micro-ondas, radar, telefonia celular, Wi-Fi</td></tr>
<tr><td>Infravermelho</td><td>controle remoto, sensores e câmeras térmicas, calor que sentimos de um corpo quente</td></tr>
<tr><td>Luz visível</td><td>do vermelho (menor frequência) ao violeta (maior frequência)</td></tr>
<tr><td>Ultravioleta</td><td>queimadura solar, esterilização de água e de instrumentos</td></tr>
<tr><td>Raios X</td><td>radiografia, tomografia, inspeção de bagagens</td></tr>
<tr><td>Raios gama</td><td>radioterapia, esterilização de materiais médicos; emitidos por núcleos radioativos</td></tr>
</tbody></table></div>
<h3>Potência e intensidade das ondas eletromagnéticas</h3>
<div class="f">Intensidade: I = P/A   (W/m²)<br>Fonte puntiforme que emite igualmente em todas as direções: I = P/(4π·d²)</div>
<p>A intensidade cai com o quadrado da distância: dobrando a distância, ela fica 4 vezes menor. Mais intensidade significa mais fótons por segundo, não fótons mais energéticos.</p>
<h3>Efeito fotoelétrico (Einstein, 1905)</h3>
<p>Luz incidindo num metal pode arrancar elétrons. Cada fóton entrega toda a sua energia a um único elétron.</p>
<div class="f">Ec,máx = h·f − W     (W = função trabalho do metal)<br>Frequência de corte: f₀ = W/h</div>
<ul>
<li>Se f &lt; f₀, <b>nenhum</b> elétron sai, por mais intensa que seja a luz.</li>
<li>Aumentar a <b>intensidade</b> aumenta o <b>número</b> de elétrons (a corrente), não a energia de cada um.</li>
<li>Aumentar a <b>frequência</b> aumenta a energia cinética máxima dos elétrons.</li>
<li>No gráfico Ec,máx × f, a reta corta o eixo f em f₀ e tem inclinação igual a h.</li>
</ul>
<h3>Radiações e meios materiais</h3>
<ul>
<li><b>Fotocélulas</b> (portas automáticas, sensores que acendem a iluminação pública) usam o efeito fotoelétrico: a luz libera elétrons e gera corrente. Os <b>painéis solares</b> fazem algo parecido em semicondutores (efeito fotovoltaico).</li>
<li><b>Emissão de luz</b>: a lâmpada incandescente brilha porque o filamento está muito quente e emite boa parte da energia como infravermelho (por isso gasta mais). No <b>LED</b>, elétrons de um semicondutor descem de nível de energia e emitem fótons; a cor depende do material.</li>
<li><b>Transmissão e absorção</b>: cada material deixa passar algumas faixas do espectro e absorve outras. Um filtro vermelho, por exemplo, deixa passar o vermelho e absorve as outras cores.</li>
<li><b>Telas de monitores</b>: cada pixel tem subpixels vermelho, verde e azul (RGB). Variando o brilho de cada um, formam-se as cores (síntese aditiva). Telas LCD controlam a luz de fundo com cristais líquidos e filtros polarizadores; telas de LED e OLED emitem a própria luz.</li>
<li><b>Radiografias</b>: os raios X atravessam com facilidade pele e músculos, mas são mais absorvidos pelos ossos (e por metais). Onde os raios são absorvidos, a imagem fica clara.</li>
</ul>
<h3>Modelos atômicos</h3>
<ul>
<li><b>Dalton</b>: esfera maciça e indivisível ("bola de bilhar").</li>
<li><b>Thomson</b>: esfera positiva com elétrons espalhados ("pudim de passas"). Veio da descoberta do elétron nos raios catódicos (ampola de Crookes).</li>
<li><b>Rutherford</b>: partículas α lançadas numa folha fina de ouro. A maioria atravessou sem desvio, porque o átomo é quase todo vazio. Poucas desviaram ou voltaram, porque há um <b>núcleo</b> pequeno, denso e positivo. Os elétrons giram em volta (modelo planetário).</li>
<li><b>Bohr</b>: o elétron só ocupa órbitas permitidas (níveis de energia quantizados) e não emite energia enquanto está numa delas. Ao saltar para um nível mais interno, <b>emite</b> um fóton; para subir a um nível mais externo, <b>absorve</b>. Isso explica os espectros de linhas de emissão e de absorção.</li>
</ul>
<div class="f">Salto de nível: E_fóton = |E_inicial − E_final| = h·f<br>Hidrogênio: E₁ = −13,6 eV e E₂ = −3,4 eV; de n = 2 para n = 1 emite um fóton de 10,2 eV</div>
<h3>Propriedades dos materiais</h3>
<ul>
<li><b>Elétricas e térmicas</b>: nos metais há elétrons livres, por isso eles conduzem bem eletricidade e calor. Isolantes (borracha, vidro, plásticos) quase não têm cargas livres. <b>Semicondutores</b> (silício, germânio) conduzem de forma intermediária, e a condução aumenta com a temperatura e com a adição controlada de impurezas (dopagem). Eles são a base de diodos, LEDs, transistores e células solares.</li>
<li><b>Magnéticas</b>: <b>ferromagnéticos</b> (ferro, níquel, cobalto) são fortemente atraídos por ímãs e podem ser imantados; acima de certa temperatura (temperatura de Curie) perdem essa propriedade. <b>Paramagnéticos</b> (alumínio) são atraídos muito fracamente. <b>Diamagnéticos</b> (cobre, água) são repelidos muito fracamente.</li>
</ul>
<h3>Radioatividade</h3>
<ul>
<li><b>Alfa (α)</b>: núcleo de hélio ⁴₂He, carga +2. Pouco penetrante: uma folha de papel detém.</li>
<li><b>Beta (β⁻)</b>: elétron ⁰₋₁β que sai do núcleo quando um nêutron vira próton. Penetração média.</li>
<li><b>Gama (γ)</b>: onda eletromagnética de altíssima energia, sem carga e sem massa. Muito penetrante.</li>
</ul>
<div class="f">Emissão α: A diminui 4 e Z diminui 2<br>Emissão β⁻: A não muda e Z aumenta 1<br>Emissão γ: A e Z não mudam<br>Meia-vida: m = m₀/2ⁿ, com n = t/T½</div>
<h3>Fissão e fusão nuclear</h3>
<ul>
<li><b>Fissão</b>: um núcleo pesado (como o urânio-235), atingido por um nêutron, se divide em dois núcleos médios, libera 2 ou 3 nêutrons e muita energia. Os nêutrons podem gerar uma <b>reação em cadeia</b>, usada em usinas nucleares e na bomba atômica.</li>
<li><b>Fusão</b>: núcleos leves (como os de hidrogênio) se unem num núcleo mais pesado. É a fonte de energia do Sol e das estrelas.</li>
<li>Em toda reação nuclear, a soma dos números de massa (A) e a soma dos números atômicos (Z) se conservam. A energia liberada vem da massa que "some": E = m·c².</li>
</ul>
<p class="dica">Nas provas oficiais do curso, este tema já apareceu como cálculo do comprimento de onda no efeito fotoelétrico (CFS 2/2025, questão 51), salto de nível no átomo de Bohr (CFS 2/2025, questão 68) e fissão do urânio-235 (CFS 1/2025, questão 51).</p>`,
  ex: [
    ['Qual a energia de um fóton de luz com frequência de 5 × 10¹⁴ Hz? (h = 6,6 × 10⁻³⁴ J·s)', '<p>E = h·f = 6,6×10⁻³⁴ · 5×10¹⁴ = <b>3,3 × 10⁻¹⁹ J</b>, cerca de 2,1 eV.</p>'],
    ['Um metal tem função trabalho de 2,0 eV e recebe fótons de 3,5 eV. Qual a energia cinética máxima dos elétrons? E a frequência de corte? (h = 4 × 10⁻¹⁵ eV·s)', '<p>Ec,máx = 3,5 − 2,0 = <b>1,5 eV</b>.<br>f₀ = W/h = 2,0/(4×10⁻¹⁵) = <b>5 × 10¹⁴ Hz</b>.</p>'],
    ['Na fissão ²³⁵₉₂U + ¹₀n → ¹⁴¹₅₆Ba + ⁹²₃₆Kr + x·¹₀n, quantos nêutrons são liberados?', '<p>Massa: 235 + 1 = 141 + 92 + x, logo <b>x = 3</b>.<br>Carga: 92 = 56 + 36 confere.</p>'],
    ['Uma rádio FM transmite em 100 MHz. Qual o comprimento de onda? (c = 3 × 10⁸ m/s)', '<p>λ = c/f = 3×10⁸ / 1×10⁸ = <b>3 m</b>.</p>']
  ],
  q: [
    ['No efeito fotoelétrico, aumentar a intensidade da luz, mantendo a frequência acima da frequência de corte, aumenta', ['a energia cinética máxima dos elétrons.', 'o número de elétrons emitidos por segundo.', 'a frequência de corte do metal.', 'a função trabalho do metal.'], 1, 'A intensidade muda a quantidade de fótons, e cada fóton arranca no máximo um elétron. A energia de cada elétron depende só da frequência.'],
    ['Uma luz muito intensa, mas com frequência menor que a frequência de corte, incide num metal. Então', ['os elétrons saem com pouca energia.', 'nenhum elétron é arrancado.', 'os elétrons saem depois de algum tempo.', 'saem mais elétrons do que com luz fraca.'], 1, 'Abaixo de f₀ cada fóton tem energia menor que W, e nenhum elétron escapa, qualquer que seja a intensidade.'],
    ['A energia de um fóton de frequência 1,0 × 10¹⁵ Hz é (h = 6,6 × 10⁻³⁴ J·s)', ['6,6 × 10⁻¹⁹ J', '6,6 × 10⁻⁴⁹ J', '1,5 × 10⁻¹⁹ J', '6,6 × 10⁻¹⁸ J'], 0, 'E = h·f = 6,6×10⁻³⁴ · 1,0×10¹⁵ = 6,6×10⁻¹⁹ J.'],
    ['Um metal tem função trabalho de 2,5 eV. Fótons de 4,0 eV arrancam elétrons com energia cinética máxima de', ['6,5 eV', '1,5 eV', '2,5 eV', '4,0 eV'], 1, 'Ec,máx = h·f − W = 4,0 − 2,5 = 1,5 eV.'],
    ['Entre as radiações a seguir, a que tem fótons de maior energia é', ['o infravermelho.', 'a luz vermelha.', 'o ultravioleta.', 'o raio X.'], 3, 'Maior frequência, maior energia: infravermelho < visível < ultravioleta < raios X.'],
    ['No experimento de Rutherford, a maioria das partículas α atravessou a folha de ouro sem desvio. Isso mostrou que', ['o átomo é maciço.', 'o átomo tem grandes espaços vazios.', 'o elétron tem carga negativa.', 'os elétrons ficam no núcleo.'], 1, 'Se quase todas passam direto, o átomo é quase todo vazio. As poucas que desviam revelam o núcleo pequeno e positivo.'],
    ['Segundo o modelo de Bohr, o elétron emite um fóton quando', ['permanece numa órbita estacionária.', 'salta para uma órbita mais externa.', 'salta de uma órbita mais externa para uma mais interna.', 'gira mais rápido na mesma órbita.'], 2, 'Descendo de nível, o elétron perde energia e emite um fóton com E = E_inicial − E_final. Para subir, ele absorve energia.'],
    ['Na fissão ²³⁵₉₂U + ¹₀n → ⁹⁰₃₈Sr + ¹⁴³₅₄Xe + x·¹₀n, o número x de nêutrons liberados é', ['1', '2', '3', '4'], 2, 'Conservação do número de massa: 235 + 1 = 90 + 143 + x, logo x = 3. Os números atômicos conferem: 92 = 38 + 54.'],
    ['Quando um núcleo emite uma partícula β⁻, o número de massa A e o número atômico Z', ['diminuem 4 e 2.', 'não muda A, e Z aumenta 1.', 'não muda A, e Z diminui 1.', 'A aumenta 1, e Z não muda.'], 1, 'Um nêutron vira próton e emite um elétron: A continua igual e Z sobe 1.'],
    ['Um isótopo tem meia-vida de 8 dias. De uma amostra de 80 g, depois de 24 dias restam', ['40 g', '20 g', '10 g', '0 g'], 2, '24 dias são 3 meias-vidas: 80 → 40 → 20 → 10 g.'],
    ['Numa radiografia, os ossos aparecem claros porque os raios X', ['são refletidos pela pele.', 'são mais absorvidos pelos ossos do que pela pele e pelos músculos.', 'têm frequência menor que a da luz visível.', 'são ondas mecânicas, como o ultrassom.'], 1, 'Os raios X atravessam com facilidade os tecidos moles e são mais absorvidos pelos ossos; onde são absorvidos, a imagem fica clara. Eles são ondas eletromagnéticas de frequência maior que a da luz.'],
    ['A intensidade da radiação de uma fonte puntiforme, medida a 2 m dela, é I. A 4 m da fonte, a intensidade passa a ser', ['I/2', 'I/4', '2I', 'I/16'], 1, 'I = P/(4πd²): dobrando a distância, a intensidade cai para (1/2)² = 1/4.'],
    ['Assinale o material ferromagnético, fortemente atraído por ímãs e capaz de ser imantado.', ['cobre', 'alumínio', 'ferro', 'vidro'], 2, 'Ferro, níquel e cobalto são ferromagnéticos. O alumínio é paramagnético (atração muito fraca); o cobre e o vidro são diamagnéticos (repulsão muito fraca).'],
    ['As portas automáticas com fotocélula e os painéis solares funcionam porque', ['a luz libera elétrons no material, gerando corrente elétrica.', 'o material se dilata ao ser aquecido pela luz.', 'os núcleos dos átomos se dividem com a luz.', 'a luz se transforma em som dentro do sensor.'], 0, 'A fotocélula usa o efeito fotoelétrico e o painel solar, o efeito fotovoltaico em semicondutores: nos dois, a energia dos fótons libera elétrons e gera corrente.']
  ],
  fc: [
    ['Energia do fóton', 'E = h·f = h·c/λ'],
    ['Efeito fotoelétrico', 'Ec,máx = h·f − W (Einstein)'],
    ['Frequência de corte', 'f₀ = W/h. Abaixo dela nenhum elétron sai.'],
    ['Mais intensidade no efeito fotoelétrico', 'Mais elétrons, mas a mesma energia por elétron.'],
    ['Dualidade da luz', 'Onda: difração e interferência. Partícula: efeito fotoelétrico.'],
    ['Modelo de Thomson', 'Pudim de passas; elétron descoberto nos raios catódicos.'],
    ['Modelo de Rutherford', 'Núcleo pequeno, denso e positivo; átomo quase vazio.'],
    ['Modelo de Bohr', 'Órbitas quantizadas; descer de nível emite fóton.'],
    ['Emissão alfa', '⁴₂He: A − 4 e Z − 2'],
    ['Emissão beta', '⁰₋₁β: A igual e Z + 1'],
    ['Radiação gama', 'Onda eletromagnética sem carga e sem massa.'],
    ['Fissão x fusão', 'Fissão: núcleo pesado se divide (usinas). Fusão: núcleos leves se unem (Sol).'],
    ['Meia-vida', 'm = m₀/2ⁿ, com n = t/T½'],
    ['Espectro (menor → maior frequência)', 'Rádio, micro-ondas, infravermelho, visível, ultravioleta, raios X, gama.'],
    ['Intensidade de onda', 'I = P/A; fonte puntiforme: I = P/(4πd²).'],
    ['Radiografia', 'Raios X são mais absorvidos pelos ossos: eles aparecem claros.'],
    ['Ferromagnéticos', 'Ferro, níquel e cobalto: fortemente atraídos e imantáveis.'],
    ['Semicondutores', 'Silício e germânio: base de LEDs, transistores e células solares.']
  ]
});

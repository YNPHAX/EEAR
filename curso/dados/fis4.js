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
    ['Uma pessoa se aproxima de um espelho plano a 1 m/s. Com que velocidade ela se aproxima da própria imagem? A imagem é invertida?', 'A imagem também se aproxima do espelho a 1 m/s, então pessoa e imagem se aproximam a 2 m/s. A imagem é direita e do mesmo tamanho, mas troca direita e esquerda (enantiomorfa).', 2],
    ['Dois espelhos planos formam 90°. Quantas imagens de um objeto colocado entre eles aparecem? E se o ângulo for 45°?', 'n = 360°/α − 1: com 90°, n = 3; com 45°, n = 7.', 2],
    ['Uma lente convergente de foco 10 cm recebe um objeto a 15 cm dela. Onde se forma a imagem, e qual é a sua natureza?', '1/10 = 1/15 + 1/p\' → 1/p\' = 1/30 → p\' = 30 cm (positivo): imagem real e invertida, duas vezes maior (aumento −p\'/p = −2).', 2],
    ['Espelho convexo', 'Imagem sempre virtual, direita e menor.'],
    ['Índice de refração', 'n = c/v'],
    ['Lei de Snell', 'n₁ sen θ₁ = n₂ sen θ₂'],
    ['A luz vai do vidro (n = 1,5) para o ar. Pode haver reflexão total? E do ar para o vidro?', 'Do vidro para o ar, sim: a luz passa do meio mais refringente para o menos, e há reflexão total se a incidência superar o ângulo limite (sen L = 1/1,5). Do ar para o vidro, nunca.', 2],
    ['O míope enxerga mal de longe; o hipermetrope, de perto. Onde a imagem se forma em cada olho, e que lente corrige cada defeito?', 'Miopia: imagem antes da retina, corrigida com lente divergente. Hipermetropia: imagem depois da retina, corrigida com lente convergente.', 2]
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
    ['Duas cargas se repelem com força F. Se uma das cargas dobrar e a distância cair pela metade, qual será a nova força?', 'F = k|Qq|/d²: dobrar uma carga multiplica por 2; a distância pela metade multiplica por 4. Nova força: 8F.', 2],
    ['Esferas condutoras idênticas: A (+8 μC) toca B (neutra) e se separa; depois B toca C (neutra). Qual é a carga final de cada uma?', 'A e B: (8 + 0)/2 = +4 μC cada. B e C: (4 + 0)/2 = +2 μC cada. Final: A = +4 μC, B = +2 μC, C = +2 μC; a carga total de 8 μC se conserva.', 2],
    ['Um bastão negativo é aproximado de uma esfera neutra ligada à terra. O fio é desligado e só então o bastão é afastado. Com que sinal fica a esfera?', 'Positivo: os elétrons da esfera, repelidos pelo bastão, escoam para a terra; com o fio desligado, eles não voltam. Na indução, o induzido fica com sinal oposto ao do indutor.', 2],
    ['Campo de carga puntiforme', 'E = k|Q|/d²'],
    ['Potencial de carga puntiforme', 'V = kQ/d (com sinal)'],
    ['Trabalho da força elétrica', 'τ = q(VA − VB)'],
    ['Campo uniforme', 'U = E·d'],
    ['Lei de Gauss', 'Fluxo por superfície fechada = Q interna/ε₀; carga de fora não conta.'],
    ['Num campo elétrico uniforme, as linhas de campo são horizontais. Como são as superfícies equipotenciais? Qual é o trabalho para mover uma carga ao longo de uma delas?', 'São planos verticais, perpendiculares às linhas de campo. O trabalho é nulo, porque não há diferença de potencial entre pontos da mesma superfície.', 2],
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
    ['Um chuveiro de 4400 W, feito para 220 V, é ligado por engano em 110 V. Supondo a resistência constante, qual será a potência?', 'R = U²/P = 220²/4400 = 11 Ω. Em 110 V: P = 110²/11 = 1100 W, um quarto da potência, porque P é proporcional a U².', 2],
    ['Duas lâmpadas iguais estão ligadas em série a uma fonte. O que acontece com uma se a outra queimar? E se estivessem em paralelo?', 'Em série, a outra apaga: o circuito se abre e a corrente, que é a mesma nas duas, cai a zero. Em paralelo, a outra continua acesa, sob a mesma tensão.', 2],
    ['Resistores de 12 Ω e 4 Ω em paralelo são ligados a 12 V. Qual é a resistência equivalente e a corrente em cada um?', 'Req = 12 · 4/(12 + 4) = 3 Ω; corrente total 4 A. Mesma tensão nos dois: 12/12 = 1 A e 12/4 = 3 A (1 + 3 = 4 A).', 2],
    ['Um gerador de fem 9 V e resistência interna 0,5 Ω alimenta um resistor de 4 Ω. Qual é a corrente e a tensão nos terminais do gerador?', 'i = ε/(R + r) = 9/4,5 = 2 A. Tensão nos terminais: U = ε − r · i = 9 − 0,5 · 2 = 8 V, igual à do resistor (4 · 2 = 8 V).', 2],
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
    ['Um ímã em barra é cortado em três pedaços. Quantos polos norte existem no final? É possível obter um polo norte isolado?', 'Três: cada pedaço vira um ímã com norte e sul. Não existe polo magnético isolado; os polos são inseparáveis.', 2],
    ['Polo norte geográfico da Terra', 'Fica perto do polo sul magnético.'],
    ['Campo de fio longo', 'B = μ₀i/(2πd)'],
    ['Força sobre carga em movimento', 'F = |q|vB sen θ'],
    ['Força sobre fio', 'F = B·i·L·sen θ'],
    ['Lei de Faraday', '|ε| = ΔΦ/Δt'],
    ['Um ímã é aproximado de uma espira com o polo norte à frente. Que polo a espira forma na face voltada para o ímã? E quando o ímã é afastado?', 'Na aproximação, a face vira polo norte: a corrente induzida se opõe à variação do fluxo e repele o ímã. No afastamento, a face vira polo sul e atrai o ímã (lei de Lenz).', 2],
    ['Um transformador ideal reduz 220 V para 11 V. Qual é a razão N₁/N₂? Se o secundário fornece 2 A, qual é a corrente no primário?', 'N₁/N₂ = U₁/U₂ = 220/11 = 20. Ideal: U₁ · i₁ = U₂ · i₂ → i₁ = 11 · 2/220 = 0,1 A.', 2]
  ]
});

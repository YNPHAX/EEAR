/* Física — módulos 1 a 5 */
EEAR.add({
  id: 'FIS01', m: 'fis', n: 1, t: 'Fundamentos: grandezas, unidades e vetores', peso: 2, h: 2,
  teoria: `
<h3>Sistema Internacional (SI)</h3>
<div class="tbl"><table><tbody>
<tr><td>Comprimento: metro (m)</td><td>Massa: quilograma (kg)</td><td>Tempo: segundo (s)</td></tr>
<tr><td>Corrente: ampère (A)</td><td>Temperatura: kelvin (K)</td><td>Força: newton (N = kg·m/s²)</td></tr>
<tr><td>Energia e trabalho: joule (J = N·m)</td><td>Potência: watt (W = J/s)</td><td>Pressão: pascal (Pa = N/m²)</td></tr>
</tbody></table></div>
<p>Prefixos: G = 10⁹, M = 10⁶, k = 10³, c = 10⁻², m = 10⁻³, μ = 10⁻⁶, n = 10⁻⁹.</p>
<div class="f">km/h → m/s: divida por 3,6     m/s → km/h: multiplique por 3,6<br>1 km² = 10⁶ m²     1 m³ = 1000 L     1 h = 3600 s</div>
<h3>Notação científica e ordem de grandeza</h3>
<p>Notação científica: N × 10ⁿ, com 1 ≤ N &lt; 10. Ex.: 0,00045 = 4,5 × 10⁻⁴; 86 400 = 8,64 × 10⁴.</p>
<p>Ordem de grandeza: se N &lt; √10 ≈ 3,16, a ordem é 10ⁿ; se N ≥ 3,16, é 10ⁿ⁺¹. Ex.: 8,64 × 10⁴ → 10⁵.</p>
<h3>Escalares e vetoriais</h3>
<p><b>Escalares</b> ficam definidas por número e unidade: massa, tempo, temperatura, energia, trabalho, potência. <b>Vetoriais</b> precisam de módulo, direção e sentido: deslocamento, velocidade, aceleração, força, impulso, quantidade de movimento, campo elétrico.</p>
<h3>Soma de vetores</h3>
<div class="f">Mesmo sentido: R = a + b     Sentidos opostos: R = |a − b|<br>Perpendiculares: R² = a² + b²<br>Ângulo θ entre eles: R² = a² + b² + 2ab·cos θ<br>Limites: |a − b| ≤ R ≤ a + b</div>
<p>Decomposição: um vetor V que forma θ com a horizontal tem componentes V<sub>x</sub> = V·cos θ e V<sub>y</sub> = V·sen θ.</p>
<p class="dica">Converta tudo para o SI antes de calcular. A pegadinha mais comum é deixar velocidade em km/h e tempo em segundos.</p>`,
  ex: [
    ['Converta 108 km/h para m/s.', '<p>108 ÷ 3,6 = <b>30 m/s</b>.</p>'],
    ['Duas forças de 3 N e 4 N são perpendiculares. Qual a resultante?', '<p>R = √(9 + 16) = <b>5 N</b>.</p>'],
    ['Um vetor de 20 N forma 60° com a horizontal. Quais são as componentes?', '<p>Vₓ = 20·cos 60° = 10 N; Vᵧ = 20·sen 60° = 10√3 N.</p>']
  ],
  q: [
    ['A velocidade de 72 km/h corresponde a', ['7,2 m/s', '20 m/s', '36 m/s', '259,2 m/s'], 1, '72 ÷ 3,6 = 20 m/s.'],
    ['O número 0,00045 escrito em notação científica é', ['45 × 10⁻⁵', '4,5 × 10⁻⁴', '4,5 × 10⁴', '0,45 × 10⁻³'], 1, 'A mantissa deve estar entre 1 e 10: 4,5 × 10⁻⁴.'],
    ['É uma grandeza vetorial:', ['massa', 'tempo', 'força', 'energia'], 2, 'Força precisa de módulo, direção e sentido.'],
    ['Duas forças perpendiculares de 6 N e 8 N atuam num corpo. A resultante vale', ['2 N', '10 N', '14 N', '48 N'], 1, '√(36 + 64) = 10 N.'],
    ['Duas forças de mesma direção e sentidos opostos, de 5 N e 3 N, têm resultante de', ['2 N', '8 N', '15 N', '4 N'], 0, 'Sentidos opostos: 5 − 3 = 2 N.'],
    ['Um dia tem 86 400 segundos. A ordem de grandeza desse número é', ['10³', '10⁴', '10⁵', '10⁶'], 2, '8,64 × 10⁴ e 8,64 &gt; 3,16, então a ordem é 10⁵.'],
    ['No SI, a unidade de força (newton) equivale a', ['kg·m/s', 'kg·m/s²', 'kg·m²/s²', 'g·cm/s²'], 1, 'F = m·a → kg·m/s².'],
    ['Um vetor de 10 N forma 30° com a horizontal. Sua componente horizontal vale', ['5 N', '5√3 N', '10√3 N', '5√2 N'], 1, 'Vₓ = 10·cos 30° = 10·√3/2 = 5√3 N.'],
    ['Um terreno de 1 km² tem área, em m², de', ['10³', '10⁴', '10⁶', '10⁹'], 2, '(10³ m)² = 10⁶ m².'],
    ['A resultante de duas forças de 7 N e 4 N pode valer', ['2 N', '9 N', '12 N', '15 N'], 1, 'A resultante fica entre 7 − 4 = 3 N e 7 + 4 = 11 N.']
  ],
  fc: [
    ['km/h para m/s', 'Divida por 3,6.'],
    ['Unidade de força no SI', 'Newton: kg·m/s².'],
    ['Resultante de vetores perpendiculares', 'R² = a² + b²'],
    ['Limites da resultante de dois vetores', '|a − b| ≤ R ≤ a + b'],
    ['Componentes de um vetor', 'Vx = V·cos θ; Vy = V·sen θ'],
    ['Ordem de grandeza', 'N < 3,16 → 10ⁿ; N ≥ 3,16 → 10ⁿ⁺¹.'],
    ['Grandezas vetoriais', 'Deslocamento, velocidade, aceleração, força, impulso.'],
    ['Prefixos μ e n', '10⁻⁶ e 10⁻⁹']
  ]
});

EEAR.add({
  id: 'FIS02', m: 'fis', n: 2, t: 'Cinemática: conceitos e movimento uniforme', peso: 3, h: 2.5,
  teoria: `
<h3>Conceitos</h3>
<ul>
<li><b>Referencial</b>: corpo em relação ao qual se observa o movimento. Repouso e movimento dependem do referencial.</li>
<li><b>Ponto material</b>: dimensões desprezíveis em relação às distâncias envolvidas. <b>Corpo extenso</b>: dimensões relevantes.</li>
<li><b>Trajetória</b>: linha formada pelas posições sucessivas; também depende do referencial (uma caixa solta de um avião cai em linha reta vertical para o piloto e em arco de parábola para quem está no solo).</li>
<li><b>Deslocamento</b> (Δs = s − s₀) é diferente de <b>distância percorrida</b> (soma de tudo que foi andado).</li>
</ul>
<h3>Velocidade média</h3>
<div class="f">v<sub>m</sub> = Δs / Δt</div>
<p>Atenção: velocidade média <b>não</b> é a média das velocidades. Ida de 60 km a 60 km/h (1 h) e volta de 60 km a 30 km/h (2 h): v<sub>m</sub> = 120 km / 3 h = 40 km/h.</p>
<h3>Movimento uniforme (MU)</h3>
<div class="f">v constante, a = 0     s = s₀ + v·t</div>
<ul>
<li>Gráfico s × t: reta inclinada; a inclinação é a velocidade.</li>
<li>Gráfico v × t: reta horizontal; a área é o deslocamento.</li>
<li>Progressivo (v &gt; 0) ou retrógrado (v &lt; 0).</li>
</ul>
<h3>Encontro e velocidade relativa</h3>
<ul>
<li>Encontro: iguale as funções horárias s<sub>A</sub> = s<sub>B</sub>.</li>
<li>Mesmo sentido: v<sub>rel</sub> = v<sub>A</sub> − v<sub>B</sub>. Sentidos opostos: v<sub>rel</sub> = v<sub>A</sub> + v<sub>B</sub>.</li>
<li>Trem atravessando ponte ou túnel: distância = comprimento do trem + comprimento da ponte.</li>
</ul>
<p class="dica">Numa questão de velocidade média com trechos diferentes, calcule o tempo de cada trecho e divida a distância total pelo tempo total.</p>`,
  ex: [
    ['Um carro percorre 150 km em 2 h e depois 90 km em 1 h. Qual a velocidade média total?', '<p>240 km / 3 h = <b>80 km/h</b>.</p>'],
    ['Dois carros partem um em direção ao outro, separados por 300 m, com velocidades de 20 m/s e 10 m/s. Quando se encontram?', '<p>v<sub>rel</sub> = 30 m/s: t = 300/30 = <b>10 s</b>.</p>'],
    ['Um trem de 200 m a 20 m/s atravessa uma ponte de 100 m. Quanto tempo leva?', '<p>(200 + 100)/20 = <b>15 s</b>.</p>']
  ],
  q: [
    ['Um carro percorre 120 km em 1,5 h. Sua velocidade média é', ['60 km/h', '80 km/h', '90 km/h', '180 km/h'], 1, '120/1,5 = 80 km/h.'],
    ['Um carro faz os primeiros 60 km a 60 km/h e os 60 km seguintes a 30 km/h. A velocidade média no percurso total é', ['40 km/h', '45 km/h', '50 km/h', '90 km/h'], 0, 'Tempos: 1 h + 2 h = 3 h. vₘ = 120/3 = 40 km/h.'],
    ['Um móvel segue a função s = 10 + 5t (SI). Sua posição em t = 4 s é', ['20 m', '30 m', '40 m', '25 m'], 1, 's = 10 + 5·4 = 30 m.'],
    ['O móvel A parte da origem a 20 m/s e o B parte de 300 m a −10 m/s (em sentido contrário), ao mesmo tempo. Eles se encontram em', ['10 s', '15 s', '30 s', '6 s'], 0, '20t = 300 − 10t → t = 10 s.'],
    ['Um trem de 200 m, a 20 m/s, atravessa completamente uma ponte de 100 m em', ['5 s', '10 s', '15 s', '20 s'], 2, 'Distância = 200 + 100 = 300 m; t = 300/20 = 15 s.'],
    ['Dois carros andam no mesmo sentido, a 80 km/h e 60 km/h. A velocidade de um em relação ao outro é', ['20 km/h', '70 km/h', '140 km/h', '0'], 0, 'Mesmo sentido: 80 − 60 = 20 km/h.'],
    ['Um passageiro sentado num ônibus em movimento está', ['em repouso em relação a qualquer referencial.', 'em movimento em relação ao ônibus.', 'em repouso em relação ao ônibus e em movimento em relação à estrada.', 'em movimento em relação ao motorista.'], 2, 'Repouso e movimento dependem do referencial.'],
    ['No gráfico posição × tempo de um movimento uniforme, a inclinação da reta representa', ['a aceleração.', 'a velocidade.', 'o deslocamento.', 'a posição inicial.'], 1, 'A inclinação (Δs/Δt) é a velocidade.'],
    ['Uma pessoa anda 5 km para o norte e volta 3 km. A distância percorrida e o módulo do deslocamento são', ['8 km e 2 km', '2 km e 8 km', '8 km e 8 km', '5 km e 3 km'], 0, 'Distância: 5 + 3 = 8 km. Deslocamento: 5 − 3 = 2 km.'],
    ['Vê-se um relâmpago e ouve-se o trovão 3 s depois. Sendo a velocidade do som 340 m/s, o raio caiu a cerca de', ['113 m', '340 m', '1020 m', '3400 m'], 2, 'A luz chega quase instantaneamente: d = 340·3 = 1020 m.']
  ],
  fc: [
    ['Velocidade média', 'Δs/Δt (distância total ÷ tempo total).'],
    ['Função horária do MU', 's = s₀ + v·t'],
    ['Velocidade relativa: mesmo sentido', 'Subtrai as velocidades.'],
    ['Velocidade relativa: sentidos opostos', 'Soma as velocidades.'],
    ['Trem atravessando ponte', 'Distância = trem + ponte.'],
    ['Inclinação do gráfico s × t', 'Velocidade.'],
    ['Repouso e movimento', 'Dependem do referencial.'],
    ['Deslocamento x distância', 'Deslocamento: posição final − inicial. Distância: tudo o que foi percorrido.']
  ]
});

EEAR.add({
  id: 'FIS03', m: 'fis', n: 3, t: 'MUV, queda livre e lançamento vertical', peso: 3, h: 3,
  teoria: `
<h3>Movimento uniformemente variado (MUV)</h3>
<div class="f">a = Δv/Δt (constante)<br>v = v₀ + a·t<br>s = s₀ + v₀·t + a·t²/2<br>Torricelli: v² = v₀² + 2·a·Δs<br>Velocidade média no MUV: v<sub>m</sub> = (v₀ + v)/2</div>
<ul>
<li>Acelerado: |v| aumenta (v e a de mesmo sinal). Retardado: |v| diminui (sinais opostos).</li>
<li>Gráfico v × t: reta; a <b>inclinação</b> é a aceleração e a <b>área</b> é o deslocamento.</li>
<li>Gráfico s × t: parábola.</li>
<li>Comparando s = s₀ + v₀t + (a/2)t² com uma função dada, por exemplo s = 5 + 2t + 3t²: v₀ = 2 m/s e a/2 = 3 → a = 6 m/s².</li>
</ul>
<h3>Queda livre (resistência do ar desprezada)</h3>
<div class="f">a = g ≈ 10 m/s²     v = g·t     h = g·t²/2     v² = 2·g·h</div>
<p>Todos os corpos caem com a mesma aceleração, independentemente da massa.</p>
<h3>Lançamento vertical para cima</h3>
<div class="f">Tempo de subida: t<sub>s</sub> = v₀/g     Altura máxima: H = v₀²/(2g)<br>Tempo total (volta ao ponto de partida): 2·t<sub>s</sub></div>
<p>No ponto mais alto, v = 0 mas a aceleração continua sendo g. O corpo volta ao ponto de lançamento com a mesma velocidade (em módulo).</p>
<p class="dica">Torricelli é a fórmula para quando o problema não fala de tempo. Frenagem até parar: v = 0.</p>`,
  ex: [
    ['Um carro a 20 m/s freia com aceleração de −4 m/s². Que distância percorre até parar?', '<p>0 = 400 + 2(−4)Δs → Δs = <b>50 m</b>.</p>'],
    ['Uma pedra é solta do alto de um prédio e chega ao chão em 2 s. Qual a altura?', '<p>h = 10·4/2 = <b>20 m</b>.</p>'],
    ['Uma bola é lançada para cima a 30 m/s. Qual a altura máxima e o tempo total no ar?', '<p>H = 900/20 = <b>45 m</b>; t<sub>s</sub> = 3 s, tempo total <b>6 s</b>.</p>']
  ],
  q: [
    ['Um carro vai do repouso a 20 m/s em 5 s. Sua aceleração média é', ['2 m/s²', '4 m/s²', '5 m/s²', '100 m/s²'], 1, 'a = 20/5 = 4 m/s².'],
    ['Um móvel com v₀ = 10 m/s e a = 2 m/s² terá, em t = 5 s, velocidade de', ['12 m/s', '15 m/s', '20 m/s', '25 m/s'], 2, 'v = 10 + 2·5 = 20 m/s.'],
    ['Partindo do repouso com a = 2 m/s², após percorrer 25 m o móvel terá velocidade de', ['5 m/s', '10 m/s', '50 m/s', '100 m/s'], 1, 'v² = 0 + 2·2·25 = 100 → v = 10 m/s.'],
    ['Um corpo é abandonado e cai livremente durante 3 s (g = 10 m/s²). A altura percorrida é', ['15 m', '30 m', '45 m', '90 m'], 2, 'h = 10·9/2 = 45 m.'],
    ['Uma bola é lançada verticalmente para cima a 20 m/s (g = 10 m/s²). A altura máxima é', ['10 m', '20 m', '40 m', '2 m'], 1, 'H = v₀²/2g = 400/20 = 20 m.'],
    ['Na situação anterior (v₀ = 20 m/s), o tempo até a bola voltar à mão do lançador é', ['2 s', '4 s', '1 s', '8 s'], 1, 'Subida: 20/10 = 2 s; total: 4 s.'],
    ['Um carro a 30 m/s freia uniformemente e para em 6 s. A distância percorrida na frenagem é', ['90 m', '180 m', '60 m', '45 m'], 0, 'vₘ = (30 + 0)/2 = 15 m/s; d = 15·6 = 90 m.'],
    ['Num gráfico v × t, a velocidade sobe linearmente de 0 a 10 m/s em 4 s. O deslocamento nesse intervalo é', ['10 m', '20 m', '40 m', '2,5 m'], 1, 'Área do triângulo: 4·10/2 = 20 m.'],
    ['A função s = 5 + 2t + 3t² (SI) indica velocidade inicial e aceleração de', ['2 m/s e 3 m/s²', '2 m/s e 6 m/s²', '5 m/s e 3 m/s²', '3 m/s e 2 m/s²'], 1, 'v₀ = 2 e a/2 = 3 → a = 6 m/s².'],
    ['Um objeto cai de 80 m de altura, a partir do repouso (g = 10 m/s²). O tempo de queda é', ['2 s', '4 s', '8 s', '16 s'], 1, '80 = 5t² → t² = 16 → t = 4 s.']
  ],
  fc: [
    ['Função horária da velocidade', 'v = v₀ + a·t'],
    ['Função horária da posição (MUV)', 's = s₀ + v₀t + at²/2'],
    ['Equação de Torricelli', 'v² = v₀² + 2aΔs (sem tempo)'],
    ['Área do gráfico v × t', 'Deslocamento.'],
    ['Inclinação do gráfico v × t', 'Aceleração.'],
    ['Altura máxima no lançamento vertical', 'H = v₀²/2g'],
    ['Tempo de subida', 't = v₀/g'],
    ['Queda livre: altura', 'h = gt²/2']
  ]
});

EEAR.add({
  id: 'FIS04', m: 'fis', n: 4, t: 'Lançamentos horizontal e oblíquo; movimento circular', peso: 2, h: 3,
  teoria: `
<h3>Princípio da independência</h3>
<p>O movimento horizontal (MU, sem resistência do ar) e o vertical (MUV com g) acontecem ao mesmo tempo, sem interferir um no outro.</p>
<h3>Lançamento horizontal (altura h, velocidade v₀)</h3>
<div class="f">Horizontal: x = v₀·t     Vertical: y = g·t²/2<br>Tempo de queda: t = √(2h/g)  (o mesmo de uma queda livre da mesma altura)</div>
<h3>Lançamento oblíquo (v₀, ângulo θ)</h3>
<div class="f">v₀ₓ = v₀·cos θ  (constante)     v₀ᵧ = v₀·sen θ<br>Tempo de subida: v₀ᵧ/g     Altura máxima: H = v₀ᵧ²/(2g)<br>Alcance: A = v₀²·sen(2θ)/g   (máximo para θ = 45°)</div>
<p>No ponto mais alto, a velocidade é horizontal e vale v₀·cos θ (não é zero). Ângulos complementares (30° e 60°) dão o mesmo alcance.</p>
<h3>Movimento circular uniforme (MCU)</h3>
<div class="f">Período T (s) e frequência f = 1/T (Hz)     rpm ÷ 60 = Hz<br>Velocidade angular: ω = 2π/T = 2πf<br>Velocidade linear: v = ω·R<br>Aceleração centrípeta: a<sub>cp</sub> = v²/R = ω²·R  (aponta para o centro)</div>
<h3>Transmissão de movimento</h3>
<ul>
<li>Polias ligadas por <b>correia</b> ou engrenagens em contato: mesma velocidade linear: f₁·R₁ = f₂·R₂.</li>
<li>Polias no <b>mesmo eixo</b>: mesma velocidade angular (e mesma frequência).</li>
</ul>
<p class="dica">No MCU a velocidade tem módulo constante, mas muda de direção. Por isso há aceleração centrípeta, mesmo com "velocidade constante".</p>`,
  ex: [
    ['Uma bola sai horizontalmente de uma mesa de 1,25 m de altura a 4 m/s. A que distância da mesa ela cai?', '<p>t = √(2·1,25/10) = 0,5 s. x = 4·0,5 = <b>2 m</b>.</p>'],
    ['Um projétil é lançado a 50 m/s com 37° (sen 37° = 0,6; cos 37° = 0,8). Calcule a altura máxima.', '<p>v₀ᵧ = 30 m/s: H = 900/20 = <b>45 m</b>.</p>'],
    ['Uma roda de raio 0,3 m gira a 120 rpm. Qual a velocidade de um ponto da borda?', '<p>f = 2 Hz; ω = 4π rad/s; v = 4π·0,3 = 1,2π ≈ <b>3,8 m/s</b>.</p>']
  ],
  q: [
    ['Uma esfera é lançada horizontalmente do alto de um prédio de 45 m, com 10 m/s (g = 10 m/s²). A distância horizontal até o ponto de impacto é', ['10 m', '30 m', '45 m', '90 m'], 1, 't = √(90/10) = 3 s; x = 10·3 = 30 m.'],
    ['No lançamento oblíquo sem resistência do ar, o alcance máximo é obtido com ângulo de', ['30°', '45°', '60°', '90°'], 1, 'A = v₀²·sen 2θ/g é máximo quando sen 2θ = 1, ou seja, θ = 45°.'],
    ['Um projétil é lançado a 20 m/s, formando 30° com a horizontal (g = 10 m/s²). A altura máxima é', ['5 m', '10 m', '15 m', '20 m'], 0, 'v₀ᵧ = 20·sen 30° = 10 m/s; H = 100/20 = 5 m.'],
    ['No ponto mais alto da trajetória de um lançamento oblíquo, a velocidade do projétil é', ['zero.', 'vertical.', 'horizontal, igual a v₀·cos θ.', 'igual a v₀.'], 2, 'A componente vertical se anula; sobra a horizontal, constante.'],
    ['Uma roda gira a 120 rpm. Sua frequência e seu período são', ['2 Hz e 0,5 s', '120 Hz e 1/120 s', '0,5 Hz e 2 s', '20 Hz e 0,05 s'], 0, '120/60 = 2 Hz; T = 1/2 = 0,5 s.'],
    ['Um ponto gira com ω = 4 rad/s num círculo de raio 0,5 m. Sua velocidade linear é', ['2 m/s', '8 m/s', '4,5 m/s', '0,125 m/s'], 0, 'v = ω·R = 4·0,5 = 2 m/s.'],
    ['Um carro faz uma curva de raio 50 m a 10 m/s. A aceleração centrípeta é', ['0,2 m/s²', '2 m/s²', '5 m/s²', '500 m/s²'], 1, 'a = v²/R = 100/50 = 2 m/s².'],
    ['Duas polias ligadas por correia têm raios de 10 cm e 5 cm. Se a maior gira a 30 rpm, a menor gira a', ['15 rpm', '30 rpm', '60 rpm', '120 rpm'], 2, 'f₁R₁ = f₂R₂ → 30·10 = f₂·5 → f₂ = 60 rpm.'],
    ['Duas polias presas ao mesmo eixo, de raios diferentes, têm', ['mesma velocidade linear.', 'mesma velocidade angular.', 'mesma aceleração centrípeta.', 'velocidades angulares diferentes.'], 1, 'No mesmo eixo, giram juntas: mesmo ω.'],
    ['A hélice de um helicóptero gira com frequência de 5 Hz. Seu período é', ['5 s', '0,5 s', '0,2 s', '2 s'], 2, 'T = 1/f = 1/5 = 0,2 s.']
  ],
  fc: [
    ['Tempo de queda no lançamento horizontal', 't = √(2h/g), igual ao da queda livre.'],
    ['Componentes do lançamento oblíquo', 'v₀x = v₀cos θ; v₀y = v₀sen θ'],
    ['Alcance do lançamento oblíquo', 'A = v₀²·sen 2θ/g (máximo em 45°)'],
    ['Velocidade no ponto mais alto (oblíquo)', 'Horizontal: v₀·cos θ.'],
    ['rpm para Hz', 'Divida por 60.'],
    ['Velocidade angular', 'ω = 2π/T = 2πf'],
    ['Aceleração centrípeta', 'v²/R = ω²R'],
    ['Polias com correia', 'Mesma velocidade linear: f₁R₁ = f₂R₂.']
  ]
});

EEAR.add({
  id: 'FIS05', m: 'fis', n: 5, t: 'Leis de Newton e aplicações', peso: 3, h: 3,
  teoria: `
<h3>As três leis</h3>
<ul>
<li><b>1ª lei (inércia)</b>: sem força resultante, o corpo mantém repouso ou MRU. Ex.: passageiro "jogado" para a frente quando o ônibus freia.</li>
<li><b>2ª lei</b>: F<sub>R</sub> = m·a (a força resultante e a aceleração têm mesma direção e sentido).</li>
<li><b>3ª lei (ação e reação)</b>: forças de mesma intensidade, mesma direção e sentidos opostos, aplicadas em <b>corpos diferentes</b> (por isso não se anulam).</li>
</ul>
<h3>Forças comuns</h3>
<div class="f">Peso: P = m·g  (vertical, para baixo)<br>Normal (N): perpendicular à superfície de apoio<br>Atrito: f<sub>at</sub> = μ·N  (contrário à tendência de deslizar)<br>Elástica (Hooke): F = k·x<br>Tração (T): ao longo do fio</div>
<p>Atrito estático máximo (μ<sub>e</sub>·N) é a força mínima para tirar o corpo do repouso; depois atua o cinético (μ<sub>c</sub>·N), geralmente menor.</p>
<h3>Plano inclinado (ângulo θ)</h3>
<div class="f">P<sub>x</sub> = P·sen θ  (ao longo do plano)     P<sub>y</sub> = P·cos θ = N<br>Sem atrito: a = g·sen θ</div>
<h3>Sistemas de blocos</h3>
<p>Para a aceleração, trate o conjunto como um corpo só: a = F<sub>externa</sub> / (soma das massas). Para forças internas (tração, contato), isole um bloco.</p>
<h3>Elevador</h3>
<div class="f">Acelerando para cima (ou freando na descida): N = m(g + a)<br>Acelerando para baixo (ou freando na subida): N = m(g − a)<br>Velocidade constante: N = m·g</div>
<h3>Resultante centrípeta</h3>
<div class="f">F<sub>cp</sub> = m·v²/R</div>
<p>Não é uma força nova: é a resultante (atrito numa curva plana, tração num pêndulo, gravidade num satélite).</p>
<p class="dica">Desenhe todas as forças sobre o corpo isolado antes de escrever F = m·a. Peso e normal não formam par de ação e reação.</p>`,
  ex: [
    ['Um bloco de 5 kg é puxado por 30 N num piso com μ = 0,2. Qual a aceleração?', '<p>N = 50 N; f<sub>at</sub> = 10 N. a = (30 − 10)/5 = <b>4 m/s²</b>.</p>'],
    ['Dois blocos A (4 kg) e B (6 kg), ligados por um fio, são puxados por 50 N aplicados em B, num piso sem atrito. Calcule a tração.', '<p>a = 50/10 = 5 m/s². No bloco A: T = 4·5 = <b>20 N</b>.</p>'],
    ['Uma pessoa de 80 kg está num elevador que desce acelerando a 2 m/s². Quanto marca a balança?', '<p>N = 80(10 − 2) = <b>640 N</b>.</p>']
  ],
  q: [
    ['Uma força resultante de 20 N age sobre um corpo de 4 kg. A aceleração é', ['0,2 m/s²', '5 m/s²', '16 m/s²', '80 m/s²'], 1, 'a = F/m = 20/4 = 5 m/s².'],
    ['O peso de uma pessoa de 70 kg (g = 10 m/s²) é', ['7 N', '70 N', '700 N', '7000 N'], 2, 'P = m·g = 700 N.'],
    ['As forças de ação e reação não se anulam porque', ['têm intensidades diferentes.', 'atuam em corpos diferentes.', 'têm mesmo sentido.', 'só existem com atrito.'], 1, 'Cada uma age num corpo; só se somam forças que atuam no mesmo corpo.'],
    ['Um bloco de 10 kg é puxado horizontalmente por 50 N num piso com coeficiente de atrito 0,3 (g = 10 m/s²). A aceleração é', ['2 m/s²', '3 m/s²', '5 m/s²', '8 m/s²'], 0, 'fₐₜ = 0,3·100 = 30 N; a = (50 − 30)/10 = 2 m/s².'],
    ['Um bloco desce um plano inclinado de 30°, sem atrito (g = 10 m/s²). Sua aceleração é', ['10 m/s²', '5 m/s²', '5√3 m/s²', '2 m/s²'], 1, 'a = g·sen 30° = 5 m/s².'],
    ['Dois blocos A (2 kg) e B (3 kg), encostados num piso liso, são empurrados por 20 N aplicados em A. A força que A exerce em B é', ['8 N', '12 N', '20 N', '4 N'], 1, 'a = 20/5 = 4 m/s²; em B: F = 3·4 = 12 N.'],
    ['Uma pessoa de 60 kg está num elevador que sobe acelerando a 2 m/s² (g = 10 m/s²). A força normal sobre ela é', ['480 N', '600 N', '720 N', '120 N'], 2, 'N = m(g + a) = 60·12 = 720 N.'],
    ['Uma mola de constante 200 N/m é distendida 10 cm. A força elástica é', ['2 N', '20 N', '200 N', '2000 N'], 1, 'F = k·x = 200·0,1 = 20 N.'],
    ['Um carro de 1000 kg faz uma curva de raio 100 m a 20 m/s. A resultante centrípeta vale', ['200 N', '2000 N', '4000 N', '20000 N'], 2, 'F = m·v²/R = 1000·400/100 = 4000 N.'],
    ['Quando um ônibus freia bruscamente, os passageiros são projetados para a frente. Isso é explicado', ['pela 1ª lei de Newton (inércia).', 'pela 2ª lei de Newton.', 'pela 3ª lei de Newton.', 'pela lei da gravitação.'], 0, 'Os corpos tendem a manter a velocidade que tinham: inércia.']
  ],
  fc: [
    ['1ª lei de Newton', 'Inércia: sem resultante, mantém repouso ou MRU.'],
    ['2ª lei de Newton', 'F_R = m·a'],
    ['3ª lei de Newton', 'Ação e reação: corpos diferentes, mesma intensidade, sentidos opostos.'],
    ['Força de atrito', 'f = μ·N'],
    ['Plano inclinado sem atrito', 'a = g·sen θ; N = P·cos θ.'],
    ['Elevador subindo acelerado', 'N = m(g + a)'],
    ['Resultante centrípeta', 'F = m·v²/R'],
    ['Lei de Hooke', 'F = k·x']
  ]
});

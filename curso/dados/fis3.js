/* Física — módulos 10 a 13 */
EEAR.add({
  id: 'FIS10', m: 'fis', n: 10, t: 'Hidrostática', peso: 2, h: 2.5,
  teoria: `
<h3>Densidade e pressão</h3>
<div class="f">Densidade: d = m/V     água: 1 g/cm³ = 1000 kg/m³ = 1 kg/L<br>Pressão: p = F/A   (Pa = N/m²)<br>1 atm ≈ 1 × 10⁵ Pa = 76 cmHg ≈ 10 m de coluna de água</div>
<p>A mesma força numa área menor gera pressão maior (faca afiada, salto fino, prego pontudo).</p>
<h3>Teorema de Stevin</h3>
<div class="f">p = p<sub>atm</sub> + d·g·h     Diferença entre dois pontos: Δp = d·g·Δh</div>
<ul>
<li>Pontos na mesma profundidade de um mesmo líquido em repouso têm a mesma pressão (vasos comunicantes).</li>
<li>A cada 10 m de profundidade na água, a pressão aumenta cerca de 1 atm.</li>
</ul>
<h3>Princípio de Pascal</h3>
<p>Um acréscimo de pressão num líquido em equilíbrio é transmitido integralmente a todos os pontos.</p>
<div class="f">Prensa hidráulica: F₁/A₁ = F₂/A₂     (deslocamentos: A₁·d₁ = A₂·d₂)</div>
<h3>Princípio de Arquimedes (empuxo)</h3>
<div class="f">E = d<sub>líquido</sub> · V<sub>submerso</sub> · g<br>Peso aparente: P<sub>ap</sub> = P − E<br>Corpo flutuando: E = P  →  V<sub>sub</sub>/V<sub>total</sub> = d<sub>corpo</sub>/d<sub>líquido</sub></div>
<ul>
<li>d<sub>corpo</sub> &gt; d<sub>líquido</sub>: afunda. d<sub>corpo</sub> = d<sub>líquido</sub>: fica em equilíbrio em qualquer ponto. d<sub>corpo</sub> &lt; d<sub>líquido</sub>: sobe e flutua.</li>
<li>O empuxo depende do volume <b>submerso</b> e da densidade do <b>líquido</b>, não da massa do corpo.</li>
</ul>
<p class="dica">Converta volumes: 1 L = 10⁻³ m³ e 1 cm³ = 10⁻⁶ m³. Use d da água como 1000 kg/m³ quando o volume estiver em m³.</p>`,
  ex: [
    ['Qual a pressão total a 30 m de profundidade no mar (d = 1000 kg/m³, p<sub>atm</sub> = 10⁵ Pa)?', '<p>p = 10⁵ + 1000·10·30 = 10⁵ + 3×10⁵ = <b>4 × 10⁵ Pa</b> (≈ 4 atm).</p>'],
    ['Numa prensa hidráulica, os êmbolos têm áreas 5 cm² e 100 cm². Que força no menor ergue um carro de 10 000 N?', '<p>F₁ = 10 000 · 5/100 = <b>500 N</b>.</p>'],
    ['Um bloco de gelo (d = 0,9 g/cm³) flutua na água. Que fração fica submersa?', '<p>0,9/1 = <b>90%</b>.</p>']
  ],
  q: [
    ['Um corpo de 600 g ocupa 200 cm³. Sua densidade é', ['0,3 g/cm³', '3 g/cm³', '30 g/cm³', '120 g/cm³'], 1, 'd = 600/200 = 3 g/cm³.'],
    ['Uma força de 100 N distribuída sobre 0,5 m² produz pressão de', ['50 Pa', '200 Pa', '100 Pa', '0,005 Pa'], 1, 'p = 100/0,5 = 200 Pa.'],
    ['A pressão total a 20 m de profundidade na água (d = 1000 kg/m³, g = 10 m/s², p_atm = 1 × 10⁵ Pa) é', ['2 × 10⁵ Pa', '3 × 10⁵ Pa', '1 × 10⁵ Pa', '20 × 10⁵ Pa'], 1, 'p = 10⁵ + 1000·10·20 = 3 × 10⁵ Pa.'],
    ['Numa prensa hidráulica, A₁ = 10 cm² e A₂ = 200 cm². Uma força de 50 N no êmbolo menor gera, no maior,', ['2,5 N', '100 N', '500 N', '1000 N'], 3, 'F₂ = 50·200/10 = 1000 N.'],
    ['Um corpo de 2 L é totalmente mergulhado em água (d = 1000 kg/m³, g = 10 m/s²). O empuxo vale', ['2 N', '20 N', '200 N', '2000 N'], 1, 'E = 1000 · 0,002 · 10 = 20 N.'],
    ['Um bloco de madeira de densidade 0,6 g/cm³ flutua na água. A fração do volume que fica submersa é', ['40%', '60%', '6%', '100%'], 1, 'Vsub/V = 0,6/1 = 60%.'],
    ['Um corpo pesa 50 N no ar e recebe empuxo de 20 N quando mergulhado. Seu peso aparente é', ['20 N', '30 N', '50 N', '70 N'], 1, 'Pap = 50 − 20 = 30 N.'],
    ['Em dois pontos à mesma profundidade, num mesmo líquido em repouso, as pressões são', ['diferentes, dependendo do formato do recipiente.', 'iguais.', 'maiores no recipiente mais largo.', 'nulas.'], 1, 'Pelo teorema de Stevin, a pressão depende só da profundidade e do líquido.'],
    ['Uma faca afiada corta melhor que uma cega porque', ['tem mais massa.', 'concentra a força numa área menor, aumentando a pressão.', 'diminui a pressão.', 'aumenta a área de contato.'], 1, 'p = F/A: menor área, maior pressão.'],
    ['O funcionamento do freio hidráulico de um carro é explicado pelo princípio de', ['Arquimedes.', 'Pascal.', 'Stevin, apenas.', 'Newton.'], 1, 'A pressão aplicada no pedal é transmitida integralmente pelo fluido até as rodas.']
  ],
  fc: [
    ['Densidade da água', '1 g/cm³ = 1000 kg/m³'],
    ['Pressão', 'p = F/A'],
    ['Teorema de Stevin', 'p = p_atm + d·g·h'],
    ['10 m de água equivalem a', 'Cerca de 1 atm (10⁵ Pa).'],
    ['Prensa hidráulica', 'F₁/A₁ = F₂/A₂'],
    ['Empuxo', 'E = d_líquido · V_submerso · g'],
    ['Fração submersa de um corpo flutuante', 'd_corpo / d_líquido'],
    ['Peso aparente', 'P − E']
  ]
});

EEAR.add({
  id: 'FIS11', m: 'fis', n: 11, t: 'Termometria, dilatação e calorimetria', peso: 2, h: 3,
  teoria: `
<h3>Escalas termométricas</h3>
<div class="f">C/5 = (F − 32)/9 = (K − 273)/5<br>Variações: ΔC/5 = ΔF/9 = ΔK/5   (ΔC = ΔK)</div>
<p>Fusão do gelo: 0 °C = 32 °F = 273 K. Ebulição da água (1 atm): 100 °C = 212 °F = 373 K. Uma variação de 10 °C equivale a 18 °F.</p>
<h3>Dilatação térmica</h3>
<div class="f">Linear: ΔL = L₀·α·Δθ<br>Superficial: ΔA = A₀·β·Δθ,  β = 2α<br>Volumétrica: ΔV = V₀·γ·Δθ,  γ = 3α</div>
<ul>
<li>Um furo numa chapa dilata como se fosse feito do mesmo material.</li>
<li>Líquidos: a dilatação real = aparente (o que transborda) + a do recipiente.</li>
<li>A água tem comportamento anômalo entre 0 °C e 4 °C (sua densidade máxima é a 4 °C).</li>
</ul>
<h3>Calorimetria</h3>
<div class="f">Calor sensível (muda a temperatura): Q = m·c·Δθ<br>Capacidade térmica: C = m·c  (cal/°C)<br>Calor latente (muda o estado, temperatura constante): Q = m·L<br>Trocas de calor em sistema isolado: ΣQ = 0  (Q<sub>recebido</sub> + Q<sub>cedido</sub> = 0)</div>
<p>Água: c = 1 cal/g·°C; gelo: c = 0,5 cal/g·°C; L<sub>fusão</sub> = 80 cal/g; L<sub>vaporização</sub> = 540 cal/g. 1 cal ≈ 4,18 J.</p>
<p>Mistura de massas de água: θ<sub>f</sub> = (m₁θ₁ + m₂θ₂)/(m₁ + m₂).</p>
<h3>Propagação do calor</h3>
<ul>
<li><b>Condução</b>: de partícula a partícula, principalmente em sólidos (cabo da panela esquentando).</li>
<li><b>Convecção</b>: por correntes de fluido (líquidos e gases): ar quente sobe, frio desce. Por isso o congelador fica em cima na geladeira e o ar-condicionado é instalado no alto.</li>
<li><b>Irradiação</b>: por ondas eletromagnéticas; a única que ocorre no vácuo (calor do Sol).</li>
</ul>
<p class="dica">Durante a mudança de estado a temperatura não muda: use Q = mL nessa etapa e Q = mcΔθ nas outras, somando tudo.</p>`,
  ex: [
    ['Converta 50 °C para °F.', '<p>50/5 = (F − 32)/9 → 10·9 = F − 32 → <b>F = 122 °F</b>.</p>'],
    ['Quanto calor é necessário para transformar 50 g de gelo a 0 °C em água a 20 °C?', '<p>Fusão: 50·80 = 4000 cal. Aquecimento: 50·1·20 = 1000 cal. Total <b>5000 cal</b>.</p>'],
    ['Uma barra de aço (α = 1,1 × 10⁻⁵ °C⁻¹) de 10 m é aquecida em 100 °C. Quanto dilata?', '<p>ΔL = 10·1,1×10⁻⁵·100 = 0,011 m = <b>1,1 cm</b>.</p>']
  ],
  q: [
    ['A temperatura de 25 °C corresponde a', ['45 °F', '57 °F', '77 °F', '298 °F'], 2, '25/5 = (F − 32)/9 → 45 = F − 32 → F = 77 °F.'],
    ['A temperatura de 300 K corresponde a', ['27 °C', '−27 °C', '573 °C', '300 °C'], 0, 'C = K − 273 = 27 °C.'],
    ['Uma variação de 10 °C corresponde, na escala Fahrenheit, a uma variação de', ['10 °F', '18 °F', '50 °F', '42 °F'], 1, 'ΔC/5 = ΔF/9 → ΔF = 18 °F.'],
    ['Um trilho de 100 m (α = 1,2 × 10⁻⁵ °C⁻¹) sofre um aumento de 30 °C. Sua dilatação é de', ['0,36 cm', '3,6 cm', '36 cm', '0,036 cm'], 1, 'ΔL = 100·1,2×10⁻⁵·30 = 0,036 m = 3,6 cm.'],
    ['A quantidade de calor para aquecer 200 g de água de 20 °C a 70 °C (c = 1 cal/g·°C) é', ['1000 cal', '10 000 cal', '14 000 cal', '4000 cal'], 1, 'Q = 200·1·50 = 10 000 cal.'],
    ['Para fundir 100 g de gelo a 0 °C (L = 80 cal/g) são necessárias', ['80 cal', '800 cal', '8000 cal', '180 cal'], 2, 'Q = m·L = 100·80 = 8000 cal.'],
    ['Misturam-se 100 g de água a 80 °C com 300 g de água a 20 °C, sem perdas. A temperatura final é', ['35 °C', '50 °C', '40 °C', '30 °C'], 0, 'θ = (100·80 + 300·20)/400 = 14 000/400 = 35 °C.'],
    ['Se o coeficiente de dilatação linear de um material é 2 × 10⁻⁵ °C⁻¹, o volumétrico é', ['2 × 10⁻⁵ °C⁻¹', '4 × 10⁻⁵ °C⁻¹', '6 × 10⁻⁵ °C⁻¹', '8 × 10⁻⁵ °C⁻¹'], 2, 'γ = 3α = 6 × 10⁻⁵ °C⁻¹.'],
    ['O calor do Sol chega à Terra atravessando o vácuo por', ['condução.', 'convecção.', 'irradiação.', 'dilatação.'], 2, 'Só a irradiação (ondas eletromagnéticas) se propaga no vácuo.'],
    ['O congelador fica na parte de cima da geladeira para favorecer', ['a condução.', 'a convecção do ar.', 'a irradiação.', 'a dilatação.'], 1, 'O ar frio, mais denso, desce e o quente sobe: correntes de convecção.']
  ],
  fc: [
    ['Conversão entre escalas', 'C/5 = (F − 32)/9 = (K − 273)/5'],
    ['Variação 10 °C em °F e K', '18 °F e 10 K'],
    ['Dilatação linear', 'ΔL = L₀·α·Δθ'],
    ['β e γ em função de α', 'β = 2α; γ = 3α'],
    ['Calor sensível', 'Q = m·c·Δθ'],
    ['Calor latente', 'Q = m·L (temperatura constante)'],
    ['Calor latente de fusão do gelo', '80 cal/g'],
    ['Única propagação no vácuo', 'Irradiação.']
  ]
});

EEAR.add({
  id: 'FIS12', m: 'fis', n: 12, t: 'Estudo dos gases e termodinâmica', peso: 2, h: 2.5,
  teoria: `
<h3>Gases ideais</h3>
<div class="f">Clapeyron: p·V = n·R·T   (T sempre em kelvin)<br>Lei geral: p₁V₁/T₁ = p₂V₂/T₂</div>
<div class="tbl"><table><tbody>
<tr><td>Isotérmica (T constante)</td><td>p·V = constante (Boyle): p dobra, V cai pela metade</td></tr>
<tr><td>Isobárica (p constante)</td><td>V/T = constante (Charles/Gay-Lussac)</td></tr>
<tr><td>Isocórica ou isovolumétrica (V constante)</td><td>p/T = constante</td></tr>
<tr><td>Adiabática</td><td>sem troca de calor (Q = 0)</td></tr>
</tbody></table></div>
<h3>Trabalho de um gás</h3>
<div class="f">Isobárica: τ = p·ΔV<br>Gráfico p × V: a área sob a curva é o trabalho<br>Expansão: τ &gt; 0 (o gás realiza trabalho)   Compressão: τ &lt; 0</div>
<h3>1ª lei da termodinâmica</h3>
<div class="f">Q = τ + ΔU</div>
<ul>
<li>ΔU depende só da temperatura: aquece → ΔU &gt; 0.</li>
<li>Isotérmica: ΔU = 0 → Q = τ.</li>
<li>Isocórica: τ = 0 → Q = ΔU.</li>
<li>Adiabática: Q = 0 → τ = −ΔU (compressão rápida aquece o gás, como numa bomba de bicicleta).</li>
<li>Ciclo fechado: ΔU = 0 → Q = τ (área do ciclo).</li>
</ul>
<h3>2ª lei e máquinas térmicas</h3>
<div class="f">Rendimento: η = τ/Q₁ = 1 − Q₂/Q₁   (Q₁ recebido da fonte quente, Q₂ rejeitado à fria)<br>Carnot (máximo possível): η = 1 − T₂/T₁  (kelvin)</div>
<p>Nenhuma máquina térmica transforma todo o calor em trabalho (η &lt; 100%). O calor flui espontaneamente do corpo mais quente para o mais frio.</p>
<p class="dica">Esqueceu de converter para kelvin? A conta de gás e de Carnot sai errada. Some 273 sempre.</p>`,
  ex: [
    ['Um gás a 27 °C e 2 atm é aquecido a volume constante até 177 °C. Qual a nova pressão?', '<p>T₁ = 300 K, T₂ = 450 K. p₂ = 2 · 450/300 = <b>3 atm</b>.</p>'],
    ['Um gás recebe 800 J de calor e realiza 300 J de trabalho. Qual a variação da energia interna?', '<p>ΔU = Q − τ = <b>500 J</b> (o gás aquece).</p>'],
    ['Qual o rendimento máximo de uma máquina entre 600 K e 300 K?', '<p>η = 1 − 300/600 = <b>50%</b>.</p>']
  ],
  q: [
    ['Numa transformação isotérmica, se a pressão de um gás dobra, seu volume', ['dobra.', 'cai pela metade.', 'não muda.', 'quadruplica.'], 1, 'p·V constante: p × 2 → V ÷ 2.'],
    ['Um gás a 27 °C é aquecido a pressão constante até 327 °C. Seu volume', ['dobra.', 'fica 12 vezes maior.', 'cai pela metade.', 'aumenta 300 cm³.'], 0, 'V/T constante: T vai de 300 K para 600 K, então V dobra.'],
    ['Um gás recebe 500 J de calor e realiza 200 J de trabalho. A variação de sua energia interna é', ['700 J', '300 J', '−300 J', '200 J'], 1, 'ΔU = Q − τ = 500 − 200 = 300 J.'],
    ['Numa transformação isocórica (volume constante),', ['o trabalho é nulo e Q = ΔU.', 'ΔU = 0.', 'Q = 0.', 'a pressão é constante.'], 0, 'Sem variação de volume não há trabalho.'],
    ['Um gás se expande a pressão constante de 2 × 10⁵ Pa, aumentando o volume em 0,003 m³. O trabalho realizado é', ['60 J', '600 J', '6000 J', '0,6 J'], 1, 'τ = p·ΔV = 2×10⁵ · 3×10⁻³ = 600 J.'],
    ['Uma máquina de Carnot opera entre 500 K e 300 K. Seu rendimento é', ['20%', '40%', '60%', '67%'], 1, 'η = 1 − 300/500 = 0,4 = 40%.'],
    ['Uma máquina térmica recebe 1000 J por ciclo e rejeita 700 J. Seu rendimento é', ['30%', '70%', '43%', '100%'], 0, 'τ = 300 J; η = 300/1000 = 30%.'],
    ['Numa compressão adiabática de um gás,', ['a temperatura diminui.', 'a temperatura aumenta.', 'o gás recebe calor.', 'a energia interna não muda.'], 1, 'Q = 0 e τ &lt; 0, então ΔU = −τ &gt; 0: o gás aquece.'],
    ['Numa transformação isotérmica de um gás ideal,', ['Q = 0.', 'τ = 0.', 'ΔU = 0 e Q = τ.', 'a pressão é constante.'], 2, 'Temperatura constante → energia interna constante.'],
    ['Um gás a volume constante está a 300 K e 2 atm. Aquecido a 450 K, sua pressão passa a', ['1,33 atm', '3 atm', '4,5 atm', '2 atm'], 1, 'p/T constante: p₂ = 2·450/300 = 3 atm.']
  ],
  fc: [
    ['Equação de Clapeyron', 'pV = nRT (T em kelvin)'],
    ['Lei geral dos gases', 'p₁V₁/T₁ = p₂V₂/T₂'],
    ['1ª lei da termodinâmica', 'Q = τ + ΔU'],
    ['Transformação isotérmica', 'ΔU = 0 → Q = τ'],
    ['Transformação isocórica', 'τ = 0 → Q = ΔU'],
    ['Transformação adiabática', 'Q = 0 → τ = −ΔU'],
    ['Rendimento de máquina térmica', 'η = τ/Q₁ = 1 − Q₂/Q₁'],
    ['Rendimento de Carnot', '1 − T₂/T₁ (kelvin)']
  ]
});

EEAR.add({
  id: 'FIS13', m: 'fis', n: 13, t: 'MHS, ondas e acústica', peso: 2, h: 3,
  teoria: `
<h3>Movimento harmônico simples (MHS)</h3>
<div class="f">Massa-mola: T = 2π·√(m/k)<br>Pêndulo simples (pequenas oscilações): T = 2π·√(L/g)</div>
<p>O período do pêndulo não depende da massa nem da amplitude (para ângulos pequenos). Na posição de equilíbrio a velocidade é máxima; nos extremos é zero e a aceleração é máxima.</p>
<h3>Ondas</h3>
<ul>
<li><b>Mecânicas</b> precisam de meio (som, ondas na corda). <b>Eletromagnéticas</b> propagam-se no vácuo (luz, rádio, raio X, micro-ondas), a 3 × 10⁸ m/s.</li>
<li><b>Transversais</b>: vibração perpendicular à propagação (luz, corda). <b>Longitudinais</b>: vibração na direção da propagação (som no ar).</li>
</ul>
<div class="f">v = λ · f     f = 1/T</div>
<h3>Fenômenos ondulatórios</h3>
<ul>
<li><b>Reflexão</b>: a onda volta ao meio de origem (eco).</li>
<li><b>Refração</b>: muda de meio, mudando velocidade e comprimento de onda; a <b>frequência não muda</b>.</li>
<li><b>Difração</b>: contorna obstáculos e fendas (ouvimos atrás de um muro).</li>
<li><b>Interferência</b>: superposição construtiva ou destrutiva.</li>
<li><b>Ressonância</b>: um corpo vibra com grande amplitude quando excitado na sua frequência natural (taça que quebra com a voz).</li>
<li><b>Polarização</b>: só ocorre com ondas transversais. Por isso o som no ar não pode ser polarizado.</li>
</ul>
<h3>Acústica</h3>
<ul>
<li>Velocidade do som no ar ≈ 340 m/s; maior em líquidos e sólidos. Não se propaga no vácuo.</li>
<li>Audição humana: 20 Hz a 20 000 Hz. Abaixo: infrassom. Acima: ultrassom.</li>
<li><b>Altura</b> está ligada à frequência: som agudo (alta frequência) x grave (baixa).</li>
<li><b>Intensidade</b> está ligada à amplitude e à energia: som forte x fraco (medida em decibéis).</li>
<li><b>Timbre</b> é a "forma" da onda: distingue instrumentos tocando a mesma nota.</li>
<li><b>Efeito Doppler</b>: aproximação entre fonte e observador → frequência percebida maior (mais aguda); afastamento → menor.</li>
</ul>
<div class="f">Corda vibrante e tubo aberto: f<sub>n</sub> = n·v/(2L)  (n = 1, 2, 3…)<br>Tubo fechado numa ponta: f<sub>n</sub> = n·v/(4L)  (n = 1, 3, 5…, só ímpares)</div>
<p class="dica">"Altura do som" é frequência, não volume. Quem fala alto (no sentido de volume) tem intensidade grande.</p>`,
  ex: [
    ['Uma onda tem frequência 50 Hz e comprimento 4 m. Qual a velocidade?', '<p>v = 4·50 = <b>200 m/s</b>.</p>'],
    ['Uma pessoa grita diante de um paredão e ouve o eco 1,5 s depois. A que distância está o paredão (v = 340 m/s)?', '<p>O som vai e volta: 2d = 340·1,5 = 510 → <b>d = 255 m</b>.</p>'],
    ['Qual o período de um pêndulo de 0,4 m num local com g = 10 m/s² (use π = 3)?', '<p>T = 2·3·√(0,04) = 6·0,2 = <b>1,2 s</b>.</p>']
  ],
  q: [
    ['Uma onda com comprimento de 2 m e frequência de 170 Hz tem velocidade de', ['85 m/s', '170 m/s', '340 m/s', '680 m/s'], 2, 'v = λ·f = 2·170 = 340 m/s.'],
    ['Um som de 680 Hz se propaga no ar a 340 m/s. Seu comprimento de onda é', ['0,5 m', '2 m', '1020 m', '0,25 m'], 0, 'λ = v/f = 340/680 = 0,5 m.'],
    ['O som não se propaga no vácuo porque é uma onda', ['eletromagnética.', 'mecânica.', 'transversal.', 'de alta frequência.'], 1, 'Ondas mecânicas precisam de um meio material.'],
    ['A qualidade do som que permite diferenciar um som agudo de um grave é', ['a intensidade.', 'o timbre.', 'a altura, ligada à frequência.', 'a amplitude.'], 2, 'Altura: agudo (alta frequência) e grave (baixa frequência).'],
    ['Quando uma onda passa de um meio para outro (refração), permanece constante', ['a velocidade.', 'o comprimento de onda.', 'a frequência.', 'a direção.'], 2, 'A frequência é determinada pela fonte e não muda na refração.'],
    ['Um pêndulo simples de 2,5 m oscila num local com g = 10 m/s². Seu período é', ['π s', '2π s', 'π/2 s', '0,5π s'], 0, 'T = 2π√(2,5/10) = 2π·0,5 = π s.'],
    ['Um sistema massa-mola tem m = 1 kg e k = 100 N/m. Seu período é', ['0,1π s', '0,2π s', '2π s', '20π s'], 1, 'T = 2π√(1/100) = 2π·0,1 = 0,2π s.'],
    ['Quando uma ambulância se aproxima de um observador parado, a sirene é ouvida', ['mais grave, por causa do efeito Doppler.', 'mais aguda, por causa do efeito Doppler.', 'com a mesma frequência emitida.', 'mais fraca e mais grave.'], 1, 'Na aproximação, a frequência percebida aumenta: som mais agudo.'],
    ['Uma onda sonora no ar não pode sofrer', ['reflexão.', 'difração.', 'polarização.', 'interferência.'], 2, 'Polarização só ocorre com ondas transversais; o som no ar é longitudinal.'],
    ['Uma pessoa ouve o eco de seu grito 2 s depois de gritar. Com o som a 340 m/s, o obstáculo está a', ['170 m', '340 m', '680 m', '85 m'], 1, 'Ida e volta: 2d = 340·2 → d = 340 m.']
  ],
  fc: [
    ['Equação fundamental da onda', 'v = λ·f'],
    ['Período do pêndulo simples', 'T = 2π√(L/g)'],
    ['Período do massa-mola', 'T = 2π√(m/k)'],
    ['O que não muda na refração', 'A frequência.'],
    ['Altura do som', 'Frequência: agudo x grave.'],
    ['Faixa audível humana', '20 Hz a 20 000 Hz.'],
    ['Efeito Doppler na aproximação', 'Frequência percebida maior (mais agudo).'],
    ['Polarização', 'Só em ondas transversais.']
  ]
});

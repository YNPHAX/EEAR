/* Física — módulos 6 a 9 */
EEAR.add({
  id: 'FIS06', m: 'fis', n: 6, t: 'Trabalho, energia e potência', peso: 3, h: 3,
  teoria: `
<h3>Trabalho de uma força</h3>
<div class="f">τ = F · d · cos θ   (θ = ângulo entre força e deslocamento)<br>Trabalho do peso: τ<sub>P</sub> = ± m·g·h  (positivo descendo, negativo subindo)<br>Força perpendicular ao deslocamento (normal, centrípeta): τ = 0<br>Gráfico F × d: a área é o trabalho</div>
<h3>Energias</h3>
<div class="f">Cinética: E<sub>c</sub> = m·v²/2<br>Potencial gravitacional: E<sub>p</sub> = m·g·h<br>Potencial elástica: E<sub>el</sub> = k·x²/2<br>Mecânica: E<sub>m</sub> = E<sub>c</sub> + E<sub>p</sub></div>
<h3>Teoremas e conservação</h3>
<ul>
<li><b>Teorema da energia cinética</b>: τ<sub>resultante</sub> = ΔE<sub>c</sub>.</li>
<li><b>Conservação</b>: sem atrito e resistência do ar, E<sub>m</sub> inicial = E<sub>m</sub> final. Queda de altura h a partir do repouso: v = √(2gh), sem depender da massa.</li>
<li>Com atrito, a energia mecânica diminui e vira energia térmica: τ<sub>atrito</sub> = E<sub>m final</sub> − E<sub>m inicial</sub>.</li>
</ul>
<h3>Potência e rendimento</h3>
<div class="f">P = τ/Δt = E/Δt     P = F·v   (força na direção da velocidade)<br>Rendimento: η = P<sub>útil</sub> / P<sub>total</sub><br>1 cv ≈ 735 W     1 hp ≈ 746 W     1 kWh = 3,6 × 10⁶ J</div>
<p>Consumo elétrico: E (kWh) = P (kW) · t (h). Um chuveiro de 4000 W ligado 0,5 h por dia gasta 2 kWh por dia.</p>
<p class="dica">Nas questões de montanha-russa e pêndulo, use conservação: m·g·h = m·v²/2. A massa se cancela.</p>`,
  ex: [
    ['Um corpo de 2 kg cai de 5 m a partir do repouso. Com que velocidade chega ao chão?', '<p>v = √(2·10·5) = <b>10 m/s</b>.</p>'],
    ['Um motor eleva 200 kg a 6 m em 10 s. Qual a potência útil?', '<p>τ = 200·10·6 = 12 000 J; P = 12 000/10 = <b>1200 W</b>.</p>'],
    ['Um carro de 800 kg vai de 10 m/s a 30 m/s. Qual o trabalho da resultante?', '<p>ΔE<sub>c</sub> = 400·(900 − 100) = <b>320 000 J</b>.</p>']
  ],
  q: [
    ['Uma força de 50 N desloca um corpo por 10 m, formando 60° com o deslocamento. O trabalho realizado é', ['500 J', '250 J', '250√3 J', '50 J'], 1, 'τ = 50·10·cos 60° = 500·0,5 = 250 J.'],
    ['A energia cinética de um corpo de 2 kg a 10 m/s é', ['20 J', '100 J', '200 J', '10 J'], 1, 'Ec = 2·100/2 = 100 J.'],
    ['Um corpo é solto de 20 m de altura (sem resistência do ar, g = 10 m/s²). Chega ao chão com velocidade de', ['10 m/s', '20 m/s', '200 m/s', '40 m/s'], 1, 'v = √(2·10·20) = √400 = 20 m/s.'],
    ['Um guindaste eleva 100 kg a 10 m de altura em 20 s (g = 10 m/s²). A potência é', ['50 W', '500 W', '5000 W', '200 W'], 1, 'P = mgh/t = 10 000/20 = 500 W.'],
    ['Uma mola de constante 400 N/m está comprimida 10 cm. A energia potencial elástica armazenada é', ['2 J', '4 J', '20 J', '40 J'], 0, 'E = 400·0,01/2 = 2 J.'],
    ['Quando um corpo sobe, o trabalho realizado pelo seu peso é', ['positivo.', 'negativo.', 'nulo.', 'sempre igual à energia cinética.'], 1, 'O peso aponta para baixo e o deslocamento para cima: τ = −mgh.'],
    ['Um motor recebe 1000 W e fornece 800 W de potência útil. Seu rendimento é', ['20%', '80%', '125%', '8%'], 1, 'η = 800/1000 = 0,8 = 80%.'],
    ['Um carro de 1000 kg acelera de 10 m/s para 20 m/s. O trabalho da força resultante é', ['50 000 J', '100 000 J', '150 000 J', '200 000 J'], 2, 'τ = ΔEc = 500·(400 − 100) = 150 000 J.'],
    ['Um chuveiro de 2000 W é usado 30 minutos por dia durante 30 dias. O consumo de energia é', ['30 kWh', '60 kWh', '1000 kWh', '15 kWh'], 0, '2 kW · 0,5 h · 30 = 30 kWh.'],
    ['Um pêndulo é solto de uma altura de 0,8 m em relação ao ponto mais baixo (sem atrito, g = 10 m/s²). A velocidade no ponto mais baixo é', ['2 m/s', '4 m/s', '8 m/s', '16 m/s'], 1, 'v = √(2·10·0,8) = √16 = 4 m/s.']
  ],
  fc: [
    ['Trabalho de uma força', 'τ = F·d·cos θ'],
    ['Energia cinética', 'Ec = mv²/2'],
    ['Energia potencial gravitacional', 'Ep = mgh'],
    ['Energia potencial elástica', 'kx²/2'],
    ['Teorema da energia cinética', 'τ_resultante = ΔEc'],
    ['Velocidade após queda de altura h', 'v = √(2gh)'],
    ['Potência', 'P = τ/Δt = F·v'],
    ['Consumo em kWh', 'P (kW) × t (h)']
  ]
});

EEAR.add({
  id: 'FIS07', m: 'fis', n: 7, t: 'Impulso, quantidade de movimento e colisões', peso: 2, h: 2.5,
  teoria: `
<h3>Definições</h3>
<div class="f">Quantidade de movimento: Q = m·v  (vetor, kg·m/s)<br>Impulso: I = F·Δt  (vetor, N·s)<br>Teorema do impulso: I = ΔQ = m·v<sub>final</sub> − m·v<sub>inicial</sub><br>Gráfico F × t: a área é o impulso</div>
<p>Como é vetorial, preste atenção ao sentido: uma bola de 0,5 kg que bate a 10 m/s numa parede e volta a 10 m/s tem |ΔQ| = 0,5·(10 + 10) = 10 kg·m/s.</p>
<h3>Conservação da quantidade de movimento</h3>
<p>Num sistema isolado (forças externas nulas ou desprezíveis, como em explosões e colisões rápidas): <b>Q<sub>antes</sub> = Q<sub>depois</sub></b>.</p>
<ul>
<li>Recuo de arma: 0 = m<sub>bala</sub>·v<sub>bala</sub> + M<sub>arma</sub>·V<sub>arma</sub>.</li>
<li>Explosão de corpo em repouso: as partes saem com quantidades de movimento iguais e opostas.</li>
</ul>
<h3>Colisões</h3>
<div class="f">Coeficiente de restituição: e = (velocidade relativa de afastamento) / (velocidade relativa de aproximação)</div>
<div class="tbl"><table><tbody>
<tr><td>Elástica (e = 1)</td><td>conserva Q e energia cinética. Massas iguais, uma parada: as velocidades se trocam.</td></tr>
<tr><td>Parcialmente elástica (0 &lt; e &lt; 1)</td><td>conserva Q; perde parte da energia cinética.</td></tr>
<tr><td>Perfeitamente inelástica (e = 0)</td><td>os corpos seguem juntos; conserva Q; maior perda de energia.</td></tr>
</tbody></table></div>
<p class="dica">Em toda colisão de sistema isolado a quantidade de movimento se conserva. A energia cinética só se conserva na elástica.</p>`,
  ex: [
    ['Um caminhão de 3000 kg a 10 m/s colide com um carro de 1000 kg parado e seguem juntos. Qual a velocidade final?', '<p>3000·10 = 4000·v → <b>v = 7,5 m/s</b>.</p>'],
    ['Uma força de 50 N age por 0,4 s numa bola de 0,5 kg parada. Qual a velocidade final?', '<p>I = 20 N·s = ΔQ → v = 20/0,5 = <b>40 m/s</b>.</p>'],
    ['Um canhão de 1000 kg dispara um projétil de 10 kg a 200 m/s. Qual a velocidade de recuo?', '<p>1000·V = 10·200 → <b>V = 2 m/s</b> (sentido oposto).</p>']
  ],
  q: [
    ['A quantidade de movimento de um corpo de 2 kg a 5 m/s é', ['2,5 kg·m/s', '7 kg·m/s', '10 kg·m/s', '25 kg·m/s'], 2, 'Q = m·v = 10 kg·m/s.'],
    ['Uma força de 100 N atua durante 0,2 s. O impulso é', ['20 N·s', '500 N·s', '100 N·s', '0,002 N·s'], 0, 'I = F·Δt = 20 N·s.'],
    ['Uma bola de 0,5 kg atinge uma parede a 10 m/s e volta a 10 m/s. O módulo do impulso recebido pela bola é', ['0', '5 N·s', '10 N·s', '20 N·s'], 2, '|ΔQ| = 0,5·(10 − (−10)) = 10 N·s.'],
    ['Um rifle de 4 kg dispara uma bala de 20 g a 400 m/s. A velocidade de recuo do rifle é', ['0,5 m/s', '2 m/s', '4 m/s', '8 m/s'], 1, '4·V = 0,02·400 = 8 → V = 2 m/s.'],
    ['Um carro de 1000 kg a 20 m/s bate num carro idêntico parado e eles seguem juntos. A velocidade após a colisão é', ['5 m/s', '10 m/s', '20 m/s', '40 m/s'], 1, '1000·20 = 2000·v → v = 10 m/s.'],
    ['Numa colisão elástica frontal entre duas bolas de mesma massa, estando uma parada,', ['as duas param.', 'seguem juntas.', 'as velocidades se trocam.', 'a que estava parada continua parada.'], 2, 'Massas iguais em colisão elástica trocam de velocidade.'],
    ['Numa colisão perfeitamente inelástica, o coeficiente de restituição vale', ['0', '0,5', '1', '∞'], 0, 'Os corpos não se afastam (seguem juntos): e = 0.'],
    ['Num choque de um sistema isolado, sempre se conserva', ['a energia cinética.', 'a quantidade de movimento.', 'a velocidade de cada corpo.', 'a energia potencial.'], 1, 'Q se conserva em qualquer colisão de sistema isolado.'],
    ['Um corpo em repouso explode em dois pedaços: um de 2 kg sai a 6 m/s. O outro, de 3 kg, sai com velocidade de', ['2 m/s, no mesmo sentido', '4 m/s, em sentido oposto', '6 m/s, em sentido oposto', '9 m/s, em sentido oposto'], 1, '0 = 2·6 + 3·v → v = −4 m/s.'],
    ['Uma bola de 0,2 kg parada é chutada e sai a 30 m/s; o contato dura 0,01 s. A força média do chute é', ['60 N', '300 N', '600 N', '6000 N'], 2, 'F = ΔQ/Δt = 0,2·30/0,01 = 600 N.']
  ],
  fc: [
    ['Quantidade de movimento', 'Q = m·v (vetor)'],
    ['Impulso', 'I = F·Δt = ΔQ'],
    ['Área do gráfico F × t', 'Impulso.'],
    ['Conservação de Q', 'Sistema isolado: Q antes = Q depois.'],
    ['Colisão elástica', 'e = 1; conserva Q e Ec.'],
    ['Colisão perfeitamente inelástica', 'e = 0; corpos seguem juntos.'],
    ['Coeficiente de restituição', 'v afastamento / v aproximação.'],
    ['Massas iguais, choque elástico', 'Trocam de velocidade.']
  ]
});

EEAR.add({
  id: 'FIS08', m: 'fis', n: 8, t: 'Gravitação universal', peso: 2, h: 2,
  teoria: `
<h3>Leis de Kepler</h3>
<ol>
<li><b>Órbitas</b>: os planetas descrevem elipses com o Sol num dos focos.</li>
<li><b>Áreas</b>: o raio vetor varre áreas iguais em tempos iguais. O planeta é mais rápido no <b>periélio</b> (perto do Sol) e mais lento no <b>afélio</b>.</li>
<li><b>Períodos</b>: T²/R³ é constante para todos os planetas do mesmo sistema. Se R fica 4 vezes maior, T fica 8 vezes maior.</li>
</ol>
<h3>Lei da gravitação universal (Newton)</h3>
<div class="f">F = G·M·m / d²     G = 6,67 × 10⁻¹¹ N·m²/kg²</div>
<p>A força é proporcional às massas e inversamente proporcional ao <b>quadrado</b> da distância: dobrando d, F cai para 1/4; triplicando d, cai para 1/9.</p>
<h3>Aceleração da gravidade</h3>
<div class="f">Na superfície: g = G·M/R²<br>A uma altura h: g' = G·M/(R + h)²   → em h = R, g' = g/4</div>
<p>Num planeta com o dobro da massa e o dobro do raio da Terra: g' = 2/4 · g = g/2.</p>
<h3>Satélites</h3>
<div class="f">Velocidade orbital: v = √(G·M/r)   (independe da massa do satélite)</div>
<ul>
<li>Quanto mais perto do planeta, maior a velocidade e menor o período.</li>
<li>Satélite <b>geoestacionário</b>: período de 24 h, órbita no plano do equador, parece parado para quem está na Terra.</li>
<li>Astronautas "flutuando" na estação espacial não estão sem gravidade: estão em queda livre contínua junto com a estação (imponderabilidade).</li>
</ul>
<p class="dica">Nas questões de "o que acontece com F se…", monte a razão F'/F e substitua as mudanças. Não precisa do valor de G.</p>`,
  ex: [
    ['Se a distância entre dois corpos triplica, o que acontece com a força gravitacional?', '<p>F\' = F/3² = <b>F/9</b>.</p>'],
    ['Um planeta tem massa 4 vezes a da Terra e raio 2 vezes o da Terra. Qual a gravidade na superfície (g<sub>Terra</sub> = 10 m/s²)?', '<p>g\' = 4/2² · 10 = <b>10 m/s²</b>.</p>'],
    ['Um planeta A tem raio orbital 4 vezes o do planeta B. Compare os períodos.', '<p>T²/R³ constante: T<sub>A</sub>/T<sub>B</sub> = √(4³) = <b>8</b>.</p>']
  ],
  q: [
    ['Segundo a 2ª lei de Kepler, a velocidade de um planeta em sua órbita é', ['constante.', 'maior no afélio.', 'maior no periélio.', 'nula no afélio.'], 2, 'Áreas iguais em tempos iguais: perto do Sol o planeta precisa andar mais rápido.'],
    ['Pela 3ª lei de Kepler, se o raio médio da órbita de um planeta fosse 4 vezes maior, seu período ficaria', ['4 vezes maior.', '8 vezes maior.', '16 vezes maior.', '2 vezes maior.'], 1, 'T² ∝ R³ → T ∝ R^(3/2) = 4^(3/2) = 8.'],
    ['Se a distância entre dois corpos dobrar, a força gravitacional entre eles', ['dobra.', 'cai pela metade.', 'fica 4 vezes menor.', 'fica 4 vezes maior.'], 2, 'F ∝ 1/d²: (1/2)² = 1/4.'],
    ['Se as duas massas dobrarem e a distância também dobrar, a força gravitacional', ['não se altera.', 'dobra.', 'quadruplica.', 'cai pela metade.'], 0, 'F\' = G(2M)(2m)/(2d)² = 4/4 · F = F.'],
    ['Um planeta tem o dobro da massa e o dobro do raio da Terra (g = 10 m/s²). A gravidade na sua superfície é', ['5 m/s²', '10 m/s²', '20 m/s²', '40 m/s²'], 0, 'g\' = 2/2² · 10 = 5 m/s².'],
    ['Astronautas parecem flutuar dentro da estação espacial porque', ['lá não existe gravidade.', 'eles e a estação estão em queda livre ao redor da Terra.', 'a estação tem um campo magnético.', 'o vácuo anula o peso.'], 1, 'A gravidade lá ainda é cerca de 90% da superfície; todos caem juntos (imponderabilidade).'],
    ['Um satélite geoestacionário tem período de', ['1 h', '12 h', '24 h', '365 dias'], 2, 'Ele acompanha a rotação da Terra: 24 h.'],
    ['A uma altura igual ao raio da Terra, acima da superfície, a aceleração da gravidade vale', ['g', 'g/2', 'g/4', '2g'], 2, 'A distância ao centro dobra: g\' = g/2² = g/4.'],
    ['Segundo a 1ª lei de Kepler, as órbitas dos planetas são', ['circunferências com o Sol no centro.', 'elipses com o Sol num dos focos.', 'parábolas.', 'retas.'], 1, 'Lei das órbitas elípticas.'],
    ['Dois satélites orbitam a Terra em raios diferentes. É mais rápido o satélite', ['de maior massa.', 'de menor massa.', 'de órbita mais próxima da Terra.', 'de órbita mais afastada.'], 2, 'v = √(GM/r): menor r, maior v. A massa do satélite não influi.']
  ],
  fc: [
    ['1ª lei de Kepler', 'Órbitas elípticas, Sol num foco.'],
    ['2ª lei de Kepler', 'Áreas iguais em tempos iguais: mais rápido no periélio.'],
    ['3ª lei de Kepler', 'T²/R³ = constante.'],
    ['Lei da gravitação', 'F = GMm/d²'],
    ['Gravidade na superfície', 'g = GM/R²'],
    ['Velocidade orbital', 'v = √(GM/r), independe da massa do satélite.'],
    ['Satélite geoestacionário', 'Período de 24 h.'],
    ['Distância dobra', 'Força gravitacional cai para 1/4.']
  ]
});

EEAR.add({
  id: 'FIS09', m: 'fis', n: 9, t: 'Estática: equilíbrio do ponto e do corpo extenso', peso: 2, h: 2,
  teoria: `
<h3>Equilíbrio do ponto material</h3>
<p>Resultante nula: ΣF = 0. Com três forças, elas formam um triângulo fechado. Em fios simétricos que sustentam um peso P, cada fio fazendo ângulo θ com a vertical: 2·T·cos θ = P.</p>
<h3>Momento (torque)</h3>
<div class="f">M = F · d   (d = distância perpendicular do eixo à linha de ação da força)</div>
<p>Força aplicada no próprio eixo não gera momento. Quanto maior o braço, menor a força necessária para o mesmo momento (por isso chaves de roda longas facilitam).</p>
<h3>Equilíbrio do corpo extenso</h3>
<div class="f">ΣF = 0 (não translada)   e   ΣM = 0 (não gira) em relação a qualquer ponto</div>
<p>Escolha como polo o ponto onde há uma força desconhecida: ela some da equação dos momentos.</p>
<h3>Alavancas</h3>
<div class="tbl"><table><tbody>
<tr><td>Interfixa (apoio no meio)</td><td>gangorra, tesoura, alicate</td></tr>
<tr><td>Inter-resistente (resistência no meio)</td><td>carrinho de mão, quebra-nozes, abridor de garrafa</td></tr>
<tr><td>Interpotente (força no meio)</td><td>pinça, braço humano (antebraço), vara de pescar</td></tr>
</tbody></table></div>
<div class="f">Gangorra / alavanca: F₁ · d₁ = F₂ · d₂</div>
<h3>Centro de massa</h3>
<div class="f">x<sub>CM</sub> = (m₁x₁ + m₂x₂ + …)/(m₁ + m₂ + …)</div>
<p>Barra homogênea: o peso atua no ponto médio.</p>
<p class="dica">Nos problemas de barra apoiada, comece pelos momentos em torno de um apoio; depois use ΣF = 0 para achar o outro.</p>`,
  ex: [
    ['Uma criança de 30 kg senta a 2 m do apoio de uma gangorra. Onde deve sentar outra de 40 kg para equilibrar?', '<p>30·2 = 40·x → <b>x = 1,5 m</b> do apoio, do outro lado.</p>'],
    ['Uma barra homogênea de 4 m e 200 N está apoiada nas extremidades A e B. Um peso de 400 N está a 1 m de A. Calcule as reações.', '<p>Momentos em A: R<sub>B</sub>·4 = 200·2 + 400·1 → R<sub>B</sub> = 200 N. R<sub>A</sub> = 600 − 200 = <b>400 N</b>.</p>'],
    ['Um quadro de 80 N é sustentado por dois fios, cada um a 60° da vertical. Qual a tração em cada fio?', '<p>2T·cos 60° = 80 → T = <b>80 N</b>.</p>']
  ],
  q: [
    ['Uma força de 20 N é aplicada perpendicularmente na ponta de uma chave de 0,5 m. O momento em relação ao eixo é', ['10 N·m', '40 N·m', '20,5 N·m', '0,025 N·m'], 0, 'M = F·d = 20·0,5 = 10 N·m.'],
    ['Numa gangorra, uma criança de 30 kg está a 2 m do apoio. Para equilibrar, uma criança de 40 kg deve sentar, do outro lado, a', ['1,0 m', '1,5 m', '2,0 m', '2,7 m'], 1, '30·2 = 40·x → x = 1,5 m.'],
    ['Um peso de 100 N está pendurado por dois fios iguais, cada um formando 60° com a vertical. A tração em cada fio é', ['50 N', '100 N', '200 N', '50√3 N'], 1, '2T·cos 60° = 100 → T = 100 N.'],
    ['O carrinho de mão é um exemplo de alavanca', ['interfixa.', 'interpotente.', 'inter-resistente.', 'sem apoio.'], 2, 'A carga (resistência) fica entre o apoio (roda) e a força (mãos).'],
    ['Uma barra homogênea de 2 m e 100 N está apoiada nas pontas A e B. Uma carga de 200 N está a 0,5 m de A. A reação no apoio A é', ['100 N', '150 N', '200 N', '250 N'], 2, 'Em A: R_B·2 = 100·1 + 200·0,5 → R_B = 100 N. R_A = 300 − 100 = 200 N.'],
    ['Para um corpo extenso estar em equilíbrio, é necessário que', ['apenas a resultante das forças seja nula.', 'apenas a soma dos momentos seja nula.', 'a resultante das forças e a soma dos momentos sejam nulas.', 'não haja forças atuando.'], 2, 'Equilíbrio de translação (ΣF = 0) e de rotação (ΣM = 0).'],
    ['Usar uma chave de roda com cabo mais longo facilita soltar o parafuso porque', ['aumenta a força aplicada.', 'aumenta o braço, exigindo menos força para o mesmo momento.', 'diminui o momento.', 'reduz o atrito.'], 1, 'M = F·d: com d maior, F pode ser menor.'],
    ['Um ponto material está em equilíbrio sob três forças. Duas são perpendiculares, de 30 N e 40 N. A terceira mede', ['10 N', '50 N', '70 N', '35 N'], 1, 'Ela equilibra a resultante das outras: √(900 + 1600) = 50 N.'],
    ['Massas de 2 kg em x = 0 e 3 kg em x = 5 m. O centro de massa está em', ['x = 2 m', 'x = 2,5 m', 'x = 3 m', 'x = 3,5 m'], 2, 'x = (0 + 15)/5 = 3 m.'],
    ['Uma força aplicada exatamente sobre o eixo de rotação produz momento', ['máximo.', 'nulo.', 'igual à força.', 'negativo.'], 1, 'd = 0 → M = 0.']
  ],
  fc: [
    ['Momento de uma força', 'M = F·d (d perpendicular ao eixo).'],
    ['Equilíbrio do corpo extenso', 'ΣF = 0 e ΣM = 0.'],
    ['Alavanca interfixa', 'Apoio no meio: gangorra, tesoura.'],
    ['Alavanca inter-resistente', 'Resistência no meio: carrinho de mão.'],
    ['Alavanca interpotente', 'Força no meio: pinça.'],
    ['Gangorra em equilíbrio', 'F₁·d₁ = F₂·d₂'],
    ['Centro de massa', 'Média ponderada das posições pelas massas.'],
    ['Dois fios simétricos sustentando P', '2T·cos θ = P (θ com a vertical).']
  ]
});

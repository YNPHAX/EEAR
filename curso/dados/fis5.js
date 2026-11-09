/* Física — módulo 18 */
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

/* Língua Inglesa — módulos 1 a 4 */
EEAR.add({
  id: 'ING01', m: 'ing', n: 1, t: 'Reading: estratégias de leitura e vocabulário', peso: 3, h: 3,
  teoria: `
<p>Boa parte das questões de inglês da EEAR é de interpretação de textos curtos (notícias, curiosidades, textos sobre aviação e tecnologia). Você não precisa entender cada palavra: precisa achar a informação pedida.</p>
<h3>Estratégias</h3>
<ul>
<li><b>Skimming</b>: leitura rápida para captar a ideia geral (título, primeira e última frase de cada parágrafo).</li>
<li><b>Scanning</b>: busca de uma informação específica (data, número, nome). Leia a pergunta primeiro e procure a palavra-chave no texto.</li>
<li><b>Prediction</b>: use título, imagens e fonte para prever o assunto.</li>
<li><b>Cognatos</b>: palavras parecidas com o português e de mesmo sentido: <i>important, technology, airport, necessary</i>.</li>
<li><b>Contexto</b>: deduza a palavra desconhecida pelo que está ao redor.</li>
<li><b>Palavras de referência</b>: pronomes como <i>it, they, this, which</i> retomam termos anteriores. Perguntas do tipo "the word <i>it</i> refers to…" são frequentes.</li>
</ul>
<h3>Falsos cognatos (false friends)</h3>
<div class="tbl"><table><tbody>
<tr><td>actually = na verdade</td><td>pretend = fingir</td><td>push = empurrar</td></tr>
<tr><td>library = biblioteca</td><td>college = faculdade</td><td>parents = pais</td></tr>
<tr><td>eventually = finalmente, por fim</td><td>sensible = sensato</td><td>sensitive = sensível</td></tr>
<tr><td>realize = perceber</td><td>attend = frequentar, comparecer</td><td>argument = discussão</td></tr>
<tr><td>novel = romance</td><td>prejudice = preconceito</td><td>fabric = tecido</td></tr>
<tr><td>lunch = almoço</td><td>costume = fantasia, traje</td><td>exquisite = requintado</td></tr>
<tr><td>resume = retomar</td><td>assist = ajudar</td><td>intend = pretender</td></tr>
</tbody></table></div>
<h3>Conectivos que guiam a leitura</h3>
<ul>
<li>Adição: <i>and, also, moreover, furthermore, in addition</i>.</li>
<li>Contraste: <i>but, however, although, though, whereas, nevertheless</i>.</li>
<li>Causa e consequência: <i>because, since, due to, so, therefore, as a result</i>.</li>
<li>Exemplo: <i>for example, for instance, such as</i>.</li>
</ul>
<h3>Vocabulário técnico e de aviação</h3>
<p><i>aircraft</i> (aeronave), <i>runway</i> (pista), <i>take off</i> (decolar), <i>land</i> (pousar), <i>control tower</i> (torre de controle), <i>clearance</i> (autorização), <i>flight</i> (voo), <i>crew</i> (tripulação), <i>delay</i> (atraso), <i>fuel</i> (combustível), <i>weather</i> (tempo meteorológico).</p>
<p class="dica">Leia as perguntas antes do texto. Nas questões de referência, volte ao trecho e substitua o pronome pelas alternativas: a que mantém o sentido é a correta.</p>`,
  ex: [
    ['"The pilot checked the instruments before the flight. They were working perfectly." What does "They" refer to?', '<p>"They" retoma <b>the instruments</b> (os instrumentos estavam funcionando perfeitamente).</p>'],
    ['Qual o sentido de "eventually" em "The flight was delayed, but we eventually arrived"?', '<p><b>Finalmente, por fim</b>. Não significa "eventualmente".</p>'],
    ['Que relação "however" estabelece em "The weather was bad. However, the plane took off"?', '<p><b>Contraste</b> (no entanto): apesar do mau tempo, o avião decolou.</p>']
  ],
  q: [
    ['<div class="txt">Air traffic controllers work in towers and radar centers. Their main job is to keep aircraft safely separated, both in the air and on the ground.</div>According to the text, the main job of air traffic controllers is to', ['repair aircraft engines.', 'keep aircraft at a safe distance from each other.', 'sell tickets at the airport.', 'train new pilots.'], 1, '"Keep aircraft safely separated" = manter as aeronaves separadas com segurança.'],
    ['In the sentence "He pretended to be asleep", the word "pretended" means', ['pretendeu', 'fingiu', 'tentou', 'preferiu'], 1, '"Pretend" é falso cognato: significa fingir. "Pretender" em inglês é "intend".'],
    ['<div class="txt">Santos Dumont flew the 14-bis in Paris in 1906. It was one of the first powered flights in Europe.</div>The word "It" refers to', ['Paris.', 'Europe.', 'the flight of the 14-bis.', 'Santos Dumont.'], 2, '"It" retoma o voo do 14-bis, que foi um dos primeiros voos motorizados da Europa.'],
    ['"Actually, the exam is on Sunday, not on Saturday." The word "Actually" can be translated as', ['atualmente', 'na verdade', 'eventualmente', 'rapidamente'], 1, '"Actually" = na verdade. "Atualmente" em inglês é "nowadays" ou "currently".'],
    ['<div class="txt">Although the runway was wet, the crew landed the aircraft smoothly.</div>The word "Although" expresses', ['addition.', 'contrast.', 'time.', 'example.'], 1, '"Although" (embora) introduz contraste: mesmo com a pista molhada, o pouso foi suave.'],
    ['Reading a text quickly only to get its general idea is called', ['scanning.', 'skimming.', 'translating.', 'predicting.'], 1, 'Skimming é a leitura rápida para captar a ideia geral. Scanning é a busca de informação específica.'],
    ['Which word is a false friend?', ['airport', 'technology', 'library', 'important'], 2, '"Library" significa biblioteca, não livraria (bookstore). As outras são cognatos verdadeiros.'],
    ['<div class="txt">The flight was delayed due to heavy fog. Passengers waited for three hours.</div>Why was the flight delayed?', ['Because of a strike.', 'Because of heavy fog.', 'Because the pilot was late.', 'Because of a technical problem.'], 1, '"Due to heavy fog" = por causa de neblina densa.'],
    ['In the sentence "She realized she had lost her passport", "realized" means', ['realizou', 'percebeu', 'perdeu', 'procurou'], 1, '"Realize" é falso cognato: perceber, dar-se conta.'],
    ['<div class="txt">Drones are becoming popular. For instance, farmers use them to monitor crops.</div>"For instance" introduces', ['a conclusion.', 'a contrast.', 'an example.', 'a cause.'], 2, '"For instance" = por exemplo.']
  ],
  fc: [
    ['Skimming x scanning', 'Skimming: ideia geral. Scanning: informação específica.'],
    ['actually / eventually', 'Na verdade / finalmente, por fim.'],
    ['pretend / intend', 'Fingir / pretender.'],
    ['library / bookstore', 'Biblioteca / livraria.'],
    ['realize / attend', 'Perceber / frequentar, comparecer.'],
    ['Conectivos de contraste', 'But, however, although, though, whereas, nevertheless.'],
    ['runway / take off / land', 'Pista / decolar / pousar.'],
    ['sensible / sensitive', 'Sensato / sensível.']
  ]
});

EEAR.add({
  id: 'ING02', m: 'ing', n: 2, t: 'Substantivos e artigos', peso: 2, h: 2,
  teoria: `
<h3>Gênero e substantivos compostos</h3>
<p>Em inglês, muitos substantivos de profissão não mudam conforme o gênero: <i>pilot, teacher, doctor, student</i>. Quando a distinção é necessária, o contexto ou palavras como <i>man/woman</i> costumam resolver. Em substantivos compostos, o plural normalmente recai sobre o núcleo: <i>air traffic controllers, boarding passes</i>; em estruturas como <i>mother-in-law</i>, pluraliza-se o núcleo: <i>mothers-in-law</i>.</p>
<h3>Plural dos substantivos</h3>
<ul>
<li>Regra geral: + <b>s</b> (book → books).</li>
<li>Terminados em s, ss, sh, ch, x, z, o: + <b>es</b> (bus → buses, box → boxes, watch → watches, potato → potatoes). Exceções com o: photos, pianos, radios.</li>
<li>Consoante + y → <b>ies</b> (city → cities). Vogal + y → s (boy → boys).</li>
<li>f/fe → <b>ves</b> (knife → knives, leaf → leaves, wife → wives). Exceções: roofs, chiefs.</li>
<li>Irregulares: man → <b>men</b>, woman → <b>women</b>, child → <b>children</b>, foot → <b>feet</b>, tooth → <b>teeth</b>, mouse → <b>mice</b>, goose → <b>geese</b>, person → <b>people</b>, ox → oxen.</li>
<li>Iguais no singular e plural: <b>sheep, fish, deer, aircraft, series, species</b>.</li>
</ul>
<h3>Contáveis e incontáveis</h3>
<p>Incontáveis não têm plural nem usam <i>a/an</i>: <b>information, advice, news, money, furniture, luggage, baggage, equipment, homework, knowledge, water, bread</b>. Para contar: <i>a piece of advice, two pieces of furniture</i>. "News" leva verbo no singular: <i>The news <b>is</b> good.</i></p>
<h3>Caso genitivo (posse)</h3>
<ul>
<li>Singular: <b>'s</b> — <i>the pilot's helmet</i>.</li>
<li>Plural terminado em s: só o apóstrofo — <i>the pilots' helmets</i>.</li>
<li>Plural irregular: <b>'s</b> — <i>the children's toys</i>.</li>
<li>Posse compartilhada: só no último — <i>John and Mary's house</i>. Posse individual: nos dois — <i>John's and Mary's cars</i>.</li>
<li>Para coisas, em geral usa-se <b>of</b>: <i>the door of the hangar</i>.</li>
</ul>
<h3>Artigos</h3>
<ul>
<li><b>a</b> antes de som de consoante, <b>an</b> antes de som de vogal: <i>a car, a university</i> (som /ju/), <i>a European</i>; <i>an hour</i> (h mudo), <i>an apple, an MBA</i> (som /em/).</li>
<li><b>the</b>: algo específico ou já mencionado, coisas únicas (<i>the sun</i>), instrumentos musicais (<i>play the guitar</i>), oceanos, rios, países com plural ou "republic/kingdom" (<i>the USA, the United Kingdom, the Netherlands</i>).</li>
<li><b>Sem artigo</b>: generalizações com plural ou incontável (<i>Dogs are loyal. Money is important.</i>), idiomas, esportes, refeições, a maioria dos países e cidades (<i>Brazil, Paris</i>), <i>go to school / to bed / to work</i>.</li>
</ul>
<p class="dica">"A" ou "an" depende do som, não da letra: a university, an hour, an honest man, a one-way ticket.</p>`,
  ex: [
    ['Qual o plural de "child", "tooth" e "aircraft"?', '<p><b>children</b>, <b>teeth</b> e <b>aircraft</b> (igual no singular e no plural).</p>'],
    ['Complete: "She gave me ___ advice" com "an" ou "some"?', '<p>"Advice" é incontável: "She gave me <b>some</b> advice" (ou "a piece of advice").</p>'],
    ['"The students\' rooms" ou "The student\'s rooms"?', '<p>Se são vários estudantes: <b>the students\' rooms</b> (plural terminado em s leva só o apóstrofo).</p>']
  ],
  q: [
    ['Choose the correct plural forms.', ['childs, foots, mouses', 'children, feet, mice', 'childrens, feets, mices', 'children, foots, mice'], 1, 'Plurais irregulares: child → children, foot → feet, mouse → mice.'],
    ['Choose the correct sentence.', ['I need an information.', 'I need some informations.', 'I need some information.', 'I need a informations.'], 2, '"Information" é incontável: não tem plural nem usa "an".'],
    ['Choose the alternative with the correct article: "It took me ___ hour to get to ___ university."', ['a / an', 'an / a', 'an / an', 'a / a'], 1, '"Hour" começa com som de vogal (h mudo): an hour. "University" começa com som /ju/: a university.'],
    ['"The ___ uniforms are blue." (more than one pilot)', ["pilot's", "pilots'", "pilots's", 'pilots'], 1, 'Plural terminado em s: só o apóstrofo: pilots\'.'],
    ['Which noun has the same form in the singular and in the plural?', ['plane', 'aircraft', 'airport', 'pilot'], 1, '"Aircraft" não muda no plural: one aircraft, two aircraft.'],
    ['Choose the correct sentence.', ['The news are good.', 'The news is good.', 'The newses are good.', 'A news is good.'], 1, '"News" é incontável e leva verbo no singular.'],
    ['In which alternative is the article used correctly?', ['She plays the piano very well.', 'I live in the Brazil.', 'The dogs are loyal animals (in general).', 'He speaks the English fluently.'], 0, 'Instrumentos musicais levam "the". Países como Brazil, idiomas e generalizações no plural não levam artigo.'],
    ['The plural of "knife" and "city" is', ['knifes / citys', 'knives / cities', 'knives / citys', 'knifes / cities'], 1, 'f/fe → ves (knives); consoante + y → ies (cities).'],
    ['"We bought two ___ of furniture for the office."', ['furnitures', 'pieces', 'piece', 'items furniture'], 1, '"Furniture" é incontável; para contar usa-se "pieces of furniture".'],
    ['"This is John and Mary\'s car." This sentence means that', ['John and Mary have one car together.', 'John and Mary have different cars.', 'only Mary has a car.', 'John has two cars.'], 0, 'O \'s só no último nome indica posse compartilhada: um carro dos dois.']
  ],
  fc: [
    ['Plural de man, woman, child', 'Men, women, children.'],
    ['Plural de foot, tooth, mouse', 'Feet, teeth, mice.'],
    ['Substantivos iguais no plural', 'Sheep, fish, deer, aircraft, series.'],
    ['Incontáveis comuns', 'Information, advice, news, money, furniture, luggage, equipment.'],
    ['a ou an?', 'Pelo som: a university, an hour.'],
    ['Genitivo no plural com s', 'Só o apóstrofo: the pilots\' room.'],
    ['Quando não usar artigo', 'Generalizações no plural, idiomas, esportes, refeições, a maioria dos países.']
  ]
});

EEAR.add({
  id: 'ING03', m: 'ing', n: 3, t: 'Pronomes', peso: 2, h: 2,
  teoria: `
<h3>Quadro dos pronomes pessoais</h3>
<div class="tbl"><table><thead><tr><th>Subject</th><th>Object</th><th>Possessive adjective</th><th>Possessive pronoun</th><th>Reflexive</th></tr></thead><tbody>
<tr><td>I</td><td>me</td><td>my</td><td>mine</td><td>myself</td></tr>
<tr><td>you</td><td>you</td><td>your</td><td>yours</td><td>yourself / yourselves</td></tr>
<tr><td>he</td><td>him</td><td>his</td><td>his</td><td>himself</td></tr>
<tr><td>she</td><td>her</td><td>her</td><td>hers</td><td>herself</td></tr>
<tr><td>it</td><td>it</td><td>its</td><td>—</td><td>itself</td></tr>
<tr><td>we</td><td>us</td><td>our</td><td>ours</td><td>ourselves</td></tr>
<tr><td>they</td><td>them</td><td>their</td><td>theirs</td><td>themselves</td></tr>
</tbody></table></div>
<ul>
<li><b>Subject</b> faz a ação: <i><b>She</b> flies.</i> <b>Object</b> recebe a ação ou vem depois de preposição: <i>Call <b>her</b>. With <b>us</b>.</i></li>
<li><b>Possessive adjective</b> vem antes do substantivo: <i><b>my</b> book</i>. <b>Possessive pronoun</b> substitui o substantivo: <i>The book is <b>mine</b>.</i></li>
<li><b>Its</b> (possessivo) ≠ <b>it's</b> (it is). <b>Their</b> ≠ <b>there</b> ≠ <b>they're</b>.</li>
<li><b>Reflexive</b>: a ação volta para o sujeito (<i>He hurt <b>himself</b></i>) ou dá ênfase (<i>I did it <b>myself</b></i>). <b>By myself</b> = sozinho.</li>
<li><b>Each other / one another</b>: reciprocidade: <i>They looked at <b>each other</b>.</i></li>
</ul>
<h3>Demonstrativos</h3>
<p><b>this / these</b> (perto), <b>that / those</b> (longe).</p>
<h3>Indefinidos</h3>
<div class="tbl"><table><tbody>
<tr><td>some-</td><td>afirmativas e ofertas/pedidos: <i>somebody, something, somewhere. Would you like some coffee?</i></td></tr>
<tr><td>any-</td><td>negativas e perguntas: <i>I didn't see anybody. Is there anything?</i> Em afirmativas = qualquer: <i>Take any seat.</i></td></tr>
<tr><td>no-</td><td>sentido negativo com verbo afirmativo: <i>Nobody came. There is nothing here.</i></td></tr>
<tr><td>every-</td><td>todos: <i>Everybody is here</i> (verbo no singular).</td></tr>
</tbody></table></div>
<h3>Pronomes relativos</h3>
<ul>
<li><b>who</b>: pessoas (sujeito). <b>whom</b>: pessoas (objeto, formal; obrigatório depois de preposição: <i>to whom</i>).</li>
<li><b>which</b>: coisas e animais. <b>that</b>: pessoas ou coisas, só em orações restritivas (sem vírgula).</li>
<li><b>whose</b>: posse (cujo): <i>The pilot <b>whose</b> plane was damaged…</i></li>
<li><b>where</b>: lugar. <b>when</b>: tempo.</li>
<li>Em orações explicativas (entre vírgulas) não se usa <b>that</b>: <i>Paris, <b>which</b> is beautiful, …</i></li>
</ul>
<h3>Pronomes e advérbios interrogativos</h3>
<ul>
<li><b>who</b> (quem), <b>whom</b> (quem, objeto formal), <b>whose</b> (de quem), <b>what</b> (o quê/qual) e <b>which</b> (qual entre opções).</li>
<li><b>where</b> (onde), <b>when</b> (quando), <b>why</b> (por quê) e <b>how</b> (como).</li>
<li>Combinações frequentes: <b>how many</b> (contáveis), <b>how much</b> (incontáveis/preço), <b>how long</b> (duração/comprimento), <b>how often</b> (frequência) e <b>how far</b> (distância).</li>
</ul>
<p class="dica">Nas questões de pronome, olhe a função: antes de substantivo vai possessive adjective (my, your); sozinho no fim vai possessive pronoun (mine, yours).</p>`,
  ex: [
    ['Complete: "This is not my pen. ___ is on the table."', '<p><b>Mine</b>: o pronome substitui "my pen".</p>'],
    ['Complete: "The man ___ car was stolen called the police."', '<p><b>whose</b>: indica posse (o homem cujo carro foi roubado).</p>'],
    ['"Its" ou "it\'s": "The airline changed ___ policy."', '<p><b>its</b> (possessivo). "It\'s" = it is.</p>']
  ],
  q: [
    ['"These tickets are not ___. ___ are in my bag."', ['our / Our', 'ours / Ours', 'our / Ours', 'ours / Our'], 1, 'Sem substantivo depois, usa-se o possessive pronoun: ours (os nossos).'],
    ['"The pilot ___ landed the plane was very experienced."', ['which', 'who', 'whose', 'where'], 1, 'Para pessoas como sujeito da oração relativa usa-se "who" (ou "that").'],
    ['Choose the correct sentence.', ['The company changed it\'s logo.', 'The company changed its logo.', 'The company changed their\'s logo.', 'The company changed it logo.'], 1, '"Its" é o possessivo de "it". "It\'s" = it is.'],
    ['"He cut ___ while he was cooking."', ['him', 'his', 'himself', 'he'], 2, 'A ação volta para o sujeito: reflexive pronoun himself.'],
    ['"Is there ___ in the hangar?" "No, there is ___."', ['somebody / anybody', 'anybody / nobody', 'nobody / anybody', 'everybody / somebody'], 1, 'Em perguntas usa-se any- (anybody); na resposta negativa com verbo afirmativo, no- (nobody).'],
    ['"The city ___ I was born is small."', ['which', 'where', 'who', 'whose'], 1, 'Para lugar usa-se "where" (onde).'],
    ['"Tell ___ the truth." (referring to Maria)', ['she', 'her', 'hers', 'herself'], 1, 'Depois do verbo, na função de objeto: her.'],
    ['"The two pilots greeted ___ before the flight."', ['themselves', 'each other', 'theirs', 'them'], 1, 'Ação recíproca (um cumprimentou o outro): each other.'],
    ['"This is the woman ___ son is a cadet."', ['who', 'whom', 'whose', 'which'], 2, 'Relação de posse (cujo filho): whose.'],
    ['"I did the project by ___." means that', ['I did it with friends.', 'I did it alone.', 'I did it for myself only.', 'I did not do it.'], 1, '"By myself" = sozinho, sem ajuda.'],
    ['"___ does the flight take from São Paulo to Recife?"', ['How long', 'How many', 'How much', 'How often'], 0, '"How long" pergunta duração.']
  ],
  fc: [
    ['my x mine', 'My + substantivo (my car). Mine sozinho (it is mine).'],
    ['its x it\'s', 'Its = dele/dela (coisa). It\'s = it is.'],
    ['who / which / whose', 'Pessoas / coisas / posse (cujo).'],
    ['Quando não usar "that"?', 'Em orações explicativas (com vírgulas) e depois de preposição.'],
    ['some x any', 'Some: afirmativas e ofertas. Any: negativas e perguntas.'],
    ['each other', 'Reciprocidade: um ao outro.'],
    ['by myself', 'Sozinho, sem ajuda.'],
    ['Reflexive de they', 'Themselves.'],
    ['How long / how often', 'Duração / frequência.']
  ]
});

EEAR.add({
  id: 'ING04', m: 'ing', n: 4, t: 'Adjetivos, advérbios e graus de comparação', peso: 2, h: 2.5,
  teoria: `
<h3>Adjetivos</h3>
<p>Não variam em gênero nem número (<i>a tall man, tall women</i>) e vêm antes do substantivo. Ordem quando há vários: <b>opinião – tamanho – idade – forma – cor – origem – material – finalidade</b>: <i>a beautiful small old round red Brazilian wooden dining table</i>.</p>
<h3>Sinônimos e antônimos</h3>
<p>A EEAR pode cobrar equivalência de sentido pelo contexto. Pares úteis: <i>big/large</i>, <i>begin/start</i>, <i>difficult/hard</i>, <i>quick/fast</i>; antônimos: <i>safe/dangerous</i>, <i>cheap/expensive</i>, <i>early/late</i>, <i>increase/decrease</i>. Confirme sempre pelo sentido da frase, não só por tradução isolada.</p>
<h3>Comparativo e superlativo</h3>
<div class="tbl"><table><thead><tr><th>Adjetivo</th><th>Comparativo</th><th>Superlativo</th></tr></thead><tbody>
<tr><td>curto (1 sílaba): fast</td><td>fast<b>er</b> than</td><td>the fast<b>est</b></td></tr>
<tr><td>terminado em e: large</td><td>larg<b>er</b></td><td>the larg<b>est</b></td></tr>
<tr><td>CVC: big, hot</td><td>big<b>ger</b>, hot<b>ter</b></td><td>the big<b>gest</b></td></tr>
<tr><td>2 sílabas terminado em y: easy</td><td>eas<b>ier</b></td><td>the eas<b>iest</b></td></tr>
<tr><td>longo: important</td><td><b>more</b> important than</td><td>the <b>most</b> important</td></tr>
</tbody></table></div>
<p><b>Irregulares</b>: good → better → the best; bad → worse → the worst; far → farther/further → the farthest/furthest; little → less → the least; much/many → more → the most.</p>
<ul>
<li>Igualdade: <b>as … as</b> (<i>as fast as</i>); negativa: <b>not as/so … as</b>.</li>
<li>Inferioridade: <b>less … than</b>.</li>
<li>Progressão: <b>the + comparativo, the + comparativo</b>: <i>The more you study, the better you get.</i></li>
<li>Crescimento: <i>bigger and bigger, more and more expensive</i>.</li>
</ul>
<h3>Advérbios</h3>
<ul>
<li>Formação: adjetivo + <b>ly</b> (quick → quickly; easy → easily; careful → carefully). Irregular: good → <b>well</b>.</li>
<li>Mesma forma: <i>fast, hard, late, early</i>. Atenção: <b>hardly</b> = quase não; <b>lately</b> = ultimamente.</li>
<li>Frequência (<i>always, usually, often, sometimes, rarely, never</i>): antes do verbo principal e depois do <i>to be</i>: <i>She <b>always</b> arrives early. He is <b>never</b> late.</i></li>
</ul>
<p class="dica">"Than" acompanha o comparativo; "the" acompanha o superlativo. "Good" é adjetivo (a good pilot); "well" é advérbio (he flies well).</p>`,
  ex: [
    ['Comparativo e superlativo de "heavy" e "bad".', '<p>heavy → <b>heavier</b> → <b>the heaviest</b>; bad → <b>worse</b> → <b>the worst</b>.</p>'],
    ['Posicione "always": "He is late." / "He arrives late."', '<p>"He is <b>always</b> late" (depois do be). "He <b>always</b> arrives late" (antes do verbo principal).</p>']
  ],
  q: [
    ['"The Boeing 747 is ___ than the Embraer 190."', ['big', 'bigger', 'biggest', 'more big'], 1, 'Adjetivo curto CVC: big → bigger than.'],
    ['"This is ___ exam I have ever taken."', ['the more difficult', 'the most difficult', 'most difficult', 'the difficultest'], 1, 'Adjetivo longo no superlativo: the most difficult.'],
    ['"My English is ___ than last year."', ['gooder', 'more good', 'better', 'best'], 2, 'Good é irregular: good → better → the best.'],
    ['Choose the correct sentence.', ['She speaks English very good.', 'She speaks English very well.', 'She speaks very well English.', 'She speaks English very goodly.'], 1, 'Para modificar o verbo "speaks" usa-se o advérbio "well", depois do objeto.'],
    ['"The more you practice, ___ you get."', ['the better', 'better', 'the best', 'more better'], 0, 'Estrutura de progressão: the + comparativo, the + comparativo.'],
    ['Choose the correct position of the adverb.', ['He never is late.', 'He is never late.', 'Never he is late.', 'He is late never.'], 1, 'Advérbios de frequência vêm depois do verbo to be.'],
    ['"She hardly studied for the test." This means that she', ['studied very hard.', 'almost didn\'t study.', 'studied every day.', 'studied a lot lately.'], 1, '"Hardly" = quase não. "Hard" é que significa "muito, com esforço".'],
    ['"Rio is not ___ cold ___ Curitiba in winter."', ['as / than', 'so / as', 'more / as', 'as / that'], 1, 'Igualdade negativa: not as/so … as.'],
    ['Choose the correct order of adjectives.', ['a red old big car', 'a big old red car', 'an old red big car', 'a red big old car'], 1, 'Ordem: tamanho (big) – idade (old) – cor (red).'],
    ['The word "dangerous" is the opposite of', ['safe', 'fast', 'large', 'late'], 0, '"Safe" é antônimo de "dangerous".']
  ],
  fc: [
    ['good / bad: comparativo e superlativo', 'Better, the best / worse, the worst.'],
    ['Comparativo de adjetivo longo', 'More … than (more important than).'],
    ['Igualdade', 'As … as (negativa: not as/so … as).'],
    ['hardly / lately', 'Quase não / ultimamente.'],
    ['Advérbio de good', 'Well.'],
    ['Posição do advérbio de frequência', 'Antes do verbo principal, depois do to be.'],
    ['The more…, the…', 'Quanto mais…, mais…: The more you study, the better you get.'],
    ['safe / dangerous', 'Seguro / perigoso: antônimos.']
  ]
});

/* Língua Inglesa, nível básico (Opção 1 do edital: demais especialidades): INGB01, INGB02, INGB03, INGB04, INGB05, INGB06, INGB07, INGB08, INGB09, INGB10, INGB11, INGB12, INGB13.
   Criadas como cópia de ING01 a ING13 por ferramentas/ingles/copiar.js ("de" diz a aula de origem). Daqui em diante
   este arquivo é editado sozinho: mudar uma aula aqui não muda a outra opção nem as aulas antigas. */
EEAR.add({
  id: 'INGB01', m: 'ing', nivel: 'basico', de: 'ING01', n: 1, t: 'Reading: estratégias de leitura e vocabulário', peso: 3, h: 3,
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
<h3>Vocabulário de aviação (útil para BCT)</h3>
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
  id: 'INGB02', m: 'ing', nivel: 'basico', de: 'ING02', n: 2, t: 'Substantivos e artigos', peso: 2, h: 2,
  teoria: `
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
    ['"The ___ uniforms are blue." (more than one pilot)', ['pilot\'s', 'pilots\'', 'pilots\'s', 'pilots'], 1, 'Plural terminado em s: só o apóstrofo: pilots\'.'],
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
  id: 'INGB03', m: 'ing', nivel: 'basico', de: 'ING03', n: 3, t: 'Pronomes', peso: 2, h: 2,
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
    ['"I did the project by ___." means that', ['I did it with friends.', 'I did it alone.', 'I did it for myself only.', 'I did not do it.'], 1, '"By myself" = sozinho, sem ajuda.']
  ],
  fc: [
    ['my x mine', 'My + substantivo (my car). Mine sozinho (it is mine).'],
    ['its x it\'s', 'Its = dele/dela (coisa). It\'s = it is.'],
    ['who / which / whose', 'Pessoas / coisas / posse (cujo).'],
    ['Quando não usar "that"?', 'Em orações explicativas (com vírgulas) e depois de preposição.'],
    ['some x any', 'Some: afirmativas e ofertas. Any: negativas e perguntas.'],
    ['each other', 'Reciprocidade: um ao outro.'],
    ['by myself', 'Sozinho, sem ajuda.'],
    ['Reflexive de they', 'Themselves.']
  ]
});
EEAR.add({
  id: 'INGB04', m: 'ing', nivel: 'basico', de: 'ING04', n: 4, t: 'Adjetivos, advérbios e graus de comparação', peso: 2, h: 2.5,
  teoria: `
<h3>Adjetivos</h3>
<p>Não variam em gênero nem número (<i>a tall man, tall women</i>) e vêm antes do substantivo. Ordem quando há vários: <b>opinião – tamanho – idade – forma – cor – origem – material – finalidade</b>: <i>a beautiful small old round red Brazilian wooden dining table</i>.</p>
<p><b>-ed x -ing</b>: <i>bored</i> (entediado, como a pessoa se sente) x <i>boring</i> (entediante, o que causa). Também: interested/interesting, tired/tiring, excited/exciting.</p>
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
    ['Complete: "The movie was ___ (bore). I was ___ (bore)."', '<p>"The movie was <b>boring</b>" (causa). "I was <b>bored</b>" (sentimento).</p>'],
    ['Posicione "always": "He is late." / "He arrives late."', '<p>"He is <b>always</b> late" (depois do be). "He <b>always</b> arrives late" (antes do verbo principal).</p>']
  ],
  q: [
    ['"The Boeing 747 is ___ than the Embraer 190."', ['big', 'bigger', 'biggest', 'more big'], 1, 'Adjetivo curto CVC: big → bigger than.'],
    ['"This is ___ exam I have ever taken."', ['the more difficult', 'the most difficult', 'most difficult', 'the difficultest'], 1, 'Adjetivo longo no superlativo: the most difficult.'],
    ['"My English is ___ than last year."', ['gooder', 'more good', 'better', 'best'], 2, 'Good é irregular: good → better → the best.'],
    ['Choose the correct sentence.', ['She speaks English very good.', 'She speaks English very well.', 'She speaks very well English.', 'She speaks English very goodly.'], 1, 'Para modificar o verbo "speaks" usa-se o advérbio "well", depois do objeto.'],
    ['"The class was so ___ that everybody felt ___."', ['bored / boring', 'boring / bored', 'boring / boring', 'bored / bored'], 1, 'A aula causa tédio (boring); as pessoas sentem tédio (bored).'],
    ['"The more you practice, ___ you get."', ['the better', 'better', 'the best', 'more better'], 0, 'Estrutura de progressão: the + comparativo, the + comparativo.'],
    ['Choose the correct position of the adverb.', ['He never is late.', 'He is never late.', 'Never he is late.', 'He is late never.'], 1, 'Advérbios de frequência vêm depois do verbo to be.'],
    ['"She hardly studied for the test." This means that she', ['studied very hard.', 'almost didn\'t study.', 'studied every day.', 'studied a lot lately.'], 1, '"Hardly" = quase não. "Hard" é que significa "muito, com esforço".'],
    ['"Rio is not ___ cold ___ Curitiba in winter."', ['as / than', 'so / as', 'more / as', 'as / that'], 1, 'Igualdade negativa: not as/so … as.'],
    ['Choose the correct order of adjectives.', ['a red old big car', 'a big old red car', 'an old red big car', 'a red big old car'], 1, 'Ordem: tamanho (big) – idade (old) – cor (red).']
  ],
  fc: [
    ['good / bad: comparativo e superlativo', 'Better, the best / worse, the worst.'],
    ['Comparativo de adjetivo longo', 'More … than (more important than).'],
    ['Igualdade', 'As … as (negativa: not as/so … as).'],
    ['bored x boring', 'Bored: como a pessoa se sente. Boring: o que causa o tédio.'],
    ['hardly / lately', 'Quase não / ultimamente.'],
    ['Advérbio de good', 'Well.'],
    ['Posição do advérbio de frequência', 'Antes do verbo principal, depois do to be.'],
    ['The more…, the…', 'Quanto mais…, mais…: The more you study, the better you get.']
  ]
});
EEAR.add({
  id: 'INGB05', m: 'ing', nivel: 'basico', de: 'ING05', n: 5, t: 'Presente: simple, continuous e there to be', peso: 3, h: 2.5,
  teoria: `
<h3>Simple present</h3>
<p>Hábitos, rotinas, verdades gerais, horários fixos: <i>The sun <b>rises</b> in the east. The flight <b>leaves</b> at 9.</i></p>
<ul>
<li>3ª pessoa do singular (he, she, it) recebe <b>-s</b>: works, flies.</li>
<li>Terminados em s, sh, ch, x, o: <b>-es</b> (watches, goes, does). Consoante + y: <b>-ies</b> (studies, flies). Vogal + y: -s (plays). <i>have → has</i>.</li>
<li>Negativa e pergunta com <b>do/does</b> + verbo na forma base: <i>She <b>doesn't</b> work. <b>Does</b> she work?</i> (o -s vai para o auxiliar).</li>
<li>Palavras-chave: always, usually, often, sometimes, never, every day.</li>
</ul>
<h3>Present continuous</h3>
<p><b>am/is/are + verbo-ing</b>: ação acontecendo agora ou num período atual, e planos combinados para o futuro: <i>I <b>am studying</b> now. We <b>are flying</b> to Recife tomorrow.</i></p>
<ul>
<li>Formação do -ing: make → making; run → running (CVC dobra); lie → lying; study → studying.</li>
<li>Palavras-chave: now, right now, at the moment, look!, listen!, these days.</li>
<li><b>Stative verbs</b> (estado, não ação) não costumam ir para o continuous: <i>know, like, love, want, need, believe, understand, belong, seem</i>. Diz-se <i>I <b>know</b> the answer</i>, não "I am knowing".</li>
</ul>
<h3>There to be</h3>
<p>Existir/haver: <b>there is</b> + singular ou incontável, <b>there are</b> + plural: <i>There is a plane on the runway. There are two pilots.</i> Passado: there was / there were. Negativa: there isn't / there aren't. Pergunta: Is there…? / Are there…?</p>
<p class="dica">Olhe o advérbio de tempo: "every day" pede simple present; "now/at the moment" pede continuous. E lembre: depois de does/doesn't o verbo perde o -s.</p>`,
  ex: [
    ['Complete: "She ___ (study) every night, but tonight she ___ (watch) a movie."', '<p>"She <b>studies</b> every night, but tonight she <b>is watching</b> a movie."</p>'],
    ['Passe para a negativa e para a interrogativa: "He flies helicopters."', '<p>"He <b>doesn\'t fly</b> helicopters." / "<b>Does</b> he <b>fly</b> helicopters?"</p>'],
    ['"There ___ some water and two bottles on the table."', '<p>Com dois itens, a concordância costuma ser com o primeiro: "There <b>is</b> some water and two bottles". Se a ordem fosse "two bottles and some water", seria "There are".</p>']
  ],
  q: [
    ['"My brother ___ in a bank and ___ English at night."', ['work / study', 'works / studies', 'works / studys', 'working / studying'], 1, '3ª pessoa do singular: works; consoante + y → studies.'],
    ['"___ she speak French?" "No, she ___."', ['Do / don\'t', 'Does / doesn\'t', 'Is / isn\'t', 'Does / don\'t'], 1, 'Com she, o auxiliar é does; a resposta curta negativa é doesn\'t.'],
    ['"Look! The plane ___ off right now."', ['takes', 'took', 'is taking', 'take'], 2, '"Look!" e "right now" indicam ação em andamento: present continuous.'],
    ['Choose the correct sentence.', ['I am knowing the answer.', 'I know the answer.', 'I knowing the answer.', 'I am know the answer.'], 1, '"Know" é stative verb: não se usa no continuous.'],
    ['"There ___ many passengers on the flight yesterday."', ['is', 'are', 'was', 'were'], 3, 'Passado com plural: there were.'],
    ['"He ___ to the gym every Monday."', ['go', 'goes', 'is going always', 'going'], 1, 'Rotina com "every Monday" e sujeito he: goes.'],
    ['The -ing form of "run", "make" and "lie" is', ['runing, makeing, lieing', 'running, making, lying', 'running, makking, lying', 'runing, making, liing'], 1, 'run dobra o n (CVC), make perde o e, lie vira lying.'],
    ['"She doesn\'t ___ coffee in the morning."', ['drinks', 'drink', 'drinking', 'to drink'], 1, 'Depois de doesn\'t o verbo fica na forma base.'],
    ['"___ there any messages for me?"', ['Is', 'Are', 'Do', 'Does'], 1, '"Messages" é plural: Are there…?'],
    ['"We ___ to Natal next Friday. We already have the tickets."', ['fly', 'are flying', 'flies', 'flown'], 1, 'Plano já combinado para o futuro: present continuous.']
  ],
  fc: [
    ['Simple present: uso', 'Hábitos, rotinas, verdades gerais, horários.'],
    ['Simple present: 3ª pessoa', 'Recebe -s/-es/-ies: works, watches, studies.'],
    ['Auxiliar do simple present', 'Do / does (o verbo volta para a forma base).'],
    ['Present continuous: estrutura', 'Am/is/are + verbo-ing.'],
    ['Stative verbs', 'Know, like, want, need, believe, understand: sem -ing.'],
    ['There is x there are', 'Is: singular ou incontável. Are: plural.'],
    ['Present continuous para o futuro', 'Planos já combinados: We are flying tomorrow.']
  ]
});
EEAR.add({
  id: 'INGB06', m: 'ing', nivel: 'basico', de: 'ING06', n: 6, t: 'Passado: simple past, past continuous e used to', peso: 3, h: 2.5,
  teoria: `
<h3>Simple past</h3>
<p>Ação concluída em um momento definido do passado: <i>I <b>visited</b> the base <b>last year</b>.</i></p>
<ul>
<li>Regulares: + <b>-ed</b> (worked, lived, studied, stopped).</li>
<li>Irregulares: precisam ser memorizados (tabela abaixo).</li>
<li>Negativa e pergunta com <b>did</b> + verbo na forma base: <i>He <b>didn't go</b>. <b>Did</b> you <b>see</b> it?</i></li>
<li>Palavras-chave: yesterday, last week, ago, in 2010.</li>
<li>To be: <b>was</b> (I, he, she, it) / <b>were</b> (you, we, they).</li>
</ul>
<div class="tbl"><table><thead><tr><th>Base</th><th>Past</th><th>Past participle</th><th>Base</th><th>Past</th><th>Past participle</th></tr></thead><tbody>
<tr><td>be</td><td>was/were</td><td>been</td><td>go</td><td>went</td><td>gone</td></tr>
<tr><td>begin</td><td>began</td><td>begun</td><td>have</td><td>had</td><td>had</td></tr>
<tr><td>bring</td><td>brought</td><td>brought</td><td>know</td><td>knew</td><td>known</td></tr>
<tr><td>buy</td><td>bought</td><td>bought</td><td>leave</td><td>left</td><td>left</td></tr>
<tr><td>come</td><td>came</td><td>come</td><td>make</td><td>made</td><td>made</td></tr>
<tr><td>do</td><td>did</td><td>done</td><td>see</td><td>saw</td><td>seen</td></tr>
<tr><td>drive</td><td>drove</td><td>driven</td><td>take</td><td>took</td><td>taken</td></tr>
<tr><td>eat</td><td>ate</td><td>eaten</td><td>teach</td><td>taught</td><td>taught</td></tr>
<tr><td>fly</td><td>flew</td><td>flown</td><td>think</td><td>thought</td><td>thought</td></tr>
<tr><td>get</td><td>got</td><td>got/gotten</td><td>write</td><td>wrote</td><td>written</td></tr>
</tbody></table></div>
<h3>Past continuous</h3>
<p><b>was/were + verbo-ing</b>: ação em andamento num momento do passado, muitas vezes interrompida por outra (simple past):</p>
<p><i>I <b>was studying</b> when the phone <b>rang</b>.</i> <i><b>While</b> she <b>was flying</b>, the weather <b>changed</b>.</i></p>
<p><b>When</b> costuma acompanhar a ação curta (simple past); <b>while</b>, a ação longa (continuous).</p>
<h3>Used to</h3>
<p>Hábito ou estado do passado que não existe mais: <i>I <b>used to</b> play soccer</i> (eu costumava jogar). Negativa e pergunta: <i>I <b>didn't use to</b>… / <b>Did</b> you <b>use to</b>…?</i></p>
<p>Não confunda com <b>be used to + -ing</b> (estar acostumado): <i>I <b>am used to waking</b> up early.</i></p>
<p class="dica">Depois de did/didn't o verbo volta para a forma base: "Did he went" está errado; o certo é "Did he go".</p>`,
  ex: [
    ['Passe para o passado: "They fly to Manaus."', '<p>"They <b>flew</b> to Manaus." Negativa: "They didn\'t fly". Pergunta: "Did they fly…?"</p>'],
    ['Complete: "We ___ (watch) TV when the lights ___ (go) out."', '<p>"We <b>were watching</b> TV when the lights <b>went</b> out." A ação longa é interrompida pela curta.</p>'],
    ['Diferencie "I used to drive" e "I\'m used to driving".', '<p>"I used to drive" = eu costumava dirigir (não dirijo mais). "I\'m used to driving" = estou acostumado a dirigir.</p>']
  ],
  q: [
    ['"Yesterday the pilot ___ the plane to Brasília."', ['fly', 'flied', 'flew', 'flown'], 2, 'Fly é irregular: fly – flew – flown. "Yesterday" pede simple past.'],
    ['"___ you ___ the news last night?"', ['Did / saw', 'Did / see', 'Do / saw', 'Were / see'], 1, 'Pergunta no simple past: Did + verbo base (see).'],
    ['"She ___ dinner when I arrived."', ['cooked', 'was cooking', 'cooks', 'is cooking'], 1, 'Ação em andamento interrompida por outra: past continuous.'],
    ['"I ___ live in São Paulo, but now I live in Guaratinguetá."', ['use to', 'used to', 'am used to', 'was used'], 1, 'Hábito/estado passado que acabou: used to.'],
    ['Choose the correct sentence.', ['He didn\'t went to class.', 'He didn\'t go to class.', 'He doesn\'t went to class.', 'He not went to class.'], 1, 'Depois de didn\'t o verbo fica na forma base: go.'],
    ['The past and past participle of "write" are', ['wrote / written', 'writed / writed', 'wrote / wrote', 'written / wrote'], 0, 'Write – wrote – written.'],
    ['"While I ___ the report, my computer crashed."', ['wrote', 'was writing', 'write', 'have written'], 1, '"While" introduz a ação longa em andamento: past continuous.'],
    ['"We ___ at the airport two hours ago."', ['are', 'were', 'was', 'have been'], 1, '"Two hours ago" pede simple past; com we: were.'],
    ['"She is used to ___ early."', ['wake up', 'waking up', 'woke up', 'woken up'], 1, '"Be used to" (estar acostumado) é seguido de -ing.'],
    ['The past of "teach", "buy" and "think" is', ['teached, buyed, thinked', 'taught, bought, thought', 'taught, buyed, thought', 'teached, bought, thought'], 1, 'Os três são irregulares terminados em -ought/-aught: taught, bought, thought.']
  ],
  fc: [
    ['Simple past: auxiliar', 'Did / didn\'t + verbo base.'],
    ['fly / see / take (past e participle)', 'Flew-flown / saw-seen / took-taken.'],
    ['go / write / do (past e participle)', 'Went-gone / wrote-written / did-done.'],
    ['Past continuous', 'Was/were + -ing: ação em andamento no passado.'],
    ['When x while', 'When: ação curta (past). While: ação longa (continuous).'],
    ['used to', 'Hábito do passado que acabou.'],
    ['be used to + -ing', 'Estar acostumado a: I\'m used to waking up early.']
  ]
});
EEAR.add({
  id: 'INGB07', m: 'ing', nivel: 'basico', de: 'ING07', n: 7, t: 'Tempos perfeitos: present perfect e past perfect', peso: 3, h: 2.5,
  teoria: `
<h3>Present perfect</h3>
<p><b>have/has + past participle</b>. Liga o passado ao presente:</p>
<ul>
<li>Experiência, sem tempo definido: <i>I <b>have flown</b> in a helicopter.</i></li>
<li>Ação que começou no passado e continua: <i>She <b>has lived</b> here <b>for</b> five years / <b>since</b> 2020.</i></li>
<li>Ação recente com efeito no presente: <i>I <b>have lost</b> my keys</i> (ainda estão perdidas).</li>
</ul>
<p><b>for</b> + período (for two hours, for ten years); <b>since</b> + ponto de início (since Monday, since 2019, since I was a child).</p>
<p>Advérbios típicos: <b>ever</b> (alguma vez, em perguntas), <b>never</b>, <b>already</b> (já, afirmativas), <b>yet</b> (já, em perguntas; ainda, em negativas, no fim da frase), <b>just</b> (acabou de), <b>recently</b>, <b>so far</b>.</p>
<ul>
<li><i>Have you <b>ever</b> been to Recife?</i></li>
<li><i>I have <b>already</b> finished. / I haven't finished <b>yet</b>. / Have you finished <b>yet</b>?</i></li>
<li><i>The plane has <b>just</b> landed.</i></li>
</ul>
<h3>Present perfect x simple past</h3>
<p>Com tempo passado definido (<i>yesterday, last year, in 2015, ago</i>) usa-se o <b>simple past</b>: <i>I <b>visited</b> Paris in 2015.</i> Sem tempo definido, ou com período que ainda não terminou (<i>today, this week</i>), usa-se o <b>present perfect</b>: <i>I <b>have visited</b> Paris twice.</i></p>
<h3>Present perfect continuous</h3>
<p><b>have/has been + -ing</b>: enfatiza a duração de uma ação que continua: <i>I <b>have been studying</b> for three hours.</i></p>
<h3>Past perfect</h3>
<p><b>had + past participle</b>: ação anterior a outra ação passada (o "passado do passado"): <i>When we arrived, the plane <b>had</b> already <b>left</b>.</i></p>
<p class="dica">Viu "for/since", "ever/never", "already/yet", "just"? Pense em present perfect. Viu uma data ou "ago"? Simple past.</p>`,
  ex: [
    ['Complete com for ou since: "He has worked here ___ 2018" e "___ eight years".', '<p><b>since</b> 2018 (ponto de início) e <b>for</b> eight years (duração).</p>'],
    ['"I ___ (see) that movie last week" ou "I ___ (see) that movie three times"?', '<p>"I <b>saw</b> that movie last week" (tempo definido) e "I <b>have seen</b> that movie three times" (experiência).</p>'],
    ['Explique o tempo em "When I got home, my family had eaten".', '<p>Past perfect: a família comeu <b>antes</b> de eu chegar.</p>']
  ],
  q: [
    ['"She ___ in Brazil since 2015."', ['lives', 'lived', 'has lived', 'is living'], 2, '"Since 2015" indica ação que começou no passado e continua: present perfect.'],
    ['"Have you ___ been to the Amazon?"', ['ever', 'yet', 'already', 'since'], 0, '"Ever" (alguma vez) é usado em perguntas de experiência.'],
    ['"I ___ my homework yesterday."', ['have finished', 'finished', 'have finish', 'had finish'], 1, '"Yesterday" é tempo definido: simple past.'],
    ['"The plane has ___ landed. The passengers are getting off now."', ['yet', 'just', 'ever', 'since'], 1, '"Just" = acabou de.'],
    ['"I haven\'t received the results ___."', ['already', 'yet', 'just', 'ever'], 1, 'Em negativas, no fim da frase, "yet" = ainda.'],
    ['"When I arrived at the gate, the flight ___."', ['already left', 'has already left', 'had already left', 'leaves already'], 2, 'O voo partiu antes de eu chegar: past perfect.'],
    ['"They have been married ___ ten years."', ['since', 'for', 'ago', 'during'], 1, 'Duração de tempo: for.'],
    ['"I ___ for two hours, so I\'m tired."', ['have been running', 'run', 'am run', 'had ran'], 0, 'Ênfase na duração de algo que vem acontecendo até agora: present perfect continuous.'],
    ['Choose the correct sentence.', ['I have seen him two days ago.', 'I saw him two days ago.', 'I have saw him two days ago.', 'I had see him two days ago.'], 1, '"Ago" exige simple past.'],
    ['The past participle of "go", "be" and "take" is', ['went, was, took', 'gone, been, taken', 'goed, been, took', 'gone, being, taken'], 1, 'Go – went – gone; be – was/were – been; take – took – taken.']
  ],
  fc: [
    ['Present perfect: estrutura', 'Have/has + past participle.'],
    ['for x since', 'For: duração (for 2 years). Since: ponto de início (since 2020).'],
    ['already x yet', 'Already: afirmativas. Yet: perguntas e negativas (no fim).'],
    ['just + present perfect', 'Acabou de: The plane has just landed.'],
    ['Present perfect x simple past', 'Tempo definido (yesterday, ago): simple past.'],
    ['Past perfect', 'Had + participle: ação anterior a outra no passado.'],
    ['Present perfect continuous', 'Have/has been + -ing: duração até agora.']
  ]
});
EEAR.add({
  id: 'INGB08', m: 'ing', nivel: 'basico', de: 'ING08', n: 8, t: 'Futuro: will, going to e outras formas', peso: 2, h: 2,
  teoria: `
<h3>Will</h3>
<p><b>will + verbo base</b> (negativa <b>won't</b>):</p>
<ul>
<li>Previsões baseadas em opinião: <i>I think it <b>will</b> rain.</i></li>
<li>Decisões tomadas na hora: <i>The phone is ringing. I<b>'ll</b> answer it.</i></li>
<li>Promessas, ofertas e pedidos: <i>I <b>will</b> help you. <b>Will</b> you open the door?</i></li>
</ul>
<h3>Be going to</h3>
<p><b>am/is/are going to + verbo base</b>:</p>
<ul>
<li>Planos e intenções já decididos: <i>I<b>'m going to</b> take the EEAR exam.</i></li>
<li>Previsões com evidência no presente: <i>Look at those clouds! It<b>'s going to</b> rain.</i></li>
</ul>
<h3>Outras formas de futuro</h3>
<ul>
<li><b>Present continuous</b>: compromissos marcados: <i>I<b>'m meeting</b> the captain at 3 p.m.</i></li>
<li><b>Simple present</b>: horários e programações fixas: <i>The train <b>leaves</b> at 8.</i></li>
<li><b>Future continuous</b> (<b>will be + -ing</b>): ação em andamento num momento futuro: <i>This time tomorrow I <b>will be flying</b> to Recife.</i></li>
<li><b>Future perfect</b> (<b>will have + participle</b>): ação concluída antes de um momento futuro: <i>By 2030, I <b>will have finished</b> college.</i></li>
</ul>
<p>Depois de <b>when, as soon as, before, after, until, if</b>, em referência ao futuro, usa-se o <b>presente</b>: <i>I'll call you <b>when</b> I <b>arrive</b></i> (não "when I will arrive").</p>
<p class="dica">Decisão na hora = will. Plano já decidido = going to. Evidência visível = going to.</p>`,
  ex: [
    ['"I\'m tired." — "I ___ (make) you a coffee." Qual forma?', '<p>Decisão na hora da fala: "I<b>\'ll make</b> you a coffee."</p>'],
    ['"She has bought the tickets. She ___ (travel) to Rio."', '<p>Plano decidido, com evidência: "She<b>\'s going to travel</b> to Rio."</p>'],
    ['Corrija: "I will call you when I will get there."', '<p>"I will call you when I <b>get</b> there." Depois de "when" usa-se o presente.</p>']
  ],
  q: [
    ['"Look at that black sky! It ___ rain."', ['will', 'is going to', 'rains', 'was going to'], 1, 'Previsão com evidência no presente (céu escuro): going to.'],
    ['"Someone is at the door." "OK, I ___ open it."', ['am going to', '\'ll', 'open', 'have opened'], 1, 'Decisão tomada no momento da fala: will.'],
    ['"I ___ study engineering next year. I have already enrolled."', ['will', 'am going to', 'study', 'studied'], 1, 'Plano já decidido: going to.'],
    ['"I\'ll call you as soon as I ___ at the hotel."', ['will arrive', 'arrive', 'arrived', 'am going to arrive'], 1, 'Depois de "as soon as" com sentido de futuro usa-se o presente.'],
    ['"This time next week we ___ on the beach."', ['will lie', 'will be lying', 'lie', 'will have lain'], 1, 'Ação em andamento num momento futuro: future continuous.'],
    ['"By the end of the year, she ___ 200 flight hours."', ['will complete', 'will have completed', 'completes', 'is completing'], 1, 'Ação concluída antes de um momento futuro: future perfect.'],
    ['"The flight to Recife ___ at 6:45 every morning."', ['leaves', 'will leaving', 'is going leave', 'left'], 0, 'Horários fixos: simple present.'],
    ['The negative form of "will" is', ['willn\'t', 'won\'t', 'don\'t will', 'not will'], 1, 'Will not = won\'t.'],
    ['"I promise I ___ tell anyone."', ['won\'t', 'am not going', 'don\'t', 'didn\'t'], 0, 'Promessas usam will: I won\'t tell anyone.'],
    ['"I ___ the captain at 3 p.m. tomorrow. It is already in my calendar."', ['meet', 'am meeting', 'met', 'have met'], 1, 'Compromisso já marcado para o futuro: present continuous.']
  ],
  fc: [
    ['will: usos', 'Previsões de opinião, decisões na hora, promessas e ofertas.'],
    ['going to: usos', 'Planos decididos e previsões com evidência.'],
    ['Futuro com present continuous', 'Compromissos marcados.'],
    ['Future continuous', 'Will be + -ing: ação em andamento no futuro.'],
    ['Future perfect', 'Will have + participle: concluída antes de um momento futuro.'],
    ['Depois de when / as soon as (futuro)', 'Presente: when I arrive.'],
    ['won\'t', 'Will not.']
  ]
});
EEAR.add({
  id: 'INGB09', m: 'ing', nivel: 'basico', de: 'ING09', n: 9, t: 'Modal verbs', peso: 3, h: 2.5,
  teoria: `
<p>Modais vêm seguidos do verbo na forma base (sem "to"), não recebem -s na 3ª pessoa e fazem negativa e pergunta sozinhos: <i>She <b>can</b> fly. She <b>can't</b> fly. <b>Can</b> she fly?</i></p>
<div class="tbl"><table><thead><tr><th>Modal</th><th>Uso</th><th>Exemplo</th></tr></thead><tbody>
<tr><td>can</td><td>habilidade, permissão informal, possibilidade</td><td>I can swim. Can I go?</td></tr>
<tr><td>could</td><td>habilidade no passado, pedido educado, possibilidade</td><td>I could run fast as a child. Could you help me?</td></tr>
<tr><td>may</td><td>permissão formal, possibilidade</td><td>May I come in? It may rain.</td></tr>
<tr><td>might</td><td>possibilidade remota</td><td>He might be late.</td></tr>
<tr><td>must</td><td>obrigação (interna, regra), dedução forte</td><td>You must wear a seatbelt. He must be tired.</td></tr>
<tr><td>mustn't</td><td>proibição</td><td>You mustn't smoke here.</td></tr>
<tr><td>should / ought to</td><td>conselho, recomendação</td><td>You should sleep more. You ought to rest.</td></tr>
<tr><td>would</td><td>pedido educado, hipótese, preferência</td><td>Would you like some tea? I would go if I could.</td></tr>
<tr><td>shall</td><td>sugestão e oferta com I/we (formal)</td><td>Shall we start?</td></tr>
</tbody></table></div>
<h3>Semimodais</h3>
<ul>
<li><b>have to</b>: obrigação externa; flexiona: <i>She <b>has to</b> work. We <b>had to</b> wait.</i></li>
<li><b>don't have to</b> = não é preciso (sem obrigação). Diferente de <b>mustn't</b> = é proibido.</li>
<li><b>be able to</b>: habilidade em qualquer tempo: <i>I <b>will be able to</b> fly next year.</i></li>
<li><b>need to / needn't</b>: necessidade / não há necessidade.</li>
</ul>
<h3>Modal + have + particípio (passado)</h3>
<ul>
<li><b>should have done</b>: deveria ter feito (crítica, arrependimento).</li>
<li><b>must have been</b>: deve ter sido (dedução sobre o passado).</li>
<li><b>might/could have done</b>: pode ter feito (possibilidade passada).</li>
<li><b>can't have done</b>: não pode ter feito (impossibilidade).</li>
</ul>
<p class="dica">A pegadinha favorita: "You mustn't" (proibido) x "You don't have to" (não precisa). E nada de "to" depois do modal: "can to swim" está errado.</p>`,
  ex: [
    ['Qual a diferença: "You mustn\'t wear a uniform" x "You don\'t have to wear a uniform"?', '<p>"Mustn\'t" = é <b>proibido</b> usar uniforme. "Don\'t have to" = <b>não é obrigatório</b> (pode usar se quiser).</p>'],
    ['"His lights are off. He ___ be sleeping." Qual modal?', '<p>Dedução forte: "He <b>must</b> be sleeping."</p>'],
    ['"I failed the test. I ___ (study) more."', '<p>Arrependimento sobre o passado: "I <b>should have studied</b> more."</p>']
  ],
  q: [
    ['"You ___ smoke on board. It is forbidden."', ['don\'t have to', 'mustn\'t', 'shouldn\'t have', 'might not'], 1, 'Proibição: mustn\'t.'],
    ['"Tomorrow is Sunday. You ___ get up early."', ['mustn\'t', 'don\'t have to', 'can\'t', 'must'], 1, 'Não há obrigação: don\'t have to.'],
    ['Choose the correct sentence.', ['She cans speak English.', 'She can to speak English.', 'She can speak English.', 'She can speaks English.'], 2, 'Modal + verbo base, sem -s e sem "to".'],
    ['"You look tired. You ___ go to bed earlier."', ['should', 'mustn\'t', 'might', 'can\'t'], 0, 'Conselho: should.'],
    ['"___ I use your phone, please?" (formal request)', ['Must', 'May', 'Should', 'Will'], 1, 'Pedido de permissão formal: May I…?'],
    ['"When I was five, I ___ read."', ['can', 'could', 'may', 'must'], 1, 'Habilidade no passado: could.'],
    ['"The lights are on. Someone ___ be at home."', ['must', 'mustn\'t', 'shouldn\'t', 'needn\'t'], 0, 'Dedução forte a partir de evidência: must.'],
    ['"You failed because you didn\'t study. You ___ harder."', ['should study', 'should have studied', 'must study', 'can have studied'], 1, 'Crítica a algo que não foi feito no passado: should have + particípio.'],
    ['"Next year I ___ drive, because I will be 18."', ['can', 'will be able to', 'could', 'am able'], 1, 'Habilidade no futuro: will be able to.'],
    ['"He ___ come to the party. I\'m not sure." (weak possibility)', ['must', 'might', 'has to', 'should'], 1, 'Possibilidade incerta: might.']
  ],
  fc: [
    ['mustn\'t x don\'t have to', 'Mustn\'t: proibido. Don\'t have to: não é obrigatório.'],
    ['Regras dos modais', 'Verbo base sem "to", sem -s na 3ª pessoa, negativa e pergunta sem auxiliar.'],
    ['must (dedução)', 'Dedução forte: He must be tired.'],
    ['should have + participle', 'Deveria ter feito (crítica, arrependimento).'],
    ['could', 'Habilidade no passado ou pedido educado.'],
    ['may x might', 'May: permissão formal ou possibilidade. Might: possibilidade remota.'],
    ['be able to', 'Habilidade em outros tempos: will be able to.']
  ]
});
EEAR.add({
  id: 'INGB10', m: 'ing', nivel: 'basico', de: 'ING10', n: 10, t: 'Conditionals e wish', peso: 3, h: 2.5,
  teoria: `
<div class="tbl"><table><thead><tr><th>Tipo</th><th>Estrutura</th><th>Uso</th><th>Exemplo</th></tr></thead><tbody>
<tr><td>Zero</td><td>if + present, present</td><td>verdades gerais, ciência</td><td>If you heat ice, it melts.</td></tr>
<tr><td>First</td><td>if + present, will + verbo</td><td>situação real ou provável no futuro</td><td>If it rains, the flight will be delayed.</td></tr>
<tr><td>Second</td><td>if + past, would + verbo</td><td>situação hipotética ou improvável no presente/futuro</td><td>If I had wings, I would fly.</td></tr>
<tr><td>Third</td><td>if + past perfect, would have + particípio</td><td>hipótese sobre o passado (que não aconteceu)</td><td>If I had studied, I would have passed.</td></tr>
</tbody></table></div>
<ul>
<li>Na second conditional, com <i>to be</i>, usa-se <b>were</b> para todas as pessoas: <i>If I <b>were</b> you, I would study more.</i></li>
<li>A oração com <b>if</b> pode vir depois: <i>I would travel if I had money</i> (sem vírgula).</li>
<li>Nunca use <b>will</b> ou <b>would</b> na oração do <i>if</i>.</li>
<li><b>Unless</b> = if not: <i><b>Unless</b> you hurry, you will miss the bus</i> (= If you don't hurry).</li>
<li>Outras palavras: <b>provided (that), as long as</b> (desde que), <b>in case</b> (caso).</li>
</ul>
<h3>Wish e if only</h3>
<ul>
<li>Desejo sobre o <b>presente</b>: wish + <b>past</b>: <i>I wish I <b>had</b> a car</i> (não tenho). <i>I wish I <b>were</b> taller.</i></li>
<li>Arrependimento sobre o <b>passado</b>: wish + <b>past perfect</b>: <i>I wish I <b>had studied</b> more</i> (não estudei).</li>
<li>Reclamação de algo que incomoda: wish + <b>would</b>: <i>I wish you <b>would</b> stop talking.</i></li>
<li><b>If only</b> = quem dera, com as mesmas regras: <i>If only I <b>had</b> more time!</i></li>
</ul>
<p class="dica">Ache primeiro o tempo do verbo do "if": presente → first (ou zero); passado → second; past perfect → third. A outra oração segue o par.</p>`,
  ex: [
    ['Complete: "If I ___ (have) more time, I ___ (learn) to fly."', '<p>Hipótese no presente: "If I <b>had</b> more time, I <b>would learn</b> to fly." (second conditional)</p>'],
    ['Reescreva com unless: "If you don\'t practice, you won\'t improve."', '<p>"<b>Unless</b> you practice, you won\'t improve."</p>'],
    ['"I didn\'t buy the ticket. Now it\'s sold out." Expresse arrependimento com wish.', '<p>"I wish I <b>had bought</b> the ticket." (wish + past perfect)</p>']
  ],
  q: [
    ['"If it ___ tomorrow, we will cancel the training."', ['rains', 'will rain', 'rained', 'would rain'], 0, 'First conditional: if + present, will + verbo.'],
    ['"If I ___ you, I would accept the offer."', ['am', 'was being', 'were', 'will be'], 2, 'Second conditional com to be: were para todas as pessoas.'],
    ['"If she had left earlier, she ___ the flight."', ['wouldn\'t miss', 'won\'t miss', 'wouldn\'t have missed', 'didn\'t miss'], 2, 'Third conditional: if + past perfect, would have + particípio.'],
    ['"If you heat water to 100°C, it ___."', ['boils', 'will boiled', 'would boil', 'boiled'], 0, 'Verdade científica: zero conditional (present + present).'],
    ['"___ you study, you won\'t pass the exam."', ['If', 'Unless', 'When', 'Because'], 1, 'Unless = if not: se você não estudar, não vai passar.'],
    ['"I wish I ___ more money." (now)', ['have', 'had', 'will have', 'would had'], 1, 'Desejo sobre o presente: wish + past.'],
    ['"I wish I ___ to the party last night. It was great!"', ['went', 'had gone', 'would go', 'have gone'], 1, 'Arrependimento sobre o passado: wish + past perfect.'],
    ['"What would you do if you ___ the lottery?"', ['win', 'won', 'will win', 'would win'], 1, 'Second conditional: if + past (won).'],
    ['The sentence "If I had studied, I would have passed" means that the person', ['studied and passed.', 'didn\'t study and didn\'t pass.', 'will study and pass.', 'studied but didn\'t pass.'], 1, 'Third conditional fala de algo que não aconteceu no passado: não estudou e não passou.'],
    ['"You can borrow my car ___ you drive carefully."', ['unless', 'as long as', 'in spite of', 'although'], 1, '"As long as" = desde que (condição).']
  ],
  fc: [
    ['First conditional', 'If + present, will + verbo.'],
    ['Second conditional', 'If + past, would + verbo (were para todos).'],
    ['Third conditional', 'If + past perfect, would have + particípio.'],
    ['Zero conditional', 'If + present, present: verdades gerais.'],
    ['unless', 'If not.'],
    ['wish + past', 'Desejo sobre o presente: I wish I had…'],
    ['wish + past perfect', 'Arrependimento sobre o passado: I wish I had studied.'],
    ['as long as / provided', 'Desde que.']
  ]
});
EEAR.add({
  id: 'INGB11', m: 'ing', nivel: 'basico', de: 'ING11', n: 11, t: 'Passive voice e reported speech', peso: 3, h: 2.5,
  teoria: `
<h3>Passive voice</h3>
<p><b>to be (no tempo da ativa) + past participle</b>. O objeto da ativa vira sujeito; o agente aparece com <b>by</b> (quando importa).</p>
<div class="tbl"><table><thead><tr><th>Tempo</th><th>Ativa</th><th>Passiva</th></tr></thead><tbody>
<tr><td>Simple present</td><td>They build planes.</td><td>Planes <b>are built</b>.</td></tr>
<tr><td>Present continuous</td><td>They are building a plane.</td><td>A plane <b>is being built</b>.</td></tr>
<tr><td>Simple past</td><td>They built the hangar.</td><td>The hangar <b>was built</b>.</td></tr>
<tr><td>Past continuous</td><td>They were repairing it.</td><td>It <b>was being repaired</b>.</td></tr>
<tr><td>Present perfect</td><td>They have sold the tickets.</td><td>The tickets <b>have been sold</b>.</td></tr>
<tr><td>Past perfect</td><td>They had cleaned it.</td><td>It <b>had been cleaned</b>.</td></tr>
<tr><td>Future (will)</td><td>They will open the base.</td><td>The base <b>will be opened</b>.</td></tr>
<tr><td>Modal</td><td>You must check it.</td><td>It <b>must be checked</b>.</td></tr>
</tbody></table></div>
<p>Estruturas comuns: <i>English <b>is spoken</b> here. The 14-bis <b>was invented by</b> Santos Dumont. It <b>is said that</b>… / He <b>is said to be</b>…</i></p>
<h3>Reported speech (discurso indireto)</h3>
<p>Quando o verbo introdutor está no passado (<i>said, told</i>), os tempos recuam:</p>
<div class="tbl"><table><thead><tr><th>Direto</th><th>Indireto</th></tr></thead><tbody>
<tr><td>simple present ("I work")</td><td>simple past (he said he worked)</td></tr>
<tr><td>present continuous ("I am working")</td><td>past continuous (he was working)</td></tr>
<tr><td>simple past / present perfect ("I worked / have worked")</td><td>past perfect (he had worked)</td></tr>
<tr><td>will ("I will go")</td><td>would (he would go)</td></tr>
<tr><td>can / may / must</td><td>could / might / had to</td></tr>
</tbody></table></div>
<p>Também mudam pronomes e marcadores: <i>today → that day; tomorrow → the next day / the following day; yesterday → the day before; now → then; here → there; this → that; next week → the following week; ago → before</i>.</p>
<ul>
<li><b>say</b> (sem objeto pessoal) x <b>tell</b> (com objeto): <i>He <b>said</b> (that)… / He <b>told me</b> (that)…</i></li>
<li>Perguntas viram afirmativas, sem do/did: <i>"Where do you live?" → She asked where I <b>lived</b>.</i> Sim/não: <b>if / whether</b>: <i>He asked <b>if</b> I was ready.</i></li>
<li>Ordens e pedidos: <b>told/asked + objeto + to + verbo</b>: <i>"Sit down." → He told me <b>to sit</b> down. "Don't move." → He told us <b>not to move</b>.</i></li>
</ul>
<p class="dica">Na passiva, o tempo está no verbo <i>to be</i>; o verbo principal fica sempre no particípio. No indireto, pergunta não tem auxiliar e mantém a ordem sujeito + verbo.</p>`,
  ex: [
    ['Passe para a passiva: "The mechanics are checking the engine."', '<p>"The engine <b>is being checked</b> by the mechanics."</p>'],
    ['Passe para o indireto: She said, "I will travel tomorrow."', '<p>She said (that) she <b>would travel the next day</b>.</p>'],
    ['Passe para o indireto: "Are you a cadet?" he asked me.', '<p>He asked me <b>if/whether I was</b> a cadet.</p>']
  ],
  q: [
    ['"The first airplane ___ by Santos Dumont."', ['flew', 'was flown', 'is flying', 'has flown'], 1, 'Passiva no passado: was + particípio (flown).'],
    ['Passive form of "They are painting the hangar":', ['The hangar is painted.', 'The hangar is being painted.', 'The hangar was painting.', 'The hangar has painted.'], 1, 'Present continuous na passiva: is being + particípio.'],
    ['"The tickets ___ already ___." (present perfect, passive)', ['have / sold', 'have / been sold', 'has / be sold', 'are / sold'], 1, 'Present perfect passivo: have been + particípio.'],
    ['"The report must ___ by Friday."', ['finish', 'be finished', 'finished', 'being finished'], 1, 'Modal na passiva: modal + be + particípio.'],
    ['Direct: "I am tired." Reported: She said that she ___ tired.', ['is', 'was', 'has been', 'will be'], 1, 'Simple present recua para simple past: was.'],
    ['Direct: "I will call you tomorrow." Reported: He said he ___ me ___.', ['will call / tomorrow', 'would call / the next day', 'would call / yesterday', 'called / tomorrow'], 1, 'Will → would; tomorrow → the next day.'],
    ['Direct: "Where do you work?" Reported: She asked me ___.', ['where do I work', 'where I worked', 'where did I work', 'where I work did'], 1, 'Pergunta indireta: ordem afirmativa, tempo recuado, sem auxiliar.'],
    ['Direct: "Don\'t open the door." Reported: He told me ___ the door.', ['don\'t open', 'not to open', 'to not opened', 'didn\'t open'], 1, 'Ordem negativa: told + objeto + not to + verbo.'],
    ['Choose the correct sentence.', ['He said me that he was busy.', 'He told me that he was busy.', 'He told that he was busy me.', 'He said to me he is busy yesterday.'], 1, '"Tell" exige objeto pessoal (told me); "say" não leva objeto direto pessoal.'],
    ['"English ___ in many countries."', ['speaks', 'is spoken', 'is speaking', 'spoke'], 1, 'Passiva no presente: is + particípio.']
  ],
  fc: [
    ['Passiva: estrutura', 'To be no tempo da ativa + past participle.'],
    ['Passiva com modal', 'Modal + be + particípio: must be checked.'],
    ['Passiva do present continuous', 'Is/are being + particípio.'],
    ['Reported: will vira…', 'Would.'],
    ['Reported: tomorrow / yesterday', 'The next day / the day before.'],
    ['say x tell', 'Tell exige objeto pessoal: told me. Say não.'],
    ['Pergunta sim/não no indireto', 'If / whether + ordem afirmativa.'],
    ['Ordem no indireto', 'Told + objeto + (not) to + verbo.']
  ]
});
EEAR.add({
  id: 'INGB12', m: 'ing', nivel: 'basico', de: 'ING12', n: 12, t: 'Preposições, conectivos e quantificadores', peso: 2, h: 2.5,
  teoria: `
<h3>Preposições de tempo</h3>
<div class="tbl"><table><tbody>
<tr><td><b>at</b></td><td>horas e momentos: at 7 o'clock, at noon, at night, at the weekend (britânico)</td></tr>
<tr><td><b>on</b></td><td>dias e datas: on Monday, on May 5th, on my birthday, on the weekend (americano)</td></tr>
<tr><td><b>in</b></td><td>meses, anos, estações, séculos, partes do dia: in July, in 2026, in winter, in the morning</td></tr>
</tbody></table></div>
<p><b>for</b> (duração), <b>since</b> (início), <b>during</b> (durante algo), <b>by</b> (até, no máximo), <b>until</b> (até, continuidade): <i>Finish it <b>by</b> Friday. I'll wait <b>until</b> Friday.</i></p>
<h3>Preposições de lugar</h3>
<p><b>at</b> (ponto: at the airport, at home), <b>in</b> (dentro, cidades, países: in the hangar, in Brazil), <b>on</b> (superfície, andar, meio de transporte coletivo: on the table, on the second floor, on the plane, on the bus; mas <i>in the car, in a taxi</i>). Outras: under, between, next to, in front of, behind, above, across.</p>
<h3>Conectivos (linking words)</h3>
<div class="tbl"><table><tbody>
<tr><td>Contraste</td><td>but, however, although/though/even though + oração; <b>despite / in spite of + substantivo ou -ing</b>; whereas, while, nevertheless</td></tr>
<tr><td>Causa</td><td>because + oração; <b>because of / due to + substantivo</b>; since, as</td></tr>
<tr><td>Consequência</td><td>so, therefore, thus, as a result, consequently</td></tr>
<tr><td>Adição</td><td>and, also, moreover, furthermore, besides, in addition</td></tr>
<tr><td>Finalidade</td><td>to, in order to + verbo; so that + oração</td></tr>
</tbody></table></div>
<p><i><b>Although</b> it was raining, we flew. <b>Despite</b> the rain, we flew. <b>In spite of</b> being tired, he studied.</i></p>
<h3>Quantificadores</h3>
<div class="tbl"><table><thead><tr><th>Contáveis (plural)</th><th>Incontáveis</th></tr></thead><tbody>
<tr><td><b>many</b> (muitos), <b>few</b> (poucos, quase nenhum), <b>a few</b> (alguns)</td><td><b>much</b> (muito), <b>little</b> (pouco, quase nada), <b>a little</b> (um pouco)</td></tr>
<tr><td colspan="2"><b>a lot of / lots of / some / any / enough / no</b>: servem para os dois</td></tr>
</tbody></table></div>
<p><b>How many</b> + contável; <b>how much</b> + incontável ou preço. <b>Too</b> + adjetivo = demais (<i>too hot</i>); adjetivo + <b>enough</b> = suficiente (<i>old enough</i>); <b>enough</b> + substantivo (<i>enough time</i>).</p>
<p class="dica">"Despite" e "in spite of" nunca vêm seguidos de sujeito + verbo. Se depois vier uma oração, a resposta é "although".</p>`,
  ex: [
    ['Complete: "The meeting is ___ Monday ___ 9 a.m. ___ March."', '<p><b>on</b> Monday, <b>at</b> 9 a.m., <b>in</b> March.</p>'],
    ['Reescreva com despite: "Although he was sick, he went to work."', '<p>"<b>Despite</b> being sick, he went to work." (ou "Despite his illness…")</p>'],
    ['"There is ___ milk and ___ eggs." (pouco / poucos, quase nada)', '<p>"There is <b>little</b> milk and <b>few</b> eggs." Com "a" (a little, a few), o sentido seria positivo: um pouco, alguns.</p>']
  ],
  q: [
    ['"The flight leaves ___ 10:30 ___ Friday."', ['in / at', 'at / on', 'on / in', 'at / in'], 1, 'At + horas; on + dias da semana.'],
    ['"I was born ___ 2005, ___ August."', ['in / in', 'on / in', 'at / on', 'in / on'], 0, 'In + ano e in + mês.'],
    ['"___ the bad weather, the plane landed safely."', ['Although', 'Despite', 'Because', 'However'], 1, 'Seguido de substantivo ("the bad weather"): despite.'],
    ['"___ it was late, they continued working."', ['In spite of', 'Despite', 'Although', 'Because of'], 2, 'Seguido de oração (it was late): although.'],
    ['"The game was cancelled ___ the rain."', ['because', 'because of', 'although', 'so'], 1, 'Antes de substantivo: because of.'],
    ['"How ___ water do you drink a day?"', ['many', 'much', 'few', 'a few'], 1, '"Water" é incontável: how much.'],
    ['"I have ___ friends here, so I never feel lonely."', ['few', 'a few', 'little', 'a little'], 1, '"A few" = alguns (sentido positivo, com contáveis).'],
    ['"She is not ___ to drive. She is only 15."', ['enough old', 'old enough', 'too old', 'too much old'], 1, 'Adjetivo + enough: old enough.'],
    ['"He studied hard; ___, he passed the exam."', ['however', 'therefore', 'although', 'despite'], 1, 'Consequência: therefore (portanto).'],
    ['"The passengers are ___ the plane."', ['in', 'on', 'at', 'by'], 1, 'Para avião, ônibus e trem usa-se "on".']
  ],
  fc: [
    ['at / on / in (tempo)', 'At: horas. On: dias e datas. In: meses, anos, estações.'],
    ['despite / in spite of', 'Seguidos de substantivo ou -ing.'],
    ['although', 'Seguido de oração (sujeito + verbo).'],
    ['because x because of', 'Because + oração. Because of + substantivo.'],
    ['few x a few', 'Few: quase nenhum. A few: alguns.'],
    ['little x a little', 'Little: quase nada. A little: um pouco (incontáveis).'],
    ['how many x how much', 'Many: contáveis. Much: incontáveis.'],
    ['too x enough', 'Too + adjetivo (demais). Adjetivo + enough (suficiente).']
  ]
});
EEAR.add({
  id: 'INGB13', m: 'ing', nivel: 'basico', de: 'ING13', n: 13, t: 'Gerúndio e infinitivo, phrasal verbs, question tags e formação de palavras', peso: 2, h: 2.5,
  teoria: `
<h3>Gerund (-ing) ou infinitive (to)?</h3>
<ul>
<li><b>-ing</b> depois de: <i>enjoy, avoid, finish, mind, suggest, keep, practice, consider, miss, deny</i> e depois de <b>preposições</b>: <i>I'm interested <b>in learning</b>. Thank you <b>for coming</b>.</i> Também como sujeito: <i><b>Flying</b> is safe.</i></li>
<li><b>to + verbo</b> depois de: <i>want, decide, hope, plan, need, expect, agree, promise, refuse, would like</i>: <i>I want <b>to fly</b>.</i></li>
<li>Muda o sentido:
<ul>
<li><b>stop doing</b> (parar de fazer) x <b>stop to do</b> (parar para fazer).</li>
<li><b>remember doing</b> (lembrar de ter feito) x <b>remember to do</b> (lembrar de fazer).</li>
<li><b>try doing</b> (experimentar) x <b>try to do</b> (esforçar-se para).</li>
</ul></li>
<li>Depois de <b>make</b> e <b>let</b>, infinitivo sem to: <i>She made me <b>study</b>. Let me <b>go</b>.</i></li>
</ul>
<h3>Phrasal verbs frequentes</h3>
<div class="tbl"><table><tbody>
<tr><td>take off: decolar; tirar (roupa)</td><td>look for: procurar</td><td>look after: cuidar de</td></tr>
<tr><td>give up: desistir</td><td>find out: descobrir</td><td>turn on / off: ligar / desligar</td></tr>
<tr><td>get up: levantar-se</td><td>put off: adiar</td><td>run out of: ficar sem</td></tr>
<tr><td>carry on: continuar</td><td>set up: montar, estabelecer</td><td>look forward to: aguardar ansiosamente (+ -ing)</td></tr>
</tbody></table></div>
<h3>Question tags</h3>
<p>Pequena pergunta no fim ("não é?"): oração <b>afirmativa → tag negativa</b>; <b>negativa → tag afirmativa</b>, com o mesmo auxiliar e pronome:</p>
<ul>
<li><i>She is a pilot, <b>isn't she</b>?</i> <i>You can swim, <b>can't you</b>?</i></li>
<li><i>He works here, <b>doesn't he</b>?</i> <i>They went home, <b>didn't they</b>?</i></li>
<li><i>You haven't finished, <b>have you</b>?</i></li>
<li>Especiais: <i>I am right, <b>aren't I</b>?</i> <i>Let's go, <b>shall we</b>?</i> <i>Open the door, <b>will you</b>?</i> <i>There is a problem, <b>isn't there</b>?</i></li>
</ul>
<h3>Formação de palavras</h3>
<ul>
<li>Substantivos: <b>-tion</b> (inform → information), <b>-ment</b> (develop → development), <b>-ness</b> (kind → kindness), <b>-er/-or</b> (fly → flyer, operate → operator), <b>-ity</b> (able → ability).</li>
<li>Adjetivos: <b>-ful</b> (cheio de: useful), <b>-less</b> (sem: useless, careless), <b>-able</b> (que pode: readable), <b>-ous</b> (dangerous), <b>-al</b> (national).</li>
<li>Advérbios: <b>-ly</b> (careful → carefully).</li>
<li>Prefixos de negação: <b>un-</b> (unhappy), <b>in-/im-/il-/ir-</b> (impossible, illegal, irregular), <b>dis-</b> (disagree); repetição: <b>re-</b> (rewrite); erro: <b>mis-</b> (misunderstand); antes: <b>pre-</b>.</li>
</ul>
<p class="dica">Depois de preposição, sempre -ing, inclusive em "look forward to seeing you" e "be used to working". Esse "to" é preposição, não infinitivo.</p>`,
  ex: [
    ['Complete: "I enjoy ___ (fly), but I want ___ (become) a controller."', '<p>"I enjoy <b>flying</b>" (enjoy + -ing) e "I want <b>to become</b>" (want + to).</p>'],
    ['Diferencie "He stopped smoking" e "He stopped to smoke".', '<p>"Stopped smoking" = parou de fumar. "Stopped to smoke" = parou (o que fazia) para fumar.</p>'],
    ['Qual a tag de "She doesn\'t like coffee"?', '<p>Oração negativa → tag afirmativa: "<b>does she</b>?"</p>']
  ],
  q: [
    ['"She avoided ___ about the accident."', ['to talk', 'talking', 'talk', 'talked'], 1, '"Avoid" é seguido de -ing.'],
    ['"We decided ___ a new car."', ['buying', 'to buy', 'buy', 'bought'], 1, '"Decide" é seguido de to + verbo.'],
    ['"The plane will take off in ten minutes." "Take off" means', ['pousar', 'decolar', 'taxiar', 'atrasar'], 1, '"Take off" (para aeronaves) = decolar.'],
    ['"You are a cadet, ___?"', ['are you', 'aren\'t you', 'don\'t you', 'isn\'t it'], 1, 'Afirmativa com "are" → tag negativa "aren\'t you".'],
    ['"He didn\'t call you, ___?"', ['didn\'t he', 'did he', 'does he', 'he did'], 1, 'Negativa no passado → tag afirmativa "did he".'],
    ['"I\'m looking forward to ___ you."', ['see', 'seeing', 'saw', 'seen'], 1, 'Em "look forward to", "to" é preposição: -ing.'],
    ['"Don\'t give ___! You can pass the exam."', ['up', 'off', 'on', 'out'], 0, '"Give up" = desistir.'],
    ['The opposite of "careful" is', ['uncareful', 'careless', 'discareful', 'carefulness'], 1, 'O sufixo -less indica ausência: careless (descuidado).'],
    ['"I remember ___ the door, but now it\'s open!" (I have a memory of the action)', ['to lock', 'locking', 'lock', 'locked'], 1, '"Remember + -ing" = lembrar de ter feito.'],
    ['"We have run ___ of fuel." means that', ['we have a lot of fuel.', 'we have no more fuel.', 'we are buying fuel.', 'the fuel is expensive.'], 1, '"Run out of" = ficar sem.']
  ],
  fc: [
    ['Verbos + -ing', 'Enjoy, avoid, finish, mind, suggest, keep, practice, consider.'],
    ['Verbos + to', 'Want, decide, hope, plan, need, expect, agree, promise, refuse.'],
    ['stop doing x stop to do', 'Parar de fazer x parar para fazer.'],
    ['Depois de preposição', 'Sempre -ing (interested in learning).'],
    ['Question tag: regra', 'Afirmativa → tag negativa; negativa → tag afirmativa; mesmo auxiliar.'],
    ['Tag de "I am…" e "Let\'s…"', 'Aren\'t I? / Shall we?'],
    ['take off / give up / run out of', 'Decolar (tirar) / desistir / ficar sem.'],
    ['-ful x -less', 'Cheio de (useful) x sem (useless).']
  ]
});
/* Videoaulas e termos de busca: os mesmos da aula de origem. */
Object.assign(EEAR.videos, {
  INGB01: 'reading comprehension inglês para concursos',
  INGB02: 'plural of nouns articles inglês',
  INGB03: 'pronouns inglês possessive reflexive relative',
  INGB04: 'comparative and superlative adjectives adverbs inglês',
  INGB05: 'simple present present continuous there to be',
  INGB06: 'simple past past continuous used to',
  INGB07: 'present perfect past perfect inglês',
  INGB08: 'future will going to inglês',
  INGB09: 'modal verbs inglês',
  INGB10: 'conditional sentences wish inglês',
  INGB11: 'passive voice reported speech inglês',
  INGB12: 'prepositions in on at linking words quantifiers inglês',
  INGB13: 'gerund infinitive phrasal verbs question tags'
});
Object.assign(EEAR.videoaulas, {
  INGB01: [{"id":"ZTKagZkVNGU","t":"Interpretação de texto e vocabulário para concursos militares","c":"Cursos Unipré","k":"a"},{"id":"C-Mc6SlvrfM","t":"Técnicas de leitura para textos em inglês","c":"Brasil Escola","k":"a"},{"id":"fqgPCSuhfz0","t":"Interpretação de textos de provas","c":"Cursos Unipré","k":"q"}],
  INGB02: [{"id":"SCOHBxE550I","t":"Plural dos substantivos com exercícios","c":"English Experience","k":"a"},{"id":"75os2hanb4A","t":"Artigos definidos e indefinidos: a, an e the","c":"Let’s Go English (Fernanda Deren)","k":"a"}],
  INGB03: [{"id":"WiuLsv6wxJs","t":"Pronomes pessoais, possessivos e reflexivos","c":"Aula De","k":"a"},{"id":"2FFv7LWk0E8","t":"Relative pronouns: pronomes relativos","c":"Curso Enem Gratuito","k":"a"}],
  INGB04: [{"id":"P9c4oBujQlE","t":"Comparativo e superlativo com exercícios (Inglês para ESA)","c":"MQR Educacional","k":"a"},{"id":"d946ZbFzxBw","t":"Comparative x superlative: o que são e como usar","c":"Luciane Alipio","k":"a"}],
  INGB05: [{"id":"BGfdCQglV0U","t":"Simple present x present continuous","c":"Teacher Lory","k":"a"},{"id":"P8udmPIxaVw","t":"Simple present com exercícios","c":"Bom de Língua","k":"q"},{"id":"fzFrXE0Jf0o","t":"Present continuous com exercícios","c":"Bom de Língua","k":"q"}],
  INGB06: [{"id":"AeoBqp50-04","t":"Simple past da forma fácil","c":"Teacher Elza","k":"a"},{"id":"8V5U2XMbgv0","t":"Past continuous com exercícios","c":"Bom de Língua","k":"q"}],
  INGB07: [{"id":"RcLEnFeK61U","t":"Present perfect: explicação com exercícios","c":"English Experience","k":"a"},{"id":"6I7G0tWx6fc","t":"Simple past ou present perfect?","c":"Inamara Arruda","k":"a"},{"id":"VCdkk7tkOpg","t":"Past perfect: resumo","c":"Curso Enem Gratuito","k":"a"}],
  INGB08: [{"id":"k8qz3b70k3A","t":"Will x going to: aula completa","c":"SmallAdvantages","k":"a"},{"id":"b0ce-uSprGY","t":"Simple future com exercícios","c":"Bom de Língua","k":"q"}],
  INGB09: [{"id":"1af_oFzvS6M","t":"Modal verbs can, could e may (Inglês para ESA)","c":"MQR Educacional","k":"a"},{"id":"X4Td7gAS5GM","t":"Modal verbs: aula completa","c":"Adriano Lazzaretti","k":"a"}],
  INGB10: [{"id":"BsVLqriURzE","t":"Conditionals: if clauses sem confundir","c":"Inamara Arruda","k":"a"},{"id":"u5jLFwFg5aw","t":"Conditional sentences com exercícios","c":"Bom de Língua","k":"q"}],
  INGB11: [{"id":"QRmi79pe57Q","t":"Voz passiva em inglês","c":"Inglês Minuto","k":"a"},{"id":"aIbQG6gzRwQ","t":"Reported speech: explicação e exercícios","c":"Inglês no Teclado","k":"a"}],
  INGB12: [{"id":"EJUnAcW5b38","t":"Preposições in, on e at com exercícios","c":"Bom de Língua","k":"a"},{"id":"sfvyd81pKqE","t":"Conectores (linking words)","c":"Centro de Mídias","k":"a"}],
  INGB13: [{"id":"P7CT5TTTDqE","t":"Gerund e infinitive","c":"SeduES","k":"a"},{"id":"MHaITbZY_xk","t":"Tag questions com exercícios","c":"English in Brazil (Carina Fragozo)","k":"a"}]
});

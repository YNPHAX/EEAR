/* Língua Inglesa — módulos 10 a 15 */
EEAR.add({
  id: 'ING10', m: 'ing', n: 10, t: 'Conditionals: zero, first e second', peso: 3, h: 2,
  modalidades: ['normal'],
  teoria: `
<div class="tbl"><table><thead><tr><th>Tipo</th><th>Estrutura</th><th>Uso</th><th>Exemplo</th></tr></thead><tbody>
<tr><td>Zero</td><td>if + present, present</td><td>verdades gerais, ciência</td><td>If you heat ice, it melts.</td></tr>
<tr><td>First</td><td>if + present, will + verbo</td><td>situação real ou provável no futuro</td><td>If it rains, the flight will be delayed.</td></tr>
<tr><td>Second</td><td>if + past, would + verbo</td><td>situação hipotética ou improvável no presente/futuro</td><td>If I had wings, I would fly.</td></tr>
</tbody></table></div>
<ul>
<li>Na second conditional, com <i>to be</i>, usa-se <b>were</b> para todas as pessoas: <i>If I <b>were</b> you, I would study more.</i></li>
<li>A oração com <b>if</b> pode vir depois: <i>I would travel if I had money</i> (sem vírgula).</li>
<li>Nunca use <b>will</b> ou <b>would</b> na oração do <i>if</i>.</li>
<li><b>Unless</b> = if not: <i><b>Unless</b> you hurry, you will miss the bus</i> (= If you don't hurry).</li>
</ul>
<p class="dica">Ache primeiro o tempo do verbo na oração com <i>if</i>: presente costuma indicar zero ou first conditional; passado costuma indicar second conditional.</p>`,
  ex: [
    ['Complete: "If I ___ (have) more time, I ___ (learn) to fly."', '<p>Hipótese no presente: "If I <b>had</b> more time, I <b>would learn</b> to fly." (second conditional)</p>'],
    ['Reescreva com unless: "If you don\'t practice, you won\'t improve."', '<p>"<b>Unless</b> you practice, you won\'t improve."</p>'],
    ['"I didn\'t buy the ticket. Now it\'s sold out." Expresse arrependimento com wish.', '<p>"I wish I <b>had bought</b> the ticket." (wish + past perfect)</p>']
  ],
  q: [
    ['"If it ___ tomorrow, we will cancel the training."', ['rains', 'will rain', 'rained', 'would rain'], 0, 'First conditional: if + present, will + verbo.'],
    ['"If I ___ you, I would accept the offer."', ['am', 'was being', 'were', 'will be'], 2, 'Second conditional com to be: were para todas as pessoas.'],
    ['"If you heat water to 100°C, it ___."', ['boils', 'will boiled', 'would boil', 'boiled'], 0, 'Verdade científica: zero conditional (present + present).'],
    ['"___ you study, you won\'t pass the exam."', ['If', 'Unless', 'When', 'Because'], 1, 'Unless = if not: se você não estudar, não vai passar.'],
    ['"What would you do if you ___ the lottery?"', ['win', 'won', 'will win', 'would win'], 1, 'Second conditional: if + past (won).'],
  ],
  fc: [
    ['Corrija, se necessário: "If the weather will improve, we will take off at noon."', 'If the weather <b>improves</b>, we will take off at noon. Na first conditional, a oração com if fica no presente; will vai na outra oração.', 2],
    ['Complete: "If she ___ (have) more free time, she ___ (join) the flying club." Que tipo de condicional é?', 'If she had more free time, she would join the flying club. Second conditional: situação hipotética (if + past, would + verbo). Com to be, usa-se were (was é comum na fala informal).', 2],
    ['Qual é a diferença? "If you heat ice, it melts" x "If it rains, the parade will be cancelled."', 'A primeira é zero conditional: verdade geral (present + present). A segunda é first conditional: consequência provável no futuro (present + will).', 2],
    ['Reescreva com unless: "If you don\'t check the fuel, you will have problems."', 'Unless you check the fuel, you will have problems. Unless = if not; por isso o verbo fica na afirmativa.', 2],
  ]
});

EEAR.add({
  id: 'ING11', m: 'ing', n: 11, t: 'Passive voice', peso: 3, h: 2,
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
<p class="dica">Na passiva, o tempo verbal aparece no verbo <i>to be</i>; o verbo principal permanece no particípio.</p>`,
  ex: [
    ['Passe para a passiva: "The mechanics are checking the engine."', '<p>"The engine <b>is being checked</b> by the mechanics."</p>'],
    ['Passe para a passiva: "The controller will close the runway."', '<p>"The runway <b>will be closed</b> (by the controller)." O tempo (futuro com will) passa para o <i>to be</i>: will be + particípio.</p>'],
    ['Passe para a ativa: "The hangar was built by the engineers in 2010."', '<p>"The engineers <b>built</b> the hangar in 2010." O agente (by the engineers) volta a ser o sujeito, e was built (simple past) vira built.</p>'],
    ['Quando omitir o agente? "Someone cleaned the cabin."', '<p>"The cabin <b>was cleaned</b>." Quando o agente é desconhecido ou óbvio (someone, people, they), ele costuma ser omitido.</p>']
  ],
  q: [
    ['"The 14-bis ___ by Santos Dumont in 1906."', ['flew', 'was flown', 'is flying', 'has flown'], 1, 'Passiva no passado: was + particípio (flown).'],
    ['Passive form of "They are painting the hangar":', ['The hangar is painted.', 'The hangar is being painted.', 'The hangar was painting.', 'The hangar has painted.'], 1, 'Present continuous na passiva: is being + particípio.'],
    ['"The tickets ___ already ___." (present perfect, passive)', ['have / sold', 'have / been sold', 'has / be sold', 'are / sold'], 1, 'Present perfect passivo: have been + particípio.'],
    ['"The report must ___ by Friday."', ['finish', 'be finished', 'finished', 'being finished'], 1, 'Modal na passiva: modal + be + particípio.'],
    ['"English ___ in many countries."', ['speaks', 'is spoken', 'is speaking', 'spoke'], 1, 'Passiva no presente: is + particípio.'],
    ['"The new radar ___ next month."', ['will install', 'will be installed', 'is installing', 'will been installed'], 1, 'Passiva com will: will + be + particípio. O radar não instala nada: ele é instalado.'],
    ['"The documents ___ when the inspector arrived."', ['were checking', 'were being checked', 'had checked', 'are checked'], 1, 'Ação em andamento no passado, na passiva: were being + particípio. "Were checking" e "had checked" são ativas, e "are checked" está no presente.'],
    ['Passive form of "Someone stole my wallet":', ['My wallet stole.', 'My wallet was stolen.', 'My wallet has stolen.', 'My wallet is stealing.'], 1, 'Simple past na passiva: was + particípio (stolen). O agente "someone" é omitido.'],
    ['Active form of "The letter was written by the captain":', ['The captain writes the letter.', 'The captain wrote the letter.', 'The captain has written the letter.', 'The captain was writing the letter.'], 1, '"Was written" está no simple past, então a ativa usa o simple past: wrote.'],
    ['"___ the flights cancelled because of the storm?"', ['Did', 'Were', 'Have', 'Was'], 1, 'Pergunta na passiva: o to be vai antes do sujeito, e "flights" é plural: Were. "Did" pediria verbo base, "Was" é singular e "Have" exigiria "been cancelled".']
  ],
  fc: [
    ['Passe para a voz passiva: "They clean the hangar every day." Que verbo mostra o tempo?', 'The hangar is cleaned every day. O tempo aparece no to be (is); o verbo principal vai para o particípio.', 2],
    ['Corrija: "The engine must checked before every flight."', 'The engine must be checked before every flight. Modal + be + particípio.', 2],
    ['Passe para a voz passiva: "The mechanics are repairing the radar right now."', 'The radar is being repaired (by the mechanics) right now. Present continuous na passiva: is/are being + particípio.', 2],
    ['Passe para a voz passiva, mantendo o tempo: "The engineers <b>tested</b> the new radar last week."', 'The new radar <b>was tested</b> (by the engineers) last week. Simple past → was/were + particípio; o agente pode ser omitido quando é óbvio.', 2],
    ['Passe para a voz passiva: "The Air Force will open a new school next year."', 'A new school will be opened (by the Air Force) next year. Will + be + particípio.', 2],
    ['Em qual frase o agente (by…) deve ser mantido?<br>a) "The bridge was built by workers."<br>b) "Dom Casmurro was written by Machado de Assis."', 'b) O agente é a informação importante (o autor). Em a, "by workers" é óbvio e costuma ser omitido: The bridge was built.', 2],
    ['Transforme em pergunta: "The documents were signed by the commander."', 'Were the documents signed by the commander? Na passiva, o to be vai antes do sujeito.', 2]
  ]
});

EEAR.add({
  id: 'ING12', m: 'ing', n: 12, t: 'Preposições, conectivos e quantificadores', peso: 2, h: 2.5,
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
    ['Corrija: "Despite it was raining, the jump took place."', 'Despite the rain, the jump took place (ou: Although it was raining…). Despite vem com substantivo ou -ing (ou the fact that), não com oração.', 2],
    ['Em "Although the runway was short, the pilot landed safely", que relação existe entre as ideias? Reescreva com but.', 'Contraste (concessão): a pista era curta, mas o pouso foi seguro. The runway was short, but the pilot landed safely.', 2],
    ['Reescreva com because of: "The launch was delayed because the wind was strong."', 'The launch was delayed because of the strong wind. Because of + substantivo; because + oração.', 2],
    ['Qual frase é mais positiva: "Few cadets passed the test" ou "A few cadets passed the test"?', 'A few: alguns passaram (tom positivo). Few: quase nenhum passou (tom negativo).', 2],
    ['Complete com little ou a little: "Hurry! We have ___ time left." e "Relax, we still have ___ time."', 'Little time (quase nenhum: urgência) e a little time (um pouco: ainda há algum). Os dois com incontáveis.', 2],
    ['Complete com How many ou How much: "___ fuel do we need?" e "___ passengers are on board?" E para perguntar o preço?', 'How much fuel (incontável) e how many passengers (contável). Preço também usa how much: How much is the ticket?', 2],
    ['Corrija: "The runway is enough long, but the plane is too much heavy."', 'The runway is long enough, but the plane is too heavy. Adjetivo + enough; too + adjetivo (sem much).', 2]
  ]
});

EEAR.add({
  id: 'ING13', m: 'ing', n: 13, t: 'Gerúndio e infinitivo, phrasal verbs, question tags e formação de palavras', peso: 2, h: 2.5,
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
<h3>Imperativo e subjuntivo</h3>
<ul>
<li><b>Imperativo</b>: verbo na forma base para ordens, instruções e avisos: <i>Open the door. Check your answers.</i> Negativa: <i>Don't touch the equipment.</i></li>
<li><b>Let's + verbo</b>: sugestão com inclusão do falante: <i>Let's review the lesson.</i></li>
<li><b>Subjuntivo</b> em estruturas formais de exigência ou recomendação: <i>It is essential that every candidate <b>be</b> on time.</i> / <i>They suggested that he <b>study</b> more.</i> O verbo permanece na forma base.</li>
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
    ['"We have run ___ of fuel." means that', ['we have a lot of fuel.', 'we have no more fuel.', 'we are buying fuel.', 'the fuel is expensive.'], 1, '"Run out of" = ficar sem.'],
    ['Choose the correct imperative form.', ['You to check your answers.', 'Check your answers.', 'Checking your answers.', 'Checked your answers.'], 1, 'O imperativo afirmativo usa o verbo na forma base.'],
    ['"It is essential that every candidate ___ on time."', ['is', 'be', 'was', 'being'], 1, 'No subjuntivo formal, após expressões de necessidade/recomendação, usa-se a forma base: be.']
  ],
  fc: [
    ['Corrija, se necessário: "She enjoys to fly", "He avoided to answer" e "They finished checking the list."', 'She enjoys flying; he avoided answering. A terceira está correta. Enjoy, avoid e finish são seguidos de -ing.', 2],
    ['Complete com a forma adequada de fly: "They decided ___", "We hope ___ next year" e "She refused ___ in bad weather."', 'To fly nas três: decide, hope e refuse são seguidos de to + verbo.', 2],
    ['Qual é a diferença? "The pilot stopped <b>to check</b> the map." x "The pilot stopped <b>checking</b> the map."', 'Stopped to check: parou (o que fazia) para conferir o mapa. Stopped checking: deixou de conferir o mapa.', 2],
    ['Corrija: "I\'m interested in learn to fly" e "Thank you for help me."', 'I\'m interested in learning to fly; thank you for helping me. Depois de preposição, o verbo vai para -ing.', 2],
    ['Complete com a question tag: "The tower called us, ___?", "You can\'t see the runway, ___?" e "She has finished, ___?"', 'Didn\'t it? / can you? / hasn\'t she? Afirmativa → tag negativa; negativa → tag afirmativa; mesmo auxiliar e pronome.', 2],
    ['Tag de "I am…" e "Let\'s…"', 'Aren\'t I? / Shall we?'],
    ['take off / give up / run out of', 'Decolar (tirar) / desistir / ficar sem.'],
    ['Complete com -ful ou -less: "The manual was ___ (use): it explained nothing." e "We are ___ (hope) about the results."', 'Useless (sem utilidade) e hopeful (esperançoso). -less = sem; -ful = cheio de.', 2],
    ['Transforme em ordens no imperativo: "You must fasten your seat belt" e "You mustn\'t touch the panel."', 'Fasten your seat belt. / Don\'t touch the panel. Imperativo: verbo na forma base; negativa com don\'t.', 2],
    ['Complete: "The instructor recommended that every cadet ___ (review) the checklist." Por que não "reviews"?', 'Review: em estruturas formais de recomendação ou exigência usa-se a forma base (subjuntivo), mesmo na 3ª pessoa. No inglês britânico também se usa should review.', 2]
  ]
});

EEAR.add({
  id: 'ING14', m: 'ing', n: 14, t: 'BCT · Perfect tenses e futuros avançados', peso: 2, h: 2,
  modalidades: ['bct'],
  teoria: `
<h3>Perfect tenses além do nível básico</h3>
<p>No BCT, o edital cobra <b>Perfect tenses</b> de forma ampla. O <b>present perfect</b> já foi estudado no núcleo comum; aqui entram as estruturas mais características do nível intermediário.</p>
<div class="tbl"><table><thead><tr><th>Tempo</th><th>Estrutura</th><th>Uso principal</th></tr></thead><tbody>
<tr><td>Past perfect</td><td>had + past participle</td><td>ação concluída antes de outra ação passada</td></tr>
<tr><td>Present perfect continuous</td><td>have/has been + -ing</td><td>duração de ação iniciada no passado e ligada ao presente</td></tr>
<tr><td>Past perfect continuous</td><td>had been + -ing</td><td>duração anterior a outro ponto no passado</td></tr>
<tr><td>Future perfect</td><td>will have + past participle</td><td>ação concluída antes de um ponto futuro</td></tr>
</tbody></table></div>
<p><i>When we arrived, the aircraft <b>had already taken off</b>.</i> / <i>She <b>has been studying</b> for three hours.</i> / <i>By next year, he <b>will have completed</b> the course.</i></p>
<h3>Future continuous</h3>
<p><b>will be + -ing</b>: ação em andamento em determinado momento futuro: <i>This time tomorrow, we <b>will be flying</b>.</i></p>
<p class="dica">Monte a linha do tempo. Se uma ação já tinha terminado antes de outra no passado, use past perfect. Se o marco é futuro e algo estará concluído antes dele, use future perfect.</p>`,
  ex: [
    ['Complete: "When I reached the gate, the aircraft ___ already ___."', '<p><b>had already departed</b>: a partida ocorreu antes de eu chegar ao portão.</p>'],
    ['Complete: "By 2030, she ___ the required flight hours."', '<p><b>will have completed</b>: ação concluída antes de um marco futuro.</p>'],
    ['"He was tired because he ___ all morning."', '<p><b>had been working</b>: duração anterior a outro ponto no passado.</p>'],
    ['Compare: "I have lived here for five years." x "I had lived there for five years when I moved."', '<p><b>Present perfect</b>: eu ainda moro aqui (ligado ao presente). <b>Past perfect</b>: os cinco anos terminaram antes de outra ação passada (a mudança).</p>']
  ],
  q: [
    ['"When the controller called, the pilot ___ the message."', ['already received', 'had already received', 'has already received', 'will receive'], 1, 'A recepção aconteceu antes de outra ação passada: past perfect.'],
    ['"She ___ for the EEAR for three hours, so she needs a break."', ['has been studying', 'had study', 'will have studied', 'studies'], 0, 'Duração ligada ao presente: present perfect continuous.'],
    ['"By next Friday, we ___ the report."', ['finish', 'finished', 'will have finished', 'had finished'], 2, 'Conclusão antes de um marco futuro: future perfect.'],
    ['"This time tomorrow, they ___ to Recife."', ['will be flying', 'have flown', 'had flown', 'fly'], 0, 'Ação em andamento em um momento futuro: future continuous.'],
    ['"Before the inspection began, the team ___ for several hours."', ['has worked', 'had been working', 'will work', 'works'], 1, 'Duração anterior a um ponto passado: past perfect continuous.'],
    ['"How long ___ English before you moved to London?"', ['have you studied', 'had you been studying', 'will you study', 'do you study'], 1, 'A duração termina num ponto do passado (a mudança): past perfect continuous. "Have you studied" ligaria a duração ao presente.'],
    ['"I ___ this aircraft three times this month."', ['have flown', 'had flown', 'fly', 'will have fly'], 0, '"This month" é um período que ainda não terminou: present perfect. "Will have fly" está malformado (seria will have flown).'],
    ['"By the time the rescue team arrived, the survivors ___ for two days."', ['waited', 'have waited', 'had been waiting', 'will have been waiting'], 2, '"By the time" + passado pede, na outra oração, uma duração anterior a esse ponto: past perfect continuous.'],
    ['"Next June, she ___ here for ten years."', ['will have worked', 'has worked', 'had worked', 'worked'], 0, 'Duração completada até um marco futuro (next June): future perfect.'],
    ['Choose the correct sentence.', ['I have seen that film yesterday.', 'I had seen that film before I read the book.', 'I have saw that film.', 'I will have see that film.'], 1, 'Past perfect para a ação anterior a outra no passado. "Yesterday" não combina com present perfect, "have saw" usa a forma errada e "will have see" deveria ser "will have seen".']
  ],
  fc: [
    ['Qual ação aconteceu primeiro? "When the doctor arrived, the patient had already woken up."', 'O paciente acordou primeiro (had woken up, past perfect); depois o médico chegou (arrived, simple past).', 2],
    ['Complete: "You look tired." "I ___ (study) for six hours."', 'I have been studying for six hours: duração de uma ação que começou no passado e chega até agora (have/has been + -ing).', 2],
    ['Complete: "The runway was wet because it ___ (rain) all morning."', 'Had been raining: duração anterior a outro ponto do passado (had been + -ing).', 2],
    ['Complete: "By the end of this year, I ___ (complete) the course."', 'Will have completed: ação concluída antes de um marco futuro (will have + particípio).', 2],
    ['Complete: "Don\'t call me at 9 tomorrow. I ___ (take) a test then."', 'I will be taking a test: ação em andamento num momento do futuro (will be + -ing).', 2],
    ['By the time + passado: que tempo costuma vir na outra oração?', 'Past perfect, para a ação concluída antes daquele ponto: By the time we arrived, they had left. É o uso esperado em provas e textos formais; na fala, o simple past às vezes aparece quando a sequência já está clara.', 2],
    ['By + marco futuro', 'Pede future perfect: By 2030, she will have finished.']
  ]
});

EEAR.add({
  id: 'ING15', m: 'ing', n: 15, t: 'BCT · Reported speech, voz reflexiva e forma enfática', peso: 2, h: 2.5,
  modalidades: ['bct'],
  teoria: `
<h3>Discurso direto e indireto</h3>
<p>Quando o verbo introdutor está no passado, é comum ocorrer <b>backshift</b>:</p>
<div class="tbl"><table><thead><tr><th>Direto</th><th>Indireto</th></tr></thead><tbody>
<tr><td>simple present</td><td>simple past</td></tr>
<tr><td>present continuous</td><td>past continuous</td></tr>
<tr><td>simple past / present perfect</td><td>past perfect</td></tr>
<tr><td>will</td><td>would</td></tr>
<tr><td>can / may / must</td><td>could / might / had to</td></tr>
</tbody></table></div>
<p>Marcadores também podem mudar: <i>today → that day; tomorrow → the next day; yesterday → the day before; now → then; here → there; this → that.</i></p>
<ul>
<li><b>say</b> normalmente não recebe objeto pessoal direto; <b>tell</b> recebe: <i>He said that… / He told me that…</i></li>
<li>Pergunta indireta usa ordem afirmativa: <i>"Where do you work?" → She asked where I worked.</i></li>
<li>Perguntas sim/não usam <b>if/whether</b>. Ordens: <b>told/asked + objeto + (not) to + verbo</b>.</li>
</ul>
<h3>Voz reflexiva</h3>
<p>Na construção reflexiva, sujeito e objeto representam a mesma pessoa ou coisa: <i>The pilot blamed <b>himself</b>.</i> Não confunda com o uso enfático do mesmo pronome: <i>The commander <b>himself</b> checked the report.</i></p>
<h3>Forma verbal enfática</h3>
<p><b>do / does / did + verbo base</b> pode reforçar uma afirmação: <i>I <b>do understand</b> the rule.</i> / <i>She <b>does know</b> the procedure.</i> / <i>He <b>did call</b> yesterday.</i></p>
<p class="dica">No reported speech, observe primeiro quem fala, para quem fala e quando. Depois ajuste pronomes, tempo verbal e marcadores de tempo/lugar.</p>`,
  ex: [
    ['Passe para o indireto: She said, "I will travel tomorrow."', '<p>She said (that) she <b>would travel the next day</b>.</p>'],
    ['Passe para o indireto: "Are you ready?" he asked me.', '<p>He asked me <b>if/whether I was ready</b>.</p>'],
    ['Dê ênfase a "I understand the rule".', '<p><b>I do understand the rule.</b></p>'],
    ['Passe para o indireto: "Don\'t open the door," the sergeant said to me.', '<p>The sergeant told me <b>not to open</b> the door. Ordem negativa: told + objeto + not to + verbo.</p>']
  ],
  q: [
    ['Direct: "I am tired." Reported: She said that she ___ tired.', ['is', 'was', 'has been', 'will be'], 1, 'Simple present recua para simple past.'],
    ['Direct: "I will call you tomorrow." Reported: He said he ___ me ___.', ['will call / tomorrow', 'would call / the next day', 'would call / yesterday', 'called / tomorrow'], 1, 'Will → would; tomorrow → the next day.'],
    ['Direct: "Where do you work?" Reported: She asked me ___.', ['where do I work', 'where I worked', 'where did I work', 'where I work did'], 1, 'Pergunta indireta usa ordem afirmativa e não usa do/did.'],
    ['"The cadet blamed ___ for the mistake."', ['him', 'his', 'himself', 'he'], 2, 'Sujeito e objeto são a mesma pessoa: voz/construção reflexiva.'],
    ['Choose the emphatic sentence.', ['She knows the rule.', 'She does know the rule.', 'She is knowing the rule.', 'She do knows the rule.'], 1, 'Ênfase no presente: does + verbo base.'],
    ['Direct: "Close the door," the officer told me. Reported: The officer told me ___ the door.', ['close', 'to close', 'closing', 'closed'], 1, 'Ordem no discurso indireto: told + objeto + to + verbo.'],
    ['Direct: "Don\'t touch the panel," she said to us. Reported: She told us ___ the panel.', ['not to touch', 'don\'t touch', 'to not touching', 'no touch'], 0, 'Ordem negativa: told + objeto + not to + verbo.'],
    ['Direct: "Are you a cadet?" he asked her. Reported: He asked her ___ a cadet.', ['if she was', 'was she', 'that she is', 'are you'], 0, 'Pergunta de sim ou não vira oração com if/whether, em ordem afirmativa e com backshift (are → was).'],
    ['Direct (said last week): "I finished the test yesterday." Reported: He said he ___ the test the day before.', ['finishes', 'had finished', 'will finish', 'has finished'], 1, 'Simple past recua para past perfect, e yesterday vira the day before. "Has finished" não combina com um tempo passado definido.'],
    ['"You didn\'t lock the door!" "I ___ lock it! Check again."', ['did', 'do', 'was', 'have'], 0, 'Forma enfática no passado para contestar: did + verbo base (I did lock it).']
  ],
  fc: [
    ['Passe para o discurso indireto: "I will finish the report," she said.', 'She said (that) she would finish the report. Com o verbo introdutor no passado, will costuma passar a would.', 2],
    ['Reported: tomorrow / yesterday', 'The next day / the day before.'],
    ['Corrija, se necessário: "The sergeant said me that the inspection was cancelled." e "She told that she was tired."', 'The sergeant <b>told me</b> (ou said to me) that… / She <b>said</b> that she was tired. Tell pede objeto pessoal (told me); say, em geral, não.', 2],
    ['Passe para o discurso indireto: "Did you see the warning?" he asked me.', 'He asked me if (ou whether) I had seen the warning. Pergunta de sim ou não: if/whether, ordem afirmativa e recuo do tempo verbal.', 2],
    ['Em qual frase há construção reflexiva?<br>a) "The pilot hurt himself."<br>b) "The pilot himself opened the door."', 'a) Sujeito e objeto são a mesma pessoa.<br>b) Uso enfático: himself reforça "o próprio piloto" e pode sair da frase sem mudar a estrutura.', 2],
    ['Complete com a forma enfática: "You don\'t like flying." "I ___ flying! I\'m just tired."', 'I do like flying! Do/does/did + verbo base reforça a afirmação, muitas vezes para contestar o que foi dito.', 2],
    ['Passe para o discurso indireto: "Wait here," the guard told us.', 'The guard told us to wait there. Ordem: told + objeto + to + verbo; here costuma passar a there.', 2],
    ['Passe para o discurso indireto: "Don\'t open the hatch," the captain told the crew.', 'The captain told the crew not to open the hatch. Ordem negativa: not to + verbo (e não don\'t).', 2]
  ]
});

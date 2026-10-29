/* Língua Inglesa — módulos 10 a 16 */
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
    ['First conditional', 'If + present, will + verbo.'],
    ['Second conditional', 'If + past, would + verbo (were para todos).'],
    ['Zero conditional', 'If + present, present: verdades gerais.'],
    ['unless', 'If not.'],
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
  ],
  q: [
    ['"The first airplane ___ by Santos Dumont."', ['flew', 'was flown', 'is flying', 'has flown'], 1, 'Passiva no passado: was + particípio (flown).'],
    ['Passive form of "They are painting the hangar":', ['The hangar is painted.', 'The hangar is being painted.', 'The hangar was painting.', 'The hangar has painted.'], 1, 'Present continuous na passiva: is being + particípio.'],
    ['"The tickets ___ already ___." (present perfect, passive)', ['have / sold', 'have / been sold', 'has / be sold', 'are / sold'], 1, 'Present perfect passivo: have been + particípio.'],
    ['"The report must ___ by Friday."', ['finish', 'be finished', 'finished', 'being finished'], 1, 'Modal na passiva: modal + be + particípio.'],
    ['"English ___ in many countries."', ['speaks', 'is spoken', 'is speaking', 'spoke'], 1, 'Passiva no presente: is + particípio.']
  ],
  fc: [
    ['Passiva: estrutura', 'To be no tempo da ativa + past participle.'],
    ['Passiva com modal', 'Modal + be + particípio: must be checked.'],
    ['Passiva do present continuous', 'Is/are being + particípio.'],
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
    ['Verbos + -ing', 'Enjoy, avoid, finish, mind, suggest, keep, practice, consider.'],
    ['Verbos + to', 'Want, decide, hope, plan, need, expect, agree, promise, refuse.'],
    ['stop doing x stop to do', 'Parar de fazer x parar para fazer.'],
    ['Depois de preposição', 'Sempre -ing (interested in learning).'],
    ['Question tag: regra', 'Afirmativa → tag negativa; negativa → tag afirmativa; mesmo auxiliar.'],
    ['Tag de "I am…" e "Let\'s…"', 'Aren\'t I? / Shall we?'],
    ['take off / give up / run out of', 'Decolar (tirar) / desistir / ficar sem.'],
    ['-ful x -less', 'Cheio de (useful) x sem (useless).'],
    ['Imperativo', 'Verbo na forma base: Check your answers. Negativa: Don\'t + verbo.'],
    ['Subjuntivo formal', 'It is essential that he be… / They suggested that she study…']
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
    ['"He was tired because he ___ all morning."', '<p><b>had been working</b>: duração anterior a outro ponto no passado.</p>']
  ],
  q: [
    ['"When the controller called, the pilot ___ the message."', ['already received', 'had already received', 'has already received', 'will receive'], 1, 'A recepção aconteceu antes de outra ação passada: past perfect.'],
    ['"She ___ for the EEAR for three hours, so she needs a break."', ['has been studying', 'had study', 'will have studied', 'studies'], 0, 'Duração ligada ao presente: present perfect continuous.'],
    ['"By next Friday, we ___ the report."', ['finish', 'finished', 'will have finished', 'had finished'], 2, 'Conclusão antes de um marco futuro: future perfect.'],
    ['"This time tomorrow, they ___ to Recife."', ['will be flying', 'have flown', 'had flown', 'fly'], 0, 'Ação em andamento em um momento futuro: future continuous.'],
    ['"Before the inspection began, the team ___ for several hours."', ['has worked', 'had been working', 'will work', 'works'], 1, 'Duração anterior a um ponto passado: past perfect continuous.']
  ],
  fc: [
    ['Past perfect', 'Had + participle: ação anterior a outra no passado.'],
    ['Present perfect continuous', 'Have/has been + -ing: duração ligada ao presente.'],
    ['Past perfect continuous', 'Had been + -ing: duração anterior a outro ponto passado.'],
    ['Future perfect', 'Will have + participle: concluída antes de um marco futuro.'],
    ['Future continuous', 'Will be + -ing: ação em andamento no futuro.']
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
    ['Dê ênfase a "I understand the rule".', '<p><b>I do understand the rule.</b></p>']
  ],
  q: [
    ['Direct: "I am tired." Reported: She said that she ___ tired.', ['is', 'was', 'has been', 'will be'], 1, 'Simple present recua para simple past.'],
    ['Direct: "I will call you tomorrow." Reported: He said he ___ me ___.', ['will call / tomorrow', 'would call / the next day', 'would call / yesterday', 'called / tomorrow'], 1, 'Will → would; tomorrow → the next day.'],
    ['Direct: "Where do you work?" Reported: She asked me ___.', ['where do I work', 'where I worked', 'where did I work', 'where I work did'], 1, 'Pergunta indireta usa ordem afirmativa e não usa do/did.'],
    ['"The cadet blamed ___ for the mistake."', ['him', 'his', 'himself', 'he'], 2, 'Sujeito e objeto são a mesma pessoa: voz/construção reflexiva.'],
    ['Choose the emphatic sentence.', ['She knows the rule.', 'She does know the rule.', 'She is knowing the rule.', 'She do knows the rule.'], 1, 'Ênfase no presente: does + verbo base.']
  ],
  fc: [
    ['Reported: will', 'Vira would quando há backshift.'],
    ['Reported: tomorrow / yesterday', 'The next day / the day before.'],
    ['say x tell', 'Tell recebe objeto pessoal: told me.'],
    ['Pergunta indireta', 'Ordem afirmativa; sim/não usa if/whether.'],
    ['Voz reflexiva', 'Sujeito e objeto são a mesma pessoa: himself, herself etc.'],
    ['Forma enfática', 'Do/does/did + verbo base: I do know; he did call.']
  ]
});

EEAR.add({
  id: 'ING16', m: 'ing', n: 16, t: 'BCT · Determiners, numerals e estrutura do período', peso: 2, h: 2.5,
  modalidades: ['bct'],
  teoria: `
<h3>Determiners</h3>
<p>Determinantes vêm antes do substantivo e limitam seu sentido. Além de artigos, possessivos e demonstrativos, o BCT exige atenção a:</p>
<div class="tbl"><table><tbody>
<tr><td><b>each</b></td><td>cada elemento individualmente; substantivo singular</td></tr>
<tr><td><b>every</b></td><td>todos os elementos de um grupo, vistos em conjunto; singular</td></tr>
<tr><td><b>both</b></td><td>os dois</td></tr>
<tr><td><b>either</b></td><td>um ou outro de dois</td></tr>
<tr><td><b>neither</b></td><td>nenhum dos dois</td></tr>
<tr><td><b>all</b></td><td>todos / todo</td></tr>
</tbody></table></div>
<h3>Numerals</h3>
<p>Cardinais indicam quantidade (<i>one, twenty, one hundred</i>); ordinais indicam ordem (<i>first, second, third, twenty-first</i>). Atenção a datas, frações, decimais e porcentagens em textos técnicos.</p>
<h3>Adjetivos formados por -ing e -ed</h3>
<p><b>-ing</b> descreve o que provoca a sensação (<i>a tiring flight</i>); <b>-ed</b> descreve quem sente (<i>tired passengers</i>). Exemplos: <i>interesting/interested, confusing/confused, exciting/excited</i>.</p>
<h3>Período composto</h3>
<ul>
<li><b>Coordenação</b>: orações independentes ligadas por <i>and, but, or, so, yet</i>.</li>
<li><b>Subordinação</b>: uma oração depende da outra: <i>because, although, if, when, while, since, unless, whereas</i>.</li>
<li>Orações relativas: <i>who, which, that, whose, where, when</i>.</li>
</ul>
<h3>Marcadores do discurso</h3>
<p>Eles organizam o raciocínio: adição (<i>moreover, furthermore, in addition</i>), contraste (<i>however, nevertheless, on the other hand</i>), consequência (<i>therefore, consequently, as a result</i>), exemplificação (<i>for example, for instance</i>) e sequência (<i>first, then, finally</i>).</p>
<h3>Tag answers</h3>
<p>Além de formar a question tag, saiba responder ao sentido real da frase: <i>You don't work here, do you? — No, I don't.</i> Em inglês, <b>yes</b> confirma a afirmação positiva e <b>no</b> confirma a negativa.</p>
<p class="dica">Em conectivos, observe a relação lógica entre as duas ideias. Em determiners, observe se o substantivo é singular/plural e se o grupo tem dois ou mais elementos.</p>`,
  ex: [
    ['Complete: "___ candidate must show an ID." (cada candidato individualmente)', '<p><b>Each</b> candidate must show an ID.</p>'],
    ['"The flight was exhausting. The passengers were ___."', '<p><b>exhausted</b>: -ed descreve quem sente o efeito.</p>'],
    ['Escolha o conector: "The weather was poor; ___, the flight departed."', '<p><b>however</b> ou <b>nevertheless</b>, pois há contraste.</p>']
  ],
  q: [
    ['"___ of the two routes is acceptable."', ['Every', 'Either', 'Much', 'Any of all'], 1, '"Either" = um ou outro de dois.'],
    ['"___ student received the same instruction."', ['Every', 'Both', 'Neither of', 'Many of'], 0, '"Every" + substantivo singular refere-se a todos os membros do grupo.'],
    ['"The briefing was so ___ that the cadets became ___."', ['confused / confusing', 'confusing / confused', 'confuse / confused', 'confusing / confuse'], 1, '-ing causa a sensação; -ed descreve quem a sente.'],
    ['"The runway was wet; ___, the aircraft landed safely."', ['therefore', 'however', 'for example', 'because'], 1, 'Há contraste entre pista molhada e pouso seguro: however.'],
    ['Which sentence contains coordination?', ['I stayed because it rained.', 'I studied, and I passed.', 'When he arrived, we left.', 'The pilot who called is here.'], 1, 'Duas orações independentes ligadas por "and": coordenação.'],
    ['"You didn\'t miss the briefing, did you?" "___, I didn\'t."', ['Yes', 'No', 'So', 'Either'], 1, 'A resposta negativa é "No, I didn\'t".']
  ],
  fc: [
    ['each x every', 'Each: individualmente. Every: todos do grupo, com singular.'],
    ['both / either / neither', 'Os dois / um dos dois / nenhum dos dois.'],
    ['-ing x -ed', 'Causa a sensação / sente a sensação.'],
    ['Coordenação', 'Orações independentes ligadas por and, but, or, so, yet.'],
    ['Discourse marker de contraste', 'However, nevertheless, on the other hand.'],
    ['Discourse marker de consequência', 'Therefore, consequently, as a result.'],
    ['Tag answer negativa', 'No, I don’t / No, I didn’t: confirma a negativa.']
  ]
});

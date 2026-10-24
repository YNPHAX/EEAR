/* Língua Inglesa — módulos 10 a 13 */
EEAR.add({
  id: 'ING10', m: 'ing', n: 10, t: 'Conditionals e wish', peso: 3, h: 2.5,
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
  id: 'ING11', m: 'ing', n: 11, t: 'Passive voice e reported speech', peso: 3, h: 2.5,
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

/* Língua Inglesa — módulos 5 a 9 */
EEAR.add({
  id: 'ING05', m: 'ing', n: 5, t: 'Presente: simple, continuous e there to be', peso: 3, h: 2.5,
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
    ['"We ___ to Natal next Friday. We already have the tickets."', ['flew', 'are flying', 'flies', 'flown'], 1, 'Plano já combinado para o futuro: present continuous.']
  ],
  fc: [
    ['Por que o simple present em "The bus to the base leaves at 7 on weekdays" e em "Ice melts above 0 °C"?', 'A primeira é um horário fixo de rotina; a segunda, uma verdade geral. O simple present expressa hábitos, rotinas, horários e fatos permanentes.', 2],
    ['Corrija: "The captain fly to Recife and watch the weather every day. She also studys at night."', 'The captain flies… and watches… She also studies at night. 3ª pessoa do singular: consoante + y → -ies; terminados em ch → -es.', 2],
    ['Corrija: "Does the sergeant works on Sundays?" e "He don\'t speak Spanish."', 'Does the sergeant work on Sundays? (depois de does, verbo na forma base). He doesn\'t speak Spanish (3ª pessoa: doesn\'t).', 2],
    ['Complete com o present continuous: "Look! The mechanics ___ (change) the tire, and the pilot ___ (wait) in the cabin."', 'Are changing / is waiting: am/is/are + -ing, concordando com o sujeito; change perde o e (changing).', 2],
    ['Qual frase soa natural neste contexto e por quê?<br>a) "We are needing more fuel."<br>b) "We need more fuel."', 'b) Need indica estado, e com verbos de estado a forma natural costuma ser a simples. O continuous com eles é raro e depende de contexto especial; aqui, "We need more fuel" é o esperado.', 2],
    ['Complete com there is ou there are: "___ some water on the runway, and ___ two trucks next to it."', 'There is some water (incontável: singular) e there are two trucks (plural).', 2],
    ['"The squadron is leaving for Manaus on Monday." A frase fala do presente ou do futuro? Como se sabe?', 'Do futuro: um plano já combinado, indicado por "on Monday". O present continuous também expressa compromissos e planos acertados.', 2]
  ]
});

EEAR.add({
  id: 'ING06', m: 'ing', n: 6, t: 'Passado: simple past e past continuous', peso: 3, h: 2,
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
<p class="dica">Depois de did/didn't o verbo volta para a forma base: "Did he went" está errado; o certo é "Did he go".</p>`,
  ex: [
    ['Passe para o passado: "They fly to Manaus."', '<p>"They <b>flew</b> to Manaus." Negativa: "They didn\'t fly". Pergunta: "Did they fly…?"</p>'],
    ['Complete: "We ___ (watch) TV when the lights ___ (go) out."', '<p>"We <b>were watching</b> TV when the lights <b>went</b> out." A ação longa é interrompida pela curta.</p>'],
  ],
  q: [
    ['"Yesterday the pilot ___ the plane to Brasília."', ['fly', 'flied', 'flew', 'flown'], 2, 'Fly é irregular: fly – flew – flown. "Yesterday" pede simple past.'],
    ['"___ you ___ the news last night?"', ['Did / saw', 'Did / see', 'Do / saw', 'Were / see'], 1, 'Pergunta no simple past: Did + verbo base (see).'],
    ['"She ___ dinner when I arrived."', ['cooked', 'was cooking', 'cooks', 'is cooking'], 1, 'Ação em andamento interrompida por outra: past continuous.'],
    ['Choose the correct sentence.', ['He didn\'t went to class.', 'He didn\'t go to class.', 'He doesn\'t went to class.', 'He not went to class.'], 1, 'Depois de didn\'t o verbo fica na forma base: go.'],
    ['The past and past participle of "write" are', ['wrote / written', 'writed / writed', 'wrote / wrote', 'written / wrote'], 0, 'Write – wrote – written.'],
    ['"While I ___ the report, my computer crashed."', ['wrote', 'was writing', 'write', 'have written'], 1, '"While" introduz a ação longa em andamento: past continuous.'],
    ['"We ___ at the airport two hours ago."', ['are', 'were', 'was', 'have been'], 1, '"Two hours ago" pede simple past; com we: were.'],
    ['The past of "teach", "buy" and "think" is', ['teached, buyed, thinked', 'taught, bought, thought', 'taught, buyed, thought', 'teached, bought, thought'], 1, 'Os três são irregulares terminados em -ought/-aught: taught, bought, thought.']
  ],
  fc: [
    ['Corrija: "Did the tower gave clearance?" e "The pilot didn\'t saw the warning."', 'Did the tower give clearance? / The pilot didn\'t see the warning. Depois de did/didn\'t, o verbo volta à forma base.', 2],
    ['fly / see / take (past e participle)', 'Flew-flown / saw-seen / took-taken.'],
    ['go / write / do (past e participle)', 'Went-gone / wrote-written / did-done.'],
    ['O que "At 8 p.m. yesterday, the crew was preparing the aircraft" diz sobre a ação?', 'Que ela estava em andamento naquele momento do passado (começou antes e seguiu depois das 20h). Past continuous: was/were + -ing.', 2],
    ['Complete com <i>when</i> ou <i>while</i> e o tempo verbal adequado: "The pilot ___ (talk) to the tower ___ the alarm went off."', 'The pilot <b>was talking</b> to the tower <b>when</b> the alarm went off. Ação longa no past continuous; a curta, que interrompe, no simple past com when.', 2],
  ]
});

EEAR.add({
  id: 'ING07', m: 'ing', n: 7, t: 'Present perfect', peso: 3, h: 2,
  teoria: `
<h3>Present perfect</h3>
<p><b>have/has + past participle</b>. Liga o passado ao presente:</p>
<ul>
<li>Experiência, sem tempo definido: <i>I <b>have flown</b> in a helicopter.</i></li>
<li>Ação que começou no passado e continua: <i>She <b>has lived</b> here <b>for</b> five years / <b>since</b> 2020.</i></li>
<li>Ação recente com efeito no presente: <i>I <b>have lost</b> my keys</i> (ainda estão perdidas).</li>
</ul>
<p><b>for</b> + período (for two hours, for ten years); <b>since</b> + ponto de início (since Monday, since 2019, since I was a child).</p>
<p>Advérbios típicos: <b>ever</b> (alguma vez, em perguntas), <b>never</b>, <b>already</b> (já; em afirmativas e também em perguntas, quando indica surpresa: Have you already finished?), <b>yet</b> (já, em perguntas; ainda, em negativas, no fim da frase), <b>just</b> (acabou de), <b>recently</b>, <b>so far</b>.</p>
<ul>
<li><i>Have you <b>ever</b> been to Recife?</i></li>
<li><i>I have <b>already</b> finished. / I haven't finished <b>yet</b>. / Have you finished <b>yet</b>?</i></li>
<li><i>The plane has <b>just</b> landed.</i></li>
</ul>
<h3>Present perfect x simple past</h3>
<p>Com tempo passado definido (<i>yesterday, last year, in 2015, ago</i>) usa-se o <b>simple past</b>: <i>I <b>visited</b> Paris in 2015.</i> Sem tempo definido, ou com período que ainda não terminou (<i>today, this week</i>), usa-se o <b>present perfect</b>: <i>I <b>have visited</b> Paris twice.</i></p>
<p class="dica">Viu "for/since", "ever/never", "already/yet", "just"? Pense em present perfect. Viu uma data ou "ago"? Simple past.</p>`,
  ex: [
    ['Complete com for ou since: "He has worked here ___ 2018" e "___ eight years".', '<p><b>since</b> 2018 (ponto de início) e <b>for</b> eight years (duração).</p>'],
    ['"I ___ (see) that movie last week" ou "I ___ (see) that movie three times"?', '<p>"I <b>saw</b> that movie last week" (tempo definido) e "I <b>have seen</b> that movie three times" (experiência).</p>'],
  ],
  q: [
    ['"She ___ in Brazil since 2015."', ['lives', 'lived', 'has lived', 'is living'], 2, '"Since 2015" indica ação que começou no passado e continua: present perfect.'],
    ['"Have you ___ been to the Amazon?"', ['ever', 'yet', 'already', 'since'], 0, '"Ever" (alguma vez) é usado em perguntas de experiência.'],
    ['"I ___ my homework yesterday."', ['have finished', 'finished', 'have finish', 'had finish'], 1, '"Yesterday" é tempo definido: simple past.'],
    ['"The plane has ___ landed. The passengers are getting off now."', ['yet', 'just', 'ever', 'since'], 1, '"Just" = acabou de.'],
    ['"I haven\'t received the results ___."', ['already', 'yet', 'just', 'ever'], 1, 'Em negativas, no fim da frase, "yet" = ainda.'],
    ['"They have been married ___ ten years."', ['since', 'for', 'ago', 'during'], 1, 'Duração de tempo: for.'],
    ['Choose the correct sentence.', ['I have seen him two days ago.', 'I saw him two days ago.', 'I have saw him two days ago.', 'I had see him two days ago.'], 1, '"Ago" exige simple past.'],
    ['The past participle of "go", "be" and "take" is', ['went, was, took', 'gone, been, taken', 'goed, been, took', 'gone, being, taken'], 1, 'Go – went – gone; be – was/were – been; take – took – taken.']
  ],
  fc: [
    ['Corrija: "She has fly that aircraft many times" e "They has finished the inspection."', 'She has flown (have/has + past participle: fly – flew – flown). They have finished (they pede have).', 2],
    ['Complete com for ou since: "The base has been closed ___ Monday" e "The base has been closed ___ three days."', 'Since Monday (ponto de início) e for three days (duração).', 2],
    ['Compare: "Have you finished <b>yet</b>?" e "Have you <b>already</b> finished?" O que a segunda sugere?', 'Surpresa ou expectativa de que a ação aconteceu cedo. Already aparece em afirmativas e também em perguntas; yet é a pergunta neutra e, em negativas, significa ainda.', 2],
    ['just + present perfect', 'Acabou de: The plane has just landed.'],
    ['Qual frase está incorreta?<br>a) "I have visited the museum last Sunday."<br>b) "She has lived here since 2020."', 'a) Com tempo passado definido (last Sunday), usa-se o simple past: I visited the museum last Sunday.<br>b) Correta: ação que começou no passado e continua.', 2],
  ]
});

EEAR.add({
  id: 'ING08', m: 'ing', n: 8, t: 'Futuro: will, going to e outras formas', peso: 2, h: 2,
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
    ['"Someone is at the door." "OK, I ___ open it."', ['am going to', "'ll", 'open', 'have opened'], 1, 'Decisão tomada no momento da fala: will.'],
    ['"I ___ study engineering next year. I have already enrolled."', ['will', 'am going to', 'study', 'studied'], 1, 'Plano já decidido: going to.'],
    ['"I\'ll call you as soon as I ___ at the hotel."', ['will arrive', 'arrive', 'arrived', 'am going to arrive'], 1, 'Depois de "as soon as" com sentido de futuro usa-se o presente.'],
    ['"The flight to Recife ___ at 6:45 every morning."', ['leaves', 'will leaving', 'is going leave', 'left'], 0, 'Horários fixos: simple present.'],
    ['The negative form of "will" is', ["willn't", "won't", "don't will", "not will"], 1, 'Will not = won\'t.'],
    ['"I promise I ___ tell anyone."', ['won\'t', 'am not going', 'don\'t', 'didn\'t'], 0, 'Promessas usam will: I won\'t tell anyone.'],
    ['"I ___ the captain at 3 p.m. tomorrow. It is already in my calendar."', ['meets', 'am meeting', 'met', 'have met'], 1, 'Compromisso já marcado para o futuro: present continuous.']
  ],
  fc: [
    ['Que uso de will há em cada frase?<br>a) "The phone is ringing. I\'ll get it."<br>b) "I think it will rain later."<br>c) "I\'ll help you with the bags."', 'a) Decisão tomada na hora.<br>b) Previsão baseada em opinião.<br>c) Oferta.', 2],
    ['Complete com will ou going to: "Look at that smoke! The engine ___ fail." e "I\'ve already bought the ticket: I ___ visit my parents."', 'Is going to fail (previsão com evidência visível) e am going to visit (plano já decidido).', 2],
    ['Para um compromisso já marcado na agenda, o que soa mais natural: "I will meet the major at 10 tomorrow" ou "I\'m meeting the major at 10 tomorrow"?', 'I\'m meeting…: o present continuous é o mais natural para compromissos combinados. Will não está errado, mas soa mais como decisão ou previsão.', 2],
    ['Corrija: "I will call you when the plane will land."', 'I will call you when the plane lands. Depois de when, as soon as, before e until, com sentido de futuro, usa-se o presente.', 2],
    ['won\'t', 'Will not.']
  ]
});

EEAR.add({
  id: 'ING09', m: 'ing', n: 9, t: 'Modal verbs', peso: 3, h: 2.5,
  teoria: `
<p>Modais vêm seguidos do verbo na forma base (sem "to"), não recebem -s na 3ª pessoa e fazem negativa e pergunta sozinhos: <i>She <b>can</b> fly. She <b>can't</b> fly. <b>Can</b> she fly?</i></p>
<div class="tbl"><table><thead><tr><th>Modal</th><th>Uso</th><th>Exemplo</th></tr></thead><tbody>
<tr><td>can</td><td>habilidade, permissão informal, possibilidade</td><td>I can swim. Can I go?</td></tr>
<tr><td>could</td><td>habilidade no passado, pedido educado, possibilidade</td><td>I could run fast as a child. Could you help me?</td></tr>
<tr><td>may</td><td>permissão formal, possibilidade</td><td>May I come in? It may rain.</td></tr>
<tr><td>might</td><td>possibilidade, muitas vezes com um pouco menos de certeza que may (a diferença é pequena e depende do contexto)</td><td>He might be late.</td></tr>
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
<p class="dica">A pegadinha favorita: "You mustn't" (proibido) x "You don't have to" (não precisa). E nada de "to" depois do modal: "can to swim" está errado.</p>`,
  ex: [
    ['Qual a diferença: "You mustn\'t wear a uniform" x "You don\'t have to wear a uniform"?', '<p>"Mustn\'t" = é <b>proibido</b> usar uniforme. "Don\'t have to" = <b>não é obrigatório</b> (pode usar se quiser).</p>'],
    ['"His lights are off. He ___ be sleeping." Qual modal?', '<p>Dedução forte: "He <b>must</b> be sleeping."</p>'],
  ],
  q: [
    ['"You ___ smoke on board. It is forbidden."', ['don\'t have to', 'mustn\'t', 'shouldn\'t have', 'might not'], 1, 'Proibição: mustn\'t.'],
    ['"Tomorrow is Sunday. You ___ get up early."', ['mustn\'t', 'don\'t have to', 'can\'t', 'must'], 1, 'Não há obrigação: don\'t have to.'],
    ['Choose the correct sentence.', ['She cans speak English.', 'She can to speak English.', 'She can speak English.', 'She can speaks English.'], 2, 'Modal + verbo base, sem -s e sem "to".'],
    ['"You look tired. You ___ go to bed earlier."', ['should', 'mustn\'t', 'might', 'can\'t'], 0, 'Conselho: should.'],
    ['"___ I use your phone, please?" (formal request)', ['Must', 'May', 'Should', 'Will'], 1, 'Pedido de permissão formal: May I…?'],
    ['"When I was five, I ___ read."', ['can', 'could', 'may', 'must'], 1, 'Habilidade no passado: could.'],
    ['"The lights are on. Someone ___ be at home."', ['must', 'mustn\'t', 'shouldn\'t', 'needn\'t'], 0, 'Dedução forte a partir de evidência: must.'],
    ['"Next year I ___ drive, because I will be 18."', ['can', 'will be able to', 'could', 'am able'], 1, 'Habilidade no futuro: will be able to.'],
    ['"He ___ come to the party. I\'m not sure." (weak possibility)', ['must', 'might', 'has to', 'should'], 1, 'Possibilidade incerta: might.']
  ],
  fc: [
    ['Aviso no hangar: "Visitors <b>mustn\'t</b> enter without a badge. Pilots <b>don\'t have to</b> wear a helmet here." O que é proibido e o que é opcional?', 'Proibido: visitantes entrarem sem crachá (mustn\'t = proibição). Opcional: pilotos usarem capacete (don\'t have to = não é obrigatório, mas é permitido).', 2],
    ['Corrija: "He shoulds to rest more" e "Does he must wear a helmet?"', 'He should rest more (sem -s e sem to). Must he wear a helmet? ou Does he have to wear a helmet? Modais fazem a pergunta sem do/does.', 2],
    ['Em "He flew for ten hours today. He <b>must</b> be exhausted", must indica obrigação ou dedução?', 'Dedução forte a partir de evidência (dez horas de voo): com certeza ele está exausto. Não é obrigação.', 2],
    ['Que sentido tem could em cada frase?<br>a) "Could you open the window, please?"<br>b) "When I was ten, I could swim very well."', 'a) Pedido educado.<br>b) Habilidade no passado.', 2],
    ['Em "The flight <b>may</b> be delayed" e "The flight <b>might</b> be delayed", há diferença de sentido?', 'Pouca: as duas indicam possibilidade, e os próprios falantes nativos divergem sobre qual é mais provável. Might muitas vezes soa um pouco menos certo, conforme o contexto. Para permissão formal, use may: May I come in?', 2],
    ['Complete: "After the course, you ___ (can) fly at night." Por que não "will can"?', 'You will be able to fly at night. Can não tem forma de futuro; em outros tempos usa-se be able to.', 2]
  ]
});

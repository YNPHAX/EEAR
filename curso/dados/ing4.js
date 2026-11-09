/* Língua Inglesa — módulo 16 */
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
    ['Escolha o conector: "The weather was poor; ___, the flight departed."', '<p><b>however</b> ou <b>nevertheless</b>, pois há contraste.</p>'],
    ['Escreva por extenso a data 21/05 em inglês.', '<p><b>the twenty-first of May</b> (ou May twenty-first). Por escrito: May 21st. Datas usam numerais ordinais.</p>']
  ],
  q: [
    ['"___ of the two routes is acceptable."', ['Every', 'Either', 'Much', 'Any of all'], 1, '"Either" = um ou outro de dois.'],
    ['"___ student received the same instruction."', ['Every', 'Both', 'Neither of', 'Many of'], 0, '"Every" + substantivo singular refere-se a todos os membros do grupo.'],
    ['"The briefing was so ___ that the cadets became ___."', ['confused / confusing', 'confusing / confused', 'confuse / confused', 'confusing / confuse'], 1, '-ing causa a sensação; -ed descreve quem a sente.'],
    ['"The runway was wet; ___, the aircraft landed safely."', ['therefore', 'however', 'for example', 'because'], 1, 'Há contraste entre pista molhada e pouso seguro: however.'],
    ['Which sentence contains coordination?', ['I stayed because it rained.', 'I studied, and I passed.', 'When he arrived, we left.', 'The pilot who called is here.'], 1, 'Duas orações independentes ligadas por "and": coordenação.'],
    ['"You didn\'t miss the briefing, did you?" "___, I didn\'t."', ['Yes', 'No', 'So', 'Either'], 1, 'A resposta negativa é "No, I didn\'t".'],
    ['"I have two brothers. ___ of them is a pilot: one is a teacher and the other is a doctor."', ['Both', 'Either', 'Neither', 'All'], 2, 'Nenhum dos dois é piloto: neither. "Both" e "all" pediriam verbo no plural, e "all" não se usa para dois.'],
    ['"The aircraft took off on the ___ of May."', ['twenty-one', 'twenty-first', 'twentieth-one', 'twenty-oneth'], 1, 'Datas usam ordinais: twenty-first (21st).'],
    ['"The instructor spoke to ___ of the four cadets individually."', ['every', 'each', 'either', 'both'], 1, '"Each of" destaca cada um individualmente. "Every" não é seguido de "of", e "either" e "both" se referem a dois.'],
    ['"The course is free. ___, it can be studied offline."', ['However', 'Therefore', 'Moreover', 'Although'], 2, 'A segunda frase acrescenta uma vantagem: adição (moreover). Não há contraste nem consequência, e "although" não inicia frase seguido de vírgula.']
  ],
  fc: [
    ['Complete com each ou every: "___ of the two engines was inspected" e "___ cadet in the school wears a uniform."', 'Each of the two engines (cada um, individualmente; every não vem seguido de of nem se usa para dois). Every cadet (todos do grupo).', 2],
    ['both / either / neither', 'Os dois / um dos dois / nenhum dos dois.'],
    ['Corrija: "The cadets were very interesting in the exciting flight, but the long briefing was bored."', 'The cadets were very interested in the exciting flight, but the long briefing was boring. -ed: quem sente; -ing: o que provoca a sensação.', 2],
    ['Em "The weather was bad, so the drill was cancelled", há coordenação ou subordinação? Que relação "so" expressa?', 'Coordenação: duas orações independentes ligadas por so, que expressa consequência.', 2],
    ['Complete com um marcador de contraste: "The aircraft is old. ___, it is very reliable." Por que therefore não serve?', 'However (ou nevertheless, on the other hand). Therefore indica consequência, e ser confiável não é consequência de ser velho.', 2],
    ['Una as frases com um marcador de consequência: "The radio failed. The crew used hand signals."', 'The radio failed; therefore (ou consequently, as a result), the crew used hand signals.', 2],
    ['"You don\'t smoke, do you?" "Yes, I do." O que a pessoa quis dizer?', 'Que ela fuma: yes acompanha a resposta afirmativa (I do). Para confirmar que não fuma, diria No, I don\'t.', 2],
    ['Numerais ordinais', 'First, second, third, fourth… twenty-first: usados em datas e ordem.'],
    ['Una as frases com um marcador de adição: "The base has a gym. It has a pool."', 'The base has a gym. In addition (ou Moreover, Furthermore), it has a pool. O marcador acrescenta uma informação.', 2]
  ]
});

/* Língua Portuguesa — módulos 11 a 14 */
EEAR.add({
  id: 'POR11', m: 'por', n: 11, t: 'Concordância verbal e nominal', peso: 3, h: 3,
  teoria: `
<h3>Concordância verbal</h3>
<p>Regra geral: o verbo concorda com o núcleo do sujeito em número e pessoa. Casos que mais caem:</p>
<div class="tbl"><table><tbody>
<tr><td>Sujeito composto antes do verbo</td><td>plural: <i>O piloto e o mecânico <b>chegaram</b>.</i></td></tr>
<tr><td>Sujeito composto depois do verbo</td><td>plural ou concorda com o mais próximo: <i><b>Chegaram</b> (ou <b>chegou</b>) o piloto e o mecânico.</i></td></tr>
<tr><td>Núcleos com "ou"</td><td>exclusão: singular (<i>Pedro ou Paulo <b>será</b> o líder</i>); sem exclusão: plural (<i>Calor ou frio me <b>incomodam</b></i>)</td></tr>
<tr><td>Coletivo</td><td>singular: <i>A tripulação <b>embarcou</b>.</i></td></tr>
<tr><td>A maioria de, grande parte de + plural</td><td>singular ou plural: <i>A maioria dos alunos <b>passou/passaram</b>.</i></td></tr>
<tr><td>Um dos que</td><td>plural (preferível): <i>Ele é um dos que mais <b>estudam</b>.</i></td></tr>
<tr><td>Mais de um</td><td>singular: <i>Mais de um candidato <b>faltou</b>.</i></td></tr>
<tr><td>Porcentagem</td><td>com o número ou com o especificador: <i>1% dos alunos <b>faltou</b>; 30% da turma <b>faltou</b>; 30% dos alunos <b>faltaram</b>.</i></td></tr>
<tr><td>Relativo "que"</td><td>concorda com o antecedente: <i>Fui eu que <b>fiz</b>. Fomos nós que <b>fizemos</b>.</i></td></tr>
<tr><td>Relativo "quem"</td><td>3ª pessoa ou o antecedente: <i>Fui eu quem <b>fez</b> (ou <b>fiz</b>).</i></td></tr>
<tr><td>Haver (existir) e fazer (tempo)</td><td>singular: <i><b>Houve</b> falhas. <b>Faz</b> três anos. <b>Deve haver</b> vagas.</i></td></tr>
<tr><td>Existir, ocorrer, acontecer</td><td>concordam normalmente: <i><b>Existem</b> falhas. <b>Ocorreram</b> atrasos.</i></td></tr>
<tr><td>Passiva sintética</td><td>com o sujeito: <i><b>Consertam-se</b> motores.</i></td></tr>
<tr><td>VTI + se</td><td>singular: <i><b>Precisa-se</b> de mecânicos.</i></td></tr>
</tbody></table></div>
<h4>Verbo ser</h4>
<ul>
<li>Horas, datas e distâncias: concorda com o numeral: <i><b>São</b> dez horas. <b>É</b> uma hora. <b>São</b> cinco quilômetros.</i></li>
<li>Com sujeito <i>tudo, isto, isso, aquilo</i> e predicativo plural, prefere o plural: <i>Tudo <b>são</b> flores.</i></li>
<li>Entre um nome de coisa e um plural, concorda com o plural: <i>O problema <b>são</b> as notas.</i> Com pessoa, concorda com a pessoa: <i>O professor <b>era</b> as esperanças da turma.</i></li>
</ul>
<h3>Concordância nominal</h3>
<ul>
<li>Adjetivo <b>depois</b> de vários substantivos: concorda com o mais próximo ou vai ao plural (masculino, se houver masculino): <i>camisa e calça <b>nova</b>/<b>novas</b>; o casaco e a calça <b>novos</b>.</i></li>
<li>Adjetivo <b>antes</b> dos substantivos: concorda com o mais próximo: <i><b>nova</b> camisa e calça.</i></li>
<li>Variam: <b>anexo, incluso, obrigado, mesmo, próprio, quite</b>: <i>Seguem <b>anexas</b> as fotos. Ela disse "<b>obrigada</b>". Elas <b>mesmas</b> fizeram.</i></li>
<li><b>Menos</b> não varia: <i>menos pessoas</i> ("menas" não existe na norma-padrão). <b>Alerta</b>, pela gramática tradicional, também não: <i>os soldados estão alerta</i>.</li>
<li><b>Meio</b>: adjetivo (= metade) varia: <i>meia garrafa, meio-dia e meia</i>; advérbio (= um pouco) não varia: <i>Ela está meio cansada.</i></li>
<li><b>Bastante</b>: adjetivo (= muitos) varia: <i>bastantes livros</i>; advérbio não varia: <i>bastante cansados</i>.</li>
<li><b>É proibido / é necessário / é bom</b>: sem artigo, invariável: <i>É proibido entrada. Água é bom.</i> Com artigo, concorda: <i>É proibida <b>a</b> entrada. A água é boa.</i></li>
</ul>
<p class="dica">Pergunte sempre "quem faz a ação?" e localize o núcleo do sujeito, mesmo que ele esteja depois do verbo ou longe dele.</p>`,
  ex: [
    ['Corrija: "Faltou à prova muitos candidatos."', '<p>O sujeito é "muitos candidatos" (posposto). O verbo vai ao plural: "<b>Faltaram</b> à prova muitos candidatos".</p>'],
    ['"Seguem ___ os documentos" (anexo).', '<p>"Anexo" concorda com o substantivo: "Seguem <b>anexos</b> os documentos".</p>'],
    ['"Ela ficou ___ preocupada" (meio).', '<p>Aqui "meio" é advérbio (= um pouco) e não varia: "Ela ficou <b>meio</b> preocupada".</p>']
  ],
  q: [
    ['A concordância verbal está correta em', ['Houveram muitos acidentes na pista.', 'Faz dez anos que me alistei.', 'Fazem dez anos que me alistei.', 'Existe muitos candidatos.'], 1, '"Fazer" indicando tempo é impessoal: faz. "Houve" fica no singular; "existir" vai ao plural (existem).'],
    ['Assinale a frase correta.', ['Vende-se terrenos.', 'Precisam-se de técnicos.', 'Alugam-se salas.', 'Conserta-se relógios.'], 2, 'Passiva sintética: o verbo concorda com o sujeito (salas são alugadas). "Precisa-se de" fica no singular por ser VTI.'],
    ['A concordância nominal está correta em', ['Seguem anexo as fotografias.', 'As alunas disseram: "Muito obrigado".', 'Elas mesmas organizaram a festa.', 'Havia bastante pessoas.'], 2, '"Mesmo" concorda: elas mesmas. O correto seria anexas, obrigadas e bastantes pessoas.'],
    ['"___ meio-dia e ___." Completa corretamente:', ['É / meio', 'É / meia', 'São / meia', 'São / meio'], 1, '"Meio-dia" é singular (é) e "meia" = meia hora, concorda com hora.'],
    ['Está correto o emprego de "menos" em', ['Havia menas pessoas na fila.', 'Havia menos pessoas na fila.', 'Ela estava menas cansada.', 'Comprei menas frutas.'], 1, '"Menos" é invariável; "menas" não existe na norma-padrão.'],
    ['A frase em que o verbo concorda corretamente com o sujeito é', ['A tripulação embarcaram cedo.', 'Mais de um piloto relataram turbulência.', 'Fui eu que resolvi o problema.', 'Fui eu que resolveu o problema.'], 2, 'Com "que", o verbo concorda com o antecedente "eu": fui eu que resolvi. Coletivo pede singular (a tripulação embarcou) e "mais de um" também (relatou).'],
    ['"É ___ a presença de todos" e "É ___ paciência." Completam as lacunas:', ['necessário / necessário', 'necessária / necessário', 'necessário / necessária', 'necessária / necessária'], 1, 'Com artigo ("a presença"), concorda: necessária. Sem artigo ("paciência"), fica invariável: necessário.'],
    ['Em "___ cinco horas da tarde quando o avião pousou", a lacuna é preenchida por', ['Era', 'Eram', 'Foi', 'Seria'], 1, 'Em indicação de horas, "ser" concorda com o numeral: eram cinco horas.'],
    ['"Havia ___ candidatos na sala, e todos pareciam ___ nervosos." Completam corretamente as lacunas:', ['bastante / bastante', 'bastantes / bastantes', 'bastantes / bastante', 'bastante / bastantes'], 2, 'Antes do substantivo, "bastante" é adjetivo (= muitos) e varia: bastantes candidatos. Antes do adjetivo "nervosos", é advérbio (= muito) e não varia.'],
    ['"O piloto e a comissária ___ ___." Completam a frase com correção:', ['chegou / cansado', 'chegaram / cansados', 'chegaram / cansadas', 'chegou / cansadas'], 1, 'Sujeito composto anteposto: plural. Adjetivo referente a masculino e feminino: masculino plural (cansados).']
  ],
  fc: [
    ['Sujeito composto posposto', 'Verbo no plural ou concordando com o núcleo mais próximo.'],
    ['"Mais de um aluno ___"', 'Singular: faltou.'],
    ['Fui eu que… / Fui eu quem…', 'Que: concorda com eu (fiz). Quem: 3ª pessoa (fez) ou eu (fiz).'],
    ['Ser com horas', 'Concorda com o numeral: são dez horas; é uma hora.'],
    ['Anexo, obrigado, mesmo, próprio, quite', 'Variam com o substantivo: anexas, obrigada, mesmas.'],
    ['Meio adjetivo x advérbio', 'Adjetivo (metade) varia: meia hora. Advérbio (um pouco) não: meio cansada.'],
    ['É proibido entrada x é proibida a entrada', 'Sem artigo: invariável. Com artigo: concorda.'],
    ['Bastante adjetivo x advérbio', 'Adjetivo (= muitos) varia: bastantes livros. Advérbio (= muito) não: bastante nervosos.']
  ]
});

EEAR.add({
  id: 'POR12', m: 'por', n: 12, t: 'Regência verbal, regência nominal e crase', peso: 3, h: 3,
  teoria: `
<h3>Regência verbal: verbos que mais caem</h3>
<div class="tbl"><table><thead><tr><th>Verbo</th><th>Sentido e regência</th></tr></thead><tbody>
<tr><td>assistir</td><td>ver: VTI (a) — <i>Assisti <b>ao</b> filme.</i> Ajudar: VTD — <i>O médico assistiu o paciente.</i> Caber: VTI — <i>Assiste <b>ao</b> réu esse direito.</i></td></tr>
<tr><td>aspirar</td><td>respirar: VTD — <i>aspirar o ar</i>. Desejar: VTI (a) — <i>aspira <b>ao</b> cargo</i>.</td></tr>
<tr><td>visar</td><td>mirar ou vistar: VTD — <i>visar o alvo, visar o passaporte</i>. Pretender: VTI (a) — <i>visa <b>ao</b> sucesso</i>.</td></tr>
<tr><td>obedecer / desobedecer</td><td>VTI (a): <i>Obedeça <b>ao</b> regulamento.</i></td></tr>
<tr><td>preferir</td><td>VTDI: preferir algo <b>a</b> algo: <i>Prefiro física <b>a</b> química.</i> (Nunca "prefiro mais… do que".)</td></tr>
<tr><td>implicar</td><td>acarretar: VTD — <i>A falha implica riscos</i> (sem "em").</td></tr>
<tr><td>ir, chegar, voltar</td><td>preposição <b>a</b>: <i>Cheguei <b>a</b> Brasília. Fomos <b>ao</b> hangar.</i></td></tr>
<tr><td>esquecer / lembrar</td><td>sem pronome: VTD — <i>Esqueci o documento.</i> Com pronome: VTI (de) — <i>Esqueci-me <b>do</b> documento.</i></td></tr>
<tr><td>pagar / perdoar</td><td>algo (OD) a alguém (OI): <i>Paguei a conta <b>ao</b> garçom.</i></td></tr>
<tr><td>responder</td><td>VTI (a): <i>Respondi <b>ao</b> questionário.</i></td></tr>
<tr><td>namorar</td><td>VTD: <i>Ela namora João</i> (sem "com").</td></tr>
<tr><td>simpatizar / antipatizar</td><td>VTI (com), não pronominal: <i>Simpatizo com ele</i> (e não "me simpatizo").</td></tr>
<tr><td>morar, residir, situar-se</td><td>preposição <b>em</b>: <i>Reside <b>na</b> Rua das Flores.</i></td></tr>
</tbody></table></div>
<h3>Regência nominal</h3>
<p>Nomes também pedem preposição: <i>favorável a, apto a/para, acessível a, ansioso por/para, compatível com, residente em, alheio a, contrário a, imune a, devoção a/por</i>.</p>
<h3>Crase: a + a</h3>
<p>Ocorre quando a preposição <b>a</b> (exigida pela regência) se junta ao artigo <b>a</b> (de palavra feminina) ou ao <b>a</b> inicial de aquele, aquela, aquilo.</p>
<p><b>Truque</b>: troque a palavra feminina por uma masculina. Se aparecer "ao", há crase: <i>Fui à escola</i> → <i>Fui ao colégio</i>.</p>
<h4>Crase obrigatória</h4>
<ul>
<li>Locuções femininas: <i>às vezes, à noite, às pressas, à medida que, à custa de, à beça</i>.</li>
<li>Horas determinadas: <i>às 13h, à uma hora, das 8h às 12h</i>.</li>
<li>"À moda de", mesmo subentendida: <i>bife à milanesa, gol à Pelé</i>.</li>
<li>Aquele, aquela, aquilo: <i>Refiro-me <b>àquele</b> piloto.</i></li>
<li>A qual / as quais, quando o verbo pede "a": <i>A norma <b>à qual</b> obedeço.</i></li>
</ul>
<h4>Crase proibida</h4>
<ul>
<li>Antes de palavra masculina (exceto "à moda de"): <i>a pé, a cavalo</i>.</li>
<li>Antes de verbo: <i>começou a estudar</i>.</li>
<li>Antes de pronomes pessoais, de tratamento (exceto senhora e senhorita) e da maioria dos indefinidos: <i>a ela, a Vossa Excelência, a qualquer pessoa</i>.</li>
<li>Antes de "uma" (artigo indefinido): <i>fui a uma reunião</i>.</li>
<li>Em palavras repetidas: <i>cara a cara, gota a gota</i>.</li>
<li>"A" no singular antes de palavra no plural: <i>Falei a pessoas estranhas.</i></li>
<li>Cidades sem artigo: <i>Vou a Roma</i> (volto <b>de</b> Roma). Com artigo: <i>Vou à Bahia</i> (volto <b>da</b> Bahia).</li>
<li>"Casa" sem determinante e "terra" (oposta a bordo): <i>Voltei a casa. O marinheiro desceu a terra.</i> Com determinante: <i>Voltei à casa dos meus pais.</i></li>
</ul>
<h4>Crase facultativa</h4>
<p>Antes de possessivos femininos (<i>à minha / a minha mãe</i>), de nomes próprios femininos (<i>à Maria / a Maria</i>) e depois de "até" (<i>até à / até a praia</i>).</p>
<p class="dica">"Volto da, crase há; volto de, crase pra quê?" vale para nomes de lugar. Para o resto, use a troca por uma palavra masculina.</p>`,
  ex: [
    ['"Assisti o jogo" está correto?', '<p>No sentido de ver, "assistir" pede preposição a: "Assisti <b>ao</b> jogo".</p>'],
    ['Há crase em "Fui a Curitiba" e em "Fui a Bahia"?', '<p>"Volto de Curitiba": sem crase (<b>a Curitiba</b>). "Volto da Bahia": com crase (<b>à Bahia</b>).</p>'],
    ['Corrija: "Prefiro mais estudar do que trabalhar."', '<p>"Prefiro estudar <b>a</b> trabalhar." Preferir não aceita "mais" nem "do que".</p>']
  ],
  q: [
    ['A regência verbal está correta em', ['Assisti o filme ontem.', 'Prefiro física do que química.', 'O cadete aspira ao oficialato.', 'Obedeça o regulamento.'], 2, 'No sentido de desejar, "aspirar" pede a: aspira ao oficialato. O certo seria assisti ao filme, prefiro física a química, obedeça ao regulamento.'],
    ['O acento indicativo de crase está correto em', ['Fui à pé até a base.', 'Chegamos às 7h.', 'Ele começou à estudar.', 'Entreguei à ele o relatório.'], 1, 'Horas determinadas levam crase: às 7h. Não há crase antes de masculino (a pé), verbo (a estudar) ou pronome pessoal (a ele).'],
    ['Há erro de crase em', ['Refiro-me àquela prova.', 'Ficaram cara à cara.', 'Saímos às pressas.', 'Comeu bife à milanesa.'], 1, 'Não há crase em palavras repetidas: cara a cara.'],
    ['"A decisão implica ___ mudanças" — completa corretamente a lacuna:', ['em', 'nas', '(nada: implica mudanças)', 'com'], 2, 'No sentido de acarretar, "implicar" é transitivo direto: implica mudanças.'],
    ['Assinale a frase correta quanto à crase.', ['Vou à Roma nas férias.', 'Vou a Bahia nas férias.', 'Vou à Bahia nas férias.', 'Volto à Recife amanhã.'], 2, 'Volto da Bahia → vou à Bahia. Volto de Roma, de Recife → sem crase.'],
    ['A regência do verbo "esquecer" está correta em', ['Esqueci do documento.', 'Esqueci-me o documento.', 'Esqueci-me do documento.', 'Me esqueci o documento.'], 2, 'Pronominal: esquecer-se de algo. Não pronominal: esquecer algo (esqueci o documento).'],
    ['Em "A cidade ___ me refiro é Guaratinguetá", a lacuna se completa com', ['que', 'a que', 'à que', 'em que'], 1, 'Referir-se a algo: "a cidade a que me refiro" (ou "à qual me refiro"). Antes de "que" não há crase.'],
    ['A crase é facultativa em', ['Entreguei o livro à minha irmã.', 'Saí às 8h.', 'Fiquei à espera.', 'Refiro-me àquilo.'], 0, 'Antes de pronome possessivo feminino a crase é facultativa: à minha / a minha irmã.'],
    ['A regência nominal está correta em', ['Ele é apto com o serviço.', 'O plano é favorável a todos.', 'Ela é residente à Rua Sete.', 'Estou ansioso de você.'], 1, '"Favorável a" está correto. O certo seria apto a/para, residente na Rua Sete, ansioso por.'],
    ['"O médico assistiu o paciente." Nessa frase, "assistir" significa', ['ver.', 'ajudar, dar assistência.', 'caber.', 'morar.'], 1, 'No sentido de ajudar, prestar assistência, "assistir" é transitivo direto.']
  ],
  fc: [
    ['Assistir (ver)', 'VTI com a: assisti ao filme.'],
    ['Preferir', 'Preferir algo a algo, sem "mais" e sem "do que".'],
    ['Implicar (acarretar)', 'VTD: implica riscos (sem "em").'],
    ['Aspirar (desejar) e visar (pretender)', 'VTI com a: aspira ao cargo; visa ao lucro.'],
    ['Truque da crase', 'Troque por palavra masculina: se virar "ao", há crase.'],
    ['Crase com cidades', 'Volto da → à (Bahia). Volto de → a (Roma).'],
    ['Quando a crase é proibida', 'Masculino, verbo, pronome pessoal, "uma", palavras repetidas, a + plural.'],
    ['Crase facultativa', 'Possessivo feminino, nome próprio feminino, até a.']
  ]
});

EEAR.add({
  id: 'POR13', m: 'por', n: 13, t: 'Pontuação', peso: 2, h: 2,
  teoria: `
<h3>Vírgula: quando NÃO usar</h3>
<ul>
<li>Entre <b>sujeito e verbo</b>: <i>Os candidatos aprovados(,) farão o exame médico.</i> ✗</li>
<li>Entre <b>verbo e complemento</b>: <i>O sargento entregou(,) o relatório.</i> ✗</li>
<li>Entre o nome e seu complemento ou adjunto restritivo.</li>
</ul>
<h3>Vírgula: quando usar</h3>
<ul>
<li><b>Enumeração</b>: <i>Estude português, inglês, matemática e física.</i></li>
<li><b>Aposto explicativo</b>: <i>A EEAR, escola de sargentos, fica em Guaratinguetá.</i></li>
<li><b>Vocativo</b>: <i>Cadete, aproxime-se.</i></li>
<li><b>Adjunto adverbial deslocado</b>: <i>Na manhã de domingo, faremos o simulado.</i> (curto: vírgula opcional — <i>Hoje(,) estudarei.</i>)</li>
<li><b>Oração adjetiva explicativa</b>: <i>O Sol, que é uma estrela, ilumina a Terra.</i></li>
<li><b>Oração adverbial anteposta</b>: <i>Quando o avião pousou, aplaudimos.</i></li>
<li><b>Conjunção deslocada</b>: <i>Estudou; não passou, porém, na primeira fase.</i></li>
<li><b>Expressões explicativas</b>: isto é, ou seja, por exemplo, aliás.</li>
<li><b>Elipse do verbo (zeugma)</b>: <i>Eu fui ao treino; ela, à aula.</i></li>
<li><b>Orações coordenadas</b>: assindéticas e sindéticas (exceto, em geral, as aditivas com "e" de mesmo sujeito). Com sujeitos diferentes, a vírgula antes do "e" é aceita: <i>O piloto decolou, e a torre acompanhou.</i></li>
</ul>
<h3>Outros sinais</h3>
<ul>
<li><b>Ponto e vírgula</b>: separa orações longas ou que já têm vírgulas, e itens de enumeração.</li>
<li><b>Dois-pontos</b>: antes de citação, enumeração ou explicação: <i>Só quero uma coisa: passar.</i></li>
<li><b>Travessão</b>: fala de personagem; isolar expressão (como vírgulas, com ênfase).</li>
<li><b>Aspas</b>: citação, ironia, estrangeirismo, gíria.</li>
<li><b>Parênteses</b>: comentário acessório.</li>
<li><b>Reticências</b>: interrupção, hesitação, suspense.</li>
</ul>
<h3>Vírgula muda sentido</h3>
<ul>
<li><i>Os alunos que estudaram passaram</i> (restringe) x <i>Os alunos, que estudaram, passaram</i> (todos estudaram).</li>
<li><i>Não, quero café</i> x <i>Não quero café.</i></li>
</ul>
<p class="dica">Se a vírgula separa sujeito de verbo ou verbo de complemento, está errada. Comece checando isso em cada alternativa.</p>`,
  ex: [
    ['Pontue: "Ontem à noite o comandante Silva reuniu a tropa."', '<p>"Ontem à noite, o comandante Silva reuniu a tropa." A vírgula marca o adjunto adverbial deslocado (aqui ela é recomendada, por ser uma expressão maior).</p>'],
    ['Justifique a vírgula em "Ele estudou física; ela, química."', '<p>A vírgula indica a <b>elipse do verbo</b> (ela estudou química): zeugma.</p>'],
    ['Por que está errado "O avião da FAB, pousou cedo"?', '<p>A vírgula separa o sujeito ("O avião da FAB") do verbo ("pousou").</p>']
  ],
  q: [
    ['A pontuação está correta em', ['Os candidatos aprovados, farão o teste físico.', 'O sargento entregou, o relatório ao tenente.', 'Em Guaratinguetá, os alunos fazem o curso.', 'O instrutor, explicou a manobra.'], 2, 'O adjunto adverbial deslocado "Em Guaratinguetá" pode ser isolado por vírgula. Nas demais a vírgula separa sujeito de verbo ou verbo de complemento.'],
    ['A vírgula foi usada para isolar o vocativo em', ['Cadete, apresente-se ao oficial.', 'O cadete, que estava atrasado, correu.', 'Hoje, haverá formatura.', 'Comprei lápis, borracha e caneta.'], 0, '"Cadete" é chamamento: vocativo, isolado por vírgula.'],
    ['"Paulo estudou matemática; Ana, física." A vírgula depois de "Ana" indica', ['vocativo.', 'aposto.', 'elipse do verbo.', 'enumeração.'], 2, 'A vírgula marca a omissão do verbo "estudou": zeugma.'],
    ['Assinale a frase em que a retirada das vírgulas altera o sentido.', ['Hoje, vamos ao hangar.', 'Os pilotos, que estavam cansados, dormiram.', 'Pedro, venha cá.', 'Em seguida, saímos.'], 1, 'Sem vírgulas, a oração adjetiva vira restritiva: só os pilotos cansados dormiram. Com vírgulas, todos estavam cansados.'],
    ['Os dois-pontos estão bem empregados em', ['Ele disse: que viria.', 'Precisamos de três itens: caneta, lápis e borracha.', 'O avião: decolou cedo.', 'Estudei: muito.'], 1, 'Dois-pontos antecedem enumeração: caneta, lápis e borracha.'],
    ['Há erro de pontuação em', ['Quando chegou, todos se levantaram.', 'A EEAR, escola de sargentos, forma especialistas.', 'Os alunos do curso de controle de tráfego, estudam inglês.', 'Estudou muito; não conseguiu, porém, a vaga.'], 2, 'A vírgula separa o sujeito ("Os alunos do curso de controle de tráfego") do verbo "estudam".'],
    ['A conjunção "porém" está corretamente pontuada em', ['Ele treinou, não venceu porém.', 'Ele treinou; não venceu, porém, a prova.', 'Ele treinou porém, não venceu.', 'Ele, treinou porém não venceu.'], 1, 'Deslocada para o meio da oração, a adversativa fica entre vírgulas.'],
    ['As aspas foram usadas para marcar ironia em', ['Ele chegou "pontualmente": duas horas atrasado.', 'O livro "Dom Casmurro" é de Machado.', 'O piloto disse: "Preparar para pouso".', 'Ela usa o termo "deadline".'], 0, 'Chegar duas horas atrasado não é pontualidade: as aspas marcam ironia.'],
    ['A vírgula está correta em', ['Eu e você, vamos juntos.', 'Disse-me, que voltaria.', 'Ao terminar a prova, revise as respostas.', 'Os alunos estudiosos, passaram.'], 2, 'A oração reduzida adverbial anteposta ("Ao terminar a prova") é separada por vírgula.'],
    ['Na frase "Não, quero café", a vírgula', ['é desnecessária.', 'muda o sentido: a pessoa recusa algo e quer café.', 'indica que a pessoa não quer café.', 'separa sujeito e verbo.'], 1, 'Com a vírgula, o "não" responde a outra coisa, e a pessoa afirma que quer café.']
  ],
  fc: [
    ['Duas proibições básicas da vírgula', 'Não separar sujeito de verbo nem verbo de complemento.'],
    ['Vírgula obrigatória: 5 casos', 'Vocativo, aposto explicativo, oração adjetiva explicativa, enumeração, elipse do verbo.'],
    ['Adjunto adverbial deslocado', 'Pede vírgula (opcional se for curto).'],
    ['Conjunção adversativa deslocada', 'Fica entre vírgulas: não venceu, porém, a prova.'],
    ['Dois-pontos', 'Antes de citação, enumeração ou explicação.'],
    ['Zeugma e vírgula', 'A vírgula marca o verbo omitido: Eu fui ao treino; ela, à aula.'],
    ['Vírgula na oração adjetiva', 'Com vírgula: explicativa (todos). Sem: restritiva (alguns).']
  ]
});

EEAR.add({
  id: 'POR14', m: 'por', n: 14, t: 'Semântica, figuras e funções da linguagem', peso: 3, h: 2.5,
  teoria: `
<h3>Relações de sentido</h3>
<ul>
<li><b>Sinônimos</b> (sentido próximo) e <b>antônimos</b> (sentido oposto).</li>
<li><b>Homônimos</b>: mesma pronúncia e/ou grafia, sentidos diferentes: <i>cela/sela</i> (homófonos), <i>colher</i> (verbo)/<i>colher</i> (talher) (homógrafos), <i>são</i> (verbo, santo, sadio) (perfeitos).</li>
<li><b>Parônimos</b>: parecidos, mas diferentes:</li>
</ul>
<div class="tbl"><table><tbody>
<tr><td>eminente (ilustre) / iminente (prestes a ocorrer)</td><td>ratificar (confirmar) / retificar (corrigir)</td></tr>
<tr><td>descrição (ato de descrever) / discrição (reserva)</td><td>emigrar (sair do país) / imigrar (entrar)</td></tr>
<tr><td>flagrante (evidente) / fragrante (perfumado)</td><td>deferir (atender) / diferir (adiar, ser diferente)</td></tr>
<tr><td>cessão (ato de ceder) / sessão (reunião) / seção (divisão)</td><td>comprimento (extensão) / cumprimento (saudação)</td></tr>
<tr><td>infligir (aplicar pena) / infringir (violar)</td><td>tráfego (trânsito) / tráfico (comércio ilegal)</td></tr>
<tr><td>mandato (período de cargo) / mandado (ordem judicial)</td><td>vultoso (grande) / vultuoso (inchado)</td></tr>
</tbody></table></div>
<p><b>Polissemia</b>: uma palavra com vários sentidos ligados (<i>pé</i> de mesa, de página). <b>Ambiguidade</b>: frase com dois sentidos (<i>Vi o piloto do helicóptero</i>).</p>
<h3>Figuras de linguagem</h3>
<h4>De palavra</h4>
<ul>
<li><b>Metáfora</b>: comparação implícita: <i>Meu coração é um balde despejado.</i></li>
<li><b>Comparação</b>: com conectivo (como, tal qual): <i>Forte como um touro.</i></li>
<li><b>Metonímia</b>: troca por relação de proximidade: autor pela obra (<i>li Machado</i>), parte pelo todo (<i>não tinha um teto</i>), continente pelo conteúdo (<i>bebeu um copo</i>), marca pelo produto (<i>comprei um gilete</i>).</li>
<li><b>Catacrese</b>: metáfora já gasta, por falta de palavra própria: <i>pé da mesa, asa da xícara</i>.</li>
<li><b>Sinestesia</b>: mistura de sentidos: <i>voz doce, cheiro áspero</i>.</li>
<li><b>Antonomásia / perífrase</b>: nome por característica: <i>o Rei do Futebol, a Cidade Maravilhosa</i>.</li>
</ul>
<h4>De pensamento</h4>
<ul>
<li><b>Antítese</b>: ideias opostas: <i>Nasce o sol e não dura mais que um dia.</i></li>
<li><b>Paradoxo</b>: opostos que se fundem numa ideia aparentemente absurda: <i>Amor é fogo que arde sem se ver.</i></li>
<li><b>Hipérbole</b>: exagero: <i>Já te disse um milhão de vezes.</i></li>
<li><b>Eufemismo</b>: suavização: <i>Ele partiu desta para melhor.</i></li>
<li><b>Ironia</b>: dizer o contrário: <i>Que beleza, perdi o voo!</i></li>
<li><b>Prosopopeia</b> (personificação): <i>O vento cantava na pista.</i></li>
<li><b>Gradação</b>: sequência crescente ou decrescente: <i>Um passo, dois, mil passos.</i></li>
</ul>
<h4>De construção (sintaxe)</h4>
<ul>
<li><b>Elipse</b>: omissão de termo fácil de deduzir: <i>Na sala, apenas três alunos.</i></li>
<li><b>Zeugma</b>: omissão de termo já dito: <i>Ele gosta de física; eu, de química.</i></li>
<li><b>Pleonasmo</b>: repetição para dar ênfase (<i>Vi com meus próprios olhos</i>). Se não tem valor expressivo, é vício: <i>subir para cima</i>.</li>
<li><b>Polissíndeto</b>: repetição da conjunção: <i>E corre, e pula, e grita.</i> <b>Assíndeto</b>: ausência dela: <i>Cheguei, vi, venci.</i></li>
<li><b>Anáfora</b>: repetição no início de versos ou frases.</li>
<li><b>Hipérbato</b>: inversão da ordem: <i>Ouviram do Ipiranga as margens plácidas…</i></li>
<li><b>Silepse</b>: concordância com a ideia: <i>A gente chegamos</i> (pessoa); <i>Os brasileiros somos otimistas</i> (pessoa); <i>Vossa Excelência está cansado</i> (gênero).</li>
<li><b>Anacoluto</b>: termo solto, sem função na frase: <i>Eu, parece que não vou.</i></li>
</ul>
<h4>Sonoras</h4>
<p><b>Aliteração</b> (repetição de consoantes: <i>o rato roeu a roupa do rei</i>), <b>assonância</b> (de vogais), <b>onomatopeia</b> (imitação de som).</p>
<h3>Funções da linguagem</h3>
<div class="tbl"><table><tbody>
<tr><td>Referencial</td><td>foco na informação (notícia, texto científico)</td></tr>
<tr><td>Emotiva (expressiva)</td><td>foco no emissor, 1ª pessoa, sentimentos</td></tr>
<tr><td>Conativa (apelativa)</td><td>foco no receptor, imperativo, vocativo (propaganda)</td></tr>
<tr><td>Fática</td><td>testar o canal: "alô?", "entendeu?", "câmbio"</td></tr>
<tr><td>Metalinguística</td><td>a língua falando de si mesma (dicionário, poema sobre poesia)</td></tr>
<tr><td>Poética</td><td>foco na forma da mensagem (ritmo, sonoridade, figuras)</td></tr>
</tbody></table></div>
<p class="dica">Metáfora não tem conectivo; comparação tem. Antítese apenas opõe; paradoxo funde os opostos numa afirmação ilógica.</p>`,
  ex: [
    ['Identifique a figura: "Os sinos choravam a morte do herói."', '<p><b>Prosopopeia</b>: sinos não choram; atribui-se ação humana a um objeto.</p>'],
    ['"O perigo é iminente" ou "eminente"?', '<p><b>Iminente</b> (prestes a acontecer). Eminente significa ilustre, notável.</p>'],
    ['Qual a função predominante em "Compre já! Só hoje, 50% de desconto"?', '<p><b>Conativa (apelativa)</b>: busca convencer o receptor, com verbo no imperativo.</p>']
  ],
  q: [
    ['Em "Ele leu Machado de Assis nas férias", há', ['metáfora.', 'metonímia.', 'hipérbole.', 'eufemismo.'], 1, 'O autor está no lugar da obra: metonímia.'],
    ['A frase com paradoxo é', ['Ela é linda como uma flor.', 'Estou morrendo de fome.', 'É um contentamento descontente.', 'O vento sussurrava.'], 2, '"Contentamento descontente" funde ideias opostas numa só: paradoxo (oximoro). As outras: comparação, hipérbole, prosopopeia.'],
    ['Assinale a alternativa em que o parônimo está corretamente empregado.', ['O juiz expediu um mandato de prisão.', 'A sessão de cinema começa às 20h.', 'O tráfico de veículos está intenso.', 'Ele infligiu as regras do trânsito.'], 1, 'Sessão = reunião, espetáculo. O certo seria mandado, tráfego e infringiu.'],
    ['Em "Comprei um gilete novo", a figura é', ['metonímia (marca pelo produto).', 'catacrese.', 'antítese.', 'sinestesia.'], 0, 'A marca está no lugar do produto (lâmina de barbear): metonímia.'],
    ['"Senti um cheiro doce no ar." A figura presente é', ['sinestesia.', 'hipérbole.', 'ironia.', 'anacoluto.'], 0, 'Mistura olfato (cheiro) e paladar (doce): sinestesia.'],
    ['A função da linguagem predominante em um verbete de dicionário é', ['emotiva.', 'fática.', 'metalinguística.', 'poética.'], 2, 'O dicionário usa a língua para explicar a própria língua: função metalinguística.'],
    ['"Ele nos deixou ontem", dito sobre alguém que morreu, é exemplo de', ['ironia.', 'eufemismo.', 'hipérbole.', 'pleonasmo.'], 1, 'Suaviza a ideia de morte: eufemismo.'],
    ['Há pleonasmo vicioso em', ['Vi com meus próprios olhos.', 'Subi para cima da escada.', 'Ele chorou lágrimas amargas.', 'A mim, ninguém me engana.'], 1, '"Subir para cima" é redundância sem valor expressivo. As outras são pleonasmos de reforço, aceitos como recurso de estilo.'],
    ['"Os brasileiros somos apaixonados por futebol." Ocorre', ['silepse de pessoa.', 'silepse de gênero.', 'zeugma.', 'hipérbato.'], 0, 'O verbo concorda com a ideia de que o falante se inclui ("nós"): silepse de pessoa.'],
    ['Na frase "— Alô? Está me ouvindo?", predomina a função', ['referencial.', 'fática.', 'conativa.', 'poética.'], 1, 'Testa se o canal de comunicação está funcionando: função fática.']
  ],
  fc: [
    ['Metáfora x comparação', 'Comparação tem conectivo (como). Metáfora é implícita.'],
    ['Metonímia: 4 tipos comuns', 'Autor pela obra, parte pelo todo, continente pelo conteúdo, marca pelo produto.'],
    ['Antítese x paradoxo', 'Antítese opõe ideias. Paradoxo funde opostos numa afirmação ilógica.'],
    ['Eminente x iminente', 'Eminente: ilustre. Iminente: prestes a acontecer.'],
    ['Ratificar x retificar', 'Ratificar: confirmar. Retificar: corrigir.'],
    ['Tráfego x tráfico', 'Tráfego: trânsito. Tráfico: comércio ilegal.'],
    ['Função fática', 'Testa o canal: alô, câmbio, entendeu?'],
    ['Silepse', 'Concordância com a ideia, não com a forma (gênero, número ou pessoa).']
  ]
});

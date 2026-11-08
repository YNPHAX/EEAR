/* Língua Portuguesa — módulo 15 */
EEAR.add({
  id: 'POR15', m: 'por', n: 15, t: 'Tipos de discurso: direto, indireto e indireto livre', peso: 2, h: 2, desde: '2026-11',
  teoria: `
<h3>Os três tipos de discurso</h3>
<p>Numa narrativa, a fala ou o pensamento das personagens pode chegar ao leitor de três maneiras.</p>
<ul>
<li><b>Discurso direto</b>: a fala da personagem é reproduzida com as palavras dela. Costuma vir depois de dois-pontos, com travessão ou aspas, e acompanhada de um <b>verbo de elocução</b> (dizer, perguntar, responder, exclamar, ordenar, pedir).<br><i>O sargento perguntou: — Vocês trouxeram os documentos?</i></li>
<li><b>Discurso indireto</b>: o narrador conta, com as palavras dele, o que a personagem disse. A fala vira uma oração subordinada, em geral introduzida por <b>que</b> ou <b>se</b>, e passa para a 3ª pessoa. Não há travessão nem aspas.<br><i>O sargento perguntou se nós tínhamos trazido os documentos.</i></li>
<li><b>Discurso indireto livre</b>: a voz do narrador se mistura com a da personagem, sem verbo de elocução, sem travessão e sem conjunção. Pensamentos e perguntas da personagem aparecem no meio da narração.<br><i>O cadete olhou o relógio. Será que ainda dava tempo? Tinha de correr para a formatura.</i></li>
</ul>
<h3>Do direto para o indireto (verbo de elocução no passado)</h3>
<div class="tbl"><table><thead><tr><th>Discurso direto</th><th>Discurso indireto</th></tr></thead><tbody>
<tr><td>1ª e 2ª pessoas (eu, nós, você, meu)</td><td>3ª pessoa (ele, eles, dele, seu)</td></tr>
<tr><td>presente: <i>estou</i></td><td>pretérito imperfeito: <i>estava</i></td></tr>
<tr><td>pretérito perfeito: <i>fiz</i></td><td>mais-que-perfeito: <i>tinha feito / fizera</i></td></tr>
<tr><td>futuro do presente: <i>farei</i></td><td>futuro do pretérito: <i>faria</i></td></tr>
<tr><td>imperativo: <i>Saia!</i></td><td>pretérito imperfeito do subjuntivo: <i>que saísse</i></td></tr>
<tr><td>este, esse, isto</td><td>aquele, aquilo</td></tr>
<tr><td>aqui, hoje, amanhã, ontem</td><td>ali/lá, naquele dia, no dia seguinte, na véspera (no dia anterior)</td></tr>
<tr><td>pergunta direta: <i>— Você vem?</i></td><td>pergunta indireta com <b>se</b> ou com palavra interrogativa, sem ponto de interrogação: <i>perguntou se ele vinha</i></td></tr>
</tbody></table></div>
<p>As mudanças de tempo e de advérbio dependem de quando e de onde a fala é relatada. Se alguém relata no mesmo dia uma fala sobre o dia seguinte, "amanhã" pode continuar. Nas questões, observe as pistas de tempo do enunciado.</p>
<h3>Para que serve cada um</h3>
<ul>
<li>O direto dá vivacidade e mostra o jeito de falar da personagem (gírias, interjeições, vocativos).</li>
<li>O indireto resume e organiza as falas, com a voz do narrador no controle.</li>
<li>O indireto livre aproxima o leitor do pensamento da personagem. É comum em romances do século XX.</li>
</ul>
<p class="dica">Para reconhecer o indireto livre, procure perguntas, exclamações ou dúvidas da personagem soltas no meio da narração, sem "disse que" e sem travessão.</p>`,
  ex: [
    ['Passe para o discurso indireto: — Eu vou fazer a prova amanhã — disse Pedro. (relato feito dias depois)', '<p>Pedro disse que <b>ia fazer a prova no dia seguinte</b>. Mudaram a pessoa (eu → ele, implícito), o tempo (vou → ia) e o advérbio (amanhã → no dia seguinte).</p>'],
    ['Passe para o discurso indireto: — Feche a porta! — ordenou o tenente ao soldado.', '<p>O tenente ordenou ao soldado <b>que fechasse a porta</b>. O imperativo vira pretérito imperfeito do subjuntivo.</p>'],
    ['Identifique o tipo de discurso: "Maria guardou o celular. Por que ninguém respondia? Ia tentar de novo depois do almoço."', '<p><b>Discurso indireto livre</b>: a pergunta é da personagem, mas aparece na voz do narrador, sem verbo de elocução e sem travessão.</p>']
  ],
  q: [
    ['Assinale a alternativa em discurso direto.', ['O instrutor disse que a prova seria adiada.', 'O instrutor disse: — A prova será adiada.', 'O instrutor comentou o adiamento da prova.', 'A prova seria adiada? O instrutor ainda não sabia.'], 1, 'A fala é reproduzida com as palavras do instrutor, depois de dois-pontos e travessão. A é indireto; C apenas narra; D é indireto livre.'],
    ['"— Eu estou cansado — disse o soldado." Em discurso indireto, fica:', ['O soldado disse que eu estou cansado.', 'O soldado disse que estava cansado.', 'O soldado disse: estava cansado.', 'O soldado disse que estivera cansado.'], 1, 'A 1ª pessoa passa para a 3ª e o presente (estou) vira pretérito imperfeito (estava). "Estivera" corresponderia a "estive"; C mistura as duas formas.'],
    ['Dias depois, alguém relatou esta fala do tenente: "— Farei a inspeção amanhã." A forma correta em discurso indireto é:', ['O tenente afirmou que fará a inspeção amanhã.', 'O tenente afirmou que faria a inspeção no dia seguinte.', 'O tenente afirmou que fez a inspeção no dia seguinte.', 'O tenente afirmou que faria a inspeção amanhã.'], 1, 'Futuro do presente (farei) vira futuro do pretérito (faria), e, num relato feito dias depois, "amanhã" vira "no dia seguinte".'],
    ['Há discurso indireto livre em:', ['A aluna olhou a lista de aprovados. Seu nome estaria ali? Respirou fundo e procurou de novo.', 'A aluna perguntou: — Meu nome está na lista?', 'A aluna perguntou se o nome dela estava na lista.', 'A aluna procurou o nome na lista e o encontrou.'], 0, 'A pergunta "Seu nome estaria ali?" é da personagem, mas aparece na narração sem verbo de elocução e sem travessão. B é direto; C é indireto; D é só narração.'],
    ['"— Saiam da pista! — ordenou o controlador." Em discurso indireto:', ['O controlador ordenou que saíram da pista.', 'O controlador ordenou que saíssem da pista.', 'O controlador ordenou que sairão da pista.', 'O controlador ordenou saiam da pista.'], 1, 'O imperativo (saiam) vira pretérito imperfeito do subjuntivo (saíssem), introduzido por "que".'],
    ['"— Você trouxe o documento? — perguntou o sargento ao recruta." Em discurso indireto:', ['O sargento perguntou ao recruta se ele tinha trazido o documento.', 'O sargento perguntou ao recruta que você trouxe o documento?', 'O sargento perguntou ao recruta se você trouxe o documento?', 'O sargento perguntou ao recruta se ele traria o documento.'], 0, 'Pergunta de sim ou não vira oração com "se", sem ponto de interrogação; "você" passa a "ele" e o pretérito perfeito (trouxe) vira mais-que-perfeito (tinha trazido).'],
    ['Em "— Silêncio! — exclamou o professor", o verbo "exclamou" é', ['um verbo de elocução, que introduz a fala da personagem.', 'um verbo de ligação.', 'um verbo auxiliar.', 'um verbo impessoal.'], 0, 'Verbos como dizer, perguntar, responder e exclamar introduzem falas: são verbos de elocução (dicendi).'],
    ['"— Este relatório é meu — disse Ana." Em discurso indireto:', ['Ana disse que este relatório é meu.', 'Ana disse que aquele relatório era dela.', 'Ana disse que esse relatório era meu.', 'Ana disse que este relatório será dela.'], 1, 'Este → aquele; é → era; meu → dela (3ª pessoa).'],
    ['Caracteriza o discurso indireto:', ['reproduzir literalmente as palavras da personagem, com travessão.', 'relatar, com as palavras do narrador, o que a personagem disse, em geral numa oração introduzida por "que" ou "se".', 'misturar a fala da personagem com a do narrador sem nenhuma marca.', 'ocorrer apenas em poemas.'], 1, 'A descreve o direto; C, o indireto livre. O discurso indireto aparece em qualquer texto narrativo.'],
    ['"O piloto disse que tinha visto a pista." Em discurso direto, a fala do piloto é:', ['— Ele tinha visto a pista — disse o piloto.', '— Eu vi a pista — disse o piloto.', '— Eu verei a pista — disse o piloto.', '— Ele vê a pista — disse o piloto.'], 1, 'Fazendo o caminho inverso: 3ª pessoa volta à 1ª (eu) e o mais-que-perfeito (tinha visto) volta ao pretérito perfeito (vi).']
  ],
  fc: [
    ['Que marcas indicam discurso direto em: O instrutor perguntou: — Quem trouxe o mapa?', 'O verbo de elocução (perguntou), os dois-pontos, o travessão e a fala reproduzida com as palavras do próprio instrutor.', 2],
    ['Passe para o discurso indireto: Os cadetes disseram: — Nós estamos prontos.', 'Os cadetes disseram que estavam prontos. A 1ª pessoa passa para a 3ª, e o presente (estamos) vira pretérito imperfeito (estavam).', 2],
    ['Qual trecho está em discurso indireto livre? "O piloto encarou a pista molhada. Conseguiria pousar com aquele vento? O instrutor observava em silêncio."', '"Conseguiria pousar com aquele vento?": é o pensamento do piloto na voz do narrador, sem verbo de elocução, sem travessão e sem "que" ou "se".', 2],
    ['Escolha o verbo de elocução adequado: "— Onde está o mapa? — ___ o sargento." (respondeu, perguntou, afirmou)', 'Perguntou: a fala é uma pergunta. O verbo de elocução introduz a fala e indica o seu tipo (dizer, perguntar, responder, exclamar, ordenar).', 2],
    ['Passe para o discurso indireto: O cabo afirmou: — Eu terminei o relatório e farei a entrega.', 'O cabo afirmou que <b>tinha terminado</b> (terminara) o relatório e <b>faria</b> a entrega. Perfeito → mais-que-perfeito; futuro do presente → futuro do pretérito.', 2],
    ['Passe para o discurso indireto: O tenente ordenou ao cabo: — Feche o portão.', 'O tenente ordenou ao cabo que fechasse o portão. O imperativo vira pretérito imperfeito do subjuntivo, introduzido por "que".', 2],
    ['Uma semana depois, alguém relata esta fala do sargento: "— Ontem eu estive aqui." Como fica em discurso indireto?', 'O sargento disse que, na véspera (no dia anterior), tinha estado ali. Ontem → na véspera; aqui → ali (ou lá); perfeito → mais-que-perfeito.', 2],
    ['Passe para o discurso indireto: O controlador perguntou: — Quando vocês decolam?', 'O controlador perguntou quando eles decolavam. Pergunta indireta com palavra interrogativa e sem ponto de interrogação; vocês → eles; presente → imperfeito.', 2]
  ]
});

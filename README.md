# EEAR

Curso preparatório para o CFS (Curso de Formação de Sargentos) da EEAR, em forma de app de estudo.

**Abrir o curso:** https://claude.ai/artifact/9N6CGipsZWHRKANjcguf1k (versão completa, com as páginas das apostilas, só para o dono)

**Site próprio:** https://ynphax.github.io/EEAR/ (versão pública). Ele instala no celular, com ícone na tela inicial, e funciona sem internet.

**App de Android:** https://github.com/YNPHAX/EEAR/releases/latest/download/missao-eear.apk

## Site e app

- `web/build.py` monta o site a partir de `curso/`: página completa, manifesto, ícones, fontes locais e service worker para uso offline. O workflow `Site` publica no GitHub Pages a cada push na `main`. Para isso, o Pages tem de estar ligado em Settings › Pages › Source: GitHub Actions.
- `app/` é o app de Android (Capacitor) com o mesmo conteúdo. O workflow `App Android` compila o APK a cada push. Na `main`, ele publica o APK na página de Releases.
- A versão pública (site e app) não leva nada das apostilas, que são material com direitos autorais de outro curso: nem as páginas, nem os gabaritos, nem o índice. A apostila digital existe só na versão pessoal (artifact).
- O progresso fica salvo em cada aparelho. Para levar de um para outro, use Plano › Dados › Copiar meu progresso e, no outro aparelho, Colar progresso. Com o login ligado, ele fica salvo na conta do aluno.
- Quem chega ao site pela primeira vez vê a página de entrada do curso.

## Marca, contato e páginas legais

- O curso é o **Missão EEAR, um curso da INPHAX**. O logotipo fica em `curso/marca/`, e os ícones do site e do app saem do X em vetor (`web/icones/gerar_icones.py`).
- A INPHAX é a plataforma, e cada curso fica dentro dela: uma conta de aluno vale para todos os cursos, e o app (`com.inphax.app`) é um só. O Missão EEAR é o curso `eear` (constante `CURSO` em `curso/app.js`).
- Contato: suporteinphax@gmail.com.
- A Política de Privacidade e os Termos de Uso ficam em `web/legal/` e valem para todos os cursos da INPHAX. O `web/build.py` publica as duas como `privacidade.html` e `termos.html`, com links no rodapé, na aba Plano e no cartão de login. Pedidos de exclusão de conta chegam pelo e-mail de contato. Para atender, apague o usuário em Authentication e, no Firestore, os documentos em `alunos/{uid}/cursos` e depois o documento `alunos/{uid}`.

## Login dos alunos (Firebase)

O site já tem login com Google ou e-mail e senha, com o progresso de cada aluno salvo na nuvem. Ele só aparece depois de criar o projeto no Firebase, que é gratuito para este uso:

1. Em https://console.firebase.google.com, crie um projeto chamado `inphax` (pode deixar o Google Analytics desligado). O mesmo projeto serve para todos os cursos.
2. Em Authentication › Sign-in method, ative **E-mail/senha** e **Google**.
3. Em Authentication › Settings › Domínios autorizados, adicione `ynphax.github.io`.
4. Em Firestore Database, crie o banco em modo de produção (região `southamerica-east1`). Na aba Regras, cole o conteúdo de `web/firestore.rules` e publique.
5. Em Configurações do projeto › Seus apps, adicione um app da Web (`</>`) e copie o objeto `firebaseConfig`. Salve-o como `web/firebase.json` (em JSON: `{"apiKey": "...", "authDomain": "...", "projectId": "...", "appId": "..."}`). Esses dados não são secretos: o acesso é controlado pelas regras do passo 4.

No próximo push na `main`, o site sai com o login. No Firestore, o documento `alunos/{uid}` guarda o nome e o e-mail do aluno, e o progresso de cada curso fica em `alunos/{uid}/cursos/{curso}` (o Missão EEAR é `eear`).

## O que tem no curso

- **65 módulos** seguindo o conteúdo programático da prova: Português (14), Inglês (13), Matemática (20) e Física (18). A Física Moderna (FIS18) ganhou aula própria porque cai de 1 a 3 questões por prova desde 2022.
- Em cada módulo: teoria resumida com fórmulas e regras, o que mais cai na prova, exemplos resolvidos, **quiz de 10 questões** com correção comentada e flashcards.
- **Regra dos 80%**: o módulo só conta como dominado com 8 acertos em 10. A meta nos simulados é nota 8,0 em cada matéria (o mínimo do edital é 5,0 em cada matéria e média 5,0).
- **Meta de aprovação até 2027**: a prova alvo pode ser o CFS 2/2027 (22/11/2026), o CFS 1/2028 (estimado para 30/05/2027) ou o CFS 2/2028 (estimado para 21/11/2027). As provas anteriores à prova alvo entram no plano como dia de prova real.
- **Cronograma automático em ciclos**: ciclo 1 com a teoria completa, ciclo 2 de revisão ativa de todos os módulos, ciclo 3 com o que mais cai, simulados semanais e reta final de revisão. Ele se ajusta às horas por dia, aos dias da semana e ao resultado do diagnóstico.
- **Aulas com vídeo**: cada módulo é uma aula com videoaula do YouTube tocando dentro do curso (167 vídeos gratuitos, com o crédito de cada canal), roteiro de estudo (vídeo, teoria, exemplos, quiz e flashcards) e botão para a próxima aula. Cada matéria tem a sua trilha de aulas, e a tela Hoje mostra "Continuar de onde parei". O workflow `Videoaulas` confere toda semana se os vídeos continuam no ar.
- **Certificado de conclusão** por matéria e do curso completo, liberado quando todas as aulas têm 80% ou mais no quiz. É um curso livre, sem vínculo com a EEAR ou com a FAB.
- **Provas anteriores oficiais**: provas completas na ordem original, com o gabarito oficial, as questões anuladas valendo para todos e cronômetro de 4h20, o tempo das Provas Escritas no edital (IE EA CFS 2/2027, art. 154). Cada questão é o recorte fiel da prova original (com sublinhados, fórmulas e figuras), e cada uma está ligada ao módulo do curso, na aba Provas. Já entraram a do **CFS 1/2025** (código 62), a do **CFS 2/2025** (código 05) e as de Controle de Tráfego Aéreo (BCT) do **CFS 1/2024**, **CFS 1/2023** e **CFS 1/2022**. Nas provas BCT a ordem das matérias é Português, Inglês, Matemática e Física. Veja abaixo como pôr uma prova nova.
- **Diagnóstico** (40 questões) para descobrir as matérias mais fracas.
- **Simulado completo** (96 questões, 24 por matéria, com cronômetro de 4h20) e simulado por matéria (24 questões em 1 h).
- **Flashcards com repetição espaçada** (revisão em 1, 3, 7, 14, 30 e 60 dias).
- **Caderno de erros**: toda questão errada volta para revisão até você acertar.

- **Apostila digital** (só na versão pessoal): as páginas originais das três apostilas do curso (CFS, CFS/BCT e CFS 2), organizadas em 309 conjuntos de exercícios (em sala, para casa, units e tests de Inglês, incluindo provas reais da EEAR). Cada conjunto tem folha de respostas A–D corrigida pelo gabarito impresso do livro (4.668 questões de múltipla escolha), meta de 80%, opção de refazer só as erradas e ligação com os módulos do curso. Os exercícios em sala e as units entram no ciclo 1 do plano, e os para casa e as provas reais entram no ciclo 2.

São 650 questões inéditas no estilo da EEAR, 511 flashcards e 195 exemplos resolvidos, além das questões da apostila.

As imagens das páginas da apostila não ficam neste repositório. Elas são publicadas só no artifact (privado), sem a marca do curso, a partir dos PDFs.

## Estrutura

```
curso/
  index.html      página do app (estilos e layout)
  app.js          lógica: plano, quizzes, flashcards, simulados, progresso
  dados/
    base.js       matérias, calendário de provas, EEAR.add e EEAR.addProva
    videos.js     termos de busca de videoaulas por módulo
    videoaulas.js vídeos do YouTube de cada aula (título, canal e tipo)
    apostila.js   conjuntos de exercícios da apostila: gabarito, páginas e módulos (só na versão pessoal)
    provas.js     provas anteriores oficiais (EEAR.addProva)
    por*.js       Língua Portuguesa
    ing*.js       Língua Inglesa
    mat*.js       Matemática
    fis*.js       Física
  provas/         recortes das questões de cada prova oficial (imagens e itens.json)
ferramentas/provas/
  recortar.py     recorta cada questão e cada texto-base do PDF da prova
  folhas.py       folhas de contato para conferir os recortes
  gabarito.py     lê o gabarito oficial impresso no PDF
  provas.json     dados de cada prova: gabarito, módulo de cada questão e textos-base
  gerar_provas.py gera curso/dados/provas.js
web/
  build.py        monta o site e o conteúdo do app a partir de curso/
  sw.js           service worker (uso offline)
  conferir_videos.py  confere no YouTube as videoaulas
  firestore.rules regras do banco do login
  legal/          política de privacidade e termos de uso
  fontes/, icones/
app/              app de Android (Capacitor)
```

Cada módulo é um `EEAR.add({...})` com `id`, `t` (título), `peso` (incidência estimada de 1 a 3), `h` (horas ideais), `teoria` (HTML), `ex` (exemplos), `q` (questões `[enunciado, [A, B, C, D], índice da correta, comentário]`) e `fc` (flashcards `[frente, verso]`). Para acrescentar questões, basta incluir itens no array `q` do módulo.

## Como pôr uma prova nova

1. Deixe só as páginas oficiais do PDF (sem capas de sites de terceiros), por exemplo com `pdfseparate` e `pdfunite`.
2. `python3 ferramentas/provas/gabarito.py prova.pdf 2` lê o gabarito (troque 2 pela página do gabarito). As anuladas saem como X.
3. `python3 ferramentas/provas/recortar.py prova.pdf curso/provas/<pasta> 3` recorta as questões (troque 3 pela primeira página de questões). Confira os recortes com `python3 ferramentas/provas/folhas.py curso/provas/<pasta> /tmp/folhas`.
4. Acrescente a prova em `ferramentas/provas/provas.json`: `id`, `nome`, `data` (mês da prova), `pasta`, `fonte`, `gab`, `ordem` (só nas provas BCT: `"por ing mat fis"`), `textos` e `usa` (que questões usam cada texto-base) e `mods` (o módulo do curso de cada uma das 96 questões).
5. `python3 ferramentas/provas/gerar_provas.py` gera `curso/dados/provas.js` e confere se as 96 questões têm módulo e se a matéria bate.

## Sobre a prova

Segundo sites de concursos, a próxima prova é a do CFS 2/2027, prevista para 22/11/2026. São 96 questões objetivas com 4 alternativas. Confirme datas e regras no edital oficial, em https://ingresso.eear.fab.mil.br.

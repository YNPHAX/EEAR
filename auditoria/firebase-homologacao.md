# Firebase: homologação no projeto `eear-teste`

Estado em 2026-11-11, na branch `claude/eear-study-hydwqt`, montada sobre o PR #31 (a ponta da cadeia #27 → #31, que
traz contas, sincronização e direitos do aluno). **Nenhuma operação foi feita no Firebase real**: nenhuma regra publicada,
nenhum deploy, nenhuma conta criada. Tudo o que está abaixo como "testado" rodou nos emuladores oficiais (projeto
`demo-eear`) ou numa nuvem fictícia em memória.

## 1. Auditoria do que já existia (não reimplementado)

| Peça | Onde | Situação |
|---|---|---|
| SDK modular do Firebase 12.19.0 (`firebase-app`, `firebase-auth`, `firebase-firestore`), carregado da CDN oficial | `curso/app/02-progresso-nuvem.js`, `contaIniciar` | pronto |
| Login com e-mail e senha, criação de conta, redefinição de senha, Google (janela, com redirecionamento se a janela for bloqueada; só no site, não no APK) | `02-progresso-nuvem.js` | pronto; Google testado no emulador só no CI |
| Progresso local por conta (`missao-eear-v1@firebase:<uid>`), progresso sem conta à parte, "Levar para a conta" a pedido | `09-contas.js` | pronto |
| Sincronização com transação (`runTransaction`), união de três vias com base, documento só com `v`, `dados`, `t` e `atualizado` | `02-progresso-nuvem.js`, `08-uniao-nuvem.js` | pronto |
| Sair mantendo ou apagando a cópia local, excluir conta com reautenticação, baixar e consultar os dados | `09-contas.js` | pronto |
| Liberação em duas etapas: login só com a configuração; nuvem só com `"sincronizar": true` | `ligarNuvem` | pronto |
| Regras do Firestore e testes nos emuladores (CI, job `firebase-emulador`) | `web/firestore.rules`, `testes/firebase-emulador.test.js` | reforçados nesta branch |

A `main` tem uma versão antiga e defeituosa do Firebase (uma chave local única por aparelho, gravação sem transação,
nome e e-mail no documento, sem a trava `sincronizar`). **Nenhuma configuração do Firebase pode entrar na `main` antes
da integração da cadeia de PRs.** Nesta branch, a configuração nunca entra no repositório (seção 3).

## 2. O que esta branch acrescenta

1. **Configuração fora do repositório e só para homologação** (`web/build.py`): o build lê o arquivo de
   `EEAR_FIREBASE_CONFIG`, ou `web/firebase.json` (excluído pelo `.gitignore`). Ele aceita só o projeto `eear-teste`,
   exige os quatro campos do console (o modelo `web/firebase.homologacao.exemplo.json` é recusado enquanto não for
   preenchido), recusa campos estranhos (por exemplo, `emuladores`) e marca a saída com `"homologacao": true`.
2. **Bloqueio de publicação** (`web/verificar_publicacao.py`): `verificar` (o passo dos workflows antes de publicar o
   site ou o APK) recusa qualquer saída marcada como homologação. A conferência do próprio build só avisa, para que o
   build de teste possa ser montado. Mais 3 casos no autoteste (site, APK e login sem a marca).
3. **Aviso na tela**: no build de homologação, o cartão da conta diz "Ambiente de homologação (projeto de teste
   eear-teste): use só contas e dados fictícios".
4. **Regras com privilégio mínimo** (`web/firestore.rules`), escritas para o Firestore. Elas não são cópia das regras do
   Claude, que autorizam pelo nível de compartilhamento do artifact; estas autorizam pelo `request.auth.uid`:
   - `get`, `create`, `update` e `delete` separados, só em `alunos/{uid}` com `uid == request.auth.uid`;
   - `list` recusado, inclusive para o próprio aluno (o app só lê o documento pelo id);
   - os quatro campos são obrigatórios e só eles são aceitos; `v` não diminui; o progresso tem limite de 900 000 caracteres;
   - qualquer outro caminho é recusado, por exemplo um futuro `assinaturas/{uid}`, que só o servidor poderá gravar.
5. **Falhas da sincronização sem perda silenciosa** (`curso/app/13-falhas-nuvem.js`):
   - erro passageiro (sem rede, `deadline-exceeded`, `aborted`, `resource-exhausted`, `internal`, `cancelled`): tenta
     de novo com espera crescente: a primeira, como antes, de 2,5 a 5 s; depois dobra, até 60 s. Antes, só "sem rede"
     tentava de novo (sempre de 2,5 a 5 s, sem fim); cota estourada (inclusive `resource_exhausted` do Claude) parava a
     sincronização em silêncio;
   - conexão voltando (`online`) ou app voltando para a tela: tenta na hora;
   - app indo para o fundo e continuando aberto (trocar de app no celular): envia o que esperava o intervalo de 1,5 s.
     Ao fechar ou trocar de página (`pagehide`), nada começa. Defeito achado e corrigido nesta revisão: a primeira versão
     também enviava ao fechar, e a união terminada depois gravava a cópia da página que fechava por cima do que outra
     abertura tinha guardado. A suíte da plataforma pegou o defeito (2 certificados perdidos); a correção tem teste próprio;
   - erro que não passa sozinho (`permission-denied`, `unauthenticated`, recusa do Claude): a sincronização para, e o
     aviso diz que parou, por quê, e que o estudo continua no aparelho sem nada apagado. Antes, o aviso só dizia
     "Progresso salvo neste aparelho.";
   - login que não carregou (app aberto sem internet): tenta de novo quando a conexão volta, sem recarregar.

## 3. Como montar o build de homologação (depois de autorizado)

1. Copie `web/firebase.homologacao.exemplo.json` para **fora do repositório** e preencha `apiKey` e `appId` com os valores
   do app `EEAR-Web-Teste` (seção 5, passo 3). Comece com `"sincronizar": false`, só para testar o login.
2. `EEAR_FIREBASE_CONFIG=<arquivo> python3 web/build.py <pasta fora do repositório>`. O build mostra
   "Firebase: projeto de homologação eear-teste".
3. Sirva a pasta em `http://localhost:<porta>` (por exemplo, `python3 -m http.server`); `localhost` já é domínio
   autorizado. Para o iPhone, é preciso um endereço HTTPS autorizado (seção 5, passo 6).
4. Depois de aprovar o login e publicar as regras (seção 5), troque para `"sincronizar": true` e monte de novo.

A configuração do app da web não é senha (ela vai para o navegador de qualquer visitante), mas é do projeto de teste:
não a cole em commits, PRs ou conversas públicas.

## 4. Testes executados (nesta branch, sem serviço real)

| Verificação | Resultado |
|---|---|
| `node testes/firebase-emulador.test.js` (emuladores oficiais, regras desta branch) | 30 de 30; o login com o Google não roda aqui (sem acesso a `apis.google.com`) e roda no CI |
| `testes/falhas-nuvem.js` (dentro de `node testes/plataforma.test.js`) | 6 de 6 |
| `python3 -I web/verificar_publicacao.py autoteste` | 175 casos |
| `validar`, `conferir-workflows`, `verificar _site --site`, `verificar app/www --app` | OK |
| Build com o modelo não preenchido, com outro projeto, com campo estranho e com arquivo inexistente | recusado nos quatro |
| Build de homologação com configuração fictícia | montado e marcado; `verificar --site` recusa publicar |
| `python3 -I web/montar_app.py --conferir`, lint e `node --check` | OK |

## 5. O que o dono faz no console do Firebase (cada passo é uma operação no serviço real)

1. **Regras do Firestore** (Firestore Database → Regras): hoje estão em `allow read, write: if false`. Com elas, o
   login funciona, mas a sincronização é recusada; o app mostra "A sincronização com a nuvem parou (a nuvem recusou a
   gravação)…" e guarda o estudo no aparelho. Para testar a sincronização:
   - cole o conteúdo de `web/firestore.rules` desta branch;
   - antes de publicar, use o Playground de regras: `get` de `alunos/<uid>` autenticado com o mesmo uid é permitido;
     com outro uid, recusado; `list` de `alunos`, recusado; sem login, recusado;
   - publique.
2. **Authentication → Configurações**:
   - confirme a proteção contra enumeração de e-mails ativada;
   - política de senha com pelo menos 8 caracteres (o app aceita 6, o mínimo do Firebase; com a política, o Firebase
     recusa as curtas e o app mostra a mensagem genérica);
   - Modelos: idioma português nos e-mails de redefinição de senha.
3. **Configuração do app da web**: Configurações do projeto → Seus apps → `EEAR-Web-Teste` → Configuração do SDK →
   "Config". Use `apiKey`, `authDomain`, `projectId` e `appId` no arquivo da seção 3, fora do repositório.
4. **Google**: confirme o e-mail de suporte do provedor Google.
5. **Restrição da chave de API** (Google Cloud Console → APIs e serviços → Credenciais → "Browser key"):
   - referenciadores HTTP: `http://localhost:*`, `https://eear-teste.firebaseapp.com/*` e o domínio HTTPS do passo 6;
   - APIs permitidas: Identity Toolkit API, Token Service API e Cloud Firestore API.
6. **Domínio HTTPS para o iPhone**, decisão sua:
   - **opção recomendada:** Firebase Hosting do próprio `eear-teste` (`https://eear-teste.web.app`, já autorizado, no
     plano grátis). É um deploy do build de homologação e precisa da sua autorização. Para o login com o Google no
     Safari, use também `"authDomain": "eear-teste.web.app"` e acrescente
     `https://eear-teste.web.app/__/auth/handler` em "URIs de redirecionamento autorizados" do cliente OAuth "Web client
     (auto created by Google Service)", no Google Cloud Console;
   - **alternativa:** outro endereço HTTPS seu, acrescentado em Authentication → Configurações → Domínios autorizados.
   - Não acrescente o domínio oficial `ynphax.github.io`.
7. **Plano e uso**: mantenha o plano Spark (sem cobrança) e acompanhe Firestore → Uso e Authentication → Usuários.
8. **Contas de teste**: duas contas fictícias (por exemplo, um e-mail de teste com senha e uma conta Google de teste
   sua). Nada de dados de alunos. No fim, apague as contas e os documentos `alunos/*` de teste.

## 6. Roteiro de aprovação com duas contas (A e B), incluindo o iPhone

| # | Teste | Aprovado se |
|---|---|---|
| 1 | Login de A com e-mail e senha; de B com o Google (computador e iPhone) | os dois entram; o cartão mostra o aviso de homologação |
| 2 | Com `sincronizar: false`: A estuda | o aviso diz que a sincronização não está liberada; nada chega ao Firestore |
| 3 | Regras publicadas, `sincronizar: true`: A estuda | `alunos/<uidA>` só com `v`, `dados`, `t` e `atualizado` |
| 4 | Isolamento: B no mesmo navegador depois de A sair | B não vê nada de A; nada de B vai para A |
| 5 | Isolamento no servidor: Playground de regras com o uid de B lendo e gravando `alunos/<uidA>` | recusado |
| 6 | A no computador e no iPhone, marcando ao mesmo tempo | nenhuma marcação some; os dois terminam iguais |
| 7 | iPhone em modo avião: estudar, fechar, reabrir offline, voltar a rede | o estudo continua no aparelho e chega à nuvem sem reabrir |
| 8 | Desmarcar algo num aparelho | não volta depois da sincronização |
| 9 | App na tela inicial do iPhone (Compartilhar → Adicionar à Tela de Início) | login (e-mail e Google) e sincronização funcionam |
| 10 | Excluir a conta B | login, `alunos/<uidB>` e cópia local apagados |
| 11 | Uso em Firestore → Uso, depois de uma hora de estudo | número de gravações anotado para a estimativa de custo |

Bloqueiam a aprovação: perda de qualquer marcação, leitura ou gravação entre contas, documento com dados além dos quatro
campos, login impossível no iPhone sem alternativa documentada.

## 7. Riscos e limitações que continuam

- **Emulador não é o serviço real**: transações, latência, cotas e regras foram testadas só no emulador oficial.
- **Google no APK**: o botão do Google fica escondido no APK; uma conta criada com o Google no site não entra no APK, e
  excluir uma conta do Google no APK falha (reautenticação por janela). Precisa de login nativo ou de senha.
- **iPhone**: o login com o Google por redirecionamento pode falhar com `authDomain` em `firebaseapp.com` (bloqueio de
  armazenamento entre sites); por isso a recomendação do passo 6. Não testado.
- **SDK da CDN** (`www.gstatic.com`), sem verificação de integridade; sem internet ao abrir, o login só carrega quando a
  conexão volta.
- **Exclusão sem garantia no servidor**: se o documento for apagado e a conta não (ou o contrário), o app informa, mas
  nada no servidor completa a exclusão. Uma Cloud Function exige o plano Blaze.
- **Volume de gravações**: uma transação por pausa de 1,5 s no estudo; medir no teste 11 antes de abrir para alunos.
- **E-mail não verificado**: para a futura assinatura, exigir e-mail verificado.
- **Abuso**: criação de contas aberta; App Check ainda não configurado.
- **LGPD**: alunos menores de idade; política de privacidade e termos precisam de revisão antes de usar contas reais.
- **Assinatura**: autenticação e assinatura continuam separadas. A assinatura, quando existir, vai num documento gravado
  só pelo servidor; as regras atuais já recusam esse caminho ao aluno, e o progresso nunca depende dela.

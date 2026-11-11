# Firebase: homologação no projeto `eear-teste`

Branch `claude/eear-study-hydwqt`, montada sobre o PR #31 (a ponta da cadeia #27 → #31). **Nenhuma operação foi feita
no Firebase real** (nenhuma regra publicada, nenhum deploy, nenhuma conta criada). O que está como "testado" rodou nos
emuladores oficiais (projeto `demo-eear`) ou numa nuvem fictícia em memória. **Não está pronto para produção**: faltam
os testes reais da seção 8, com evidência.

## 1. O que já existia (não reimplementado)

| Peça | Onde |
|---|---|
| SDK modular 12.19.0 (`firebase-app`, `firebase-auth`, `firebase-firestore`), da CDN oficial | `curso/app/02-progresso-nuvem.js`, `contaIniciar` |
| Login com e-mail e senha, criação de conta, redefinição de senha, Google (janela; redirecionamento se a janela for bloqueada; só no site) | `02-progresso-nuvem.js` |
| Progresso local por conta (`missao-eear-v1@firebase:<uid>`), progresso sem conta à parte, "Levar para a conta" a pedido | `09-contas.js` |
| Transação (`runTransaction`), união de três vias com base, documento só com `v`, `dados`, `t`, `atualizado`; certificados unidos sem perda | `02`, `08-uniao-nuvem.js` |
| Sair mantendo ou apagando a cópia local, excluir conta com reautenticação, baixar e consultar os dados | `09-contas.js` |
| Liberação em duas etapas: login só com a configuração; nuvem só com `"sincronizar": true` | `ligarNuvem` |

A `main` tem uma versão antiga e defeituosa do Firebase. **Nenhuma configuração do Firebase entra na `main` antes da
integração da cadeia de PRs**; nesta branch, a configuração nunca entra no repositório.

## 2. O que esta branch acrescenta

1. **Configuração fora do repositório** (`web/build.py`): `EEAR_FIREBASE_CONFIG` ou `web/firebase.json` (no
   `.gitignore`). Só o projeto `eear-teste`; os quatro campos do console (o modelo `web/firebase.homologacao.exemplo.json`
   é recusado até ser preenchido); nenhum campo estranho; `authDomain` só `eear-teste.firebaseapp.com` ou
   `eear-teste.web.app`. A saída sai marcada `"homologacao": true`.
2. **Bloqueio de publicação** (`web/verificar_publicacao.py`): `verificar --site`/`--app`/`--apk` (o passo dos workflows)
   recusa build de homologação. `verificar <pasta> --homologacao` (para o Hosting de teste) confere o material como no
   site e **exige** a marca, para nunca liberar um build oficial. 178 casos no autoteste.
3. **Firebase Hosting do `eear-teste`** (`firebase.json` e `.firebaserc` na raiz): publica `homologacao/site/` (no
   `.gitignore`), com `noindex`, `nosniff`, `Referrer-Policy` e `no-cache` em `index.html`, `app.js`, `sw.js` e manifesto;
   regras do Firestore de `web/firestore.rules` (fonte única). Validado nos emuladores de Hosting e Firestore: página
   servida, cabeçalhos aplicados, regras carregadas (leitura sem login: 403).
4. **Regras do Firestore** (`web/firestore.rules`, seção 5).
5. **Falhas da sincronização sem perda silenciosa** (`curso/app/13-falhas-nuvem.js`): erro passageiro (inclusive cota)
   tenta de novo com espera crescente (a primeira, como antes, de 2,5 a 5 s; depois dobra, até 60 s); conexão voltando
   e app voltando para a tela tentam na hora; app indo para o fundo e continuando aberto envia antes do intervalo
   (ao fechar a página, `pagehide`, nada começa); gravação recusada para e o aviso diz por quê, sem apagar nada; login
   que não carregou tenta de novo quando a conexão volta.
6. **Mensagens de login** para erros que a configuração do console provoca: política de senha, provedor desativado,
   conta desativada, janela bloqueada.
7. **Aviso de homologação** no cartão da conta.
8. **`testes/isolamento-firebase.js`**: confere o isolamento entre duas contas pela API REST (seção 6).

## 3. Testes (sem serviço real)

| Verificação | Resultado |
|---|---|
| `node testes/plataforma.test.js` (inclui `testes/falhas-nuvem.js`, 6 casos; contas; sincronização; certificados) | 227 de 227 (a base do PR #31 tem 221) |
| `node testes/firebase-emulador.test.js` (Auth e Firestore oficiais: contas, transações, regras, exclusão, falhas) | 30 de 30; login com o Google só no CI |
| `testes/isolamento-firebase.js` nos emuladores com `web/firestore.rules` | 9 de 9; com regras abertas, 7 falhas (o teste pega o vazamento) |
| Emuladores de Hosting e Firestore com `firebase.json` da raiz | página 200, cabeçalhos, regras carregadas (403) |
| `verificar_publicacao.py autoteste`, `validar`, `conferir-workflows`, `verificar --site/--app/--homologacao` | OK |
| Build com configuração inválida (modelo, outro projeto, campo estranho, `authDomain` de outro projeto, arquivo inexistente) | recusado |

Falha do CI corrigida: no commit `5aca0a4`, o teste "página fechando" falhou no job `plataforma`. Causa: corrida no
próprio teste (marcava no meio da sincronização anterior; o app grava essa marcação logo no fim dela, comportamento
anterior a esta branch). O teste agora espera a sincronização e mede o momento da gravação; sem a guarda de `pagehide`,
ele falha (3 de 3), e com ela passa (10 de 10).

## 4. Hosting e login com o Google (configuração para o iPhone)

No iPhone (Safari e app na tela inicial), o login com o Google por redirecionamento falha quando o domínio do login
(`authDomain`) é diferente do site, por causa do bloqueio de armazenamento entre sites. A configuração recomendada pela
documentação do Firebase é hospedar no próprio Firebase Hosting e usar o domínio do Hosting como `authDomain`:

- arquivo da configuração (fora do repositório): `"authDomain": "eear-teste.web.app"`;
- o Hosting serve `/__/auth/handler` automaticamente nesse domínio;
- o cliente OAuth precisa aceitar `https://eear-teste.web.app/__/auth/handler` (passo 7 da seção 7).

Montar e conferir o build de homologação (local, sem publicar nada):

```
EEAR_FIREBASE_CONFIG=<arquivo fora do repositório> python3 web/build.py homologacao/site
python3 -I web/verificar_publicacao.py verificar homologacao/site --homologacao
```

Publicar no Hosting do `eear-teste` (**deploy: só com a sua autorização**; precisa de login no Firebase CLI com a sua conta):

```
npx --yes firebase-tools@15.35.0 deploy --only hosting --project eear-teste
```

## 5. Regras do Firestore a publicar

Publique **exatamente** o arquivo `web/firestore.rules` desta branch. Conferência: SHA-256
`0b0135112729e080a4f0b3fbe4ed2c8dcce7cbb46fb7fe6df5ac9c6c679af2c2` (`sha256sum web/firestore.rules`).

O que elas permitem e recusam:

| Operação | Quem |
|---|---|
| `get` de `alunos/{uid}` | só o dono do login com aquele uid |
| `list` / consulta da coleção `alunos` | ninguém |
| `create` e `update` de `alunos/{uid}` | só o dono, com exatamente `v` (inteiro ≥ 1), `dados` (texto < 900 000 caracteres), `t` (número) e `atualizado` (= hora do servidor); `v` não diminui |
| `delete` de `alunos/{uid}` | só o dono (exclusão de conta) |
| qualquer outro caminho (por exemplo, `assinaturas/{uid}`) | ninguém pelo app |

Elas não são as do banco de dados do Claude: lá a autorização é pelo nível de compartilhamento do artifact; aqui, pelo
`request.auth.uid` do Firebase Authentication.

Duas formas de publicar (escolha uma; **as duas são operações no serviço real**):
- console: Firestore Database → Regras → colar o arquivo → Playground (seção 6, passo 2) → Publicar;
- CLI: `npx --yes firebase-tools@15.35.0 deploy --only firestore:rules --project eear-teste` (usa `firebase.json`, que
  aponta para `web/firestore.rules`).

Enquanto as regras forem `allow read, write: if false`, o login funciona e a sincronização é recusada: o app mostra "A
sincronização com a nuvem parou (a nuvem recusou a gravação)…" e guarda o estudo no aparelho.

## 6. Duas contas fictícias e o isolamento

1. **Criar as contas** (no app de homologação, não no console): conta A com e-mail e senha fictícios (por exemplo,
   `aluno.a@exemplo.test`, senha só para o teste) e conta B com uma conta Google de teste sua (ou outro e-mail fictício).
   Nada de dados de alunos. Anote os uids em Authentication → Usuários.
2. **Playground de regras** (antes de publicar): simule `get` em `/alunos/<uid de A>` autenticado como A (permitido),
   como B (recusado) e sem login (recusado); `list` em `/alunos` (recusado); `create` em `/assinaturas/<uid de A>`
   como A (recusado).
3. **No app**: A estuda (marca uma tarefa); confira em Firestore → Dados que `alunos/<uid de A>` só tem `v`, `dados`,
   `t` e `atualizado`. A sai mantendo os dados; B entra no mesmo navegador: não vê nada de A.
4. **Conferência automática** (com a conta B de e-mail e senha; não envia nada além das tentativas recusadas):
   ```
   EEAR_FIREBASE_CONFIG=<arquivo> EEAR_CONTA_A=<e-mail A> EEAR_SENHA_A=<senha A> \
   EEAR_CONTA_B=<e-mail B> EEAR_SENHA_B=<senha B> node testes/isolamento-firebase.js
   ```
   Tem de terminar com "tudo certo". Só aceita o projeto `eear-teste`; não imprime senhas nem tokens.
5. **No fim**: apague as duas contas (no app, "Excluir minha conta", que testa a exclusão; ou no console) e confirme
   que `alunos/` ficou vazio.

## 7. O que o dono faz no console (cada passo é operação no serviço real)

1. **Authentication → Configurações → Domínios autorizados**: `localhost`, `eear-teste.firebaseapp.com` e
   `eear-teste.web.app` (os dois últimos já vêm). Não acrescente `ynphax.github.io`.
2. **Authentication → Configurações**: proteção contra enumeração de e-mails ativa; política de senha (mínimo 8, com
   letras e números; o app mostra a mensagem certa); Modelos em português.
3. **Authentication → Método de login → Google**: e-mail de suporte do projeto.
4. **Configurações do projeto → Seus apps → `EEAR-Web-Teste` → Config**: copie `apiKey` e `appId` para o arquivo fora do
   repositório, com `"projectId": "eear-teste"`, `"authDomain": "eear-teste.web.app"`, `"sincronizar": false` (primeiro
   só o login; depois das regras, `true`).
5. **Firestore → Regras**: seção 5.
6. **Hosting**: "Começar" no console (só ativa o produto), e o deploy da seção 4 com a sua autorização.
7. **Google Cloud Console → APIs e serviços → Credenciais → "Web client (auto created by Google Service)"**: em "URIs
   de redirecionamento autorizados", acrescente `https://eear-teste.web.app/__/auth/handler` (o de
   `eear-teste.firebaseapp.com` já existe); em "Origens JavaScript autorizadas", `https://eear-teste.web.app`.
8. **Credenciais → "Browser key (auto created by Firebase)"**: referenciadores `https://eear-teste.web.app/*`,
   `https://eear-teste.firebaseapp.com/*`, `http://localhost:*`; APIs: Identity Toolkit, Token Service, Cloud Firestore.
   (O script da seção 6 manda o referenciador do `authDomain`.)
9. **Plano Spark** (sem cobrança); acompanhe Firestore → Uso, Hosting → Uso e Authentication → Usuários.

## 8. Roteiro de aprovação (real)

| # | Teste | Aprovado se |
|---|---|---|
| 1 | Login de A (e-mail) e de B (Google) no computador e no iPhone (Safari e tela inicial) | entram; o cartão mostra o aviso de homologação |
| 2 | `sincronizar: false`, A estuda | aviso "sincronização ainda não liberada"; nada no Firestore |
| 3 | Regras publicadas, `sincronizar: true`, A estuda | documento só com os 4 campos |
| 4 | Seção 6 (Playground, app, `testes/isolamento-firebase.js`) | tudo recusado entre contas |
| 5 | A no computador e no iPhone ao mesmo tempo | nenhuma marcação some |
| 6 | iPhone em modo avião, estudar, fechar, reabrir, voltar a rede | o estudo chega à nuvem |
| 7 | Desmarcar num aparelho | não volta |
| 8 | Certificado conquistado num aparelho | aparece no outro e não some |
| 9 | Excluir a conta B | login, `alunos/<uid B>` e cópia local apagados |
| 10 | Uso depois de uma hora de estudo | leituras e gravações anotadas (seção 9) |

Bloqueiam a aprovação: perda de marcação, acesso entre contas, campo além dos quatro, login impossível no iPhone sem
alternativa documentada.

## 9. Riscos pendentes (investigados; nada disso está resolvido)

- **Google no APK.** O botão do Google fica escondido no APK (a janela do Google não abre numa WebView). Consequências:
  uma conta criada com o Google no site não entra no APK; "Excluir minha conta" de uma conta Google falha no APK (a
  reautenticação usa janela). Saídas: (a) login nativo do Google no Capacitor (plugin de autenticação do Firebase para
  Capacitor; exige registrar o app Android no Firebase com o SHA-1 da chave de assinatura e o `google-services.json`);
  (b) o aluno define uma senha pela redefinição de senha e entra no APK por e-mail (não verificado no serviço real).
  Na homologação: testar o APK só com a conta de e-mail.
- **Exclusão de conta.** O app apaga o documento e depois o login; uma falha no meio é informada, mas nada no servidor
  completa a exclusão (documento órfão ou login sem documento). A garantia no servidor (Cloud Function no evento de
  exclusão do usuário, ou a extensão "Delete User Data") exige o plano Blaze.
- **Verificação de e-mail.** Não é exigida: alguém pode se cadastrar com o e-mail de outra pessoa. Para o progresso,
  o risco é baixo (o documento é da conta, não do e-mail); para a assinatura paga, exigir e-mail verificado antes de
  liberar o acesso (o servidor confere `email_verified` no token).
- **App Check.** Não configurado: qualquer cliente com a chave de API (pública) pode criar contas e documentos. Para o
  site, reCAPTCHA (Enterprise ou v3), primeiro em modo de monitoramento e depois exigido no Firestore; para o APK, Play
  Integrity. O SDK do App Check também viria da CDN. Os emuladores não usam App Check.
- **Consumo de operações.** Cada sincronização é uma transação: 1 leitura e, se algo mudou, 1 gravação. Ela acontece
  1,5 s depois de cada parada no estudo, ao abrir o app e ao voltar à tela com algo pendente. Estimativa (a medir no
  teste 10): um aluno que responde 50 questões numa sessão gera até cerca de 50 gravações; 100 alunos ativos por dia,
  2 sessões, cerca de 10 000 gravações por dia. As cotas grátis do plano Spark (diárias, de leitura e gravação do
  Firestore, e de transferência do Hosting) **precisam ser conferidas na página de preços**; o primeiro acesso ao site
  baixa cerca de 1,2 MB (pré-cache), mais as imagens das provas conforme o uso. Se o volume pesar: agrupar mais as
  gravações (por exemplo, 15 a 30 s, e ao ir para o fundo).
- **SDK pela CDN** (`www.gstatic.com/firebasejs/12.19.0`): versão fixa, mas sem verificação de integridade (`import()`
  não aceita SRI) e sem uso offline do login. Saída: copiar os três módulos do pacote npm `firebase@12.19.0` para o
  build, com o hash de cada um conferido no próprio build, e servi-los do mesmo domínio (e do APK). Fica para depois
  da homologação, porque muda o build do site e do APK.
- **Emulador não é o serviço real**: transações, latência, cotas e regras ainda precisam do teste real.
- **LGPD**: há alunos menores de idade; política de privacidade e termos precisam de revisão antes de contas reais.

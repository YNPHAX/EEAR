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
| `node testes/plataforma.test.js` (inclui `testes/falhas-nuvem.js` e `testes/abas.js`; contas; sincronização; certificados) | 234 de 234 |
| `node testes/firebase-emulador.test.js` (Auth e Firestore oficiais: contas, transações, regras, exclusão, falhas) | 48 de 48 aqui (inclui a matriz do Codex e a sonda de F01); login com o Google só no CI |
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

O `firebase.json` da raiz roda antes de qualquer deploy do Hosting (gancho `predeploy`) a conferência
`python3 -I web/verificar_publicacao.py verificar-hosting "$RESOURCE_DIR" "$GCLOUD_PROJECT"`; se ela falhar, o Firebase CLI
não envia nada. Ela recusa: projeto de destino fora da lista de homologação (só `eear-teste`); pasta ausente; pasta sem
a marca de homologação; `index.html` sem exatamente uma configuração `window.EEAR_FIREBASE` com `projectId` da lista,
`homologacao: true` e `authDomain` do próprio projeto; projeto da configuração diferente do projeto do deploy; e tudo o
que `verificar --homologacao` já recusava. Conferido sem deploy: as variáveis que o CLI passa ao gancho estão em
`firebase-tools/lib/deploy/lifecycleHooks.js` (15.35.0), e o comando, rodado com elas, sai com 0 para `eear-teste`, 1
para outro projeto, 1 para o build oficial e 2 para a pasta ausente. A rota `/` tem `Cache-Control: no-cache`, como
`index.html` (conferido no emulador do Hosting).

## 5. Regras do Firestore a publicar

Publique **exatamente** o arquivo `web/firestore.rules` desta branch. Conferência: SHA-256
`18a264318c2a3cc906489198f14b34644d7acf66c7ea69dbef2a3a415dd60a9e` (`sha256sum web/firestore.rules`).

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

## 9. Resposta à auditoria do Codex (`auditoria/firebase-codex.md`)

| Achado | Situação nesta branch |
|---|---|
| F01 — perda entre abas offline | **Corrigido** em `curso/app/14-abas.js` (seção 9.1). A sonda do Codex passa a rodar sempre no emulador. |
| F02–F04 — respostas atrasadas, callback de outra sessão, erro atrasado | Incorporados do Codex (merge revisado, `553ff01`); `testes/ciclo-sincronia.test.js` 3 de 3. |
| F05 — barreira de publicação | Incorporado; convive com `verificar --homologacao` e `verificar-hosting` (186 casos no autoteste). |
| F06 — dados pessoais em `dados` | Comentários incorporados; `cfg.nome` continua dentro do progresso (seção 10). |
| F07 — fixture do emulador | Incorporado. |

### 9.1 F01: primeira correção (substituída na seção 9.2)

- **Reprodução** (sonda do Codex no emulador, merge `553ff01`, antes da correção): `✗ SONDA abas offline … [cache=false,
  nuvem=false]`, saída 1.
- **Causa:** cada aba tem a sua cópia do progresso na memória e grava o progresso inteiro na mesma chave local; a última
  gravação apaga o que a outra aba guardou. A transação do Firestore só concilia o que chega ao servidor.
- **Correção:**
  - antes de gravar, a aba lê a chave; se outra aba gravou desde a última vez que esta leu ou gravou, as duas versões são
    unidas com `unirProgresso`, a mesma união de três vias da nuvem (marcações, desmarcações, contagens, certificados e
    "Zerar" seguem as regras de lá);
  - a base da união é a versão mais recente que as duas abas têm em comum, tirada de uma linhagem gravada à parte
    (`missao-eear-v1-abas@<conta>`: id da gravação, ids das anteriores e um resumo do texto a que pertence). Uma versão
    sem linhagem (versão antiga do app) recebe um id do próprio texto, para que duas abas que a leram a reconheçam;
  - sem versão comum conhecida, a união é sem base: nada se apaga;
  - quando outra aba grava (evento `storage`), esta une na hora e, se tinha algo que a outra cobriu (leitura atrasada da
    chave), grava a união de volta;
  - o texto do progresso na chave local não mudou (versões antigas, exportação e cópias de recuperação iguais).
- **Testes:** `testes/abas.js` (7 casos, na suíte da plataforma): duas abas e uma fecha; contagens sem perder nem dobrar;
  desmarcação com e sem o aviso entre abas; "Zerar"; certificados; leitura atrasada; cópia apagada em outra aba. Os 7
  falham no build de `553ff01` e passam com a correção (3 de 3 rodadas). Sonda do Codex: `✓ … [cache=true, nuvem=true]`.
- **Limites que continuam:**
  - uma aba **suspensa durante** "Apagar os dados deste aparelho" que acorda com os dados antigos na memória une sem
    base e pode regravar a cópia local apagada (apagar só é permitido quando a nuvem já tem tudo, então não volta estudo
    zerado nem desmarcado; zerar e desmarcar têm linhagem);
  - num cruzamento raro (duas abas unindo, cada uma, a gravação concorrente da outra), contagens de tentativas e
    atividade podem somar duas vezes o mesmo trecho; marcações não se perdem;
  - a gravação local não usa trava entre abas (o `localStorage` é síncrono e a trava do navegador é assíncrona); a
    correção é a união com linhagem e a regravação ao receber o aviso, não exclusão mútua.

### 9.2 Segunda rodada (`auditoria/firebase-codex-b2a369b.md`, que reprovou `b2a369b`)

Reprodução no `b2a369b` (testes do Codex, na cópia dele, sem alteração, apontados para esta branch):
`f01-abas.test.js` 6 de 8 (`zerar` e `zerar-duplo` falham); `f01-riscos.test.js`: `zerar-nuvem` ✗, `zerar-unica` ✗,
`exclusao-surda` ✗, `contagens` ✗ (58 de 62), `escrita-interrompida` ✗, `suspensa` ✓; `hosting-auditoria.py`: 3 falhas.

| Achado | Causa | Correção |
|---|---|---|
| F08 (alta): estudo perdido depois de "Zerar", mesmo numa aba | na união depois de "Zerar" (`08-uniao-nuvem.js`), o lado que não zerou era unido com base vazia: o que ele tinha **antes** do "Zerar" era tratado como novo, e o que ele estudou **depois** podia ser cortado | `novidades(base, outro)`: só o que mudou desde a base comum (contagens como diferença) entra na união com o lado zerado |
| F01 residual (alta): perda na janela entre ler e gravar a chave | ler, unir e gravar a mesma chave em abas diferentes não é atômico; o aviso `storage` pode atrasar ou chegar fora de ordem | arquitetura nova em `14-abas.js` (abaixo) |
| F09 (média): contagens a menos (49 ou 38 de 62) | dois incrementos independentes iguais pareciam a mesma mudança (`uTres` com valores iguais) | entre abas a base é exata, então a união soma (`somar`: `max(0, l + c − base)`) para `act`, `erros` e tentativas; a união com a nuvem não mudou |
| Cópia apagada restaurada por uma aba que não recebeu o aviso | a aba unia o que tinha na memória com a chave vazia | o diário dela leva a base; com a cópia principal apagada, só entra o que veio depois da base (`soDepois`), sem certificados antigos |
| H01: nada conferia o deploy | — | gancho `predeploy` com `verificar-hosting` (seção 4) |
| H02: a marca de homologação bastava em qualquer arquivo | — | `config_homologacao`: configuração real do `index.html` (projeto, `homologacao`, `authDomain`, projeto do deploy) |
| H03: `/` sem `no-cache` | — | cabeçalho para a rota `/` |

**Arquitetura local nova (`14-abas.js`)**:
1. **Diário por aba, durável na hora**: `salvar()` grava, de forma síncrona, `missao-eear-v1-diario@<conta>#<aba>` =
   `{seq, bid, base, st}` (número da alteração, versão da cópia principal de que partiu, o estado daquela versão e o
   estado novo). Cada aba escreve só na própria chave: nada que ela grave é apagado por outra.
2. **Cópia principal com trava** (Web Locks, `eear-local@<conta>`, exclusiva): ler, unir e gravar a cópia principal só
   acontece com a trava. A cópia principal leva `_abas: {id, lin, inc}`; `inc[aba] = seq` diz até que alteração o diário
   da aba já entrou, na mesma gravação (idempotente: aplicar de novo não dobra).
3. **Gravação síncrona só com a trava**: a aba que estudou fica com a trava enquanto nenhuma outra precisa dela e, com
   ela, grava a cópia principal na hora (cada clique já está na cópia que outra aba ou uma reabertura leem). A aba que
   precisa gravar escreve um pedido (`missao-eear-v1-quer@<conta>`; o aviso `storage` chega à dona) e entra na fila; a dona
   solta e volta à fila sem pedir. A dona também confere a fila a cada 250 ms (aviso perdido) e solta a trava ao ir para
   o fundo ou fechar (uma aba suspensa não prende as outras). Sem trava e sem cópia principal (conta nova no aparelho),
   a aba cria a cópia na hora: não há versão a sobrescrever.
   *Tentativa descartada nesta rodada*: gravar uma "prévia" sem trava quando a cópia principal parecia não ter mudado.
   O rastro de uma falha intermitente (contagem 37 a 41 de 42) mostrou a causa: no Chromium, uma aba pode ler a chave
   atrasada (outro processo já gravou), e a prévia apagava uma versão confirmada; nenhuma escolha de base corrige isso.
   Por isso, fora a criação da cópia que não existe, nada grava a cópia principal sem a trava.
4. **Diários de abas que fecharam**: cada aba segura `eear-vida#<aba>@<conta>` (exclusiva) enquanto está aberta; as
   outras pedem a mesma trava em modo compartilhado e, quando a recebem, absorvem o diário órfão. O diário fica como
   recibo até ser absorvido; os de abas vivas só são aplicados por elas.
4a. **Cópia principal gravada por fora da cadeia** (versão antiga do app, sem linhagem): do diário entra só o que a aba
   mudou desde a própria base (`novidades`, contagens somadas como diferença); o que ela não mudou não volta. Sem isso, o
   diário de uma página que não estudou nada reintroduzia um erro já corrigido em outro lugar (achado na suíte, caso
   "estudo offline nos dois aparelhos").
5. **Nuvem por uma aba só** (`eear-nuvem@<conta>`): a aba líder sincroniza; as outras gravam no aparelho e mostram
   "Progresso salvo na sua conta." quando a cópia sincronizada é igual à delas. Com a trava livre, a aba lidera na hora
   (com uma aba, tudo como antes); a líder mantém a trava entre sincronizações (soltar e pedir de novo, como numa versão
   intermediária, fazia a aba se ver como seguidora por instantes e deixava a sincronização pendente).

Resultados depois da correção (seção 3 e relatório da rodada): `f01-abas.test.js` 8 de 8; `f01-riscos.test.js`:
`zerar-nuvem`, `zerar-unica`, `suspensa`, `exclusao-surda` e `contagens` (62 de 62) passam; `escrita-interrompida`
recusa este alvo por construção ("Revisar breakpoints para este alvo"), porque os pontos de parada miram linhas do
código anterior. O equivalente para o código novo é `testes/abas-interrupcao.js` (pontos de parada reais do Chromium
depois da leitura e depois da gravação da cópia principal; B grava o diário e fecha; A grava por cima e fecha; a aba que
abre tem de ter as duas marcações). `hosting-auditoria.py`: 0 falha.

**Limites que continuam**:
- navegador sem Web Locks (Safari anterior ao 15.4): cada aba grava o próprio diário e consolida sem trava; a janela de
  F01 volta a existir ali;
- a absorção de um diário órfão espera o navegador soltar a trava de vida da aba que fechou (medido: milissegundos;
  numa aba congelada pelo sistema, pode demorar até ela ser descartada);
- enquanto outra aba tem a trava, a aba que não a tem guarda o estudo no próprio diário (durável) e a cópia principal
  recebe esse estudo quando a vez chega (normalmente milissegundos; até 250 ms se o aviso se perder). Uma reabertura
  nesse intervalo lê a cópia principal sem esse trecho; o diário entra na consolidação seguinte;
- leitura atrasada da chave pela própria dona da trava (entre processos do navegador) continua possível em tese; nos
  testes, não apareceu com a gravação só sob trava (contagens 42 de 42 em todas as rodadas; antes, com a prévia, 9 de 12
  rodadas falhavam);
- a soma de contagens entre abas supõe base exata; entre aparelhos (nuvem) a regra continua a de antes;
- fora da cadeia (cópia gravada por versão antiga do app), uma desmarcação feita na aba não passa para a cópia
  principal (marcações e contagens passam);
- o teste `escrita-interrompida` do Codex precisa ser reapontado para as linhas novas (eu não alterei a branch dele).

### 9.3 Terceira rodada (`auditoria/firebase-codex-61e1d32.md`, que reprovou `61e1d32`)

O parecer confirmou F01 (8 de 8), F08, F09 (62 de 62; 202 de 202 com quatro abas), H01, H03 e F02–F07, e trouxe
F10, F11, F12 e um resíduo de H02. Reprodução no `61e1d32`, com os testes do Codex sem alteração:
`diarios-auditoria.test.js` 5 de 8 (`sem-web-locks-crash`, `exclusao-com-diario-pendente` e `sem-notificacoes` falham);
`hosting-gates-auditoria.py` 2 falhas (configuração só num comentário; script que a redefine antes do app).

| Achado | Causa | Correção (`curso/app/15-diarios-pendentes.js`, `web/verificar_publicacao.py`) |
|---|---|---|
| F10 (alta): exclusão local apagava o diário ainda fora da cópia de outra aba | `sincronizado()` só olhava a memória da aba; `apagarLocal()` apagava todos os diários | diário **pendente** = o que ainda mudaria a cópia principal (inc não o cobre e aplicá-lo muda a cópia). Com um pendente, `sincronizado()`/`sincronizadoDe()` são falsos (não se oferece apagar); `apagarLocal()` nunca apaga um pendente; a exclusão pedida na tela roda com a trava local (depois de qualquer consolidação em andamento) e confere de novo |
| F11 (alta): sem Web Locks, diários órfãos eram ignorados | sem a trava não havia como saber se a dona do diário estava viva | registro de vida por aba (`missao-eear-v1-vida@<conta>#<aba>`, a cada 2 s; removido ao fechar); diário de aba sem registro recente (8 s; 30 min em segundo plano) é órfão e entra na consolidação. A dona que só parecia fechada reconhece o próprio diário na cópia (`loc.jhist`, `baseSeq`) e não conta duas vezes |
| F12 (baixa): órfão esperava a próxima abertura sem aviso `storage` | a vigia só começava pelo aviso ou na abertura | procura de diários a cada 3 s (com Web Locks: vigia a trava de vida; sem: consolida os órfãos) |
| H02 residual (média) | regex sobre o texto inteiro do `index.html` | só vale a atribuição dentro de um `<script>` da própria página, fora de comentários, e uma única menção no `index.html`; em qualquer outro arquivo do site, `EEAR_FIREBASE` só pode aparecer nas duas leituras do app |

Resultados com a correção: `diarios-auditoria.test.js` 8 de 8; `hosting-gates-auditoria.py` 0 falha; autoteste 188
casos (dois casos novos de H02). Regressão própria: `testes/abas-recuperacao.js` (queda real da página sem Web Locks,
logo depois de gravar o diário; exclusão com diário pendente de outra aba), que falha no `61e1d32` e passa com a
correção. `testes/ciclo-sincronia.test.js` passou a ser o do Codex (espera a operação antiga entrar no transporte).

Limites que continuam: sem Web Locks, duas abas podem consolidar ao mesmo tempo (sem exclusão mútua); o diário
sobrescrito é aplicado de novo (inc), mas a recuperação de um órfão leva até cerca de 10 s; uma aba em segundo plano
que cai só tem o diário absorvido depois de 30 min (ou quando ela volta). A aba líder pode mostrar "Progresso salvo na
sua conta." enquanto outra aba tem um diário pendente por milissegundos; a exclusão, ainda assim, fica bloqueada.

## 10. Riscos pendentes (investigados; nada disso está resolvido)

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

# Parecer independente final — b2a369b

**REPROVADO.** Há perda de progresso reproduzida após “Zerar” e em uma janela real de leitura/escrita concorrente no `localStorage`. A matriz independente terminou em **6/8**, sem alteração dos testes ou de seus critérios. H01–H03 também permanecem abertos.

Data: 11/11/2026. Repositório `YNPHAX/EEAR`. Snapshots obtidos diretamente do GitHub:

- Merge auditado: [`553ff011686497e29272fa542a27b11308407bb2`](https://github.com/YNPHAX/EEAR/commit/553ff011686497e29272fa542a27b11308407bb2).
- Implementação final auditada: [`b2a369b29dd6fcb532260e9948a6e0941b990500`](https://github.com/YNPHAX/EEAR/commit/b2a369b29dd6fcb532260e9948a6e0941b990500).

O código foi examinado em worktrees detached. Não alterei a branch do Claude nem o runtime da branch Codex. Não fiz merge, deploy, publicação de regras ou operação no Firebase real. Os serviços utilizados foram emuladores locais `demo-eear`, `demo-eear-f01` e Hosting `demo-eear-hosting`, sempre com dados fictícios.

## Oito cenários obrigatórios, sem enfraquecimento

Execução de `testes/f01-abas.test.js` da branch Codex, apontando `EEAR_REPO_ALVO` ao snapshot `b2a369b`. O arquivo e sua fixture são idênticos aos publicados em `19954ed`; `git diff --exit-code` confirmou isso.

SHA-256 dos arquivos executados:

- `testes/f01-abas.test.js`: `b367dd5e599c71bb570a90f2f87ea7e24676c1ddebf7e023cdde23df7e6ee777`.
- `testes/f01-fixture.js`: `1d4f30fc985645a4cde9d90865fa14dd4b451507e02eddbc533f31c0dcbd03d8`.

| Cenário | Resultado |
|---|---|
| Dispositivos separados | Passou |
| Fechar A offline | Passou |
| Fechar B offline | Passou |
| Desmarcar sem ressuscitar a marcação | Passou |
| Zerar com outra aba antiga | **Falhou na sincronização/reabertura** |
| Certificado importado, fechamento e reconexão | Passou |
| Reconectar mantendo ambas as abas abertas | Passou |
| Zerar nas duas abas, estudar depois e reconectar | **Falhou na sincronização/reabertura** |

As duas falhas passaram na verificação offline, mas falharam no servidor e na exportação após reabrir. Não são timeouts de preparação: os dados esperados foram aceitos na UI e exportados antes da reconexão. Resultado global: **6/8, exit 1**.

## F08 — Alta — estudo posterior a “Zerar” é apagado na sincronização

Local: [`curso/app/08-uniao-nuvem.js:113`](https://github.com/YNPHAX/EEAR/blob/b2a369b29dd6fcb532260e9948a6e0941b990500/curso/app/08-uniao-nuvem.js#L113), união com base após reset.

Reprodução independente adicional (`zerar-nuvem` e controle `zerar-unica`):

1. Sincronizar uma conta fictícia com progresso e certificado.
2. Ficar sem comunicação com Auth/Firestore, executar “Zerar” e marcar uma tarefa nova **depois** do reset.
3. Reabrir ainda offline: a tarefa nova está presente; certificado antigo e progresso anterior estão corretamente ausentes.
4. Reconectar e reabrir: a tarefa nova desaparece do Firestore e do estado exportado. O app informa **“Progresso salvo na sua conta.”**

Estado observado, resumido:

```text
Aceito/offline: certsZ > 0, certs=[], feito={"T:depois":true}, atividade=1
Firestore:     certsZ > 0, certs=[], feito={},                 atividade=1
Reaberto:      certsZ > 0, certs=[], feito={},                 atividade=1
```

O controle com **uma única aba** reproduziu a mesma perda em `b2a369b` e também em `553ff01`. Portanto, este defeito já existia antes de `14-abas.js`; não é correto atribuí-lo exclusivamente à nova correção de F01. Também não é seguro contorná-lo apenas com “uma aba por vez”.

Causa no código: o ramo de reset calcula o delta do outro lado e chama `unirProgresso(zerou, zerou, so)`. O estado `zerou`, que já inclui estudo posterior ao reset, passa a ser a base. Para um item apagável que só está nesse estado, sua ausência no delta `so` pode ser interpretada como nova exclusão. Isso apaga a tarefa posterior ao reset. O arquivo `08-uniao-nuvem.js` é idêntico nos dois commits comparados.

## F01 residual — Alta — leitura/união/escrita não é transacional

Local: [`curso/app/14-abas.js:46`](https://github.com/YNPHAX/EEAR/blob/b2a369b29dd6fcb532260e9948a6e0941b990500/curso/app/14-abas.js#L46), `gravarLocal()`; reparação posterior no handler `storage`.

A implementação melhora os casos sequenciais: lê o cache, une com a memória e regrava. Contudo, há operações separadas para ler o progresso, ler/gravar a linhagem e escrever o progresso. Nenhuma trava ou transação engloba essa sequência. O evento `storage` é uma reparação assíncrona, que depende de uma aba com a versão perdida continuar viva.

Reprodução **sem falsificar `getItem`, `setItem` ou o conteúdo do progresso**, usando breakpoints reais do Chromium:

1. A e B têm a mesma base confirmada; Auth/Firestore são colocados offline.
2. A inicia uma marcação e é pausada pelo DevTools imediatamente **depois da leitura real** da chave, antes de escrever.
3. B marca `T:B-race`, grava; o teste lê a chave real e confirma que a marcação está persistida. B fecha.
4. A continua com a leitura antiga. O teste pausa A imediatamente **depois do `localStorage.setItem` real**, antes do processamento dos eventos de outra aba, e fecha A.
5. C abre ainda offline: há `T:A-race`, mas **não há `T:B-race`**.

Saída: `BconfirmadaAntesDeFechar=true`; cache após fechar ambas: `feito={"T:base":true,"T:A-race":true}`. O breakpoint posterior à escrita foi confirmado pelo protocolo do navegador. Não houve falha de preparação nesse cenário.

O debugger controla a intercalação e o ponto de fechamento; não substitui o algoritmo. A evidência é de uma janela possível de execução, não de sua frequência entre usuários. Ela demonstra que “a outra aba une de volta” não garante preservação se as abas fecharem antes dessa reparação. A segunda chave de linhagem não transforma a gravação em transação.

Uma solução deve preservar duravelmente cada alteração aceita antes de permitir que outro escritor a cubra, incluindo fechamento/interrupção, ou serializar os escritores com garantias de persistência adequadas. Repetir leituras ou depender apenas de eventos não fecha a janela demonstrada.

## F09 — Média — contagens incorretas sob concorrência real

Locais: `14-abas.js`, `lembrarLocal()`, `baseComum()` e `gravarLocal()`; união numérica em `08-uniao-nuvem.js`.

Teste `contagens`: atividade inicial 2, mais 30 marcações distintas em cada aba, disparadas em pares com `Promise.all`. Esperado: **62**. As 60 marcações novas e a marcação inicial permaneceram, mas atividade em memória e no cache ficou em:

- Primeira rodada: **49**, nas duas abas e no cache.
- Segunda rodada: **38**, nas duas abas e no cache.

Não reproduzi **duplicação** nessas duas rodadas; reproduzi **subcontagem**, um limite adicional ao risco de duplicação reconhecido pelo autor. Não se pode concluir que a duplicação esteja resolvida ou ausente. Os resultados acima se referem à atividade local, não a uma medição de contagens no Firebase real.

A linhagem é substituída pela da versão lida em `lembrarLocal(atual, ...)`, antes da nova gravação. Uma união de duas histórias concorrentes não registra necessariamente os dois ramos como ancestrais. Sem uma representação causal suficiente ou serialização, a base usada para calcular deltas pode deixar de separar contribuições independentes. As contagens não têm garantia de exatamente uma aplicação por alteração.

## Cópia apagada e abas suspensas

Foram separados dois testes, para não confundir condições distintas:

- **Suspensão real do Chromium:** congelar B com `Page.setWebLifecycleState`, executar “Zerar” em A, reativar B e estudar. **Passou**: os itens/certificados antigos não voltaram e o estudo novo permaneceu localmente. Esse resultado não cobre todas as formas de descarte/suspensão de navegadores móveis.
- **Notificação de exclusão não recebida:** B ignora o evento `storage`, modelando o limite reconhecido pelo autor. A apaga a cópia local pela UI; a remoção da chave é confirmada. B estuda: **a cópia antiga reaparece**, incluindo `T:base` e o certificado fictício. O código pula a união quando a chave atual é `null` e grava o estado antigo mantido em memória.

O segundo teste confirma um limite de reaparecimento de cache sob perda de notificação. Ele mantém o usuário conectado e a cópia na nuvem; **não demonstra recriação de conta excluída, quebra de UID ou falha de exclusão no servidor**. A notificação foi suprimida explicitamente; o teste com congelamento real, acima, passou. É necessário manter essa distinção ao comunicar o risco.

## F02–F07 após o merge

| Correção | Evidência independente |
|---|---|
| F02, resposta após saída | Cenário `saida` passou contra o build real de `b2a369b` |
| F03, callback de sessão antiga | Cenário `callback` passou |
| F04, recusa atrasada desligando nova sessão | Cenário `recusa` passou |
| F05, projeto de teste sem marcador e scripts separados | Cinco regressões preservadas; autoteste completo agora **183/183**; sonda de Hosting confirma recusa de `eear-teste` sem marcador em `--site` |
| F06, comentário sobre dados pessoais | Comentários corrigidos preservados; `dados` continua podendo conter `cfg.nome`, sem promessa de anonimização |
| F07, fixture herdando configuração externa | Código da fixture é idêntico ao da correção Codex; build temporário força `null` e recusa atribuição Firebase prévia; suíte oficial executada exclusivamente em emuladores |

A suíte Firebase existente passou **50/50**, incluindo Google no emulador e a sonda simples de duas abas do autor. Isso confirma as verificações que ela contém, mas não contradiz as falhas da matriz independente, que inclui reset seguido de novo estudo e reabertura. As expressões de autorização das regras Firestore permanecem inalteradas e os testes de UID/campos passaram.

F02–F07 foram incorporadas e mantidas; isso não é garantia de correção de toda a integração nem resolve F08/F09/F01 residual.

## H01–H03 reavaliados

`firebase.json` e `.firebaserc` são idênticos aos de `ce548dd`. A nova sonda contra `b2a369b` encontrou **3 falhas**: H01 e os dois casos de H02. A quarta falha antiga, de F05, desapareceu após o merge da correção Codex.

- **H01 — Média, aberto:** não há `hosting.predeploy` para verificar projeto efetivo, diretório efetivamente enviado e conteúdo. O alias padrão `eear-teste` continua sendo apenas um padrão, substituível por `--project`. Nenhum deploy foi executado como teste.
- **H02 — Média, aberto:** `--homologacao` ainda aceita (exit 0) projeto divergente com marcador e artefato oficial com marcador somente em página auxiliar. O detector conservador de F05 continua sendo reutilizado como autorização de homologação, sem validar a configuração efetiva da entrada do app.
- **H03 — Baixa, aberto:** novo teste HTTP no emulador confirmou `/` com 200 e `Cache-Control` ausente, enquanto `/index.html`, JS, SW e manifesto recebem `no-cache`. Não foi demonstrado cache incorreto em produção.

O endpoint `/__/auth/handler` retornou 404 no emulador utilizado; não foi tratado como prova de defeito no Hosting real. OAuth real, Safari/PWA iOS, configuração do console e instalação de APK em aparelho real continuam fora da validação executada.

## CI dos commits solicitados

| Commit | Resultado verificado no GitHub |
|---|---|
| `553ff01` | Nenhum Actions run nem check-run associado retornado pelas APIs filtradas pelo SHA. O combined status tem zero statuses; o rótulo padrão `pending` desse endpoint não representa um job executando. **Sem evidência de CI próprio desse commit.** |
| `b2a369b` | [Site](https://github.com/YNPHAX/EEAR/actions/runs/43055195232) e [App Android](https://github.com/YNPHAX/EEAR/actions/runs/43055195277): sucesso, jobs de publicação pulados. [Testes](https://github.com/YNPHAX/EEAR/actions/runs/43055195496): **falha nos dois jobs durante instalação**, antes de executar as asserções. |

Os logs de `b2a369b` mostram `Temporary failure resolving` nos mirrors Ubuntu e erro 100 na instalação de dependências do Chromium. Isso é falha de infraestrutura, não uma execução reprovada das asserções do app; também não é CI verde. Não foram disparados workflows de publicação nem novas tentativas de deploy.

## Testes executados e limites

- Oito cenários F01 inalterados: **6 passaram, 2 falharam**.
- Cinco investigações adicionais: reset/nuvem falhou; suspensão real passou; exclusão sem notificação restaurou a cópia; contagens ficaram incorretas; escrita interrompida perdeu marcação confirmada.
- Controle adicional em `b2a369b`: reset com uma aba falhou; segunda rodada de contagens ficou em 38/62.
- Controle de atribuição em `553ff01`: reset com uma aba também falhou.
- Suíte Firebase do candidato: **50/50**; ciclo de sessão: **3/3**; autoteste de publicação: **183/183**; build, montagem, integridade e conferência dos workflows passaram.
- Sonda Hosting: **3 falhas**; cabeçalhos do Hosting emulado reavaliados; sintaxe/lint do novo teste e `git diff --check` passaram.

Ambiente local: Node 24.22.1, Java 21, Firebase CLI 15.35.0, SDK 12.19.0, Playwright 1.63.0 e Chromium 153. O CI usa Node 22. Não foi repetida a suíte completa de plataforma de longa duração nem compilado um APK local novo; as verificações focadas acima já encontraram bloqueadores de dados. Não foi usado resultado de teste do autor como substituto das reproduções independentes.

Reproduções adicionais disponíveis em `testes/f01-riscos.test.js`. Use as mesmas variáveis de `f01-abas.test.js`; `EEAR_F01_RISCOS` seleciona `zerar-nuvem`, `zerar-unica`, `suspensa`, `exclusao-surda`, `contagens` ou `escrita-interrompida`. O teste de debugger exige os pontos de interrupção do código auditado e falha explicitamente se o alvo mudar. Erros de preparação são identificados como tais, não classificados silenciosamente como defeitos do produto.

Evidências e hashes: `firebase-codex-b2a369b-evidencias.txt`. Logs completos nesta sessão: `/tmp/eear-final-evidence/`. O novo teste e este relatório ficam exclusivamente na branch `codex/auditoria-firebase-eear`; não são correções do runtime do Claude.

Teste adicional e instruções de reprodução: commit [`c2a6632`](https://github.com/YNPHAX/EEAR/commit/c2a66321462941ad0116f34d27c40ae0cd769ca8). Os oito testes de aceitação anteriores não foram alterados.

**Conclusão final: REPROVADO.** A correção melhora a preservação em vários cenários, mas não fecha as janelas demonstradas nem preserva o estudo posterior a “Zerar”. Contagens e Hosting também exigem revisão. Não há base técnica para aprovação com ressalvas enquanto essas perdas confirmadas permanecerem.

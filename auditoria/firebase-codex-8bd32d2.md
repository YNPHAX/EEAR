# Auditoria independente — 8bd32d2

**REPROVADO para avançar à homologação.** Os oito cenários F01 e as reproduções anteriores de F10–F12 passaram. Entretanto, um teste adicional reproduziu perda silenciosa de progresso sem Web Locks, repetida em uma segunda execução. Também houve duplicação de contagens no retorno de aba considerada órfã e dois falsos aceites adicionais de H02. Os três workflows do candidato estão verdes.

Alvo auditado diretamente do GitHub: [`8bd32d2ca92a408e5cc3b0988b8a4a19e424c42b`](https://github.com/YNPHAX/EEAR/commit/8bd32d2ca92a408e5cc3b0988b8a4a19e424c42b), branch `claude/eear-study-hydwqt`. Referência anterior: [parecer 61e1d32](firebase-codex-61e1d32.md), seus testes e [evidências](firebase-codex-61e1d32-evidencias.txt). Data: 12/11/2026.

O código do candidato foi examinado e executado em worktree detached. Alterei somente testes e documentação em `codex/auditoria-firebase-eear`; o runtime e as correções F02–F07 dessa branch foram preservados. Não alterei a branch Claude, não fiz merge, deploy, publicação de regras ou operações no Firebase real. Todos os dados são fictícios, em projetos emulados `demo-eear`, `demo-eear-f01` e `demo-eear-hosting`.

## Achados que impedem aprovação

| ID | Gravidade | Evidência |
|---|---|---|
| F13 — corrida entre gravação e limpeza de diário no fallback | **Alta** | B aceito e persistido; terceira aba elimina o recibo; escritor com leitura antiga sobrescreve a cópia; após crash, reabertura e reconexão, B desaparece e a UI informa que tudo está salvo |
| F09 residual — adoção parcial de diário de aba viva | **Média** | Atividade esperada 4; observada 5 localmente e 7 no servidor/reabertura, nos casos de 8 segundos e de 30 minutos |
| H02 residual — configuração inerte aceita | **Média** | Configuração em comentário JavaScript ou em script `application/json` autoriza um artefato sem Firebase ativo; ambos exit 0 |

### F13 — limpeza prematura permite perda silenciosa sem Web Locks

Locais no alvo: [`14-abas.js:101`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/14-abas.js#L101) (leitura), [linha 110](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/14-abas.js#L110) (recibo já incorporado), [linha 121](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/14-abas.js#L121) (gravação), [linha 124](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/14-abas.js#L124) (remoção do diário). A consolidação do fallback continua sem exclusão mútua; a nova varredura em `15-diarios-pendentes.js:74` passa a executá-la também para órfãos.

Reprodução independente `testes/concorrencia-fallback.test.js`, **sem suprimir eventos storage, sem controlar o relógio e sem falsificar qualquer leitura ou gravação**:

1. A, B e C abrem a mesma conta fictícia; confirmar a base na nuvem. Retirar a comunicação com Auth/Firestore. Simular ausência da API Web Locks antes de carregar o app.
2. A marca `T:A` e é pausada por breakpoint nativo **depois de ler** a cópia principal real, antes de uni-la e gravá-la.
3. B marca `T:B`. Conferir a aceitação na exportação da UI, a presença de B na cópia principal e seu diário real. Fechar B.
4. C detecta B fechada, considera seu diário já incorporado e o remove. Conferir **1 → 0 recibos contendo B**, enquanto a cópia principal ainda contém B. Fechar C.
5. Retomar A. Ela escreve a cópia baseada na leitura antiga. Pausar imediatamente depois do `setItem` real; conferir que a cópia contém A e não B. Interromper A com `Page.crash`.
6. Abrir D offline, aguardar recuperação, reconectar e conferir UI, cópia principal e Firestore emulado.

Resultado em **duas execuções**:

```text
aceitoB=true, persistidoB=true, recibosAntes=1, limpou=true
após limpeza de C: {T:base, T:B}
após escrita de A: {T:base, T:A}
após recuperação: {T:base, T:A}; recibos contendo B=0
servidor:         {T:base, T:A}; atividade=3 (esperado 4)
aviso: "Progresso salvo na sua conta."
```

Não é somente atraso de recuperação: a única cópia principal com B foi coberta e seu recibo já havia sido eliminado. Não depende de uma exclusão solicitada pelo usuário. O debugger seleciona uma intercalação possível; não mede sua frequência. Os pontos são os mesmos tipos de leitura/escrita reais usados no teste independente anterior de interrupção, agora com uma terceira aba executando a limpeza do fallback.

O fato de B estar realmente fechada não torna seguro eliminar seu recibo: A ainda está viva com uma leitura anterior. `_abas.inc` na cópia principal não garante, sem serialização, que essa cópia não será coberta por outro escritor. A remoção e a gravação principal não pertencem a uma transação comum. Uma solução precisa coordenar escritores e limpeza com garantias adequadas de persistência, ou impedir o estudo nesse caminho e preservar meios de recuperação dos diários existentes. Alterar somente o prazo de detecção não fecha essa janela.

### F09 residual — retorno de aba viva reaplica contribuição anterior

Locais: [`14-abas.js:83`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/14-abas.js#L83), `aplicarDiario()`, `consolidarAgora()` e `receberPrincipal()` na linha 139; detecção por tempo em [`15-diarios-pendentes.js:60`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/15-diarios-pendentes.js#L60).

Teste `segunda-escrita-8s`, com eventos `storage` explicitamente suprimidos, exercitando o caminho de recuperação periódica:

1. Atividade inicial 2. B faz duas marcações distintas na mesma tarefa JavaScript, pelos handlers reais da UI.
2. Pausar B **antes do `setItem` do segundo diário**, depois de incrementar a nova sequência. O primeiro diário já foi gravado; a primeira marcação já aparece na exportação da UI. Nenhuma das duas entrou ainda na cópia principal.
3. Deixar passar o prazo real de 8 segundos sem heartbeat de B. A incorpora o primeiro diário: atividade **3**, sequência incorporada igual à sequência real capturada. Observar mais uma varredura: continua 3.
4. Retomar B: ela grava o segundo diário e termina a alteração. A atividade correta seria **4**. Ela termina em **5** na UI/cache; após reconexão e reabertura, **7**.

O primeiro caso foi reproduzido duas vezes. Não houve perda das duas marcações nesse teste; houve duplicação de atividade. O controle `retorno-8s`, com apenas um diário e pausa no início da consolidação depois do handler, passou: **3/3** local, servidor e reabertura, com certificado preservado.

O teste `segunda-escrita-30min` repetiu o mesmo problema com heartbeat de segundo plano (`oculta=true`): antes de `t+1.799.999 ms`, a cópia principal não recebeu o diário; depois de `t+1.800.001 ms`, recebeu-o uma vez. O retorno terminou igualmente em **5**, depois **7**, para esperado **4**. Esse caso controla somente `Date.now` no observador e no retorno; não esperou 30 minutos reais nem modificou `localStorage`.

Causa: `receberPrincipal()` usa `jhist` quando reconhece uma sequência própria já adotada. Mas a consolidação de um diário **mais novo** cujo estado ainda parte da base anterior passa por `aplicarDiario()` antes dessa reparação. A contribuição do diário anterior, já presente na principal, volta a entrar no delta. O histórico de recebimento não torna a aplicação parcial de sequências idempotente nesse caminho. A duplicação local é comprovada antes de qualquer reconexão; 7 é o resultado adicional observado na nuvem, não uma previsão teórica.

### Segurança dos prazos de detecção

Heartbeat a cada 2 segundos e ausência por 8 segundos/30 minutos são indícios de inatividade, não prova de término da aba. O controle com uma sequência passou, mas a aba viva pausada no meio de uma sequência nova mostrou que o retorno ainda não é seguro para todas as intercalações. A varredura de 3 segundos também não substitui serialização da escrita e da limpeza, como F13 demonstra.

Uma queda em segundo plano que não execute `pagehide` deixa um registro `oculta=true`; pelo código, a recuperação por outra aba pode esperar mais de 30 minutos, acrescidos da próxima varredura. É uma consequência do prazo escolhido, distinta da perda definitiva de F13. O teste de limiar confirma a classificação antes/depois do prazo; não certifica o comportamento de timers de Safari ou de cada WebView móvel. Não tratei a passagem de um único teste de retorno como prova geral da segurança da heurística.

### H02 — dois novos falsos aceites em scripts inertes

Local: [`web/verificar_publicacao.py:455`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/web/verificar_publicacao.py#L455), `SCRIPT_INLINE` e `config_homologacao()`.

Os dois casos antigos foram corrigidos: configuração em comentário **HTML** e sobrescrita literal por script externo agora são recusadas. Contudo, o extrator ainda aceita qualquer conteúdo de `<script>` sem `src`, sem considerar tipo executável ou comentário JavaScript.

Acrescentei à sonda existente dois casos, partindo de build oficial sem configuração ativa:

```html
<script>// window.EEAR_FIREBASE = {...config fictícia válida de teste...};
</script>
```

```html
<script type="application/json">window.EEAR_FIREBASE = {...config fictícia válida de teste...};</script>
```

Ambos passaram pelo comando real `verificar-hosting <pasta> eear-teste`, **exit 0**, embora nenhum ative Firebase no app. O primeiro é comentário JavaScript; o segundo é bloco de dados não executável. Os casos não usam ofuscação nem dependem de executar SDK ou acessar projeto real. Demonstram que o gate confere um literal extraído do texto, sem provar que seja a configuração executada da entrada. É uma falha da barreira de artefato, não uma demonstração de invasão remota ou de acesso indevido a UID.

### Queda do processo inteiro — limite de durabilidade do armazenamento

Além de `Page.crash`, executei **`Browser.crash`**, que encerrou o processo do Chromium e todas as páginas, com perfil temporário persistente. A marcação estava aceita na exportação, seu diário era legível em outra aba, a principal ainda não a continha e a UI da outra aba **bloqueou a exclusão**. A recuperação após a queda foi conferida no mesmo perfil.

| Intervalo antes de Browser.crash | Observação antes de carregar o app novamente | Recuperação |
|---|---|---|
| 1,2 segundo | Principal ausente, **zero diários** da conta | **Falhou**, sem dado para o recuperador aplicar |
| 6,5 segundos, controle diagnóstico | Principal presente, diário com a marcação presente | **Passou**, atividade **3/3**, UI e servidor |

A inspeção anterior ao app usa uma resposta 404 da mesma origem, sem executar o código EEAR, e lê o armazenamento real. O teste de intervalo curto **permanece reprovado**; o controle com mais tempo não substitui esse resultado nem altera seu critério.

Para identificar a camada responsável, executei `testes/storage-crash-controle.js`, que não carrega EEAR nem Firebase. Ele apenas grava um marcador fictício em `localStorage`, encerra/reabre o mesmo perfil e lê a chave. Resultado: fechamento limpo após 1,2 s preservou o marcador; `Browser.crash` após 1,2 s perdeu-o; `Browser.crash` após 6,5 s preservou-o. A falha de intervalo curto, portanto, também existe sem o algoritmo do app no Chromium usado.

Isso demonstra um **risco restante de durabilidade de gravações locais recentes em queda completa do processo**, distinto de F13. Não é prova de erro específico do recuperador de órfãos: o dado já estava ausente antes de o app reabrir. Também não foi tratado como mero timeout do emulador. O app ainda depende dessa garantia limitada do armazenamento escolhido; não se pode afirmar que toda alteração aceita já está no disco. Não medi uma duração universal de flush nem extrapolei esses intervalos para todos os navegadores. F13, por sua vez, remove um diário real por ação do próprio algoritmo enquanto o processo de armazenamento continua vivo, e basta para bloquear a homologação independentemente deste limite.

## Regressões que passaram

Os arquivos `f01-abas.test.js`, `f01-fixture.js`, `f01-riscos.test.js`, `diarios-auditoria.test.js` e `ciclo-sincronia.test.js` foram mantidos idênticos a `9ba5f52`. Nenhuma asserção desses testes foi reduzida. Os novos cenários têm seus próprios arquivos e critérios adicionais.

| Suíte/cenário | Resultado |
|---|---|
| Oito F01 obrigatórios | **8/8**: dispositivos, fechar A, fechar B, desmarcar, Zerar, certificado, reconectar, Zerar duplo |
| Matriz anterior de diários | **8/8**, inclusive F10, F11 por crash de renderer e F12 sem notificações |
| Riscos anteriores | **5/5**: reset/nuvem, suspensão real, exclusão sem aviso, contagens 62/62 e escrita interrompida |
| Concorrência com Web Locks | Quatro abas, 200 alterações: atividade **202/202**, 201 marcações, certificado, fechamento simultâneo, reabertura e servidor corretos |
| Escrita interrompida com Web Locks | A principal ainda sem B foi comprovada antes de fechar; reabertura recuperou A+B e atividade **4/4** |
| F02/F03/F04 | **3/3**, esperando a operação antiga entrar no transporte antes da saída/troca |
| F08 com uma única aba | **Passou**: estudo posterior a Zerar preservado offline, servidor e reabertura; certificado antigo removido |
| Firebase do candidato/F07 | **50/50**, incluindo UID, campos, sessão offline, reconexão, certificados e Google no emulador; config externa inválida não foi lida |
| Verificador de publicação | **188/188** no autoteste do candidato; F05 site/APK preservado |
| Sonda Hosting anterior | **11/11** |
| Sonda de gates anterior | **10/10**, incluindo os dois falsos aceites antigos de H02 |
| Sonda de gates ampliada | **10 passaram, 2 falharam**, scripts inertes descritos acima |

**F10:** com Web Locks e breakpoint nativo após o handler de salvar, a alteração estava na exportação e no diário, mas fora da principal. A outra aba **não ofereceu excluir**; o diário permaneceu; após crash de renderer, a nova aba recuperou e enviou o estudo. A reprodução anterior passou sem adaptação do ponto.

**F11:** sem Web Locks, a reprodução anterior de `Page.crash` recuperou o diário órfão e enviou o progresso ao servidor. Esse conserto do caso simples é real, mas não elimina F13 nem a duplicação no retorno de uma aba viva.

**F12:** sem eventos `storage`, a aba sobrevivente recuperou automaticamente o órfão dentro dos mesmos 6 segundos usados anteriormente; abertura posterior preservou-o. A varredura resolveu esse caso anterior. A idempotência de adoções parciais continua reprovada no teste adicional de F09.

Desmarcações não ressuscitaram nos cenários obrigatórios; Zerar e estudo posterior, certificados, exclusão sincronizada e líder congelada continuaram passando nas matrizes anteriores. F09 permaneceu exato nos testes com Web Locks, mas **não está integralmente corrigido no fallback**.

F06, correção do comentário sobre dados pessoais, foi preservada; não há promessa de anonimização de `cfg.nome`. `08-uniao-nuvem.js`, regras Firestore, fixture Firebase, `firebase.json` e `.firebaserc` são idênticos aos de 61e1d32. A suíte Firebase foi executada a partir do snapshot do candidato com `EEAR_FIREBASE_CONFIG` apontando para arquivo externo inexistente, confirmando F07. F08 passou também no controle adicional de uma única aba.

## Hosting H01/H03 e CI

H01 permanece corrigido no caminho CLI auditado: o hook de predeploy chama o verificador com o diretório e projeto efetivos. Projeto diferente de `eear-teste`, projeto vazio, pasta ausente, artefato oficial e material proibido foram recusados. Nenhum deploy foi usado como teste. H02 continua aberto pelos dois novos falsos aceites.

H03 passou novamente por HTTP no emulador Hosting: `/`, `/index.html`, `/app.js`, `/sw.js` e manifesto responderam 200, `Cache-Control: no-cache`, `nosniff`, `noindex, nofollow` e política de referrer prevista. O 404 de `/__/auth/handler` no emulador não foi tratado como falha ou aprovação do OAuth real.

| Workflow do SHA exato 8bd32d2 | Resultado verificado por API/jobs/logs |
|---|---|
| [Testes — 43127064192](https://github.com/YNPHAX/EEAR/actions/runs/43127064192) | **Sucesso**, plataforma e Firebase; logs contêm asserções executadas, incluindo os novos testes simples do autor |
| [Site — 43127064260](https://github.com/YNPHAX/EEAR/actions/runs/43127064260) | **Sucesso** em montagem/verificação; publicação pulada |
| [App Android — 43127064307](https://github.com/YNPHAX/EEAR/actions/runs/43127064307) | **Sucesso** em compilação/verificação do APK; publicação pulada |

Não há falha de infraestrutura nesses três runs. O CI verde é confirmado; as reproduções adicionais F13/F09 e scripts inertes não integram seus gates padrão. Não disparei workflows de publicação.

## Reprodução, evidências e limites

Na branch Codex, com as dependências externas já instaladas e snapshot exato em `/tmp/eear-8bd32d2`:

```bash
export EEAR_REPO_ALVO=/tmp/eear-8bd32d2
export EEAR_FIREBASE_SDK=/tmp/eear-audit-deps/node_modules/firebase
export EEAR_FIREBASE_CLI=/tmp/eear-audit-deps/node_modules/.bin/firebase
export NODE_PATH=/tmp/eear-audit-deps/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/tmp/eear-audit-browsers
node testes/f01-abas.test.js
node testes/diarios-auditoria.test.js
node testes/f01-riscos.test.js
node testes/orfaos-auditoria.test.js
node testes/concorrencia-fallback.test.js
python3 testes/hosting-auditoria.py "$EEAR_REPO_ALVO"
python3 testes/hosting-gates-auditoria.py "$EEAR_REPO_ALVO"
```

As suítes que usam emuladores devem rodar sequencialmente. `EEAR_ORFAOS_CENARIOS` permite selecionar casos separados por vírgula. Falha de critério sai com código 1; erros de preparação são identificados explicitamente. Os testes novos usam handlers reais e breakpoints nativos; nenhum substitui `getItem`/`setItem` ou injeta o resultado esperado no progresso.

Para isolar a queda completa: `EEAR_ORFAOS_CENARIOS=crash-processo node testes/orfaos-auditoria.test.js`. O intervalo padrão continua 1.200 ms; o controle diagnóstico usa `EEAR_CRASH_ESPERA_MS=6500`. O controle mínimo da plataforma é `node testes/storage-crash-controle.js`, com Playwright/Chromium, sem emuladores. Os dois falsos aceites antigos e os novos permanecem na mesma sonda de Hosting, com o mesmo critério de recusa.

As primeiras execuções exploratórias da sonda de órfãos tiveram problemas de preparação: navegação inicial da segunda aba, instrumentação de relógio com uma página pausada e captura da exportação durante a inicialização da sessão. Essas execuções foram interrompidas ou registradas como erro de preparação. A preparação foi corrigida, mantendo asserções de aceitação, diário real e contagens exatas. Os casos de 8 segundos e a corrida F13 foram repetidos; o de 30 minutos completou com `Date.now` isolado por página; a queda completa foi repetida com inspeção do perfil anterior ao app. Nenhum desses erros de preparação foi contado como vulnerabilidade do candidato.

Ambiente local: Node 24.22.1, Java 21, Firebase CLI 15.35.0, SDK 12.19.0, Playwright 1.63.0, Chromium 153. CI usa Node 22. Offline na fixture F01 bloqueia Auth/Firestore e mantém SDK/assets locais, com service worker bloqueado. Não houve auditoria nova de Safari/iOS, WebView físico, OAuth real ou configuração do console Firebase. O teste de 30 minutos usa relógio controlado e pausa real do JavaScript; a suspensão por CDP do cenário anterior também foi repetida, com Web Locks. Não compilei APK local novo; a compilação/verificação foi confirmada no CI. Build, montagem, integridade, workflows, sintaxe e lint pertinentes passaram.

Logs completos da sessão: `/tmp/eear-8bd-evidence/`. Evidências selecionadas, hashes dos testes/logs e metadados do CI: [firebase-codex-8bd32d2-evidencias.txt](firebase-codex-8bd32d2-evidencias.txt). As execuções exploratórias que falharam na preparação não são contadas como defeitos do candidato.

## Entrega

F10, F11 e F12 passaram nas reproduções exatas anteriores; houve melhora comprovada e ela está registrada. **O novo conjunto ainda não preserva todo progresso aceito sem Web Locks**, e H02 ainda aceita um artefato sem configuração executável de homologação. Não há base para liberar a homologação com essas falhas reproduzíveis.

Foram acrescentados testes independentes e documentação na branch Codex. Não apliquei correções de produção nem incorporei o runtime do Claude. **Parecer final: REPROVADO.**

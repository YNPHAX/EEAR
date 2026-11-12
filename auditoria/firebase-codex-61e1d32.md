# Auditoria independente — 61e1d32

**Parecer: REPROVADO.** Os oito cenários F01 passaram sem alteração dos critérios, F08 passou e as contagens verificadas ficaram exatas. Entretanto, reproduzi perda de uma alteração aceita pela UI em dois caminhos adicionais: exclusão local com diário pendente de outra aba, inclusive com Web Locks, e recuperação após crash sem Web Locks. O CI verde não cobre esses caminhos.

Alvo: [`61e1d32d574fa4a8b1cfeb47a149898013c013db`](https://github.com/YNPHAX/EEAR/commit/61e1d32d574fa4a8b1cfeb47a149898013c013db), branch `claude/eear-study-hydwqt`, obtido diretamente do GitHub. Auditoria em worktree detached; resultados, testes e documentação exclusivamente em `codex/auditoria-firebase-eear`. Referência anterior: [parecer b2a369b](firebase-codex-b2a369b.md).

Usei dados fictícios, projetos `demo-eear`, `demo-eear-f01` e Hosting `demo-eear-hosting` em emuladores locais. Não fiz merge, deploy, publicação de regras ou operações no Firebase real. Não alterei o runtime nem a branch do Claude.

## Achados confirmados

Os IDs F10–F12 são novos neste parecer. Nenhum achado crítico de invasão de conta foi demonstrado; os dois achados de gravidade alta comprometem a preservação de progresso.

| ID | Gravidade | Resultado |
|---|---|---|
| F10 | **Alta** | Exclusão local apaga o único diário de uma alteração já aceita em outra aba; após interrupção, o estudo não é recuperado |
| F11 | **Alta** | Sem Web Locks, diários órfãos são ignorados; progresso aceito antes de um crash fica invisível e pode ser apagado como se estivesse sincronizado |
| H02 residual | **Média** | Gate de Hosting aceita configuração apenas comentada e configuração sobrescrita antes de iniciar o app |
| F12 | **Baixa** | Sem notificações `storage`, uma aba sobrevivente não recuperou um diário órfão dentro da janela de observação; abertura de nova aba recuperou-o |

### F10 — exclusão local não considera os diários pendentes

Locais no alvo: [`09-contas.js:24`](https://github.com/YNPHAX/EEAR/blob/61e1d32/curso/app/09-contas.js#L24), `sincronizado()` na linha 62 e confirmação na linha 161; diário síncrono em [`14-abas.js:63`](https://github.com/YNPHAX/EEAR/blob/61e1d32/curso/app/14-abas.js#L63).

Reprodução `exclusao-com-diario-pendente`, com Web Locks **disponível**, rede de Auth/Firestore bloqueada após a base confirmada:

1. A e B abrem a mesma conta fictícia. B marca `T:aceita`.
2. Um breakpoint nativo pausa B no início da consolidação assíncrona, antes da primeira leitura da cópia principal. O handler de salvar já terminou: a exportação da UI contém a marcação. O diário existe no armazenamento real e A consegue lê-lo. A cópia principal ainda não contém a marcação.
3. A, com memória ainda igual à base da nuvem, informa “Progresso salvo na sua conta.” e oferece “Apagar deste aparelho”, dizendo que a nuvem continua com o progresso. A confirmação é executada pela UI.
4. A quantidade de diários contendo a marcação passa de **1 para 0**. B sofre um crash real de renderer (`Page.crash`), antes de consolidar.
5. Uma aba nova não recupera `T:aceita`; a nuvem emulada também não a contém. A rodada final inclui reconexão.

Não há interceptação ou simulação de `localStorage.getItem/setItem`. A pausa controla uma intercalação possível; não mede sua frequência. O clique de exclusão é intencional, mas a perda não foi informada: a aplicação promete que só oferece a remoção após confirmar tudo na nuvem. O progresso de B já tinha sido aceito e persistido.

Causa: `sincronizado()` compara apenas `S` da aba atual com sua base. `sincronizadoDe()` também ignora diários. `apagarLocal()` remove indiscriminadamente todos os diários da identidade, sem adquirir a trava de consolidação e sem verificar quais sequências estão confirmadas na nuvem. A trava que serializa a cópia principal não protege esse caminho.

Correção necessária: a decisão e a execução da exclusão precisam considerar todo o progresso pendente da conta e ser coordenadas com escritores. Não basta verificar novamente apenas a memória da aba que exclui. Preservar ou impedir a exclusão dos diários ainda não confirmados é condição para segurança nesse cenário.

### F11 — fallback sem Web Locks não recupera órfãos

Locais: [`14-abas.js:108`](https://github.com/YNPHAX/EEAR/blob/61e1d32/curso/app/14-abas.js#L108) e [linha 182](https://github.com/YNPHAX/EEAR/blob/61e1d32/curso/app/14-abas.js#L182). O fallback chama `consolidarAgora(null)`; o filtro de diários descarta todos os diários de outras abas quando não há lista `vivos` nem `mortas`. `vigiar()` também não opera sem a API.

Reprodução `sem-web-locks-crash`:

1. Simular ausência da API com `navigator.locks === undefined`, antes de carregar o app. O restante do navegador, armazenamento e SDK permanece real, conectado apenas a emuladores.
2. Após sincronizar a base, ficar offline e marcar `T:aceita`. Pausar a consolidação assíncrona antes de sua primeira leitura.
3. Confirmar três precondições independentes: **exportação da UI contém a marcação**, **diário real legível por outra aba**, **cópia principal ainda sem a marcação**.
4. Interromper o renderer com `Page.crash` e reabrir. Aguardar recuperação, reconectar e conferir o Firestore emulado.
5. A exportação e a nuvem permanecem apenas com `T:base`; o diário órfão continua existindo. A UI informa “Progresso salvo na sua conta.”, permite excluir a cópia local e então remove o diário: **1 → 0**.

Antes da exclusão, o dado ainda existe fisicamente, mas o próprio app não o recupera nem envia. A exclusão autorizada pelo app remove a única cópia restante. A ausência de Web Locks é um caminho explicitamente implementado, sem bloqueio preventivo do estudo ou aviso específico de sua garantia reduzida.

**Calibração do teste:** o fechamento limpo com `Page.close`, sob as mesmas precondições, passou. Fechar uma página pausada pode deixar seu callback terminar; não tratei esse resultado como crash. O controle `apos-diario-crash`, com Web Locks, recuperou e enviou o diário sob a mesma forma de interrupção. A falha não é uma indisponibilidade do emulador ou do armazenamento.

Não executei Safari/iOS ou aparelho móvel físico. A evidência cobre a ausência real da API no contexto de teste Chromium e o código do fallback; não autoriza afirmar que todo navegador móvel falha. É necessário implementar recuperação/serialização segura nesse caminho, ou impedir aceitação de alterações sem as garantias necessárias e oferecer recuperação dos diários existentes.

### F12 — perda de notificações adia recuperação de órfão

Reprodução `sem-notificacoes`: suprimir explicitamente a entrega dos eventos `storage`, manter A viva, registrar um diário em B e fechar B antes da consolidação. A não incorporou o diário durante **6 segundos**; ele permaneceu no armazenamento. A abertura de C recuperou a marcação e a cópia principal.

É um achado de recuperação/disponibilidade sob perda de notificações, **sem perda permanente demonstrada nesse cenário isolado**. A sequência usa supressão explícita de eventos; não equivale a todas as suspensões reais de navegadores. `conferirFila()` consulta pedidos de trava, mas não faz uma varredura periódica dos órfãos desconhecidos; a instalação da vigia depende de ter visto o diário na abertura ou em um evento. Esse atraso se torna mais perigoso junto da exclusão descrita em F10.

## Oito cenários F01 e F08

`testes/f01-abas.test.js` e `testes/f01-fixture.js` são idênticos aos da auditoria anterior. Verificado com `git diff --exit-code` contra `4884035`; nenhum critério foi reduzido.

| Cenário obrigatório | Resultado em 61e1d32 |
|---|---|
| Dispositivos separados | Passou |
| Fechar A offline | Passou |
| Fechar B offline | Passou |
| Desmarcar sem ressuscitar | Passou |
| Zerar com outra aba antiga | Passou |
| Certificado, fechamento e reconexão | Passou |
| Reconectar ambas abertas | Passou |
| Zerar nas duas abas e estudar depois | Passou |

**8/8, exit 0.** Em `b2a369b`, a mesma matriz havia terminado em 6/8. O controle adicional `zerar-unica` também passou: estudo posterior ao reset sobreviveu offline, na nuvem e após reabrir; certificados antigos permaneceram apagados. **F08 corrigido nos cenários independentes executados.**

## Arquitetura de diários e teste de interrupção

A nova arquitetura resolve a janela anterior no caminho com Web Locks: cada `salvar()` grava síncronamente seu diário antes de pedir consolidação; a trava serializa leitura/união/escrita da cópia principal; `_abas.inc` e o estado principal são persistidos no mesmo valor. A inclusão de sequência reduz a reaplicação de diários após interrupção. A base do diário é copiada, evitando alias com `S`.

Adaptei o **nosso** `escrita-interrompida` aos pontos reais de 61e1d32, sem usar o teste substituto do autor:

- Pausar A depois da leitura real da cópia principal, com a trava.
- B aceita uma marcação e grava seu diário real; confirmar o diário antes de fechar B.
- Retomar A e pausar imediatamente depois do `setItem` real da cópia principal. Ler pelo call frame: ela contém A, mas ainda não B.
- Fechar A e abrir C offline. Exigir recuperação de **A e B**, preservação da base e atividade **4/4**, tanto na UI quanto na cópia principal.

**Passou**, incluindo a precondição “principal ainda sem B”. A espera de recuperação mantém o limite de 20 segundos da fixture original. O teste não falsifica leituras nem escrituras. Também passaram os controles de fechamento/crash imediatamente após o `setItem` do diário com Web Locks: o diário foi absorvido e enviado ao emulador. Esses resultados não provam que cada alteração aceita fica preservada em todos os caminhos: F10 e F11 demonstram as exceções.

## F09, concorrência, suspensão e certificados

- Duas abas, atividade inicial 2 e 30 marcações por aba, em pares concorrentes: **62/62** na memória de ambas e no cache; 61 marcações presentes.
- Quatro abas, 50 marcações por aba: **200 alterações novas**, atividade **202/202**, 201 marcações incluindo a base. Convergência nas quatro abas; fechamento simultâneo de todas; abertura offline; reconexão e conferência no servidor. Certificado fictício preservado.
- Congelamento real de uma aba via CDP, reset na outra e retomada: progresso/certificados antigos não voltaram; estudo novo permaneceu.
- Líder da nuvem identificada antes do teste; `visibilitychange` para hidden seguido de congelamento real. A seguidora aceitou estudo; a cópia local e o servidor receberam-no, inclusive enquanto a líder estava congelada; retomada manteve-o.
- Exclusão local sincronizada com outra aba sem notificações: só o estudo novo reapareceu; certificado e progresso antigos permaneceram ausentes.

**F09 passou com contagens exatas, sem perda nem duplicação nas execuções com Web Locks acima.** Isso não certifica o fallback sem trava nem todas as combinações possíveis de dispositivos. F10 não é a antiga restauração da cópia apagada: agora a cópia antiga não voltou no controle, mas um diário novo e ainda não enviado pôde ser eliminado.

## F02–F07 preservados

| Correção | Evidência |
|---|---|
| F02 — resposta após saída | Teste `saida` passou contra o app real do candidato |
| F03 — callback da sessão antiga | Teste `callback` passou |
| F04 — recusa atrasada desligando sessão nova | Teste `recusa` passou |
| F05 — isolamento de publicação site/APK | Regressões do verificador preservadas; autoteste completo **186/186**; projeto de teste sem marcador e scripts separados continuam recusados |
| F06 — comentário sobre dados pessoais | Correção preservada; o documento ainda pode conter `cfg.nome`, sem promessa de anonimização |
| F07 — fixture herdando config externa | Suíte Firebase executada com `EEAR_FIREBASE_CONFIG` apontando a caminho externo inexistente: **50/50**, só em emuladores; construção isolada preservada |

Fortaleci a preparação de `ciclo-sincronia.test.js`: ele agora espera a operação antiga **entrar no transporte** antes de sair ou trocar a identidade. A liderança assíncrona poderia deixar o teste anterior passar sem haver resposta em voo. Os três cenários passaram com essa barreira; asserções de sessão foram mantidas.

As expressões de autorização de `web/firestore.rules` não mudaram em relação a `b2a369b`; os testes de UID, campos, permissões e certificados passaram novamente. Autenticação por senha, sessão offline, reconexão e Google foram exercitados no emulador. OAuth real e configuração do console não foram acessados.

## Hosting H01–H03

- **H01 corrigido no caminho CLI testado:** há `hosting.predeploy` chamando `verificar-hosting` com `$RESOURCE_DIR` e `$GCLOUD_PROJECT`. A função recusa projeto efetivo diferente de `eear-teste`, projeto vazio, pasta ausente, build oficial e conteúdo proibido. Executei diretamente o verificador, sem `firebase deploy`; confirmei a ligação do hook por leitura do código. Isso não é um controle de IAM contra alguém que pode alterar o próprio verificador.
- **H03 corrigido:** no emulador Hosting, `/`, `/index.html`, `/app.js`, `/sw.js` e manifesto responderam 200 com `Cache-Control: no-cache`, `nosniff`, `noindex, nofollow` e a política de referrer prevista. A raiz deixou de ser a exceção da auditoria anterior.
- **H02 parcialmente corrigido, residual de gravidade média:** os casos anteriores de projeto divergente, marcador somente em página auxiliar e duas atribuições literais no índice são recusados. Porém `config_homologacao()` em [`verificar_publicacao.py:452`](https://github.com/YNPHAX/EEAR/blob/61e1d32/web/verificar_publicacao.py#L452) usa regex sobre o texto inteiro de `index.html`, sem verificar contexto executável e sem conferir uma redefinição posterior em scripts permitidos.

Dois testes novos, ambos **aceitos com exit 0**, deveriam ser recusados para cumprir o objetivo do gate:

1. Build oficial acrescido apenas de `<!-- window.EEAR_FIREBASE = {...config fictícia válida de teste...}; -->`. Não há configuração ativa; o comentário basta para autorizá-lo como homologação.
2. Build de teste válido com `dados/ambiente-auditoria.js` antes de `app.js`, redefinindo `window.EEAR_FIREBASE` para um projeto/domínio fictício divergente. O gate continua aprovando a atribuição anterior do índice, embora o app leia o valor posterior.

Os scripts/configurações são fixtures sintéticas; nenhum SDK foi executado com esses destinos e nenhum projeto real foi acessado. Esses casos demonstram limite da validação do artefato; não demonstram invasão remota, falha de UID ou deploy em produção. A sonda anterior de Hosting passou **11/11**; a nova sonda de gates passou oito controles e encontrou os dois falsos aceites acima.

O `/__/auth/handler` respondeu 404 no emulador. Não o classifiquei como defeito do Hosting real nem como prova de funcionamento do OAuth real.

## CI de 61e1d32

Resultados consultados diretamente no GitHub e conferidos por jobs/logs:

| Workflow | Resultado |
|---|---|
| [Testes, run 43103211308](https://github.com/YNPHAX/EEAR/actions/runs/43103211308) | **Sucesso**, jobs `plataforma` e `firebase-emulador` concluídos com sucesso |
| [Site, run 43103211245](https://github.com/YNPHAX/EEAR/actions/runs/43103211245) | **Sucesso**, montar/conferir; publicação pulada |
| [App Android, run 43103211257](https://github.com/YNPHAX/EEAR/actions/runs/43103211257) | **Sucesso**, compilar/conferir APK; publicação pulada |

**CI verde confirmado.** Não disparado por esta auditoria. Os testes adicionais F10/F11 e os falsos aceites de H02 não estão nos gates padrão desses runs. O teste substituto de escrita interrompida do autor aparece nos logs; não foi usado como única evidência de recuperação.

## Reprodução e limites

Executar na branch Codex, apontando ao snapshot detached exato, com Playwright/Chromium, SDK e CLI externos ao repositório:

```bash
export EEAR_REPO_ALVO=/tmp/eear-61e1d32
export EEAR_FIREBASE_SDK=/tmp/eear-audit-deps/node_modules/firebase
export EEAR_FIREBASE_CLI=/tmp/eear-audit-deps/node_modules/.bin/firebase
export NODE_PATH=/tmp/eear-audit-deps/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/tmp/eear-audit-browsers
node testes/f01-abas.test.js
node testes/f01-riscos.test.js
node testes/diarios-auditoria.test.js
python3 testes/hosting-auditoria.py "$EEAR_REPO_ALVO"
python3 testes/hosting-gates-auditoria.py "$EEAR_REPO_ALVO"
```

`EEAR_F01_RISCOS` seleciona investigações; `EEAR_DIARIOS_CENARIOS` seleciona casos da nova matriz, separados por vírgula. Suítes diagnósticas saem com erro quando um critério falha. Mudanças de arquitetura que invalidem breakpoints são erro de preparação explícito, não aprovação automática. As suítes que usam portas 8180/9199 devem rodar sequencialmente.

Matriz adicional de diários: **5 passaram, 3 falharam, exit 1** — F10, F11 e a recuperação ao vivo de F12. Os dois bloqueadores de dados foram reproduzidos em execuções selecionadas e repetidos na matriz final; não são erros de preparação. O controle de fechamento limpo sem Web Locks passou na matriz final.

Outras verificações locais: Firebase **50/50**; ciclo de sessão **3/3**; autoteste **186/186**; build, montagem, integridade, workflows, sintaxe e lint pertinentes passaram. A suíte Firebase foi executada a partir do snapshot do candidato; `ciclo-sincronia.test.js` recebeu como argumento o build desse snapshot. Os logs/hashes e resultados individuais estão em [firebase-codex-61e1d32-evidencias.txt](firebase-codex-61e1d32-evidencias.txt).

Ambiente: Node 24.22.1 (CI usa 22), Java 21, CLI 15.35.0, SDK 12.19.0, Playwright 1.63.0, Chromium 153. Offline nos testes F01 significa bloquear comunicação com Auth/Firestore, mantendo assets e SDK locais como uma cópia em cache; o service worker é bloqueado nessa fixture. Não é uma auditoria nova do ciclo completo do service worker, de OAuth real, Safari/PWA iOS ou instalação em aparelho físico. `Page.crash` interrompe um renderer, não simula queda de energia/disco. Não compilei APK novo local; confirmei a compilação/verificação no CI. Não repeti localmente toda a suíte de plataforma de longa duração; seu run verde foi verificado no GitHub.

## Comparação e entrega

Em relação a `b2a369b`, houve melhora comprovada: F01 obrigatório **6/8 → 8/8**, F08 corrigido, F09 **38/62 ou 49/62 → 62/62** nas rodadas equivalentes, teste nativo de interrupção recuperado com diários/Web Locks, não restauração da cópia apagada no controle, H01/H03 corrigidos e CI verde. A proteção adicional dos diários não abrange exclusão local e o fallback sem Web Locks. H02 continua com os limites de artefato descritos.

Nesta rodada alterei **somente testes e documentação** na branch Codex. As correções F02–F07 anteriores foram preservadas; não incorporei ou alterei o runtime de 61e1d32. Nenhuma correção de produção foi aplicada nesta entrega: os achados ficam acompanhados de reproduções para revisão independente.

**REPROVADO enquanto F10/F11 permitirem perda reproduzível de progresso.** Passar nos oito cenários originais é uma evidência positiva e necessária, mas não elimina as perdas independentes demonstradas.

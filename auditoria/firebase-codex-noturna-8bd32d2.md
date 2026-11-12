# Auditoria noturna independente — base 8bd32d2

**Parecer da base auditada: REPROVADO.** Esta rodada encontrou perda silenciosa sob quota real de armazenamento, resíduos locais depois de exclusões confirmadas, recriação de documento por outra sessão após exclusão da conta no emulador, falhas persistentes de validação de entrada e contagens incorretas entre dispositivos e após interrupção da confirmação de gravação. Nenhuma correção paralela do Claude é considerada auditada ou aprovada por este relatório.

Base fixa: [`8bd32d2ca92a408e5cc3b0988b8a4a19e424c42b`](https://github.com/YNPHAX/EEAR/commit/8bd32d2ca92a408e5cc3b0988b8a4a19e424c42b). Data: 12/11/2026. Complementa o [parecer anterior](firebase-codex-8bd32d2.md), que documenta F13, F09 e H02. IDs N01–N05 identificam achados novos desta missão, sem renumerar os anteriores.

Trabalho em `codex/auditoria-firebase-eear`; candidato em worktree detached. Somente testes e documentação foram alterados. Não houve merge, deploy, publicação de regras, alteração da branch Claude, operação no Firebase real, uso de dados reais ou serviço pago. Contas e nomes dos testes são fictícios; Auth e Firestore rodam em `demo-eear-f01` nas portas 9199/8180. Os testes bloqueiam destinos reais do navegador e servem SDK/assets localmente.

## Cobertura das fases

1. **Persistência:** revisão dos diários, consolidação, Web Locks, base da nuvem, autenticação/IndexedDB e exclusões. Testes com falha real de quota, encerramento de abas, dados inválidos e sessão em outro dispositivo.
2. **Adversariais:** duas sessões independentes, seis abas simultâneas, 150 marcações, desmarcação, certificado, fechamento simultâneo, reconexão, líder pausada e importação malformada. As reproduções anteriores de crash/interrupção permanecem preservadas.
3. **Segurança:** matriz REST com tokens legítimos do Auth emulado, testes de UID, listagem, agregação, subcoleções e lote atômico; exclusão/retensão de dados; validação de entrada; busca de credenciais rastreadas. Hosting permanece coberto pelo parecer anterior do mesmo SHA.
4. **Qualidade:** migração e reversão com dois builds reais, compatibilidade sem IndexedDB, recuperação após liberar quota, observação de tempo na carga de seis abas e execução da suíte completa da plataforma.
5. **Evidências:** testes independentes, estados antes/depois, mensagens da UI, sequências exatas, referências de código, resultados e hashes.
6. **Entrega:** testes/documentação disponíveis apenas na branch Codex; recomendações abaixo, sem correções do runtime.

## Achados novos

Arquitetura observada: o progresso usa valores JSON em `localStorage` (principal, diário por aba, base e recuperação). Não há armazenamento transacional de progresso próprio em IndexedDB. A fábrica usa `getFirestore()` sem habilitar cache persistente do Firestore; a recuperação offline depende dos diários do app. A sessão usa a persistência padrão do SDK Auth, com fallback sem IndexedDB exercitado abaixo. Essa separação importa: persistir a sessão não prova que a última alteração do progresso já esteja durável.

| ID | Gravidade | Resultado confirmado |
|---|---|---|
| N01 | **Alta** | Quota real: alteração aceita sem diário nem principal; UI afirma que foi salva; após fechar a aba o estudo não volta |
| N02 | **Média** | “Sair e apagar” e “Excluir conta” deixam diário com nome e progresso no aparelho, apesar da confirmação de exclusão |
| N03 | **Alta** | No emulador, outra sessão ainda conectada recria o documento pessoal após exclusão confirmada da conta |
| N04 | **Média** | JSON de progresso com campos de configuração incompatíveis é persistido e causa erros após reabrir; alguns casos bloqueiam Plano › Dados |
| N05 | **Baixa** | Diário órfão com JSON ilegível é eliminado sem preservar o texto nem oferecer recuperação |

### N01 — perda silenciosa com quota real, inclusive com Web Locks

Locais: [`02-progresso-nuvem.js:118`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/02-progresso-nuvem.js#L118), `salvar()`; [`02-progresso-nuvem.js:338`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/02-progresso-nuvem.js#L338), `syncInfo()`; [`04-telas.js:62`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/04-telas.js#L62), aviso restrito à tela Hoje.

Reprodução `quota-real` em `testes/noturna-falhas.test.js`, repetida duas vezes:

1. Abrir duas abas da mesma conta e confirmar a base no servidor emulado; Web Locks disponível. A é líder da nuvem, B é seguidora.
2. Bloquear comunicação com Auth/Firestore. Preencher uma chave fictícia adicional do `localStorage` até o navegador lançar **QuotaExceededError real**. Não substituir `Storage.setItem`.
3. Em B, marcar uma tarefa nova e conferir que ela aparece na exportação da UI.
4. Conferir o armazenamento real: a principal e os diários **não contêm** a tarefa. A tela Plano não apresenta alerta e informa:

   > Progresso salvo neste aparelho. Outra aba do curso, aberta nesta conta, envia o progresso para a nuvem.

5. Fechar B normalmente, liberar o espaço fictício em A e reabrir. A tarefa **não é recuperada**.

As duas execuções chegaram ao mesmo resultado: `aceitaNaUI=true`, `principal=false`, `diario=false`, `alertas=[]`, `avisou=false`, `recuperou=false`. O valor de preenchimento foi 5.240.778 caracteres neste contexto de teste; isso não é uma previsão universal de quota.

A falta de espaço é um limite legítimo do navegador; **a afirmação incorreta de salvamento e a ausência de aviso na tela usada são defeitos do app**. `salvar()` detecta a falha e marca `gravouLocal=false`, mas o ramo de seguidora em `syncInfo()` dá prioridade ao estado da nuvem e afirma que o dado está salvo localmente. O banner de falha está apenas em `vHoje()`. O teste antigo de armazenamento indisponível, sem conta Firebase, não cobre esse ramo.

Recomendação: dar prioridade à falha de persistência em todos os estados de conta/telas, manter explícita a alteração ainda não persistida e oferecer exportação/retentativa. Não declarar que outro escritor pode enviar um diário que nunca foi gravado. O teste aceita preservação ou aviso correto; ele não exige que o navegador grave sem espaço.

### N02 — diário pessoal permanece depois de apagar deste aparelho ou excluir a conta

Locais: [`09-contas.js:24`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/09-contas.js#L24), `apagarLocal()`; chamadas em `sairConta()` e `excluirConta()`; [`15-diarios-pendentes.js:44`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/15-diarios-pendentes.js#L44), `apagarDiarios()`.

Reprodução em `noturna-integridade.test.js`, casos `sair-apagar` e `excluir-conta`:

1. Conta fictícia com nome e progresso; marcar `T:privado` e aguardar confirmação na nuvem.
2. Pela UI, executar “Sair e apagar deste aparelho”, ou confirmar a exclusão permanente da conta com senha e `EXCLUIR`.
3. Conferir a mensagem de sucesso, a sessão encerrada e o destino correto da nuvem: mantida na saída, ausente na exclusão da conta.
4. Ler as chaves locais da identidade e recarregar a página.

Nos dois caminhos permaneceu **um diário** contendo nome e progresso, inclusive após reabrir. Na exclusão da conta, o resultado foi repetido em duas execuções. A UI declarou que a cópia deste aparelho havia sido excluída; o diário não aparece como uma conta guardada normal porque a chave principal já foi removida.

Causa: `apagarLocal()` remove a principal e a base **antes** de perguntar quais diários preservar. `apagarDiarios()` calcula pendências sobre uma principal agora ausente e conserva o delta de um diário que estava confirmado antes da remoção. O conteúdo retido é o estado completo/base do diário, não apenas um contador anônimo.

Escopo: resíduo acessível no armazenamento da mesma origem/aparelho, não leitura de outro UID pela rede. Nome e progresso são fictícios nas evidências. Não há afirmação de que senha ou token tenha sido copiado para o diário.

Recomendação: distinguir exclusão local segura com preservação de pendências de exclusão definitiva da conta; classificar as pendências sobre o estado confirmado **antes** de remover a principal, sob coordenação dos escritores. Uma confirmação de apagar dados pessoais precisa corresponder a todas as cópias mantidas pelo app, incluindo diários e recuperação.

### N03 — outra sessão recria o documento depois de excluir a conta

Locais: [`09-contas.js:124`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/09-contas.js#L124), `excluirConta()`; referência Firebase em [`02-progresso-nuvem.js:285`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/02-progresso-nuvem.js#L285); autorização de criação em [`web/firestore.rules:35`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/web/firestore.rules#L35).

Reprodução `outra-sessao`, confirmada duas vezes:

1. A e B entram na mesma conta em **contextos independentes**, representando dois dispositivos.
2. B fica offline e estuda. A confirma a exclusão da conta pela UI.
3. Conferir que o documento foi apagado, que A ficou sem sessão e que uma nova tentativa de login é recusada pelo Auth emulado (**HTTP 400**).
4. B ainda possui a sessão anterior. Reconectar B; o app sincroniza o progresso pendente.
5. O documento volta a existir, com nome e progresso da conta excluída.

Resultado: `documentoApagado=true`, `outraSessaoAindaConectada=true`, `documentoRecriado=true`, `nomeRecriado=true`. Não foi forjado token nem trocado o UID: a sessão era legítima antes da exclusão.

A autorização atual verifica o UID do token, mas não há estado de conta desativada/tombstone que impeça a recriação. Apagar o documento e o usuário da sessão solicitante não coordena todos os escritores. **Não foi demonstrado acesso entre UIDs diferentes.** A matriz de isolamento abaixo passou.

Limite de evidência: confirmado com Auth/Firestore emulados e análise das regras. Não medi revogação/validade de tokens no Firebase real e não atribuo ao emulador garantias criptográficas de produção. O período exato em que uma sessão antiga poderia continuar aceita em produção depende da política de tokens. O fluxo do app, contudo, não implementa uma barreira própria contra recriação após exclusão.

Recomendação: projetar a exclusão como ciclo de vida coordenado da conta, com bloqueio durável de novas gravações daquela identidade e encerramento/revogação das sessões conforme as garantias do backend. Testar o estado apagado contra escritores antigos e requisições em voo. Não resolver apenas removendo a cópia da aba solicitante.

### N04 — configuração malformada é persistida e quebra a recuperação pela UI

Locais: [`01-base.js:135`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/01-base.js#L135), `mesclar()`; [`07-eventos.js:170`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/07-eventos.js#L170), importação; consumidores em `gerarPlano()` (`03-plano.js`) e `vPlano()/mostrarInicio()` (`04-telas.js`).

`noturna-seguranca.test.js` importa JSON v1 pelos controles reais e depois recarrega e percorre as telas. Cada caso foi repetido:

| Campo importado | Resultado |
|---|---|
| `cfg.dias = null` | Persistido; erro em `indexOf`; Plano › Dados inacessível |
| `cfg.excl = {}` | Persistido; erro de objeto não iterável; Plano › Dados inacessível |
| `cfg.nome = {}` | Persistido; erro em `trim`; Plano ainda acessível, mas navegação/inicialização em outra tela falha |

A verificação de importação aceita `v===1`, e `mesclar()` copia esses campos sobre os padrões sem validar seus tipos. Os controles de exportação/importação podem ficar indisponíveis justamente quando seriam necessários para reparar o estado. O progresso em si não foi demonstrado como apagado nesses casos; ele ficou persistido com uma configuração que o app não consegue consumir com segurança.

Escopo: entrada de progresso fornecida pelo usuário, não execução de JavaScript nem invasão remota. Não atribuí XSS aos erros de tipo.

Recomendação: validar/normalizar os campos conhecidos antes de substituir ou gravar o estado; manter o último estado utilizável e uma forma de exportar/quarentenar dados incompatíveis. Aplicar a mesma fronteira de validação às leituras da nuvem e aos diários, sem confiar que JSON sintaticamente válido implica esquema válido.

### N05 — diário ilegível é apagado sem quarentena

Locais: [`14-abas.js:37`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/14-abas.js#L37), leitura do diário, e linhas 110/124, limpeza.

O teste `diario-corrompido` prepara uma chave de diário órfão com JSON truncado e uma principal válida. Depois da abertura e varredura, o texto original não está no diário nem em uma cópia de recuperação, e não há aviso. Repetido duas vezes.

Isso é uma **injeção explícita de corrupção de armazenamento**; não prova que `setItem` grave parcialmente nem que o app produza JSON truncado normalmente. O problema é destruir o material de recuperação já existente ao encontrar uma falha de leitura. O teste de principal ilegível do projeto preserva uma cópia exata; o caminho do diário não aplica a mesma política. Um diário de versão futura no controle paralelo manteve seus bytes originais, embora sem aviso de recuperação; isso não certifica suporte ao formato futuro.

Recomendação: preservar o texto original em quarentena e avisar antes de qualquer descarte definitivo. Não tratar “não consegui interpretar” como “já foi incorporado”.

## F09 ampliado — subcontagem entre dispositivos independentes

Além da duplicação documentada no parecer anterior, `atividade-dispositivos` confirmou um caso diferente, sem ausência de Web Locks:

1. Dois dispositivos/contextos compartilham a base com atividade 2.
2. Ambos ficam offline. A marca uma tarefa distinta; B marca outra. Cada exportação mostra atividade 3 e sua própria alteração.
3. Reconectar ambos e reabrir.
4. As duas tarefas chegam ao servidor, mas a atividade fica em **3**, para esperado **4**.

O teste `simulados-iguais` repetiu a subcontagem com duas execuções independentes de simulado: início e questões diferentes, uma entrega aceita em cada dispositivo, registros finais iguais. **Os dois registros de simulado foram preservados**, mas a atividade novamente ficou em 3/4. Não há base para declarar perda de histórico de simulados nesse teste.

Local: [`08-uniao-nuvem.js:60`](https://github.com/YNPHAX/EEAR/blob/8bd32d2/curso/app/08-uniao-nuvem.js#L60), `uTres()` retorna imediatamente quando local e remoto são iguais, antes da soma numérica; `somarContagens()` é habilitado só para a união local entre abas. A igualdade dos valores não distingue dois incrementos independentes de uma retransmissão da mesma mudança.

Recomendação: representar autoria/identidade das operações ou contadores por dispositivo, com confirmação idempotente. Simplesmente trocar `max` por soma também pode duplicar retransmissões. **Desabilitar apenas o fallback sem Web Locks não resolve este caso entre dispositivos.**

### F09 após perda da confirmação de um commit real

`noturna-confirmacao.test.js` retém a **resposta HTTP real** de um commit do Firestore emulado depois de o servidor gravar, antes de o SDK receber a confirmação. Não troca o corpo, o status ou os dados. As precondições foram comprovadas: commit HTTP 200, servidor com atividade 3 e marcação aceita, base local ainda em 2.

O teste faz `Page.crash`, abre outra página offline e confere que atividade 3, marcação e certificado foram recuperados. Antes de receber a confirmação remota, o aluno faz uma nova marcação: total correto **4**. Ao reconectar, o app termina com **5**, mantendo as marcações/certificado. É duplicação, não perda de flags. O caso foi repetido. O controle que confirma a base antes do novo estudo **passou com 4/4**, local e servidor; não substitui a reprovação do cenário padrão.

O cálculo usa base confirmada antiga 2, local 4 e servidor 3: a contribuição já escrita no servidor é somada novamente. A mesma estratégia que subconta dois incrementos independentes iguais também duplica contribuições sobrepostas quando os valores já diferem. O reparo precisa distinguir operações retransmitidas de operações novas, inclusive depois de crash e perda de ACK.

## Controles positivos e limites operacionais

- **Seis abas:** 150 marcações distintas, uma desmarcação e certificado; atividade **152/152**, 150 marcações finais, convergência, fechamento simultâneo, reabertura e envio ao servidor passaram em duas execuções. Tempo medido no ambiente: aproximadamente **4,1–4,8 s**. É observação dessa carga no desktop de teste, não SLA de celular.
- **Sem IndexedDB:** o teste fez a API lançar `SecurityError`, mantendo `localStorage` disponível. A sessão persistiu após reload offline e o estudo chegou ao servidor após reconectar, em duas execuções. Confirma esse fallback do SDK, não indisponibilidade de todos os armazenamentos simultaneamente.
- **Migração/reversão:** a ferramenta existente executada entre builds de `b2a369b` e `8bd32d2` passou em **7 verificações** de preservação e abertura. É teste de compatibilidade sequencial, não aprovação da concorrência com versão antiga.
- **Líder pausada:** um diário da seguidora ficou durável, mas principal/envio aguardaram a líder retomar. O servidor não recebeu o estudo durante os 7 s observados e recebeu após retomada. Essa sonda sai com erro pelo critério adicional de disponibilidade; **não demonstrou perda de dados**. A pausa é real pelo debugger, depois de sinalizar hidden; não representa todos os modos de suspensão de navegadores móveis. A vida da trava de liderança não tem transferência por simples inatividade da dona.
- **Credenciais:** busca em arquivos rastreados e nos diffs dos ancestrais de 8bd32d2 não encontrou os marcadores testados de chave privada/token GitHub. A busca atual também não encontrou chave web Firebase no padrão pesquisado. Isso não prova ausência de todo segredo possível; nenhum arquivo local de configuração de produção foi lido para executar testes.

## Segurança de UID e regras

`noturna-seguranca.test.js` usa tokens legítimos obtidos no Auth emulado; não utiliza o bypass administrativo `owner` nas sondas de autorização. Passaram, em duas execuções:

| Operação | Resultado |
|---|---|
| GET do próprio documento | 200 |
| GET de outro UID | 403 |
| GET sem autenticação | 403 |
| Listagem de alunos | 403 |
| Leitura de subcoleção | 403 |
| Query limitada ao próprio UID, ainda sujeita a `list` | 403 |
| Agregação `count` | 403 |
| Batch com escrita própria e escrita em outro UID | 403; a escrita própria também não foi aplicada |

O envelope das regras é estrito, mas `dados` é JSON opaco em texto: a segurança de tipos internos continua dependendo do cliente. N03 trata do ciclo de vida de uma identidade antes autorizada, não de quebra dessa matriz de UID.

## Testes, evidências e reprodução

| Execução desta missão | Resultado |
|---|---|
| Matriz final de integridade | **1 passou, 6 falharam**, em 7 cenários; sem erro de preparação na rodada final |
| Quota, seis abas, líder e IndexedDB | **2 passaram, 2 falharam**; a falha de líder é de disponibilidade, sem perda demonstrada |
| Segurança | Matriz REST **8/8** e atomicidade passaram; **3/3** casos de tipos incompatíveis produziram erros persistentes |
| Confirmação interrompida | **Falhou duas vezes**, 5 em vez de 4; controle confirmando a base antes do novo estudo **passou, 4/4** |
| Ciclo de sessão F02–F04 | **3/3** no build do candidato |
| Atualização/reversão | **7/7** |
| Suíte completa `plataforma.test.js` do candidato | **237 passaram, 1 falhou, exit 1** |
| Módulo de abas do candidato, isolado e inalterado, 3 rodadas | **23 passaram, 1 falhou**, mesma asserção intermitente |

A única falha da suíte completa foi “duas gravações quase juntas (uma aba leu a chave atrasada)”. O teste existente substitui a primeira leitura de `Storage.getItem` por um valor antigo e confere a reparação após 400 ms. Nessa observação a principal não continha `T:a5`. O módulo inalterado foi reexecutado isoladamente três vezes: duas rodadas passaram e uma repetiu a falha.

É uma **asserção local reprovada**, não erro de instalação/rede nem motivo para chamar a suíte de verde. O teste usa leitura artificial e não verifica a cópia durável após uma recuperação fria; por isso não o usei como prova adicional de perda permanente real. A eventual relação com scheduling/entrega de eventos precisa de investigação própria. Não aumentei os 400 ms, não alterei o módulo do candidato e não descartei a falha por o CI do mesmo SHA ter passado. O CI verde anteriormente verificado e a execução local reprovada são resultados diferentes; o ambiente local usa Node 24, o CI Node 22.

Na branch Codex, com o mesmo ambiente/dependências da auditoria anterior:

```bash
export EEAR_REPO_ALVO=/tmp/eear-8bd32d2
export EEAR_FIREBASE_SDK=/tmp/eear-audit-deps/node_modules/firebase
export EEAR_FIREBASE_CLI=/tmp/eear-audit-deps/node_modules/.bin/firebase
export NODE_PATH=/tmp/eear-audit-deps/node_modules
export PLAYWRIGHT_BROWSERS_PATH=/tmp/eear-audit-browsers
node testes/noturna-integridade.test.js
node testes/noturna-falhas.test.js
node testes/noturna-seguranca.test.js
node testes/noturna-confirmacao.test.js
```

As suítes de emuladores devem rodar **sequencialmente**. Seletores: `EEAR_NOTURNA_CENARIOS`, `EEAR_NOTURNA_FALHAS`, `EEAR_SEGURANCA_CENARIOS`, separados por vírgula. Critérios falhos saem com erro; falhas de preparação são identificadas. Não se devem somar os erros de preparação às vulnerabilidades.

O controle de confirmação usa `EEAR_ACK_CONFIRMAR_ANTES=1`: reabre após o mesmo crash, reconecta para confirmar a base e só então faz o novo estudo. O resultado desse controle não substitui o teste padrão que estuda offline antes da confirmação; a exigência de contagem exata continua a mesma.

Na exploração, os testes de saída/simulado precisaram navegar à tela correta antes de procurar sua confirmação. O diagnóstico de saída também precisou distinguir o pedido de trava, que é texto simples, dos valores JSON. Esses erros do harness foram corrigidos; nenhuma alteração no runtime ou redução de critérios foi usada para obter os resultados. As falhas classificadas acima têm precondições comprovadas e reproduções concluídas.

A definição de “durável localmente” na sonda de líder foi explicitada como principal **ou diário**, já que a trava pode impedir consolidação enquanto a líder está parada. O critério de envio durante a pausa permaneceu inalterado e falhou; a preservação no diário e o envio após retorno ficaram registrados. Isso evita confundir espera de consolidação com perda.

Logs completos: `/tmp/eear-noturna-evidence/`. Evidências selecionadas e hashes: [firebase-codex-noturna-8bd32d2-evidencias.txt](firebase-codex-noturna-8bd32d2-evidencias.txt). As matrizes originais F01, F02–F09 e os testes anteriores de Hosting/crash não foram alterados.

Ambiente: Node 24.22.1, Java 21, SDK Firebase 12.19.0, CLI 15.35.0, Playwright 1.63.0, Chromium 153. Sem aparelho móvel/Safari real, Firebase de produção, OAuth real ou nova medição da validade/revogação de tokens de produção. Offline na fixture preserva assets locais e bloqueia Auth/Firestore; service worker é bloqueado. O limite de durabilidade de `localStorage` no crash completo permanece documentado separadamente no parecer anterior, sem confundi-lo com N01.

## Recomendações e parecer

Prioridade de correção: N01 (aviso e persistência), N03 (ciclo de exclusão), N02 (todas as cópias locais), validação N04 e contadores com causalidade explícita. Quarentenar diários ilegíveis em N05 e tratar o comportamento de liderança suspensa como limite operacional a resolver ou comunicar. Manter os testes positivos de UID e carga durante as correções.

F13 e H02 da base continuam reprovados conforme o parecer anterior; não foram reclassificados com base em trabalho paralelo ainda sem SHA auditado. **Nenhum código posterior do Claude foi aprovado.**

As fases foram cobertas com revisão, testes locais e documentação. Permanecem limitações de plataforma/produção explicitadas acima; elas não foram usadas para ocultar as falhas reproduzíveis do app. **Parecer final de 8bd32d2: REPROVADO.**

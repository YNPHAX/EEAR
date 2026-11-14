# Auditoria técnica do candidato Firebase a35ea9a

**Parecer: REPROVADO para avançar à próxima fase de homologação.**

SHA auditado: **`a35ea9a769c150e561dfbde3205525b96bbfbfe7`**.
Runtime declarado, conferido por comparação de arquivos: `650007b5eeb2d0bcb41f9277e5d370afe5a1edc2`.
Branch dos testes/relatório: **`auditoria/firebase-a35ea9a-final`**. Execução: 14/11/2026, UTC.

Foram reproduzidos **três achados de gravidade alta e um de gravidade média**. Há perda silenciosa de importação,
subcontagem/duplicação de atividades e recriação de dados depois de exclusão por cliente Firebase anterior.
Esses problemas impedem aprovação mesmo com CI verde e com as suítes originais aprovadas.

A implementação candidata não foi modificada. Não houve merge, deploy, publicação de regras ou acesso a Firebase
real. Todos os registros usados nos testes são fictícios. Apenas testes novos e este material de auditoria são
publicados na branch independente; branches Codex, Claude, main e auditoria anterior permanecem intactas.

## Independência e método

O relatório `consolidacao-firebase-oficial.md` e suas evidências foram lidos como alegações a verificar, sem assumir
seus resultados. O commit e a árvore foram obtidos novamente do GitHub, em checkout novo, e as validações foram
reexecutadas em diretório diferente, com logs novos. Os contraexemplos acrescentados usam o bundle sem alterações,
interface pública, SDK Firebase real e interrupções/respostas reais controladas, sem reimplementar a persistência.

**Vínculo do executor:** o mesmo agente participou da implementação anterior. Esta é uma revisão técnica com
reexecução independente e novos testes, não uma revisão organizacional externa por outro autor. Os resultados são
reproduzíveis e devem ser examinados por outro revisor.

## Identidade dos arquivos testados

- Commit GitHub: `a35ea9a769c150e561dfbde3205525b96bbfbfe7`.
- Árvore GitHub: `23f73e3de078eeac9d84c18fd54edfc10fb05523`.
- Blob Git de `curso/app.js`: `b486a6517eecf3ec63d51b2be7a556bab9a692d6` (237.332 bytes).
- SHA-256 do bundle: **`124a9084d0a8ac02179df1a42134f075b3ee72cddb78e0bcaf4c351e31ea9f48`**.
- Blob de `web/firestore.rules`: `18205f13682e9aa38961824c1af445d1bc1fb9f0`.

Foram verificados **133 arquivos relevantes** contra os blobs da árvore fornecida pelo GitHub, antes de cada suíte
original e novamente ao final. O build servido é comparado byte a byte ao bundle do checkout. Site e conteúdo
Android produzidos nesta auditoria têm o SHA-256 acima. O diff do runtime entre 650007b e a35ea9a está vazio.

Hashes, comandos e resultados estão em [a35ea9a-independente-resultados.json](a35ea9a-independente-resultados.json).
As saídas, inclusive negativas, estão em [a35ea9a-independente-evidencias.txt](a35ea9a-independente-evidencias.txt).

Ambiente: Linux, Node 24.22.1, Java 21.0.13, Playwright 1.63.0/Chromium, Firebase SDK 12.19.0,
firebase-tools 15.35.0, ESLint 9.17.0. Projetos emulados: `demo-eear`, `demo-eear-f01` e
`demo-eear-independent-a35`. O último usa portas próprias 8280/9299, websocket 9250 e hub/logging 4490/4491;
não compartilha os serviços da matriz original. Configurações eear-teste usadas em builds são fictícias.

## Achados confirmados

| ID | Gravidade | Resultado observado | Áreas |
|---|---|---|---|
| **IA01** | **Alta** | Importação aceita depois do corte de uma exclusão desaparece; reserva descartada, nenhuma recuperação, aviso final de progresso salvo. | IndexedDB, exclusão concorrente, importação, F13 |
| **IA02** | **Alta** | Levar operações novas produz **2/4** ou **3/5**; importar depois de Levar produz **6/5**, persistente após reabertura. | Contagens, identidade/idempotência, migração, F09 |
| **IA03** | **Média** | Resposta atrasada da exclusão de A encerra a sessão B aberta depois; o estudo seguinte não vai para B. B não é apagada. | Sessões antigas, exclusão de conta |
| **IA04** | **Alta** | Cliente Firebase real anterior exclui documento v2 e Auth sem tombstone; sessão atual reconectada recria nome e progresso. | Regras, protocolo v2, privacidade, retorno de clientes antigos/N03 |

### IA01 — perda da importação concorrente com exclusão

Reprodução: [a35-importacao-exclusao.test.js](../testes/a35-importacao-exclusao.test.js).

1. A e B abrem o mesmo perfil local, com `T:base` e atividade 2, já confirmados em IndexedDB.
2. A confirma **Apagar os dados deste aparelho**. Um breakpoint nativo para após `editar()` concluir o corte de
   exclusão, antes de `put()`, em `16-diario-duravel.js:35` (linha localizada no bundle real).
3. Depois desse corte, B importa tarefa `T:posterior-corte`, um certificado e atividade 3. A interface/exportação
   confirma a presença dos campos. Existe uma reserva real com novo ID; ela não consta nas `ignoradas` do corte.
4. A exclusão termina. São testados tanto B viva quanto `Page.crash` de B antes de liberar A.
5. C abre o perfil e inspeciona o checkpoint e a recuperação.

**Resultado:** a tarefa, certificado e atividade importados somem. Checkpoint vazio, reserva ausente,
`quarentena=0`, `LS_REC=null`, e **“Progresso salvo neste aparelho.”** O controle com `marcar` preserva a tarefa e
atividade 1 na mesma intercalação. Ambos os controles passaram; as quatro variantes de importação falharam
(com/sem Web Locks, com/sem crash). A versão sem crash afasta a hipótese de perda causada pelo navegador cair antes
de descarregar localStorage. Trata-se de perda da importação no aplicativo; um arquivo externo ainda preservado
pelo usuário pode permitir recuperação manual, mas o app não conserva nem oferece sua cópia.

Causa: `12-importacao-migracao.js:24` chama `salvar({ importado })`. Em `15-diarios-pendentes.js:67`, qualquer objeto
nesse argumento torna `local: !remoto` falso, confundindo importação do usuário com recepção remota.
`operacaoPermitida`, linhas 2–4, rejeita a geração anterior; `enfileirar`, linha 80, remove a reserva mesmo sem recibo
para a operação. A consolidação também considera `!operacaoPermitida` confirmação para limpeza, linhas 123–127.
A recusa fica silenciosa e a UI passa a indicar sucesso.

Proposta, não implementada: distinguir origem local/importação/recepção remota explicitamente; preservar operações
aceitas depois do corte como no controle `marcar`, ou recusar/quarentenar com aviso inequívoco. Limpar uma reserva
somente mediante resultado durável que comprove aplicação ou descarte autorizado, sem equiparar recusa por geração
a confirmação de gravação. Manter proteção contra ressuscitar respostas remotas antigas e exclusões definitivas.

### IA02 — Levar para a conta perde identidades e corrompe contagens

Reproduções: [a35-contas-adversarial.test.js](../testes/a35-contas-adversarial.test.js) e
[a35-levar-reimportacao.test.js](../testes/a35-levar-reimportacao.test.js).

1. Um dispositivo real do candidato cria duas atividades em conta Firebase inicialmente com contador zero.
2. Outro perfil, sem conta, cria duas ou três atividades pelo mesmo runtime e lê uma aula para disponibilizar
   **Levar para a conta**. Os dois lados têm metadados v2 e IDs positivos comprovadamente disjuntos.
3. Esse perfil entra na conta existente e usa o botão público **Levar para a conta**.
4. No caso 3+2, importa depois o backup original com os mesmos IDs, repete e reabre.

**Resultados:** 2+2 vira **2**, local e servidor; 3+2 vira **3**. Após importar o backup no segundo caso, vira **6** e
continua 6 após repetir e reabrir, apesar de existirem apenas cinco ações. A interface informa **“Progresso salvo na
sua conta.”** O controle que importa diretamente em outra conta com duas ações conserva **5/5**. No caso 2+2,
importação direta recupera 4/4 sem duplicar ao repetir.

Não é ambiguidade de snapshots antigos: as contribuições positivas dos dois lados são operações novas, geradas pelo
candidato; os testes verificam seus IDs disjuntos. O contador legado de bootstrap tem valor zero. Não foi reativado
transporte legado.

Causa: `09-contas.js:52–56` usa `unirProgresso(null, ...)` e copia `_ops` da conta de destino. Essa união agrega
contadores por máximo sem base (`08-uniao-nuvem.js:81,150`), descartando a proveniência do perfil sem conta. Quando
há diferença, cria outra contribuição para ela; uma importação posterior adiciona os IDs originais novamente.
A união CRDT/Firestore pode ser idempotente e ainda assim receber uma história já corrompida por esse fluxo.

Proposta, não implementada: fazer a transferência conservar IDs das contribuições, com semântica única entre Levar
e importar backup. Provar repetição, diferença de contagens, resets de cada origem, certificados e configuração da
conta de destino. Somar números isoladamente ou gerar novos IDs para as mesmas ações não resolve o problema.
Dados já afetados exigem diagnóstico/backup; não aplicar uma subtração automática genérica.

### IA03 — exclusão antiga altera a sessão nova

Reprodução: segundo cenário de [a35-contas-adversarial.test.js](../testes/a35-contas-adversarial.test.js).

1. Confirmar o perfil B localmente e no servidor; depois entrar em A.
2. Iniciar exclusão de A com senha e confirmação EXCLUIR.
3. Reter a resposta HTTP **real** de um commit Firestore já aceito, sem falsificar corpo/status. O documento A já
   foi apagado e seu tombstone criado.
4. Trocar a sessão Auth para B pelo SDK público e conferir UID B e checkpoint B. Isso representa mudança de sessão
   que pode vir de outra aba. O teste não exige furar a fila Firestore que ainda aguarda a resposta antiga.
5. Liberar a resposta de A; observar Auth e a interface, e realizar estudo depois da troca.

**Resultado:** antes da resposta, UID/perfil B estavam selecionados. Depois, `auth.currentUser=null` e marcador local
vazio; o perfil exibido fica anônimo. O novo estudo não chega a B. O documento de B permanece intacto, portanto esta
não é uma exclusão indevida da conta B nem um vazamento entre UIDs.

Causa: `09-contas.js:139–150` não confere identidade/geração da sessão depois dos `await`. Chama `deleteUser(uA)`
usando o Auth compartilhado já trocado e depois `usarIdentidade('')`, sem proteção equivalente à de `conciliar`.
A exclusão no SDK encerra a sessão corrente; o callback antigo afeta B.

Proposta, não implementada: cercar cada etapa irreversível e cada alteração de UI pelo UID e token de operação
capturados, incluindo respostas depois de reautenticar. Não executar finalização Auth antiga sobre a instância que
passou a outra conta. Se a nuvem de A já foi apagada, registrar um resultado parcial vinculado a A, preservando B;
resolver a finalização de A em contexto apropriado. Desabilitar só um botão não cobre mudanças por outras abas.

### IA04 — exclusão por Firebase anterior permite recriação

Reprodução: [a35-retorno-firebase-antigo.test.js](../testes/a35-retorno-firebase-antigo.test.js), com o build real
**`2f6cad6ebba53d0f86319dcada671fe9396f8111`**, bundle SHA-256
`8bc7352d0d852deed12abfd701e7e9e6783e4d4cede7961c598383185fd737ef`.

1. O candidato confirma nome/progresso em um documento Firebase v2. Manter esse dispositivo offline com sua sessão.
2. Em outro perfil/origem, abrir 2f6cad6, entrar na mesma conta e excluir pela interface real com senha e EXCLUIR.
   Esse código faz `deleteDoc` e `deleteUser`, sem marcador (`09-contas.js` antigo, linhas 136–138).
3. Comprovar documento apagado, novo login recusado (**HTTP 400**) e ausência de tombstone (**HTTP 404**).
4. No candidato já conectado, aceitar estudo, reconectar e observar o servidor.

**Resultado:** o candidato recria nome **“Pessoa Fictícia Excluída”**, `T:privada` e estudo novo, e informa
**“Progresso salvo na sua conta.”** A conta Auth havia sido excluída. O caso não exige alterar cliente para imitar
v2, forjar token ou sair do próprio UID; usa dois builds reais e credenciais fictícias legítimas.

Causa: `web/firestore.rules:32` permite `delete` ao dono sem exigir marcador. A verificação monotônica de `v` existe
somente no update. O cliente anterior pode remover o documento v2 e excluir Auth, deixando a proteção
`!exists(contasExcluidas/uid)` sem efeito. A validade residual do token não deve ser usada como prova de que a conta
continua existindo. O fluxo novo com tombstone continua protegido nos testes originais; o caminho antigo contorna
esse pré-requisito.

**Não confundir com a nuvem Claude deliberadamente desativada nem com a reversão manual já documentada.** O cliente
anterior já podia estar em outro aparelho enquanto o candidato atualiza o documento para v2. Bloquear gravação v1
ou desativar `window.claude` no app atual não impede essa exclusão via Firebase.

Proposta, não implementada: fechar o contrato de exclusão no servidor, exigindo tombstone válido no estado posterior
da transação (por exemplo, validação com `getAfter`), ou solução servidor equivalente. Excluir deve criar a barreira
atomicamente, ou o cliente incompatível deve ser recusado antes de apagar os dados/Auth. O teste atual em
`firebase-emulador.test.js:186` considera exclusão direta permitida; esse contrato precisa de decisão explícita e
novos critérios mais fortes. Nada foi modificado/publicado nas regras auditadas. Não usar polling/espera de token
como garantia substituta.

## Suítes originais reexecutadas e limites de conclusão

| Grupo | Resultado independente |
|---|---|
| Firebase Emulator | **50/50**, incluindo senha, Google emulado, regras, certificados, sessão offline e exclusão nova. |
| F01 original | **8/8**, sem alterar critérios. |
| Agregador de persistência | **13/13 grupos**, 39 verificações positivas, sem negativas. Inclui N01–N07 e reproduções anteriores F09/F13. |
| Plataforma local integral | **166 positivas**, zero negativas. |
| F01 riscos | **6/6**, incluindo Zerar/aba única, suspensão, contagens, reconexão e escrita interrompida. |
| Diários | **8/8**; quatro abas, eventos perdidos, fechamento e crashes. |
| Concorrência/órfãos | Passaram última conferência, quatro cenários de retorno e nove sequências, inclusive relógio de 30 minutos. |
| Browser.crash sem Web Locks | Primeira execução: **3/4**, com uma falha de pré-condição antes do crash de Zerar+estudo. Repetição integral **4/4**; três repetições isoladas de Zerar+estudo passaram. A primeira negativa foi preservada e permanece uma observação inconclusiva. |
| Migração de diários verdadeiros | **8bd32d2 e 2f6cad6 passaram**. |
| Quota real + abort / cache restaurado | Passaram; retomada por IDs, ausência de confirmação falsa e recuperação após crash nos casos originais. |
| Metadados acima do limite | Passou: local/checkpoint/reabertura **6002**, servidor anterior **2**, recusa explícita. |
| Carga de navegador | **2.000 ações**, quatro abas, **2002/2002**, dez resets, certificado e reabertura; zero negativas. |
| Núcleo | **12.000 operações**; normalizador mínimo explícito, não substitui o ensaio completo de navegador. |
| Hosting H01–H03 | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, sem negativas; falsos aceites em script-texto/template continuam recusados. |
| Barreira Android real | Build com configuração fictícia de homologação gerado; verificação no modo oficial **recusou** o artefato, como exigido. |
| Builds / lint / montagem / integridade | Passaram; bundles de site e conteúdo Android conferem com o SHA-256 auditado. APK: compilação/verificação conferidas no CI do SHA exato; não recompilado localmente nem testado em aparelho físico. |
| Atualização transacional d165485 ↔ candidato | **6/6 etapas**, contagens e Zerar+estudo corretos. |
| Reversão 2f6cad6 | Mantida **uma negativa** de união automática; quarentena e recuperação explícita pela UI passaram. |

F02–F04: ciclo `recusa/callback/saida` passou; IA03 demonstra um fluxo assíncrono diferente sem a proteção.
F05–F07: barreiras de artefatos, informação sobre dados pessoais, regras/UID e isolamento das fixtures foram
reavaliados. F08: cenários de Zerar+estudo passaram nas suítes indicadas, com a ressalva de pré-condição acima.
F09: casos antigos de dispositivos/ACK perdido/simulados e nove sequências passaram, mas IA02 fornece novos
contraexemplos. F10–F13: casos anteriores de diário, notificações e exclusão passaram; IA01 mostra que não cobrem
importação concorrente. N01–N07 originais não bastam para excluir IA01/IA03/IA04. Não se aprova a categoria inteira
apenas porque sua reprodução antiga passou.

Na negativa de durabilidade sem Web Locks, a exportação momentânea lida pelo teste estava vazia após Zerar,
enquanto a leitura posterior já tinha `T:novo` e atividade 1 no checkpoint. O teste parou **antes de provocar
crash**, por não estabelecer igualdade entre esses estados. Não demonstrou perda pós-crash. A origem exata dessa
divergência transitória não foi provada: não a classifico como simples problema de infraestrutura, nem como perda
confirmada. Resta investigar aplicação fora de ordem de snapshots em memória; as repetições positivas não apagam a
negativa original. Nenhuma asserção desse teste foi editada.

## Histórico deliberadamente incompatível

`historicos-legado.test.js` continua **exit 1**, com 159 positivas, **14 negativas** e erro posterior em `contas.js`.
Os módulos depois desse erro não foram considerados executados/aprovados. O cenário histórico 9 não estabelece sua
preparação porque o transporte está bloqueado; suas 21 positivas anteriores são verificações de dados, não sucesso
de convergência. Esse é o serviço Claude legado desativado e não é contado como nova vulnerabilidade do candidato.

A reversão automática para 2f6cad6 continua não suportada e sua negativa foi mantida. IA04 é outra propriedade:
exclusão no Firebase por um cliente que já estava em outro aparelho, sem tentar unir checkpoints depois de rollback.

## CI verificado diretamente

Todos para **a35ea9a769c150e561dfbde3205525b96bbfbfe7**:

| Workflow | Resultado | Evidência |
|---|---|---|
| Site | success; publicar skipped | [run 43602331048](https://github.com/YNPHAX/EEAR/actions/runs/43602331048) |
| App Android | success; publicar skipped | [run 43602331057](https://github.com/YNPHAX/EEAR/actions/runs/43602331057) |
| Testes | success; histórico opcional skipped | [run 43602331050](https://github.com/YNPHAX/EEAR/actions/runs/43602331050) |

Os quatro achados novos não são cobertos por esses testes. A branch de auditoria não corresponde aos filtros de
push desses workflows; não se atribui CI verde aos testes adversariais, que terminam com **exit 1** no candidato.
Nenhuma configuração de workflow foi alterada para contornar isso.

## Capacidade e riscos restantes

O crescimento informado no relatório anterior foi reproduzido: 2.000 ações geram estado de **313.236 B** e checkpoint
de **674.550 B**; após dez resets, uma marca visível ainda deixa estado de **353.491 B**, checkpoint de **797.604 B**
e 2.021 recibos. No ensaio mínimo, a amostra de 6.000 ações produz **910.368 B** e cruza o limite remoto; 12.000
produzem **1.826.371 B**. Esse número de ações não é um limite universal: depende dos dados. A recusa é explícita e o
checkpoint local é preservado; não foi implementada compactação durante a auditoria.

Permanecem: Safari/iOS/WebViews físicos, suspensão e descarte de dados pelo SO, queda de energia, OAuth real,
configuração/regras efetivamente instaladas e política/termos de contas. Avançar com dados reais exigiria tratar
também essas pendências e a retenção do tombstone UID/data. As regras validam UID/envelope, não o JSON causal;
continuam sem prova geral de integridade contra um cliente autenticado arbitrariamente modificado.

## Reprodução dos testes novos

Instalar as versões acima fora do repositório e definir `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`,
`EEAR_FIREBASE_SDK` e `EEAR_FIREBASE_CLI`. Criar checkout do SHA auditado, depois:

```sh
export EEAR_REPO_ALVO=/copia/imutavel/a35ea9a
node testes/a35-importacao-exclusao.test.js
node testes/a35-contas-adversarial.test.js
node testes/a35-levar-reimportacao.test.js
EEAR_REPO_LEGADO=/copia/imutavel/2f6cad6 node testes/a35-retorno-firebase-antigo.test.js
```

Executar os três últimos sequencialmente: usam emuladores próprios nas mesmas portas. Cada comando acima deve
produzir as negativas descritas no candidato, sem modificar qualquer linha do seu runtime. O primeiro bloqueia toda
rede Firebase e usa somente armazenamento local. Os demais bloqueiam serviços externos e usam emuladores demo.

Duas tentativas iniciais do teste novo de contas falharam na preparação: consultar `#sync` fora da tela que o contém;
e exigir confirmação remota de B enquanto a resposta antiga retida serializava a fila Firestore desse cliente.
A preparação foi corrigida para Plano e checkpoint B já confirmado anteriormente. As exigências de preservação de
UID, perfil, contagens e confirmação final não foram reduzidas; ambos os logs iniciais foram preservados.

## Condições para nova avaliação

Corrigir IA01, IA02 e IA04 e tratar IA03, com provas nos testes novos e nos originais, antes de apresentar outro
candidato. Reexecutar contas/exclusão com respostas fora de ordem, perfis simultâneos e Firebase anterior. Resolver
ou explicar a divergência pré-crash pendente. Registrar um **novo SHA exato** e auditar esse SHA; não transferir a ele
aprovação por herança do CI ou deste relatório.

Não há correções de implementação nesta entrega. Os testes iniciais estão no commit
`980d3b0ea223755a5b3f411b989cd8b56a3c8c2f`; o teste adicional Levar→reimportar e os relatórios são acrescentados em
commit posterior na mesma branch de auditoria. O diff completo é restrito a testes novos e documentos/evidências.

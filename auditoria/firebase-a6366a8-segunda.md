# Segunda auditoria do candidato Firebase a6366a8

**Parecer: REPROVADO para avançar à homologação controlada. Produção não autorizada.**

SHA auditado: **`a6366a849871db3de3554f28fa1400f10aff0f0c`**.
Runtime: **`5a8965b8f3b1678521601526e412cfe51d1ef02e`**.
Branch independente: `auditoria/firebase-a6366a8-segunda`.
Testes novos: commit `ae8f3a0140b048e2996b40c98fbb977f699ae77d`.
Execução: 14/11/2026, UTC.

As reproduções originais das quatro correções passaram no contrato atual, mas novos testes confirmaram
**duplicação de atividade na importação concorrente de backup antigo** e **retorno de erros já corrigidos ao usar
Levar**. São defeitos do aplicativo, com contagens incorretas persistidas e confirmação de salvamento na interface.
O primeiro já existia na base anterior; o segundo é regressão da nova transferência.

## Participação do auditor e método

O mesmo agente Codex participou da implementação anterior, inclusive do commit 5a8965b. Esta entrega é uma revisão
com nova execução, novos contraexemplos e checkout separado; **não constitui independência organizacional de outro
autor**. Essa participação é declarada para que um revisor externo possa avaliar e repetir as evidências.

O relatório de correção, os testes e as evidências antes/depois foram examinados como alegações. O arquivo anterior
de evidências, de 332.535 bytes e 58 seções, foi lido integralmente e suas negativas foram identificadas. Não se
transferiu aprovação do relatório anterior nem do CI. Todos os resultados abaixo provêm de novas execuções.

O SHA e a árvore foram obtidos diretamente do GitHub. Uma cópia destacada em `/tmp/eear-audit2-runtime` executou as
suítes originais; os testes adicionais foram escritos apenas na branch de auditoria e apontam para essa cópia.
**370 arquivos** de curso, runtime, dados, testes, scripts web, workflows e configurações foram conferidos por hash
de blob antes/depois de cada suíte da matriz original e ao final. Nenhum divergiu. Builds das fixtures comparam o
bundle servido byte a byte ao publicado; só a configuração fictícia é inserida no HTML temporário.

- Árvore GitHub: `942b07c3c5d5b6aa729f30d2b7d5f575a0f6a0c2`.
- `curso/app.js`: blob `acf76035224d6c5d0607ac3a1f9afc5c8e7adf89`, 241.652 bytes.
- SHA-256 do bundle: **`ce6d1069f0cfc46bc2b447b6c2535a1d062a9bf59c7f1d221dcbbde96d15950f`**.
- Regras candidatas: blob `c7f48ae092901bf46583915d81affa1206579d8f`.
- O diff de `curso/` e `web/` entre o runtime declarado e o candidato é vazio.

Ambiente: Node 24.22.1, Java 21.0.13, Playwright 1.63.0/Chromium, Firebase SDK 12.19.0,
firebase-tools 15.35.0 e ESLint 9.17.0. CI do candidato usa Node 22. Só projetos demo-eear, demo-eear-f01 e
demo-eear-independent-a35 em loopback; nenhum dado real, regra real ou serviço Firebase real foi acessado.

## Resultado das quatro correções originais

| Achado anterior | Resultado independente | Limite da conclusão |
|---|---|---|
| IA01 — importação concorrente com exclusão | Seis cenários originais passaram: dois controles de marcação e quatro importações com/sem Web Locks e com/sem crash. Tarefa, certificado e atividade após o corte preservados. | O novo teste de exclusão abortada também preservou base + importação identificada em 7/7, sem confirmar exclusão falsa. Não é prova universal de toda intercalação. |
| IA02 — Levar 2+2 / 3+2 e reimportar | Casos originais produziram 4/4 e 5/5, local/remoto, inclusive repetição e reabertura. | IA05 e IA06 abaixo mostram que a categoria transferência/importação ainda contém falhas. |
| IA03 — resposta atrasada de A encerra B | Passaram as retenções originais de respostas reais Firestore/Auth. O novo caso troca Auth em outra aba e confirma estudo B antes/depois da resposta A; ambas as abas permanecem em B e A é removida. | Testes no SDK real/emulador, sem prova sobre todos os navegadores físicos ou alterações futuras do SDK. |
| IA04 — cliente Firebase anterior recria dados excluídos | Com as regras candidatas, o build real 2f6cad6 é recusado antes de excluir Auth. Exclusão atual atômica, marcador imutável, UID e token antigo foram verificados pelo teste de protocolo. | Depende das novas regras. Com o MESMO runtime e regras anteriores no emulador, o teste original volta a recriar dados após Auth excluído. |

O gate original `bloqueadores-auditoria.test.js` passou integralmente: quatro controles negativos na base rejeitada
(a35ea9a) e oito grupos positivos no candidato. Seus arquivos e asserções não foram editados. O IA04 original exige
que o DELETE antigo seja aceito como preparação; isso foi preservado no controle inseguro, não declarado aprovado
sob as regras novas. O teste `exclusao-protocolo` exige a recusa correta e a exclusão autorizada atual.

## Achados novos

| ID | Gravidade | Resultado | Origem |
|---|---|---|---|
| **IA05** | **Alta** | O mesmo backup antigo importado concorrentemente produz **8/5** com duas importadoras e **11/5** com três; em dois dispositivos offline, servidor e dispositivo novo ficam em **8/5**. | Defeito anterior persistente, agora reproduzido por novos testes de migração oficial. |
| **IA06** | **Média** | Após corrigir dois erros e cometer um erro novo que observou essa correção, Levar restaura os dois anteriores: **3/1**, inclusive no servidor e após reabrir. | Regressão de `opTransferencia`, introduzida na correção 5a8965b. |

### IA05 — identidade de importação legada não é idempotente sob concorrência

Testes: [a636-importacoes-concorrentes.test.js](../testes/a636-importacoes-concorrentes.test.js) e
[a636-importacao-dispositivos.test.js](../testes/a636-importacao-dispositivos.test.js).

Reprodução entre abas:

1. Confirmar uma base com atividade 2 em IndexedDB. Abrir uma aba observadora e duas ou três importadoras, todas na mesma base.
2. Parar nativamente uma transação periódica **sem alterações** da observadora, no breakpoint de `16-diario-duravel.js:35`. A prova mostra base 2 e resultado 2/sem escrita; nenhuma importação foi aplicada ainda.
3. Nas importadoras, colar os mesmos bytes de um backup válido v1, sem `_ops`, com atividade 5, tarefa e certificado. Cada exportação aceita mostra 5; cada diário contém um UUID diferente contribuindo +3.
4. Liberar a observadora, conferir confirmação local, fechar/reabrir o perfil.

Resultado: duas importadoras deixam **2 + 3 + 3 = 8**, três deixam **11**. A tarefa e o certificado ficam; a atividade
está inflada e a interface afirma “Progresso salvo neste aparelho.” Há três/quatro abas totais, contando a observadora.
O mesmo arquivo repetido sequencialmente mantém 5. O controle com backup identificado mantém os mesmos IDs e
produz **7/7** (base 2 + origem independente 5), mesmo com duas importadoras.

A reprodução entre dispositivos dispensa breakpoints e memória compartilhada: dois contextos independentes recebem
base 2, ficam offline, importam o mesmo arquivo (ambos confirmam 5 localmente) e reconectam em ordem. Servidor e um
terceiro contexto ficam em **8**, com “Progresso salvo na sua conta.” O SHA-256 do arquivo nos dois é
`440c8bfe4a29f5f436c3deee7e3bd337f813fdb1c040de4215450b8cdab60b86`.

Causa: `12-importacao-migracao.js:14` reconhece ausência de metadados e usa `opVazio()`/o estado local como base;
`15-diarios-pendentes.js:74` cria UUID novo para cada importação; `opDelta` em `14-abas.js:115` transforma a diferença
numérica em contribuição distinta. A transação serializa e conserva corretamente **dois eventos já duplicados na
origem**. Não existe identidade durável da recepção/migração do mesmo backup.

Isso não é a ambiguidade inevitável entre dois snapshots antigos diferentes nem o transporte legado desativado:
**os bytes são os mesmos**, e o importador oficial aceita e anuncia sucesso. Na base a35ea9a, a mesma nova prova
entre abas também produz 8/5 e 11/5. Portanto é uma falha preexistente da migração que os testes anteriores não cobriam.

Proposta, não implementada: definir identidade estável de origem/recepção para backups sem operações e registrar a
aplicação de forma transacional, inclusive entre dispositivos. Uma impressão digital canônica pode participar dessa
identidade; não basta gerar UUID por clique nem deduplicar todos os incrementos pelo valor. Definir também a política
explícita de reimportação após Zerar. Preservar operações de estudo independentes e as provas de reset concorrente.

### IA06 — Levar perde o contexto de uma correção observada

Teste: [a636-transferencia-erros.test.js](../testes/a636-transferencia-erros.test.js).

Reprodução pela interface, SDK e Firestore reais emulados:

1. Conta Firebase tem dois erros da questão real `POR01-0`. Corrigi-la pelo Caderno de erros. Exportar o progresso corrigido: o contador está vazio e há um marcador causal de correção (`c.l`).
2. Em outro perfil, sem conta, importar esse backup identificado e responder a mesma questão incorretamente uma vez pelo quiz público.
3. Confirmar erro 1. Os metadados do erro novo registram que ele **observou a correção anterior** (`c.o[novo][correcao]=true`). Não há erro concorrente desconhecido.
4. Entrar na conta original, ainda com zero erros, e usar **Levar para a conta**. Reabrir e consultar o servidor.

Resultado: origem **1**, destino/local/servidor/reabertura **3**. A interface afirma “Progresso salvo na sua conta.”
Importar diretamente o **mesmo backup** preserva `c.o` e mantém exatamente **1**, demonstrando que não é um backup
inválido nem o comportamento intencional de preservar erros genuinamente concorrentes.

Causa: `14-abas.js:83` mantém as contribuições vivas, mas reconstrói o contador como `{a, x:{}}`, descartando `o`
(contexto de correções observadas) junto de `l`. O destino conserva seu `l`; `opIdsVivos`, linha 75, passa a interpretar
o incremento como concorrente à correção, e reativa as duas contribuições antigas. Manter o ID do incremento,
isoladamente, não basta para preservar a semântica causal.

Comparação com a base a35ea9a: o primeiro estágio Levar produz **1/1**, não 3/1. A importação posterior nessa base
termina em 2/1, pela IA02 antiga; essa negativa também foi preservada. Não se declara a suíte antiga inteira aprovada.
A regressão nova é especificamente o primeiro estágio de Levar, no qual 5a8965b passou a remover o contexto `o`.

Proposta, não implementada: preservar o contexto de observação das contribuições transferidas, mesmo quando não se
transfere uma ordem de apagar de outra origem. Acrescentar esse caso às propriedades de união/transferência, mantendo
os critérios existentes para correção concorrente, Zerar, erro posterior e repetição. Não corrigir apenas o número
materializado nem trocar IDs para tentar compensar o retorno de contribuições antigas.

## Regras IA04: dependência e suficiência demonstrada

`web/firestore.rules:34` exige `getAfter(contasExcluidas/uid).data.v == 1` para apagar o documento. O marcador é
imutável e restrito ao próprio UID; criação/atualização/leitura de progresso são recusadas quando ele existe.
O fluxo atual grava o marcador e apaga o progresso na mesma transação. No emulador, isso bloqueou o caminho do
cliente Firebase anterior real, além das tentativas com tokens antigos, sem quebrar a exclusão atual autorizada.

[a636-regras-dependencia.test.js](../testes/a636-regras-dependencia.test.js) executa o teste original IA04 com
**runtime a6366a8 intacto e regras de a35ea9a**, num projeto demo isolado. Documento v2 apagado, Auth recusando novo
login (400), marcador ausente (404), e reconexão recriando nome/progresso foram reproduzidos. O programa exige esses
sintomas exatos e o hash do bundle novo; não considera qualquer falha de preparação como prova.
O campo textual `candidato: a35ea9a` nesse log é fixo no teste original; o runtime efetivo é comprovado pelo SHA-256.

Assim, as regras candidatas são suficientes **nos fluxos e ataques testados**, e o runtime sozinho não basta.
Adoção futura em ambiente controlado exige conferir que essas regras foram efetivamente instaladas, em operação
separada autorizada pelo dono. **Nada foi publicado ou inspecionado no Firebase real nesta auditoria.**
As regras continuam validando UID/envelope, não o JSON causal completo. Não são uma garantia contra qualquer cliente
arbitrariamente modificado ou contra exclusão Auth realizada fora dos fluxos suportados sem marcador.

## Matriz original reexecutada

| Grupo | Resultado desta auditoria |
|---|---|
| Firebase Emulator | **51/51**, senha, Google emulado, regras, UID, certificados, sessão offline, exclusão normal e parcial. |
| F01 obrigatório | **8/8**, sem alterações de critérios. |
| Persistência | **13/13 grupos, 39 verificações**, incluindo N01–N07 e reproduções anteriores F09/F13. |
| Plataforma local | **166 verificações**, zero negativas. |
| F01 riscos | **6/6**, Zerar/aba única, suspensão, contagens, exclusão e escrita interrompida. |
| Diários | **8/8**, quatro abas, notificações perdidas, fechamento e crash. |
| Retorno de suspensão | Nove sequências com ponto de 30 min; passou. O relógio é controlado no teste, não são 30 min de espera física. |
| Browser.crash sem Web Locks | **4/4**, incluindo Zerar+estudo e segunda queda após recuperação; com Web Locks passou nos 13 grupos. |
| Migração | Diários reais de **8bd32d2 e 2f6cad6 passaram** nos casos existentes; não cobriam a IA05 nova. |
| Quota + abort / cache / quarentena | Passaram ausência de confirmação falsa, retomada dos mesmos IDs, cache restaurado e exclusão concorrente. |
| Sincronização oficial | Casos existentes passaram, inclusive três dispositivos offline sem Web Locks, **5/5** exatos. |
| Núcleo / carga de navegador | **12.000 operações**; **2.000 ações** em quatro abas, **2002/2002**, dez resets, certificado e reabertura. |
| Limite remoto de metadados | Local/checkpoint/reabertura **6002**, servidor **2** e recusa explícita; passou. |
| Hosting H01–H03 | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, sem negativas. |
| Builds / integridade / lint | Site e conteúdo Android verificados; bundles idênticos ao SHA-256 do candidato. Montagem, conteúdo, workflows e ESLint passaram. |
| Barreira Android | Artefato fictício de homologação gerado (0); verificador oficial o recusou (1), como exigido. |
| Atualização transacional d165485 ↔ candidato | **6/6 etapas**, contagens e Zerar+estudo corretos. |
| Downgrade 2f6cad6 | **Uma negativa conhecida** na volta automática; quarentena e recuperação explícita pela UI passaram. |
| Histórico de sincronização legada | **exit 1, 159 positivas, 14 negativas**, depois TypeError em contas.js; módulos posteriores não aprovados. |

F02–F04: ciclo de recusa/callback/saída passou; a exclusão com respostas fora de ordem foi ampliada. F05–F07:
barreiras de publicação, privacidade/envelope e isolamento das fixtures foram reavaliados. F08–F13 e N01–N07
passaram em suas reproduções existentes. Os novos contraexemplos de F09/importação/transferência impedem tratar
a passagem das reproduções antigas como aprovação completa dessas categorias.

A matriz adicional [a636-matriz-auditoria.js](../testes/a636-matriz-auditoria.js) retorna **exit 1**, sem converter as
falhas do candidato em aprovações: importações simultâneas, transferência de erros e importação entre dispositivos
falham; sessões entre abas, abort/crashes e o controle de dependência das regras passam. São **dois achados únicos**
em três executáveis negativos. Os arquivos originais de teste permaneceram byte a byte iguais ao candidato.

Falhas de preparação preservadas: os dois primeiros pontos de pausa do novo teste de importação atingiam um cache
já confirmado ou não atingiam a transação pretendida. A versão final pausa uma transação observadora sem alterações
e exige todas as importações aceitas/reservadas antes de liberá-la. Não foi reduzida a exigência de contagem exata.
A primeira preparação de sessões exigia `data-nuvem=confirmado` numa aba seguidora, antes de iniciar qualquer exclusão;
a confirmação dessa aba é representada por igualdade com a base e mensagem de salvo. A preparação passou a respeitar
essa semântica; a prova independente de estudo B efetivamente presente no servidor antes/depois da resposta A foi
mantida. Nenhuma dessas preparações foi contada como vulnerabilidade, sucesso ou motivo para ignorar uma negativa real.

## Metadados, migração e downgrade

Carga real de 2.000 ações: estado **313236 B**, checkpoint **674550 B**. Após dez resets:
uma marca e atividade 1, estado **353491 B**, checkpoint **797604 B**, 2021 recibos.
No núcleo mínimo, 6.000 ações = 910.368 B (primeiro ponto amostrado acima do limite); 12.000 = 1.826.371 B.
Após reset nesse ensaio, uma marca ainda deixa 2.137.837 B. O núcleo usa normalizador mínimo explícito e não substitui
o ensaio de navegador. O teste do limite confirmou 6002 local/checkpoint/reabertura contra 2 no servidor e aviso de recusa.

O crescimento sem compactação é uma limitação conhecida, com recusa explícita e preservação local no limite testado.
Não se torna novo bloqueador por si só para um ensaio controlado curto; exige limites claros e estratégia segura
antes de uso prolongado. Não houve compactação nem sugestão de apagar IDs/recibos para obter tamanho menor.

A migração antiga é explícita por backup, sem conversão automática de conta/backend legado. Essa política de produto
continua válida, mas sua implementação precisa corrigir IA05 antes de ser tratada como segura sob concorrência.
Downgrade automático para 2f6cad6 continua não suportado; preservar backups/quarentena e usar recuperação explícita.
A passagem de seis etapas entre versões transacionais não prova segurança de qualquer reversão. Não remover `_ops`
ou tombstones nem reativar o transporte antigo para contornar incompatibilidades.

## Como repetir os contraexemplos

Na branch de auditoria, com as dependências/Chromium das versões acima instaladas fora do repositório, definir
`NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `EEAR_FIREBASE_SDK` (pacote firebase) e `EEAR_FIREBASE_CLI` (executável firebase).
Preparar cópias imutáveis de a6366a8, a35ea9a e 2f6cad6; o objeto Git a35ea9a precisa estar disponível no repositório
da cópia candidata para a sonda de regras. Depois:

```sh
EEAR_REPO_ALVO=/copia/a6366a8 EEAR_REPO_LEGADO=/copia/2f6cad6 node testes/a636-matriz-auditoria.js
```

Resultado exigido no candidato atual: **exit 1, três executáveis negativos**, com 8/5, 11/5, erro 3/1 e servidor 8/5.
Os outros três executáveis devem passar. Executar os casos Firebase sequencialmente: usam as mesmas portas demo
8280/9299. Nenhuma regra real deve ser publicada. Para a comparação histórica:

```sh
EEAR_REPO_ALVO=/copia/a35ea9a node testes/a636-importacoes-concorrentes.test.js
EEAR_REPO_ALVO=/copia/a35ea9a node testes/a636-transferencia-erros.test.js
```

Ambos terminam em exit 1 nessa base: o primeiro repete 8/5 e 11/5; no segundo, Levar dá 1/1 e a reimportação posterior
falha com 2/1. Não confundir essa segunda negativa antiga com a nova regressão 3/1 no estágio Levar.

## CI e escopo do parecer

CI do SHA exato, conferido diretamente:

| Workflow | Resultado |
|---|---|
| Site | [success 43642326669](https://github.com/YNPHAX/EEAR/actions/runs/43642326669) |
| App Android | [success 43642326647](https://github.com/YNPHAX/EEAR/actions/runs/43642326647) |
| Testes | [success 43642326690](https://github.com/YNPHAX/EEAR/actions/runs/43642326690) |

Publicação foi skipped. Compilação e verificação do APK passaram no CI; o APK não foi recompilado/testado em aparelho
físico nesta auditoria. O histórico é job manual opcional, skipped no push; o resultado local é separado acima.
Os testes novos desta branch não têm CI de push, pois os filtros existentes são main/claude/**/codex/**. Seus logs
locais mostram as negativas; **não receberam aprovação por herança do CI verde do candidato**.

Permanecem não verificados: Safari/iOS/WebViews físicos, descarte de origem pelo SO, perda de energia, OAuth real,
configuração instalada e política de retenção do tombstone no projeto real. Sem IndexedDB, a reserva continua
explicitamente degradada e não garante recuperação de queda completa.

As falhas IA05/IA06 impedem avançar à homologação controlada deste SHA. Corrigir as causas sem perder identidades,
causalidade ou semântica de reset; repetir os testes novos e os originais e auditar o novo SHA exato.
**Este parecer não autoriza produção, merge, deploy ou publicação de regras.**

Resultados e comandos: [a6366a8-segunda-resultados.json](a6366a8-segunda-resultados.json).
Saídas completas, inclusive negativas e preparações: [a6366a8-segunda-evidencias.txt](a6366a8-segunda-evidencias.txt).
Só testes e documentos foram acrescentados à branch de auditoria; o runtime candidato e as branches de desenvolvimento,
main e auditorias anteriores permaneceram intactos.

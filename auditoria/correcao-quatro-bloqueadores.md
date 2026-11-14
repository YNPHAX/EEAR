# Correção dos quatro bloqueadores Firebase

Branch exclusiva: `codex/eear-correcao-estrutural`. Base reprovada: `a35ea9a769c150e561dfbde3205525b96bbfbfe7`.
Auditoria original: branch `auditoria/firebase-a35ea9a-final`, evidências `2db9c15f0aff39eedc92e19785216639951efca2`.
Runtime corrigido: `5a8965b8f3b1678521601526e412cfe51d1ef02e`; testes e gate: `947ea1a42b4694aee092841901a58d65323e0bbf`.
SHA-256 do bundle: `ce6d1069f0cfc46bc2b447b6c2535a1d062a9bf59c7f1d221dcbbde96d15950f` (241.652 bytes).
O runtime, as regras e os builds desta entrega precisam de nova auditoria independente. **Não há declaração de homologação aprovada.**

## Reproduções antes e depois

| Achado | Gravidade original | Base a35ea9a | Correção / exigência no candidato |
|---|---|---|---|
| IA01: importação concorrente com exclusão | Alta | Quatro negativas com/sem Web Locks e com/sem crash; diário desaparece, certificado/tarefa somem, aviso afirma salvo. Dois controles de marcação passam. | Importação é operação local explícita. Os seis cenários originais exigem tarefa, certificado, atividade 1 e checkpoint após o corte. |
| IA02: Levar / reimportar | Alta | 2/4, 3/5; reimportar produz 6/5 persistente após reabrir. IDs positivos das origens são comprovadamente disjuntos. | Transfere contribuições vivas com os mesmos IDs. Exige 4/4 e 5/5 local/remoto, repetição/reabertura, duas quedas reais e outro dispositivo. |
| IA03: resposta de A encerra B | Média | Commit de A aceito, resposta retida, entrada em B; liberar resposta deixa Auth/local anônimos e novo estudo fora de B. | Geração/identidade/token cercam a operação; deleteUser usa Auth temporário em memória. Respostas reais Firestore e Auth retidas preservam B e seu estudo posterior. |
| IA04: cliente Firebase anterior recria dados excluídos | Alta | Build real 2f6cad6 apaga v2 e Auth; marcador 404, novo login 400; token antigo recria nome/progresso. | Regras exigem tombstone no estado posterior da operação de exclusão. Cliente anterior recebe recusa ANTES de deleteUser; o cliente atual exclui atomicamente e tokens antigos recebem 403. |

Os cinco arquivos `testes/a35-*` são cópias byte a byte de 2db9c15, conferidas por hash. Os quatro testes terminaram
com exit 1 na base reprovada, pelos contraexemplos originais, antes de alterar o runtime. Logs anteriores permanecem
nos arquivos da auditoria copiados para esta branch e nas novas evidências desta rodada.

### IA01 — aceitação, confirmação e descarte

`15-diarios-pendentes.js:78` distingue local/importação/remoto. O parâmetro literal `true` continua reservado à
sincronização remota; `{importado}` deixa de ser confundido com ela. A geração não descarta operações locais
aceitas depois do corte da exclusão. Exclusão definitiva e IDs abrangidos pelo corte continuam protegidos.

A coleta de reserva exige recibo durável ou descarte autorizado (`operacaoResolvida`, linhas 6, 91 e 135).
Recusa por geração isoladamente deixou de valer como confirmação. Diários anteriores `local:false` sem origem
explícita são ambíguos: ficam preservados, recuperáveis e sem confirmação falsa. A cópia pode ser exportada; o
backup completo inclui as reservas. Descartar exige ação explícita e registra os IDs ignorados em transação antes
de remover suas reservas. O teste adicional confere reabertura, recuperação pública, descarte e nova abertura.
Nenhum prazo, retry ou coleta por idade foi acrescentado.

### IA02 — identidades e resets

`14-abas.js:80` conserva os IDs de contadores e certificados ativos; `09-contas.js:53` usa essa união em Levar.
Não recalcula a diferença numérica para gerar outra identidade para a mesma ação. A configuração do destino fica
no destino. Não transfere ordens de apagar da origem; os tombstones do destino continuam cobrindo IDs que ele já
observou e zerou. O helper que calcula contribuições vivas é o mesmo usado pela projeção CRDT, inclusive para
correções de erros. O aviso Levar também reconhece marcações, atividade e certificados, além de aulas.

Provas complementares: cinco IDs exatos, repetição, certificados, configuração, reset de cada lado e estudo novo;
integração sem aula prévia, sem Web Locks, Browser.crash após checkpoint efetivo, segunda queda, reimportação e
outro dispositivo. Snapshots antigos sem proveniência não permitem inferir independência de contadores: permanece
a união conservadora da semente legada. Não há correção numérica automática de históricos já corrompidos por 6/5.

### IA03 — sessão que iniciou a operação

`02-z-firebase.js:39` acompanha gerações Auth. Em `09-contas.js:133`, cada exclusão captura UID, geração, identidade,
User e token próprio. A troca invalida somente sua finalização de interface. A instância transitória de
`09-exclusao-firebase.js` clona o User reautenticado com `updateCurrentUser`, após configurar persistência em memória.
Excluir esse User pode encerrar somente o Auth isolado. O app temporário é encerrado no finally.

Se o servidor já aceitou apagar A, a finalização continua vinculada a A, inclusive sua cópia local, e não encerra B.
A saída do Auth compartilhado só é iniciada para a sessão capturada ainda atual. O teste original retém a resposta
de commit Firestore; outro retém accounts:delete depois do sucesso no Auth. Ambos exigem UID/perfil B e estudo novo
confirmado em B. Senha, Google emulado e exclusão parcial com falha de rede também continuam na matriz Firebase.

### IA04 — mudança explícita do contrato de servidor

`web/firestore.rules:34` usa getAfter para exigir a barreira imutável ao apagar alunos/{uid}. A implementação atual
já cria contasExcluidas/{uid} e exclui o documento na mesma transação. Um DELETE direto anterior é recusado,
preservando documento e conta Auth, pois o cliente real só chama deleteUser depois da exclusão Firestore.
A atualização de versão monotônica, UID, envelope, proibição de listagem e imutabilidade do tombstone permanecem.

O teste original IA04 pressupõe DELETE antigo aceito e Auth excluído como preparação. Torná-lo verde aceitando essa
preparação seria incompatível com a correção. Ele permanece INALTERADO e obrigatório como controle negativo em a35ea9a.
O gate novo exige recusa do build anterior real, preservação Auth/documento, exclusão atual completa, tombstone,
403 para leitura/recriação e tentativas de alterar/apagar o marcador, e reconexão de sessão antiga sem recriação.
Não se declara que o cenário antigo passou no candidato sob seu contrato inseguro.

O teste Firebase antes aceitava DELETE direto do dono. A exigência foi reforçada: recusa 403 e documento preservado,
mais exclusão autorizada 200 com criação atômica da barreira. São 51 verificações, mantendo os demais critérios.
**Nenhuma regra foi publicada. A proteção do servidor real depende de adoção futura autorizada dessas regras.**
Não se presume que um token ainda válido prove existência atual da conta Auth. Exclusão Auth feita fora dos fluxos
suportados, sem tombstone, exigiria uma solução servidor adicional para cobrir qualquer cliente arbitrário.

## Matriz e CI

Ambiente local: Node 24.22.1, Java 21.0.13, Playwright 1.63.0/Chromium, Firebase SDK 12.19.0,
firebase-tools 15.35.0 e ESLint 9.17.0. CI: Node 22/Java 21 e as mesmas dependências fixadas.
Projetos demo-eear, demo-eear-f01 e demo-eear-independent-a35; fixtures novas proíbem serviços externos.

| Grupo | Resultado |
|---|---|
| Reproduções originais em a35ea9a | Quatro executáveis exit 1, com as nove negativas exatas dos achados; controles positivos preservados. |
| Gate obrigatório de bloqueadores no candidato | 8/8 grupos, 18 linhas de verificações positivas; quatro controles negativos da base reconhecidos por sintomas exatos, não por qualquer erro de preparação. |
| Firebase Emulator | **51/51**, incluindo senha, Google emulado, exclusão parcial, sessões, campos, UID, certificados e offline. |
| F01 original | **8/8**, critérios inalterados. |
| Persistência integral | **13/13 grupos, 39 verificações**, incluindo N01–N07 e reproduções anteriores F09/F13. |
| Plataforma local | **166 verificações positivas**, zero negativas. |
| F01 riscos | **6/6**, incluindo Zerar na aba única, suspensão, exclusão, contagens e escrita interrompida. |
| Diários | **8/8**, quatro abas, fechamento, crash e perda de notificações. |
| Concorrência/suspensão | Interrupção nativa transacional, retorno nos pontos de 8 s/30 min e **nove sequências**, sem perda/duplicação. Os adaptadores antigos invocam as provas transacionais correspondentes; não fingem atingir um setItem eliminado da arquitetura. |
| Browser.crash sem Web Locks | **4/4**, incluindo Zerar+estudo e segunda queda após recuperação. O mesmo grupo com Web Locks passou dentro dos 13. |
| Migração | Diários reais de **8bd32d2 e 2f6cad6 passaram**; backup importado/conta de destino/certificados em outro dispositivo também passaram. |
| Falhas de armazenamento | Quota real + abort de transação, reserva ausente, ausência de confirmação falsa e retomada dos mesmos IDs passaram. Cache restaurado e quarentena/exclusão concorrente passaram. |
| Sincronização oficial | Firebase tem prioridade, transporte antigo sem I/O, importação idempotente, desmarcação, Zerar e três dispositivos offline sem Web Locks: **5/5 exatos**. |
| Metadados no limite | Local/checkpoint/reabertura **6002**, servidor **2**, com recusa explícita; zero perda local e nenhuma confirmação remota falsa. |
| Carga | Núcleo **12.000 operações**; navegador **2.000 ações**, quatro abas, **2002/2002**, dez resets, certificado e reabertura. |
| Hosting H01–H03 | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, zero negativas. Os dois falsos aceites H02 permanecem recusados. |
| Android de homologação | Build fictício gerado (exit 0); verificador oficial recusa (exit 1), conforme exigido. |
| Builds/lint/integridade | Site e conteúdo Android passaram e servem bytes idênticos ao bundle do runtime publicado. ESLint sem avisos/erros; montagem, conteúdo e workflows conferidos. APK compilado/verificado no CI; não testado em aparelho físico local. |
| Atualização transacional | d165485 ↔ candidato: **6/6 etapas** com contagens, certificados e Zerar+estudo corretos. |
| Histórico legado, INCOMPATÍVEL | **exit 1, 159 positivas, 14 negativas**, depois TypeError em contas.js. Os módulos posteriores não são considerados executados; não se declara sucesso da sincronização legada. |

F02–F04: ciclo recusa/callback/saída e agora exclusão com respostas Firestore/Auth atrasadas. F05–F07: publicação,
privacidade/envelope e fixtures/UID. F08–F13 e N01–N07 estão cobertos pelos grupos acima, sem afirmar que os testes
provam ausência de qualquer outro defeito da categoria. A observação inconclusiva pré-crash da auditoria anterior
foi preservada no relatório original; nesta rodada o caso passou, sem redução de sua pré-condição nem de asserções.

| SHA | Site | App Android | Testes |
|---|---|---|---|
| Runtime **5a8965b8f3b1678521601526e412cfe51d1ef02e** | [success 43640169410](https://github.com/YNPHAX/EEAR/actions/runs/43640169410) | [success 43640169429](https://github.com/YNPHAX/EEAR/actions/runs/43640169429) | [success 43640169439](https://github.com/YNPHAX/EEAR/actions/runs/43640169439) |
| Testes/CI **947ea1a42b4694aee092841901a58d65323e0bbf** | [success 43641129965](https://github.com/YNPHAX/EEAR/actions/runs/43641129965) | [success 43641129992](https://github.com/YNPHAX/EEAR/actions/runs/43641129992) | [success 43641130037](https://github.com/YNPHAX/EEAR/actions/runs/43641130037), inclusive bloqueadores-auditoria obrigatório |

Jobs de publicação foram skipped; não houve deploy. O histórico legado é um job manual opcional já existente,
skipped em push e executado localmente com suas negativas. Nenhum dos gates obrigatórios foi pulado. O upload
opcional do APK foi skipped nos pushes de desenvolvimento; compilação/verificação passaram.

A árvore GitHub de 947ea1a é `01bc89badb2ef31467d73cd01535a59dbf0d3b3e`: **165 arquivos relevantes** foram
conferidos por hash de blob, sem divergências. O diff de curso/ e web/ entre runtime e commit de testes é vazio.
Os builds site/Android foram comparados byte a byte ao app.js testado; as fixtures novas fazem essa comparação.

Ocorrências de preparação, sem omissão: o primeiro teste adicional Auth tentou reutilizar o helper de formulário
anônimo numa sessão já logada, falhando antes de reter qualquer resposta. A preparação foi corrigida para troca
pelo SDK público, sem alterar os critérios. Alguns processos locais expiraram/interromperam sem exit e deixaram
dois emuladores Java órfãos; não houve OOM registrado. Logs parciais foram preservados como infra-interrompido,
os dois órfãos identificados foram encerrados e os grupos inteiros reexecutados até obter exit verificável.
Uma preparação de build foi executada no diretório anterior d165485, portanto não foi contada como build candidato;
os diretórios final-site/final-app foram gerados novamente no checkout correto e conferidos pelos hashes acima.
Esses problemas de preparação não foram contados como falhas nem aprovações do runtime.

Comandos, flags, hashes, saídas completas e todas as negativas estão em
[correcao-quatro-bloqueadores-resultados.json](correcao-quatro-bloqueadores-resultados.json) e
[correcao-quatro-bloqueadores-evidencias.txt](correcao-quatro-bloqueadores-evidencias.txt).


## Crescimento de metadados

Navegador, 2.000 ações: estado **313,236 B**, checkpoint **674,550 B**.
Após dez resets: uma marca e atividade 1, estado **353,491 B**, checkpoint **797,604 B**,
**2021 recibos**. Núcleo mínimo: 6.000 ações = **910.368 B**, primeiro ponto amostrado acima do limite;
12.000 = **1.826.371 B**. Após reset nesse ensaio mínimo, uma marca ainda deixa **2.137.837 B**.
O normalizador do núcleo é mínimo explícito; não substitui o ensaio real do navegador.

Sem compactação nesta rodada. IDs, recibos e tombstones acumulam; a recusa remota ao limite permanece explícita e
preserva o checkpoint local. O número de ações até o limite depende do conteúdo, não é uma capacidade universal.
Compactação causal exige protocolo próprio e provas antes de eliminar identidades ou barreiras.

## Reversão manual e compatibilidade

Não existe reversão automática segura para o cliente 2f6cad6. Não remover `_ops`, checkpoint ou tombstones para
permitir downgrade. Não reativar o transporte legado. Uma revisão manual exige preservar/exportar cópias de cada
origem e interromper escritores incompatíveis; a volta deve usar uma versão que respeite o protocolo e as regras.
O teste transacional d165485 ↔ candidato comprova seis etapas específicas, não a segurança de todo downgrade.
Se já houve subcontagem/duplicação em versões antigas, conservar backups e analisar suas identidades antes de
qualquer ajuste: não subtrair uma diferença genérica. A privacidade do tombstone UID/data e sua retenção também
continuam parte da decisão de produto/servidor.

## Limitações e pendências

- Regras/configuração reais não inspecionadas nem alteradas; somente projetos demo com dados fictícios.
- Safari/iOS/WebViews físicos, descarte de origem pelo SO, perda de energia e OAuth real não são cobertos pelo Chromium/emulador.
- IndexedDB indisponível continua com reserva explicitamente degradada; não oferece garantia de durabilidade em queda.
- As regras validam UID/envelope, não o JSON causal completo de um cliente autenticado arbitrariamente modificado.
- Transporte legado de sincronização continua bloqueado; suas incompatibilidades históricas são preservadas como negativas.
- É necessária auditoria independente do SHA final, incluindo o novo contrato das regras, antes de decidir homologação.

Nenhum merge, deploy, publicação de regras, Firebase real ou dado real. Branches main, Claude e auditoria permanecem intactas.

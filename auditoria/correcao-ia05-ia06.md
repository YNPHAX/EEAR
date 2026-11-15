# Correção de IA05 e IA06 — identidade da origem e contexto causal

Branch: `codex/eear-correcao-estrutural`.
Runtime: **`5b3f9d4cfec2a5597d57aab543d6358e4024a85a`**.
Candidato com fixtures finais: **`7897cdcac0ef52e0319906b786c0628503c3caec`**.
Base reprovada: `a6366a849871db3de3554f28fa1400f10aff0f0c`, runtime `5a8965b8f3b1678521601526e412cfe51d1ef02e`.
Auditoria de origem: `9a74db8cb449a72833861419ff4292a05afbae4a`, branch `auditoria/firebase-a6366a8-segunda`.
Execução: 14–15/11/2026, UTC.

**Entrega de implementação para nova auditoria. Não autoriza homologação, produção, merge, deploy ou publicação de regras.** O mesmo agente participou das implementações e auditorias anteriores; este trabalho não substitui revisão por outro autor.

**IA05 e IA06 foram corrigidas nas reproduções executadas**, incluindo a ampliação de reset offline descoberta durante esta missão. A matriz abrange 42 comandos: 39 positivos e três negativos históricos esperados. Houve uma reexecução dirigida da suíte Firebase após corrigir sua fixture de versão, sem mudança do runtime; a primeira falha está preservada. Os três workflows do candidato 7897cdc passaram. Isso comprova os cenários descritos, não ausência universal de defeitos.

## Código efetivamente executado

O SHA foi obtido diretamente do GitHub. A árvore do runtime é `5f136f3e43dd085cc45a181063879983fe103f17`; a do candidato de fixtures é `126bf8d1f064bcf295456d3991e9ca370347c6cd`.

- Bundle `curso/app.js`: blob **`2d8a0fc584e4a898347bf05d30b0415881dd3711`**, **253.286 bytes**.
- SHA-256: **`115d8af1fef7b82da3a006103512bfd6ac0897b5b43ba8eaf3b3962ed1c0cf9b`**.
- Regras: blob `c7f48ae092901bf46583915d81affa1206579d8f`, **sem alteração** em relação à auditoria anterior.
- A matriz usa checkout destacado, com **387 arquivos** conferidos por blob antes/depois de cada grupo. As fixtures comparam o bundle servido byte a byte; builds de site e conteúdo Android também.
- 7897cdc muda somente três payloads em `testes/firebase-emulador.test.js`. `curso/`, `web/`, `app/`, os outros testes e os workflows são idênticos ao runtime 5b3f9d4. A reexecução Firebase confere o segundo snapshot inteiro e o mesmo SHA-256 do bundle.
- Os sete arquivos `a636-*` continuam byte a byte iguais a 9a74db8. O relatório e as evidências anteriores foram preservados na branch de desenvolvimento, sem escrever na branch de auditoria.

## Reproduções antes/depois

Os três executáveis originais foram executados primeiro na base imutável a6366a8, com saída **1** e sintomas específicos. O gate obrigatório exige esses controles negativos e as verificações positivas no candidato; não transforma falha do candidato em aprovação.

| Caso original | a6366a8 | Runtime final |
|---|---|---|
| Mesmo backup sem `_ops`, duas importadoras e observadora com transação suspensa | **8/5** | **5/5**, tarefa e certificado preservados |
| Três importadoras e observadora | **11/5** | **5/5** |
| Dois dispositivos offline, mesmos bytes, reconexão e dispositivo novo | **8/5** na nuvem e na abertura seguinte | **5/5** em ambos |
| Levar erro posterior que observou a correção dos dois anteriores | **3/1**, local/nuvem/reabertura | **1/1**, contexto e IDs preservados |

O controle de origem identificada independente continua exigindo **2 + 5 = 7**; importar diretamente o erro observado continua exigindo **1/1**. Esses critérios não foram alterados.

**Ampliação relevante de IA05:** o candidato af32954 e sua documentação 838b0a5 tinham CI verde, mas outra intercalação ainda restaurava dados. A entra com o arquivo, Zera e confirma na nuvem; B, offline desde a base anterior, importa o mesmo arquivo pela primeira vez, depois reconecta. Na reprodução ampliada, a nuvem/reabertura voltaram a conter a tarefa e o certificado, com contagem vazia e mensagem “Progresso salvo na sua conta”. Não era infraestrutura nem atividade nova.

`testes/importacoes-reset-offline.test.js` preserva essa prova e exige ausência de tarefa, contagem, certificado, cartões e metadados de revisão apagados, além do mesmo marcador de reset confirmado por A. O candidato final mantém o estado apagado local/remoto/após reabrir. A prova anterior foi repetida no build real af32954 e continua negativa.

## IA05 — alta: identidade estável para todos os efeitos da cópia

A base antiga calculava uma diferença numérica contra o estado local e dava UUID novo a cada clique. Duas diferenças +3 viravam eventos independentes: 2 + 3 + 3 = 8. A transação preservava eventos duplicados na origem. A primeira correção dos contadores ainda deixava registros com o horário de cada importação; por isso a importação atrasada conseguia vencer um reset.

A implementação final usa os tipos de operações existentes, sem substituir a arquitetura IndexedDB:

1. `12-identidades-importacao.js` calcula **SHA-256 canônico** do conteúdo, com chaves ordenadas e sem horário/envelope de conta/assinaturas transitórias ou recibos. A mesma origem não recebe UUID novo como identidade de efeito. A implementação foi confrontada com Node crypto, Unicode, limites de bloco e um milhão de bytes.
2. Contadores inteiros históricos usam unidades `i:<SHA256>:<posição>`. A história já coberta gera tombstones por unidade, com testemunhas `@coberto:<contribuição>`. Não se omitem unidades cobertas: isso evita reaplicação quando outro dispositivo parte de uma base menor. Máximos já cobertos também recebem crédito durável, sem expansão em unidades.
3. Alterações reais desta versão recebem `e:` e não são consumidas como crédito de uma cópia antiga. Bases 2/4, arquivo 5 e uma atividade nova convergem para **6**, inclusive reconectando na ordem inversa. As contagens não são corrigidas artificialmente na projeção final.
4. Marcações, cartões, simulados e demais registros do snapshot antigo têm **ID e relógio lógico estáveis, zero**. Não criam uma edição posterior ao reset. Campos já cobertos ou bloqueados por alteração identificada não voltam no diário como novidades; isso também evita reintroduzir a base após exclusão local concorrente.
5. Certificados usam IDs estáveis de conjunto. Quando o certificado já existe, seu crédito tem tombstone e testemunha causal. O formato opcional `s.o` é validado e unido como contexto; Levar o conserva enquanto existe a contribuição que o cobre. Zerar a origem não vira ordem de apagar certificados de outra conta.
6. `cfg.fcv`, `fcAncora` e `certsZ` são progresso, não preferências comuns. Seus efeitos antigos também são históricos. Importar não chama a fixação de novas âncoras de estudo. Preferências comuns são uma escolha atual explícita; a cópia da projeção é independente para que o delta seja efetivamente persistido.
7. Recibo `cfg._importacoes[hash]` e efeitos entram na mesma transação de checkpoint e seguem em backup/Firebase. UUID do diário continua identificando a tentativa/recibo local. Confirmação durável continua dependendo de **`transaction.oncomplete`**; nenhum atalho de confirmação foi introduzido.

Arquivos principais: `curso/app/12-identidades-importacao.js`, `12-importacao-migracao.js`, `14-abas.js`, `15-diarios-pendentes.js` e `02-progresso-nuvem.js`. O módulo transacional `16-diario-duravel.js` não foi alterado nesta correção.

### Semântica de repetição, reset e origens

Repetir cópia já recebida não desfaz Zerar ou correções, inclusive em Substituir. IDs, recibos e tombstones ficam preservados. Se a origem identificada não traz operação inédita, Substituir não descarta o estudo novo do destino. Se traz operações inéditas, a projeção respeita as remoções mais novas já conhecidas.

Uma cópia antiga ainda não observada pode acrescentar história, mas não substitui registros identificados mais recentes nem remove marcações pela mera ausência. Substituir remove explicitamente os campos não selecionados, com remoções incluídas no diário, respeitando a causalidade conhecida. Exclusão de toda a cópia local é uma operação de privacidade distinta: não se promete conservar recibos de dados que o usuário mandou apagar; uma importação posterior é intenção explícita nova.

Origens identificadas independentes conservam IDs: **3 + 5 = 8**; depois de Zerar e receber atividades inéditas ficam somente essas novidades. Arquivos antigos diferentes sem proveniência podem compartilhar história; conteúdo e valores não provam independência nem permitem reconstruir sobreposição oculta. Mantém-se crédito conservador e aviso na interface. Para unir origens independentes com exatidão, exportar na versão atual com metadados; não remover `_ops` ou editar contadores manualmente.

Cópias sem metadados são limitadas a **10.000 unidades inteiras somadas por arquivo**, com recusa explícita antes da mutação e sem truncamento. Máximos e operações modernas identificadas não são expandidos. Números negativos, fracionários em contadores inteiros ou inseguros são recusados; texto/nulo em campo numérico não é atividade e não elimina os demais campos válidos.

## IA06 — média: observações causais dos erros transferidos

A transferência anterior conservava `a`, refazia `x:{}` e descartava `o`. O destino mantinha a correção `l`, mas, sem `o[erroNovo][correcao]`, interpretava o erro posterior como concorrente e reativava os dois antigos.

`opTransferencia` agora leva o contexto junto dos IDs vivos. Não transfere resets como ordens de apagar outra origem. Créditos de contadores e certificados seguem apenas com testemunha viva. O destino mantém seus tombstones. Não houve ajuste do contador final para esconder inconsistência.

Além do teste original por UI/SDK/Firestore emulados, propriedades exigem correção após Levar, repetição sem retorno de erro, erro realmente concorrente em **2/2** e erro posterior que observou a correção em **1/1**. A união numérica e `opIdsVivos` não foram reescritos; conjuntos de certificados ganharam preservação/validação do contexto opcional de crédito.

## Compatibilidade: envelope Firebase v4

O leitor atual aceita envelopes anteriores para migração e grava **v4**. Operações e IndexedDB continuam **v2**. As regras existentes recusam update com versão menor que a do documento; não houve alteração ou publicação de regra nesta rodada.

Os builds reais **a6366a8/v2 e af32954/v3** recebem aviso de versão futura, conservam seu estudo local após reabrir, recebem **403** ao tentar gravar a versão antiga e não alteram o documento v4. A barreira só vale após a gravação v4 e exige o contrato de regras correto no ambiente posteriormente autorizado.

IA04 também depende das regras: no contrafactual com as anteriores ainda é possível recriar dados após excluir Auth. O teste equivalente conserva o hash do candidato e as mesmas asserções; o original com hash antigo permanece como controle histórico. Nesta rodada todas as regras foram carregadas **somente no emulador**.

Versão do envelope é compatibilidade, não atestação de código nem defesa contra o próprio titular malicioso. Atualizar/fechar abas e clientes anteriores antes da migração. Abas antigas na mesma origem compartilham armazenamento local; não se promete convivência segura com runtimes antigos. A correção não reconstrói automaticamente dados já corrompidos por uma versão anterior; comparar backups e usar recuperação explícita.

## Testes e resultados

Ambiente local: Node 24.22.1, Java 21.0.13, Playwright 1.63.0/Chromium, SDK Firebase 12.19.0, CLI 15.35.0 e ESLint 9.17.0. CI usa Node 22. Apenas projetos `demo-*`, loopback e dados fictícios. Google foi testado no Auth emulado; OAuth real e aparelhos móveis físicos não foram usados.

| Grupo | Resultado |
|---|---|
| IA05/IA06 obrigatório | Controles a6366a8 reproduzidos; **13 executáveis positivos**, incluindo cinco adversariais originais, contrafactual de regras, reset offline, quota, crashes e versões anteriores. |
| IA01–IA04 obrigatório | Quatro controles negativos a35ea9a reproduzidos; **8 grupos positivos**: importação/exclusão com/sem Web Locks e crash, Levar/reimportar, sessões/respostas atrasadas, protocolo de exclusão e diários antigos. |
| Firebase Emulator | **53/53** após ajuste da fixture; e-mail/senha, sessão, Google emulado, UID, regras, transações, certificados, exclusão e recusas de escritores v2/v3. |
| Persistência obrigatória | **13/13 grupos**, incluindo F01 **8/8**, N01–N07, crashes repetidos, quota, recuperação, exclusões concorrentes e cache. |
| F01 riscos / F08–F09 | **6/6**: Zerar na nuvem e em aba única, suspensão, exclusão sem aviso, contagens e escrita interrompida nativa. |
| F10–F13 / diários | **8/8**; quatro abas/200 mudanças resultam em **202/202**, sem perda de notificação ou limpeza indevida. |
| Órfãos | Sem Web Locks/storage, nove sequências e retorno após 30 minutos: **11/11** local/servidor/reabertura; variante 8s no gate de persistência. |
| Crash sem Web Locks | **4/4**: marca, reset, segunda queda e ordem não booleana. |
| Sincronização Firebase | Passou; dois dispositivos, confirmação remota, perda de confirmação sem duplicação e contas isoladas. |
| Migração de diários | 8bd32d2 e 2f6cad6, três abas: **3/3/3**, nova abertura **3**. |
| Plataforma | **166 positivas, nenhuma negativa**, incluindo certificados, robustez, celular simulado, abas e quedas reais. |
| Hosting H01–H03 | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, todos positivos, inclusive falsos aceites de H02. |
| Montagem / conteúdo / workflows / lint | Passaram; app.js confere com os módulos. |
| Operações / transferência / identidade | Propriedades passaram: SHA-256, união, IDs, crédito de soma/máximo/certificado, causalidade, reset e Substituir. |
| Cache / depurador / falha combinada | Passaram; quota real de localStorage + abort IDB não confirma salvamento falso, retoma IDs e mantém **3/3** após crash. |
| Builds | Site e conteúdo Android gerados/verificados; bundles idênticos ao runtime. APK compilado/verificado no CI; publicação desativada. |
| Atualização local d165485 ↔ candidato | **6/6 etapas**, contagens/certificados preservados e Zerar+estudo **1/1**. |
| Carga / limite | 12.000 operações no núcleo, 2.000 ações em quatro abas, dez resets; recusa remota explícita sem perda local no limite. |
| Legado | Modelo fictício/bloqueio de I/O passaram; histórico, época 9 e downgrade continuam negativos abaixo. |

As 13 verificações positivas de `importacoes-regressoes.test.js` são obrigatórias no job `importacao-idempotente`; IA01–IA04 continuam no gate obrigatório separado. Não há skip/retry para encobrir falha. Os testes negativos deliberados exigem sintomas específicos nas bases rejeitadas.

Adaptações declaradas: a matriz original fixa HEAD a6366a8 e a sonda original de regras fixa o hash antigo; foram preservadas como controles históricos. A sonda equivalente do candidato confere seu hash corrente. Ao mudar o envelope, o caso futuro passou a **v5**, mantendo a proibição de sobrescrita; foram acrescentadas recusas explícitas de escritores v2 e v3. São **53** verificações Firebase, sem reduzir os critérios anteriores.

## Falhas preservadas durante a implementação

- **96fc399:** importação maliciosa era recusada integralmente por texto numa contagem e faltava o certificado esperado. Regressão de código, corrigida em 2afbaae; o teste original não foi alterado.
- **2afbaae:** Substituir criava módulos vazios e suas remoções de contadores ficavam somente em memória. Outra prova mostrou perda de atividade nova ao substituir por backup identificado já observado depois de Zerar. Corrigidos em af32954 com remoções no próprio diário e projeção que respeita tombstones. Os grupos incompletos descartados não contam como aprovação.
- **af32954/838b0a5:** a matriz e o CI verdes não cobriam a primeira importação offline tardia após reset. A prova adicional confirmou retorno de marcação/certificado. A correção foi ampliada em 46ed2fa, incluindo campos, créditos de certificados, metadados de revisão e envelope v4.
- **Intermediário v4:** a projeção compartilhava objeto com a base do delta, de modo que preferências aceitas desapareciam após checkpoint; o novo teste de nome durável confirmou. Uma propriedade das funções reais também mostrou nota já coberta voltando após cortar a base. Corrigidos em 5b3f9d4 com cópia independente, crédito de máximos e ausência de novo marcador zero de reset.
- **Fixture Firebase em 5b3f9d4:** um caso “mínimo válido” ainda enviava v3 contra documento v4 e recebeu 403 correto. O caso foi alinhado para v4 em **7897cdc**, com asserção **200 mantida**. Os negativos de campo ausente/tamanho também usam v4 para não serem recusados apenas por downgrade; suas asserções **403** continuam. Não é infraestrutura nem mudança do runtime. A execução que falhou foi preservada, e somente a suíte afetada foi repetida.

## Negativos históricos mantidos

- **Histórico legado completo:** exit **1**, **159 positivas e 14 negativas**, depois TypeError em `contas.js:39`. Grupos posteriores não aprovados.
- **Época 9 legada:** exit **1**, não estabelece a ordem confirmada B → A com B sem a alteração de A, pois o transporte está bloqueado. Não foi anunciada aprovação desse cenário.
- **Downgrade automático 2f6cad6:** exit **1**, **8 positivas e uma negativa** da união automática. Quarentena e recuperação explícita pela UI passaram, sem apagar a exigência automática que falhou.
- **Bases a35ea9a/a6366a8/af32954:** falhas deliberadamente reproduzidas nos snapshots rejeitados. Não contam como falhas do runtime final nem aprovação das versões antigas.

Não foi reativado o transporte legado. Bloqueio de I/O e contrato fictício são testes separados e passaram; não provam convergência do legado.

## Metadados e capacidade

No navegador, 2.000 ações acrescentadas à base produziram atividade **2002**, **2001** marcas, estado **321.609 B** e checkpoint **695.209 B**. Após dez resets: uma marca, atividade **1**, estado **366.169 B**, checkpoint **826.913 B**, **2021 recibos**, e reabertura sem restauração do estudo apagado. Ensaio real de quatro abas: **93,8 segundos**, com Firebase bloqueado.

No núcleo mínimo, 6.000 ações = **910.368 B**, primeiro ponto amostrado acima do limite; 12.000 = **1.826.371 B**. Após reset ainda há **2.137.837 B**. Esse ensaio, de **460 segundos**, usa normalizador mínimo explícito e não substitui o navegador.

O teste emulado do limite manteve **6002** local/checkpoint/reabertura e **2** no servidor. A nuvem recusou a gravação e o aviso foi exibido; não houve confirmação remota falsa. O resultado é preservação local com sincronização interrompida, não convergência de dados acima do limite.

Não houve compactação causal, coleta de IDs/recibos ou relaxamento do limite remoto. Unidades e créditos também custam espaço. O limite de 10.000 unidades de importação não resolve capacidade de longo prazo. Reabrir/repetir não reduz metadados nem corrige a recusa por tamanho; requer projeto separado com prova de segurança antes de uso prolongado.

## Reversão e riscos remanescentes

- **Capacidade, média:** crescimento de IDs/recibos, limite do documento e recusa de migração extensa. Preservação local no teste não significa sincronização ilimitada.
- **Downgrade/convivência, alta se ignorados:** v4 bloqueia escritores remotos anteriores, mas não corrige seus runtimes nem torna seguro compartilhar armazenamento local com eles. Exigir atualização coordenada e backup identificado antes de ensaio futuro.
- **Proveniência antiga:** sobreposição entre arquivos diferentes sem `_ops` não pode ser inferida com exatidão. Isso não desculpa IA05 dos mesmos bytes: esse caso tem identidade estável e prova exata antes/depois.
- **Armazenamento:** confirmação significa checkpoint concluído. Não cobre o usuário apagar a origem, descarte pelo SO ou falha física. Sem IndexedDB o modo de reserva permanece degradado; quota combinada exige manter a aba aberta até persistir/exportar, sem confirmação falsa nos testes.
- **Dependência das regras:** exclusão de conta e barreira de escritores foram provadas no emulador com o contrato candidato; nenhuma instalação real foi verificada.
- **Não verificado:** Safari/iOS/WebViews físicos, queda de energia real, OAuth real, usuários/configuração Firebase reais e migração em produção.

Reversão manual é distinta de capacidade. Exportar/baixar progresso identificado e preservar cópia íntegra fora da origem; fechar clientes antigos. Preferir correção para frente ou versão comprovadamente compatível com v4/checkpoint atual. **Não reduzir v nem apagar `contasExcluidas`, recibos ou tombstones para habilitar software antigo.** Após escrita de cliente pré-transacional no cache, usar recuperação explícita e revalidar tarefas, notas, contagens e certificados. As seis etapas d165485 ↔ candidato são locais/offline e não autorizam downgrade remoto de v4 para d165485. Nenhuma reversão/deploy foi feita.

## Commits e CI

| Commit | Conteúdo |
|---|---|
| `1ae85a0bd97739b1ca40f042cec654db8c7349da` | Unidades estáveis e contexto causal dos erros. |
| `896fdefbc31e3c60bcf0ae5a237be28ec90094d8` | Primeiro envelope v3, testes de armazenamento e confirmação pendente. Superado pela barreira v4. |
| `96fc399188c1d082c4ea1ede30a16c240fd2e096` | Testes originais/ampliados e gate obrigatório no CI. |
| `2afbaae08f78ee4f6e079021694b1e8c6392080e` | Campos válidos preservados na importação com contagem não numérica. |
| `af3295496fe723b95341267f8c98582bba593f48` | Remoções duráveis de Substituir e proteção de reset na repetição identificada. Candidato superado pelo teste adicional. |
| `46ed2fac26b94b66d8f2728ea681e5cce884f601` | Efeitos históricos de campos/certificados/revisão e barreira v4. |
| **`5b3f9d4cfec2a5597d57aab543d6358e4024a85a`** | **Runtime final:** preferências duráveis, crédito de notas e marcador de reset. |
| `7897cdcac0ef52e0319906b786c0628503c3caec` | Somente payloads da fixture Firebase; runtime idêntico. |

Candidato **7897cdc**, que contém exatamente o runtime 5b3f9d4 e somente a correção dos payloads da suíte Firebase:

| Workflow | Resultado |
|---|---|
| Site | [success 43662743135](https://github.com/YNPHAX/EEAR/actions/runs/43662743135) — montar passou, publicar skipped. |
| App Android | [success 43662743171](https://github.com/YNPHAX/EEAR/actions/runs/43662743171) — compilar/verificar passou, publicar skipped. |
| Testes | [success 43662743149](https://github.com/YNPHAX/EEAR/actions/runs/43662743149) — plataforma, Firebase, IA01–IA04 e importação idempotente passaram; histórico manual opcional skipped no push, negativo localmente. |

A execução [5b3f9d4 / Testes](https://github.com/YNPHAX/EEAR/actions/runs/43662098445) falhou no payload válido v3 da fixture, como documentado; o veredicto não foi atribuído a infraestrutura. Os verdes de af32954/838b0a5 foram superados pela prova adicional. O commit documental final preserva o mesmo runtime/fixtures; seu SHA e os três workflows são conferidos na entrega final.

## Evidências e reprodução

Resultados, comandos, variáveis, hashes e diferenças das fixtures: [correcao-ia05-ia06-resultados.json](correcao-ia05-ia06-resultados.json). Saídas completas, inclusive negativas e falhas intermediárias: [correcao-ia05-ia06-evidencias.txt](correcao-ia05-ia06-evidencias.txt). A documentação anterior permanece acessível no commit **838b0a5e7517f4816e74185077959b621ac44def**; ela foi superada pela prova de reset offline e não deve ser usada para aprovar af32954.

Com dependências fora do repositório, preparar checkouts imutáveis a6366a8, a35ea9a, 2f6cad6 e af32954. Definir `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `EEAR_FIREBASE_SDK`, `EEAR_FIREBASE_CLI`, `EEAR_REPO_REPROVADO_IA05`, `EEAR_REPO_REPROVADO`, `EEAR_REPO_LEGADO` e `EEAR_REPO_CLIENTE_V3`. Na raiz candidata:

```sh
node testes/importacoes-regressoes.test.js
node testes/bloqueadores-auditoria.test.js
node testes/firebase-emulador.test.js
node testes/persistencia-regressoes.test.js
node testes/plataforma.test.js
```

Sequenciar suítes que usam as mesmas portas. O histórico conserva saída negativa em runner próprio e não representa o transporte oficial. O controlador externo da rodada af32954 contou onze complementares quando havia dez; esse inventário foi corrigido antes da matriz final, sem remover testes ou reduzir asserções.

Parecer de implementação: encaminhar o **SHA exato** para auditoria independente posterior, incluindo capacidade, migração/downgrade e regras emuladas. **Não há autohomologação nem autorização de produção.** Push somente na branch de desenvolvimento; main, Claude e auditorias não foram alteradas. Nenhum merge, deploy, publicação de regras ou acesso a dados reais.

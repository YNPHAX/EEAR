# Correção direcionada IA05 e IA06

Branch: `codex/eear-correcao-estrutural`. Runtime final: **`af3295496fe723b95341267f8c98582bba593f48`**.
Base reprovada: `a6366a849871db3de3554f28fa1400f10aff0f0c`, runtime `5a8965b8f3b1678521601526e412cfe51d1ef02e`.
Origem das provas: branch `auditoria/firebase-a6366a8-segunda`, commit `9a74db8cb449a72833861419ff4292a05afbae4a`.
Execução: 14–15/11/2026, UTC.

**Entrega de implementação para nova auditoria independente. Não autoriza homologação, produção, merge, deploy ou publicação de regras.**
O mesmo agente participou das implementações e auditorias anteriores; esta entrega não substitui revisão por outro autor.

## Resultado e rastreabilidade

As reproduções IA05/IA06 passaram no runtime final, preservando IA01–IA04 e as regressões existentes. A matriz local conferiu **42 comandos**: 39 terminaram em zero; os três negativos históricos esperados são descritos separadamente abaixo. Os três workflows do runtime passaram. Isso comprova os cenários executados; não constitui homologação nem garantia universal de ausência de defeitos.

- GitHub confirma o commit e a árvore `d141e0677d33e3869ec0311545c43342f0a66bc5`.
- `curso/app.js`: blob `94155dfb45ddb93ac424b9bf0d58febcc2f06810`, 250.817 bytes.
- SHA-256 do bundle: **`4513e7687ed23de02138c6b57494b98f8bb38d666c8346f5af44d9c181c99541`**.
- Regras Firestore: blob `c7f48ae092901bf46583915d81affa1206579d8f`, idêntico ao candidato anterior.
- O snapshot destacado foi conferido por hashes de blob antes/depois de cada grupo: 386 arquivos de curso, web, testes, workflows e configurações. As fixtures comparam o bundle servido byte a byte; builds de site e conteúdo Android também.
- Os sete arquivos `a636-*` da auditoria foram copiados sem alterações, conferidos contra 9a74db8. Relatório e evidências anteriores estão preservados nesta branch.

Commits de implementação:

| Commit | Mudança |
|---|---|
| `1ae85a0bd97739b1ca40f042cec654db8c7349da` | Identidades e unidades estáveis de importação; preservação causal em Levar; testes de propriedades e explicação da semântica na interface. |
| `896fdefbc31e3c60bcf0ae5a237be28ec90094d8` | Envelope Firebase v3, bloqueio de escritor anterior no emulador, quota/abort e mensagem de importação ainda pendente. |
| `96fc399188c1d082c4ea1ede30a16c240fd2e096` | Testes adversariais originais/ampliados e gate obrigatório de CI. Não altera runtime. |
| `2afbaae08f78ee4f6e079021694b1e8c6392080e` | Regressão comprovada de importação maliciosa: campos não numéricos não descartam os demais campos válidos. Asserções originais intactas. |
| `af3295496fe723b95341267f8c98582bba593f48` | Remoções de Substituir incluídas no diário, projeção sem módulos vazios e proteção de reset na reimportação identificada; novos contraexemplos de Substituir. |

## Reproduções antes/depois

Os três executáveis originais foram executados primeiro contra o checkout imutável a6366a8 e retornaram **exit 1**.
O gate novo repete esses controles negativos e exige suas contagens específicas; não converte uma falha do candidato em sucesso.

| Reprodução original, critérios intactos | a6366a8 | af32954 |
|---|---|---|
| Mesmo backup bruto, duas importadoras + observadora com transação suspensa | 8/5, exit 1 | 5/5, sem perder tarefa/certificado |
| Mesmo backup bruto, três importadoras + observadora | 11/5, exit 1 | 5/5 |
| Dois dispositivos offline importam os mesmos bytes e reconectam; consulta servidor e dispositivo novo | 8/5 na nuvem e reabertura, exit 1 | 5/5 em ambos |
| Levar erro posterior que observou a correção dos dois anteriores | 3/1 local/remoto/reabertura, exit 1 | 1/1; IDs e observação causal preservados |

Controles adicionais: origem identificada independente 5 + base 2 mantém 7/7; importação direta do mesmo erro mantém 1/1. Não se alteraram esses valores para acomodar a implementação.

### IA05 — alta: UUID por tentativa representava a mesma origem várias vezes

Na base rejeitada, importar backup sem `_ops` calculava a diferença entre snapshot e estado local. Cada clique recebia UUID novo e produzia outra contribuição +3. A transação IndexedDB preservava corretamente os eventos que já haviam sido duplicados na origem. Serializar o checkpoint ou esperar mais não corrigia a identidade.

A correção está em `curso/app/12-identidades-importacao.js:17`, `12-importacao-migracao.js:14` e `15-diarios-pendentes.js:74`:

1. SHA-256 do conteúdo canônico, sem horário/envelope de conta/assinatura e com chaves ordenadas, identifica a mesma cópia. Não há UUID novo como identidade do efeito importado. O SHA síncrono foi confrontado com Node crypto para Unicode, limites de bloco e um milhão de bytes.
2. Cada unidade histórica tem ID `i:<SHA256>:<posição>`. Duas abas/dispositivos geram as mesmas unidades. A união existente continua associativa, comutativa e idempotente; nenhum cálculo corretivo é feito no contador final.
3. A história já observada gera tombstones de crédito por unidade, com testemunha causal `@coberto:<contribuição>`. Não se omitem unidades cobertas: isso é necessário para que importar a mesma origem a partir de bases diferentes não a reaplique depois.
4. As alterações desta versão recebem prefixo `e:` e não são consumidas como crédito histórico. Uma nova ação legítima mais a cópia antiga de cinco mantém seis, em ambas as ordens de reconexão testadas.
5. Recibo `cfg._importacoes[hash]` e efeitos seguem na mesma transação de checkpoint, no backup e no Firebase. UUID do diário continua sendo identidade da tentativa/recibo local; os efeitos têm identidade estável. A confirmação durável continua dependendo de `transaction.oncomplete`.
6. Importações com `_ops` válido unem os IDs completos. Se a projeção foi explicitamente editada, o delta é calculado contra os próprios metadados de origem e recebe identidade estável `e:editar:<hash>`. Não é reconstruído contra o contador numérico do destino.

**Política explícita:** repetir uma cópia já recebida não desfaz Zerar ou correções, inclusive em Substituir. Zerar preserva recibos, IDs e tombstones. Uma cópia ainda não observada pode ser importada após Zerar; sua primeira aplicação é explícita. Uma origem identificada repetida mantém seus tombstones; novas operações identificadas legítimas continuam entrando. Exclusão explícita de toda a cópia local é outra operação de privacidade: não se promete preservar recibos de dados que o usuário mandou apagar; uma importação posterior é nova intenção explícita.

**Distinção entre origens:** arquivos identificados independentes conservam seus IDs (3 + 5 = 8 nos testes); o mesmo arquivo antigo conserva a mesma identidade mesmo com ordenação/horário distintos. Arquivos antigos diferentes sem proveniência podem compartilhar história. Seu conteúdo não permite provar automaticamente independência nem reconstruir sobreposição oculta entre dispositivos. Mantém-se o crédito conservador da migração histórica e um aviso na importação; não se promete soma exata de origens desconhecidas. Para unir origens independentes com exatidão, exportar na versão atual com metadados. Não usar edição manual dos contadores como mecanismo de migração.

A expansão de uma cópia sem metadados é limitada a 10.000 unidades inteiras somadas por arquivo. Acima disso há recusa explícita antes de mutar estado/nome, sem truncamento: preservar o arquivo para migração assistida. Máximos não se expandem; operações modernas identificadas não sofrem essa expansão. Números negativos, fracionários em contadores inteiros ou inseguros são recusados; texto/nulo em campo numérico não é atividade e não elimina os demais campos válidos.

### IA06 — média: a transferência descartava observações de correções

Na base rejeitada, `opTransferencia` copiava `a` e refazia `x:{}`, descartando `o`. O destino conservava a correção `l`; sem a prova `o[erroNovo][correcao]`, interpretava o erro posterior como concorrente e reativava dois erros antigos. Manter só o ID do erro não bastava.

Em `curso/app/14-abas.js:80`, a transferência agora leva `o` junto das contribuições vivas. Não transporta reset da origem como ordem de apagar outra conta. Créditos de migração viajam apenas com uma testemunha ainda viva que os cobre, e recibos de importação acompanham a proveniência. O destino conserva seus tombstones. Não foram alterados `opIdsVivos`, a álgebra de união, o esquema das operações v2 ou a arquitetura transacional de IndexedDB.

Além da prova original pela interface/emulador, as propriedades exigem: correção após Levar; repetir Levar sem restaurar erro; erro realmente concorrente preservado em 2/2; erro posterior que observou a correção em 1/1; crédito transferido sem duplicação e Zerar na origem sem apagar o destino.

## Compatibilidade e barreira contra escritores anteriores

O envelope Firebase passa de v2 a **v3** (`02-z-firebase.js:62`). Operações e IndexedDB permanecem **v2**. O leitor atual aceita envelopes anteriores para migração; ao gravar passa a v3. As regras já existentes recusam update com versão menor que a do documento. O build real a6366a8 recebe aviso de versão futura, conserva seu estudo local após reabrir, recebe 403 ao tentar escrever v2 e não altera o documento v3. Não há regra nova a publicar nesta entrega.

Essa barreira exige as regras candidatas corretas no ambiente onde uma futura implantação for autorizada. IA04 também depende delas: o contrafactual com regras antigas ainda permite recriação depois de excluir Auth e deve continuar negativo. Nesta rodada todas as regras foram carregadas **somente nos emuladores**; nenhum estado/configuração real foi verificado ou alterado.

Versão do envelope é um mecanismo de compatibilidade, não atestação de código nem defesa contra o próprio titular malicioso. Abas antigas na mesma origem continuam compartilhando armazenamento local: não se garante segurança de misturar versões antigas com operações de importação novas. Fechar/atualizar os clientes antes da migração controlada; exportar antes de qualquer reversão. O teste de v3 prova a barreira remota e preservação local no caminho exercitado, não certifica todas as ações de runtime antigo.

## Matriz executada

Ambiente local: Node 24.22.1, Java 21.0.13, Playwright 1.63.0/Chromium, SDK Firebase 12.19.0, CLI 15.35.0, ESLint 9.17.0. CI usa Node 22. Somente loopback/projetos `demo-*` e dados fictícios. Google foi exercitado no Auth emulado; OAuth real e dispositivos móveis físicos não foram testados.

| Grupo obrigatório | Resultado no SHA final |
|---|---|
| IA05/IA06, gate integral | Controles a6366a8 reproduzidos; **12 executáveis positivos**, incluindo cinco adversariais originais e o contrafactual de regras. |
| IA01–IA04, gate anterior | Quatro controles negativos a35ea9a reproduzidos; **8 grupos positivos**, incluindo importação/exclusão com/sem Web Locks e crash, Levar/reimportar, retorno do cliente Firebase antigo e respostas Auth/Firestore atrasadas. |
| Firebase Emulator | **52/52**; e-mail/senha, sessão, Google emulado, UID, regras, transações, certificados, exclusão e escritor v2 recusado em documento v3. |
| Persistência obrigatória | **13/13 grupos**, incluindo F01 **8/8**, N01–N07, crashes repetidos, migração/recuperação, quota, exclusões e cache. |
| F01 riscos / F08–F09 | **6 cenários** adicionais: Zerar na nuvem e em aba única, suspensão, exclusão sem aviso, contagens exatas e escrita interrompida real. |
| F10–F13 / diários | **8 cenários**, inclusive quatro abas/200 mudanças = 202/202, retorno após suspensão, eventos perdidos e exclusão com pendência. |
| Órfãos sem Web Locks e sem storage | Nove sequências pendentes, retorno após 30 minutos: **11/11** local/servidor/reabertura. A variante de 8 segundos integra os 13 grupos de persistência. |
| Crash sem Web Locks | Marca, Zerar, segunda queda e ordem não booleana; **4/4**. |
| Sincronização oficial Firebase | Passou; confirmação remota, dispositivos offline, perda de confirmação sem duplicação, contas e sessão antiga. |
| Migração de diários antigos | 8bd32d2 e 2f6cad6, três abas: **3/3/3**, nova abertura **3**, sem modificar as origens. |
| Plataforma | **166 positivas, nenhuma negativa**; dados, simulados, certificados, robustez, celular simulado, abas, interrupção e queda real. |
| Hosting H01–H03 | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, todos passaram, inclusive falsos aceites de H02. Sem deploy/SDK real. |
| Montagem, conteúdo, workflows, lint | Todos passaram; `curso/app.js` confere com os módulos. |
| Operações, transferência e identidade | Propriedades passaram: SHA-256, união/IDs, crédito, reset, erros causais, recibos e remoção durável em Substituir. |
| Cache / depurador / falha combinada | Passaram; quota real + abort IDB não confirma salvamento falso, retoma mesmos IDs, preserva 3/3 após crash. |
| Builds | Site e conteúdo Android gerados/verificados; app.js idêntico ao publicado. APK compilado/verificado no CI. |
| Atualização local d165485 ↔ candidato | **6/6 etapas**, contagens e certificados preservados; Zerar+estudo = 1/1 nas duas versões. |
| Cargas e limite | 12.000 operações no núcleo; 2.000 ações reais em quatro abas e dez resets; recusa remota explícita no limite com checkpoint/reabertura intactos. |
| Legado | Bloqueio de I/O e contrato fictício passaram; histórico completo, época 9 e downgrade continuam **negativos**, conforme seção própria. |

O novo gate `testes/importacoes-regressoes.test.js` roda no job obrigatório `importacao-idempotente`: controles negativos a6366a8, cinco executáveis adversariais originais positivos e sete grupos complementares. IA01–IA04 continuam no gate obrigatório separado. Não há skip/retry para encobrir falhas.

Adaptações declaradas: `a636-matriz-auditoria.js` fixa HEAD a6366a8 e a sonda original de regras fixa o SHA-256 antigo; ambos foram preservados e executados como controles históricos. A sonda equivalente `importacoes-regras-dependencia.test.js` confere o hash do candidato antes de repetir as mesmas asserções. No Firebase, o documento válido agora usa envelope 3 e o contrafactual de versão futura usa 4; além das 51 verificações anteriores há nova recusa de escritor v2 (52 verificações). Critérios de acesso, exclusão, atomismo e futuro incompatível não foram reduzidos.

## Falhas durante o desenvolvimento e negativos históricos

O primeiro candidato 96fc399 falhou no CI e localmente em `robustez.js:43`: a recusa integral de texto em contagem impedia a importação dos campos válidos, faltando o certificado esperado. Essa foi uma regressão de código, não infraestrutura. Corrigida em 2afbaae, mantendo asserções do teste original e acrescentando propriedade para texto/contagem e recusa de números inválidos. Os grupos incompletos do candidato descartado foram encerrados e não são apresentados como aprovados. A matriz integral foi reiniciada sobre o snapshot final.

Em 2afbaae, o teste original de certificados ainda apontou uma negativa real: Substituir não removia todas as notas. O teste mínimo separou duas causas: projetar contador ausente criava módulos vazios; e os tombstones calculados na memória não viajavam no diário importado. O novo teste de UI comprovou a segunda causa, com contadores antigos vivos no checkpoint. A correção af32954 inclui as remoções na própria operação, sem copiar todo o estado local pré-exclusão para o diário.

Outro caso ampliado comprovou perda da atividade nova ao substituir por backup identificado já observado depois de Zerar. A repetição sem novidade agora preserva o estudo atual; quando existem operações inéditas, a projeção da origem respeita as remoções mais novas do destino. UI, reabertura e contagens exatas são obrigatórias nos testes, sem alterar o teste antigo de certificados. A matriz 2afbaae foi preservada como candidato descartado e a integral foi reiniciada em af32954.

- **Histórico legado completo:** exit 1, **159 positivas e 14 negativas**, depois TypeError em `contas.js:39`; grupos posteriores não aprovados. O transporte está deliberadamente desativado; mantiveram-se o runner e as asserções.
- **Época 9 legada:** exit 1, não consegue estabelecer a ordem confirmada B → A com B ainda sem a alteração de A, pois não há gravação legada. Não foi anunciado como cenário aprovado.
- **Downgrade para 2f6cad6:** exit 1, **8 positivas e uma negativa** da união automática. Quarentena e recuperação explícita pela interface passaram; essa prova adicional não apaga a exigência automática que falhou.
- **Controles a35ea9a/a6366a8:** negativas deliberadas nas bases rejeitadas; o gate exige sintomas e contagens específicas. Não representam falha do runtime af32954 nem aprovação dos códigos antigos.

## Reversão manual, separada da capacidade

Não há downgrade remoto automático para escritores v1/v2 após v3. Antes de qualquer reversão autorizada, fechar as abas antigas, exportar/baixar o progresso identificado e preservar uma cópia íntegra fora da origem, sem editar `_ops`, recibos ou tombstones. Preferir correção para frente ou uma versão comprovadamente compatível com envelope v3 e o checkpoint atual. Não reduzir a versão do documento nem apagar `contasExcluidas` para habilitar um cliente antigo. Se um cliente pré-transacional já escreveu no cache, usar a recuperação explícita oferecida pela versão atual e revalidar tarefas, contagens e certificados. A prova de seis etapas d165485 ↔ candidato é local/offline e não autoriza reversão do transporte remoto v3 para d165485. Nenhuma operação de reversão/deploy foi feita.

## Metadados e riscos remanescentes

No navegador, 2.000 ações acrescentadas à base produziram atividade **2002**, **2001** marcas, estado **321.765 B** e checkpoint **695.521 B**. Após dez resets: uma marca, atividade **1**, estado **366.173 B**, checkpoint **826.921 B**, **2021 recibos**; reabertura sem restauração do estudo apagado. Ensaio real: 96 segundos, quatro abas, sem transporte Firebase.

No núcleo mínimo, 6.000 ações = **910.368 B**, primeiro ponto amostrado acima do limite; 12.000 = **1.826.371 B**. Após reset ainda há **2.137.837 B**. Esse ensaio, de 449 segundos, usa normalizador mínimo explícito e não substitui o navegador.

O teste emulado do limite manteve **6002** local/checkpoint/reabertura e **2** no servidor. A interface avisou que a nuvem recusou a gravação; não houve confirmação remota falsa. **Reabrir ou repetir não reduz metadados nem resolve essa recusa de capacidade.**

Não houve compactação causal, remoção de recibos ou tombstones, nem relaxamento do limite remoto. A identidade por unidade também tem custo de espaço; a recusa explícita acima de 10.000 unidades não resolve a capacidade de longo prazo. O limite remoto interrompe sincronização e exige exportação/ação explícita, mantendo checkpoint e estudo local no ensaio. Precisamos de projeto separado de capacidade com prova de segurança antes de uso prolongado.

Riscos e limites que permanecem:

- **Capacidade, média:** crescimento de IDs/recibos e limite do documento Firestore; migração histórica extensa pode ser recusada. Não apagar metadados manualmente nem prometer retenção infinita.
- **Downgrade/convivência de versões, alta se ignorada:** v3 bloqueia escritor remoto anterior, mas não corrige runtime antigo nem torna seguro compartilhar armazenamento local com ele. Reversão para versão pré-transacional continua exigindo recuperação explícita. Atualização coordenada e backups são pré-condições de um ensaio futuro.
- **Proveniência histórica, limitação conhecida:** dois snapshots antigos diferentes podem sobrepor estudo; a origem real não pode ser inferida só de valores e conteúdo. Essa ambiguidade não é usada para desculpar o IA05 dos mesmos bytes, que tem prova exata antes/depois.
- **Armazenamento do navegador:** confirmação é checkpoint concluído, não garantia contra o usuário apagar a origem, descarte do SO ou falha física. Sem IndexedDB o modo de reserva continua degradado; quota combinada exige manter a aba aberta até persistência/exportação, sem confirmação falsa nos testes.
- **Dependência das regras:** exclusão de conta e bloqueio de escritores anteriores foram provados no emulador com o contrato candidato; sem esse contrato no ambiente autorizado, não presumir as garantias.
- **Não verificado:** Safari/iOS/WebViews físicos, perda real de energia, OAuth real, configuração real Firebase e migração de usuários reais. Nenhum desses itens foi exercitado sob esta autorização.

O controlador externo inicialmente anunciou 11 comandos complementares; o inventário efetivo tem dez (builds, migração e históricos). A recontagem confere cada comando e sua saída esperada; nenhuma suíte, cenário ou asserção do aplicativo foi removido. O erro de inventário do controlador fica separado de falhas de runtime.

## CI e procedimento para repetir

Workflow do **runtime af32954**, conferido diretamente pelo SHA no GitHub:

| Workflow | Resultado e evidência |
|---|---|
| Site | [success 43657768567](https://github.com/YNPHAX/EEAR/actions/runs/43657768567) — montar passou; publicar skipped. |
| App Android | [success 43657768724](https://github.com/YNPHAX/EEAR/actions/runs/43657768724) — compilação/verificação do APK passaram; publicar skipped. |
| Testes | [success 43657768542](https://github.com/YNPHAX/EEAR/actions/runs/43657768542) — plataforma, Firebase, IA01–IA04 e importação idempotente passaram. Histórico manual opcional skipped no push; executado e negativo localmente acima. |

CI intermediário preservado: [96fc399](https://github.com/YNPHAX/EEAR/actions/runs/43655637045) falhou na robustez; [2afbaae](https://github.com/YNPHAX/EEAR/actions/runs/43656354048) falhou na substituição das notas. Não são infraestrutura nem aprovações por herança. A entrega documental posterior mantém o mesmo runtime; seu SHA e a verificação dos três workflows são informados na mensagem final.

Dependências ficam fora do repositório. Com os checkouts imutáveis a6366a8, a35ea9a e 2f6cad6 disponíveis, definir `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `EEAR_FIREBASE_SDK`, `EEAR_FIREBASE_CLI`, `EEAR_REPO_REPROVADO_IA05`, `EEAR_REPO_REPROVADO` e `EEAR_REPO_LEGADO`. Então executar:

```sh
node testes/importacoes-regressoes.test.js
node testes/bloqueadores-auditoria.test.js
node testes/firebase-emulador.test.js
node testes/persistencia-regressoes.test.js
node testes/plataforma.test.js
```

Os testes Firebase que usam as mesmas portas devem ser sequenciais. Comandos, variáveis, hashes e resultados dos demais grupos estão em `correcao-ia05-ia06-resultados.json`; saídas completas em `correcao-ia05-ia06-evidencias.txt`. Histórico antigo permanece no runner próprio e retorna falha, não aprovação Firebase.

Parecer de implementação: encaminhar o SHA exato e suas evidências para auditoria independente posterior, incluindo os limites de capacidade/migração e as regras emuladas. **Não há autohomologação nem autorização de produção.** Main, Claude e branches de auditoria não foram alteradas. Push somente na branch de desenvolvimento; nenhum merge, deploy, publicação de regras ou acesso a dados reais.

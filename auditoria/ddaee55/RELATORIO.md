# EEAR — auditoria pós-correção IA07/IA08

**Veredito: REPROVADO PARA HOMOLOGAÇÃO CONTROLADA.** O candidato corrige as reproduções originais de IA07 e IA08 e a intercalação antiga de cache, mas esta auditoria confirmou dois problemas de integridade: uma regressão ao voltar à mesma conta com cargas pendentes e a supressão silenciosa de um simulado inédito na migração de tombstones ambíguos. A identidade visual tem parecer separado: **PENDENTE / NÃO APROVADA**.

Data: 19/11/2026, America/Sao_Paulo. Nenhuma autorização de produção, merge, deploy ou publicação de regras é emitida.

## 1. Identidade e integridade

| Identificador | Verificação independente |
|---|---|
| Repositório | `YNPHAX/EEAR`, obtido pelo conector GitHub e clone público completo |
| Branch candidata | `codex/eear-correcao-estrutural`, apontando para o candidato ao obter as refs |
| Commit candidato | `ddaee558fde26e437696f7b17862b3df1ee7353f` |
| Árvore Git candidata | `b75d17dfd5a145b30754f25bf8dc4f3c3d54d582` |
| Bundle | `curso/app.js`, 261.977 bytes, blob Git `0b95062994b3349ff51c31f557d7a228c116d53d` |
| SHA-256 do bundle | `e29b24880ea17f7973ca9bbb82694bee2d1c88bae7df684a15fcc3d6ab326a4d`, igual ao informado |
| Regras | SHA-256 `05729a5909744aaf423501e9fdcd699a9c28a973befb1c22a8a9034d29eeda03` |
| Runtime anteriormente reprovado | `5b3f9d4cfec2a5597d57aab543d6358e4024a85a` |
| Base dos controles originais | `c186008012ba12709fc07c08e36532471a894a8c`; `curso/`, `web/` e `app/` são idênticos aos de `5b3f9d4` |
| Auditoria anterior | `80ec60b9cf3162aff3c141c4af80653e418efe51`, ref `auditoria/firebase-c186008-propriedades` |
| Branch desta entrega | `auditoria/ia07-ia08-ddaee55-independente`, derivada exclusivamente do candidato |

`evidencias/candidato-todos-arquivos.json` confere **475 arquivos rastreados**, incluindo workflows ocultos: o hash Git de cada arquivo coincide com o blob da árvore candidata. `git fsck --full --no-reflogs` não apontou inconsistências. A montagem dos módulos coincide com o bundle. As fixtures servem esse bundle sem transformá-lo; alteram apenas configuração de teste no HTML temporário.

Os seis arquivos c186 originais coincidem byte a byte com os hashes fixados e com a auditoria anterior. Os **22 artefatos** do manifesto anterior também conferem em tamanho e SHA-256. Relatórios anteriores e CI foram tratados como histórico a verificar, não como substitutos das novas execuções. As evidências distinguem explicitamente o SHA antigo do candidato.

## 2. Metodologia e independência

Nesta sessão não houve implementação nem correção do runtime. Os novos testes e relatórios ficam somente nesta branch. Isso descreve a separação operacional desta rodada; não é certificação de independência organizacional ou revisão humana externa.

Foram examinados AGENTS/CLAUDE, workflows, scripts de build, os deltas c186008 → candidato, módulos de identidade/importação/reset/IndexedDB/Firebase, relatório anterior e relatórios de IA01–IA06, persistência, carga e transporte legado. O acervo histórico teve varredura automatizada integral: 76 arquivos / 5.354.412 bytes, hashes, parsing dos JSONs e 458 linhas com marcadores negativos, em `acervo-historico-catalogo.json`. **Não certifico leitura semântica integral de todos os logs e documentos históricos**, inclusive relatórios de conteúdo/monetização sem relação direta com estas correções. Essa limitação não altera os contraexemplos confirmados e impede alegar uma auditoria exaustiva de todo o repositório.

Os testes usam contas `@exemplo.test`, projetos Firebase `demo-*` e armazenamento nativo do Chromium. As fixtures interceptam o SDK para servi-lo do pacote npm e bloqueiam transporte real nos ensaios adversariais. Nenhum Firebase de produção, dado real ou regra publicada foi utilizado. Builds e experimentos Android ocorreram numa cópia obtida por `git archive` do SHA exato.

Ambiente principal: Node 24.22.1, Java 21.0.13, Playwright 1.63.0 / Chromium 153.0.8010.12, Firebase SDK 12.19.0, firebase-tools 15.35.0 e ESLint 9.17.0. Para compilar Android foi necessário um JDK completo Temurin 21.0.13.1; o Java inicialmente disponível era apenas runtime. O CI usa Node 22, diferença explicitamente conservada.

As propriedades próprias extraem as funções do bundle conferido e usam um normalizador mínimo declarado. O oráculo de eventos é um conjunto independente de adições/remoções; esse ensaio não prova durabilidade. As confirmações de impacto utilizam UI, exportação, IndexedDB nativo e/ou Firestore emulado. Instrumentação de callback retém exclusivamente entregas de transações já concluídas, sem manter o banco bloqueado.

## 3. Achados confirmados

### A01 — Alta — carga obsoleta libera a conta atual antes da reconciliação

**Localização:** [`15-diarios-pendentes.js:73–82`](https://github.com/YNPHAX/EEAR/blob/ddaee558fde26e437696f7b17862b3df1ee7353f/curso/app/15-diarios-pendentes.js#L73), em combinação com o novo filtro de `receberDuravel`, linhas 29–31.

O callback de abertura confere apenas `id === identidade`. Depois de A → B → A, a primeira carga de A tem o mesmo ID da atual, mas outra Promise de carga. O filtro novo corretamente recusa seu snapshot em `receberDuravel`; entretanto, o chamador continua e define `gravouLocal=true`, `loc.carregado=true` e `armazenamento='pronto'`. A proteção precisa abranger a conclusão inteira da carga, inclusive os efeitos após `await cachear`, não apenas a aplicação do snapshot.

Reprodução determinística em `teste-carga-obsoleta.js`:

1. A tem uma marca confirmada, `T:must-reset`, no checkpoint nativo. B é uma conta fictícia distinta.
2. Remover somente o cache opcional de A, conservando IndexedDB. Isso representa cache ausente, não ausência de progresso.
3. Iniciar A, reter sua resposta de `oncomplete`; entrar em B e retornar a A; reter também a resposta da carga atual.
4. Liberar apenas a primeira resposta. A carga atual continua retida, mas a UI fica pronta, exporta `feito:{}` e informa **“Progresso salvo neste aparelho.”** O checkpoint ainda contém `T:must-reset`.
5. A UI aceita Zerar. Depois de liberar as demais respostas, a marca reaparece no estado ativo.

O teste final comprova `TransactionInactiveError` em todos os pontos de retenção, usando a referência ao object store capturada durante a transação. Não bloqueia a fila IDB nem inventa um checkpoint. A evidência guarda exportação, checkpoint anterior ao reset, estado aceito, estado final e sequência de entregas.

**Comparação no runtime 5b3f9d4, com o mesmo experimento:** a abertura prematura já existia, mas a resposta antiga ainda trazia a marca à UI, e Zerar a removia; estado final vazio. No candidato, o snapshot é recusado sem impedir a liberação da interface: UI vazia e marca final presente. Portanto a manifestação de reset/exportação é uma **regressão comprovada da proteção parcial introduzida em 8ec8c50**, sem afirmar que o runtime antigo era seguro em outras intercalações.

Impacto sob a intercalação testada: exportação incompleta apresentada como salva e reset executado sobre uma projeção não reconciliada. A falha e sua regressão foram reproduzidas com entrega de callbacks controlada; **não foi reproduzida sem instrumentação essa ordem exata de entrega no Chromium, nem medida sua frequência em campo**. A probabilidade natural permanece indeterminada. A exploração pressupõe acesso às sessões no mesmo aparelho e ocorrência/controle dessa ordenação. Não foi demonstrado acesso entre UIDs não autorizados nem perda do checkpoint original. A classificação alta corresponde ao impacto e à lacuna de validação da carga; não significa um ataque de campo comprovado.

Evidência: `evidencias/independente/carga-obsoleta.json`, `evidencias/runtime-5b/carga-obsoleta.json`, logs `auditor-carga-obsoleta-recuperado` e `runtime-5b-carga-obsoleta`. Saída 1 representa o contraexemplo, não aprovação. As tentativas anteriores e a asserção inicial de instrumentação incorreta estão preservadas.

Encaminhamento sem implementação: vincular todos os efeitos da carga à instância/geração capturada, manter a barreira de mutação até a reconciliação atual e repetir o experimento com exportação, reset e reentrada na mesma conta.

### A02 — Alta, probabilidade natural baixa — tombstone ambíguo suprime origem inédita

**Localização:** [`14-abas.js:50–52`](https://github.com/YNPHAX/EEAR/blob/ddaee558fde26e437696f7b17862b3df1ee7353f/curso/app/14-abas.js#L50) e [`12-identidades-importacao.js:47`](https://github.com/YNPHAX/EEAR/blob/ddaee558fde26e437696f7b17862b3df1ee7353f/curso/app/12-identidades-importacao.js#L47).

Sem o valor apagado, um caminho antigo não revela se sua identidade era explícita ou derivada de JSON. A migração cria barreiras nas duas interpretações. Isso impede certas ressurreições, mas também passa a apagar/suprimir uma interpretação que nunca foi observada. O risco é declarado nas instruções do implementador; esta auditoria demonstrou seu efeito pela interface e servidor.

Reprodução em `teste-tombstone.js`:

1. Executar o bundle v4 real de c186008. Importar um simulado com ID explícito opaco igual a `JSON.stringify(outraOrigem)+'#0'`. O simulado explícito e a outra origem têm datas, notas e duração diferentes.
2. Zerar esse registro explícito e confirmar. O checkpoint guarda o tombstone antigo sem valor/proveniência.
3. Atualizar o mesmo perfil para v6 e fazer a **primeira** importação da outra origem, um simulado legado sem ID que nunca esteve na conta.
4. Esperado: um registro inédito. Observado: **zero** no servidor e após reabrir, **zero cópias em quarentena** e mensagem **“Progresso salvo na sua conta.”**

A importação recebe recibo, mas o efeito do registro é suprimido pela barreira sintetizada. Não é a simples repetição de um backup já zerado, nem uma colisão SHA-256: trata-se de duas identidades de origens distintas cujo texto antigo coincide. O arquivo de origem externo ainda existe no experimento; não há alegação de destruição de todas as cópias.

Impacto alto na integridade do histórico ativo; colisão natural pouco provável, porém construção deliberada determinística com dados de uma conta autorizada. Não há violação entre contas. A ambiguidade é inerente ao formato antigo; a escolha de resolvê-la destrutivamente e sem recuperação explícita é a conduta reprovada. **Não foi demonstrado esse efeito numa migração sem tombstone ambíguo.**

Evidência: `evidencias/independente/tombstone-ambiguo.json` e log `auditor-tombstone`, com simulado original, origem inédita, tombstone v4, migração, recibos, estado remoto e reabertura.

Encaminhamento sem implementação: estabelecer tratamento explícito de ambiguidade que preserve os dados de entrada e permita atribuição/recuperação; provar tanto não ressurreição quanto não supressão de origens legítimas antes de migrar automaticamente esse caso.

## 4. IA07 — resultado das propriedades e migração

As reproduções originais de duplicação por ordem de propriedades e retorno após Zerar ocorreram em c186008 e novamente no **SHA 5b3f9d4 solicitado**. No candidato, as propriedades correspondentes e os ensaios de navegador passaram: mesmo conteúdo canônico mantém um simulado e a importação atrasada da mesma origem não o restaura após reset.

Verificações positivas específicas: permutação recursiva de propriedades; objetos aninhados; arrays cuja ordem permanece significativa; multiplicidade de simulados idênticos em posições distintas; IDs explícitos opacos; separação entre `id` e `_sid` com o mesmo texto; campos JSON próprios `__proto__` preservados como dados, sem poluição de protótipo; IDs reservados recusados; importação repetida/bruta/identificada; ordem cronológica diferente da origem; aliases antigos; migração sucessiva e escritores v4/v5 recusados após v6.

O ensaio próprio acrescenta **192 sementes**, 192 comparações canônicas e 192 diferenças de ordenação de arrays. O gate existente executou 512 sementes, 30.720 ações, 1.536 propriedades algébricas e 1.024 casos canônicos. Não somo essas contagens como cobertura universal.

`teste-migracao-crash.js` prepara o checkpoint com o bundle antigo real, aborta as escritas nativas durante a migração candidata, exige igualdade integral com o checkpoint anterior, derruba a página e reabre. Dois registros e sua atividade sobrevivem; `_sid` fica persistido e a segunda migração conserva os mesmos metadados. Nenhum teste existente foi alterado.

**Conclusão IA07:** a falha original de canonicalização foi corrigida nos casos reproduzidos. A segurança integral da migração continua **reprovada por A02**; não basta deduplicar a apresentação ou passar nos aliases esperados.

## 5. IA08 — marcadores e remoção observada de erros

O candidato admite ausência/zero legado e números inteiros de data até **253402300799999**. Rejeita `1e30`, `MAX_SAFE_INTEGER-1`, `MAX_SAFE_INTEGER`, `MAX_SAFE_INTEGER+1`, valores acima do teto de data, negativos, fracionários, strings numéricas, null, objetos, arrays, NaN e infinitos. Estar abaixo de MAX_SAFE_INTEGER não basta: o contrato é de data, com teto menor. `-0` tem a mesma semântica JSON de zero.

O gate testou JSON bruto inválido, overflow textual `1e309`, importação, cache sob quota real, checkpoint antigo e documento remoto incompatível. As recusas preservaram as entradas integrais em recuperação/quarentena e não substituíram o checkpoint válido nos cenários previstos. O aviso específico de pausa remota do commit final também foi exercitado no próprio SHA ddaee55.

Reset da UI usa uma ordem explícita de remoção observada; não depende de avançar um número importado. A data máxima pode permanecer igual entre resets sem tornar o reset ineficaz. Erros novos concorrentes sobrevivem, os observados são removidos e os ocultados por correções anteriores também são abrangidos. O caso antigo `1e30`, erros históricos 2 + erro novo 1, ficou em **3** no runtime reprovado; os controles válidos do candidato ficaram em **1**, inclusive após crash/reabertura.

O oráculo próprio gerou **18.432 ações em oito réplicas**, com incrementos de erros, resets sucessivos, partições, entregas repetidas e uniões em ordens diferentes. Os conjuntos de eventos vivos coincidiram com a projeção; 18 casos de marcadores também passaram. Isso não cobre qualquer JSON ou sequência possível.

**Conclusão IA08:** as causas originais de validação e remoção observada passaram nas novas execuções. A01 ainda permite executar o comando Zerar antes de carregar o contexto correto; portanto o fluxo completo de reset não recebe aprovação global.

## 6. Crash, callbacks e classificação causal

| Observação | Classificação |
|---|---|
| Antigo oncomplete de cache após reset/estudo | Falha reproduzida em c186008 e 5b3f9d4: numa janela, exportação 0, checkpoint 1, reabertura 1; indicador dizia salvo |
| Mesma intercalação no candidato | Corrigida nos dois pontos testados: UI/exportação/checkpoint/reabertura preservados |
| Falha espontânea histórica de importacoes-crash | Não apagada. O evento original não tem trace suficiente para atribuir sua causa a esse callback com certeza |
| Causa do experimento antigo controlado | Comprovada: resposta de snapshot anterior sobrepõe a projeção corrente depois de o commit novo concluir |
| Migração interrompida por abort + Page.crash | Checkpoint original preservado e retomada idempotente, no ensaio próprio |
| Duas quedas Browser.crash do teste original no candidato | Passaram no gate IA07/IA08, com recibos, reservas, reset e novo estudo |
| A → B → A com duas cargas pendentes | Nova falha A01, reproduzida e comparada com o runtime antigo |

IndexedDB, exportação e cache são fotografados separadamente. Reserva não é commit; cache ausente ou atrasado não prova perda durável. Também não se presume que passar em crash prove resistência a queda de energia, descarte pelo sistema operacional ou falha física de armazenamento.

## 7. Capacidade, versões e demais riscos residuais

| Risco | Gravidade | Probabilidade qualitativa / impacto / exploração |
|---|---|---|
| A01, carga antiga da mesma conta | Alta, impacto condicionado | Probabilidade natural indeterminada; projeção incompleta e reset incompleto sob a ordenação controlada; sem bypass de UID |
| A02, tombstone sem proveniência | Alta | Baixa naturalmente, determinística quando construída; suprime origem inédita sem quarentena |
| Crescimento sem compactação causal | Média | Cresce com uso prolongado; sincronização para, estudo fica só no aparelho; não exige atacante |
| Limite remoto e avisos de retomada | Média | Ao atingir capacidade, reabrir não reduz metadados; perda do aparelho antes da recuperação pode perder a única cópia nova |
| Compatibilidade de clientes | Média | Clientes v1–v5 não escrevem sobre v6 sob as regras testadas; estudo local antigo exige atualização/importação explícita; downgrade antigo não é transparente |
| Regras efetivamente instaladas | Dependência operacional | Não inspecionadas por restrição do usuário. As garantias de servidor são condicionadas às regras candidatas, testadas em emulador |
| APIs ausentes, quota e abort | Média | Reserva degradada não equivale a checkpoint; ensaios existentes exigem aviso/recuperação, sem promessa de durabilidade física |
| Dependências de ferramentas Android | Baixa no escopo comprovado | npm audit registra três entradas moderadas transitivas, ligadas a glob/minimatch/rimraf; exploração no fluxo real não demonstrada, não são três falhas independentes do APK |

A carga complementar foi refeita no **bundle final e29b…**, sem aceitar resultados de outro SHA. Núcleo: 12.000 operações; primeiro ponto amostrado acima do limite, 6.000 ações / **910.368 bytes**; 12.000 / **1.826.371 bytes**; reset + um novo estudo / **2.137.837 bytes**. É álgebra com normalizador mínimo, não 12.000 cliques duráveis.

Navegador: quatro abas, **2.000 marcações**, contagem exata **2.002**, certificado, dez resets e reabertura. Depois dos resets: atividade 1, uma marca, estado **366.169 bytes**, metadados **365.655 bytes**, checkpoint **826.913 bytes**, 2.021 recibos. Reset não compacta a história causal.

O teste próprio de fronteira demonstrou que `dados.size() < 900000` mede caracteres, e não um teto universal de 900 KB: ASCII 899.999 aceita; 900.000 e 900.001 recebem 403. Texto com 900.000 bytes UTF-8 / 450.000 caracteres é aceito. 1.040.000 bytes / 520.000 caracteres também é aceito; 1.060.000 bytes recebe **400 INVALID_ARGUMENT**, pelo limite de documento em bytes. As duas restrições precisam constar do planejamento de capacidade. O oráculo inicial assumia bytes e falhou; sua fonte/saída foram preservadas e a expectativa corrigida apenas no teste novo do auditor.

Não foi identificada colisão criptográfica de SHA-256, invasão entre UIDs ou perda silenciosa no crescimento normal testado. A02 é uma supressão silenciosa específica. A barreira de tamanho preserva o documento remoto anterior; a prova de preservação local ao importar a amostra excedente está discriminada na matriz final.

## 8. Testes executados e resultados

A tabela completa por comando, código de saída, tempo, variáveis e hash antes/depois está em **[MATRIZ.md](MATRIZ.md)** e nos `*.result.json`. Falhas de produto, controles negativos esperados, falhas de preparação e limitações externas são classes separadas. Nenhuma saída negativa foi removida.

- Montagem, autoteste de publicação (193 casos), integridade, workflows, Hosting local H01–H03, lint, builds web/conteúdo Android e barreiras passaram.
- Plataforma local completa passou; não equivale à aprovação do transporte legado desativado.
- Gate IA07/IA08: três controles negativos antigos reconhecidos pelos sintomas e **12 grupos candidatos aprovados**, no SHA final.
- Sementes, migração/crash e fronteiras próprias: resultados estruturados nas evidências; A01 e A02 retornam 1 de propósito quando a propriedade é violada, sem reinterpretar o produto como aprovado.
- Firebase local: **51 verificações positivas**; acesso a `apis.google.com` bloqueou a janela Google, deixando os dois casos de login/reautenticação sem execução positiva. Com `CI=true`, o comando retorna 1; não foi usado o modo que trataria indisponibilidade como simples skip para obter verde.
- CI do SHA exato tem Testes, Site e App Android com `success`; logs completos foram obtidos diretamente do GitHub. Os logs de CI cobrem os 53 casos Firebase e não incluem os novos contraexemplos desta auditoria.
- IA01–IA06, F01 8/8, persistência 13/13 e complementos: consultar a matriz final, que registra a repetição integral após a indisponibilidade de disco, sem herdar resultados de outro commit.
- Typecheck: **não existe no projeto**, que não usa TypeScript; não foi inventado um comando.

CI consultado, sem disparar workflows: [Testes 44453312002](https://github.com/YNPHAX/EEAR/actions/runs/44453312002), [Site 44453311993](https://github.com/YNPHAX/EEAR/actions/runs/44453311993), [Android 44453312000](https://github.com/YNPHAX/EEAR/actions/runs/44453312000). Publicações foram skipped. Branches `auditoria/**` não herdam esses resultados nem acionam os filtros de push existentes.

## 9. Android, Gradle e reprodutibilidade

O conteúdo do APK foi gerado a partir do archive exato do candidato. As duas compilações locais, incluindo a segunda com `clean assembleDebug`, passaram e produziram **o mesmo APK de 13.528.629 bytes**:

`3639517e4a857ff38ed238828dfb20684df8ac8f1a254eb92d1567f5d3815e3d`

O `assets/public/app.js` dos dois APKs tem o SHA-256 exato informado pelo usuário. Ambos passaram na barreira de publicação de APK. O APK não é publicado nesta branch; são publicados os hashes, logs e resultado da inspeção ZIP como evidência.

Falhas locais preservadas: conexão direta recusada ao baixar Gradle; depois falta de `JAVA_COMPILER` no Java inicial; depois cadeia TLS do proxy não reconhecida pelo JDK baixado. Configurar proxy explícito, JDK completo e o truststore já instalado no ambiente resolveu sem alterar wrapper, dependências, runtime ou testes. No SHA final, o CI também compila. Isso sustenta a classificação dessas falhas **observadas aqui** como infraestrutura do executor; não prova a causa de qualquer log antigo não identificado. Não há evidência de dependência Gradle inexistente no candidato atual.

Ainda há dependência de downloads externos e debug keystore do ambiente; igualdade em duas compilações deste host não certifica reprodução bit a bit em qualquer host. O wrapper gerado fixa a versão da distribuição, mas não contém checksum de distribuição. Não foi alterado nesta auditoria.

**Primeira e segunda abertura nativas: NÃO TESTADAS.** Não havia dispositivo/AVD nem KVM disponíveis. A primeira tentativa de preparar a imagem ultrapassou o espaço antes de chegar à instalação. Após liberar os caches das compilações já concluídas, uma segunda tentativa verificou os tamanhos do ZIP antes de extrair: a imagem API 32 exige 4.471.331.979 bytes descompactada, diante de 4.187.467.776 bytes livres durante a preparação, além das necessidades de execução/AVD. A guarda recusou a extração antes de escrever. Os arquivos temporários foram removidos, sem excluir evidências. Compilar duas vezes não foi apresentado como executar o APK duas vezes. Essa evidência continua faltando; ver `avd-preparacao-resultado.json` e `android-emulator-tools.json`.

## 10. Identidade visual — parecer separado

**PENDENTE / NÃO APROVADA para a identidade oficial solicitada.** `curso/index.html:8–24` usa bege `#F3F1EC`, branco `#FFFFFF`, preto `#0C0C0C` e vermelho primário `#C8102E`. Não foram encontrados os tokens oficiais `#0F172A`, `#F8FAFC`, `#B89B5E` nas fontes candidatas inspecionadas. Vermelho aparece como marca/ação principal, além do feedback. Há variáveis CSS, mas também cores repetidas em páginas legais, certificados e configuração Android.

Capturas reais em 320×568, 390×844 e 1440×900 não mostraram overflow horizontal na tela inicial. Os links amostrados tiveram contraste entre **5,21:1 e 6,02:1**, acima de 4,5:1. Isso é uma verificação parcial, **não certificação WCAG 2.2 AA da aplicação inteira**, nem prova de responsividade em WebView Android real. As capturas iniciais com troca de tema ainda sujeita à inicialização foram conservadas separadamente; a execução final estabiliza a carga e o tema antes de capturar.

Não foram implementadas alterações visuais. A reprovação técnica decorre de A01/A02, independentemente desta pendência.

## 11. Limitações, incidentes do ensaio e evidências faltantes

- Nenhum dispositivo Android foi executado; faltam primeira/segunda abertura, persistência e reset em WebView nativo. Safari/iOS e perda física de energia também não foram testados.
- Os dois casos Google da suíte local ficaram bloqueados pela rede. Há evidência de CI no SHA exato, claramente separada da execução local.
- Não foram inspecionadas configurações/regras efetivamente instaladas em Firebase real, por restrição expressa. Isso não é autorização para acessá-las numa continuação.
- A ocorrência espontânea histórica de crash não tem captura suficiente para comprovar que sua causa foi o callback reproduzido; a correção desse callback não encerra todas as hipóteses.
- Não houve leitura semântica integral de todos os arquivos históricos do repositório. Os relatórios centrais, deltas, instruções e manifests foram examinados como descrito; os demais históricos estão catalogados, sem declaração de revisão exaustiva.
- A preparação de AVD causou ENOSPC temporário. As suítes atingidas têm saídas negativas preservadas e novas execuções completas identificadas como `ambiente-recuperado`; resultados obtidos antes da falha não foram somados para fabricar 13/13. Um primeiro ensaio de limite também encontrou porta ocupada; a repetição final ocorre depois das suítes que usam a mesma fixture.
- A primeira asserção de instrumentação da nova corrida esperava TransactionInactiveError ao pedir `objectStore` de uma transação encerrada e recebeu InvalidStateError. A reprodução comportamental ocorreu, mas essa tentativa não foi usada como prova final de instrumentação. A versão final captura o object store durante a transação e confirma TransactionInactiveError ao tentar `get` depois do commit; tentativas e saídas anteriores permanecem disponíveis.

Para reconsiderar a homologação: eliminar as causas de A01/A02 em outra branch, repetir estes contraexemplos exigindo os resultados corretos no novo SHA final, repetir as regressões obrigatórias sem relaxar asserções, completar a evidência nativa Android e registrar os limites operacionais do ensaio. A pendência visual deve manter seu próprio parecer. Estas são condições de nova avaliação, não alterações executadas.

## 12. Artefatos e reprodução

Esta pasta contém exclusivamente relatório, novos testes, matriz e evidências. `evidencias/manifesto.json` fornece hashes dos artefatos publicados, exceto do próprio manifesto. `evidencias/candidato-todos-arquivos.json` fixa o candidato; `android-apk-hashes.json` fixa os APKs locais.

Com Node/Java e dependências nas versões registradas, definir `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `EEAR_FIREBASE_SDK`, `EEAR_FIREBASE_CLI`, `FIREBASE_EMULATORS_PATH` e diretórios XDG graváveis. Preparar checkouts de 5b3f9d4 e c186008 e definir `EEAR_REPO_REPROVADO_IA07` para c186008. Definir `EEAR_REPO_ALVO` para o candidato e `EEAR_RUNTIME_SHA256` para e29b…; criar uma pasta para `EEAR_AUDITORIA_SAIDA`. Executar os ensaios com emuladores **sequencialmente**, pois compartilham portas.

```sh
node auditoria/ddaee55/teste-propriedades.js
node auditoria/ddaee55/teste-migracao-crash.js
node auditoria/ddaee55/teste-tombstone.js
node auditoria/ddaee55/teste-carga-obsoleta.js
node auditoria/ddaee55/teste-limite.js
node auditoria/ddaee55/teste-visual.js
```

No candidato auditado, tombstone e carga obsoleta devem retornar **1 por violação da propriedade**, com as evidências descritas; os demais retornam 0. Para comparar a carga obsoleta em 5b3f9d4, mudar somente alvo/hash/saída: a abertura prematura também é detectada, mas a marca está visível e o reset termina vazio. Nunca usar apenas o código de saída sem conferir sintomas e eventual `setupError`.

Os comandos integrais executados estão preservados em `evidencias/run.py` e nos resultados individuais, inclusive caminhos do executor. Links imutáveis do candidato: [commit](https://github.com/YNPHAX/EEAR/commit/ddaee558fde26e437696f7b17862b3df1ee7353f), [runtime](https://github.com/YNPHAX/EEAR/blob/ddaee558fde26e437696f7b17862b3df1ee7353f/curso/app.js), [regras](https://github.com/YNPHAX/EEAR/blob/ddaee558fde26e437696f7b17862b3df1ee7353f/web/firestore.rules). O SHA do commit de entrega da auditoria é informado na resposta de publicação; não pode constar autorreferencialmente no próprio commit.

**Decisão final: REPROVADO PARA HOMOLOGAÇÃO CONTROLADA.** Há causas de integridade comprovadas e evidências nativas faltantes. Nenhum merge, deploy, publicação de regras ou uso em produção foi autorizado ou executado.

# Correção direcionada da sincronização legada — EEAR

Runtime auditado: **`d16548547806575c1d32491a32d6166226f2096d`**.
Branch: **`codex/eear-correcao-estrutural`**. Base: `32d10f316750fe0651b838249f22f9f70ac09153`.
Bundle SHA-256: `3586150aa69bc5b2c921f04c6afda8ce94c52cd3c13cdad9f9e08592de85dc1e`.

**Homologação continua bloqueada / REPROVADO para sincronização legada.** A proteção implementada desliga esse
transporte inseguro. Não se afirma que o serviço legado passou a preservar confirmações, nem que suas versões antigas
foram revogadas. Site/Android compilar não substitui a matriz nem autoriza homologação.
Nenhum merge, deploy, publicação de regras, operação no Firebase real ou dado real foi usado. Testes com ausência de Web Locks e tela móvel usam Chromium; não equivalem a teste em Safari ou aparelho físico.

## Resultado e política implementada

O serviço legado usa `get/set/acquire`: `acquire` é cooperativo e não condiciona `set`. Um escritor antigo pode
substituir um snapshot depois da conferência do escritor novo. Assinaturas, épocas, linhagem e intervalos de espera
não constituem uma precondição imposta pelo servidor.

O candidato mantém o estudo transacional local, as identidades, as operações entre abas e a exportação, mas bloqueia
sincronização, importação remota automática e exclusão remota pelo transporte legado. Uma BASE histórica não autoriza
apagar a cópia local, inclusive no descarte de outras contas. Não há flag para liberar o modo inseguro.
O teste do bundle publicado exige **zero chamadas `get/set/acquire/transacao`** nessa rota, mesmo com capability
transacional anunciada e a antiga flag de exclusão ativada.

A interface distingue checkpoint local confirmado, operação local pendente/falha/reserva, sincronização pendente,
confirmação do transporte Firebase e bloqueio por risco de escritor legado. No legado não mostra confirmação remota.
O Firebase mantém seu adapter transacional e envelope v2; nenhuma configuração real dele foi alterada.

A alteração funcional é material: **novos aparelhos não recebem automaticamente a nuvem legada e o estudo novo não
é enviado a ela**. O backend exige mudança externa antes de reabrir esse recurso. A proposta, requisitos de rejeição
de versões incompatíveis e limites do modelo fictício estão em [sincronizacao-legada.md](sincronizacao-legada.md).

## Achados, gravidade e correções

| Achado | Gravidade | Evidência e tratamento |
|---|---|---|
| Confirmação remota substituível por escritor antigo | Alta | Cenário 9 original, ordem B → A: `T:a1` desaparece da nuvem embora A ainda diga “salvo na sua conta”. Checkpoint de A conserva a marca e reabrir A restaura. Transporte agora bloqueado; servidor permanece sem correção real. |
| Reserva sem quota + transação IDB abortada não retomava | Alta | Operação aceita, reserva realmente ausente e checkpoint com atividade 2 em vez de 3 após liberar armazenamento. Consolidação agora retenta também pendências da identidade em memória, com os mesmos IDs; confirmação só após commit. Teste exige 3/3 e crash posterior. |
| Cache reconstruído considerado atualizado sem conferir projeção bruta | Média | Reprodução determinística: cache 2, checkpoint/interface 3. Comparação inicial agora usa a projeção anterior à incorporação de `_ops`/diários e confirma que o texto bruto não mudou. Teste também exige preservar exatamente o cache ao apenas abrir certificado legado. |
| Negativas anteriores sob carga intensa | Alta, investigação delimitada | Duas execuções de `60addbf`/predecessor deixaram três ações fora do checkpoint; captura mostra operações ainda em memória e nenhuma reserva. A falha combinada acima foi reproduzida/corrigida, mas não foi provado que explique todas as negativas. Controles posteriores completos passaram; isso não encerra causalmente o histórico. |

A fila/checkpoint/CRDT não foram reescritos. Não mudou o schema IndexedDB, a representação causal nem o módulo
`14-abas.js`. A consolidação mantém IDs idempotentes e só retira pendências após recibo confirmado ou rejeição pela
política de geração/exclusão. Se os dois armazenamentos estiverem indisponíveis, manter a aba aberta continua sendo
necessário até uma confirmação efetiva; uma reserva ou ação aceita não é promessa de durabilidade.

### Commits disponíveis para revisão

- `1cbcc8b2fe9cb6ab07778b2e645db757e414ea36`: bloqueio efetivo do transporte e da confiança em BASEs legadas; modelo servidor fictício e testes do bundle.
- `430ce0a6351a9261091c650a3cf6510c44ab5095`: retomada de pendências após quota/abort e regressão com falhas reais.
- `60addbff19b397fb9455e245f4423573bf778bab`: correção inicial do cache e diagnósticos adicionais. Introduziu regravação ao apenas ler certificado antigo; essa negativa foi mantida e corrigida no commit seguinte.
- `d16548547806575c1d32491a32d6166226f2096d`: distingue cache realmente desatualizado de leitura sem estudo; controle de preservação literal e diagnóstico do preparo de crash, sem reduzir asserções.

## Reprodução controlada do cenário 9

Na base `32d10f3`, execute `EEAR_GRUPOS=epoca EEAR_EPOCA=9 node testes/plataforma.test.js`, com Playwright/Chromium.

1. A sincroniza; um cliente antigo lê esse estado.
2. B marca `T:b1`; o teste exige essa marca no remoto e na BASE de B.
3. A marca `T:a1`; exige-se confirmação remota e na BASE de A.
4. Confirma-se que B ainda não conhece `T:a1`.
5. B aceita `T:fecha` e fecha antes do envio. O cliente antigo sobrescreve usando a leitura inicial mais `T:v2`.
6. B reabre. Remoto: `T:b1,T:base,T:fecha,T:v2`; falta `T:a1`. Cache/checkpoint de A ainda a contêm.
7. Reabrir A restaura a união, controle independente de recuperação.

A suíte original completa de época executou os cenários 1–8 positivamente e o cenário 9 negativamente nessa base.
O mesmo arquivo de critérios permanece byte a byte inalterado. No candidato, o cenário 9 não consegue estabelecer
as confirmações remotas de preparação porque a rota está bloqueada: **não é aprovação de convergência**.
O modelo `legado-contrato.test.js` é exclusivamente uma proposta fictícia, não prova de capacidade do serviço real.

## Matriz de validação

| Suíte / cenário | Resultado consolidado |
|---|---|
| Firebase Emulator, verificação final com prova de dados | **50/50**. Anterior: 48/50 local e 49/50 no CI. A saída tinha falsa negativa de CSS; a preparação passou a respeitar a carga local. Negativas preservadas; runtime idêntico. |
| Agregador de persistência | **13/13 grupos**, 313,9 s, no snapshot final. F01 **8/8**, N01–N07 e regressões F09/F13. |
| F01 riscos | **6/6**: Zerar/nuvem/aba única, suspensão, exclusão sem notificação, 62/62 contagens e interrupção nativa. |
| Diários independentes | **8/8**: fechamento/crash com e sem Web Locks, exclusão pendente, quatro abas/202 atividades, eventos perdidos e líder suspensa. |
| Concorrência fallback / órfãos | Passaram: interrupção transacional; quatro cenários de órfãos; nove sequências e controle de 30min com 11/11, sem Web Locks/storage. 30min é avanço controlado do relógio, não suspensão física por meia hora. |
| Browser.crash sem Web Locks | **4/4** adicionais; inclui Zerar+estudo e duas quedas. |
| Migração de diário verdadeiro | **8bd32d2 e 2f6cad6 passaram**, com produtor real antigo, três abas, reabertura e contagens exatas. |
| Quota + abort / cache reconstruído | Ambos passaram; retomada 3/3 e crash; cache atualizado e leitura de certificado sem regravar bytes. |
| Limite remoto de metadados | Passou no emulador: recusa explícita, local/checkpoint/reabertura **6002**, remoto anterior **2**. |
| Grupos locais da plataforma | **50 verificações positivas, zero negativas**, incluindo robustez, abas, interrupção, recuperação e crashes. É complemento; a plataforma integral do CI permanece reprovada por exigir nuvem legada. |
| Carga no navegador | **2.000 ações**, quatro abas, atividade **2.002**, certificado, dez resets e reabertura: passou, **115,4 s**. Negativas anteriores não apagadas. |
| Núcleo isolado | **12.000 operações**, repetição, contagens e reset: passou, **348,7 s**, módulo 14 de bytes idênticos ao final. |
| Hosting | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, todos passaram; HTTP no Hosting Emulator passou. |
| Lint, montagem, integridade, builds | Passaram. Site e conteúdo Android têm o mesmo SHA-256 do bundle final. APK compilado/verificado no CI; publicação skipped. |
| Reversão com build 2f6cad6 | **8 positivas e uma negativa**, mantida: união automática não garantida. Quarentena e recuperação explícita pela UI passaram. |
| Backend legado, época | Base antiga: 1–8 passaram, 9 falhou. Candidato: cenário 9 não estabelece preparação porque o transporte foi bloqueado; não é aprovação. |


Os resultados locais finais usam snapshot imutável e conferem o hash antes de cada suíte. Há execuções anteriores
preservadas separadamente; não se somam repetições para fabricar uma taxa global de aprovação.
O ensaio de 12.000 operações executa o módulo 14 publicado com normalizador mínimo, não UI/IndexedDB. Seu hash é
idêntico no runtime final. O ensaio de navegador de 2.000 ações cobre UI, quatro abas, checkpoint, certificados,
resets e reabertura, sem Web Locks, eventos storage ou transporte Firebase.

### F01–F13 e N01–N07

F01 mantém seus oito cenários originais. F02–F04 são reavaliados no ciclo de sessões/callbacks/pagehide; F05–F07 nas
barreiras de artefatos, regras e fixture isolada. F08 cobre Zerar seguido de estudo e reabertura/crash. F09 exige
contagens exatas entre dispositivos, ACK perdido, múltiplas abas e sequências suspensas. F10–F13 incluem diário
pendente, exclusão concorrente, falta de Web Locks, perda de eventos e transações interrompidas.
N01–N07 são mantidos nos 13 grupos: quota/abort, privacidade de exclusão e quarentena, sessão antiga, validação de
configuração/importação, metadados futuros, Zerar+crash e segunda queda após recuperação.

`testes/f01-abas.test.js`, `testes/epoca-nuvem.js` e o agregador de 13 grupos não tiveram critérios alterados.
Nos testes existentes de carga, integridade noturna e durabilidade, as alterações são diagnósticos; as exigências de integridade permanecem.

### Verificação de saída de conta no Firebase

A assertiva antiga buscava `/Sem/` no `innerText` do Plano. A reprodução mostrou cache da conta com `T:ana1`, perfil
anônimo original com nome “Sem Conta” e Plano correto, cujo CSS renderiza “SEMANA”; o substring não demonstrava
isolamento. O teste agora exige UID encerrado, exportação pública com nome/aulas/cartões/simulados anônimos exatos e
nenhuma marca da conta, além de conservar a cópia da conta. Isso fortalece a prova de dados; não muda o produto para
satisfazer texto de teste. O helper sintético aguarda o término da carga local, sem aguardar gravações pendentes:
respeita a mesma barreira que desabilita botões reais durante a inicialização. Os critérios de Google, regras e
confirmação remota são mantidos. A repetição completa concluiu 50/50; os resultados anteriores continuam nas evidências.

## CI e limites da execução

| SHA | Site | Android | Testes / Firebase |
|---|---|---|---|
| `1cbcc8b` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43482561285) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43482562161) | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43482561883); subjob Firebase **success** |
| `430ce0a` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43486716043) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43486715994) | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43486716038); subjob Firebase **success** |
| `60addbf` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43488385381) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43488385340) | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43488385420); subjob Firebase **failure** |
| `d165485` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43544900102) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43544900087) | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43544900074); subjob Firebase **failure**, 49/50; os 13 grupos não foram alcançados nesse run |

Os jobs `publicar` de Site e Android foram **skipped**. O commit posterior de testes/relatório mantém o mesmo runtime; seus três workflows são consultados no fechamento da entrega, separadamente das execuções acima.


A falha da plataforma ao exigir sincronização legada é incompatibilidade funcional deliberadamente exposta pelo
bloqueio. Não é classificada como infraestrutura e não foi escondida com `continue-on-error`, exclusão de cenários
ou mudança dos critérios. Grupos locais posteriores ao ponto de interrupção da suíte são executados separadamente.

Em `60addbf`, o job Firebase teve uma negativa no preparo de `zerar-estudar`, antes de executar o crash: não comprovou
que os campos exportados coincidiam com o checkpoint naquele instante. Não se demonstrou perda após crash nesse caso.
Sete repetições do mesmo SHA, com os mesmos critérios, passaram; o teste agora imprime os campos e o commit observado
se a precondição voltar a falhar. Essa negativa do CI é preservada, sem declará-la falha de infraestrutura.
A regressão de leitura do certificado também encontrada nesse CI foi reproduzida e corrigida em `d165485`.

A sessão de 13/11 foi interrompida por limite de revisão automática de comandos. As partes sem resultado não foram
contadas como aprovadas; a retomada de 14/11 verifica resultados terminados e reexecuta pendências. Não houve
rejeição indicando que a ação era insegura nem execução de uma ação rejeitada por outro caminho.

## H01–H03 e segurança de publicação

As sondas preservam os falsos aceites H02: configuração canônica em script não executável e em template/comentário
não habilita homologação; configuração ativa canônica é aceita. H01 valida destino/marca/projeto; H03 cobre política
HTTP/cache/noindex. Hosting usa emulador demo com configuração fictícia. `/__/auth/handler` retorna 404 no emulador;
essa observação não valida OAuth do Hosting real. Google foi exercitado no Auth Emulator; domínios/provedores reais
não foram acessados/configurados. Os workflows de publicação permanecem condicionados à main e despacho manual.

## Metadados e reversão — pendências separadas

O crescimento causal permanece. Em 2.000 ações, estado ~313 KB e checkpoint lógico ~675 KB; depois de dez resets,
com uma marca visível, estado ~353 KB e checkpoint ~798 KB. No núcleo, 6.000 ações ultrapassam o limite de 900.000
caracteres (~910 KB); 12.000 chegam a ~1,83 MB e reset+novo estudo a ~2,14 MB. A recusa do limite remoto deve ser
explícita e preservar a cópia local. **Nenhuma compactação causal foi introduzida**. É necessária estratégia futura
com prova para aparelhos offline, repetição de IDs e tombstones antes de coletar metadados.

A reversão manual para `2f6cad6` continua sem união automática garantida: o cliente antigo descarta `_ops`.
O teste antigo conserva sua negativa; controles adicionais exigem cópia em quarentena, oferta pela UI e recuperação
explícita após reabrir. Conservar exportação/perfil original. Não se recomenda downgrade como correção de sincronização.

## Parecer e próximos passos

**REPROVADO para liberar sincronização legada ou anunciar homologação aprovada.** A entrega oferece um bloqueio real
e correções locais comprovadas, não a garantia remota que esse backend não oferece.

Antes de reabrir a rota: implementar em ambiente isolado rejeição de escritores incompatíveis no servidor, revisão/CAS
ou transação efetiva, aplicação idempotente/validação de operações, proteção de exclusão e recibos; auditar a versão
exata desse servidor e executar o cenário 9 e a matriz contra ela. Uma capability/flag do cliente e polling não bastam.
Alternativamente, validar/autorizadamente configurar o Firebase já implementado, sem migrar identidades por nome/e-mail.
Investigar as negativas históricas de carga com as evidências preservadas e submeter o SHA final a auditoria independente.

As correções estão somente na branch de desenvolvimento. main, Claude e auditoria não foram alteradas; não houve merge,
deploy ou publicação de regras. O relatório, JSON de resultados e extrato de evidências acompanham a entrega.

## Arquivos alterados em relação à base

- `.github/workflows/testes.yml`
- `AGENTS.md`
- `CLAUDE.md`
- `auditoria/correcao-legada-d165485.md`
- `auditoria/correcao-legada-evidencias.txt`
- `auditoria/correcao-legada-resultados.json`
- `auditoria/sincronizacao-legada.md`
- `auditoria/validacao-10f631e.md`
- `curso/app.js`
- `curso/app/02-progresso-nuvem.js`
- `curso/app/09-contas.js`
- `curso/app/10-nuvem-claude.js`
- `curso/app/11-exclusao-nuvem.js`
- `curso/app/12-caminho-novo.js`
- `curso/app/15-diarios-pendentes.js`
- `curso/app/16-diario-duravel.js`
- `curso/app/17-estado-persistencia.js`
- `testes/cache-restaurado.test.js`
- `testes/carga-metadados.test.js`
- `testes/duravel-candidato.test.js`
- `testes/firebase-emulador.test.js`
- `testes/legado-bloqueio.test.js`
- `testes/legado-contrato.test.js`
- `testes/noturna-integridade.test.js`
- `testes/operacoes-dupla-falha.test.js`

Manifesto, versões e resultados: [correcao-legada-resultados.json](correcao-legada-resultados.json).
Extrato preservando negativas e positivas: [correcao-legada-evidencias.txt](correcao-legada-evidencias.txt).

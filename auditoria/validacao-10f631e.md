# Validação concluída do candidato EEAR 10f631e

Data: 13/11/2026. Branch de trabalho: `codex/eear-correcao-estrutural`.

**Resultado:** matriz principal de persistência, plataforma, Firebase e Hosting executada; nenhuma perda silenciosa foi reproduzida nos cenários aprovados. Permanecem duas restrições confirmadas: crescimento de metadados até impedir sincronização e recuperação manual após reversão para cliente antigo. **Não há aprovação de homologação emitida por esta validação.** A decisão cabe ao responsável e à revisão independente.

## SHA e correspondência com o código publicado

- Candidato solicitado: **`10f631eb4c091399e04c89098ee2414ca58ec04c`**.
- Runtime: **`10a3239990eecbb8e66cdfe982687b7962c42af7`**.
- Revisão inicial dos testes corrigidos: **`d84f9da5ea0891d2037dfbc7a8b13e25cd460193`**.
- Complementos de preparação, carga e recuperação: **`ab61a6c5ae86993f71d991800602bf3b56d80879`**, somente testes/instruções, sem alterar runtime.
- SHA256 de `curso/app.js`: **`676a0d0860f3d9ee20797d2dcce09bdfc9676cc5c51f1b76cd316c72e52c10a4`**.

Foi criado worktree limpo de 10f631e. A árvore remota do GitHub foi consultada diretamente: os 18 blobs, compilado e 17 partes, coincidem com os arquivos executados. Os hashes das partes antes/depois são iguais. Os testes adicionais apontaram `EEAR_REPO_ALVO` para esse snapshot; seus caminhos e hashes constam dos resultados. Não foram usados arquivos intermediários da implementação anterior.

**Nenhum runtime, regra Firebase ou workflow foi alterado nesta rodada.** Mudanças são de testes, observações de preparação e documentação. Não houve nova reestruturação, compactação, merge, deploy, publicação de regras ou acesso a dados reais. Main, Claude e auditoria não foram modificadas.

## Workflows dos dois SHAs solicitados

| SHA | Site | Android | Testes |
|---|---|---|---|
| 10a3239, runtime | [success](https://github.com/YNPHAX/EEAR/actions/runs/43450066806) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43450067103) | [cancelled](https://github.com/YNPHAX/EEAR/actions/runs/43450066800) |
| 10f631e, documental | [success](https://github.com/YNPHAX/EEAR/actions/runs/43450848164) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43450848128) | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43450848211) |
| d84f9da, somente testes, mesmo runtime | [success](https://github.com/YNPHAX/EEAR/actions/runs/43456192677) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43456192559) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43456192675) |

O cancelamento de 10a3239 ocorreu na sequência de novo push da mesma branch, com `cancel-in-progress: true`; não é uma falha demonstrada do código. Em 10f631e, Firebase e os 13 gates passaram; a plataforma falhou em **uma observação de pagehide**, detalhada abaixo. Não foi falha de infraestrutura. Os jobs de publicação de Site e Android permaneceram `skipped`; o APK foi compilado/verificado no CI, sem execução em dispositivo real.

No CI de d84f9da, ambos os jobs Testes terminaram com success: **241 verificações da plataforma, três do ciclo de sessão, propriedades das operações, Firebase 50/50 e 13 gates**. Isso valida o runtime acima, que não mudou. Não transforma em aprovação a ferramenta de reversão que continua falhando fora desse workflow.

## Matriz executada

| Suíte/cenário | Resultado |
|---|---|
| Plataforma integral original de 10f631e, local | 240 verificações positivas e uma negativa em pagehide/cache. Mesma falha observada no CI original. |
| Plataforma integral com observação de durabilidade corrigida, CI d84f9da | **241/241**; ciclo original **3/3**; propriedades das operações passaram. |
| Firebase Emulator, snapshot 10f631e | **50/50**, incluindo senha, Google emulado, persistência offline, reconexão, conta excluída, regras, certificados e transações. Configuração herdada apontava a caminho inexistente: a fixture continuou isolada, F07. |
| `persistencia-regressoes.test.js` | **13/13 grupos**, local e CI. Oito F01, N01–N07, F09/F13 e novas exclusões/cache/quarentena. |
| `f01-abas.test.js` | **8/8**, arquivo de critérios preservado. |
| `f01-riscos.test.js`, seis cenários | Zerar/nuvem, Zerar/aba única, suspensão, exclusão sem aviso storage, 62/62 contagens e interrupção nativa: **6/6** após estabelecer a confirmação de exclusão. Negativa original preservada nos logs. |
| `diarios-auditoria.test.js` | **8/8**: fechamento/crash, com/sem Web Locks, exclusão pendente, quatro abas/200 ações (**202/202**), notificações perdidas e líder suspensa. |
| `concorrencia-fallback.test.js`, ponto solicitado última conferência | Passou; no runtime novo executa a interrupção transacional nativa equivalente com três abas, sem falsificar Storage, ambas as marcas e atividade **4**. |
| Órfãos: retorno/segunda escrita 8s, 30min, crash | **4/4** com o ponto de suspensão corrigido e a execução explícita do crash no wrapper. Controle de 30min altera o relógio; não é suspensão física por 30 minutos. |
| Nove sequências, sem Web Locks/storage events | **11/11** na UI, servidor e reabertura, inclusive no controle de 30min. |
| `duravel-candidato.test.js`, padrão | **4/4** no gate: marcação, Zerar+estudo, recuperação seguida de segunda queda e respectivo controle. |
| Mesmo teste com Web Locks indisponível | **4/4 adicionais**, Browser.crash e checkpoint efetivamente confirmado. |
| Diário real legado 8bd32d2 e 2f6cad6 | Ambas as migrações passaram, três abas, marcas e contagem exata após reabrir. Não se fabricou formato antigo. |
| Transação abortada / carga bloqueada / IDB restabelecido / corrupção | Passaram: reserva recuperada, aviso correto, mutação durante carga bloqueada, mutação em checkpoint corrompido recusada e exclusão explícita limpa quarentena. |
| Hosting | Autoteste **193/193**, sondas antigas **11/11**, gates **12/12**, parser no Chromium **3/3**, HTTP do Hosting Emulator passou. |
| Lint, montagem, integridade e builds | Passaram. Site e conteúdo Android gerados localmente; APK verificado pelo CI. |
| Atualização/reversão com builds reais | Atualização preservou estudo. **Uma falha de união automática permanece** ao voltar de 2f6cad6; dois controles adicionais de cópia/recuperação manual passaram. |

A matriz original e as repetições estão separadas no JSON. Não se somaram execuções repetidas para fabricar uma taxa global de aprovação.

### Mapeamento F01–F13 e N01–N07

- **F01:** oito cenários originais; fechamento, offline, desmarcação, certificados, reset e reconexão.
- **F02–F04:** ciclo original `saida`, `callback`, `recusa`; pagehide sem novos envios e reabertura offline real.
- **F05–F07:** barreiras oficiais/site/app/APK, dados pessoais corretamente descritos, fixture não herdando configuração real.
- **F08:** estudo posterior a Zerar, com uma ou várias abas, servidor e nova abertura; também após Browser.crash.
- **F09:** dois dispositivos **4/4**, ACK remoto perdido **4/4**, simulados independentes **2/2**, 62/62, 152/152 em seis abas, 202/202 em quatro, nove sequências 11/11 e carga de navegador 2.002/2.002.
- **F10–F13:** diário pendente, exclusão após última conferência, ausência de Web Locks, recuperação sem eventos, escritores reais pausados, cache/exclusão serializados e Browser.crash repetido.
- **N01:** quota real, abort de IDB, impossibilidade de confirmação corretamente indicada e preservação/reabertura.
- **N02:** sair apagando, excluir conta, resíduos localStorage/IDB/espelho/quarentena e callbacks atrasados.
- **N03:** sessão antiga ainda conectada não recriou documento após excluir conta; login novo retornou 400 no Auth emulado.
- **N04:** configuração malformada não quebrou telas nem persistiu tipo inválido.
- **N05:** bytes ilegíveis/futuros preservados; importação incompatível recusada e arquivada.
- **N06/N07:** reset+estudo+queda e segunda queda durante recuperação, com pré-condições de commit verificadas no IndexedDB real.

## Falhas investigadas sem reduzir critérios

**Pagehide.** O teste antigo consultava somente localStorage depois de fechar a página. A reprodução manteve essa asserção e acrescentou diagnóstico: `cacheAntes=false`, `semEnvio=true`, checkpoint com as duas marcas e reabertura offline com ambas. O escritor encerrado deve parar para proteger F02; o cache é opcional. A asserção foi substituída por uma exigência mais forte: nenhum envio após pagehide, checkpoint real contendo base/estudo e fechamento/reabertura offline preservando ambos, sem erros JS. O runtime permaneceu igual e a plataforma integral passou no CI.

**Exclusão sem evento.** A negativa original tinha `removido=false`: a exclusão assíncrona não estava estabelecida como concluída. A preparação agora aguarda sincronização após recarregar B e confirmação explícita de exclusão antes de medir retorno. A asserção também exige que a marca nova sobreviva, além de impedir retorno da base apagada. Resultado: confirmação verdadeira, base ausente, marca nova presente, atividade **1**.

**Retorno de uma operação.** O ponto antigo de pausa podia deixar uma transação da própria aba ativa, impedindo estabelecer a adoção pela outra aba. A pausa foi movida para o evento de navegação seguinte, no mesmo turno JavaScript: o primeiro handler já aceitou/renderizou a operação, mas os microtasks ainda não abriram transações. Conservam-se adoção exatamente uma vez antes da retomada, 8,5s, todas as marcas, certificado, servidor e nova abertura. O wrapper também passou a executar o Browser.crash no conjunto padrão; antes o desvio para a arquitetura nova omitia esse caso.

**Reversão.** A asserção antiga de união automática não foi removida, afrouxada ou marcada como aprovada. Seu exit continua 1. Foram acrescentados controles positivos separados de preservação em quarentena, oferta na UI e recuperação explícita por importação seguida de reabertura.

O cliente antigo descarta `_ops`, como registrado no teste. Não foi introduzida união automática de snapshots sem essas identidades: distinguir repetição, remoções e estudo independente exige uma política de migração própria. Preservar a cópia e manter a restrição explícita evita uma correção improvisada que reintroduza F09/F13.

## Crescimento dos metadados

### Navegador real: quatro abas, sem Web Locks e sem eventos storage

Foram executadas **2.000 ações reais**, 500 por aba, com todo transporte Firebase bloqueado nessa carga. Contagem final **2.002**, certificado e todas as marcas conferidos nas quatro abas. Dez resets seguidos de estudo e fechamento simultâneo/reabertura passaram. Duração deste ensaio: **347s**, em bancada com outros testes; não é benchmark de celular.

| Ponto | Atividade | Marcas visíveis | Estado serializado | Metadados | Checkpoint JSON, com duplicação de estado/metadados e recibos |
|---|---:|---:|---:|---:|---:|
| Base | 2 | 1 | 2.113 B | 1.607 B | 3.867 B |
| 1.000 ações | 1.002 | 1.001 | 157.236 B | 136.167 B | 338.550 B |
| 2.000 ações | 2.002 | 2.001 | 313.236 B | 271.167 B | 674.550 B |
| Após dez resets/novos estudos | 1 | 1 | 353.491 B | 353.066 B | 797.604 B |

Esses são tamanhos lógicos de JSON, não consumo físico exato do banco. Um controle curto adicional exercitou `navigator.storage.estimate()` e exportação da amostra; estimativas de quota dependem do navegador. **Zerar não compacta o histórico causal; pode aumentar o tamanho.**

### Complemento do núcleo, distinto do teste de navegador

O módulo **14 publicado** executou **12.000 operações** em lotes e entregas duplicadas, com contagens exatas e reset. O normalizador mínimo desse teste é identidade para o estado válido usado: ele mede crescimento lógico e união, **não prova UI, IndexedDB nem durabilidade de 12.000 cliques**. O teste de navegador acima cobre esses caminhos com 2.000 ações.

| Operações do caso medido | Estado JSON |
|---:|---:|
| 1.000 | 150.368 B |
| 5.000 | 758.368 B |
| 6.000 | 910.368 B |
| 12.000 | 1.826.371 B |
| Depois de reset + um novo estudo | 2.137.837 B |

O primeiro ponto amostrado acima dos 900.000 caracteres foi 6.000 operações neste exemplo. Não é um limite universal de quantidade de estudos: depende dos dados e dos campos alterados.

Esse estado de **910.368 bytes** foi importado pela UI real conectada ao **Firebase Emulator**, usando regras reais do candidato. Resultado: sincronização recusada explicitamente, servidor manteve atividade **2**, enquanto UI/checkpoint/reabertura offline preservaram **6.002**. Não houve truncamento, duplicação ou confirmação falsa de envio. A barreira protege os dados, mas não remove a restrição de capacidade. Não foi introduzida compactação nesta rodada.

## Restrições remanescentes

| Gravidade | Restrição confirmada | Impacto e encaminhamento |
|---|---|---|
| Média | Crescimento sem compactação causal | O estado pode ultrapassar o limite de 900.000 caracteres e parar de sincronizar. Resets não resolvem; dados continuam locais/exportáveis. Exige política de capacidade e desenho de compactação auditado em tarefa própria, sem GC por carência arbitrária. |
| Média | União automática após reversão não suportada no cenário testado | Estudo feito pelo cliente antigo fica fora do progresso ativo ao retornar ao novo. Há cópia em quarentena, aviso e recuperação explícita pela UI, comprovados. A ferramenta original mantém uma falha. Exige plano de reversão que inclua esse procedimento; não tratar como reversão transparente. |
| Limitação de cobertura | Navegadores/dispositivos reais e infraestrutura real | Não se homologaram Safari/iOS, WebViews reais, queda de energia, domínios OAuth reais ou Firebase de homologação. O controle de 30min é relógio simulado. Não são vulnerabilidades adicionais demonstradas. |

O controle isolado do Chromium perdeu localStorage recente após Browser.crash, enquanto os checkpoints da EEAR sobreviveram nos cenários aprovados. Isso reforça a distinção entre reserva/cache e commit, sem converter qualquer falha do app em “limitação do ambiente”.

## Artefatos e reprodução

- [Resultados estruturados, CI, matriz e hashes](validacao-10f631e-resultados.json).
- [Evidências positivas e negativas](validacao-10f631e-evidencias.txt).
- `node testes/plataforma.test.js`: matriz integral; `node testes/firebase-emulador.test.js`: emuladores; `node testes/persistencia-regressoes.test.js`: 13 gates.
- `EEAR_REPO_ALVO=<snapshot> node testes/f01-riscos.test.js`, `diarios-auditoria.test.js`, `orfaos-auditoria.test.js`, `duravel-candidato.test.js`; dependências/variáveis da fixture F01, conforme AGENTS.md.
- `EEAR_REPO_LEGADO=<8bd32d2 ou 2f6cad6> node testes/diario-legado-auditoria.test.js` com alvo fixo.
- `node testes/carga-metadados.test.js`: quatro abas/2.000 ações/dez resets; `node testes/carga-nucleo.test.js`: complemento lógico; `metadados-limite.test.js`: estado exportado, somente emuladores.

As evidências incluem os resultados originais negativos, a justificação e a repetição correspondente. O runtime solicitado foi mantido. Os commits posteriores apenas tornam a validação reproduzível e documentam seus limites. A decisão de homologação permanece externa a este trabalho.

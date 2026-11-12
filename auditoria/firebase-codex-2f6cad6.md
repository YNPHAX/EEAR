# Auditoria independente — candidato 2f6cad6

**Parecer: REPROVADO para avançar à homologação.** Há perda silenciosa de progresso reproduzível, restauração de progresso apagado após crash, contagens incorretas e falsos aceites da barreira H02. Os oito cenários F01 passaram; os três workflows estão verdes. Esses resultados positivos não abrangem os caminhos que falharam nesta auditoria.

SHA auditado: [`2f6cad6ebba53d0f86319dcada671fe9396f8111`](https://github.com/YNPHAX/EEAR/commit/2f6cad6ebba53d0f86319dcada671fe9396f8111), obtido diretamente do GitHub. Data: 12/11/2026. Comparação com [`8bd32d2`](https://github.com/YNPHAX/EEAR/commit/8bd32d2ca92a408e5cc3b0988b8a4a19e424c42b) e com a auditoria Codex encerrada em [`76c013d`](https://github.com/YNPHAX/EEAR/commit/76c013dbcf0ded12086c35f7a8331252f2f0a886). Complementa o [relatório noturno anterior](firebase-codex-noturna-8bd32d2.md).

O candidato foi executado em worktree detached; seu runtime permaneceu intacto. Esta entrega altera somente testes e documentação em `codex/auditoria-firebase-eear`, preservando as correções F02–F07 e os testes independentes. Não houve merge, deploy, publicação de regras, modificação da branch Claude, operação no Firebase real ou uso de dados reais. Projetos emulados `demo-eear-f01`, `demo-eear` e `demo-eear-hosting`; SDK servido localmente, configurações fictícias e bloqueio de destinos reais nas sondas independentes.

## Comparação objetiva

| Área | Resultado em 2f6cad6 |
|---|---|
| F01 obrigatório | **8/8**, mesmos testes e critérios |
| F09: aba viva considerada órfã, uma/duas sequências | **Corrigido nos casos anteriores** de 8 segundos e 30 minutos |
| F09: dispositivos independentes | **Persiste:** atividade **3/4**, embora ambas as marcações sobrevivam |
| F09: commit remoto confirmado no servidor, ACK perdido | **Persiste:** atividade **5/4**; controle com confirmação antes do novo estudo dá **4/4** |
| F09: mais de seis sequências pendentes | **Novo limite confirmado:** nove sequências resultam em **12/11**, inclusive no servidor e após reabrir |
| F13: pausa após primeira leitura | **Corrigido no ponto antigo** pela releitura antes de gravar |
| F13: pausa após última conferência | **Persiste:** progresso de B desaparece após eliminação dos dois diários e sobrescrita de A |
| Crash único, marcação simples | **Melhora confirmada:** espelho IndexedDB recupera dado perdido pelo localStorage |
| Crash depois de Zerar e estudar | **Novo achado N06:** tarefa apagada volta; atividade **3/1** |
| Segunda queda durante recuperação | **Novo achado N07:** diário IndexedDB já eliminado; tarefa recuperada desaparece definitivamente |
| N01–N05 | **Persistem**, reproduzidos pelos mesmos testes independentes |
| H02: falsos aceites anteriores | **Corrigidos nos casos antigos**; dois contextos HTML adicionais ainda passam indevidamente |
| F02–F08, F10–F12, H01/H03 | Controles anteriores preservados nos cenários descritos abaixo; não equivalem à correção integral de F09/F13 |

`08-uniao-nuvem.js`, `01-base.js`, `13-falhas-nuvem.js` e `web/firestore.rules` não mudaram entre 8bd32d2 e o candidato. Foram examinadas as mudanças efetivas em `14-abas.js`, `15-diarios-pendentes.js`, `16-diario-duravel.js`, `09-contas.js` e no verificador de Hosting, além dos testes adicionados pelo autor.

N06/N07 são achados novos nos caminhos da recuperação IndexedDB acrescentada neste candidato. Isso não significa que 8bd32d2 fosse seguro nos mesmos crashes: ele já dependia do localStorage e falhava no crash simples. O caso de nove sequências é um **limite residual da correção F09**, não evidência de que a versão antiga funcionava para nove. As melhorias e as falhas persistentes estão discriminadas para evitar confundir um teste novo com uma regressão causal demonstrada entre dois SHAs.

## F13 — Alta — corrida permanece após a última conferência

Locais no SHA auditado: [`14-abas.js:126`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/14-abas.js#L126), releitura/comparação e `setItem`; linha 115, carência para limpeza; linha 134, remoção dos diários; [`16-diario-duravel.js:29`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/16-diario-duravel.js#L29), exclusão do espelho.

Reprodução independente, repetida duas vezes, sem Web Locks e sem adulterar `getItem`/`setItem`:

1. Três abas A/B/C na mesma conta, base confirmada com atividade 2; bloquear somente a comunicação com os emuladores.
2. A marca `T:A`. Pausar com breakpoint nativo **depois da última leitura/comparação e antes do `localStorage.setItem(k, novo)`**. O critério final continua exigindo A+B e atividade 4.
3. B marca `T:B`. Conferir aceite na exportação, B na principal, diário local e diário no IndexedDB. Uma transação readonly posterior comprova que o espelho foi efetivamente gravado.
4. Fechar B. C espera a carência e elimina o recibo local e seu espelho; sua principal ainda contém B. Limpeza observada em **2.457 ms** e **2.291 ms** após iniciar a espera. Confirmar também a conclusão da remoção no IndexedDB.
5. Fechar C, retomar A até imediatamente depois do `setItem`: sua principal contém A e não B. Provocar `Page.crash` de A e abrir D.
6. D não recupera B; principal, exportação e servidor após reconexão ficam sem B, atividade **3**, nenhum diário com B. A UI informa **“Progresso salvo na sua conta.”**

O teste original no primeiro ponto de leitura passou. A adaptação não muda a exigência de preservação: desloca a interrupção para a janela que a nova comparação deixa aberta. A releitura não torna a sequência transacional; o limite de cinco tentativas também não é uma garantia de exclusão mútua. Uma espera fixa de dois segundos não prova que outro escritor terminou nem que a principal está durável.

Recomendação: serializar a aplicação, a confirmação e a coleta dos recibos em armazenamento transacional também no fallback. Uma cópia durável não pode ser eliminada enquanto uma operação antiga ainda pode invalidar a principal que justificou a eliminação.

## N06 — Alta — crash após Zerar e estudar restaura progresso apagado

Locais: [`14-abas.js:67`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/14-abas.js#L67), snapshot/base e histórico; linhas 84–101, união fora da cadeia; [`16-diario-duravel.js:51`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/16-diario-duravel.js#L51), recuperação do espelho mais recente.

Reprodução `zerar-estudar` em `testes/duravel-candidato.test.js`, repetida duas vezes, **com Web Locks disponível**, perfil Chromium persistente fictício e sem conta:

1. Importar pela UI `T:base`, atividade 2 e certificado fictício `DURAVEL-CERT`; confirmar o diário no IndexedDB e aguardar 6.500 ms para a cópia antiga chegar ao disco. Manter o mesmo escritor aberto.
2. Pela UI, confirmar **Zerar** e imediatamente marcar `T:novo`. Estado aceito: somente a tarefa nova, atividade **1**, certificados vazios e época de reset positiva.
3. Confirmar por transação readonly posterior o diário **seq 3** no IndexedDB, contendo exatamente esse estado. A principal em memória também está correta. Aguardar 300 ms e executar **`Browser.crash` real**.
4. Reabrir o perfil em uma página da mesma origem que não carrega o app. Antes de qualquer recuperador, a principal e o recibo local voltaram à versão antiga **seq 1**, mas o IndexedDB reteve **seq 3** com o reset e o estudo novo.
5. Carregar o candidato e aguardar até dez segundos. Resultado estável: `T:base` **voltou**, `T:novo` continua, atividade **3**, época de reset preservada e certificados vazios. Esperado: somente `T:novo`, atividade **1**.

O espelho efetivamente sobreviveu; não é uma hipótese de IndexedDB sem commit. A principal em disco não contém a base intermediária do diário posterior ao reset. A recuperação passa por `unirSemCadeia`, que acrescenta novidades sobre a principal antiga, sem reaplicar a exclusão das tarefas dessa principal. **Zerar isolado** e **marcação simples** passaram como controles. Certificados não reapareceram nesse cenário; a falha comprovada é a restauração da tarefa apagada e da contagem antiga.

Recomendação: persistir reset/época e as operações subsequentes de modo que a recuperação não dependa da existência em localStorage da versão intermediária. A reconstrução precisa aplicar a semântica do reset antes do estudo posterior.

## N07 — Alta — limpeza do espelho elimina a última cópia efetivamente durável

Locais: [`14-abas.js:115`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/14-abas.js#L115), critério de recibo absorvido/idade; linhas 130/134, gravação da principal e remoção; [`16-diario-duravel.js:33`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/16-diario-duravel.js#L33), transação de exclusão.

Reprodução `duas-quedas`, repetida duas vezes, **com Web Locks**, sem conta ou rede externa:

1. Mesma semente antiga efetivamente persistida do controle N06; marcar `T:novo`, atividade 3, confirmar o diário **seq 2** em transação IndexedDB concluída e cair 300 ms depois.
2. Esperar 2.500 ms antes da retomada, ultrapassando a carência do recibo. Inspecionar o perfil antes do app: localStorage antigo **seq 1**, IndexedDB novo **seq 2**.
3. Abrir o candidato. A recuperação inicial funciona: tarefa nova e atividade 3 aparecem.
4. Na observação seguinte, a leitura readonly confirma a eliminação do espelho: **IndexedDB vazio**, principal e diário de trabalho locais ainda mostram a tarefa nova. Executar uma **segunda queda real imediatamente após essa confirmação**, antes do flush do localStorage. A sonda comprova os estados; não atribui uma ordem interna entre cada callback de abertura e limpeza.
5. Reabrir e inspecionar antes do app: principal/diário local antigos, **IndexedDB vazio**. Após a recuperação, `T:novo` não volta e a atividade fica em **2**, em vez de 3.

O navegador pode legitimamente adiar a persistência do localStorage. O defeito do app é usar uma cópia de trabalho recém-gravada como confirmação suficiente para apagar a cópia durável que acabara de recuperar. O prazo usa o timestamp do diário antigo, não uma confirmação de persistência da principal recuperada. Uma simples ampliação de prazo continuaria sem fornecer essa confirmação.

Recomendação: manter uma principal/checkpoint transacional durável antes de coletar os diários que a sustentam, ou reter operações duráveis até confirmação equivalente. Incluir recuperação seguida de nova interrupção como requisito de integridade.

## F09 — Média — contagens ainda não são exatas

Locais: [`08-uniao-nuvem.js:124`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/08-uniao-nuvem.js#L124), distinção de soma local/nuvem; [`14-abas.js:67`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/curso/app/14-abas.js#L67), histórico limitado a seis; linhas 97–101 e 154–158, escolha da base.

- **Dispositivos independentes, teste anterior intacto:** duas sessões com base atividade 2 fazem um incremento cada, offline; ambas aceitam atividade 3. Após reconectar, todas as marcações estão presentes, mas servidor/reabertura ficam em **3**, esperado **4**. Dois simulados legítimos com IDs distintos sobrevivem como dois registros, mas a atividade continua em 3.
- **Confirmação perdida, teste anterior intacto:** reter a resposta HTTP real de um commit depois do servidor responder 200 e gravar atividade 3, enquanto a base local ainda é 2. Provocar `Page.crash`, reabrir offline com atividade 3 e estudar mais uma vez antes da confirmação. Após reconectar/recarregar, **5**, esperado **4**. Certificado preservado. O controle que confirma a base antes do novo estudo passou com 4.
- **Retorno de aba suspensa, controles anteriores:** uma sequência e duas sequências passaram com contagens exatas; limiar de 8 segundos real e de 30 minutos com relógio controlado. Isso confirma melhora em relação ao caso 4→5/7 do parecer anterior.
- **Nove sequências:** pausar B antes da segunda persistência; A adota a primeira após o timeout de vida. Retomar B e aceitar as nove ações pelo handler real antes da consolidação final. Inspeção nativa: `seq=9`, principal `inc=1`, histórico `ant=[3,4,5,6,7,8]`. O snapshot da sequência já incorporada desapareceu do histórico. Esperado **2+9=11**, observado **12 na UI, cache, servidor e reabertura**. Todas as nove marcações sobrevivem. Reproduzido novamente com o mesmo resultado.

O teste ampliado exige todas as marcações, certificado e contagens exatas; não aceita apenas convergência. Os dois ramos de nuvem continuam sujeitos à ambiguidade de contadores agregados e base atrasada. O histórico de seis snapshots soluciona apenas uma janela limitada de adoção parcial.

Recomendação: representar contribuições com identidades estáveis e confirmações por produtor/operação, permitindo repetição idempotente e distinção entre incrementos independentes. Não supor que valores iguais significam a mesma operação, nem descartar a base ainda necessária para deduplicar uma sequência parcialmente incorporada.

## H02 — Média — configuração canônica em contexto inerte ainda é aceita

Locais: [`web/verificar_publicacao.py:454`](https://github.com/YNPHAX/EEAR/blob/2f6cad6/web/verificar_publicacao.py#L454), regex do script e lista de elementos; linhas 473–482, reconhecimento de contexto por contagem textual.

Os **12 gates anteriores passaram**, incluindo a rejeição dos antigos comentários JS, `application/json`, `if(false)` e arquivo externo que sobrescreve a configuração. A nova sonda `hosting-contexto-auditoria.py` usa o script exato emitido pelo build e comprova o resultado no parser real do Chromium, com todas as requisições bloqueadas:

| Entrada | `verificar-hosting ... eear-teste` | Firebase executado no navegador | Resultado |
|---|---|---|---|
| Script canônico ativo | exit 0 | Sim, `eear-teste` | Controle passou |
| `<script type="text/plain">` envolvendo o script canônico | **exit 0** | **Não** | Falso aceite |
| `<template><!-- </template> -->` + script canônico + `</template>` | **exit 0** | **Não** | Falso aceite |

A primeira entrada é texto cru de outro script; `script` não está na lista `INERTES`. Na segunda, o fechamento textual dentro do comentário equilibra a contagem do verificador, mas não fecha o template no parser HTML. Ambos os falsos aceites foram repetidos. Não houve SDK, OAuth real ou publicação; os artefatos foram montados em diretórios temporários.

Impacto comprovado: a barreira aceita como homologação um artefato em que a configuração Firebase não executa. **Não demonstrei conexão com produção ou vazamento de credenciais nesses casos.** H01 mantém o projeto restrito, mas sua validação do artefato continua dependendo desse verificador incompleto.

Recomendação: validar uma estrutura HTML inequívoca por parser, com posição/ancestrais e conteúdo exatos, ou comparar a entrada normalizada contra um template gerado de confiança. Aumentar uma lista textual de contextos não fornece as mesmas garantias do parser.

## N01–N05 — problemas anteriores persistentes

As reproduções e os critérios de `76c013d` foram executados **antes das adaptações dos outros testes** e permaneceram inalterados. Sequências completas e causas no [relatório anterior](firebase-codex-noturna-8bd32d2.md); resultados desta rodada nas [evidências](firebase-codex-2f6cad6-evidencias.txt).

| ID | Gravidade | Evidência no novo SHA e localização |
|---|---|---|
| N01 | **Alta** | Quota real: UI aceita tarefa, principal/diário não a contêm, mensagem afirma “salvo neste aparelho”, nenhum alerta no Plano; fechar/liberar quota/reabrir perde a tarefa. `02-progresso-nuvem.js:117,338`, `14-abas.js:68` |
| N02 | **Média** | “Sair e apagar” e “Excluir conta” deixam diário com nome/progresso fictícios, inclusive após recarregar. `09-contas.js:24` remove a principal antes de calcular pendências em `15-diarios-pendentes.js:44` |
| N03 | **Alta** | Sessão legítima em outro contexto recria documento/nome após exclusão confirmada; novo login já retorna 400 no Auth emulado. `09-contas.js:124`, `02-progresso-nuvem.js:288`, `web/firestore.rules:35` |
| N04 | **Média** | Importar `cfg.dias=null`, `cfg.excl={}` ou `cfg.nome={}` persiste tipo inválido e gera erros após recarregar; primeiros dois bloqueiam Plano › Dados. `01-base.js:135`, `07-eventos.js:170` |
| N05 | **Baixa** | Diário órfão com JSON explicitamente ilegível é descartado sem cópia/quarentena. `14-abas.js:43,115,134` |

N03 é confirmado nos emuladores; não medi a janela de revogação de tokens no Firebase real. Não houve bypass entre UIDs. N05 usa corrupção deliberada e não prova escrita parcial de um `setItem`. N01 não exige persistência impossível sob quota: exige preservação **ou aviso correto**, e o candidato falhou em ambos nesse ramo.

Recomendações anteriores continuam aplicáveis: avisar falhas de persistência em qualquer tela/papel da aba; remover todas as cópias pessoais conforme a confirmação da UI; coordenar exclusão com sessões antigas; validar esquema antes da persistência; preservar dados ilegíveis para recuperação.

## Regressões, segurança e limites

F02/F03/F04 passaram em **3/3** casos do ciclo de sessão no build do candidato. O comentário corrigido F06 continua explícito sobre `cfg.nome` em `web/firestore.rules:7`. F05 preservou as recusas de artefatos Firebase nos modos oficiais de site/APK. F07 mantém a construção da fixture sem herdar configuração Firebase externa. A revisão não encontrou alteração dessas proteções nos arquivos correspondentes.

A matriz REST independente passou **8/8**: próprio get permitido; outro UID, anônimo, listagem, query, agregação, subcoleção e batch misto recusados; batch sem escrita parcial. Essas regras validam o envelope, mas mantêm `dados` como JSON string: não substituem a validação de configuração que falhou em N04.

H01: hook `predeploy` ligado ao diretório e projeto efetivos; testes locais recusaram projeto diferente de `eear-teste`, projeto vazio, diretório ausente, build oficial e material proibido. H03: emulador HTTP retornou 200, `Cache-Control: no-cache`, `nosniff`, `noindex, nofollow` e política de referrer para `/`, `/index.html`, `/app.js`, `/sw.js` e manifesto. O handler reservado `/__/auth/handler` retornou 404 no emulador; isso **não certifica nem reprova OAuth real**. Sem reescrita que intercepte o handler.

Sem Web Locks, o candidato ainda usa heartbeat de 2 segundos, timeout de 8 segundos em primeiro plano e 30 minutos em segundo plano, com varredura de 3 segundos. Uma aba viva pode parecer órfã; os controles de retorno simples passaram, nove sequências falharam e a corrida F13 permanece. O teste de 30 minutos controla somente o relógio; não é medição de suspensão real por 30 minutos em Safari/Android. Crash sem `pagehide` com registro de segundo plano pode adiar a adoção por mais de 30 minutos.

`espelhar()` pede transação `{durability:'strict'}` e `commit()`, porém o caminho rápido retorna `Promise.resolve()` antes de `oncomplete` e não sinaliza aborto assíncrono; o fallback também resolve falhas silenciosamente. Não classifiquei isso sozinho como uma perda adicional reproduzida: N06/N07 exigiram commit efetivo, afastando essa ambiguidade. Falhas de IDB, quota, navegadores sem a API e versões futuras do banco ainda precisam de sinalização e política de recuperação explícitas. O controle sem IndexedDB preservou sessão e estudo no fechamento/reabertura normal; não garante durabilidade após crash.

Líder pausada por Debugger reteve progresso na principal e diário, mas não enviou durante sete segundos; retomou ao liberar a pausa. É limitação de disponibilidade, distinta de perda definitiva. O teste anterior de líder que passa a segundo plano e libera a liderança passou.

## Testes executados

| Teste contra 2f6cad6 | Resultado |
|---|---|
| `f01-abas.test.js`, original | **8/8** |
| `noturna-integridade.test.js`, original | **6 falhas/7**: N02 (dois fluxos), N03, N05, F09 (dois fluxos); diário futuro preservado |
| `noturna-falhas.test.js`, original | Quota **falhou**; seis abas/150 alterações **152/152**; pausa da líder sem envio até retorno; sem IndexedDB **passou** |
| `noturna-seguranca.test.js`, original | Regras **8/8**; três configurações malformadas **falharam** |
| `noturna-confirmacao.test.js`, original | **Falhou 5/4**; controle com `EEAR_ACK_CONFIRMAR_ANTES=1` **4/4** |
| `concorrencia-fallback.test.js`, ponto original | **Passou** |
| Mesmo teste, `EEAR_F13_PONTO=ultima-conferencia` | **Falhou duas vezes**, B perdida em UI/cache/servidor |
| `orfaos-auditoria.test.js`, controles anteriores de retorno | **3/3** |
| Mesmo teste, nove sequências | **Falhou**, 12/11, repetido |
| `duravel-candidato.test.js` | **2/4**: marcação e Zerar passaram; Zerar+estudar e duas quedas falharam; ambos repetidos |
| `diarios-auditoria.test.js`, original | **8/8**, incluindo F10/F11/F12, quatro abas/200 alterações **202/202** |
| `f01-riscos.test.js`, original | **5/5**; F08 de uma única aba executado adicionalmente e **passou** |
| `ciclo-sincronia.test.js` no build do candidato | **3/3** |
| Migração real de diário 8bd32d2 por três abas do candidato | **Passou**, seq sem `ts`/`ant`, contagens **3/3/3**, reabertura **3** |
| `orfaos-auditoria.test.js`, crash-processo original sem Web Locks | **Passou**, Browser.crash após 1.200 ms; recuperação local e servidor, atividade **3** |
| `firebase-emulador.test.js` do candidato, com config externa inexistente e sonda de abas | **50/50**, incluindo Google emulado, sessão offline, certificados, regras e F07 |
| `plataforma.test.js` completo do candidato | **241 verificações aprovadas, zero falhas**, exit 0, incluindo os três testes duráveis do autor |
| `hosting-auditoria.py` e `hosting-gates-auditoria.py` | **11/11** e **12/12** |
| `hosting-contexto-auditoria.py` | Controle ativo passou; **dois falsos aceites**, repetidos |
| Hosting HTTP emulado | Cinco recursos de entrada **passaram** |
| Autoteste do verificador | **193/193** |
| `validar`, `conferir-workflows`, `montar_app.py --conferir` | **Passaram** |
| Sintaxe dos testes alterados e ESLint dos quatro arquivos JS | **Passaram**, sem avisos; parser Python do novo teste também passou |

Os critérios não foram relaxados. F13 conserva o ponto antigo por padrão e adiciona outro ponto nativo; a leitura readonly de IDB apenas reforça as pré-condições. O teste de órfãos mantém uma/duas sequências por padrão e amplia a quantidade por variável; exige todas as marcas e contagem exata. N01–N05 e os oito F01 não foram alterados. Testes de erro de preparação são identificados separadamente, sem serem contados como vulnerabilidade.

Comandos adicionais, com as mesmas dependências/variáveis de F01 e emuladores executados sequencialmente:

```sh
export EEAR_REPO_ALVO=/caminho/do/snapshot-2f6cad6
node testes/duravel-candidato.test.js
EEAR_F13_PONTO=ultima-conferencia node testes/concorrencia-fallback.test.js
EEAR_ORFAOS_CENARIOS=segunda-escrita-8s EEAR_ORFAOS_SEQUENCIAS=9 node testes/orfaos-auditoria.test.js
EEAR_REPO_LEGADO=/caminho/do/snapshot-8bd32d2 node testes/diario-legado-auditoria.test.js
python3 testes/hosting-contexto-auditoria.py "$EEAR_REPO_ALVO"
```

`EEAR_DURAVEL_CENARIOS` permite selecionar `marca,zerar,zerar-estudar,duas-quedas`. Dependências locais: Node 24.22.1, Java 21.0.13, Firebase CLI 15.35.0, SDK 12.19.0, Playwright 1.63.0/Chromium; CI usa Node 22. As sondas não alteram o runtime; só os testes de ciclo de sessão expõem funções no transporte HTTP de teste, conforme seu gancho já existente. Os novos crashes usam o processo real do navegador e inspeção da origem antes de carregar o app.

## CI do SHA exato

| Workflow | Run | Resultado conferido |
|---|---|---|
| Site | [43149221175](https://github.com/YNPHAX/EEAR/actions/runs/43149221175) | **success**, job `montar` passou, publicação **skipped** |
| App Android | [43149221209](https://github.com/YNPHAX/EEAR/actions/runs/43149221209) | **success**, APK/verificação passaram, publicação **skipped** |
| Testes | [43149221266](https://github.com/YNPHAX/EEAR/actions/runs/43149221266) | **success**, plataforma e Firebase passaram |

Metadados de cada run indicam `head_sha=2f6cad6ebba53d0f86319dcada671fe9396f8111`; logs dos quatro jobs de validação confirmam checkout desse SHA e execução. Não há falha de infraestrutura nesses três runs. Google foi exercitado **no emulador** no CI, sem e-mail gravado no documento. Não realizei login Google em Firebase real nem teste de OAuth em APK/dispositivo físico.

O CI executa `testes/abas-duravel.js`: duas quedas **isoladas**, uma por perfil, 1.200/300 ms após marcação simples, mais isolamento por prefixo de identidade. O teste cria a semente por `setItem` e fecha limpo antes do estudo. Não cobre o mesmo escritor com recibo antigo, Zerar+estudo+queda, confirmação efetiva de transação, recuperação seguida de segunda queda, nem as intercalações F13/F09 ampliadas. O teste antigo de leitura atrasada usa uma leitura falsificada; a sonda adicional usa operações reais. H02 tem exemplos fixos, mas não comprova o contexto de execução pelo parser. Portanto **o CI verde não demonstra os invariantes de durabilidade e publicação pedidos**.

Os testes usuais de exclusão conferem documento/sessão/chave principal, mas não a ausência de todos os diários e espelhos pessoais; por isso podem passar junto de N02. Os oito F01 continuam úteis e intactos, mas não exercitam segunda queda, GC depois da carência nem o descarte de uma base já incorporada fora do histórico de seis sequências. Passagem dessas matrizes não foi extrapolada para esses caminhos adicionais.

## Entrega e parecer

Somente testes e relatórios foram acrescentados/atualizados; nenhuma correção de produção foi aplicada nesta rodada. As falhas ficam disponíveis para correção e revisão independente. Logs selecionados, parâmetros, hashes dos testes e resultados estão em [firebase-codex-2f6cad6-evidencias.txt](firebase-codex-2f6cad6-evidencias.txt).

Prioridade de correção: F13/N07 (eliminação da última cópia recuperável), N01 (salvamento afirmado sob falha), N06 (reset na recuperação), F09 (identidade/idempotência de operações) e H02 (contexto executável); tratar N02/N03/N04 e quarentena N05 antes de considerar a integração encerrada. Cada correção deve ser reavaliada no SHA final com os controles positivos e as reproduções que falharam, sem trocar a exigência por simples ausência de erros JavaScript.

**REPROVADO no SHA 2f6cad6.** Há perda silenciosa comprovada e a barreira de homologação ainda aceita artefatos inválidos. Não há autorização técnica para avançar baseada apenas nos oito F01 ou no CI.

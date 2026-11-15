# Auditoria de propriedades e integridade — c186008

**Parecer: REPROVADO para avançar à homologação controlada.** Duas causas novas permitem restaurar histórico apagado; uma delas também duplica simulados. As reproduções usam o bundle exato do candidato, interface pública, armazenamento nativo do Chromium, SDK Firebase real e emuladores locais. Não há autorização de produção.

## Escopo, proveniência e independência

- Candidato: `c186008012ba12709fc07c08e36532471a894a8c`, branch `codex/eear-correcao-estrutural`.
- Runtime informado e conferido: `5b3f9d4cfec2a5597d57aab543d6358e4024a85a`.
- Árvore do candidato obtida diretamente da API GitHub: `f67b043072689175fc1a010fcf9b69b1ba44325c`.
- `curso/app.js`: 253.286 bytes; blob GitHub `2d8a0fc584e4a898347bf05d30b0415881dd3711`; SHA-256 `115d8af1fef7b82da3a006103512bfd6ac0897b5b43ba8eaf3b3962ed1c0cf9b`.
- `web/firestore.rules`: blob `c7f48ae092901bf46583915d81affa1206579d8f`.
- Os blobs de app e regras são iguais nos dois SHAs. Entre runtime e candidato mudaram documentação/instruções e a preparação de três requisições do teste Firebase; não mudou o app.
- [Manifesto](c186008/runtime-manifesto.json): **387 arquivos** de runtime, dados, testes, workflows e configuração comparados com a árvore obtida do GitHub. Os runners conferiram os arquivos antes/depois de cada comando; a fixture nova exige o SHA-256 acima e igualdade byte a byte entre bundle publicado e servido. A álgebra extrai trechos byte a byte desse mesmo bundle, com normalizador mínimo declarado, e não substitui as provas no navegador.
- Esta entrega altera exclusivamente testes/documentação na branch independente `auditoria/firebase-c186008-propriedades`. Não altera main, desenvolvimento, Claude ou auditorias anteriores. Nenhum merge, deploy, publicação de regras, Firebase real ou dado real.

**Declaração de participação:** este mesmo agente participou da implementação anterior, inclusive IA05/IA06. Esta é uma nova rodada de testes com oráculos separados e runtime imutável; não constitui independência organizacional nem substitui revisão por outra pessoa/equipe.

Foram consultados os relatórios IA01–IA04/IA05–IA06, as evidências antes/depois e os testes originais preservados no candidato. As reproduções históricas foram executadas nos respectivos SHAs antigos, não confundidas com falhas atuais.

## IA07 — Alta — identidade de simulado depende da ordem dos campos JSON

**Impacto:** dois aparelhos importando a mesma origem canônica criam dois registros do mesmo simulado. Se A já importou e zerou essa origem, a primeira importação atrasada de B restaura o simulado apagado. O resultado incorreto chega à nuvem, a um terceiro dispositivo e sobrevive a crash/reabertura. A atividade numérica permanece 2 no primeiro caso e 0 no segundo: olhar somente contagens não detecta a corrupção do histórico.

**Causa:** [`14-abas.js:43`](https://github.com/YNPHAX/EEAR/blob/c186008/curso/app/14-abas.js#L43) gera a chave de um simulado antigo com `JSON.stringify(x) + '#' + i`, preservando a ordem original dos campos. Já [`12-identidades-importacao.js:17`](https://github.com/YNPHAX/EEAR/blob/c186008/curso/app/12-identidades-importacao.js#L17) calcula SHA-256 após ordenar as chaves. `operacoesLegadas`, linhas 43–48, utiliza os caminhos produzidos pela primeira função: o mesmo recibo não implica os mesmos caminhos de operação. O tombstone de um caminho não cobre a outra serialização.

**Contraexemplo mínimo, semente 1:**

1. Origem antiga sem `_ops`, atividade 2 e um simulado `{d:'2026-11-15',tipo:'materia',mat:'por',prova:null,r:{por:[1,2]},min:5}`.
2. A e B importam offline; o gerador apenas permuta recursivamente a ordem das propriedades em B, mantendo arrays e valores. O próprio app gera o **mesmo** recibo `094e9eaf375b582367fdf21f2e00ac7ec9c051f3d36b7cacf4f88ff6f8249287`.
3. Reconectar A e depois B: esperado **1** simulado, observado **2**.

Variante mínima de reset: A importa → A Zerar confirmado → B importa a permutação offline → B reconecta. Esperado **0**, observado **1**. Não houve atividade nova de B. Não é ambiguidade de proveniência entre backups diferentes: a semântica JSON e a identidade calculada pelo próprio app são iguais.

**Evidência:** [contraexemplos-resultados.json](c186008/contraexemplos-resultados.json), casos `idempotencia-simulados-canonicos` e `reset-simulados-canonicos`; inclui origens, recibos, metadados e estados aceitos/local/remoto/terceiro dispositivo/pós-crash. [Propriedades](c186008/propriedades-resultados.json) preservam semente, sequência completa e redução por eliminação até contraexemplo 1-mínimo de cada propriedade. São 1.024 casos canônicos explorados; o JSON registra a primeira falha de cada classe, não afirma que todos falharam.

**Proposta, não implementada nesta auditoria:** usar identidade estrutural canônica consistente para todos os registros legados, incluindo simulados; provar migração dos caminhos/tombstones já existentes antes de mudar o esquema. Não apagar metadados nem aplicar deduplicação visual como substituto da correção causal.

## IA08 — Alta — marcador numérico importado impede Zerar de remover erros

**Impacto:** erros observados e zerados reaparecem após sincronizar com uma atividade concorrente. Importação, armazenamento e sincronização aceitam o estado, e a UI termina com “Progresso salvo na sua conta.” A falha também persiste após crash/reabertura.

**Causa:** [`01-base.js:175`](https://github.com/YNPHAX/EEAR/blob/c186008/curso/app/01-base.js#L175) só exige que `Number(certsZ)>0`. O número finito `1e30` é aceito, mas `1e30 + 1 === 1e30`. [`07-eventos.js:172`](https://github.com/YNPHAX/EEAR/blob/c186008/curso/app/07-eventos.js#L172) não consegue avançar o marcador ao zerar. [`14-abas.js:125`](https://github.com/YNPHAX/EEAR/blob/c186008/curso/app/14-abas.js#L125) depende desse avanço para distinguir reset de correção de erros. Gera correção condicional em vez de tombstones; o erro concorrente faz os erros históricos reaparecerem.

**Sequência mínima, semente registrada `0xC186008`:**

1. A importa backup aceito com `cfg.certsZ=1e30`, `erros['POR01-0']=2`; B recebe esse estado e fica offline.
2. A Zerar; nuvem confirma erros vazios. O marcador continua `1e30`.
3. B erra a mesma questão uma vez offline, total local 3; sofre `Page.crash`, reabre e recupera os 3.
4. B reconecta. Esperado **1** erro novo, observado **3** na nuvem e após nova reabertura.

O controle idêntico com marcador normal 0 termina com **1/1**, inclusive crash/reabertura. A manipulação é somente do backup fictício; não há bypass de UID nem exploração do Firebase real. O problema é validação e integridade do próprio histórico, não permissão entre usuários.

**Evidência:** casos `controle-reset-normal` e `reset-marcador-inseguro` em [contraexemplos-resultados.json](c186008/contraexemplos-resultados.json), com estados antes/depois e a mensagem da UI. A propriedade do núcleo confirma a mesma causa.

**Proposta, não implementada:** validar limites/representação dos marcadores importados e distinguir reset por identidade causal explícita, sem depender de incremento de número arbitrário vindo do backup. Preservar/quarentenar entradas incompatíveis e testar migração; não ajustar apenas o contador final.

## Matriz executada e resultados negativos preservados

O [resumo dos quatro arquivos de resultados](c186008/matriz-integral-resumo.json) registra **42 comandos** e hashes antes/depois; há 41 resultados esperados e uma falha inicial não explicada. Os três testes históricos abaixo têm saída 1 esperada porque exigem capacidades do transporte legado desativado. Isso não os torna testes legados aprovados.

| Grupo | Resultado desta execução |
|---|---|
| Firebase Emulator | **53/53**, regras, UID, autenticação, sessão offline, certificados e exclusão |
| F01 original | **8/8**, critérios preservados |
| Persistência independente | **13/13 grupos**, N01–N07 e regressões transacionais F09/F13 |
| Complementos Firebase | Dupla falha, sincronização oficial, seis riscos F01, diários, nove sequências/30 min, crash sem Web Locks, migrações 8bd32d2/2f6cad6 e limite remoto: passaram |
| IA01–IA04 | Controles negativos antigos reproduzidos e **8 grupos positivos** passaram |
| IA05/IA06 | Controle antigo reproduzido; **12/13 gates** passaram inicialmente; `importacoes-crash` falhou uma vez |
| Repetição do crash original | **5/5 execuções isoladas passaram**, teste original inalterado; a falha inicial permanece registrada |
| Plataforma | **166 verificações**, sem falhas |
| F02–F07 | Ciclo de sessão `recusa/callback/saida`, isolamento de publicação e fixtures passaram; comentário sobre `cfg.nome` preservado |
| H01–H03 | Autoteste **193 casos**, sondas, gates automáticos e contextos inertes H02 passaram |
| Montagem, integridade, workflows e lint | Passaram |
| Build e barreiras site/app | Passaram; nenhum deploy; APK não recompilado localmente, CI Android conferido separadamente |
| Álgebra de transferência/importação do candidato | Passou, sem alterar asserções |
| Carga | 12.000 operações de núcleo; 2.000 marcações em quatro abas e dez resets no navegador: passaram nos critérios de contagem/durabilidade |
| Atualização transacional | Passou entre d165485 e candidato, mantendo isolamento do transporte |
| Downgrade histórico | **Falha preservada**, reversão automática de 2f6cad6 não suportada |
| Transporte legado histórico | **Falhas preservadas**, não reativado |
| `epoca-nuvem` cenário 9 histórico | **Falha preservada**, não convertido em teste oficial Firebase |

**Falha intermitente original:** `importacoes-crash.test.js:19`, após Zerar e marcar, a primeira leitura exportada de `act[hoje]` foi `undefined` em vez de 1. Cinco repetições isoladas passaram sem alteração do teste. A função de verificação captura exportação antes de esperar o indicador local e depois verifica o checkpoint; a execução inicial parou na primeira asserção e não capturou checkpoint suficiente para concluir perda durável. Não atribuo a falha à infraestrutura sem prova e não a apago por ter passado depois. É risco a investigar com intercalação controlada e captura conjunta de UI/checkpoint/reservas. Não é usada como terceira vulnerabilidade comprovada.

## Propriedades e novos testes

`c186-propriedades.test.js`: xorshift32, sementes **1–512**, seis réplicas em duas contas; **30.720 ações**, oráculo independente de IDs adicionados/removidos para estudo/reset/sincronização/Levar; **1.536 verificações** de idempotência, comutatividade e associatividade em snapshots parciais; **512 históricos causais** de correção, novos erros, Levar repetido e recorreção; **1.024 variantes** de importação JSON canônica, além do marcador inseguro. Eventos identificados/álgebra e os históricos causais passaram. As três propriedades negativas falham com saída 1, preservada.

`c186-contraexemplos.test.js`: UI real, SDK e emuladores; **3 violações confirmadas e 1 controle positivo**, saída 1. A nova fixture usa projeto `demo-eear-properties-c186`, Auth 9399/Firestore 8380 e permite rede apenas para o servidor local/esses emuladores; o SDK gstatic é servido do pacote local. Configuração do HTML é fictícia; `app.js` não é modificado. `Page.crash` derruba o renderizador; os testes originais de persistência e `importacoes-crash` complementam com `Browser.crash` e perfil persistente.

O teste novo de fluxos registra seis sementes, três abas, duas contas/dispositivos, Web Locks presente/ausente, abort nativo de `put`, recuperação, HTTP 200 efetivo com resposta retida seguido de crash, reconexão, certificados, Zerar, Levar, reimportações e sair/entrar. **As seis sementes passaram**, com 117 ações registradas; resultados finais e preparações anteriores estão nas evidências. As asserções de contagem/certificados não são reduzidas.

**Ajustes de preparação documentados:** o indicador `#sync` só existe na tela Plano; navegar até ela precede a observação. O primeiro fluxo assumia reset global sem A ter observado o último evento de B; a preparação correta reabre A e exige todos os IDs/contagens antes de Zerar. Com Web Locks, recarregar a líder mantendo a seguidora aberta transfere a liderança; exigir confirmação remota na antiga líder gera timeout de teste. A preparação fecha/reabre a seguidora durante essa barreira, preservando três abas nas fases concorrentes. As tentativas anteriores foram preservadas em [preparacoes-anteriores.txt](c186008/preparacoes-anteriores.txt) e não são classificadas como novas falhas do app. O fluxo corrigido passou 6/6 sem mudar os resultados exigidos. Não se modificou nenhum teste adversarial original.

## Exclusão, regras e compatibilidade

IA01–IA06 passam nos cenários originais, ressalvada a execução intermitente de crash acima; **IA07/IA08 ampliam a cobertura e impedem declarar integridade completa**. As importações concorrentes antigas com 8/5 e 11/5 e a transferência de erros 3/1 reproduzem no controle a6366a8 e passam nos casos equivalentes do candidato. As novas falhas não invalidam esses resultados específicos.

A proteção de exclusão contra cliente antigo **depende das regras novas**: exclusão de `alunos/{uid}` exige tombstone atômico em `exclusoes/{uid}`; recriação com token antigo é recusada; o tombstone não pode ser apagado/alterado pelo aluno. O envelope remoto v4 impede escritores v2/v3 de substituir o documento migrado. Testes contrafactuais de regras antigas preservam a demonstração dessa dependência. Tudo foi exercitado em emuladores; não verifiquei nem publiquei as regras efetivamente instaladas no projeto real. Dados locais em outros aparelhos offline não são apagados remotamente por essa barreira.

Respostas atrasadas de exclusão A não encerraram B nos testes originais, inclusive resposta Auth real retida; importação/exclusão concorrentes, transferência com IDs, abort/quota, migração/quarentena e recuperação após duas quedas passaram nos respectivos controles. Não há alegação de segurança de toda sequência possível.

## Metadados, migração e limitações

O núcleo chegou a **1.826.371 bytes** de estado em 12.000 ações e **2.137.837 bytes** após reset/estudo. Primeiro ponto amostrado acima de 900.000 bytes: **6.000 ações, 910.368 bytes**; não é um limite universal de ações. O navegador, após 2.000 marcas e dez resets, manteve **366.169 bytes** de estado e **826.913 bytes** de checkpoint, com 2.021 recibos. Reset reduz a projeção, não o histórico causal.

A prova de limite importou 910.368 bytes: checkpoint/local/reabertura preservaram **6.002** atividades; servidor permaneceu em 2 e a UI informou a recusa da sincronização. O aviso atual promete envio quando a nuvem voltar, mas reabrir sozinho não remove o limite estrutural. É uma limitação operacional persistente: exportação/recuperação manual e plano de armazenamento remoto são necessários. Quota real do navegador, encerramento abrupto e APIs indisponíveis também não equivalem a garantia de persistência física. Não implementei compactação ou descarte causal.

Backups diferentes sem proveniência podem conter estudo sobreposto; não se pode inferir independência automaticamente. Isso não justifica IA07, cuja identidade canônica é comprovadamente igual. Migração identificada preserva IDs/tombstones/contexto; backups antigos têm teto explícito de 10.000 unidades de contagem por arquivo. Transporte antigo permanece desativado; importação é explícita, não conversão automática do backend.

Downgrade para cliente transacional anterior tem testes de compatibilidade próprios; downgrade automático até 2f6cad6 continua negativo e exige recuperação manual/quarentena. O envelope remoto monotônico depende das regras e não impede um cliente antigo de criar estado local incompatível. Não há prova física em Safari/iOS/WebViews Android, remoção de dados pelo sistema ou OAuth Google real. Mobile é emulação Chromium; login Google foi validado no emulador, não no provedor real.

## CI conferido diretamente no GitHub

| SHA | Testes | Site | App Android |
|---|---|---|---|
| `c186008` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43664369716) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43664369753) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43664369698) |
| runtime `5b3f9d4` | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43662098445) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43662098405) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43662098387) |

No runtime, job `firebase-emulador` falhou na verificação de documento mínimo/limite: a preparação ainda enviava envelope v3 no caso que deveria ser aceito, incompatível com as regras v4. O candidato muda esses três envelopes para v4, mantendo as recusas de campo ausente/tamanho e as demais asserções. É falha do contrato do teste naquele SHA, não evidência de infraestrutura nem de falha de isolamento. A execução atual passou 53/53. Logs originais e respostas da API estão preservados.

Nos runs atuais, quatro jobs obrigatórios de Testes passaram; histórico legado manual foi skipped. Publicações Site/Android foram skipped. Não disparei workflows/deploy. As branches `auditoria/**` não estão no filtro de push dos workflows; o commit desta auditoria não herda o CI do candidato. CI verde não cobre os contraexemplos novos.

## Reprodução e arquivos

Obter o candidato em checkout detached `/tmp/eear-audit3-runtime` e os controles nos SHAs indicados pelos runners. Instalar dependências fora do repositório: Node local 24.22.1, Java 21.0.13, Playwright 1.63.0, Firebase SDK 12.19.0, CLI 15.35.0 e ESLint 9.17.0. CI usa Node 22; não equiparo as versões.

Definir `NODE_PATH`, `PLAYWRIGHT_BROWSERS_PATH`, `EEAR_FIREBASE_SDK`, `EEAR_FIREBASE_CLI`, `EEAR_REPO_ALVO` e `EEAR_AUDITORIA_SAIDA` para caminhos isolados; o diretório de saída deve existir. Executar na branch de auditoria:

```sh
node testes/c186-propriedades.test.js
node testes/c186-contraexemplos.test.js
node testes/c186-fluxos.test.js
```

Novos testes no commit `3443ecbc191066706611bd89d0883ba2f20ea442`; lint completo incluindo esses arquivos: saída 0, sem avisos.

Os dois primeiros comandos **devem retornar 1 no candidato reprovado**; não converter em aprovação. Executar sequencialmente as provas de navegador porque usam as mesmas portas. Os runners exatos da matriz original estão em [matriz.py](c186008/matriz.py), [extras.py](c186008/extras.py) e [executar.py](c186008/executar.py), com caminhos/variáveis do ambiente registrado. [evidencias.txt](c186008/evidencias.txt) contém saídas por comando; os JSONs preservam resultados, metadados e estados completos fictícios. Não é preciso serviço pago ou Firebase real.

## Decisão

**REPROVADO** no SHA exato `c186008012ba12709fc07c08e36532471a894a8c`. Corrigir IA07/IA08 em branch de desenvolvimento, investigar a intermitência do crash e repetir as provas sem reduzir critérios; manter as negativas do legado, limites e dependências de regras explícitos. Nenhuma correção de runtime foi aplicada nesta auditoria. Uma pessoa/equipe sem participação na implementação deve revisar as causas, a migração proposta e o próximo SHA antes de autorizar homologação controlada.

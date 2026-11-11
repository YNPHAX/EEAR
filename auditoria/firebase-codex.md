# Auditoria independente da integração Firebase — EEAR

Atualização posterior: [Hosting em ce548dd, CI confirmado e preparação do gate de F01](firebase-codex-ce548dd.md). O parecer continua REPROVADO.

Data: 11/11/2026. Repositório: `YNPHAX/EEAR`.

**Parecer: REPROVADO para aprovação da integração em homologação.** Há perda de progresso reproduzida entre abas offline ainda não corrigida (F01). As correções desta auditoria reduzem outros riscos, mas não eliminam esse bloqueador. Testes exploratórios com contas fictícias podem continuar; isto não é autorização para publicar site, APK ou regras.

## Escopo e integridade da revisão

- Código obtido diretamente do GitHub por clone completo. Base congelada: [`5aca0a4e2cd051910de026ef68c96c245f8381a9`](https://github.com/YNPHAX/EEAR/commit/5aca0a4e2cd051910de026ef68c96c245f8381a9), head observado de `claude/eear-study-hydwqt` no início.
- Na conferência final, Claude avançou para `404dbf02adad46a5e117289b3379290e82df672b`. Seu único diff desde a base é `testes/falhas-nuvem.js` (estabilização do teste temporal); não há mudança no código de integração. Não foi incorporado nem alterado. A medição completa de plataforma original abaixo é de `5aca0a4`, não uma execução do novo head.
- Correções exclusivamente em [`codex/auditoria-firebase-eear`](https://github.com/YNPHAX/EEAR/tree/codex/auditoria-firebase-eear). Nenhuma modificação em `main` ou branches Claude; nenhum merge, deploy ou publicação de regras.
- Nenhuma consulta ao projeto real `eear-teste`, aos seus usuários, regras efetivas ou documentos. Firebase executado exclusivamente nos emuladores oficiais, projeto `demo-eear`, dados fictícios. `eear-teste` foi usado somente em configurações fictícias de build.
- Relatórios e descrições de PRs serviram para identificar alegações. As conclusões abaixo vêm do código, diffs, logs do GitHub Actions e testes executados independentemente.

## Achados

### F01 — Alta — perda silenciosa entre abas offline (ABERTO)

Local: `curso/app/02-progresso-nuvem.js`, funções `carregar()` e `salvar()`; chave compartilhada `missao-eear-v1@firebase:<uid>`.

Duas abas da mesma conta carregam cópias independentes de `S`, mas gravam a mesma chave em `localStorage`. Não há conciliação do cache entre abas nem exclusão mútua nessa gravação. A transação do Firestore só concilia o que chega ao servidor.

Reprodução no emulador oficial com o app corrigido:

1. Entrar numa conta fictícia, sincronizar uma marcação inicial e abrir uma segunda aba da mesma sessão.
2. Desligar a rede das duas abas. Marcar `T:aba-1-offline` na primeira e `T:aba-2-offline` na segunda.
3. Fechar a primeira aba e reconectar a segunda.
4. A primeira marcação desaparece do cache e não chega ao Firestore: `cache=false, nuvem=false`.

Comando diagnóstico: `EEAR_SONDA_ABAS=1` junto às variáveis usuais de `node testes/firebase-emulador.test.js`. Resultado: **49 verificações passam; esta sonda falha**, exit code 1. A sonda permanece disponível no repositório, explicitamente fora da execução padrão do CI. Um CI padrão verde não resolve F01.

Não foi aplicada uma união improvisada no `salvar()`: uma sequência de leitura/união/escrita sem coordenação também pode competir entre abas. A correção exige serialização por conta e origem, ou persistência transacional de alterações, incluindo desmarcações, "Zerar", certificados e abas suspensas. Alternativa de produto: bloquear de forma efetiva o estudo simultâneo em outra aba, preservando o que já está pendente. Apenas recomendar "uma aba por vez" não corrige o defeito.

### F02 — Alta — resposta após saída da página sobrescreve cache (CORRIGIDO)

Local original: `02-progresso-nuvem.js`, `conciliar()`; `13-falhas-nuvem.js`, eventos de ciclo da página.

A proteção `saindo` só cobria o envio antecipado do evento `visibilitychange`. Uma transação já iniciada continuava aplicando seu resultado ao cache depois de `pagehide`. Se outra abertura atualizasse o cache nesse intervalo, o resultado antigo apagava essa atualização local.

O teste independente inicia uma conciliação que recebe estudo remoto, suspende sua resposta, dispara `pagehide`, grava uma atualização de outra abertura no cache e libera a resposta. Original: `preservou=false`; corrigido: `preservou=true`.

Correção: impedir novas gravações enquanto a página sai; cancelar timers pendentes; ignorar a aplicação de respostas durante a saída; recarregar o cache ao voltar do bfcache e retomar a sincronização. O transporte já enviado não pode ser cancelado retroativamente; a correção protege a aplicação local e callbacks posteriores.

### F03 — Alta — callback de transação usa estado de outra sessão (CORRIGIDO)

Local original: `02-progresso-nuvem.js`, callback `planejar` de `conciliar()`.

O callback lê o `S` global. Quando a conta muda antes de uma leitura/repetição atrasada do callback, ele prepara dados da conta B usando a referência da conta A. A comparação de conta existente só acontecia depois da operação de nuvem.

Teste com app real no Chromium e transporte controlado: original prepara `{ "T:B": true }` para a referência antiga; corrigido não prepara envio algum para ela e sincroniza B separadamente. **Não foi demonstrada gravação cruzada no servidor**: as regras testadas negam um UID diferente. O achado é confusão de sessão no cliente, não uma afirmação de quebra do isolamento do Firestore.

Correção: validar conta **e objeto de referência** antes de cada planejamento, inclusive repetições do SDK, e antes de confirmar leitura/aplicar resultados. A comparação da referência também distingue duas conexões sucessivas do mesmo UID.

### F04 — Média — erro atrasado desliga sincronização da nova conta (CORRIGIDO)

Local original: `02-progresso-nuvem.js`, `gravar()`.

Uma operação de A fica em andamento; B entra e aguarda a sincronização ocupada; A termina com `permission-denied`. O `catch` antigo zera a referência global, agora pertencente a B, e B deixa de enviar seu progresso.

Reprodução independente: original `ativa=false`, `enviadoB=null`; corrigido `ativa=true`, envio exclusivo de B. Respostas de uma sessão anterior não alteram os estados de erro/retry da atual. O envio pendente da conta atual segue ao terminar a operação antiga.

### F05 — Média — barreira de homologação dependia só de marcador em HTML (CORRIGIDO)

Local original: `web/verificar_publicacao.py`, `HOMOLOGACAO` e `homologacao()`.

O verificador aceitava uma configuração explícita `projectId: "eear-teste"` sem `homologacao: true`, com o marcador falso, ou em um JavaScript separado permitido. No APK, só os HTML de `assets/public` eram examinados por essa barreira.

Cinco novos casos falham contra a implementação original (publicação indevidamente aceita) e passam após a correção. A checagem agora reconhece o projeto de teste independentemente do marcador e examina HTML, JS e JSON, incluindo os assets do APK. Builds normais continuam aceitos; builds de homologação são montados para teste e recusados para publicação.

Limite: proteção contra publicação acidental de configurações literais. Não impede um autor com acesso ao código de remover o verificador ou ofuscar deliberadamente uma configuração.

### F06 — Baixa — descrição incorreta de dados pessoais (COMENTÁRIOS CORRIGIDOS)

Os comentários diziam que o documento não guardava nome. `paraDoc()` serializa o progresso inteiro; `cfg.nome`, usado no certificado e preenchido também pelo `displayName` do login, pode estar dentro de `dados`. Os quatro campos externos não tornam o documento anônimo.

Comentários corrigidos em `web/firestore.rules` e no adaptador Firebase. Nenhum nome foi removido, pois isso alteraria certificados e progresso. O JSON interno continua opaco às regras; campos pessoais arbitrários dentro dele também não são filtrados. Isso deve constar do inventário de dados e da revisão de privacidade.

### F07 — Média — fixture de emulador herdava configuração externa (CORRIGIDO)

Local original: `testes/firebase-emulador.test.js`, `montar()`.

O teste executava o build normal e injetava `EEAR_FIREBASE` logo depois de `EEAR_SITE`. Quando o desenvolvedor tem `web/firebase.json` ou `EEAR_FIREBASE_CONFIG`, o HTML emitido pelo build já contém outra atribuição Firebase **depois** desse ponto. Reprodução com configuração fictícia, sem executar SDK: a sequência final é `demo-eear`, depois `eear-teste`; a última sobrescreve os emuladores. Isso invalida a promessa de isolamento do teste e poderia criar/gravar contas e documentos no projeto configurado externamente.

Neste ambiente não existia configuração local/ambiente do Firebase durante as rodadas anteriores; elas usaram `demo-eear`. A correção força uma configuração temporária `null` no build da fixture e recusa qualquer atribuição Firebase prévia no HTML. O teste de ciclo também bloqueia requisições externas. A nova rodada passou em **49/49 verificações**, incluindo Google, usando deliberadamente `EEAR_FIREBASE_CONFIG` apontando para arquivo inexistente: o build comum falharia; a fixture isolada ignorou-o e executou só os emuladores.

Nenhum achado crítico de acesso cruzado ou credencial secreta exposta foi confirmado no escopo examinado.

## Regras do Firestore

| Controle | Evidência |
|---|---|
| `get`, criação, atualização e exclusão só em `alunos/<request.auth.uid>` | Testes REST e SDK no emulador; outra conta recusada |
| Sem autenticação | Leitura e gravação recusadas |
| `list` e consultas de coleção | Recusadas inclusive para o dono |
| Outros caminhos e subcoleções do próprio UID | Recusados; regra final nega por padrão |
| Envelope de campos | Exatamente `v`, `dados`, `t`, `atualizado`; obrigatórios; extras recusados |
| Tipos | `v` inteiro positivo, `dados` string, `t` numérico; tipos inválidos testados |
| Hora do servidor | Campo ausente ou timestamp fictício recusado; transformação `REQUEST_TIME` aceita |
| Versão | Atualização não diminui `v`; versão futura bloqueia escrita pelo app |
| Tamanho e documento corrompido | Acima do limite recusado; app mantém progresso local e não cobre JSON ilegível |

As expressões de autorização não foram alteradas nesta auditoria. Limites deliberados: `dados` não valida semântica de progresso/notas/certificados; `t` é horário fornecido pelo cliente; o dono pode apagar seu documento e recriá-lo. Certificados e notas não são prova antifraude nem autorização de assinatura. As assinaturas FNV/linhagem do app são controle de compatibilidade, não autenticação criptográfica. Não foi conferida a correspondência entre este arquivo e regras publicadas em qualquer Firebase real.

## Autenticação, reconexão e arquitetura

- E-mail/senha: criação, login, troca, saída, exclusão e reautenticação exercitados pela suíte existente. Redefinição foi revisada no código (`sendPasswordResetEmail`); não foi testada a entrega de e-mail.
- Sessão: o SDK web usa persistência padrão do Firebase no navegador. Testado fechamento/reabertura da mesma sessão, estudo com emuladores indisponíveis e envio na reconexão sem novo login. SDK servido pelo pacote npm fixado, como no CI; isso não comprova disponibilidade offline da CDN real. A reabertura foi no mesmo contexto de navegador; reinício completo do processo/perfil não foi testado.
- Google: login por janela e reautenticação/exclusão passaram no emulador, com acesso aos scripts externos necessários. Não houve OAuth com conta Google real, teste de Safari/iOS ou PWA iOS. O fallback de redirecionamento e armazenamento entre domínios não estão homologados por esses resultados.
- APK: botão Google é ocultado pelo código; login nativo Google não está implementado. Conta exclusivamente Google e reautenticação por janela continuam limitações documentadas.
- Dois dispositivos: 12 marcações simultâneas preservadas no Firestore com transações; certificado fictício preservado em envio, recebimento por outro dispositivo e gravação posterior. Isso não elimina F01, pois dispositivos separados têm caches separados e abas da mesma origem compartilham a chave.
- A sincronização não usa `onSnapshot` nem polling. Um dispositivo ocioso pode ficar defasado até outra conciliação (estudo, reabertura ou retomada com pendência). Não há garantia de atualização instantânea de telas entre dispositivos.
- Credenciais: varredura dos arquivos rastreados e pesquisa em diffs do histórico local completo por chave privada, service account, tokens GitHub e padrão de chave Google não encontraram correspondências. Não é prova de ausência de qualquer segredo possível. A configuração web Firebase é pública por natureza; senha/token de usuário não devem ser serializados no progresso. A configuração local está no `.gitignore` e não entra nos builds por cópia de arquivos.

## Testes e comparação antes/depois

Ferramentas instaladas fora do repositório: Firebase CLI 15.35.0, SDK 12.19.0, Playwright 1.63.0/Chromium 153, ESLint 9.17.0. Java 21 e Node 24.22.1 locais; workflows usam Node 22. Essa diferença é uma limitação de equivalência de ambiente.

| Verificação | Original | Corrigido |
|---|---|---|
| `ciclo-sincronia.test.js`, transporte controlado no app real | 3 falhas reproduzidas | 3/3 passam |
| `firebase-emulador.test.js`, suíte padrão | 32/32 passam, incluindo Google | 49/49 passam, incluindo 17 verificações novas |
| Fixture com configuração ambiente inexistente (F07) | Não isolava a configuração | 49/49 passam sem usar a configuração ambiente |
| Sonda adicional `EEAR_SONDA_ABAS=1` | Não usada na rodada original | 49 passam + 1 falha confirmada (F01) |
| Autoteste de publicação | 175/175 passam; com os 5 novos casos, 5 falhas | 180/180 passam |
| `plataforma.test.js` completa | 227/227 passam localmente; CI original falhou no teste temporal | 227/227 passam |
| Atualização original → corrigido → original → corrigido | — | 7/7 passam, sem perda nos cenários da ferramenta |
| Comparação de conteúdo | — | 69 aulas, 542 cartões; questões, gabaritos, provas, vídeos e calendário iguais |
| Builds normais de site e conteúdo Android + `verificar` | Passam | Passam |
| Configuração inválida/outro projeto/campo extra/bool inválido/modelo incompleto | — | Casos exercitados recusados |
| Builds fictícios `eear-teste`, site e app | — | Marcados; publicação recusada; fixture ZIP de APK com os assets também recusada |
| Montagem JS, sintaxe, ESLint, `validar`, `conferir-workflows`, `git diff --check` | Checks pertinentes executados | Passam |

Não foi compilado um APK Android novo localmente: não há Android SDK instalado neste ambiente. Foi testado o conteúdo de `--app`, o verificador de APK com fixtures e consultada a compilação/checagem do APK original no CI. Fixture ZIP não equivale a APK instalado em dispositivo real.

Evidências resumidas e saídas diagnósticas: `auditoria/firebase-codex-evidencias.txt`. Logs completos da execução local disponíveis na pasta `/tmp/eear-audit-evidence` deste ambiente.

## Workflows e cadeia de PRs #27–#31

Todos os cinco heads abaixo são ancestrais da base auditada; os diffs foram examinados diretamente. Não houve cherry-pick, merge ou alteração nos PRs.

| PR / head | Mudança efetiva no código | CI público consultado |
|---|---|---|
| [#27](https://github.com/YNPHAX/EEAR/pull/27) / `2a128a9` | União, contas, regras Firebase e transações; base da integração | Site, Android e Testes: sucesso |
| [#28](https://github.com/YNPHAX/EEAR/pull/28) / `5d3575d` | Época `ep` invalida bases após documentos antigos | Site, Android e Testes: sucesso |
| [#29](https://github.com/YNPHAX/EEAR/pull/29) / `1993599` | Linhagem `lin`, base só com ancestral confirmado; colar descarta base | Site, Android e Testes: sucesso |
| [#30](https://github.com/YNPHAX/EEAR/pull/30) / `7f425b6` | Caminho `progresso2` e migração sem gravar em `progresso` | Site, Android e Testes: sucesso |
| [#31](https://github.com/YNPHAX/EEAR/pull/31) / `a78a6b9` | Reversão com regras dos dois caminhos e modelo da regra padrão do Claude | Site, Android e Testes: sucesso |

`progresso2/{self}`, `web/regras-claude.json` e as permissões do serviço Claude são distintos de `alunos/{uid}` e `web/firestore.rules`. O resultado real do serviço Claude relatado nos PRs não foi reproduzido por este auditor; os testes locais dessa cadeia usam modelos. As correções atuais não substituem a barreira de caminho dos PRs #30/#31.

No head inicial `5aca0a4`:

- [Site](https://github.com/YNPHAX/EEAR/actions/runs/42963350977), [Android](https://github.com/YNPHAX/EEAR/actions/runs/42963351024) e [Videoaulas](https://github.com/YNPHAX/EEAR/actions/runs/42963351060): sucesso.
- [Testes](https://github.com/YNPHAX/EEAR/actions/runs/42963351117): **falhou**. Logs do job `plataforma` mostram uma falha em "página fechando: o envio antecipado não começa"; job `firebase-emulador` passou, incluindo Google.
- Android: compilação e conferência interna do APK passaram; envio de artefato/publicação foram pulados. Os workflows Site/APK exigem execução manual em `main` e `inputs.publicar`; isso foi conferido no código. Configurações externas de proteção do GitHub não foram auditadas.

O commit paralelo `404dbf0` espera que o timer normal ainda envie após `pagehide`; a proteção de F02 desta auditoria passa deliberadamente a cancelar esse timer. Ao integrar no futuro, revisar o conflito nesse teste e preservar as reproduções de F02–F04.

O teste temporal de fechamento foi estabilizado com relógio controlado; agora avança 1,7 s e confere também que o timer pendente não envia após a saída. Não foi reduzida a exigência de preservação. O workflow `Testes` passou a incluir `codex/**` e a reprodução independente de ciclo de sessão; nenhum gatilho de deploy foi acrescentado.

Na branch de auditoria, o run [43030477582](https://github.com/YNPHAX/EEAR/actions/runs/43030477582), commit `15173cc`, já confirmou sucesso de `firebase-emulador`. O job `plataforma` ainda estava em andamento na consulta registrada; não é declarado aprovado. O commit final de documentação pode iniciar nova execução; nenhuma execução de publicação foi disparada.

## Commits disponíveis para revisão

- [`4601a9d`](https://github.com/YNPHAX/EEAR/commit/4601a9dcdbebba5a543474fdf9c5a4c4d4810121): F02–F04, regressões de ciclo de sessão, teste de fechamento e execução de testes em branches Codex.
- [`c836538`](https://github.com/YNPHAX/EEAR/commit/c836538a061eba03a896b0bec3b2678aa735211b): F05 e cinco regressões de publicação.
- [`15173cc`](https://github.com/YNPHAX/EEAR/commit/15173cca8059082ebd87a848a82b5176a6e79072): matriz adicional do emulador, sonda de F01, documentação dos testes e comentário das regras sobre dados pessoais.
- [`96eaf65`](https://github.com/YNPHAX/EEAR/commit/96eaf65bcd7da3bb3eef29bda41d6a03951c8570): F07, isolamento das fixtures contra configuração Firebase externa.
- O commit deste relatório registra as evidências e o parecer; não altera o comportamento do app.

## Pendências que impedem uma aprovação ampla

1. Corrigir F01 e fazer a sonda passar sem excluir marcas, desmarcações, certificados ou progresso de outras abas; acrescentar cenários de recarregamento, suspensão e "Zerar".
2. Validar em dispositivos reais: Safari/iOS, PWA iOS, Android e fluxo Google aplicável. Confirmar restrições de domínio/chave, provedores, regras efetivas e proteção contra enumeração no console, somente com autorização para essas operações.
3. Tratar dados pessoais em `dados`; certificados são controlados pelo cliente e não devem ser usados como prova de integridade, matrícula ou pagamento.
4. Exclusão de conta/documento não é atômica nem completada no servidor; abas com operações em andamento e tokens ainda válidos exigem desenho específico. O teste de exclusão parcial passa, mas não prova ausência de toda recriação posterior.
5. Medir cotas, tamanho crescente do documento e custo de transações; SDK CDN em abertura offline, App Check, abuso de criação de contas e armazenamento local legível no perfil do navegador continuam limitações. Não foram acessadas métricas nem dados reais.

**Conclusão:** as correções estão isoladas e são revisáveis. A integração permanece **reprovada** pelo defeito reproduzido de perda de dados; um CI verde na suíte padrão não deve ser usado como aprovação enquanto F01 estiver aberto.

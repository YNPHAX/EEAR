# Auditoria complementar — Hosting e preparação de F01

Atualização posterior: [parecer final independente de b2a369b](firebase-codex-b2a369b.md). A correção foi recebida e testada; o parecer continua **REPROVADO**.

Data: 11/11/2026. Snapshot independente: [`ce548dda6b6bde287eec708c7d7896047befc82e`](https://github.com/YNPHAX/EEAR/commit/ce548dda6b6bde287eec708c7d7896047befc82e), branch `claude/eear-study-hydwqt`.

**Parecer mantido: REPROVADO.** Esta etapa não é a auditoria final da correção de F01. Aguarda-se o commit do Claude que a implementará; a aprovação dependerá dos testes independentes e da preservação de F02–F07.

## Escopo e preservação

- Snapshot obtido diretamente do GitHub e examinado em worktree detached, separado de `codex/auditoria-firebase-eear`. Não houve alteração na branch do Claude, merge, deploy, publicação de regras ou acesso a usuários/documentos reais.
- O commit acrescenta `firebase.json`, `.firebaserc`, `--homologacao`, validação de `authDomain`, mensagens de login e uma ferramenta REST de isolamento. O código de conciliação de progresso não corrige F01 nesta etapa.
- F02–F07 permanecem na branch Codex: comparação com `1d692f3` confirma ausência de alteração no código do app, regras, barreira de publicação e fixtures existentes. As três regressões de ciclo passaram novamente e o autoteste de publicação continua em **180/180**.
- `ce548dd` ainda usa as implementações anteriores dessas partes. Não se deve substituir os arquivos Codex pelos arquivos inteiros do novo snapshot ao integrar futuramente. Nenhum commit foi transplantado nesta etapa.

## Achados sobre Hosting e barreiras

### H01 — Média — deploy do Hosting sem gate automático

Local: `firebase.json`, objeto `hosting`; `.firebaserc`, `projects.default`.

O diretório público está corretamente separado em `homologacao/site`, e o alias padrão aponta para `eear-teste`. Contudo, **não existe `hosting.predeploy`**: o comando de deploy não executa o verificador Python nem confere a configuração efetiva do artefato.

`.firebaserc` define um padrão, não um bloqueio. No Firebase CLI 15.35.0, `--project` explícito prevalece sobre os aliases; `deploy/lifecycleHooks.js` retorna sem executar comandos quando o hook está ausente. Um operador pode, por engano, enviar a pasta para outro projeto a que tenha permissão, ou enviar uma saída antiga/alterada sem a conferência manual documentada.

Evidência: configuração real do snapshot e inspeção do CLI instalado; a sonda `testes/hosting-auditoria.py` detecta a ausência. **Nenhum deploy, nem tentativa de deploy, foi usado como teste.** Não foi demonstrado acesso a um projeto não autorizado.

Correção necessária no código de Hosting: gate automático que verifique o projeto efetivo (`GCLOUD_PROJECT`, disponibilizado pelo CLI), o diretório efetivamente enviado (`RESOURCE_DIR`) e o conteúdo. Deve falhar para projeto diferente de `eear-teste`, artefato incompatível, material restrito ou análise inconclusiva. Manter a escolha explícita de `--only hosting`; o mesmo `firebase.json` também declara regras do Firestore, e um deploy sem `--only` pode incluí-las.

### H02 — Média — `--homologacao` aceita rótulo sem validar ambiente efetivo

Local: `web/verificar_publicacao.py`, `homologacao()` e `verificar(... homologacao_exigida=True)`.

O novo modo reutiliza a busca por um marcador em qualquer HTML como prova de homologação. Foram aceitos, ambos com exit 0:

1. Build com `projectId` alterado para `eear-producao`, mas mantendo `homologacao: true`.
2. Build oficial sem configuração Firebase no `index.html`, com um objeto `{"homologacao": true}` acrescentado somente em `privacidade.html`.

São fixtures locais com configuração fictícia. A ferramenta não executou o SDK e não houve conexão com Firebase real. O teste mostra uma falsa aceitação do artefato, não um deploy consumado.

O gate de homologação precisa conferir a configuração da página de entrada, com projeto/domínio de teste e marcador coerentes, recusando configurações ausentes, múltiplas ou divergentes. A detecção conservadora que **bloqueia** publicação oficial (F05) deve continuar separada da validação que **autoriza** um artefato para Hosting de teste.

### H03 — Baixa — política `no-cache` não cobre a URL raiz

Local: `firebase.json`, padrão `**/@(index.html|sw.js|app.js|manifest.webmanifest)`.

No emulador de Hosting, `/index.html`, `/app.js`, `/sw.js` e `/manifest.webmanifest` recebem `Cache-Control: no-cache`. A URL `/`, que entrega o mesmo app, responde 200 sem esse cabeçalho. Convém cobrir explicitamente `/` para manter a política de revalidação da entrada do app.

Não foi demonstrado um cliente real preso em versão antiga nem foi medido o cache do CDN de produção. O achado é a diferença efetiva de cabeçalhos, não uma afirmação de perda de dados por cache.

### F05 continua aplicável ao snapshot do Claude

A configuração `projectId: eear-teste` sem o marcador ainda passa em `--site` no snapshot. A reprodução existente foi mantida na sonda de Hosting. A correção conservadora de F05 continua preservada na branch Codex; o novo modo `--homologacao` não a substitui.

Os achados H01–H03 foram documentados e testados sem incorporar o recurso Hosting à branch Codex. A configuração do Hosting permanece exclusivamente no snapshot do autor para revisão; não foi criada uma segunda configuração concorrente de deploy.

## Isolamento e OAuth

Verificado no código e em testes locais:

- `projectId` aceito pelo build: somente `eear-teste`. `authDomain` agora restrito exatamente a `eear-teste.firebaseapp.com` ou `eear-teste.web.app`; outro domínio/projeto foi recusado no teste de build.
- Não há rewrite genérico do app interceptando `/__/auth/*`. A proposta de servir o app e o helper OAuth na mesma origem `eear-teste.web.app` é coerente com a necessidade de evitar dependência de armazenamento entre sites.
- A origem do Hosting de teste é distinta de `ynphax.github.io`: o armazenamento do navegador e os service workers ficam separados por origem. `noindex` é uma diretiva para robôs; o Hosting proposto continua público, sem controle de acesso adicional.
- O fluxo do app continua priorizando `signInWithPopup`, com fallback para redirect somente nos erros previstos. O commit não implementa login Google nativo no APK.
- `testes/isolamento-firebase.js` passou nas **9/9 verificações**, usando Auth/Firestore locais e as regras do snapshot. As regras de autorização Firestore não mudaram nesta etapa.

Não validado nesta auditoria: OAuth real, Safari/iOS/PWA, URI autorizada no cliente OAuth, domínios efetivos no console, vínculo real de `apiKey`/`appId` com o projeto e restrições da chave. O `projectId` escrito no JSON não comprova sozinho esse vínculo externo.

O emulador de Hosting serviu `/`, HTML, JS, SW e manifesto com 200, `nosniff`, `noindex` e a política de Referer prevista. `/__/auth/handler` respondeu **404 no emulador usado**; isso não é evidência de defeito do handler gerenciado no Hosting real e também não prova que o OAuth esteja homologado. Não foi feito deploy para tentar validar o handler real.

A ferramenta REST de isolamento não deve ser tratada como somente leitura: com regras fracas, as tentativas podem criar documentos novos, incluindo `assinaturas/{uid}` com `ativa: true`. A precondição `exists: false` evita sobrescrever documentos já existentes, mas não impede essa criação. Nesta auditoria ela foi executada apenas em emuladores com regras estritas, que recusaram as tentativas.

## Barreiras oficiais e CI

- Os workflows oficiais Site/APK não foram modificados por `ce548dd`; continuam exigindo disparo manual em `main` com publicação marcada.
- `autoteste` do snapshot: **178/178**; `conferir-workflows` e montagem do JavaScript: passam.
- Teste negativo independente: substituir a verificação oficial de `_site --site` por `_site --homologacao`, em cópia temporária, faz `conferir-workflows` falhar com exit **2**. A nova opção não passou despercebida pela barreira dos workflows oficiais.
- Sonda independente do Hosting: **4 falhas confirmadas**: ausência de predeploy (H01), regressão herdada de F05 e as duas falsas aceitações de H02. As outras sete verificações passam. H03 foi observado separadamente nos cabeçalhos HTTP.
- CI de `ce548dd`: Site e App Android passaram; `Testes` [43034225174](https://github.com/YNPHAX/EEAR/actions/runs/43034225174) falhou na instalação de dependências, antes dos testes. A conclusão não é aprovação da integração.
- CI da branch Codex, head `1d692f3`, [43032560974](https://github.com/YNPHAX/EEAR/actions/runs/43032560974): **tentativas 1 e 2 falharam nos dois jobs**, antes de executar os testes. Os logs mostram `Temporary failure resolving` para os mirrors Ubuntu e erro 100 na instalação do Chromium/dependências. A falha foi de preparação do runner; não é uma falha demonstrada das asserções do app. Foi solicitada uma única repetição dos jobs falhos; ela terminou com o mesmo erro de DNS. Não foi removida a instalação de dependências nem enfraquecido o workflow para obter verde.

## Suíte adicional de F01 preparada

Arquivos novos: `testes/f01-abas.test.js` e `testes/f01-fixture.js`. Não dependem dos testes do Claude e podem receber uma cópia congelada do próximo commit:

```bash
NODE_PATH=<dependencias>/node_modules \
EEAR_FIREBASE_SDK=<dependencias>/node_modules/firebase \
EEAR_FIREBASE_CLI=<dependencias>/node_modules/.bin/firebase \
EEAR_REPO_ALVO=<copia-congelada-do-commit> \
node testes/f01-abas.test.js
```

O runner inicia apenas `demo-eear-f01`, em Auth 9199 e Firestore 8180, com as regras do alvo. Ignora configuração Firebase ambiente/local durante o build. O navegador só recebe SDK npm e recursos locais; requisições externas são bloqueadas. A partição bloqueia Auth/Firestore; HTML e SDK locais representam assets disponíveis offline, sem depender do service worker. Não é teste de instalação/caching de PWA real.

| Cenário | Exigência |
|---|---|
| Dispositivos separados (controle positivo) | Dois caches independentes preservam as duas marcações e convergem após reconexão |
| Fechar A offline | A marcação aceita em A sobrevive ao fechamento, reabertura de B ainda offline e reconexão |
| Fechar B offline | Mesma exigência, invertendo a ordem de escrita e a aba fechada |
| Desmarcar | Uma desmarcação não reaparece porque outra aba grava seu estado antigo; o estudo novo da outra aba permanece |
| Zerar com aba antiga | O reset e a retirada dos certificados antigos sobrevivem; estudo novo realizado depois do reset permanece |
| Certificado | Um registro fictício válido, importado numa aba, mantém código, data, aulas, carga horária e origem após fechamento/reconexão |
| Reconectar sem fechar | Ambas as abas permanecem abertas; servidor e exportações visíveis convergem |
| Zerar nas duas abas | Os dois resets acontecem antes das novas marcações; nada antigo/certificados volta e ambas as marcações posteriores permanecem |

A observação do estado usa a exportação visível do app. Não presume que o futuro conserto usará a chave atual do cache ou um formato específico de journal. A versão preparada espera recuperação assíncrona e confirmação da base antes da partição. Login de preparação usa a API pública do SDK; os fluxos de login pela UI continuam cobertos na suíte Firebase existente. As operações estudadas usam os handlers reais do app.

Calibração inicial em `ce548dd`: **2/8 passaram e 6 falharam** (os dois controles passaram). Isso confirma que a matriz encontra os defeitos conhecidos. Uma rodada de refinamento identificou também uma corrida do formulário na preparação; ela foi removida usando login pelo SDK público, sem alterar o app ou afrouxar os oráculos de preservação. Com a preparação estabilizada, uma nova execução dos dois controles e de desmarcação resultou em **2/3 passando**: ambos os controles passaram e a desmarcação voltou indevidamente, com falha confirmada também na exportação offline e no servidor. Os demais cenários da matriz ficaram preparados para a execução completa sobre a correção futura; não foi declarada aprovação por essa calibração parcial.

Os testes de F01 e de Hosting são diagnósticos explícitos, fora do CI padrão enquanto os defeitos estiverem abertos; terminam com falha quando a condição exigida não é satisfeita. O fato de a suíte padrão ficar verde não substitui a execução deste gate. Evidências em `firebase-codex-ce548dd-evidencias.txt`.

Testes preparados no commit [`77af1c4`](https://github.com/YNPHAX/EEAR/commit/77af1c425b240963abaac1010b35bb6a2ef537bb), exclusivamente na branch de auditoria. Nenhuma correção anterior foi removida.

## Próxima auditoria

Não foi iniciado um parecer final sobre uma correção ainda não recebida. Quando o commit de F01 estiver disponível, será necessário congelá-lo, examinar o desenho de coordenação entre abas, executar todos os oito cenários e as regressões F02–F07. Se a solução bloquear estudo em outra aba, a adaptação do teste deverá verificar bloqueio efetivo e aviso claro, preservando toda alteração já aceita; não bastará remover as asserções que falham.

Até essa validação, o parecer permanece **REPROVADO**, sem autorização para merge, deploy ou publicação de regras.

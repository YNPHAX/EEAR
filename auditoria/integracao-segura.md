# Preparação segura para a integração

Trabalho de 2026-11-09, na branch `claude/integracao-segura` (a partir do PR #23; PR #25). **Nada foi juntado à main,
publicado ou ativado.** Testes em navegador são simulados no Chromium (Playwright). A nuvem do Claude foi simulada em
memória, com a API documentada (`get`, `set`, `acquire`), latência e um documento por conta. Nenhum dado real foi lido
ou apagado. Os do Firebase usam os emuladores oficiais.

## 1. Auditoria dos Lotes 0 a 3

Os 5 commits de `claude/etapa3-flashcards` (`bfb599d`, `a7af137`, `d49feb7`, `e455f12`, `bd00222`) agora estão no
**PR #24** (`claude/etapa3-flashcards` → `main`, rascunho). Abrir esse PR não exigiu reescrever nada nem duplicar
commits: a branch já partia da main, e o PR #16 continua com ela como base.

**Conferências automáticas** (main × `bd00222`, carregando os dados do curso):
- 274 cartões alterados: 100 de Português, 86 de Inglês e 88 de Matemática, todos com versão 2;
- IDs e ordem dos 542 cartões iguais;
- nenhuma frente repetida no curso inteiro;
- nenhum campo vazio e nenhum HTML desbalanceado;
- os 542 cartões renderizados no Chromium: nenhum "<" literal se perde e não aparece tag inesperada (15 cartões usam
  "<" em desigualdades, como "Δ < 0", e aparecem certos);
- questões, gabaritos, provas, vídeos e calendário idênticos (`testes/comparar-conteudo.js`).

**Leitura humana, cartão a cartão, com o texto anterior ao lado:**
- **Nenhum erro factual encontrado.**
- **Matemática:** todas as contas foram refeitas (frações, raízes, logaritmos, PA e PG, determinantes, combinatória,
  probabilidade, estatística, trigonometria, geometria analítica, complexos e polinômios).
- **Português e Inglês:** as regras conferem com a teoria das aulas. Os pontos em que as gramáticas divergem aparecem
  com ressalva no próprio cartão:
  - "implicar em";
  - vírgula depois de adjunto adverbial longo;
  - silepse de número;
  - próclise na fala;
  - "fishes";
  - may × might;
  - "were" × "was" na segunda condicional.
- **Teoria:**
  - ING07: "already" também em perguntas, com surpresa;
  - ING09: "might" sem "possibilidade remota";
  - MAT18: m₁·m₂ = −1 só para retas não verticais, e a e b como coordenadas do centro em r² = a² + b² − F.

  As três estão corretas e são mínimas.
- **Observação (sem defeito):** os 15 cartões com "<" literal funcionam porque o "<" vem seguido de espaço ou número.
  Uma edição futura que cole o "<" a uma letra o transformaria em tag; usar `&lt;` nesses casos evita isso.

## 2. Exclusão do progresso na nuvem do curso no Claude

> **Atualização (verificação final):** com o build real da versão publicada, uma aba antiga recolocou o progresso
> depois da exclusão. A função foi **bloqueada** (PR #26) até a estratégia de `auditoria/verificacao-final.md`, seção 5.

**Implementado** (`curso/app/11-exclusao-nuvem.js`, testes em `testes/exclusao-nuvem.js`), com um limite que a API
não permite resolver.

- **Fluxo:** Plano › Dados › "Apagar meu progresso da nuvem do curso", com APAGAR digitado.
  - A exclusão espera a gravação em curso e pega a trava da nuvem, esperando-a vencer se estiver ocupada.
  - Grava uma **marca** (`{v: 2, apagado: data, t}`, sem nenhum progresso) e relê a nuvem para conferir.
- **Outras contas:** o app só endereça `progresso/<o próprio id>`, e as regras do curso recusam gravar o documento de
  outra conta. O teste confere que a outra conta fica intacta.
- **Falhas parciais:**
  - se a gravação falha, a mensagem diz "nada foi apagado" e a sincronização continua;
  - se a releitura não confere (outra gravação cobriu a marca), o app não diz que apagou.
- **Cópias antigas:**
  - Outro aparelho com esta versão, ao encontrar a marca, para de sincronizar e mantém a cópia local. Só reenvia a
    pedido ("Enviar de novo para a nuvem").
  - O aparelho que apagou guarda um registro. Se depois encontrar progresso na nuvem, avisa que uma versão antiga
    regravou e oferece apagar de novo, sem unir.
  - A marca tem `v: 2`, então nenhuma versão a adota como progresso:
    - a versão antiga (a publicada hoje) não apaga a cópia local dela;
    - a versão dos PRs #21 a #23 a trata como "versão mais nova" e não grava por cima.
- **Bloqueio documentado:** a versão antiga regrava o progresso inteiro, sem ler a nuvem, a cada estudo, e a API não
  tem gravação condicional. Uma aba antiga **já aberta** no momento da exclusão pode, portanto, recolocar os dados. O
  app novo detecta isso e avisa, mas não tem como impedir. A garantia só vale quando não houver abas antigas abertas,
  isto é, depois de republicar o curso e de os alunos recarregarem. A tela de confirmação pede para fechar o curso nos
  outros aparelhos.
- **Não verificado no serviço real:**
  - o comportamento de `acquire` e `set` no curso publicado (contrato 0.2.90);
  - se as regras do curso tratam a marca como uma gravação qualquer.

  Isso precisa ser verificado com uma conta de teste antes de oferecer a função.
- **Dados do dono do curso:** pelas regras, o dono continua podendo ler `progresso/*`, inclusive a marca. Para eliminar
  também o registro da data, o dono pode apagar o documento pelo painel de dados do artifact.

## 3. Integração e publicação

**Gatilhos reais (verificados nos workflows):**
- **Site:** antes desta branch, todo push na main publicava no GitHub Pages (`deploy-pages`).
- **App Android:** só publica com disparo manual na main e "Publicar o APK" marcado.
- **Testes:** não publica nada.
- **Curso no Claude:** publicado à parte, à mão.

**Mudança (PR #25):** o push na main só monta e confere o site (o pacote fica no run para homologação). Publicar passa
a exigir o disparo manual do workflow Site na main com "Publicar o site" marcado, como já acontece com o APK.
`conferir-workflows` e o autoteste aceitaram a mudança. Nenhum workflow foi desativado.

**Problema de ordem:** a mudança está no topo da fila (PR #25). Juntar o PR #24 (ou qualquer PR abaixo do #25) à main
antes dela publicaria o site na hora. Alternativas, sem reescrever histórico:
1. **Recomendada, antes de qualquer merge:** em Settings › Environments › `github-pages`, ativar "Required reviewers"
   (o dono aprova cada publicação). Não muda código, vale na hora e pode ser desfeita.
2. Fazer a integração em um único merge do topo da fila (inclui o PR #25), como em
   `auditoria/auditoria-consolidada.md`.
3. Abrir um PR mínimo, a partir da main, só com a mudança do `site.yml`. Ela reapareceria idêntica no PR #25; o merge
   resolve sozinho, mas o histórico fica com a mudança duas vezes.

**Procedimento de homologação e publicação:**
1. Ativar a proteção do ambiente (alternativa 1).
2. Juntar à main, na ordem: PR #24 → #16 → … → #25. Preferir um merge único do topo, com "Create a merge commit".
3. No run do workflow Site do merge, baixar o pacote `github-pages` e servi-lo localmente
   (`python3 -m http.server`). Rodar `node testes/atualizacao.js <site publicado hoje> <pacote>` e
   `node testes/comparar-conteudo.js <main anterior> <main nova>`, e abrir o site num navegador limpo e num com progresso
   antigo.
4. Se tudo passar, disparar o workflow Site na main com "Publicar o site" marcado (e aprovar, se a alternativa 1 estiver
   ativa).
5. Depois de publicar: abrir o site publicado, conferir que o service worker troca de versão e repetir
   `testes/atualizacao.js` com o site publicado.

**Reversão:**
1. `git revert -m 1 <merge>` num PR para a main.
2. Homologar o pacote e publicar pelo disparo manual.

A reversão foi testada com os builds: o progresso gravado pelo app novo abre na main antiga sem perder estudo.

**Interromper (não publicar ou reverter) se houver:**
- qualquer falha de CI;
- mudança em questões, gabaritos, provas, ordem ou quantidade (`comparar-conteudo.js`);
- falha em `atualizacao.js`;
- erro de JavaScript no pacote ou no site;
- relato de progresso perdido.

## 4. Versões antigas e novas no mesmo progresso

**Risco confirmado e corrigido: sobrescrita tardia.**
- **O que acontecia:** a versão antiga (a publicada hoje, "último vence") lia a nuvem, estudava e depois gravava o
  progresso inteiro dela por cima, sem trava. O app novo tinha na base a marcação que a versão antiga não conhecia, e a
  união tratava isso como "apagado no outro aparelho": a marcação sumia do aparelho e da nuvem.
- **Reprodução:**
  - simulada: `testes/nuvem-claude.js`, cenário 10;
  - com o build real da main e o do PR #22 na mesma nuvem fictícia, também houve perda.
- **Correção (1ª parte):** assinatura do documento (`sinc`, um resumo do conteúdo). Documento sem assinatura, ou com
  assinatura que não bate, foi gravado por outra versão: a união é feita sem base (nada é apagado) e a versão assinada é
  gravada em seguida.
- **Defeito que restava (auditoria final do PR #27, corrigido no PR da época da sincronização):** com dois ou mais
  aparelhos novos e uma versão antiga, a assinatura não bastava. A versão antiga gravava por cima sem as marcações do
  aparelho B; o aparelho A unia esse documento e o gravava assinado; B via o documento assinado como sucessor da base
  dele e apagava as próprias marcações (tarefas, caderno de erros, folhas da apostila), na nuvem e no aparelho.
  Reproduzido com os builds reais (2 aparelhos novos + 1 antigo): perda em 5 de 5 rodadas instrumentadas.
- **Correção (2ª parte): época da sincronização** (`ep`, dentro da assinatura; `curso/app/08-uniao-nuvem.js`). Toda união
  com um documento que esta versão não gravou começa uma época nova, e a base de um aparelho só vale com a mesma época do
  documento da nuvem; senão, a união é sem base e nada deste aparelho é apagado. Testes: `testes/epoca-nuvem.js` (no CI)
  e `testes/versoes-misturadas.js` (builds reais, fora do CI).
- **Mais dois defeitos (auditoria independente do PR #28, corrigidos no PR da linhagem das gravações):**
  - *Gravação atrasada:* o aparelho B grava com a trava e a resposta demora mais que ela; o aparelho A grava e confirma;
    a gravação de B chega depois, assinada e da mesma época, sem o que A gravou; na sincronização seguinte, A apagava o
    que tinha gravado. Correção: linhagem das gravações (`lin`, dentro da assinatura): a base só vale se a gravação que
    ela representa está na linhagem do documento da nuvem.
  - *Colar progresso:* colar um código antigo e sincronizar apagava da nuvem e dos outros aparelhos o que o código não
    tinha (tarefas, caderno de erros, apostila). Correção: colar descarta a base; a sincronização seguinte une sem apagar.
    Por isso, colar passa a somar com a nuvem, em vez de substituí-la.
- **Abrangência:** vale para o link do Claude e para o Firebase (a assinatura, a época e a linhagem vão dentro de `dados`).
- **Limites (sem garantia absoluta):**
  - enquanto uma versão antiga continuar gravando, desmarcações feitas no app novo podem voltar (união sem base não
    apaga);
  - a versão antiga grava às cegas: o que só existia na nuvem (de um aparelho que não abre mais o curso) pode ser coberto
    por ela, e o app novo não tem como recuperar. O app novo preserva o que cada aparelho novo tem guardado;
  - "Apagar os dados deste aparelho" confia na última sincronização confirmada; se uma versão antiga cobriu a nuvem
    depois dela, a nuvem pode não ter tudo o que o aviso diz;
  - com mais de 40 gravações de outros aparelhos desde a última sincronização deste, a base deixa de valer: nada se
    apaga, mas uma desmarcação feita aqui pode voltar;
  - nada disso foi testado no serviço real do Claude.

**Outras combinações verificadas:**
- **Main ↔ app novo, sem nuvem** (`testes/atualizacao.js`, 7 de 7): o progresso vai e volta sem perda.
- **Versão dos PRs #21 a #23 diante de documentos assinados:** a assinatura é um campo a mais dentro do progresso. Essas
  versões juntam o progresso normalmente e gravam sem ela; a próxima leitura do app novo trata o documento como de outra
  versão e faz a união sem base (época nova).
- **Travas:** a versão publicada hoje não usa `acquire`. O app novo não depende disso: a trava protege entre aparelhos
  com o app novo, e a assinatura e a época protegem contra os que não a usam.

**Estratégia de atualização (a republicação do curso no Claude depende de autorização do dono):**
1. Publicar o site só pelo procedimento da seção 3. O site e o APK não usam a nuvem do Claude.
2. Republicar o curso no Claude só depois de: a época da sincronização integrada; `testes/versoes-misturadas.js` sem perda
   com os builds da versão publicada e da nova; e a verificação com conta de teste no serviço real (seção 2).
3. Para reduzir o tempo de convivência com a versão antiga: avisar os alunos para recarregar o curso em todos os
   aparelhos depois da republicação. A barreira do caminho novo (abaixo) impede a versão antiga de cobrir o que só
   existe na nuvem; ela depende de publicar o curso no Claude junto com as regras abaixo.
4. Não oferecer "Apagar meu progresso da nuvem" antes da verificação com conta de teste no Claude (seção 2).
5. As cópias locais (`missao-eear-v1`, cópias por conta, cópia de recuperação) não são apagadas por nenhuma atualização.

**Barreira do caminho novo (`progresso2`), implementada no PR da barreira; não verificada no serviço real:**
- **O que faz:** a versão nova sincroniza só em `progresso2/<id>` (`curso/app/12-caminho-novo.js`); as versões antigas
  só conhecem `progresso/<id>`. As regras publicadas junto deixam o caminho antigo só para leitura dos alunos.
- **Regras a declarar ao republicar o curso no Claude** (hoje estão publicadas só as duas primeiras, com
  `progresso/{self}` gravável por `interact`):
  ```json
  {"db": {"rules": [
    {"path": "progresso", "read": "owner", "write": "owner"},
    {"path": "progresso/{self}", "read": "view", "write": "owner"},
    {"path": "progresso2", "read": "owner", "write": "owner"},
    {"path": "progresso2/{self}", "read": "view", "write": "interact"}
  ]}, "user": {}}
  ```
  Pelo contrato do `db` (0.2.96), as regras em vigor são as da versão servida, "a partir da próxima chamada depois de
  ela entrar no ar": uma aba antiga já aberta tem a gravação seguinte recusada (`invalid_argument`). A versão publicada
  hoje trata esse erro desligando a sincronização e mantendo o estudo no aparelho (`missao-eear-v1`); conferido no
  `app.js` publicado. Na versão nova, esse estudo aparece em Plano › Dados como "progresso feito sem conta", com a opção
  de levá-lo para a conta (a pedido, como antes).
- **Migração:** depois da primeira leitura do caminho novo, o documento antigo é lido e unido ao progresso do aparelho
  sem base (nada se apaga); o caminho antigo nunca é gravado. O resumo do documento antigo fica em `cfg.migV1`: se ele
  não muda, não é unido de novo (desmarcações feitas depois não voltam); se muda (gravação de uma aba antiga antes de as
  regras valerem, ou uma reversão), é unido mais uma vez. Falha ao ler o caminho antigo: tenta de novo ao abrir.
- **Reversão:** republicar a versão anterior com as regras de hoje (`progresso/{self}` gravável por `interact`). A versão
  anterior volta a usar `progresso/<id>`, que tem o progresso de quando a barreira entrou; o estudo feito depois disso
  fica em `progresso2/<id>` e nos aparelhos, sem ser apagado. Ao voltar para a versão nova, o que a versão anterior gravou
  no caminho antigo durante a reversão é unido (o resumo mudou). Sem as regras de hoje, a versão anterior não sincroniza
  (o estudo fica no aparelho).
- **Limites:**
  - não verificado no serviço real: o efeito de `write: "owner"` numa regra `{self}`, o código do erro de gravação
    recusada, a entrada em vigor das regras para abas já abertas e a leitura do caminho antigo pelo aluno;
  - estudo que uma aba antiga gravou no próprio aparelho depois da troca de regras não vai sozinho para a nuvem: fica no
    aparelho, e a versão nova oferece levá-lo (a pedido);
  - "Apagar meu progresso da nuvem" (bloqueado) teria de apagar também `progresso/<id>`; hoje só o dono pode, pelo painel
    de dados;
  - uma desmarcação feita antes de uma reversão pode voltar ao unir o caminho antigo de novo.
- **Verificação com conta de teste, antes de oferecer aos alunos** (o dono, num artifact de teste privado, com uma conta
  de aluno convidada como Contributor): (1) com as regras novas, a conta de aluno lê `progresso/<id>` e não grava nele;
  (2) grava `progresso2/<id>` e não lê nem grava o de outra conta; (3) uma aba com a versão anterior aberta antes da troca
  tem a próxima gravação recusada e não perde o estudo local; (4) a migração leva o progresso antigo para `progresso2`;
  (5) a reversão com as regras de hoje volta a sincronizar no caminho antigo.

## 5. Testes e CI

| Verificação | Resultado | Tipo |
|---|---|---|
| `node testes/plataforma.test.js` | ver relatório final (inclui `exclusao-nuvem.js` e o cenário 10 de `nuvem-claude.js`) | Chromium simulado, nuvens fictícias |
| `testes/firebase-emulador.test.js` | ver relatório final | emuladores oficiais |
| Main real × app novo na mesma nuvem fictícia | 1 aparelho novo: sem perda (PR #22: com perda). 2 aparelhos novos: com perda até a época da sincronização; veja o PR dela | builds reais, nuvem simulada |
| `testes/atualizacao.js` e `testes/comparar-conteudo.js` | ver relatório final | builds reais |
| Lotes 0 a 3: 274 cartões e 3 teorias | nenhum erro factual | leitura humana e automática |

## 6. Riscos que continuam

- **Exclusão da nuvem do Claude:** abas antigas abertas podem regravar (detectado, não impedido). `acquire` e as regras
  não foram verificados no serviço real.
- **Ordem da publicação:** sem a proteção do ambiente `github-pages`, um merge abaixo do PR #25 publica o site.
- **Versões antigas:** enquanto existirem, desmarcações podem voltar, e o que só existia na nuvem pode ser coberto pela
  versão antiga (seção 4). Republicar no Claude só nas condições da seção 4.
- **Testes reais:** nada foi testado em aparelho real, iOS, Firebase de produção, Google real ou no serviço real do
  Claude.
- **CSP:** continua ausente. As garantias de servidor do Firebase continuam pendentes (`auditoria/auditoria-consolidada.md`).

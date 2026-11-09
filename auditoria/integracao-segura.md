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
- **Correção:** assinatura do documento (`sinc`, um resumo do conteúdo). Documento sem assinatura, ou com assinatura
  que não bate, foi gravado por outra versão: a união é feita sem base (nada é apagado) e a versão assinada é gravada
  em seguida. Com o build real da main e o desta branch, nada se perdeu.
- **Abrangência:** vale para o link do Claude e para o Firebase (a assinatura vai dentro de `dados`).
- **Custo:** enquanto uma versão antiga continuar gravando, desmarcações feitas no app novo podem voltar (união sem base
  não apaga). Nunca se perde estudo.

**Outras combinações verificadas:**
- **Main ↔ app novo, sem nuvem** (`testes/atualizacao.js`, 7 de 7): o progresso vai e volta sem perda.
- **Versão dos PRs #21 a #23 diante de documentos assinados:** a assinatura é um campo a mais dentro do progresso. Essas
  versões juntam o progresso normalmente e gravam sem ela; a próxima leitura do app novo trata o documento como de outra
  versão e faz a união sem base, sem perda.
- **Travas:** a versão publicada hoje não usa `acquire`. O app novo não depende disso: a trava protege entre aparelhos
  com o app novo, e a assinatura protege contra os que não a usam.

**Estratégia de atualização:**
1. Publicar o site e republicar o curso no Claude com esta versão.
2. Por alguns dias, manter a assinatura e a união sem base.
3. Não oferecer "Apagar meu progresso da nuvem" antes da verificação com conta de teste no Claude (seção 2).
4. As cópias locais (`missao-eear-v1`, cópias por conta, cópia de recuperação) não são apagadas por nenhuma atualização.

## 5. Testes e CI

| Verificação | Resultado | Tipo |
|---|---|---|
| `node testes/plataforma.test.js` | ver relatório final (inclui `exclusao-nuvem.js` e o cenário 10 de `nuvem-claude.js`) | Chromium simulado, nuvens fictícias |
| `testes/firebase-emulador.test.js` | ver relatório final | emuladores oficiais |
| Main real × app novo na mesma nuvem fictícia | sem perda (PR #22: com perda) | builds reais, nuvem simulada |
| `testes/atualizacao.js` e `testes/comparar-conteudo.js` | ver relatório final | builds reais |
| Lotes 0 a 3: 274 cartões e 3 teorias | nenhum erro factual | leitura humana e automática |

## 6. Riscos que continuam

- **Exclusão da nuvem do Claude:** abas antigas abertas podem regravar (detectado, não impedido). `acquire` e as regras
  não foram verificados no serviço real.
- **Ordem da publicação:** sem a proteção do ambiente `github-pages`, um merge abaixo do PR #25 publica o site.
- **Versões antigas:** enquanto existirem, desmarcações podem voltar (sem perda de estudo).
- **Testes reais:** nada foi testado em aparelho real, iOS, Firebase de produção, Google real ou no serviço real do
  Claude.
- **CSP:** continua ausente. As garantias de servidor do Firebase continuam pendentes (`auditoria/auditoria-consolidada.md`).

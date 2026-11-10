# Verificação final antes da integração

Verificação de 2026-11-09, somente leitura e testes seguros, sobre a fila acumulada do PR #24 e dos PRs #16 a #25. A
única mudança de código é o bloqueio da exclusão da nuvem (seção 5), na branch `claude/verificacao-final` (PR #26,
rascunho), justificado por uma falha reproduzida com o app antigo real.

**O que não foi feito:**
- merge, deploy ou publicação;
- mudança na main;
- APK;
- alteração de questões, gabaritos ou flashcards.

**Tipo de cada teste:** os testes em navegador são simulados no Chromium. A nuvem do curso no Claude é simulada em
memória. Os do Firebase usam os emuladores oficiais. Nenhum teste foi feito em serviço, aparelho ou navegador reais.

## 1. Cadeia de commits

| Etapa | Branch | Head | Commits próprios |
|---|---|---|---|
| PR #24 (Lotes 0 a 3) | `claude/etapa3-flashcards` | `bd00222` | 5 (`bfb599d`, `a7af137`, `d49feb7`, `e455f12`, `bd00222`) |
| PR #16 | `claude/continuidade-eear` | `926ab58` | 6 |
| PR #17 | `claude/lote4-fisica` | `71c6de1` | 6 |
| PR #18 | `claude/flashcards-celular` | `a5340a0` | 2 |
| PR #19 | `claude/engenharia-qualidade` | `5f04d6f` | 4 |
| PR #20 | `claude/sync-acessibilidade` | `08cadd4` | 5 |
| PR #21 | `claude/contas-privacidade` | `5f2ac9f` | 5 |
| PR #22 | `claude/validacao-contas` | `a4486d6` | 5 |
| PR #23 | `claude/auditoria-integracao` | `9da6a91` | 2 |
| PR #25 | `claude/integracao-segura` | `8eab762` | 4 |

- **Fila contínua:** cada branch contém a anterior (`git merge-base --is-ancestor`). Os heads e as bases dos PRs no
  GitHub batem com essa ordem.
- **Contagem:** main..PR #25 tem 44 commits, a soma exata das etapas, sem nenhum commit de merge.
- **Duplicação:** `git patch-id` não acha nenhum patch repetido. O único assunto repetido ("vírgula que faltava na
  lista de testes") são duas correções diferentes, em PRs diferentes.
- **Perda:** a main (`7f9ba7f`) tem 0 commits fora da fila. Um merge do topo leva os 44 commits e não perde nada.

## 2. Caminhos de publicação

**Na main hoje (`7f9ba7f`), pode publicar sem aprovação (a menos que o ambiente já esteja protegido, o que não foi
verificado):**
1. **Push na main:** o workflow Site publica no GitHub Pages (`if: github.ref == 'refs/heads/main'`). Todo merge
   publica.
2. **`workflow_dispatch` do Site na main:** publica, e não pede nenhuma confirmação extra.
3. **`workflow_dispatch` do App Android na main com "Publicar o APK":** cria uma Release com o APK
   (`contents: write`). Não usa ambiente com aprovação.
4. **Workflow alterado numa branch:** qualquer pessoa com escrita que envie uma branch `claude/**` com um workflow
   modificado roda esse workflow no push. Ele pode pedir `pages: write` ou `contents: write` e publicar o Pages ou
   criar uma Release. O GitHub só barra o Pages se o ambiente `github-pages` restringir as branches de deploy.
5. **Curso no Claude:** publicado à parte, pelo dono, ou por uma sessão do Claude com acesso à conta do dono. Não há
   aprovação técnica, só a instrução de não publicar.

**No PR #25 (`8eab762`):**
- o caminho 1 deixa de existir (o push só monta e confere);
- o caminho 2 passa a exigir "Publicar o site" marcado, mas continua sem aprovação de outra pessoa;
- os caminhos 3, 4 e 5 continuam iguais.

**Outros pontos verificados:**
- não há branch `gh-pages`;
- os workflows não usam segredos (só o `GITHUB_TOKEN`);
- o APK é assinado com a chave de depuração;
- os workflows Testes e Videoaulas só leem.

**Não verificável daqui:**
- se o Pages está configurado como "GitHub Actions" (e não "Deploy from a branch");
- as regras atuais do ambiente `github-pages`;
- as permissões padrão do Actions.

## 3. Configurações que o proprietário precisa aplicar

Não presumi que nenhuma já esteja ativa. Conferir e aplicar, nesta ordem, **antes de qualquer merge**:

1. **Settings › Pages › Build and deployment › Source:** "GitHub Actions". Se estiver em "Deploy from a branch", uma
   branch publica sem passar pelo workflow nem pelas conferências.
2. **Settings › Environments › `github-pages`:**
   - **Required reviewers:** o próprio dono (YNPHAX). Toda publicação para e espera aprovação.
   - **Prevent self-review:** deixar desligado enquanto o dono for o único revisor; ligado, ele não aprovaria as
     publicações que ele mesmo dispara. Com um segundo revisor, ligar.
   - **Deployment branches and tags:** "Selected branches and tags", só `main`. Bloqueia o caminho 4 para o Pages.
   - **Allow administrators to bypass configured protection rules:** desligado. Senão, o dono, que é administrador,
     publica sem passar pela aprovação.
   - **Wait timer:** opcional; zero basta.
   - **Environment secrets:** nenhum (não são usados).
3. **Settings › Actions › General › Workflow permissions:**
   - "Read repository contents and packages permissions";
   - "Allow GitHub Actions to create and approve pull requests" desligado.
4. **Settings › Rules › Rulesets da `main`** (registrado no passo manual da proteção da main):
   - exigir PR;
   - exigir os checks Testes, Site e App Android;
   - bloquear force push e exclusão.
5. **Releases do APK (caminho 3):**
   - **Proposta de código, não aplicada:** fazer o job `publicar` do `android.yml` usar um ambiente (por exemplo,
     `apk-release`) com revisor obrigatório e só a branch `main`.
   - **Enquanto isso:** um Tag ruleset para `android-*` que só o dono possa criar.

## 4. Testes integrados finais

Resultados na tabela da seção 9. Rodados no topo da fila (`8eab762`, PR #25) e repetidos nesta branch com o bloqueio.

## 5. Exclusão da nuvem com versões antigas

**Reproduzido com o build real da main, na nuvem fictícia:**
1. Uma aba antiga está aberta.
2. O aluno apaga pelo app novo, e a marca de exclusão é gravada.
3. A aba antiga estuda e grava o progresso inteiro dela.
4. **O progresso volta para a nuvem.**

O app novo, ao reabrir, avisa e não une, mas os dados estão de volta. A versão antiga grava às cegas, e a API não tem
gravação condicional.

**Decisão: a função fica bloqueada** (PR #26):
- o botão "Apagar meu progresso da nuvem do curso" não aparece, e a ação não faz nada, a menos que a página defina
  `window.EEAR_EXCLUSAO_NUVEM = true` (usado só nos testes);
- o reconhecimento da marca de exclusão continua ativo, para que nenhuma marca existente seja tratada como progresso.

**Estratégia confiável** (para implementar e validar no serviço real antes de liberar):
1. **Caminho novo:** a versão nova guarda o progresso em `progresso2/<id>`, com as regras
   `{path: "progresso2", read: "owner", write: "owner"}` e `{path: "progresso2/{self}", read: "view", write: "interact"}`.
   As versões antigas não conhecem esse caminho e nunca gravam nele.
2. **Migração única:** se `progresso2/<id>` não existe, a versão nova lê `progresso/<id>`, une com a cópia local e
   grava em `progresso2/<id>`. Depois disso, nunca mais lê o caminho antigo.
3. **Trancar o caminho antigo:** a mesma publicação muda a regra de `progresso/{self}` para `write: "owner"` (leitura
   continua `view`, para a migração). Pela documentação da API, as regras em vigor são as da versão publicada, a
   partir da próxima chamada. Então as abas antigas já abertas passam a ter a gravação recusada (`invalid_argument`),
   e a versão antiga, ao receber esse erro, para de sincronizar.
4. **Limpeza:** depois de alguns dias, o dono apaga os documentos de `progresso/*` pelo painel de dados, porque só ele
   pode gravar ali.
5. **Exclusão:** passa a valer em `progresso2/<id>`, com a marca (para que nenhum aparelho com esta versão reenvie
   sozinho) e sem caminho para uma versão antiga restaurar.
6. **Validar no serviço real, com contas de teste:**
   - a recusa de gravação no caminho antigo por uma aba aberta antes da publicação;
   - a migração;
   - a exclusão;
   - o comportamento de `acquire` no contrato publicado.

**Enquanto não houver isso:** um pedido de exclusão (art. 18 da LGPD) é atendido pelo dono, que apaga o documento do
aluno pelo painel de dados depois de pedir que ele feche o curso em todos os aparelhos. Esse procedimento deve constar
da política de privacidade.

## 6. Contraste do cronograma

`.day.past { opacity: .72; }` (`curso/index.html`) esmaece o cartão inteiro dos dias passados. O contraste foi
calculado sobre o fundo do tema e confere com a medição do axe (3,55):

| Opacidade | Tema claro (menor contraste) | Tema escuro (menor contraste) |
|---|---|---|
| 1 (sem esmaecer) | 5,47 | 6,85 |
| **0,72 (hoje)** | **3,23** (fis), 3,26 (mat), 3,56 (muted) | 4,09 (muted) |
| 0,85 | 4,15 | 5,22 |
| **0,90 (proposta)** | **4,56** | 5,73 |

**Correção mínima proposta (não aplicada, muda a aparência):** `.day.past { opacity: .9; }`.
- É a menor opacidade com todos os textos a partir de 4,5:1 nos dois temas.
- Os dias passados continuam visivelmente esmaecidos, e o dia de hoje continua destacado pela borda.

**Alternativa sem opacidade:** fundo `var(--surface-2)` nos dias passados e as cores originais do texto. Também passa,
mas muda mais a aparência.

## 7. Checklist de homologação (depende de serviço real, navegador ou aparelho)

**Site (GitHub Pages), depois do merge e antes de publicar:**
- [ ] Baixar o pacote `github-pages` do run do Site na main e servi-lo localmente.
- [ ] `node testes/atualizacao.js <site publicado hoje> <pacote>`: 7 de 7.
- [ ] `node testes/comparar-conteudo.js <main anterior> <main nova>`: código 0.
- [ ] Abrir o pacote em navegador limpo e num com progresso antigo: Hoje, Plano, aula, quiz, flashcards, simulado,
      apostila e certificado.

**Depois de publicar:**
- [ ] Abrir o site publicado e confirmar que o service worker troca de versão (o site abre offline na versão nova).
- [ ] Repetir `testes/atualizacao.js` com o site publicado.

**Navegadores reais (desktop e celular):**
- [ ] Chrome, Firefox, Safari (macOS e iOS) e Samsung Internet.
- [ ] Fonte do sistema ampliada.
- [ ] Leitor de tela: TalkBack e VoiceOver.

**Android (APK):**
- [ ] APK gerado pelo CI instalado num aparelho real.
- [ ] Atualização sobre a versão instalada hoje, com progresso, sem perda.
- [ ] Flashcards em tela pequena.
- [ ] Copiar e colar o progresso.
- [ ] Fonte do sistema (`textZoom`).

**iOS:**
- [ ] Safari e "Adicionar à Tela de Início".
- [ ] Armazenamento local preservado entre aberturas.

**Curso no Claude (serviço real, contas de teste):**
- [ ] Republicar só depois do merge.
- [ ] Dois aparelhos reais com a mesma conta de teste marcando ao mesmo tempo.
- [ ] Aba antiga aberta antes da republicação.
- [ ] Contrato da API com `acquire`.
- [ ] Antes de liberar a exclusão: a estratégia da seção 5 inteira.

**Firebase (antes de ativar `sincronizar`):**
- [ ] Projeto de teste com as regras publicadas.
- [ ] Login por e-mail e Google real, incluindo o redirecionamento.
- [ ] Dois aparelhos.
- [ ] Exclusão de conta.
- [ ] Token vencido por tempo.
- [ ] App Check.
- [ ] Exclusão garantida no servidor.

## 8. Recomendação

**Aprovado para integração (com evidência simulada):**
- conteúdo dos Lotes 0 a 4;
- refatoração do app;
- correções de XSS e de progresso malformado;
- união entre aparelhos, isolamento de contas e transações no Firestore;
- trava e assinatura no link do Claude;
- emulador no CI;
- publicação manual do site;
- ferramentas de integração.

**Continua bloqueado:**
- exclusão da nuvem no Claude (bloqueada no PR #26 até a estratégia da seção 5);
- ativação do Firebase;
- republicação do curso no Claude e publicação de APK sem homologação;
- qualquer cobrança.

**Sequência para um único merge seguro:**
1. Aplicar as configurações da seção 3 (no mínimo os itens 1 e 2) e conferir que estão ativas.
2. Revisar e aprovar o PR #24 e os PRs #16 a #26 (a revisão é por PR; nenhum é juntado separadamente).
3. Congelar a main.
4. Conferir o CI verde no head do PR #26.
5. Juntar à main um único PR do head do PR #26 (`claude/verificacao-final` → `main`), com "Create a merge commit"
   (não squash nem rebase).
6. Fechar os PRs #16 a #26 e o #24 como integrados por esse merge.
7. Homologar o pacote do run do Site na main (seção 7) e publicar pelo disparo manual, aprovando no ambiente.
8. Reversão, se preciso: `git revert -m 1 <merge>` num PR, homologar e publicar do mesmo jeito.

**Interromper a integração se houver:**
- qualquer falha de CI;
- mudança em questões ou gabaritos;
- falha em `atualizacao.js`;
- erro de JavaScript;
- relato de progresso perdido.

**Nada aqui é aprovação de produção.** Faltam todos os testes da seção 7.

## 9. Evidências desta verificação

| Verificação | Topo do PR #25 (`8eab762`) | Tipo |
|---|---|---|
| `node testes/plataforma.test.js` | 200 de 200 | Chromium simulado, nuvens fictícias |
| `testes/firebase-emulador.test.js` | 23 de 23 aqui; os 2 do Google rodam no CI (25 de 25 no CI do PR #25) | emuladores oficiais |
| `testes/atualizacao.js` (main → nova → main → nova) | 7 de 7 | builds reais, Chromium |
| `testes/comparar-conteudo.js` (main × topo) | só cartões e teoria (ING07, ING09, MAT18 e FIS02) mudam | dados do curso |
| App antigo real (build da main) e app novo, mesma nuvem, gravações sobrepostas | com 1 aparelho novo, nada se perdeu. **Correção posterior:** com 2 aparelhos novos houve perda (auditoria do PR #27), corrigida pela época da sincronização (`auditoria/integracao-segura.md`, seção 4) | builds reais, nuvem fictícia |
| Exclusão com aba antiga real aberta | **o progresso voltou para a nuvem** (motivo do bloqueio) | builds reais, nuvem fictícia |
| Sincronização concorrente e isolamento de contas | dentro da plataforma (`nuvem-claude.js`, `sincronia.js`, `contas.js`) e do emulador (12 marcações simultâneas sem perda; regras entre contas) | simulado e emulador |
| ESLint, `montar_app --conferir`, autoteste (172), `validar`, `conferir-workflows` | sem erros | — |
| Builds do site e do app + `verificar`; `node --check` | "nada restrito"; 23 arquivos sem erro | — |
| CI do PR #25 (Testes, Site, App Android) | verde | GitHub Actions |
| Cadeia de commits | 44 commits lineares, sem duplicação nem perda | git |

O APK não foi compilado localmente; o workflow App Android o compila em cada push e passou.

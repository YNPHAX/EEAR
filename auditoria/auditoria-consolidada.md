# Auditoria consolidada dos PRs #16 a #22 e plano de integração

Auditoria de 2026-11-09, na branch `claude/auditoria-integracao` (a partir do PR #22). Feita sobre o código, os testes,
os workflows e o estado do GitHub, sem partir dos relatórios anteriores. **Nada foi juntado à main, publicado ou
ativado.** Testes em navegador são simulados no Chromium (Playwright); os do Firebase usam os emuladores oficiais. Nenhum
teste foi feito em aparelho real, no Firebase de produção ou no Google real.

## 1. Estado verificado dos PRs

Todos abertos, em rascunho, com CI verde (Testes, Site e App Android) no head atual, consultado no GitHub:

| PR | Branch | Head | Base | Commits próprios |
|---|---|---|---|---|
| — | `claude/etapa3-flashcards` (Lotes 0 a 3) | `bd00222` | `main` | 5 (**sem PR**) |
| #16 | `claude/continuidade-eear` | `926ab58` | `claude/etapa3-flashcards` | 6 |
| #17 | `claude/lote4-fisica` | `71c6de1` | #16 | 6 |
| #18 | `claude/flashcards-celular` | `a5340a0` | #17 | 2 |
| #19 | `claude/engenharia-qualidade` | `5f04d6f` | #18 | 4 |
| #20 | `claude/sync-acessibilidade` | `08cadd4` | #19 | 5 |
| #21 | `claude/contas-privacidade` | `5f2ac9f` | #20 | 5 |
| #22 | `claude/validacao-contas` | `a4486d6` | #21 | 5 |

- A cadeia é linear: cada branch contém a anterior (`git merge-base --is-ancestor`), e a main (`7f9ba7f`, merge do PR
  #15) é ancestral de todas. A main não avançou: **0 commits** na main fora do PR #22. Não há conflito hoje.
- Da main ao PR #22: 38 commits, 52 arquivos (+5390, −711).

## 2. Mapa de dependências

```
main (7f9ba7f)
 └─ etapa3-flashcards: versões dos cartões (Lote 0); cartões de Português, Inglês e Matemática (Lotes 1 a 3); ESLint
     └─ #16 app.js dividido em curso/app/ + montar_app.py; ING14~5; planos do Lote 4 e da versão paga
         └─ #17 cartões de Física (Lote 4) e teoria da FIS02
             └─ #18 botões fixos dos flashcards no celular
                 └─ #19 XSS, progresso malformado, cópia de recuperação, aviso de armazenamento
                     └─ #20 união em três vias na sincronização; fonte ampliada; auditoria de LGPD
                         └─ #21 contas isoladas; transações no Firestore; baixar, excluir e apagar dados
                             └─ #22 emulador no CI; trava no link do Claude; aviso de sincronização pendente
                                 └─ esta branch: "apagar todas as contas" seguro; ferramentas de integração
```

Dependências reais (não só de ordem): #17 depende do Lote 0 (versões dos cartões); #18 a #22 editam `curso/app/`,
criado no #16; #21 reescreve partes do #20 (chaves por conta); #22 depende do #21 (`conciliar`, `planejarUniao`).
Nenhum PR pode entrar sem os anteriores.

## 3. Problemas encontrados

### Alta
1. **Lotes 0 a 3 sem PR.** Os 5 commits de `claude/etapa3-flashcards` (versões dos cartões, 274 cartões reformulados
   de Português, Inglês e Matemática, e a teoria de ING07, ING09 e MAT18) não estão em nenhum PR. Quem revisa o PR #16
   não vê essas mudanças no diff, e elas entrariam na main de carona. *Proposta:* abrir um PR dessa branch para a main
   antes de tudo, com revisão do conteúdo. *Decisão humana.*
2. **Conteúdo pago não tem como ser protegido na arquitetura atual.** Todo o curso é publicado como arquivo estático
   (site e APK). Esconder telas com JavaScript não protege nada. Bloqueia a comercialização, não a integração da
   versão gratuita (seção 7).

### Média
3. **Corrigido nesta branch:** "Apagar também as outras contas" (Plano › Dados, sem conta) apagava a cópia local de
   todas as contas sem conferir se a nuvem de cada uma tinha tudo. Num aparelho compartilhado, uma pessoa apagava o
   estudo ainda não enviado de outra. Para a conta em uso, apagar já era bloqueado nesse caso. *Correção:* cada conta
   só é apagada se a cópia local for igual à última versão confirmada pela nuvem dela (ou não tiver estudo); as demais
   ficam, com aviso antes e depois. *Teste:* `testes/contas.js` (falha no PR #22, passa aqui).
4. **Link do curso no Claude: o aluno não consegue apagar o progresso da nuvem** (art. 18 da LGPD, eliminação). Só
   apaga a cópia do aparelho; a nuvem continua (só o dono do curso apaga). *Proposta:* "Apagar meu progresso da nuvem
   do curso" com `doc.delete()` e confirmação. Não implementado: é uma função destrutiva num ambiente que não dá para
   testar de verdade aqui, e a política de dados do curso no Claude é decisão do dono. Nesse curso, o dono lê o
   progresso de todos (regra `owner`), o que deve constar da política.
5. **Link do curso no Claude: as correções dos PRs #20 a #22 não chegaram aos alunos.** O curso publicado roda uma
   versão antiga do app, com "último a gravar vence". Só uma nova publicação leva a união, a trava e o aviso honesto.
   Não foi verificado se o contrato da API do curso publicado (0.2.90) tem `acquire`.
6. **Sem Content-Security-Policy** (registrado desde o PR #19). Com contas reais, um script injetado agiria na sessão do
   aluno. Entra junto com o Firebase.
7. **Firebase: garantias que dependem do servidor ainda não existem:** exclusão da conta garantida no servidor (Cloud
   Function ou extensão), App Check e limites de abuso, domínios autorizados. Registrado em
   `auditoria/contas-e-sincronizacao.md`.
8. **Nada foi testado em aparelho real, iOS, Firebase de produção ou Google real** (o login com Google foi testado no CI,
   pela janela do emulador).

### Baixa
9. Em 320 px, seletores de seção (`.seg`: "Física" em Matérias; "Provas" e "Cartões" na aula) ficam parte fora da tela,
   dentro de uma faixa com rolagem horizontal própria. A página não rola para o lado; o risco é o aluno não perceber
   que há mais opções.
10. No link do Claude, gravações seguidas esperam até 5 s pela trava anterior do próprio aparelho (para revezar com
    outros aparelhos). Nada se perde; o envio só atrasa.
11. Exclusão de conta parcial (nuvem apagada, login não): se o aluno reabrir o app antes de tentar de novo, a cópia
    local volta para a nuvem até a nova tentativa.
12. "Levar para a conta" pode levar o estudo sem conta feito por outra pessoa no mesmo aparelho. É uma ação explícita,
    com resumo do que vai; fica registrado.
13. Os workflows usam ações na versão 4 que o GitHub roda em Node 24 com aviso de descontinuação do Node 20. Não
    quebra hoje; atualizar num PR próprio.

### Verificado sem problema
- **Conteúdo pedagógico** (`testes/comparar-conteudo.js`, main × esta branch): questões, gabaritos, provas, vídeos,
  calendário, ordem e quantidade das 69 aulas e dos 542 cartões iguais. Mudam só os cartões (Lotes 1 a 4) e a teoria de
  ING07, ING09, MAT18 e FIS02, todos registrados nos commits dos lotes.
- **Atualização e reversão** (`testes/atualizacao.js`, builds reais da main e desta branch na mesma origem): o progresso
  da main abre no app novo sem perder nada; com a main de volta, o progresso gravado pelo app novo abre sem erro e sem
  perder estudo (a main não descarta nenhum campo); voltando ao app novo, o estudo das duas versões continua.
- **Reversão no link do Claude** (leitura do código, não testado): a main só substitui a nuvem por uma cópia local mais
  nova, e a cópia sem conta que ela leria fica mais velha que a nuvem depois da migração.
- **Service worker:** a lista offline é gerada pelo build e inclui os arquivos novos (`por4`, `ing4`, `fis5`).
- **Tamanho do progresso:** um aluno que completou o curso (300 dias, 60 simulados, 12 apostilas) gera cerca de 75 KB.
  O limite das regras é de 900.000 caracteres (cerca de 879 KB).
- **Regras do Firestore** (emulador): outra conta não lê, não grava e não apaga; campo a mais e rebaixamento de versão
  recusados.

## 4. Testes executados nesta auditoria

| Verificação | Resultado | Tipo |
|---|---|---|
| `node testes/plataforma.test.js` | 193 de 193 | Chromium simulado, nuvens fictícias |
| `testes/firebase-emulador.test.js` | 23 de 23 aqui; 25 de 25 no CI do PR #22 (2 do Google) | emuladores oficiais |
| `testes/atualizacao.js` (main → nova → main → nova) | 7 de 7 | builds reais, Chromium |
| `testes/comparar-conteudo.js` (main × nova) | só cartões e teoria mudam | leitura dos dados |
| Comparação visual pixel a pixel | 18 de 18 iguais ao PR #22; 12 de 15 iguais à main (só o Plano muda: "Seus dados") | Chromium |
| axe-core (WCAG 2.1 A/AA) | 0 violações (a main tem 1); saída idêntica ao PR #22 | Chromium |
| ESLint, `montar_app --conferir`, `autoteste` (172), `validar`, `conferir-workflows` | sem erros | — |
| Builds do site e do app + `verificar` | "nada restrito"; `node --check` em 23 arquivos | — |
| CI dos heads de `etapa3-flashcards` e dos PRs #16 a #22 | verde nos três workflows | GitHub Actions |

O APK não foi compilado localmente; o workflow App Android compila em cada push e passou em todos os heads.

## 5. Riscos não resolvidos

- Os itens 1, 2, 4 a 8 e 9 a 13 acima.
- **Cada merge na main publica o site** (workflow Site, `deploy-pages` na main). Integrar é lançar para os alunos.
- O curso no Claude e o site do GitHub Pages são publicados separadamente; o primeiro depende de republicar o artifact.

## 6. Plano de integração (nenhum merge foi feito)

**Recomendação: um único merge na main, depois da revisão PR a PR.** Como cada merge publica o site, juntar os oito
passos um a um publicaria sete versões intermediárias. Um merge só (do head final, com todo o histórico) publica uma vez
e se desfaz com um único `git revert -m 1`.

1. **Antes:** abrir o PR dos Lotes 0 a 3 (`claude/etapa3-flashcards` → `main`) e revisar o conteúdo. Revisar os PRs #16
   a #22 e o desta auditoria. Decidir os itens 4 e 5 (link do Claude).
2. **Congelar a main** até o merge (sem hotfix no meio). Se a main mudar, trazer a main para o topo da pilha com um
   merge e rodar tudo de novo; em conflito em `curso/app.js`, resolver nas partes de `curso/app/` e rodar
   `python3 web/montar_app.py`, nunca editar o `app.js` à mão.
3. **Verificação antes do merge**, no head final:
   - CI verde nos três workflows;
   - `node testes/comparar-conteudo.js <main> <head>`: só cartões e teoria mudam;
   - `node testes/atualizacao.js <site da main> <site do head>`: 7 de 7.
4. **Merge** com "Create a merge commit" (não "squash", que apagaria a ligação entre os PRs), do head final para a main.
   Fechar os PRs da pilha como integrados.
5. **Depois do merge:**
   - CI da main verde e o deploy do Pages concluído;
   - abrir o site publicado num navegador limpo e num com progresso antigo;
   - conferir que o service worker troca de versão;
   - repetir `testes/atualizacao.js` com o site publicado.
6. **Reversão:** `git revert -m 1 <merge>` num PR para a main (publica a versão anterior). A reversão foi testada com os
   builds: o progresso gravado pelo app novo abre na versão antiga sem perder estudo.
7. **Critérios objetivos para interromper (não fazer o merge ou reverter):**
   - qualquer falha de CI;
   - `comparar-conteudo.js` com mudança em questões, gabaritos, provas, ordem ou quantidade;
   - `atualizacao.js` com qualquer falha;
   - erro de JavaScript ao abrir o site publicado;
   - qualquer relato de progresso perdido.

*Alternativa:* merges em sequência (Lotes 0 a 3, #16, …, #22), mudando a base de cada PR para a main depois do merge
do anterior. Cada passo publica uma versão intermediária, todas com CI verde, e permite parar no meio. Mais lento e com
mais publicações.

## 7. Plano técnico de comercialização

Atualiza `auditoria/plano-monetizacao.md`. Nada foi implementado: sem cobrança, gateway, conta paga ou serviço externo.

**O que já existe (simulado, não ativado):**
- login por e-mail e Google (Firebase Auth);
- progresso por conta, com união entre aparelhos e transações;
- baixar os dados, excluir a conta e apagar dados do aparelho;
- regras do Firestore testadas no emulador;
- documento da nuvem só com o progresso.

**O que falta:**

| Área | Falta | Observação |
|---|---|---|
| Autorização e conteúdo premium | Servir o conteúdo pago fora dos arquivos públicos, por backend autenticado; lista do que é pago nas verificações do build; cache offline separado para quem tem acesso | Item 2; é a mudança de maior risco (build, service worker, APK) |
| Assinaturas | Estado e vigência só no servidor (webhook do gateway); regras do Firestore lendo a vigência | Nunca decidir acesso no aparelho |
| Pagamentos e cancelamento | Gateway com Pix e cartão em sandbox; cancelamento; arrependimento em 7 dias (CDC); recibos | Na Google Play, conteúdo digital vendido dentro do app segue a política de cobrança da loja |
| Recuperação de conta | Redefinição de senha existe; faltam e-mail verificado, troca de e-mail e atendimento para quem perdeu o acesso | |
| Privacidade e LGPD | Política revisada por jurista; base legal para menores (art. 14); retenção; encarregado; exclusão garantida no servidor; item 4 | `auditoria/lgpd-auditoria-tecnica.md` |
| Segurança | CSP; App Check; limites de abuso; segredos fora do repositório | |
| Suporte | Canal, prazos, painel para liberar ou revogar acesso com registro | |
| Monitoramento e backups | Erros do app, falhas de sincronização e de pagamento; exportação agendada do Firestore; teste de restauração | Hoje não há nenhum monitoramento |

**Custos (estimativa com premissas declaradas, a conferir nos preços vigentes):**
- Cada gravação de progresso é uma transação: uma leitura e uma gravação do documento (até cerca de 75 KB).
- Um aluno ativo grava algumas dezenas a uma centena de vezes por dia (as marcações são agrupadas a cada 1,5 s).
- Com 1.000 alunos ativos por dia, isso dá da ordem de 100 mil leituras e 100 mil gravações por dia. Passa da cota
  gratuita do Firestore e fica na faixa de poucos dólares por dia, mais o tráfego de saída.
- Hospedagem estática no GitHub Pages: gratuita. Gateway: taxa por transação.
- Suporte é o custo que mais cresce com o número de alunos.
- Antes de projetar, medir num piloto sem cobrança.

**Arquitetura:**
- **O que a estrutura atual suporta:** muitos alunos na parte gratuita (arquivos estáticos e progresso no aparelho), e
  a sincronização por documento único até o tamanho medido.
- **O que não suporta:** controle de acesso a conteúdo pago, e assinatura sem um serviço no servidor.
- **Mudança mínima recomendada:** Firestore ou Storage para o conteúdo pago, com regras por vigência, e uma função de
  servidor para o webhook do gateway.
- **Manutenção:** está razoável. O app tem 10 partes com menos de 350 linhas, testes em CI, emulador no CI e
  verificações contra publicação de material restrito.

**Ordem sugerida** (cada fase depende de autorização):
1. Decisões de negócio e jurídicas.
2. Firebase em ambiente de teste, com aparelhos reais e um piloto sem cobrança.
3. Separar o conteúdo pago.
4. Assinatura em sandbox.
5. Suporte e administração.
6. Lançamento controlado.

A plataforma **não está pronta** para cobrança.

## 8. Decisões que dependem de autorização humana

1. Abrir e revisar o PR dos Lotes 0 a 3 (conteúdo de 274 cartões e teoria de ING07, ING09 e MAT18).
2. Fazer a integração (merge na main = publicação do site) e escolher entre um merge único ou merges em sequência.
3. Republicar o curso no Claude, com qual contrato da API, e se o dono continua lendo o progresso de todos.
4. Implementar a exclusão do progresso na nuvem do curso no Claude (item 4).
5. Ativar o Firebase (projeto, regras, domínios, App Check, exclusão no servidor) e testar com contas reais.
6. Publicar um APK novo.
7. Todas as decisões de comercialização (modelo, preço, gateway, parecer jurídico).

## 9. Recomendação

**Corrigir antes de integrar, e então integrar a versão gratuita.**

Não há defeito que bloqueie a versão gratuita:
- CI verde em toda a pilha;
- conteúdo pedagógico intacto;
- atualização e reversão testadas sem perda de progresso;
- o único defeito de perda de dados encontrado (item 3) está corrigido e testado nesta branch.

Antes do merge, é preciso:
- dar um PR próprio e uma revisão de conteúdo aos Lotes 0 a 3 (item 1);
- incluir esta branch na integração (item 3).

O Firebase continua desligado depois do merge; ligá-lo é uma decisão separada (item 7 da seção 3).

**Para a versão paga, a recomendação é bloquear** até as fases da seção 7. Hoje não há como proteger conteúdo pago, nem
testes reais, monitoramento ou revisão jurídica.

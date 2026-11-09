# Contas, sincronização e dados do aluno

Estado em 2026-11-09, na branch `claude/validacao-contas` (a partir de `claude/contas-privacidade`). **Nenhum serviço
real foi ativado.** O Firebase continua desligado: não há `web/firebase.json`, e a sincronização exige ainda
`"sincronizar": true` na configuração (veja "Ativação"). Os testes usam nuvens fictícias em memória
(`testes/contas.js`, `testes/sincronia.js`, `testes/nuvem-claude.js`) e os **emuladores oficiais** de Auth e Firestore
com o SDK web real (`testes/firebase-emulador.test.js`, que agora roda no CI). A correção do link do curso no Claude
(item 11) só chega aos alunos quando o curso for publicado de novo.

## Problemas encontrados e corrigidos

| # | Gravidade | Problema | Evidência | Correção |
|---|---|---|---|---|
| 1 | **Crítica** (latente: o Firebase está desligado) | Um único progresso local por aparelho. Ao sair, o progresso da conta continuava na tela; quem entrasse depois recebia esse progresso, e a sincronização o unia à conta dele | Reproduzido com a nuvem fictícia e com os emuladores | Chaves locais por identidade (`missao-eear-v1@firebase:uid`, `@claude:id`); sem conta, as chaves de sempre |
| 2 | Alta | O progresso feito sem conta ia sozinho para a primeira conta que entrasse | Idem | Só vai com "Levar para a conta" (Hoje e cartão da conta); continua guardado sem conta |
| 3 | Alta | Gravação sem transação: dois aparelhos gravando juntos perdiam marcações | Emulador: **6 de 12** marcações simultâneas perdidas sem transação | `runTransaction`: a união é pura e refeita sobre a gravação do outro aparelho; **0 de 12** perdidas |
| 4 | Alta | Um aparelho que só tinha marcado tarefas, erros ou atividade era tratado como "sem estudo" e perdia essas marcações na primeira sincronização (defeito anterior) | Emulador: as 2 primeiras marcações de um aparelho sumiam | `semEstudo` considera tarefas, caderno de erros e atividade |
| 5 | Média | Gravação pendente de uma conta podia ser aplicada depois de trocar de conta | Teste "troca de conta com gravação pendente" | A troca cancela a gravação pendente; uma união calculada para uma conta nunca é aplicada em outra |
| 6 | Média | O documento da nuvem guardava nome e e-mail fora do progresso | Emulador: campos do documento | Documento só com `v`, `dados`, `t` e `atualizado`; as regras recusam campos a mais |
| 7 | Média | Sem proteção no servidor contra um app antigo gravando por cima de um formato novo | Emulador (regras) | Regra: `v` não pode diminuir |
| 8 | Média | Sair da conta não oferecia escolha sobre os dados locais | — | Sair mantendo ou apagando deste aparelho; apagar bloqueado se a nuvem não tem tudo |
| 9 | Média | Sem exclusão de conta, exportação ou consulta dos dados (art. 18 da LGPD) | — | Excluir a conta (reautenticação + "EXCLUIR"), baixar dados (JSON), ver o que está guardado, apagar deste aparelho |
| 10 | Baixa | Mensagens de sair e de excluir não apareciam depois da saída | Emulador | Mostradas no formulário de entrada |
| 11 | **Alta** | Link do curso no Claude (sem transação): dois aparelhos gravando juntos perdiam marcações, e a base de cada aparelho passava a ter o que a nuvem perdeu, então a próxima união apagava essas marcações **também dos aparelhos** | `testes/nuvem-claude.js`, código antigo: 4 de 8 marcações simultâneas perdidas na nuvem e nos dois aparelhos | Trava da nuvem (`doc.acquire`), curta e com nome novo a cada uso, renovada antes de gravar se vencer; conferência da gravação; a base só é registrada quando a nuvem tem exatamente o que foi gravado. **0 de 8** perdidas. Sem a trava: grava sem base (nada é apagado), confere de novo e avisa o aluno |
| 12 | Média | O aviso dizia "Progresso salvo na sua conta." com estudo ainda não enviado, inclusive sem conexão por muito tempo (falha silenciosa) | `testes/nuvem-claude.js` | Com algo pendente: "salvo neste aparelho; enviando"; sem conexão: "vai para a sua conta quando a conexão voltar" |
| 13 | Baixa | Os testes do emulador não rodavam no CI | — | Job `firebase-emulador` no workflow `Testes`, com versões fixas |

## Fluxos

- **Entrar:** o aparelho passa a mostrar só o progresso local daquela conta e sincroniza com a nuvem dela. Se houver
  estudo sem conta que a conta não tem, o app oferece "Levar para a conta". Nada é levado sozinho.
- **Sair:** o aluno escolhe entre "Sair e manter aqui", em que a cópia da conta fica guardada à parte e só volta
  quando a mesma conta entrar, e "Sair e apagar deste aparelho". Apagar só aparece quando a última sincronização
  gravou exatamente o progresso atual.
- **Trocar de conta:** é sair e entrar. Cada conta vê só o próprio progresso, e a cópia de recuperação e a base da
  sincronização também são por conta.
- **Sessão encerrada fora do app:** o aparelho volta ao progresso sem conta, sem apagar a cópia da conta.
- **Conta lembrada sem o serviço que a confirma** (configuração removida, ou o link do Claude aberto fora do
  Claude): o aparelho mostra o progresso sem conta.
- **Excluir a conta:** o aluno digita EXCLUIR e reautentica (senha ou Google). Em seguida, o app apaga o documento
  da nuvem, depois o login e depois a cópia local. Cada falha é informada exatamente: "nada foi excluído", ou "o
  progresso na nuvem foi apagado, mas a conta não".
- **Seus dados (Plano › Dados):**
  - **Baixar meus dados:** arquivo JSON. No app Android, mostra o código para copiar, porque a WebView não baixa
    arquivos.
  - **O que está guardado:** lista o que o aparelho guarda. Outras contas aparecem só pela quantidade.
  - **Apagar os dados deste aparelho:** pede confirmação. Com conta, fica bloqueado enquanto a nuvem não tem tudo.
    Sem conta, também há a opção de apagar o progresso de todas as contas guardadas.

## Link do curso no Claude (nuvem sem transação)

- **Isolamento:** as regras do curso publicado deixam cada aluno ler e gravar só `progresso/<o próprio id>`. O prefixo
  `progresso` só pode ser lido pelo dono do curso (regra `owner`), que portanto vê o progresso de todos. Isso deve
  constar da política de privacidade.
- **Com a trava** (`acquire`, presente no contrato 0.2.96 da API): só grava quem tem a trava; depois relê a nuvem. Se
  outro aparelho (por exemplo, um app antigo, sem a trava) gravar por cima, a conferência percebe e a união é refeita.
  O custo é de até 5 s de espera entre gravações seguidas.
- **Sem a trava** (contrato antigo, ou trava recusada): a gravação continua, sem base. Nada é apagado por engano, mas
  algo desmarcado pode voltar, tentativas e atividade feitas nos dois aparelhos ao mesmo tempo ficam com a maior
  contagem (sem somar), e um "Zerar" com estudo offline no outro aparelho manda esse estudo para a cópia de
  recuperação. O aluno é avisado, e "apagar deste aparelho" fica bloqueado.
- **Não verificado no serviço real:** se o contrato do curso publicado (0.2.90) tem `acquire`, se a trava cria o
  documento ou guarda campos nele, e a latência real. O app foi escrito para os dois casos, e a publicação é decisão do
  dono do curso.

## Dados antigos

- O progresso de quem nunca entrou numa conta continua em `missao-eear-v1`, sem migração e sem mudança de formato.
- No link do curso no Claude, quem já sincronizava abre a conta com o que está na nuvem. Se o progresso sem conta
  tiver algo que a nuvem não tem, o app oferece levá-lo; senão, não mostra nada.
- Documentos antigos na nuvem, com `nome` e `email` e sem `v`, são lidos normalmente. Na primeira gravação, viram o
  documento mínimo.

## Evidências

- **`testes/nuvem-claude.js` (10 verificações, no CI):**
  - 8 marcações simultâneas em dois aparelhos, com a trava e sem ela, sem perda; o código anterior perdia 4 de 8;
  - trava recusada, documento vazio criado pela trava, trava ocupada por outro aparelho, app antigo gravando por cima;
  - base corrompida ou de outra conta;
  - gravação recusada e aviso sem conexão.
- **`testes/contas.js` (14 verificações, no CI):**
  - progresso sem conta preservado e não associado sozinho a uma conta;
  - importação só quando o aluno pede;
  - alternância entre três contas (A, B, C, A);
  - conta lembrada sem o serviço que a confirma;
  - recuperação por conta;
  - baixar, consultar, cancelar, apagar, repetir a confirmação, apagar todas;
  - apagar com conta bloqueado até a nuvem ter tudo.
- **`testes/sincronia.js` (12 verificações, no CI):** união entre aparelhos, agora nas chaves por conta, e troca de
  conta sem vazamento.
- **`testes/firebase-emulador.test.js` (25 verificações, emuladores oficiais, no CI):**
  - documento mínimo, e "Levar para a conta" só quando o aluno pede;
  - sair mantendo e sair apagando, inclusive o bloqueio offline;
  - conta B sem dados de A;
  - troca com gravação pendente;
  - 12 gravações simultâneas sem perda;
  - versão futura;
  - documento corrompido;
  - regras: outra conta, campo a mais, rebaixamento de versão, apagar o próprio documento;
  - exclusão de conta com senha errada, confirmação errada e caminho completo;
  - conta encerrada em outra aba, página fechada antes de gravar, conta desativada no servidor;
  - conta trocada em outra aba com o formulário de exclusão aberto (fecha; nada é excluído);
  - exclusão parcial (falha ao apagar o login) e nova tentativa;
  - login com o Google e exclusão com reautenticação pelo Google, pela janela do emulador. Precisa de acesso a
    `apis.google.com` (há no CI; fora dele, sem acesso, aparece como NÃO TESTADO).

## Limitações

- **O emulador não é o Firestore de produção.** A semântica de transações e as regras são as do emulador oficial
  (`cloud-firestore-emulator` 1.22.0), não o serviço real com latência e cotas. A concorrência foi testada com dois
  aparelhos e gravações em rodadas simultâneas, não com carga real.
- **Google de verdade:** o emulador substitui a tela do Google. O login com redirecionamento (quando o navegador
  bloqueia a janela), o Google real, contas com verificação em duas etapas e navegadores de celular não foram testados.
- **Sessão expirada por tempo:** o emulador não expira o token. Foi testada a conta desativada no servidor, e não o
  token vencido depois de uma hora.
- **Link do curso no Claude:** veja a seção própria. A trava é cooperativa: um app antigo, sem ela, ainda pode gravar
  por cima. A conferência percebe a gravação de fora quando ela ocorre entre gravar e conferir, e a união refeita
  recupera o estudo, mas uma gravação antiga muito atrasada, depois da conferência, não é percebida.
- **Aparelho compartilhado:** o Firebase mantém a sessão. Quem não sair da conta deixa a conta aberta para o próximo
  usuário do aparelho, como em qualquer site. Não há aviso específico na tela; recomendo acrescentar um antes do
  lançamento.
- **Exclusão de conta:** se a conta for apagada e a exclusão do documento falhar no meio, o app informa. Uma garantia
  no servidor (Cloud Function ou a extensão "Delete User Data") é recomendada antes do lançamento.

## Ativação (pendências para usar de verdade)

1. Criar o projeto Firebase, gerar `web/firebase.json` com a configuração do app da web e publicar
   `web/firestore.rules`.
2. Repetir os fluxos de `testes/firebase-emulador.test.js` no projeto real (ambiente de teste), com contas de teste,
   incluindo o Google real.
3. Só então incluir `"sincronizar": true` em `web/firebase.json`. Sem isso, o login funciona, mas o progresso fica
   só no aparelho, separado por conta.
4. Configurar a exclusão no servidor (Cloud Function ou extensão), domínios autorizados, provedores de login e
   limites de abuso (App Check).
5. Atualizar a política de privacidade (dados na nuvem, exclusão, exportação) com revisão jurídica.
6. Testar em aparelhos reais: Android (APK), iOS e navegadores.
7. Link do curso no Claude: publicar de novo o curso com esta versão do app, com um contrato da API que tenha
   `acquire` (0.2.96 tem; o curso publicado está em 0.2.90, não verificado), e conferir com dois aparelhos reais
   abertos ao mesmo tempo. Publicar é decisão do dono do curso.

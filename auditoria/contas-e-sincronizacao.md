# Contas, sincronização e dados do aluno

Estado em 2026-11-09, na branch `claude/contas-privacidade`. **Nenhum serviço real foi ativado.** O Firebase
continua desligado: não há `web/firebase.json`, e a sincronização exige ainda `"sincronizar": true` na
configuração (veja "Ativação"). Os testes usam a nuvem fictícia em memória (`testes/contas.js`,
`testes/sincronia.js`) e os **emuladores oficiais** de Auth e Firestore com o SDK web real
(`testes/firebase-emulador.test.js`).

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

## Dados antigos

- O progresso de quem nunca entrou numa conta continua em `missao-eear-v1`, sem migração e sem mudança de formato.
- No link do curso no Claude, quem já sincronizava abre a conta com o que está na nuvem. Se o progresso sem conta
  tiver algo que a nuvem não tem, o app oferece levá-lo; senão, não mostra nada.
- Documentos antigos na nuvem, com `nome` e `email` e sem `v`, são lidos normalmente. Na primeira gravação, viram o
  documento mínimo.

## Evidências

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
- **`testes/firebase-emulador.test.js` (16 verificações, emuladores oficiais, fora do CI):**
  - documento mínimo;
  - sair mantendo e sair apagando, inclusive o bloqueio offline;
  - conta B sem dados de A;
  - troca com gravação pendente;
  - 12 gravações simultâneas sem perda;
  - versão futura;
  - documento corrompido;
  - regras: outra conta, campo a mais, rebaixamento de versão, apagar o próprio documento;
  - exclusão de conta com senha errada, confirmação errada e caminho completo.

## Limitações

- **O emulador não é o Firestore de produção.** A semântica de transações e as regras são as do emulador oficial
  (`cloud-firestore-emulator` 1.22.0), não o serviço real com latência e cotas. A concorrência foi testada com dois
  aparelhos e gravações em rodadas simultâneas, não com carga real.
- **O teste dos emuladores não roda no CI:** ele precisa de Java, do firebase-tools e do SDK web. Rodei localmente
  (comando em `CLAUDE.md`). Incluí-lo no CI exige mudar o workflow `Testes`.
- **Fluxos não automatizados:** login com Google (popup e redirecionamento) e reautenticação pelo Google.
- **Link do curso no Claude:** a nuvem do Claude não tem transação, então a gravação é ler-unir-gravar. O risco de
  gravações exatamente simultâneas continua só nesse caminho.
- **Aparelho compartilhado:** o Firebase mantém a sessão. Quem não sair da conta deixa a conta aberta para o próximo
  usuário do aparelho, como em qualquer site. Não há aviso específico na tela; recomendo acrescentar um antes do
  lançamento.
- **Exclusão de conta:** se a conta for apagada e a exclusão do documento falhar no meio, o app informa. Uma garantia
  no servidor (Cloud Function ou a extensão "Delete User Data") é recomendada antes do lançamento.

## Ativação (pendências para usar de verdade)

1. Criar o projeto Firebase, gerar `web/firebase.json` com a configuração do app da web e publicar
   `web/firestore.rules`.
2. Rodar `testes/firebase-emulador.test.js` e repetir os mesmos fluxos no projeto real (ambiente de teste), com
   contas de teste.
3. Só então incluir `"sincronizar": true` em `web/firebase.json`. Sem isso, o login funciona, mas o progresso fica
   só no aparelho, separado por conta.
4. Configurar a exclusão no servidor (Cloud Function ou extensão), domínios autorizados, provedores de login e
   limites de abuso (App Check).
5. Atualizar a política de privacidade (dados na nuvem, exclusão, exportação) com revisão jurídica.
6. Testar em aparelhos reais: Android (APK), iOS e navegadores.

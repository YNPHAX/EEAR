# Auditoria técnica de privacidade (LGPD)

Levantamento técnico de 2026-11-09, feito a partir do código (branch `claude/sync-acessibilidade`). **Não é parecer
jurídico e não declara conformidade com a LGPD.** As bases legais citadas são hipóteses para a revisão de um
especialista. A política em vigor é `web/legal/privacidade.html`.

## Dados tratados hoje (versão gratuita, sem conta ativa)

| Dado | Onde fica | Finalidade | Retenção | Observações |
|---|---|---|---|---|
| Nome informado pelo aluno (opcional, até 80 caracteres) | `localStorage` `missao-eear-v1` (`cfg.nome`) | Saudação e certificado | Até o aluno apagar os dados do site ou desinstalar o app | Não sai do aparelho, exceto se o aluno copiar o progresso |
| Progresso de estudo: notas, cartões, simulados, caderno de erros, datas de atividade, plano, certificados | `missao-eear-v1` | Plano de estudo, revisão espaçada e certificado | Idem | "Zerar progresso" apaga o estudo e mantém a configuração |
| Cópia da última sincronização (só com a nuvem ligada) | `missao-eear-v1-base` | Unir o progresso entre aparelhos sem perder estudo | Substituída a cada sincronização | **Nova nesta branch**; mesmo conteúdo do progresso |
| Cópia de recuperação | `missao-eear-v1-recuperar` | Não perder um progresso ilegível ou que não pôde ser unido | Até o aluno tocar em "Descartar" | Criada no PR #19 e nesta branch |
| Aba preferida da apostila | `missao-eear-aba` | Preferência de tela | Idem | Não é dado pessoal sensível |
| Código do progresso copiado ou colado | Área de transferência e o destino que o aluno escolher | Levar o progresso a outro aparelho | Fora do controle do app | Contém o nome; o aluno decide para onde envia |
| Dados técnicos de conexão (IP, navegador) | GitHub Pages (hospedagem) e YouTube (capas e vídeos) | Entregar o site e as videoaulas | Conforme as políticas desses serviços | Coleta direta por eles, descrita na política |
| E-mail e mensagem de quem escreve ao suporte | Gmail | Responder | Não definida | A política já aponta pendências sobre transferência internacional |

Sem rastreamento: não há analytics, pixel nem cookies próprios. As fontes são servidas pelo próprio site (o build
substitui o Google Fonts), e os vídeos usam `youtube-nocookie.com`.

## Dados previstos com a conta ligada (Firebase, hoje desligado)

| Dado | Onde | Observações |
|---|---|---|
| E-mail, senha (o hash fica no Firebase) ou conta Google | Firebase Authentication | Redefinição de senha por e-mail já existe |
| Progresso inteiro (texto JSON, até 900 KB) | Firestore `alunos/{uid}`, campo `dados` | As regras deixam cada aluno ler e gravar só o próprio documento |
| `nome`, `email`, `t`, `atualizado` | Mesmo documento, em campos separados | **O e-mail repete o que já está no Authentication.** O nome já está dentro de `dados`. Os dois campos são dispensáveis (minimização) |

## Riscos e medidas recomendadas

| # | Risco | Gravidade | Medida recomendada | Situação |
|---|---|---|---|---|
| 1 | Progresso de um aluno sobrescrito por outro aparelho (perda de dado) | Alta | União em três vias | **Feito nesta branch** (`curso/app/08-uniao-nuvem.js`, `testes/sincronia.js`) |
| 2 | Script injetado por progresso colado (exposição do progresso e da sessão) | Alta | Escapar dados no HTML | **Feito no PR #19**; CSP recomendada antes do login |
| 3 | Campos `email` e `nome` duplicados no Firestore | Média | Gravar só `dados`, `t` e `atualizado` | **Feito** (branch `claude/contas-privacidade`): documento com `v`, `dados`, `t` e `atualizado`; as regras recusam campos a mais |
| 4 | Falta de exclusão de conta e de exportação pelo próprio aluno (direitos do art. 18) | Alta, quando houver conta | "Excluir minha conta" (Auth e documento) e "Baixar meus dados" (o JSON) | **Feito** e testado nos emuladores oficiais; falta a garantia no servidor (Cloud Function) |
| 5 | Troca de conta no mesmo aparelho e cópias locais | Média | Progresso local por conta; ao sair, escolher manter ou apagar | **Feito** (veja `auditoria/contas-e-sincronizacao.md`) |
| 6 | Adolescentes (o público inclui menores de 18 anos) | Alta | Revisar base legal e consentimento (art. 14), linguagem e coleta mínima | A política tem uma seção; precisa de revisão jurídica |
| 7 | Retenção na nuvem sem prazo definido | Média | Definir prazo para contas inativas e exclusão automática | Pendente: decisão do controlador |
| 8 | Transferência internacional (Firebase/Google, Gmail) | Média | Confirmar o enquadramento (Res. CD/ANPD nº 19/2024) e o mecanismo (arts. 33 a 36) | Pendente: a política já registra isso |
| 9 | Dados de pagamento (versão paga) | Alta | Nunca guardar cartão; usar o gateway; guardar só a vigência no servidor | Ver `auditoria/plano-monetizacao.md` |
| 10 | Encarregado (DPO) e canal para os direitos | Média | Indicar encarregado e prazo de resposta | Pendente: decisão do controlador |
| 11 | Link do curso no Claude: o dono do curso pode ler o progresso de todos os alunos (regra `progresso` com leitura `owner`); cada aluno só lê e grava o próprio | Média | Informar isso na política; avaliar se o dono precisa dessa leitura (a regra pode ser `self`, mas então nem o dono lê) | Pendente: decisão do controlador (veja `auditoria/contas-e-sincronizacao.md`) |

## Bases legais (hipóteses para revisão)

- **Progresso no aparelho:** os dados não saem do aparelho nem chegam ao controlador. A revisão deve confirmar se
  isso é tratamento pelo controlador.
- **Conta e sincronização:** execução de contrato ou procedimentos preliminares (art. 7º, V). No caso de menores,
  observar o art. 14.
- **Suporte por e-mail:** execução de contrato ou legítimo interesse, conforme o caso.
- **Versão paga:** execução de contrato, cumprimento de obrigação legal (fiscal) e legítimo interesse (prevenção a
  fraude), a definir.

## Limitações deste levantamento

- Analisa o código e a configuração do repositório. Não inspeciona o projeto Firebase real, que não existe ou não foi
  fornecido, nem os contratos com GitHub, Google ou o gateway.
- Não verifica os registros dos serviços de terceiros nem o que eles coletam além do descrito nas políticas deles.
- **A decisão sobre conformidade e sobre o texto da política exige revisão jurídica especializada.**

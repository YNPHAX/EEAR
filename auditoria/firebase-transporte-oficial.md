# Transporte oficial Firebase, persistência e migração

Escopo: branch `codex/eear-correcao-estrutural`, continuidade de `e47ae417` / runtime `d165485`.
Não habilita um projeto real, não converte serviços nem publica regras. Firebase é o único adaptador de
sincronização implementado. Sem configuração Firebase válida e `sincronizar: true`, o app opera localmente.
O build continua aceitando somente a configuração de homologação `eear-teste`; o projeto oficial requer decisão,
configuração e auditoria independentes. CI verde nesta separação não aprova o transporte antigo.

## Inventário e separação

| Dependência | Destino / política |
|---|---|
| `curso/app/02-progresso-nuvem.js`, antigo módulo misto | Somente orquestração da união e confirmação, exige `firebase:` e adaptador transacional. Não há fallback leitura/gravação. |
| `02-certificados.js` | Cálculo/migração de certificados, movido sem mudar o algoritmo. |
| `02-persistencia-local.js`, `14-abas.js`, `15-diarios-pendentes.js`, `16-diario-duravel.js`, `18-operacoes-*.js` | Estado local, reservas imutáveis, checkpoint IndexedDB, recuperação, geração de exclusão e operações idempotentes. Não dependem de Firebase para estudar. Módulos 14–16 e núcleo de operações preservados. |
| `02-z-firebase.js` | Auth e único adaptador: `runTransaction`, envelope Firestore v2. Não expõe `get/set` avulsos ao conciliador. Inicializado antes de `07-eventos.js`. |
| `08-uniao-nuvem.js` | União pura, leitura de versões antigas e assinatura/linhagem de compatibilidade. Assinatura FNV é identificação de conteúdo, não criptografia/autorização. |
| `09-contas.js`, `17-estado-persistencia.js` | UID, exportação, exclusão local, exclusão Firebase com marcador permanente, confirmação local distinta da remota. Legado não autoriza apagar cópia local. |
| `10-nuvem-claude.js`, `window.claude.use` | Somente leitura da identidade do host para abrir seu perfil LOCAL quando não há Firebase. Não solicita `db/doc/get/set/acquire`. Não há flag de reativação. SDK/hot legado é ignorado por inteiro quando há configuração Firebase. |
| `11-formatos-legados.js` | Leitura defensiva de marcas antigas de exclusão. Não há exclusão/reenvio remoto legado. Substitui `11-exclusao-nuvem.js`. |
| Antigo `12-caminho-novo.js`, `progresso`/`progresso2` | Caminhos de migração remota removidos do runtime. Não consulta serviço antigo, não presume regras dele, não traduz conta por nome/e-mail. |
| `12-importacao-migracao.js`, ações `impabrir/impok` | Importação explícita de código v1 ou arquivo de `Baixar meus dados`. Valida e une na identidade atual; conta/e-mail do arquivo não escolhem destino. Código de importação extraído de `07-eventos.js`, sem reduzir validação ou proteção de certificados. |
| `web/regras-claude.json` | Evidência histórica de ACL; permanece no repositório. Não é autorização do Firebase nem contrato novo implementado no servidor. |
| `curso/index.html` (`claude` viewport), `web/build.py` | Metadado do host, removido na saída de site/app; não é transporte. O build/verificador de Hosting não é contornado. |
| `.github/workflows/*` com `claude/**` | Filtro de branches, não dependência de sincronização. CI não publica em push. |
| `web/firebase.homologacao.exemplo.json`, `.firebaserc`, `firebase.json`, `web/firestore.rules` | Configuração de teste, emuladores/predeploy e isolamento UID. Nenhuma alteração de regras ou configuração de projeto real nesta rodada. |
| `testes/perfil-legado.js`, `atualizacao.js`, `versoes-misturadas.js`, `diario-legado-auditoria.test.js` | Ferramentas/fixtures de compatibilidade de formatos e atualização; continuam disponíveis. Parte usa versões antigas ou nuvem fictícia legada e deve ser identificada no resultado. |
| `auditoria/*` anteriores | Relatórios e falhas históricas preservados, incluindo a sobrescrita adversarial do cenário 9 e CI reprovado de `e47ae417`. |

## Política de testes: sem equivalência falsa

`node testes/plataforma.test.js` executa dados, interface, versões locais, celular, robustez, abas e crashes locais.
Não anuncia sucesso de sincronização. Firebase oficial roda em outro comando/job, sempre em emuladores.

`node testes/historicos-legado.test.js` conserva os corpos e asserções antigos, inclusive os blocos de nuvem em
`plataforma.test.js` (certificados) e `versoes.js` (cartões). `EEAR_EPOCA=9 node testes/historicos-legado.test.js epoca`
é o cenário adversarial original. Os grupos `sincronia`, `contas`, `nuvem`, `exclusao`, `epoca`, `progresso2`, `falhas`
continuam acessíveis nesse runner, sem alteração das implementações históricas. O modelo `regras-nuvem.js`
só pertence a essa matriz. O job manual opcional `historico-legado` conserva a saída não zero e o log no GitHub;
não usa `continue-on-error`. Uma falha conhecida não vira sucesso ou teste pulado disfarçado.

| Critério de integridade antes misturado ao legado | Evidência oficial exigida |
|---|---|
| Cartões, versão vista, âncoras, certificados e importação | `sincronia-firebase.test.js`: arquivo antigo, repetição, leitura em outro dispositivo; versões locais da plataforma intactas. |
| União entre aparelhos, desmarcar, Zerar, estudo posterior, certificados | Oito casos originais `f01-abas.test.js`, `f01-riscos.test.js`, novos casos Firebase, regressões de operações. |
| Contagens, ordem inversa, suspensão, confirmação perdida | `noturna-integridade`, `noturna-confirmacao`, `operacoes-suspensas`, três dispositivos sem Web Locks no teste Firebase. |
| Conta A/B, sessão antiga, exclusão, falhas, regras UID e campos | `firebase-emulador.test.js` (50 critérios), `noturna-seguranca`, `operacoes-exclusao-concorrente`, `operacoes-cache-exclusao`, `quarentena-exclusao` e ciclo de sessão controlado. |
| Persistência, quota, crashes repetidos e migração | Os 13 grupos `persistencia-regressoes.test.js`, dupla falha real, cache restaurado, testes complementares de diários/crashes. |
| ACL do serviço antigo, `acquire`, `progresso2`, épocas sob escritor legado | Histórico incompatível, NÃO substituído por alegação de suporte. Serviço permanece bloqueado. Modelo de proposta em `legado-contrato.test.js` não é backend real. |
| Barreira de transporte | `legado-bloqueio.test.js`: zero solicitação de banco/I/O, com/sem Web Locks, três abas, exportação, proteção contra exclusão e duas quedas do navegador. |
| Firebase e SDK legado presentes juntos | `sincronia-firebase.test.js`: zero acesso ao SDK/hot legado, nem seleção do perfil antigo por marcador lembrado. |

A fixture F01 compara byte a byte `curso/app.js` com o build servido e imprime SHA-256. Não instrumenta o runtime
nessa verificação. Alguns testes de interrupção instalam breakpoints CDP; testes de conta/concorrência específicos
instrumentam somente o transporte em memória e assim são identificados, não confundidos com Firebase real.

## Migração de usuários antigos

1. No perfil de origem, preservar o dispositivo e exportar por **Copiar meu progresso** ou **Baixar meus dados**.
   Em APK, baixar abre o código para copiar. Se a cópia só estiver no serviço antigo, será necessário obter uma
   exportação autorizada pelo dono; esta versão não acessa esse serviço para resgatá-la.
2. Entrar explicitamente na conta Firebase desejada no ambiente validado. Não deduzir associação por nome,
   e-mail ou UID antigo. Sem login, o destino é a cópia sem conta; a ação **Levar para a conta** continua explícita.
3. Em Plano › Dados, colar o código ou o conteúdo JSON do arquivo. O importador lê somente `progresso` do envelope;
   metadados `conta`, `copiaDeRecuperacao` e `quarentena` não são aplicados como progresso nem executados. Manter
   o arquivo original: as cópias de recuperação/quarentena exigem análise e importação explícita separadas.
4. Conferir nome, tarefas, contagens, cartões e certificados. Reimportação do mesmo arquivo não deve duplicar
   contagens. Importar ausência não ordena apagar estudo posterior; substituir é uma escolha explícita existente.
5. Esperar checkpoint local confirmado **e** sincronização Firebase confirmada; validar em outro dispositivo.
   Só então considerar apagar uma cópia local através das guardas do app. Não apagar o único backup externo.
6. Regras v2 rejeitam atualização incompatível do documento por cliente anterior. Marcador de conta excluída bloqueia
   sessões antigas, inclusive tokens ainda válidos. Isso depende das regras efetivamente instaladas no projeto:
   nesta missão apenas regras do repositório foram testadas em emuladores; nenhuma instalação real foi feita.

## Confirmações, segurança e limites

- Checkpoint local é confirmado por `transaction.oncomplete`. Reserva localStorage ou estado em memória não
  equivalem a durabilidade. Sem IndexedDB, a UI informa reserva sem proteção contra queda e recomenda exportar.
- Confirmação remota exige conclusão da transação Firestore e conta/sessão ainda atual. Estado posterior à transação
  continua pendente. Perda da resposta após commit é recuperada por IDs idempotentes; não por contagem de tentativas.
- Firebase armazena nome do certificado se informado e progresso; exportação pode conter e-mail. Tratar backups
  como dados pessoais. Não foi aplicado dado real, nem acessado Firebase real nesta rodada.
- Crescimento causal de `_ops` é linear, inclusive após Zerar. Limite remoto continua explícito; carga antiga
  demonstrou recusa perto de 900 mil caracteres. Não há compactação nova nem promessa de crescimento ilimitado.
  Ver medições anteriores e relatório desta validação. Backup, capacidade e retenção precisam de decisão posterior.
- Downgrade não suporta unir automaticamente checkpoints/diários novos em runtime antigo. Preservar backup completo,
  interromper escritores antigos e validar importação manual na versão de destino em cópia isolada. Voltar um build
  não revoga cache/SW/APK antigos. Não apagar metadados para simular compatibilidade.
- Chromium em modo móvel não prova Safari/iOS/WebViews físicos. IndexedDB pode ser removido pelo SO/usuário ou sofrer
  quota, modo privado e perda de energia. Sem Web Locks, a integridade vem das transações IDB; não de heartbeat ou
  carência de dois segundos. Uma UI não pode prometer sobreviver a remoção do armazenamento pelo navegador.
- OAuth Google foi exercitado somente no Auth Emulator; domínios autorizados, redirecionamento real, certificados,
  configurações de produção e regras instaladas exigem validação autorizada separada. Não há homologação aprovada.

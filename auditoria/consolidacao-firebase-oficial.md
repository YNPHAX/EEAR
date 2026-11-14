# Consolidação da sincronização oficial Firebase — validação técnica

Branch exclusiva: `codex/eear-correcao-estrutural`. Origem: entrega `e47ae417bf5eb56eeb1c5f5763aac0cddf7937bd`,
runtime `d16548547806575c1d32491a32d6166226f2096d`. Data da execução: 14/11/2026, UTC.

**Runtime final: `650007b5eeb2d0bcb41f9277e5d370afe5a1edc2`. Testes/CI: `eb8d464c2efb053b9c3660fa8797a08cc843db8f`.**
SHA-256 do bundle: `124a9084d0a8ac02179df1a42134f075b3ee72cddb78e0bcaf4c351e31ea9f48`.
O commit documental desta entrega não altera esse runtime. Nenhum merge, deploy, publicação de regras ou acesso
Firebase real foi executado. Não foram alteradas branches main, Claude ou auditoria.

**Situação: entregue para auditoria independente; homologação não aprovada por esta implementação/validação.**
O transporte legado permanece bloqueado. Seus cenários históricos continuam incompatíveis e reprovados;
não foram convertidos em resultados positivos para obter CI verde.

## Resultado e arquitetura

Firebase é o único adaptador executável de sincronização, exige conta Firebase e transação Firestore.
O runtime não solicita banco/documento/leitura/gravação/trava do serviço legado e não possui flag para reativá-lo.
Sem Firebase configurado, continua possível estudar e exportar localmente. Configurar Firebase não converte contas
antigas; o SDK/hot legado deixa de participar da inicialização e da seleção da identidade quando Firebase existe.

Foram separados certificados, configuração, persistência local, adaptador Firebase, orquestração de união,
leitura defensiva de formatos antigos e importação explícita. Os módulos transacionais 14–16 são idênticos à base:
esta rodada não reescreve IndexedDB, operações, recuperação, exclusão ou compactação causal.

O inventário completo de dependências, contratos e procedimentos está em
[firebase-transporte-oficial.md](firebase-transporte-oficial.md). O manifesto
[firebase-oficial-resultados.json](firebase-oficial-resultados.json) lista arquivos, comandos, hashes e resultados;
[firebase-oficial-evidencias.txt](firebase-oficial-evidencias.txt) preserva saídas positivas e negativas.

| Commit | Alteração |
|---|---|
| `f332c797cf04466497ccb3fb90718b75d08fbf35` | Separação solicitada; remoção dos caminhos executáveis do banco legado; prioridade Firebase; importação de arquivo de backup; runners histórico/oficial separados. |
| `650007b5eeb2d0bcb41f9277e5d370afe5a1edc2` | Correção comprovada do build de homologação: leitura única da configuração antes da seleção local. Sondas H01–H03 passam a integrar o CI automático. |
| `eb8d464c2efb053b9c3660fa8797a08cc843db8f` | Preparação de interrupção nativa verificável, controle do depurador e atualização/reversão entre runtimes transacionais, inclusive no CI. Nenhum byte do runtime alterado. |

## Defeitos e limites confirmados

| Achado | Gravidade | Evidência / tratamento |
|---|---|---|
| Arquivo de **Baixar meus dados** não importável como progresso na versão anterior | Média | Comparação local real: d165485 não importa a marca `T:arquivo`; 650007b importa. `09-contas.js:108` produz envelope `app/progresso`; `12-importacao-migracao.js:4` agora reconhece esse formato e aplica só o progresso na identidade atual. Teste oficial comprova repetição sem duplicação e recuperação em outro dispositivo. |
| Regressão de aceitação do build válido de homologação durante esta rodada | Média | f332c79: a nova leitura `!window.EEAR_FIREBASE` não atende à gramática estrita de H02. As sondas recusaram o candidato. Corrigido em 650007b por `02-configuracao.js:2` e uso da constante no perfil local. **O verificador não foi flexibilizado.** |
| CI não alcançou o breakpoint da interrupção | Preparação de teste, sem perda de dados comprovada | CI 650007b reprovado: pausa arbitrária dos observadores não estabelece que IDB está livre. Controle independente demonstra fila bloqueada por pausa JS dentro de transação. Helper eb8d464 pausa em `oncomplete`, comprova `TransactionInactiveError` e exige barreira readwrite sem alterações. Breakpoint adversarial, crash, reserva >2s, A+B e atividade 4/4 continuam idênticos. O controle não prova em qual frame a execução antiga do CI parou; a falha antiga permanece registrada. |
| Transporte legado não fornece proteção contra escritor antigo | Alta se reativado | Incompatibilidade já demonstrada no relatório d165485 e cenário 9 original. Não foi corrigido por tentativas/esperas: o transporte segue desativado e não pode confirmar segurança remota ou autorizar apagar a cópia local. |
| Crescimento dos metadados até recusa remota | Média, capacidade | Reproduzido sem compactação: estado mínimo de 6.000 ações ultrapassa 900 mil caracteres. Recusa explícita mantém checkpoint e reabertura; sincronização para. Requer projeto posterior de capacidade/compactação com prova de segurança. |
| Reversão automática para 2f6cad6 | Alta se usada sem procedimento de recuperação | Mantida uma negativa no teste histórico: união automática após voltar da versão antiga não é garantida. Estudo fica em quarentena, é oferecido na UI e a importação explícita recupera as duas versões. Não declarar downgrade automático suportado. |

Não foram encontradas novas perdas reproduzíveis nos cenários oficiais concluídos desta rodada. Essa constatação
é limitada aos testes e modelos executados; não é prova de ausência de outros defeitos.

## Matriz executada

As execuções finais usam snapshot imutável 650007b. Antes de cada suíte o runner confere seu SHA-256;
a fixture compara os bytes do `curso/app.js` ao `app.js` efetivamente servido. Build de site, conteúdo Android e
fonte têm o hash final indicado acima. Não se testaram arquivos intermediários como se fossem o runtime entregue.

| Suíte / cenário | Resultado |
|---|---|
| Plataforma local integral | **166 positivas, zero negativas**, incluindo dados, interface, cartões/celular, robustez, abas e crashes. Sincronização Firebase é outra suíte; não se atribui esse resultado ao legado. |
| Firebase Emulator oficial | **50/50**, incluindo e-mail/senha, Google emulado, sessão offline, reconexão, regras, exclusão de conta e isolamento. Repetição final isolada concluída. |
| Oito F01 originais | **8/8**: dispositivos, fechar A/B, desmarcar, Zerar, certificado, reconectar e Zerar duplo. Arquivo original idêntico à entrega de origem. |
| Persistência e achados independentes | **13/13 grupos**, N01–N07 e regressões F09/F13. Repetição com helper eb8d464: **13/13**, local e CI. |
| Sincronização Firebase acrescentada | **4/4 grupos**: prioridade sobre SDK legado; backup/conta de destino/reimportação/cartões/certificados; desmarcar e Zerar+estudo 1/1; três dispositivos sem Web Locks, offline e ordem inversa, exatamente **5/5** em servidor e checkpoints recuperados. |
| F01 riscos adicionais | **6/6**, inclusive Zerar em uma aba, suspensão, exclusão sem notificações, contagens e interrupção nativa. |
| Diários independentes | **8/8**, inclusive quatro abas/202 atividades, fechamento/crash, eventos perdidos e liderança suspensa. |
| F13 fallback e órfãos | Passaram: última conferência, quatro casos de suspensão/retorno e nove sequências com **11/11**, inclusive controle de relógio de 30 minutos, sem Web Locks. Não representa meia hora de suspensão física em celular. |
| Browser.crash sem Web Locks | **4/4**, incluindo Zerar+estudo, recuperação e segunda queda. |
| Migração de diários verdadeiros | Produtores **8bd32d2 e 2f6cad6 passaram**, três abas, preservação e contagens exatas. Não são diários fabricados por uma reimplementação do produtor. |
| Quota real + abort de IDB | Passou: não confirma falsamente, retoma mesmos IDs, checkpoint **3/3** e sobrevive a crash. |
| Cache reconstruído | Passou: cache atrasado atualizado; leitura de certificado antigo não regrava os bytes sem estudo. |
| Metadados acima do limite remoto | Passou: checkpoint/local/reabertura **6002**, remoto anterior **2**, recusa e aviso explícitos. |
| Carga de navegador | **2.000 ações**, quatro abas, sem Web Locks/storage/Firebase: **2002/2002**, certificado, dez resets e reabertura, zero negativas. |
| Núcleo publicado | **12.000 operações**, contagens/repetição/reset passaram. Normalizador mínimo explícito; não substitui UI/IndexedDB. |
| Hosting H01–H03 | **193 autotestes + 11 sondas + 12 gates + 3 contextos**, sem negativas. Configuração em script-texto/template continua recusada. HTTP do Hosting Emulator: cabeçalhos e assets passaram; handler reservado não é reescrito para o app. |
| Lint, montagem, integridade, builds | Passaram. APK compilado/verificado no CI; publicação skipped. |
| Controle do depurador | Passou: pausar transação real bloqueia barreira de outra aba; retomar libera sem alterar checkpoint. Nova preparação adversarial passou mantendo **4/4**. |
| Atualização transacional d165485 ↔ 650007b | **6/6 etapas**, contagens 3/3, 4/4, 5/5, 6/6; Zerar+estudo preserva 1/1 nas duas versões, sem restaurar certificados. |

F02–F04: ciclo de sessão `recusa/callback/saida`, sem resposta antiga alterando a conta atual. F05–F07:
barreiras de artefatos/UID, descrição de nome pessoal, fixture sem herdar configuração real. F08: Zerar seguido de
estudo, aba única e crashes. F09: dispositivos 4/4, ACK perdido 4/4, simulados independentes 2/2, contagens de múltiplas
abas e nove sequências. F10–F13: diário pendente, exclusão concorrente, falta de Web Locks, notificações perdidas,
transações interrompidas e segunda queda. N01–N07: quota/abort e aviso, resíduos locais/quarentena, sessão antiga,
validação de configuração/importação, versões futuras, reset/crash e recuperação repetida.

## Histórico preservado e comparação

Dez arquivos de testes, incluindo `f01-abas.test.js`, `persistencia-regressoes.test.js` e os oito módulos centrais
legados, são byte a byte iguais à base e47ae417. Os corpos históricos embutidos de certificados em
`plataforma.test.js` e cartões em `versoes.js` também são idênticos: somente foram colocados sob seleção histórica.
O sufixo do helper de interrupção que executa a intercalação e verifica integridade permanece idêntico; mudou a
preparação dos observadores, com novas provas de inatividade/barreira. Hashes constam no manifesto.

- `node testes/historicos-legado.test.js`: **exit 1**, 159 positivas e **14 negativas**, depois erro em `contas.js`
  porque a nuvem legada não recebeu progresso. A execução para nesse erro; módulos posteriores não foram
  considerados testados/aprovados. Permanecem disponíveis individualmente no runner histórico.
- `EEAR_EPOCA=9 node testes/historicos-legado.test.js epoca`: **exit 1**, não estabelece a ordem confirmada B → A
  pois o transporte está bloqueado. As 21 positivas impressas são verificações de dados anteriores ao cenário;
  **não significam que o cenário 9 passou**. A negativa original antes do bloqueio está preservada no relatório d165485.
- `testes/atualizacao.js`, origem 2f6cad6: **8 positivas, uma negativa** de união automática, preservada;
  quarentena e recuperação explícita passaram.
- Ensaio adicional desse mesmo teste com d165485: **3 negativas**. A preparação antiga grava somente localStorage
  depois de já criar um checkpoint vazio; isso não prepara um progresso transacional. Além disso, o controle de
  quarentena daquele teste exige especificamente uma reversão sem metadados, enquanto d165485 preserva os IDs.
  O teste antigo não foi alterado para apagar essas negativas. A nova suíte transacional prepara dados antes do
  primeiro script e valida o caminho compatível com todos os campos e contagens. Ambos os logs foram preservados.

## Exclusão, sessões antigas e confirmações

A exclusão usa transação que grava marcador imutável `contasExcluidas/{uid}` e elimina `alunos/{uid}` antes de excluir
Auth. As regras emuladas recusam recriação por sessão antiga ainda conectada. A reautenticação por senha e Google,
falha parcial, troca de conta durante formulário e dados de outra conta continuam cobertos. Não foi simulado que
revogar Auth, sozinho, apagasse imediatamente tokens de outros dispositivos.

N02 prova remoção de nome/progresso/resíduos/quarentena do aparelho que exclui ou sai apagando. Isso não significa
remoção de backups externos ou caches offline de outros aparelhos. O marcador UID/data continua por segurança;
sua retenção e divulgação precisam ser definidas para operação oficial.

Checkpoint local confirmado, reserva/persistência pendente e confirmação Firebase são estados distintos. A
confirmação Firebase só vem da transação concluída na sessão atual. Operações posteriores continuam pendentes.
O teste de ACK perdido retém uma resposta HTTP real após commit, provoca crash e exige exatamente 4/4 ao recuperar.
O servidor valida envelope e UID; não valida o JSON causal interno. Um escritor autorizado que imite v2 pode
substituir o próprio documento. A garantia de união vale para clientes oficiais corretos, não para um cliente
arbitrário do próprio usuário.

## Capacidade, reversão e pendências

Carga real: com 2.000 ações, estado **313.236 B**, checkpoint **674.550 B**; após dez resets e apenas uma marca
visível, estado **353.491 B**, checkpoint **797.604 B**, **2.021 recibos**. No núcleo mínimo, 6.000 operações geram
**910.368 B** e 12.000 geram **1.826.371 B**. Não houve compactação; reset não remove histórico causal.
Medidas de uso/quota da origem são estimativas do navegador, não garantia de persistência física.

Antes de avançar à operação oficial:

1. Auditoria independente dos SHAs exatos, especialmente exclusão concorrente, migração e protocolo v2.
2. Definir projeto/configuração/regras e validar instalação real somente com autorização específica. O build ainda
   aceita apenas eear-teste para homologação e o recusa como publicação oficial; esta missão não libera produção.
3. Atualizar política/termos para contas: os documentos públicos ainda descrevem ausência de login. Definir
   retenção/localização, base aplicável, marcador de exclusão e tratamento de usuários menores com o responsável.
   Não houve declaração de conformidade legal ou uso de dados reais.
4. Migração explícita por arquivo/código, sem associação automática de contas e sem converter o backend antigo.
   Exportar antes de atualizar; fonte somente na nuvem antiga exige obtenção autorizada separada. Snapshots sem
   IDs não permitem deduzir automaticamente contagens independentes sem risco de duplicação.
5. Projetar capacidade e eventual compactação causal em outra rodada com provas; não apagar tombstones/recibos
   para reduzir tamanho. Reversão para 2f6cad6 exige backup e recuperação manual; não usar como rollback automático.
6. Testar Safari/iOS, Android/WebViews físicos, quotas, modo privado, suspensão/remoção de dados pelo SO e OAuth
   real. Chromium com viewport móvel, relógio avançado e emuladores não substituem esses ensaios.

## CI e ocorrências do laboratório

| SHA | Site | App Android | Testes |
|---|---|---|---|
| `650007b` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43599541579) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43599541619) | [failure](https://github.com/YNPHAX/EEAR/actions/runs/43599541574) |
| `eb8d464` | [success](https://github.com/YNPHAX/EEAR/actions/runs/43601009386) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43601009391) | [success](https://github.com/YNPHAX/EEAR/actions/runs/43601009460) |

650007b: Testes reprovado por **12/13 grupos**, exclusivamente timeout de preparação do breakpoint; 50/50
Firebase passaram, mas os comandos posteriores ao agregador não foram executados nesse run. eb8d464: os dois
jobs oficiais passaram, incluindo 50/50, 13/13, dupla falha, cache, controle do depurador e os quatro grupos novos
Firebase. Plataforma passou também Hosting H01–H03 e atualização transacional. Logs dos jobs foram consultados,
não apenas o indicador verde. O commit documental posterior deve ser distinguido desses SHAs ao consultar CI.


O histórico legado é job manual opcional, skipped nos pushes: isso está explícito e não é aprovação do legado.
Jobs de publicação de Site/Android ficaram skipped. Arquivos antigos de regras não foram publicados.

Negativas de laboratório preservadas: porta 8180 ocupada por JAR órfão de execução substituída (nenhuma asserção
nesses testes foi alcançada); tentativa de contexto H02 sem NODE_PATH/Playwright configurado; preparação antiga de
reversão transacional. A matriz foi reexecutada depois de identificar o processo local demo, liberar as portas e
configurar as dependências. Não foram editadas asserções de integridade para atribuir sucesso a essas tentativas.

A pausa arbitrária do helper falhou no CI 650007b e também permanece na evidência. O controle novo reproduz uma
causa possível de bloqueio por depurador, sem atribuir ao aplicativo uma perda não observada. Sucesso local anterior
não anulou a negativa do CI; a preparação publicada eb8d464 é validada novamente no CI e na matriz local.

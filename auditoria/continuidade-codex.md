# Continuidade de desenvolvimento EEAR — 12–13/11/2026

Atualização posterior: a validação solicitada de 10f631e foi concluída em [validacao-10f631e.md](validacao-10f631e.md), com resultados completos, CI dos dois SHAs, observações de testes corrigidas sem mudar runtime e restrições remanescentes. O texto abaixo é o registro histórico da entrega anterior.

**Homologação não aprovada.** Entrega de uma implementação candidata, com regressões reproduzidas e corrigidas, para auditoria independente. A matriz integral ainda precisa terminar contra o último runtime. Resultados de versões intermediárias e CI verde de build não substituem essa validação.

Branch exclusiva: `codex/eear-correcao-estrutural`. Base verificável: `2f6cad6ebba53d0f86319dcada671fe9396f8111`. Runtime entregue: **`10a3239990eecbb8e66cdfe982687b7962c42af7`**. O commit documental posterior não altera runtime nem testes. SHA256 de `curso/app.js`: `676a0d0860f3d9ee20797d2dcce09bdfc9676cc5c51f1b76cd316c72e52c10a4`.

## Recuperação do estado real

A branch Claude no GitHub continuava em 2f6cad6. Foram examinados commits recentes, todas as branches disponíveis, refs e worktrees locais e commits sem referência. Não havia a reestruturação inacabada descrita pelo usuário nem arquivos não commitados do ambiente Claude. **Esse trabalho não foi recuperado.** A implementação foi escrita a partir da base acessível, preservando testes e relatórios de `758beed` em commit separado. A auditoria permanece em `758beed207fc2196d05573e245fe43f0836dc407`; Claude não foi modificado.

Não houve merge, deploy, publicação de regras, operação no Firebase real ou uso de dados reais. Testes usaram emuladores `demo-*`, Chromium local e nuvens fictícias. Builds de CI foram habilitados para esta branch; publicar continua condicionado a disparo manual na main e opção explícita.

## Arquitetura entregue

- `14-abas.js`: operações com identificadores estáveis; registradores por campo, contribuições identificadas para contagens/melhores notas e conjunto observado para certificados. União idempotente e comutativa evita reaplicar incrementos quando o ACK remoto se perde. Remoção/reset cobre contribuições observadas; estudo concorrente e posterior permanece. Correção de erro e reset completo têm semânticas distintas, verificadas por propriedades.
- `15-diarios-pendentes.js`: reserva localStorage imutável por operação e fila por aba. A reserva só é eliminada após checkpoint confirmado. Contas têm gerações distintas; recibos distinguem operações já aplicadas das novas. Depois de exclusão local, somente deltas de novas ações podem atravessar a mudança de geração; snapshots remotos antigos não recriam a cópia. Não há carência de dois segundos, timeout de órfãos ou histórico de seis snapshots.
- `16-diario-duravel.js`: estado e metadados no mesmo checkpoint IndexedDB, por identidade, em transação readwrite com confirmação por `oncomplete`. O checkpoint permanece durante recuperações repetidas. Transações do mesmo banco serializam escritores sem depender de Web Locks. Cache localStorage e sua exclusão também participam dessa serialização; conferir uma geração fora da transação seria insuficiente. Quarentena verifica a geração dentro da transação e não pode ser recriada por callback anterior à exclusão.
- A interface bloqueia mutações durante carga e diante de checkpoint ilegível; distingue reserva pendente, confirmação e falha. Sem IndexedDB, oferece reserva com aviso explícito de ausência de proteção contra queda e tenta restaurar a persistência transacional. Exportação e exclusão explícita continuam disponíveis nos caminhos testados de corrupção.
- Migração lê principal/recibos/diários antigos e o banco `eear-diarios`. Diário legado posterior ao checkpoint é preservado para recuperação, sem eliminação automática por tempo. Dados ilegíveis ficam em quarentena. Importação une por padrão; substituição exige opção explícita e preserva certificados. Operações futuras/inválidas não são importadas por downgrade silencioso.
- Firestore recebe envelope v2 com progresso interno v1 e `cfg._ops.v=2`. O cliente lê envelope v1 e recusa versões futuras; a regra monotônica impede cliente antigo de rebaixar o documento. Exclusão de conta cria marcador imutável `contasExcluidas/{uid}` e apaga o documento na mesma transação, antes de excluir Auth. As regras propostas bloqueiam sessões antigas e foram executadas somente em emuladores.
- H02 usa `html.parser` e valida contexto estrutural, posição e atributos do script canônico. Comentários, script inerte e template não habilitam homologação. H01/H03 e barreiras de site/APK permanecem.

## Defeitos reproduzidos durante a implementação

As gravidades abaixo descrevem o impacto reproduzido no protótipo, não vulnerabilidades declaradas ainda presentes no último runtime.

| Gravidade | Defeito comprovado e correção | Evidência/regressão |
|---|---|---|
| Alta | Exclusão após última conferência apagava reserva criada por outra aba; crash perdia estudo aceito. Corte de reservas anterior à transação, recibos e aplicação de delta preservam estudo novo sem restaurar o apagado. | `operacoes-exclusao-concorrente.test.js`: antes perdeu a marca; depois recuperou somente a marca nova, atividade 1. |
| Média | Escritor de cache suspenso recriava nome/progresso após exclusão confirmada. Escrita e limpeza agora são serializadas no mesmo object store readwrite. | `operacoes-cache-exclusao.test.js`: antes resíduo em `missao-eear-v1`; depois exclusão aguardou escritor e terminou sem resíduos. |
| Média | Callback atrasado de quarentena repunha cópia pessoal após exclusão confirmada. Verificação de geração ocorre dentro da transação. | `quarentena-exclusao.test.js`: 1 cópia antes; 0 depois. Transporte Firebase integralmente bloqueado. |
| Média | Melhor nota concorrente podia cair de 1,0 para 0,8; correção de erro concorrente e importação também tinham resultados incorretos no protótipo. | Propriedades de operações; grupos de sincronização e importação. Contribuições de máximo, correção observada e importação explícita corrigidos. |
| Média | Checkpoint corrompido era preservado, mas novas ações ainda eram aceitas sem confirmação possível. | `operacoes-recuperacao.test.js`: mutação recusada, bytes preservados e exclusão explícita limpa quarentena. |
| Baixa | Liberar liderança ao ocultar a única aba impedia o flush imediato; inicialização do espelho legado também travava cenário de isolamento. | Testes originais de segundo plano/pagehide e crash/isolamento; corrigidos sem remover asserções. |

F09/F13/N01–N07 foram tratados pela nova arquitetura e pelas proteções acima. **Não são declarados integralmente encerrados no SHA final**, pois as regressões ampliadas não completaram uma nova rodada inteira após o último ajuste.

## Testes e limites das evidências

Dependências externas ao repositório: Node 24 local, Java 21, Playwright 1.63.0/Chromium, firebase-tools 15.35.0 e SDK Firebase 12.19.0. SDK servido de pacote local nas fixtures; contas e credenciais são fictícias. CI usa Node 22.

| Verificação | Resultado efetivamente observado |
|---|---|
| Oito cenários F01, critérios originais | **8/8 na árvore final**, sem mudar `f01-abas.test.js`. Execução começou com HEAD anterior; os bytes do runtime testado são os publicados em 10a3239, hash acima. |
| Operações: repetição, 4 produtores/120 alterações, resets, certificados, notas, caminhos maliciosos | Passou; lint e montagem também passaram na árvore final. |
| Ciclo original F02–F04 | **3/3** após último ajuste; asserções mantidas. |
| Quarentena atrasada após exclusão | Falha reproduzida; **passou após correção final**, confirmação verdadeira e zero cópias. |
| Matriz intermediária ae975a5 | F01 8; integridade 7; segurança 4, REST 8/8; ACK perdido 4/4; crash 4; interrupção transacional; suspensão com 9 sequências; abort/carga; recuperação/corrupção passaram. Grupo de falhas teve 3/4: preparação da ausência de IDB esperava texto antigo, incompatível com o novo aviso. Preparação foi corrigida para exigir aviso e estado local/remoto efetivos. Não é resultado final completo. |
| Concorrência intensa intermediária | 6 abas, 150 ações, atividade **152/152**, sem perda de marca/certificado; nove sequências suspensas chegaram a **11/11**. |
| F09 entre dispositivos / ACK perdido | Contagem **4/4**, simulados independentes 2/2, inclusive reabertura offline, nos intermediários documentados. |
| Crash do navegador inteiro | Quatro cenários, incluindo Zerar+estudo e segunda queda, passaram em checkpoints efetivamente confirmados de intermediários. Falha de energia/Safari não foi simulada. |
| Grupos afetados da plataforma | Robustez, contas, abas, recuperação e durabilidade passaram após correções; envio ao fundo/pagehide passou separadamente. Matriz completa anterior tinha quatro falhas; não foi rotulada verde. |
| Firebase 0a04662, local e CI | **49/50**: servidor preservou as duas marcas; sonda exigia cache síncrono antes de fechar o escritor. Agora fecha imediatamente, exige ambas as marcas offline antes de reconectar e ambas no servidor; é uma observação mais forte do resultado, porém a suíte completa ainda precisa ser repetida. |
| Hosting | **193 autotestes**, sondas de Hosting/gates, **3/3 contextos no Chromium**, incluindo os dois falsos aceites H02, e cabeçalhos HTTP no emulador passaram. Handler OAuth em Hosting Emulator retorna 404; OAuth de homologação real não foi validado. |
| Builds e integridade | Site e conteúdo Android locais passaram; montagem, lint e verificação de workflows passaram. APK foi compilado e verificado no CI de 0a04662; não foi executado em aparelho Android real. |

A matriz local final de 0a04662 foi interrompida durante a continuidade após aparecer a nova corrida de quarentena; resultados parciais não foram convertidos em aprovação. `persistencia-regressoes.test.js` agora reúne os controles independentes e as regressões novas, inclusive exclusão/cache/quarentena.

### CI verificado

Para **0a04662**:

- [Site](https://github.com/YNPHAX/EEAR/actions/runs/43333613462): success; publicar skipped.
- [App Android](https://github.com/YNPHAX/EEAR/actions/runs/43333613842): success; APK compilado/verificado; publicar skipped.
- [Testes](https://github.com/YNPHAX/EEAR/actions/runs/43333613652): failure. Plataforma parou na preparação de `saida` do ciclo, que acessava cache ainda não concluído; a fila agora aguarda sua escrita e o teste original passou 3/3 localmente. Firebase falhou na observação síncrona descrita acima. **Não foram falhas de infraestrutura.**

Para **10a3239**, [Site](https://github.com/YNPHAX/EEAR/actions/runs/43450066806) e [App Android](https://github.com/YNPHAX/EEAR/actions/runs/43450067103) terminaram com **success**. [Testes](https://github.com/YNPHAX/EEAR/actions/runs/43450066800) ainda estava em execução no encerramento. O commit documental não altera código/testes e pode disparar novos runs. Não há declaração de CI integral verde no SHA final.

## Commits e arquivos

Commits publicados exclusivamente na branch de desenvolvimento:

- `53cdba1`: preservação da auditoria e parser estrutural H02.
- `363ec7d`: operações/checkpoint transacional, privacidade e regras propostas.
- `e689270`: propriedades de concorrência, certificados e protocolo v2.
- `982193f`: correção concorrente, importação e recuperação de armazenamento.
- `ae975a5`: bloqueio de checkpoint corrompido e testes de recuperação.
- `78a3ff7`: exclusão concorrente, cache transacional e envio ao fundo.
- `0a04662`: testes independentes, adaptações de preparação e gates de CI.
- `10a3239`: quarentena atrasada, conclusão do cache e sonda offline reforçada.

Lista completa em [continuidade-codex-arquivos.txt](continuidade-codex-arquivos.txt). Inclui arquivos de auditoria preservados, não apenas runtime. Evidências selecionadas com falhas e reproduções em [continuidade-codex-evidencias.txt](continuidade-codex-evidencias.txt).

Adaptações de testes: início assíncrono aguarda carga; perfis legados são preparados antes do primeiro checkpoint; comparação de mapas ignora ordem sem perder campos; pontos nativos foram movidos para a transação real e observadores são suspensos para comprovar pendência; teste de segundo crash exige checkpoint concluído, sem obrigar sua eliminação. Substituição de progresso é escolhida explicitamente nos testes dessa função. Os oito F01 e as contagens exigidas não foram reduzidos.

## Riscos e trabalho restante

1. **Média — crescimento de metadados:** contribuições, tombstones e recibos não têm compactação causal. Uso prolongado pode atingir limites locais/Firestore. Não se trunca histórico para caber; recusa precisa permanecer explícita e progresso local exportável. Medir crescimento e projetar compactação com prova de idempotência antes de uso amplo.
2. **Limitação de disponibilidade/durabilidade:** sem IndexedDB não há garantia equivalente contra crash; há aviso e exportação. Quota total, processo encerrado antes de confirmação e falha de energia exigem distinguir operação pendente de transação confirmada. O runtime não solicita `navigator.storage.persist()`; os dados continuam sujeitos às políticas de evicção do navegador. Solicitar essa permissão também não garantiria imunidade a limpeza ou falha do sistema.
3. **Compatibilidade:** Safari/iOS, WebViews móveis reais, instalação/atualização do APK e OAuth/domínios reais não foram homologados. Web Locks não é necessário ao checkpoint, mas compatibilidade de IndexedDB precisa de matriz real.
4. **Migração/convívio:** dados antigos sem identidades não permitem inferir todos os incrementos históricos independentes. Escritores legados posteriores à migração podem exigir recuperação manual; não se elimina sua última cópia por tempo. Reversão para cliente que não entende envelope v2 precisa de plano próprio.
5. **Validação pendente:** repetir a matriz integral e a suíte completa da plataforma/Firebase no SHA final, inclusive scripts antigos de diários com os pontos adaptados. Revisar independentemente exclusões, recibos/gerações e quarentena; acrescentar falhas de commit e crashes em cada fronteira de exclusão/migração. Regras e marcador de exclusão não foram publicados em ambiente algum.

**Recomendação:** manter o bloqueio de homologação até auditoria independente do SHA final e conclusão dessas verificações. Esta entrega corrige reproduções, preserva evidências negativas e deixa uma implementação revisável; não atesta ausência de perdas em todos os caminhos.

# Continuidade de desenvolvimento — 12/11/2026

Branch exclusiva: `codex/eear-correcao-estrutural`, criada a partir de `2f6cad6ebba53d0f86319dcada671fe9396f8111`. As branches Claude, auditoria e main não são alteradas.

## Estado recuperado

A API do GitHub confirmou `claude/eear-study-hydwqt` ainda em 2f6cad6. A listagem completa de branches não contém uma reestruturação posterior. Foram inspecionados os worktrees disponíveis, refs locais e commits inacessíveis por refs (`git fsck`, somente leitura): os commits locais extras pertencem às auditorias anteriores, não ao trabalho inacabado descrito pelo usuário. Não há arquivos não commitados do ambiente Claude disponíveis neste executor.

**Não foi recuperada a reestruturação do Claude.** Faltam seus novos módulos de operações, checkpoint/fila/migração/quarentena, sincronização e parser HTML. A implementação desta branch parte do código verificável 2f6cad6, com os testes e relatórios independentes copiados de 758beed. Isso não é um merge e não incorpora uma implementação supostamente existente.

## Invariantes da implementação

- Cada alteração tem identidade estável; repetição e confirmação perdida não podem reaplicar incrementos.
- A união de contribuições de dispositivos distintos distingue incrementos independentes de repetição da mesma contribuição.
- IndexedDB é a cópia transacional; apenas `transaction.oncomplete` confirma gravação. Pedir `commit()` não é confirmação.
- Nenhuma espera fixa autoriza descartar a última cópia durável. Recuperação também precisa sobreviver à interrupção seguinte.
- Reset registra exclusões do que foi observado, preservando operações posteriores e concorrentes.
- A geração local de uma identidade impede uma resposta ou fila anterior de recriar a cópia apagada.
- Exclusão de conta precisa de bloqueio durável no servidor contra sessões antigas, além de apagar o documento e o login. As regras propostas serão testadas apenas no emulador.
- Falha/indisponibilidade do armazenamento é exibida em todas as telas; alterações ainda não confirmadas permanecem exportáveis.

O documento será complementado com SHAs, arquivos, testes e limitações ao concluir a implementação. Não há declaração de aprovação para homologação. Nenhum deploy, Firebase real, publicação de regras ou dado real é autorizado por esta continuidade.

## Implementação em andamento

O primeiro commit publicado, `53cdba1`, preserva a auditoria e corrige H02. A etapa seguinte substitui os módulos 14–16 por registradores por campo, contribuições identificadas para contadores e checkpoint transacional por identidade no banco `eear-operacoes`. Uma reserva local imutável só pode ser removida depois do checkpoint concluído. O checkpoint inclui estado materializado e metadados, na mesma transação, e permanece durante recuperações repetidas. A interface bloqueia mutações durante a carga da identidade e informa pendência/falha de gravação.

Reset remove apenas valores/contribuições observados; concorrentes e posteriores permanecem. Identidades de operações vão em `cfg._ops` para a união entre dispositivos e para idempotência após ACK perdido. Não há histórico de seis snapshots nem carência de dois segundos. O cache antigo não substitui um checkpoint existente. Diários legados são migrados e dados ilegíveis são preservados em quarentena. As regras propostas incluem `contasExcluidas/{uid}`, sem nome/progresso, imutável e autorizada somente ao UID; a marca e a remoção do documento ocorrem na mesma transação, antes de apagar o usuário Auth.

Evidências parciais de desenvolvimento: oito F01 passaram; N01–N05 passaram; F09 remoto e ACK perdido chegaram a 4/4; quatro cenários de Browser.crash, incluindo reset+estudo e duas quedas, passaram; F13 transacional com três abas e servidor passou. Os testes seguem em execução e ajustes de preparação de perfis legados/pontos nativos são documentados. **Isso não é uma auditoria final nem uma aprovação.**

Limites já identificados: operações/contribuições de contadores ainda crescem com o uso; nenhuma é descartada para caber no documento. O limite Firestore deve resultar em recusa explícita e preservação local, não truncamento. Sem IndexedDB, a reserva local não fornece a mesma garantia contra queda do navegador; exclusões podem ser recusadas se não for possível confirmá-las. Escritores de versões antigas não possuem identidades de operações: sua convivência não oferece as garantias de contagem da nova arquitetura. Migração é suportada; reversão e convivência precisam de validação própria.

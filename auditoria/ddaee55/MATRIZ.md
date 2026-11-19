# Matriz de execução independente — ddaee55

Todos os comandos monitoraram o SHA-256 da árvore candidata antes/depois: e29b2488…a4d, sem alteração. Nos controles históricos, `EEAR_REPO_ALVO` e o hash efetivo do runtime antigo constam do resultado e do stdout; o hash de monitoramento da candidata não significa que o controle antigo executou o bundle novo.

Falhas de produto, controles negativos e preparação não são agregados numa taxa de aprovação. As repetições não substituem os logs originais.

| Comando / ensaio | Exit | Tempo (s) | Classificação |
|---|---:|---:|---|
| [auditor-carga-obsoleta-confirmacao](evidencias/auditor-carga-obsoleta-confirmacao.log) | 1 | 22.3 | Tentativa com asserção de instrumentação incorreta; preservada |
| [auditor-carga-obsoleta-final](evidencias/auditor-carga-obsoleta-final.log) | 1 | 15.12 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [auditor-carga-obsoleta-recuperado](evidencias/auditor-carga-obsoleta-recuperado.log) | 1 | 27.1 | A01: contraexemplo sob entrega controlada |
| [auditor-carga-obsoleta](evidencias/auditor-carga-obsoleta.log) | 1 | 68.91 | A01: contraexemplo sob entrega controlada |
| [auditor-limite-final](evidencias/auditor-limite-final.log) | 0 | 36.57 | Passou |
| [auditor-limite](evidencias/auditor-limite.log) | 1 | 28.79 | Oráculo inicial do auditor: bytes confundidos com caracteres |
| [auditor-migracao-crash](evidencias/auditor-migracao-crash.log) | 0 | 18.03 | Passou |
| [auditor-propriedades](evidencias/auditor-propriedades.log) | 0 | 22.69 | Passou |
| [auditor-tombstone](evidencias/auditor-tombstone.log) | 1 | 37.67 | A02: contraexemplo confirmado (zero em vez de um) |
| [autoteste](evidencias/autoteste.log) | 0 | 1.96 | Passou |
| [barreira-app](evidencias/barreira-app.log) | 0 | 2.07 | Passou |
| [barreira-web](evidencias/barreira-web.log) | 0 | 2.0 | Passou |
| [bloqueadores-auditoria-ambiente-recuperado](evidencias/bloqueadores-auditoria-ambiente-recuperado.log) | 0 | 302.94 | Passou |
| [bloqueadores-auditoria](evidencias/bloqueadores-auditoria.log) | 1 | 0.75 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [build-app](evidencias/build-app.log) | 0 | 3.91 | Passou |
| [build-web](evidencias/build-web.log) | 0 | 4.24 | Passou |
| [cache-restaurado-ambiente-recuperado](evidencias/cache-restaurado-ambiente-recuperado.log) | 0 | 7.08 | Passou |
| [cache-restaurado](evidencias/cache-restaurado.log) | 1 | 0.03 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [carga-browser](evidencias/carga-browser.log) | 0 | 212.31 | Passou |
| [carga-nucleo](evidencias/carga-nucleo.log) | 0 | 665.2 | Passou |
| [ciclo-sincronia](evidencias/ciclo-sincronia.log) | 0 | 9.4 | Passou |
| [depurador-transacao-ambiente-recuperado](evidencias/depurador-transacao-ambiente-recuperado.log) | 0 | 7.08 | Passou |
| [firebase-emulador](evidencias/firebase-emulador.log) | 1 | 255.58 | Limitado pela rede: 51 positivas; Google bloqueado |
| [hosting-contexto](evidencias/hosting-contexto.log) | 0 | 24.04 | Passou |
| [hosting-gates](evidencias/hosting-gates.log) | 0 | 35.05 | Passou |
| [hosting](evidencias/hosting.log) | 0 | 21.15 | Passou |
| [importacoes-propriedades](evidencias/importacoes-propriedades.log) | 0 | 0.15 | Passou |
| [importacoes-regressoes-ambiente-recuperado](evidencias/importacoes-regressoes-ambiente-recuperado.log) | 0 | 359.46 | Passou |
| [importacoes-regressoes](evidencias/importacoes-regressoes.log) | 1 | 1.45 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [integridade-regressoes](evidencias/integridade-regressoes.log) | 0 | 616.97 | Passou |
| [integridade](evidencias/integridade.log) | 0 | 0.2 | Passou |
| [legado-bloqueio](evidencias/legado-bloqueio.log) | 0 | 19.73 | Passou |
| [legado-contrato](evidencias/legado-contrato.log) | 0 | 0.06 | Passou |
| [lint](evidencias/lint.log) | 0 | 4.75 | Passou |
| [metadados-limite-final](evidencias/metadados-limite-final.log) | 0 | 21.19 | Passou |
| [metadados-limite](evidencias/metadados-limite.log) | 1 | 8.91 | Infraestrutura da bancada: porta de emulador ocupada; repetido |
| [montagem](evidencias/montagem.log) | 0 | 0.02 | Passou |
| [operacoes-dupla-falha-ambiente-recuperado](evidencias/operacoes-dupla-falha-ambiente-recuperado.log) | 0 | 15.34 | Passou |
| [operacoes-dupla-falha](evidencias/operacoes-dupla-falha.log) | 1 | 0.03 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [operacoes](evidencias/operacoes.log) | 0 | 0.76 | Passou |
| [persistencia-regressoes-ambiente-recuperado](evidencias/persistencia-regressoes-ambiente-recuperado.log) | 0 | 369.99 | Passou |
| [persistencia-regressoes](evidencias/persistencia-regressoes.log) | 1 | 284.74 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [plataforma](evidencias/plataforma.log) | 0 | 353.82 | Passou |
| [runtime-5b-callback](evidencias/runtime-5b-callback.log) | 1 | 26.13 | Controle histórico negativo; conferir sintomas no JSON/log |
| [runtime-5b-carga-obsoleta](evidencias/runtime-5b-carga-obsoleta.log) | 1 | 27.18 | Controle histórico negativo; conferir sintomas no JSON/log |
| [runtime-5b-contraexemplos](evidencias/runtime-5b-contraexemplos.log) | 1 | 65.05 | Controle histórico negativo; conferir sintomas no JSON/log |
| [runtime-5b-propriedades](evidencias/runtime-5b-propriedades.log) | 1 | 67.65 | Controle histórico negativo; conferir sintomas no JSON/log |
| [sincronia-firebase-ambiente-recuperado](evidencias/sincronia-firebase-ambiente-recuperado.log) | 0 | 29.14 | Passou |
| [sincronia-firebase](evidencias/sincronia-firebase.log) | 1 | 0.04 | Infraestrutura da bancada: disco cheio; reexecução separada |
| [sintaxe-teste-carga-obsoleta](evidencias/sintaxe-teste-carga-obsoleta.log) | 0 | 0.06 | Passou |
| [sintaxe-teste-limite](evidencias/sintaxe-teste-limite.log) | 0 | 0.05 | Passou |
| [sintaxe-teste-migracao-crash](evidencias/sintaxe-teste-migracao-crash.log) | 0 | 0.04 | Passou |
| [sintaxe-teste-propriedades](evidencias/sintaxe-teste-propriedades.log) | 0 | 0.08 | Passou |
| [sintaxe-teste-tombstone](evidencias/sintaxe-teste-tombstone.log) | 0 | 0.06 | Passou |
| [sintaxe-teste-visual](evidencias/sintaxe-teste-visual.log) | 0 | 0.11 | Passou |
| [transferencia-identidades](evidencias/transferencia-identidades.log) | 0 | 0.09 | Passou |
| [visual-final](evidencias/visual-final.log) | 0 | 10.69 | Passou |
| [visual](evidencias/visual.log) | 0 | 11.69 | Passou |
| [workflows](evidencias/workflows.log) | 0 | 0.07 | Passou |

## Resultados consolidados

| Grupo final | Resultado |
|---|---|
| IA01–IA04 | Quatro controles antigos reproduzidos, 8/8 grupos candidatos |
| IA05/IA06 | Controle antigo reproduzido, 13/13 grupos candidatos |
| IA07/IA08 | Três controles antigos reproduzidos, 12/12 grupos candidatos |
| Persistência | 13/13 grupos integrais após recuperar a bancada; F01 8/8 |
| Plataforma | 166 verificações positivas |
| Firebase local | 51 positivas; popup Google bloqueado, dois casos sem execução positiva; exit 1 preservado |
| CI Firebase no SHA exato | 53 casos; evidência remota separada da execução local |
| Hosting | 193 autotestes, 11 sondas, 12 gates, 3 contextos locais; sem deploy |
| Carga | Núcleo 12.000 operações; navegador 2.000 marcas/2.002 atividades, quatro abas e dez resets |
| Marcadores/propriedades próprias | 192 seeds, 18.432 ações, 192 casos canônicos, 192 distinções de arrays, 18 marcadores; sem falhas no oráculo |
| A01 próprio | Carga obsoleta libera a UI; checkpoint tem a marca, UI vazia, reset aceito e marca reaparece. Controle 5b3f9d4 mostra marca e a remove. Ordem natural sem instrumentação não demonstrada |
| A02 próprio | Registro inédito suprimido por tombstone v4 ampliado; 0/1 no servidor/reabertura e sem quarentena |
| Migração própria com abort e crash | Checkpoint anterior intacto, 2/2 registros recuperados e migração sucessiva idempotente |
| APK | Duas compilações (segunda com clean), ambos verificados e SHA-256 idêntico; runtime embutido exato |
| APK, aberturas nativas | Não executadas: sem dispositivo; AVD excedeu capacidade, segunda tentativa recusada pela guarda de espaço |
| Typecheck | Não existe no projeto JavaScript |
| Identidade visual | Paleta oficial pendente; viewport/contraste parcial não equivalem a WCAG integral |

## Reprodutibilidade do Android

Os logs `android-build-primeira`, `android-build-proxy` e `android-build-jdk` preservam falhas do ambiente. `android-build-cert` registra a compilação completa; `android-build-repetido` registra clean + assembleDebug. Ambos os APKs têm SHA-256 `3639517e4a857ff38ed238828dfb20684df8ac8f1a254eb92d1567f5d3815e3d`, e os verificadores `apk-barreira-primeiro` e `apk-barreira-repetido` passaram. Ver `evidencias/android-apk-hashes.json`.

Os `.result.json` incluem argv, diretório, variáveis específicas, duração e UTC. `run.py` preserva o ambiente exato desta bancada. `incidentes.json` discrimina preparações e limitações. Nenhum teste existente foi editado.

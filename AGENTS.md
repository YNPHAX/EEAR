# Instruções do repositório

Aplicam-se a todo o repositório. Mantenha `AGENTS.md` e `CLAUDE.md` coerentes.

## Honestidade
- Não concorde com o usuário apenas para agradar; aponte problemas com justificativa e evidências.
- Evite elogios automáticos, críticas inventadas e certezas sem fundamento.
- Diferencie fatos verificados, hipóteses e pontos não verificados.
- Não declare que algo funciona, está seguro ou foi testado sem evidências.

## Implementação
- Examine os arquivos relevantes e as instruções aplicáveis antes de alterar código.
- Faça mudanças focadas no pedido e preserve alterações existentes do usuário.
- Considere segurança, lógica, tratamento de erros e regressões.
- Não faça refatorações nem adicione dependências sem necessidade para a tarefa.
- `curso/` contém o conteúdo e a lógica; `web/build.py` gera o site e o conteúdo de `app/` (Capacitor). Preserve as verificações contra publicação de material restrito.

## Verificação
- Confirme os comandos em `app/package.json`, `.github/workflows/` e nos scripts antes de usá-los; atualize o registro abaixo quando mudarem.
- Execute as verificações pertinentes às mudanças. Não invente comandos ou resultados nem enfraqueça testes para esconder falhas.
- Se uma verificação não puder ser executada, explique o motivo e o que ficou sem validar.

Comandos existentes (na raiz, salvo indicação):
- Autoteste: `python3 -I web/verificar_publicacao.py autoteste`.
- Integridade: `python3 -I web/verificar_publicacao.py validar` e `python3 -I web/verificar_publicacao.py conferir-workflows`.
- Build do site: `python3 web/build.py _site`; conferir saída: `python3 -I web/verificar_publicacao.py verificar _site --site`.
- Sintaxe JavaScript: `node --check <arquivo>`; o workflow Site verifica `_site/app.js`, `_site/sw.js` e cada `_site/dados/*.js`.
- Conteúdo Android: `python3 web/build.py app/www --app`; conferir saída: `python3 -I web/verificar_publicacao.py verificar app/www --app`.
- Preparação Android (em `app/`, como no CI): `npm ci`, `npx cap add android`, `npx capacitor-assets generate --android`, `npx cap sync android`. Não repita `cap add` se o projeto Android já existir.
- APK (em `app/android/`, no ambiente do CI): `./gradlew assembleDebug --no-daemon --stacktrace`; conferir o APK na raiz: `python3 -I web/verificar_publicacao.py verificar app/android/app/build/outputs/apk/debug/app-debug.apk --apk`.
- Vídeos, quando pertinente (requer rede): `python3 web/conferir_videos.py`.
- Testes da plataforma (dados do curso e comportamento no navegador; requer o pacote `playwright` com o Chromium): `node testes/plataforma.test.js`. O workflow `Testes` roda o mesmo comando a cada push, com `playwright@1.63.0` instalado fora do repositório.
- Scripts npm em `app/`: `npm run www` gera conteúdo; `npm run android` gera conteúdo e prepara o projeto Android, sem compilar o APK.
- Lint (JavaScript, sem dependência no repositório; usa `eslint.config.mjs`, com `max-lines` de 350): `npx --yes eslint@9.17.0 curso/app.js curso/app curso/dados web/sw.js testes`.
- O app é editado em `curso/app/` (arquivos em ordem numérica); depois de editar, rode `python3 web/montar_app.py` para regravar `curso/app.js`. Conferir sem gravar: `python3 -I web/montar_app.py --conferir` (o build e os testes falham se estiverem diferentes). Os testes da plataforma ficam em `testes/plataforma.test.js` (entrada), `testes/dados.js`, `testes/versoes.js`, `testes/celular.js` (flashcards em telas de celular, simuladas no Chromium), `testes/robustez.js` (progresso colado malicioso ou malformado, progresso ilegível e armazenamento que falha), `testes/sincronia.js` (dois aparelhos com uma nuvem fictícia em memória: união do progresso, "Zerar", troca de conta e falhas de rede) e `testes/contas.js` (contas no mesmo aparelho e dados do aluno) e `testes/nuvem-claude.js` (link do curso no Claude: gravações simultâneas com latência e com a trava da nuvem, conferência da gravação e avisos ao aluno).
- Emuladores do Firebase (o workflow `Testes` roda no job `firebase-emulador`, com Java 21, firebase-tools 15.35.0, firebase 12.19.0 e playwright 1.63.0; localmente, requer os mesmos instalados fora do repositório): `EEAR_FIREBASE_SDK=<pasta node_modules/firebase> EEAR_FIREBASE_CLI=<caminho do firebase> node testes/firebase-emulador.test.js` (contas, sessão, transações, regras de `web/firestore.rules`, exclusão de conta e login com o Google, no projeto de teste `demo-eear`). O login com o Google precisa de acesso a `apis.google.com`: sem ele, fora do CI, aparece como NÃO TESTADO.
- Ferramentas de integração (fora do CI; requerem o `playwright` com o Chromium para a primeira): `node testes/atualizacao.js <site da versão anterior> <site da versão nova>` (progresso de uma versão abre na outra e volta, sem perder estudo; os sites vêm de `web/build.py`) e `node testes/comparar-conteudo.js <cópia A do repositório> <cópia B>` (sai com erro se mudar algo além de cartões e teoria). Usadas no plano de integração de `auditoria/auditoria-consolidada.md`.
- Não há checagem de tipos (o projeto não usa TypeScript). O CI Android usa Node 22 e Java 21; confirme ferramentas disponíveis no ambiente local.

Os builds recriam a pasta de saída: confira o destino antes de executá-los. Executar verificações não autoriza publicação.

## Revisão
- Examine diretamente o código e as alterações; o resumo do autor não é prova.
- Apresente cada problema com gravidade, arquivo, localização, impacto e evidência ou cenário de reprodução.
- Separe defeitos confirmados, suspeitas e sugestões opcionais. Não invente problemas para preencher o relatório.
- Quando não houver achados, informe o escopo e as limitações da revisão, sem garantir ausência de erros.

## Entrega
- Informe o que mudou, quais verificações foram executadas, seus resultados e as pendências.

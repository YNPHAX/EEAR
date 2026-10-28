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
- Scripts npm em `app/`: `npm run www` gera conteúdo; `npm run android` gera conteúdo e prepara o projeto Android, sem compilar o APK.
- Não foram encontrados comandos dedicados de lint ou checagem de tipos. O CI Android usa Node 22 e Java 21; confirme ferramentas disponíveis no ambiente local.

Os builds recriam a pasta de saída: confira o destino antes de executá-los. Executar verificações não autoriza publicação.

## Revisão
- Examine diretamente o código e as alterações; o resumo do autor não é prova.
- Apresente cada problema com gravidade, arquivo, localização, impacto e evidência ou cenário de reprodução.
- Separe defeitos confirmados, suspeitas e sugestões opcionais. Não invente problemas para preencher o relatório.
- Quando não houver achados, informe o escopo e as limitações da revisão, sem garantir ausência de erros.

## Entrega
- Informe o que mudou, quais verificações foram executadas, seus resultados e as pendências.

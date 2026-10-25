# App Android: identificador e chave de assinatura

O Android só instala uma versão nova **por cima** da anterior (e mantém o progresso salvo no aparelho) quando as duas
têm o **mesmo identificador** e foram assinadas com a **mesma chave**. Por isso as duas coisas são fixas.

- **Identificador definitivo:** `com.inphax.app` (em `capacitor.config.json`). Nunca mais muda depois da primeira
  distribuição. O teste `testes/apk.test.js` falha se ele mudar.
- **Endereço interno do app:** o padrão do Capacitor (`https://localhost`). O progresso fica guardado nesse endereço;
  não ponha `server.hostname`, `server.androidScheme` nem `server.url` na configuração.
- **Número da versão (versionCode):** é o número da execução do workflow *App Android*. Não renomeie o workflow,
  senão a contagem recomeça e o Android recusa a versão nova.

## 1. Criar a chave (uma vez só)

Num computador com Java instalado (o `keytool` vem junto):

```
keytool -genkeypair -v -keystore inphax-app.jks -alias inphax -keyalg RSA -keysize 2048 -validity 10000
```

Ele pede uma senha e os dados do certificado (nome, organização: INPHAX). Depois veja a impressão digital:

```
keytool -list -v -keystore inphax-app.jks -alias inphax
```

Anote a linha `SHA256: ...`.

## 2. Guardar a chave

**Se a chave se perder, nenhuma versão nova instala por cima da antiga** (seria preciso desinstalar e começar um app
novo). Guarde o arquivo `inphax-app.jks` e a senha em dois lugares seguros e separados (por exemplo, um gerenciador de
senhas e um pen drive). Nunca ponha o arquivo no repositório.

## 3. Pôr a chave no GitHub

Em *Settings › Secrets and variables › Actions* do repositório:

| Tipo | Nome | Valor |
|---|---|---|
| Secret | `ANDROID_KEYSTORE_BASE64` | o arquivo em base64: `base64 -w0 inphax-app.jks` (no Mac: `base64 -i inphax-app.jks`) |
| Secret | `ANDROID_KEYSTORE_PASSWORD` | a senha do arquivo |
| Secret | `ANDROID_KEY_ALIAS` | `inphax` |
| Secret | `ANDROID_KEY_PASSWORD` | a senha da chave (a mesma, se você não escolheu outra) |
| Variable | `ANDROID_CERT_SHA256` | a impressão digital `SHA256` do passo 1 (com ou sem os `:`) |

Com isso o workflow *App Android* passa a gerar o APK de distribuição assinado com essa chave e confere a impressão
digital a cada vez. Sem os segredos, ele gera só um APK de teste, que nunca é publicado.

## 4. Passagem do app antigo para o novo (uma vez só)

O app distribuído até agora (versões 1.0.2 e 1.0.10) tem outro identificador (`io.github.ynphax.eear`) e uma chave
que mudava a cada compilação. Por isso o app novo **não atualiza o antigo: instala ao lado**. O progresso passa
assim, pelo próprio curso:

1. No app antigo: **Plano › Dados › Copiar meu progresso**. O código fica copiado (guarde também numa nota).
2. Instale o app novo e abra.
3. No app novo: **Plano › Dados › Colar progresso**, cole o código e confirme.
4. Confira o nome, as aulas dominadas e o histórico de simulados. Só então desinstale o app antigo.

Quem entrar com a conta (login), quando o login estiver ligado, recebe o progresso da nuvem sem esses passos.

## 5. Atualizações depois disso

Cada versão nova, assinada com a mesma chave e com o mesmo identificador, instala por cima e o progresso continua.
Se um dia o Android disser *"O app não foi instalado"* ao atualizar, é sinal de chave ou identificador diferente:
**não desinstale** (desinstalar apaga o progresso). Primeiro copie o progresso como no passo 4.

## 6. Recuperar o progresso de um aparelho

- Aparelho funcionando: *Copiar meu progresso* no app e *Colar progresso* no outro aparelho ou no site.
- App desinstalado sem copiar: o progresso guardado só no aparelho se perde. Com o login ligado, ele volta da nuvem.

# App Android: identificador e chave de assinatura

O Android só instala uma versão nova **por cima** da anterior (e mantém o progresso salvo no aparelho) quando as duas
têm o **mesmo identificador** e foram assinadas com a **mesma chave**. Por isso as duas coisas são fixas.

- **Identificador definitivo:** `com.inphax.app` (em `capacitor.config.json`). Nunca mais muda depois da primeira
  distribuição. O teste `testes/apk.test.js` falha se ele mudar.
- **Endereço interno do app:** o padrão do Capacitor (`https://localhost`). O progresso fica guardado nesse endereço;
  não ponha `server.hostname`, `server.androidScheme` nem `server.url` na configuração.
- **Número da versão (versionCode):** é o número da execução do workflow *App Android*. Não renomeie o workflow,
  senão a contagem recomeça e o Android recusa a versão nova.
- **Publicação:** o APK só vai para a página de downloads quando o workflow *App Android* é rodado à mão na `main`,
  com "Publicar o APK" marcado e a chave configurada. Nenhum envio publica APK sozinho.

A chave é criada **no seu computador** e nunca deve passar por chat, e-mail ou repositório.

## 1. O que você precisa (Windows)

- **Java (JDK) 21**, que traz a ferramenta `keytool`. Use o Eclipse Temurin, gratuito:
  - pelo site https://adoptium.net (baixe o instalador `.msi` do JDK 21 para Windows x64 e deixe marcada a opção
    *Add to PATH*); ou
  - pelo PowerShell: `winget install --id EclipseAdoptium.Temurin.21.JDK -e`
- **PowerShell** (já vem no Windows).
- **Um gerenciador de senhas** com anexo de arquivo: KeePassXC (gratuito, fica no computador), Bitwarden (o anexo
  é do plano pago) ou 1Password.
- **Um pen drive** só para o backup.

Feche e abra o PowerShell depois de instalar o Java e confira:

```powershell
keytool -help
```

Se aparecer *"keytool não é reconhecido"*, use o caminho completo, por exemplo
`& "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot\bin\keytool.exe" -help` (o número da versão pode ser
outro: confira a pasta em `C:\Program Files\Eclipse Adoptium\`).

## 2. Criar a chave (uma vez só)

1. No gerenciador de senhas, crie um item **"INPHAX — chave do app Android"** e gere uma senha forte (20 caracteres
   ou mais). Ela vale para o arquivo e para a chave.
2. Crie uma pasta **fora do OneDrive** (a pasta Documentos costuma ser sincronizada) e entre nela:

   ```powershell
   New-Item -ItemType Directory -Force C:\inphax-chave
   cd C:\inphax-chave
   ```

3. Crie a chave:

   ```powershell
   keytool -genkeypair -v -keystore inphax-app.jks -alias inphax -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=INPHAX, O=INPHAX, C=BR"
   ```

   O keytool pede a senha duas vezes. Cole a senha do gerenciador; nada aparece enquanto você digita, é normal.
   **Não escreva a senha dentro do comando**: o PowerShell guarda o histórico dos comandos num arquivo.
4. Veja a impressão digital e guarde a linha `SHA256:` no item do gerenciador:

   ```powershell
   keytool -list -v -keystore inphax-app.jks -alias inphax
   ```

   Deve aparecer: tipo de armazenamento **PKCS12**, 1 entrada `inphax`, validade até cerca de 2054 e as linhas de
   impressão digital (`SHA256: AB:CD:...`).

No item do gerenciador ficam: a senha, o alias `inphax`, a impressão digital SHA256, a data de criação e o arquivo
`inphax-app.jks` em anexo.

## 3. Proteger a chave e as senhas

- A chave e a senha ficam **só** no seu computador, no gerenciador de senhas, no backup e nos Secrets do GitHub.
- Nunca mande o arquivo nem a senha por chat (inclusive este), e-mail ou WhatsApp, e nunca ponha no repositório.
- Ative a verificação em duas etapas da conta do GitHub: quem entra na conta consegue usar os Secrets.
- Só você deve ter permissão de escrita no repositório (*Settings › Collaborators*).
- Se suspeitar que a chave vazou, não publique mais nada e me avise: uma chave nova obriga todos a reinstalar o app.

## 4. Backup seguro

Guarde **duas cópias, em lugares diferentes**:

1. **Gerenciador de senhas**: o arquivo `inphax-app.jks` em anexo no item do passo 2.
2. **Pen drive, criptografado**: com o 7-Zip (gratuito), clique com o botão direito em `inphax-app.jks` ›
   *7-Zip › Adicionar para arquivo…* › formato `7z`, criptografia **AES-256**, marque *Criptografar nomes de
   arquivo* e use uma **segunda** senha forte (guardada no gerenciador). Copie o `.7z` para o pen drive e guarde o pen
   drive em casa, longe do computador.

Teste o backup: abra o `.7z` do pen drive numa pasta temporária, rode
`keytool -list -v -keystore inphax-app.jks -alias inphax` e confira se a `SHA256` é a mesma. Depois apague a cópia
temporária.

**Não** guarde a chave sem criptografia no Google Drive, no OneDrive ou no e-mail. Sem a chave, nenhuma versão nova
instala por cima: seria preciso desinstalar (o que apaga o progresso do aparelho) e começar um app novo.

## 5. Cadastrar no GitHub

1. Copie o arquivo em base64 (uma linha só) direto para a área de transferência, sem criar outro arquivo:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("C:\inphax-chave\inphax-app.jks")) | Set-Clipboard
   ```

2. No GitHub, abra o repositório **YNPHAX/EEAR › Settings › Secrets and variables › Actions**.
3. Na aba **Secrets**, clique em **New repository secret** e cadastre um por vez:

   | Name | Secret |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | cole (Ctrl+V) o que o comando do item 1 copiou |
   | `ANDROID_KEYSTORE_PASSWORD` | a senha do passo 2 |
   | `ANDROID_KEY_ALIAS` | `inphax` |
   | `ANDROID_KEY_PASSWORD` | a mesma senha (no formato PKCS12 a senha da chave é a do arquivo) |

4. Na aba **Variables**, clique em **New repository variable**: Name `ANDROID_CERT_SHA256`, Value a impressão
   digital `SHA256` (pode colar com os `:`). Ela não é segredo: serve para conferir a chave a cada compilação.
5. Limpe a área de transferência:

   ```powershell
   Set-Clipboard -Value $null
   ```

   Se o histórico da área de transferência estiver ligado (Windows + V), abra-o e clique em **Limpar tudo**.

Depois de salvos, os Secrets não podem ser lidos de novo nem por você (só trocados) e aparecem como `***` nos logs.

No Mac ou Linux, o item 1 é `base64 -w0 inphax-app.jks` (no Mac: `base64 -i inphax-app.jks`).

## 6. Testar a assinatura sem publicar

1. No GitHub: **Actions › App Android › Run workflow**.
2. Em **Branch**, escolha `claude/eear-study-hydwqt`. **Não escolha `main`.**
   - Até a branch ser juntada, o workflow da `main` ainda é o antigo, que publica APK.
   - Depois de juntada, a `main` só publica com "Publicar o APK" marcado.
3. Deixe "Publicar o APK" **desmarcado** e clique em **Run workflow**.
4. Abra a execução e confira:
   - no passo **Compilar o APK** não aparece o aviso "Sem a chave fixa do app";
   - o passo **Conferir a assinatura** fica verde e mostra `SHA-256 do certificado: ...`. É a sua impressão digital,
     em minúsculas e sem os `:`.

Nada é publicado e nenhum APK fica para baixar: fora da `main` o workflow nunca publica.

Se der erro:

| Mensagem | Causa provável |
|---|---|
| `keystore password was incorrect` ou `Cannot recover key` | senha errada em `ANDROID_KEYSTORE_PASSWORD` ou `ANDROID_KEY_PASSWORD` |
| `base64: invalid input` ou `Tag number over 30` | o `ANDROID_KEYSTORE_BASE64` foi colado incompleto: copie de novo (passo 5, item 1) |
| `No key with alias` | `ANDROID_KEY_ALIAS` diferente de `inphax` |
| `O APK foi assinado com outra chave` | a variável `ANDROID_CERT_SHA256` não é a impressão digital desta chave |
| aviso `Variável ANDROID_CERT_SHA256 não definida` | falta cadastrar a variável (passo 5, item 4) |

O workflow *Testes* não usa a sua chave (ele cria uma de teste a cada vez) e não muda com isso.

## 7. Passagem do app antigo para o novo (uma vez só)

O app distribuído até agora (versões 1.0.2 e 1.0.10) tem outro identificador (`io.github.ynphax.eear`) e uma chave
que mudava a cada compilação. Por isso o app novo **não atualiza o antigo: instala ao lado**. O progresso passa
assim, pelo próprio curso:

1. No app antigo: **Plano › Dados › Copiar meu progresso**. O código fica copiado (guarde também numa nota).
2. Instale o app novo e abra.
3. No app novo: **Plano › Dados › Colar progresso**, cole o código e confirme.
4. Confira o nome, as aulas dominadas e o histórico de simulados. Só então desinstale o app antigo.

Quem entrar com a conta (login), quando o login estiver ligado, recebe o progresso da nuvem sem esses passos.

## 8. Atualizações depois disso

Cada versão nova, assinada com a mesma chave e com o mesmo identificador, instala por cima e o progresso continua.
Se um dia o Android disser *"O app não foi instalado"* ao atualizar, é sinal de chave ou identificador diferente:
**não desinstale** (desinstalar apaga o progresso). Primeiro copie o progresso como no passo 7.

Se um dia o app for para a Google Play, essa mesma chave pode ser usada no cadastro (assinatura de app da Play), e as
versões continuam instalando por cima.

## 9. Recuperar o progresso de um aparelho

- Aparelho funcionando: *Copiar meu progresso* no app e *Colar progresso* no outro aparelho ou no site.
- App desinstalado sem copiar: o progresso guardado só no aparelho se perde. Com o login ligado, ele volta da nuvem.

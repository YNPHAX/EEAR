# Testes automatizados

Os testes conferem o Missão EEAR como um aluno usa e não mexem no site publicado: cada teste monta o
site numa pasta temporária e abre num servidor local.

| Arquivo | O que confere |
|---|---|
| `dados.test.js` | aulas, questões inéditas, flashcards, videoaulas, provas oficiais (96 questões, 24 por matéria, gabarito, aula, imagens, textos-base), calendário |
| `montagem.test.js` | montagem do site e do app, JavaScript sem erro de sintaxe, arquivos citados, manifesto, modo offline, páginas legais, nada das apostilas no site público; só arquivos da lista do que pode ser publicado e nenhum dado das apostilas no site e no app (lista em `testes/lib/base.js`) |
| `navegador.test.js` | navegação, as aulas, quiz, flashcards, simulados (tamanho, tempo, retomada, descarte), provas oficiais respondidas pelo gabarito, certificados, progresso local (recarregar, copiar e colar), modo offline, telas de 320 a 1440 px no claro e no escuro |
| `progresso.test.js` | progresso gravado por outra versão abre igual e não se perde ao gravar de novo (fixtures em `fixtures/`) |
| `ingles.test.js` | Inglês por opção do edital: cada opção vê só as próprias aulas, cartões, erros e provas; simulado misto sem misturar as opções nem repetir questão; trocar de opção não apaga nada; progresso de antes da separação (ING01 a ING13) guardado |
| `apk.test.js` | configuração do app Android (identificador definitivo, endereço interno), projeto Android gerado e, onde houver Android SDK, a compilação do APK de teste e do APK de distribuição assinado com uma chave fixa |
| `rodar.js` | roda tudo e mostra o resumo |

## Como rodar

Precisa de Python 3, Node 22 e do Playwright com o Chromium:

```
npm install --no-save playwright@1.63.0
npx playwright install chromium
(cd app && npm ci)        # só para o teste do APK
node testes/rodar.js      # ou: node testes/rodar.js --rapido
```

Para testar outra versão do projeto, passe a pasta: `node testes/rodar.js /caminho/da/copia`.

Cada teste também roda sozinho, por exemplo `node testes/navegador.test.js`.

## Fixtures de progresso

`fixtures/` guarda progressos gravados por versões publicadas. Antes de mudar como o progresso é salvo,
gere uma fixture da versão atual e confira que a versão nova abre igual:

```
node testes/ferramentas/gerar-fixture.js <pasta_da_versao> testes/fixtures/progresso-<versao>.json "descrição"
node testes/progresso.test.js
```

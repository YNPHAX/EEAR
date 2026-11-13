# Sincronização legada: bloqueio de integridade e contrato necessário

## Decisão desta rodada

O transporte Claude `get/set/acquire` fica **bloqueado para sincronização**, sem flag de liberação.
O app mantém a identidade, o checkpoint IndexedDB, as operações locais, o estudo entre abas e a exportação.
Não lê/importa snapshots remotos automaticamente, não escreve, não solicita a trava remota e não confirma a nuvem.
Uma BASE de uma versão anterior não autoriza apagar a cópia local, inclusive no descarte de outras contas.
Não se alterou a arquitetura de operações/IndexedDB nem se implementou compactação.

Isso é uma proteção local implementada, **não uma correção do serviço legado**. A funcionalidade de sincronização
desse backend fica indisponível até existir uma garantia efetiva no servidor. Não é aprovação para homologação.
O transporte Firebase transacional continua habilitado conforme a configuração já existente; não se publicou
configuração nem regra no Firebase real.

## Reprodução da falha alta

Base exata: `32d10f316750fe0651b838249f22f9f70ac09153`, runtime `10a3239990eecbb8e66cdfe982687b7962c42af7`.
Comando: `EEAR_GRUPOS=epoca EEAR_EPOCA=9 node testes/plataforma.test.js`.
`testes/epoca-nuvem.js` e suas asserções ficam intactos nesta rodada.

1. A abre e sincroniza. Um escritor antigo lê esse snapshot inicial.
2. B abre; B marca `T:b1`; exige-se a presença no remoto **e na BASE de B**.
3. A marca `T:a1`; exige-se a presença no remoto **e na BASE de A**.
4. Verifica-se que B ainda não conhece `T:a1`. A permanece aberta, sem novas ações.
5. B aceita `T:fecha` e fecha antes de enviar.
6. O escritor antigo substitui o snapshot usando a leitura de 1, acrescentando `T:v2`.
7. B reabre e sincroniza seu checkpoint. Resultado remoto: `T:b1`, `T:base`, `T:fecha`, `T:v2`;
   **falta `T:a1`**, já confirmada. A interface de A ainda dizia **“Progresso salvo na sua conta.”**
8. Cache e checkpoint transacional de A ainda contêm `T:a1`. Reabrir A restaura a união remota.

É divergência/confirmacão remota falsa de gravidade **alta**, reproduzível com ordem controlada, não perda demonstrada
de todas as cópias. A falta de notificações remotas explica a duração; a possibilidade de sobrescrever uma confirmação
é a causa. Uma releitura de A teria uma janela nova para outra sobrescrita. Mudar apenas a mensagem ou aumentar
esperas/retries não resolveria a garantia.

## Por que o cliente não pode garantir esse backend

`acquire` é cooperativo, expira e não impõe precondição a `set`. O escritor antigo não precisa solicitá-lo.
Também pode iniciar um `set` durante uma concessão e terminá-lo depois da conferência do cliente novo.
A assinatura FNV, a época e a linhagem são dados do cliente: o servidor não valida nem exige sua preservação.
Uma versão antiga pode removê-los; outra versão nova pode assinar a união de um snapshot já incompleto.
O IndexedDB protege as operações **deste aparelho**, não impede alguém de substituir o documento remoto.

Reconciliar ao voltar à aba, observar o remoto ou fazer polling pode detectar/restaurar algumas divergências enquanto
a cópia original estiver acessível. Não impede a sobrescrita, nem protege um aparelho fechado, perdido ou apagado
com base numa confirmação anterior. Não foi usado como substituto de um contrato servidor.
Versionar somente no JSON do cliente tampouco rejeita um escritor que ignore o campo.

## Comportamento implementado

- `sincronizar` recusa identidades `claude:*`, mesmo que o objeto anuncie `transacao`.
  Transportes sem função transacional também são recusados. Não há negociação por booleano/configuração do cliente.
- `gravar` recusa o modo legado; `lerUnirGravar` falha fechado. O antigo loop de lease/set/releitura foi removido.
- Migração remota automática e exclusão remota legada ficam bloqueadas; a flag antiga de teste não contorna isso.
- `sincronizado`, `sincronizadoDe` e a transação de exclusão recusam a BASE legada como prova de redundância remota.
- O indicador conserva as mensagens de armazenamento que falha, reserva, carga e confirmação local. Para o legado,
  informa pendência **bloqueada**, risco de sobrescrita e ausência de confirmação remota segura.
  `data-local` distingue carga/pendência/falha/reserva/checkpoint confirmado;
  `data-nuvem` distingue desligada/pendente/falha/confirmada/bloqueada-legado.
- Um checkpoint confirmado é o `oncomplete` da transação, não um cache localStorage nem uma reserva.
  O bloqueio não apaga BASEs históricas, checkpoints, diários ou metadados.

O caminho Firebase usa o adapter conhecido de `runTransaction` e o envelope v2 monotônico das regras propostas.
Isso impede rebaixamento por clientes v1 **quando essas regras estiverem efetivamente aplicadas**. Não é uma prova
de implantação real, nem uma garantia contra alterações arbitrárias por um dono da conta com acesso a outro cliente
v2 que viole o protocolo. Os testes desta rodada usam exclusivamente emuladores.

### Defeito adicional reproduzido durante a matriz

Quota real do localStorage combinada com abort real de IndexedDB deixava uma operação aceita apenas em `loc.ops`.
Depois de liberar o armazenamento, a consolidação só consultava diários do localStorage; como a reserva falhara,
essa operação não era tentada novamente. O teste `operacoes-dupla-falha.test.js` reproduziu checkpoint com atividade
2, quando a UI já tinha aceitado atividade 3. A confirmação de armazenamento não era emitida, mas a recuperação
ficava bloqueada e fechar a aba perderia essa operação. Classificação: **alta**.

A correção inclui as operações pendentes da identidade atual na próxima consolidação transacional, com seus mesmos
IDs. Elas só saem da memória após recibo confirmado ou rejeição pela política de geração/exclusão. Não muda o formato
do checkpoint, a união causal nem sua arquitetura. O teste exige reserva realmente ausente, abort efetivo, aviso sem
confirmação falsa, recuperação automática, contagem 3/3 e reabertura após crash.
Isso não prova, isoladamente, que todas as negativas observadas em carga tenham a mesma causa.

Outra negativa revelou cache localStorage antigo, com checkpoint/UI/servidor corretos. Na abertura, o app comparava
o estado **já reconstruído** de `_ops`/diários com o checkpoint e associava seu hash ao texto bruto do cache, sem
provar que esse texto também fora atualizado. A rotina seguinte podia então ignorar indefinidamente o cache antigo.
`cache-restaurado.test.js` reproduz deterministicamente cache 2/checkpoint 3/interface 3. A otimização foi removida:
`cachear` volta a conferir o conteúdo bruto e regrava somente quando necessário, dentro da mesma transação já usada.
Classificação: **média**; nessa reprodução, o checkpoint permanecia íntegro. Não se afrouxaram as exigências antigas
de atualização do cache. Os logs de `simulados-iguais` agora discriminam seus critérios, sem mudar as asserções.

## Proposta de backend — não executada

Antes de reabrir o transporte legado, o servidor precisa oferecer, conjuntamente:

1. Autenticação/UID e autorização por conta, revogação/tombstone de exclusão e bloqueio de sessões antigas.
2. Um caminho protegido que **recuse `set` cego**, incluindo SDKs/abas antigos. Desativar a rota antiga somente no
   cliente novo é insuficiente; a regra deve valer no servidor em todas as rotas e credenciais de aluno.
3. Protocolo mínimo obrigatório validado no servidor. Uma capability anunciada pelo SDK ou configuração do app
   não prova que um cliente antigo tenha sido efetivamente rejeitado.
4. Revisão monotônica e comparação atômica de revisão (CAS), ou transação de leitura/união/gravação equivalente.
   Uma escrita atrasada com revisão antiga deve ser recusada, mesmo depois de expirar uma trava.
5. Aplicação idempotente de operações identificadas e validação integral antes de confirmar. Repetir o mesmo ID
   com o mesmo conteúdo após perda do ACK não duplica contagens; ID reutilizado com outro conteúdo é recusado.
   A união precisa conservar operações aceitas, remoções observadas e resets; CAS isoladamente não valida essa união.
6. Commit atômico, sem prefixo parcialmente confirmado, com recibo consultável após ACK perdido.
7. Leitura consistente/observação autenticada para trazer alterações de outros aparelhos. Isso melhora atualização
   da interface; a proteção contra escritores incompatíveis permanece no servidor.

`testes/legado-contrato.test.js` é um **modelo fictício limitado** desse contrato, com marcas/IDs: B -> A, rejeição
de escritor antigo e versão incompatível, escrita atrasada, união servidor, repetição de ACK, abort integral e
exclusão. Não implementa o servidor Claude nem todos os tipos de operação do app. Não libera o runtime.
Uma implementação futura deve executar, em ambiente isolado, os testes completos de resets/desmarcações/certificados,
UIDs, crashes, reconexão e clientes misturados contra o servidor candidato real antes de habilitar o transporte.

Alternativa: usar o backend Firebase já implementado após validação e autorização de sua configuração/regras.
Não migrar automaticamente snapshots legados para uma conta Firebase com identidade diferente. A transferência
exige exportação/importação explícita e preservação das operações/migração, sem inferir propriedade por e-mail/nome.
Nenhuma dessas mudanças externas foi realizada nesta missão.

## Critério e bloqueio de liberação

O cenário 9 antigo exige sincronização e convergência efetivas; ele **não passa** com o transporte bloqueado e não
será reinterpretado como verde. A matriz antiga de nuvem legada também continua registrando suas incompatibilidades.
Os testes novos verificam a proteção local separadamente, no bundle publicado sem instrumentação.
Para restaurar a funcionalidade, são necessárias prova de rejeição de clientes antigos no servidor, integração
auditada e matriz adversarial passando no SHA final. CI verde isolado não basta.

Abas de versões antigas já abertas continuam executando seu código anterior: um patch não as revoga no servidor.
O bloqueio do candidato protege apenas clientes que carregaram este runtime. Não há garantia retroativa sobre seus
snapshots remotos. Não apague perfis/aparelhos nem reverta versões para tentar restaurar a sincronização.

## Metadados — acompanhamento separado

O crescimento causal documentado em `validacao-10f631e.md` permanece: o limite remoto de 900.000 caracteres pode ser
atingido. Esta proteção não reduz nem compacta tombstones, contribuições ou recibos. Quota/limite devem resultar em
recusa explícita e preservação local; os ensaios de carga e capacidade são separados do defeito legado.
Qualquer compactação futura exige evidência de que aparelhos offline e repetições antigas não ressuscitam nem
duplicam operações descartadas. Não foi introduzida nesta rodada.

## Reversão manual — acompanhamento separado

A reversão para `2f6cad6` continua sem união automática garantida: esse cliente descarta `_ops`.
O teste antigo e a evidência de quarentena/recuperação explícita ficam preservados. Não se promete rollback
transparente nem se modifica IndexedDB para acomodar esse downgrade. Conservar exportação e perfil original;
qualquer importação de recuperação deve ser explícita e verificada antes de descartar cópias.

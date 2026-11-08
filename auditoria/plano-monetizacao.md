# Preparação para a versão paga: análise técnica e plano

Análise de 2026-11-08. Nada aqui foi implementado: não há cobrança, gateway de pagamento nem bloqueio de acesso.

## Estado atual (verificado no código)

- **Site estático** (GitHub Pages) e **APK** (Capacitor) com o mesmo conteúdo, todo embutido nos arquivos publicados
  (`app.js` e `dados/*.js`). Quem abre o site recebe o curso inteiro.
- **Progresso local** em `localStorage` (`missao-eear-v1`), com exportar e colar progresso.
- **Login e nuvem prontos, mas desligados**: o app carrega o Firebase (Auth e Firestore 12.19.0) só quando existe
  `web/firebase.json`, que não está no repositório. As regras (`web/firestore.rules`) só deixam cada aluno ler e gravar
  o próprio documento `alunos/{uid}`, com até 900 KB.
- **Documentos legais**: `web/legal/privacidade.html` e `termos.html` existem para a versão gratuita.
- **Conteúdo de terceiros**: provas oficiais da EEAR (públicas), videoaulas do YouTube incorporadas com crédito, e
  apostilas de outro curso, que o build já exclui da versão pública.

## O que uma versão paga exige

| Área | Necessidade | Situação | Prioridade |
|---|---|---|---|
| Autenticação | Conta obrigatória para a área paga | Base pronta (Firebase Auth), falta configurar o projeto | Alta |
| Controle de acesso | O conteúdo pago não pode ir nos arquivos públicos | **Bloqueio principal:** hoje todo o conteúdo é estático e público. É preciso servir o conteúdo pago por um backend autenticado (ex.: Firestore com regras por assinatura, ou funções que entregam os dados) | Alta |
| Assinaturas | Plano, vigência, renovação, período de teste | Inexistente; estado da assinatura deve ficar no servidor, nunca só no aparelho | Alta |
| Pagamentos | Gateway com Pix e cartão; recibos; reembolso | Inexistente. Não configurar sem autorização. No Android, conteúdo digital vendido dentro do app em geral precisa seguir a política de cobrança da Google Play | Alta |
| Proteção de conteúdo | Dificultar cópia em massa | Só é possível em parte (o que o aluno vê pode ser copiado); servir por aula, com login, e marcar o conteúdo por usuário | Média |
| Gestão de usuários | Painel de alunos, suporte, exclusão de conta | Inexistente | Média |
| Privacidade (LGPD) | Base legal, consentimento, exclusão e exportação de dados, encarregado | Política atual cobre a versão gratuita; precisa de revisão para dados de pagamento | Alta |
| Administração | Liberar ou revogar acesso, cupons, relatórios | Inexistente | Média |
| Cancelamento e suporte | Cancelar a renovação, direito de arrependimento (7 dias, CDC), canal de suporte | Inexistente | Alta |

## Riscos

- **Direitos de conteúdo**: verificar com assessoria jurídica a cobrança sobre provas oficiais, o uso de vídeos de
  terceiros em produto pago e a ausência de qualquer material de outro curso.
- **Migração dos alunos atuais**: o progresso local precisa continuar valendo quando o aluno criar conta (o app já une
  o progresso local e o da nuvem).
- **Arquitetura**: proteger o conteúdo exige deixar de publicar tudo como arquivo estático, o que muda o build, o
  service worker (uso offline) e o APK. É a mudança de maior risco.
- **Segurança**: o estado da assinatura e os dados de pagamento nunca podem depender só do aparelho; segredos de
  gateway ficam fora do repositório.

## Plano por fases (cada uma depende de autorização)

1. **Decisões de negócio e jurídicas**: modelo (assinatura, acesso por prova, gratuito com extras), preço, gateway,
   termos de uso e política de privacidade revisados, direitos de conteúdo.
2. **Contas**: configurar o projeto Firebase em ambiente de teste, ligar o login e a sincronização, testar com
   aparelhos reais. Sem cobrança.
3. **Separar o conteúdo**: definir o que continua gratuito e público e o que passa a ser entregue só para contas com
   acesso; manter o uso offline para quem tem acesso.
4. **Assinatura em modo de teste**: gateway em sandbox, webhook no servidor gravando a vigência, regras do Firestore
   lendo essa vigência.
5. **Administração e suporte**: painel mínimo, cancelamento, reembolso, exportação e exclusão de dados.
6. **Lançamento controlado**: grupo pequeno de alunos, monitoramento de erros e pagamentos, só então abertura geral.

A plataforma não está pronta para comercialização: faltam as fases acima, testes em aparelhos reais e iOS, validação
pedagógica por professores e a revisão jurídica.

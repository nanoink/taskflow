# Entrega AC1

**Projeto:** TaskFlow

**Integrante(s):**  
[PREENCHER]

**GitHub:**  
[PREENCHER]

**Jira:**  
https://clayton0dev.atlassian.net/jira/software/projects/SCRUM/boards/1

**Vídeo:**  
[PREENCHER]

**Funcionalidade entregue:**  
Cadastro e autenticação de usuários.

## Breve descrição

A AC1 entrega um fluxo completo em três camadas. O usuário cria uma conta com dados validados e senha protegida por bcrypt, realiza login com JWT e acessa um dashboard protegido. A sessão permanece válida após atualizar a página, e o logout remove a autenticação e impede novo acesso direto ao dashboard. Os dados são persistidos em SQLite por meio do Prisma e todas as operações passam pela API REST em Node.js e Express.

## Evidências sugeridas

- Tela de cadastro preenchida.
- Mensagem de conta criada.
- Login realizado e dashboard com o nome do usuário.
- Dashboard mantido após atualização da página.
- Redirecionamento para login após logout.
- Health check da API respondendo em `/api/health`.
- Board SCRUM com Sprint 1 e issues da AC1.

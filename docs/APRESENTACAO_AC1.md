# Roteiro de apresentação da AC1 — TaskFlow

Tempo estimado: 3 a 5 minutos.

## 1. Abertura

Olá! Neste vídeo eu vou apresentar o **TaskFlow**, um sistema de gerenciamento de projetos e tarefas desenvolvido para a disciplina de Projeto de Software.

O problema que o TaskFlow busca resolver é a dificuldade de manter atividades, prioridades e andamento de entregas organizados em um único lugar. O objetivo do sistema é oferecer uma visão clara do trabalho e, nas próximas etapas, permitir gerenciar projetos, tarefas, prazos, status, um quadro Kanban e métricas.

## 2. Arquitetura

O projeto foi separado claramente em três camadas.

A primeira é o **front-end**, desenvolvido com React, Vite, TypeScript e Tailwind CSS. Ele é responsável pelas telas, validações visuais, carregamentos e interação com o usuário.

A segunda é o **back-end**, desenvolvido em Node.js, Express e TypeScript. Ele oferece uma API REST, valida os dados, aplica as regras de autenticação e controla o acesso protegido.

A terceira camada é o **banco de dados SQLite**, acessado exclusivamente pelo backend por meio do Prisma ORM. Portanto, o React não se conecta diretamente ao banco. O fluxo é: React, API REST, Node e Express, Prisma e SQLite.

Essa separação torna o sistema mais organizado, seguro e preparado para crescer nas próximas sprints.

## 3. Funcionalidade entregue na Sprint 1

Na Sprint 1, correspondente à AC1, foi implementado o fluxo completo de cadastro e autenticação.

Primeiro, vou acessar a tela de criação de conta. O formulário solicita nome, e-mail, senha e confirmação da senha. Ele informa erros de maneira amigável, verifica o formato do e-mail, exige no mínimo seis caracteres na senha e confere se as duas senhas são iguais.

Agora vou cadastrar o usuário de teste com o nome **Usuário Teste**, o e-mail **teste@taskflow.com** e a senha **123456**.

Ao enviar o formulário, os dados passam pela API. O backend verifica se o e-mail é único e transforma a senha em um hash com bcrypt antes de gravá-la no SQLite. A senha original nunca é salva nem retornada.

Depois do cadastro, o sistema volta para o login e exibe uma mensagem de sucesso. Agora vou entrar com o e-mail e a senha cadastrados.

Quando as credenciais estão corretas, o backend gera um token JWT. O front-end guarda a sessão e redireciona para o dashboard protegido.

## 4. Dashboard, persistência e logout

No dashboard, aparece a mensagem de boas-vindas com o nome do usuário. Também existem os cards de Projetos, Tarefas, Em andamento e Concluídas. Nesta primeira sprint, os valores começam zerados porque o CRUD será implementado nas próximas etapas.

Na barra lateral já aparecem Dashboard, Projetos e Tarefas. As duas últimas opções indicam que estarão disponíveis na próxima sprint.

Vou atualizar a página para demonstrar a persistência. O sistema consulta o endpoint protegido de usuário atual e mantém o acesso porque o token ainda é válido.

Agora vou clicar em **Sair**. O token é removido, o usuário volta para o login e deixa de ter acesso ao dashboard. Se eu tentar abrir `/dashboard` diretamente sem autenticação, a rota protegida redireciona para o login.

## 5. Próximas sprints

Na Sprint 2 será implementado o CRUD de projetos. Na Sprint 3 serão adicionadas as tarefas, prioridades, prazos, mudança de status e o Kanban. Na Sprint 4 o dashboard receberá dados reais, métricas, filtros, testes finais e refinamento visual.

Com isso, a AC1 entrega uma funcionalidade real funcionando de ponta a ponta nas três camadas: interface, API e banco de dados. Obrigado!

## Checklist antes de gravar

- Iniciar o projeto com `npm run dev`.
- Deixar a tela de cadastro aberta.
- Se o usuário já existir, usar outro e-mail ou remover o banco local antes da demonstração.
- Mostrar rapidamente a estrutura `frontend`, `backend` e `prisma` no editor.
- Demonstrar cadastro, login, atualização da página, dashboard, logout e bloqueio da rota.
- Manter o board do Jira aberto para mostrar a organização das sprints.

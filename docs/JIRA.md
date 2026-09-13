# Gestão do projeto no Jira

## Identificação

- Projeto: `SCRUM`
- Board ID: `1`
- URL: https://clayton0dev.atlassian.net/jira/software/projects/SCRUM/boards/1
- Sprint atual esperada: `SPRINT 1 — Autenticação`

## Estrutura planejada

### Epic 1 — Estrutura e Autenticação

- Configurar Front-end
- Configurar Back-end
- Configurar banco SQLite
- Configurar Prisma ORM
- Criar cadastro de usuário
- Criar login
- Implementar JWT
- Criar rota protegida
- Criar Dashboard inicial
- Criar logout
- Criar tratamento de erros
- Testar autenticação

### Epic 2 — Gerenciamento de Projetos

- Criar projeto
- Listar projetos
- Visualizar projeto
- Editar projeto
- Excluir projeto

### Epic 3 — Gerenciamento de Tarefas

- Criar tarefa
- Listar tarefas
- Editar tarefa
- Excluir tarefa
- Definir prioridade
- Definir prazo
- Alterar status
- Criar Kanban

### Epic 4 — Dashboard e Finalização

- Criar métricas
- Criar filtros
- Melhorar dashboard
- Melhorar responsividade
- Refinar UI
- Testes finais
- Documentação
- Preparação da apresentação

## Sprints

| Sprint | Objetivo | Escopo principal |
| --- | --- | --- |
| SPRINT 1 — Autenticação | Construir a base do TaskFlow e implementar autenticação | Front-end, backend, SQLite, Prisma, cadastro, login, JWT, dashboard, logout e testes |
| SPRINT 2 — Projetos | Implementar o CRUD de projetos | Criar, listar, visualizar, editar e excluir projetos |
| SPRINT 3 — Tarefas | Implementar a gestão de tarefas | CRUD, prioridade, prazo, status e Kanban |
| SPRINT 4 — Projeto Final | Finalizar e refinar o sistema | Métricas, filtros, responsividade, UI, testes, documentação e apresentação |

## Automação

O arquivo `scripts/setup-jira.ts` usa a API REST oficial do Jira Cloud. Antes de alterar dados, ele:

1. testa a autenticação;
2. localiza o projeto `SCRUM`;
3. valida o board `1`;
4. consulta todas as issues existentes;
5. cria apenas Epics, issues e sprints ausentes;
6. associa cada issue à sprint planejada;
7. ativa a Sprint 1 somente quando não existe outra sprint ativa;
8. imprime um resumo final.

As buscas usam nomes normalizados, por isso executar o script novamente não duplica os itens gerenciados.

## Variáveis necessárias

Crie um `.env` na raiz com:

```dotenv
JIRA_BASE_URL=https://clayton0dev.atlassian.net
JIRA_EMAIL=clayton0dev@gmail.com
JIRA_API_TOKEN=seu-token
```

O arquivo real fica no `.gitignore`. O token nunca deve ser colocado no script ou enviado ao GitHub.

## Como executar

Sincronizar a estrutura sem alterar status:

```bash
npm run jira:setup
```

Depois que cadastro, login, JWT, dashboard protegido, logout e testes tiverem sido verificados, sincronizar e mover apenas as issues da AC1 para DONE:

```bash
npm run jira:setup -- --mark-ac1-done
```

O parâmetro explícito evita marcar trabalho incompleto por acidente. Issues futuras permanecem no estado inicial.

Os nomes mantêm a intenção do planejamento original e respeitam o limite desta instância do Jira, que exige menos de 30 caracteres por nome de sprint. O objetivo completo de cada sprint fica registrado no campo **Objetivo**.

## Observações de compatibilidade

O script descobre os tipos de issue disponíveis no projeto. Se o tipo Epic não estiver habilitado, os agrupadores são criados como Task. Se o fluxo usar nomes diferentes de `DONE`, a automação identifica a categoria final do Jira em vez de depender apenas do texto do status.

## Resultado da sincronização da AC1

Sincronização executada em 13/09/2026:

- Epic Estrutura e Autenticação: `SCRUM-5`
- Epic Gerenciamento de Projetos: `SCRUM-18`
- Epic Gerenciamento de Tarefas: `SCRUM-24`
- Epic Dashboard e Finalização: `SCRUM-33`
- Sprint 1: ID `3`, estado **futura**
- Sprint 2: ID `4`, estado **futura**
- Sprint 3: ID `5`, estado **futura**
- Sprint 4: ID `6`, estado **futura**
- Issues da AC1: `SCRUM-6` até `SCRUM-17`, todas em **Concluído**
- Issues das próximas sprints: mantidas no estado inicial

O board já possuía a sprint ativa `SCRUM Sprint 0`. Por segurança, a automação não encerrou nem alterou essa sprint preexistente e manteve a Sprint 1 do TaskFlow como futura. Para ativá-la, finalize a sprint preexistente no Jira e execute novamente `npm run jira:setup`.

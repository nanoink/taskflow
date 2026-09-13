# TaskFlow

## Sobre o projeto

TaskFlow é um sistema acadêmico de gerenciamento de projetos e tarefas. A primeira entrega (AC1) implementa um fluxo real de cadastro, login, autenticação com JWT, persistência da sessão e dashboard protegido.

## Objetivo

Oferecer uma base clara e evolutiva para organizar projetos, tarefas, prazos, prioridades, quadros Kanban e métricas. A AC1 prioriza uma arquitetura em três camadas funcional, segura e fácil de demonstrar.

## Arquitetura

```text
Frontend React
      ↓
   REST API
      ↓
Node.js + Express
      ↓
    Prisma
      ↓
    SQLite
```

O React nunca acessa o banco diretamente. Toda leitura ou alteração passa pela API REST do backend.

## Tecnologias

- Front-end: React 19, Vite, TypeScript, Tailwind CSS e React Router
- Back-end: Node.js, Express 5, TypeScript, Zod, JWT e bcrypt
- Persistência: SQLite com Prisma ORM
- Qualidade: Node Test Runner, Supertest, TypeScript e builds de produção
- Gestão: Git/GitHub e automação da API REST do Jira Cloud

## Estrutura de pastas

```text
taskflow/
├── frontend/               # SPA React e interface da aplicação
│   └── src/
│       ├── components/
│       ├── contexts/
│       ├── lib/
│       ├── pages/
│       └── types/
├── backend/                # API REST Express
│   ├── prisma/             # Schema e migrations do banco
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── lib/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   └── test/
├── docs/                   # Documentação acadêmica e do Jira
└── scripts/                # Automação idempotente do Jira
```

## Instalação

Pré-requisito: Node.js 20.19 ou superior.

```bash
npm install
npm run db:migrate
```

O arquivo local `backend/.env` deve conter uma chave JWT segura. Um modelo está disponível em `backend/.env.example`.

## Como executar

Subir frontend e backend juntos:

```bash
npm run dev
```

Executar cada camada separadamente:

```bash
npm run dev:frontend
npm run dev:backend
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3333
- Health check: http://localhost:3333/api/health

Build e testes:

```bash
npm run build
npm test
```

## Banco de dados

O banco é um arquivo SQLite local gerenciado pelo Prisma, sem servidor externo. O schema inclui `User` e já deixa `Project` e `Task` preparados para as próximas sprints.

Comandos úteis:

```bash
npm run db:generate
npm run db:migrate
```

As migrations são versionadas; o arquivo `.db` local não é versionado.

## API

| Método | Endpoint | Autenticação | Descrição |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Não | Verifica a disponibilidade da API |
| `POST` | `/api/auth/register` | Não | Cadastra usuário com senha protegida por hash |
| `POST` | `/api/auth/login` | Não | Valida credenciais e retorna JWT |
| `GET` | `/api/auth/me` | Bearer JWT | Retorna o usuário autenticado |

Exemplo de cadastro:

```json
{
  "name": "Usuário Teste",
  "email": "teste@taskflow.com",
  "password": "123456",
  "confirmPassword": "123456"
}
```

## Integração com Jira

Copie `.env.example` para um arquivo `.env` e informe `JIRA_API_TOKEN`. O script também reconhece o caminho local legado `.env/.env`.

```bash
npm run jira:setup
```

O script pode ser executado repetidamente sem duplicar Epics, issues ou sprints. Depois de validar a AC1, use:

```bash
npm run jira:setup -- --mark-ac1-done
```

Mais detalhes estão em [docs/JIRA.md](docs/JIRA.md).

## Sprint 1

Funcionalidade entregue: cadastro e autenticação.

- Cadastro com validação, e-mail único e bcrypt
- Login com JWT
- Consulta segura do usuário atual
- Dashboard protegido
- Persistência após atualização da página
- Logout e redirecionamento de visitantes

## Sprint 2

CRUD de projetos.

## Sprint 3

Gerenciamento de tarefas, prioridades, prazos, status e Kanban.

## Sprint 4

Dashboard com dados reais, métricas, filtros, testes e refinamento final.

## Segurança

Senhas nunca são retornadas pela API ou gravadas em texto puro. Tokens e segredos permanecem em arquivos `.env` ignorados pelo Git. Para um ambiente de produção, troque a chave JWT local, limite as origens CORS e use HTTPS.

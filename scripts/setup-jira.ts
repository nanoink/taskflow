import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from 'dotenv';

type JiraIssue = {
  id: string;
  key: string;
  fields: {
    summary: string;
    issuetype?: { id: string; name: string };
    status?: { name: string; statusCategory?: { key: string } };
    parent?: { key: string };
  };
};

type JiraSprint = {
  id: number;
  name: string;
  state: 'active' | 'future' | 'closed';
  goal?: string;
};

type JiraIssueType = {
  id: string;
  name: string;
  subtask?: boolean;
  hierarchyLevel?: number;
};

type IssueDefinition = {
  summary: string;
  description: string;
};

type EpicDefinition = {
  name: string;
  description: string;
  issues: IssueDefinition[];
};

type SprintDefinition = {
  name: string;
  goal: string;
  issueSummaries: string[];
};

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, '..');

for (const candidate of [path.join(projectRoot, '.env'), path.join(projectRoot, '.env', '.env')]) {
  if (existsSync(candidate) && statSync(candidate).isFile()) {
    config({ path: candidate, quiet: true });
  }
}

const baseUrl = process.env.JIRA_BASE_URL?.replace(/\/$/, '');
const email = process.env.JIRA_EMAIL;
const apiToken = process.env.JIRA_API_TOKEN;
const projectKey = 'SCRUM';
const boardId = 1;
const shouldMarkAc1Done = process.argv.includes('--mark-ac1-done');

if (!baseUrl || !email || !apiToken) {
  console.error(
    'Variáveis ausentes. Defina JIRA_BASE_URL, JIRA_EMAIL e JIRA_API_TOKEN em .env e tente novamente.',
  );
  process.exit(1);
}

const authHeader = `Basic ${Buffer.from(`${email}:${apiToken}`).toString('base64')}`;

const epicDefinitions: EpicDefinition[] = [
  {
    name: 'Estrutura e Autenticação',
    description: 'Estrutura inicial em três camadas e autenticação completa da AC1.',
    issues: [
      ['Configurar Front-end', 'Preparar React, Vite, TypeScript, Tailwind CSS e roteamento.'],
      ['Configurar Back-end', 'Preparar Node.js, Express e TypeScript com organização em camadas.'],
      ['Configurar banco SQLite', 'Disponibilizar banco SQLite local e persistente.'],
      ['Configurar Prisma ORM', 'Configurar schema, client e migration do Prisma.'],
      ['Criar cadastro de usuário', 'Cadastrar nome, e-mail único e senha armazenada com hash.'],
      ['Criar login', 'Validar credenciais e iniciar sessão do usuário.'],
      ['Implementar JWT', 'Emitir e validar token JWT no backend.'],
      ['Criar rota protegida', 'Bloquear o dashboard para visitantes sem token válido.'],
      ['Criar Dashboard inicial', 'Exibir dashboard responsivo com usuário e indicadores iniciais.'],
      ['Criar logout', 'Remover a sessão local e retornar à tela de login.'],
      ['Criar tratamento de erros', 'Padronizar validações e respostas amigáveis da API.'],
      ['Testar autenticação', 'Validar cadastro, login, persistência, proteção e logout.'],
    ].map(([summary, description]) => ({ summary, description })),
  },
  {
    name: 'Gerenciamento de Projetos',
    description: 'CRUD de projetos planejado para a Sprint 2.',
    issues: [
      ['Criar projeto', 'Permitir a criação de um projeto.'],
      ['Listar projetos', 'Listar os projetos do usuário autenticado.'],
      ['Visualizar projeto', 'Exibir os detalhes de um projeto.'],
      ['Editar projeto', 'Permitir a atualização dos dados de um projeto.'],
      ['Excluir projeto', 'Permitir a exclusão segura de um projeto.'],
    ].map(([summary, description]) => ({ summary, description })),
  },
  {
    name: 'Gerenciamento de Tarefas',
    description: 'Gestão de tarefas e quadro Kanban planejados para a Sprint 3.',
    issues: [
      ['Criar tarefa', 'Permitir a criação de uma tarefa em um projeto.'],
      ['Listar tarefas', 'Listar tarefas por projeto.'],
      ['Editar tarefa', 'Permitir a edição de uma tarefa.'],
      ['Excluir tarefa', 'Permitir a exclusão de uma tarefa.'],
      ['Definir prioridade', 'Classificar tarefas por prioridade.'],
      ['Definir prazo', 'Definir data limite para tarefas.'],
      ['Alterar status', 'Mover tarefas entre estados do fluxo.'],
      ['Criar Kanban', 'Exibir e operar tarefas em um quadro Kanban.'],
    ].map(([summary, description]) => ({ summary, description })),
  },
  {
    name: 'Dashboard e Finalização',
    description: 'Métricas, refinamento e entrega final planejados para a Sprint 4.',
    issues: [
      ['Criar métricas', 'Apresentar métricas úteis dos projetos e tarefas.'],
      ['Criar filtros', 'Adicionar filtros às visualizações do sistema.'],
      ['Melhorar dashboard', 'Evoluir o dashboard com dados reais.'],
      ['Melhorar responsividade', 'Refinar a experiência em diferentes telas.'],
      ['Refinar UI', 'Aprimorar consistência visual e experiência de uso.'],
      ['Testes finais', 'Executar testes completos da aplicação.'],
      ['Documentação', 'Consolidar a documentação técnica e acadêmica.'],
      ['Preparação da apresentação', 'Preparar roteiro e demonstração final.'],
    ].map(([summary, description]) => ({ summary, description })),
  },
];

const sprintDefinitions: SprintDefinition[] = [
  {
    name: 'SPRINT 1 — Autenticação',
    goal: 'Construir a arquitetura inicial do TaskFlow e implementar autenticação.',
    issueSummaries: epicDefinitions[0]!.issues.map((issue) => issue.summary),
  },
  {
    name: 'SPRINT 2 — Projetos',
    goal: 'Implementar CRUD de projetos.',
    issueSummaries: epicDefinitions[1]!.issues.map((issue) => issue.summary),
  },
  {
    name: 'SPRINT 3 — Tarefas',
    goal: 'Implementar gerenciamento de tarefas e Kanban.',
    issueSummaries: epicDefinitions[2]!.issues.map((issue) => issue.summary),
  },
  {
    name: 'SPRINT 4 — Projeto Final',
    goal: 'Concluir métricas, experiência, testes, documentação e apresentação.',
    issueSummaries: epicDefinitions[3]!.issues.map((issue) => issue.summary),
  },
];

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[—–]/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function adf(text: string) {
  return {
    type: 'doc',
    version: 1,
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  };
}

async function jiraRequest<T>(pathname: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${baseUrl}${pathname}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: authHeader,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  const responseText = await response.text();
  const data = responseText ? (JSON.parse(responseText) as unknown) : undefined;

  if (!response.ok) {
    const errorData = data as { errorMessages?: string[]; errors?: Record<string, string> } | undefined;
    const details = [
      ...(errorData?.errorMessages ?? []),
      ...Object.values(errorData?.errors ?? {}),
    ].join(' ');
    throw new Error(`Jira respondeu ${response.status} em ${pathname}${details ? `: ${details}` : ''}`);
  }

  return data as T;
}

async function listAllIssues(): Promise<JiraIssue[]> {
  const issues: JiraIssue[] = [];
  let nextPageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      jql: `project = ${projectKey} ORDER BY created ASC`,
      maxResults: '100',
      fields: 'summary,issuetype,status,parent',
    });
    if (nextPageToken) params.set('nextPageToken', nextPageToken);

    const page = await jiraRequest<{
      issues: JiraIssue[];
      nextPageToken?: string;
      isLast?: boolean;
    }>(`/rest/api/3/search/jql?${params}`);
    issues.push(...page.issues);
    nextPageToken = page.isLast === false ? page.nextPageToken : undefined;
  } while (nextPageToken);

  return issues;
}

async function listAllSprints(): Promise<JiraSprint[]> {
  const sprints: JiraSprint[] = [];
  let startAt = 0;
  let isLast = false;

  while (!isLast) {
    const page = await jiraRequest<{
      values: JiraSprint[];
      isLast: boolean;
      startAt: number;
      maxResults: number;
    }>(`/rest/agile/1.0/board/${boardId}/sprint?state=active,future,closed&startAt=${startAt}&maxResults=50`);
    sprints.push(...page.values);
    isLast = page.isLast;
    startAt += page.maxResults;
  }

  return sprints;
}

async function createIssue(
  summary: string,
  description: string,
  issueTypeId: string,
  parentKey?: string,
): Promise<JiraIssue> {
  const fields: Record<string, unknown> = {
    project: { key: projectKey },
    summary,
    description: adf(description),
    issuetype: { id: issueTypeId },
  };
  if (parentKey) fields.parent = { key: parentKey };

  try {
    return await jiraRequest<JiraIssue>('/rest/api/3/issue', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  } catch (error) {
    if (!parentKey) throw error;
    console.warn(`  Aviso: ${summary} não aceitou vínculo ao Epic; criando sem parent.`);
    delete fields.parent;
    return jiraRequest<JiraIssue>('/rest/api/3/issue', {
      method: 'POST',
      body: JSON.stringify({ fields }),
    });
  }
}

async function moveIssueToDone(issue: JiraIssue): Promise<boolean> {
  if (issue.fields.status?.statusCategory?.key === 'done') return false;

  const result = await jiraRequest<{
    transitions: Array<{
      id: string;
      name: string;
      to: { name: string; statusCategory?: { key: string } };
    }>;
  }>(`/rest/api/3/issue/${issue.key}/transitions`);
  const transition = result.transitions.find(
    (item) =>
      item.to.statusCategory?.key === 'done' ||
      ['done', 'concluido', 'concluida'].some((status) => normalize(item.to.name).includes(status)),
  );

  if (!transition) {
    console.warn(`  Aviso: nenhuma transição para DONE disponível em ${issue.key}.`);
    return false;
  }

  await jiraRequest(`/rest/api/3/issue/${issue.key}/transitions`, {
    method: 'POST',
    body: JSON.stringify({ transition: { id: transition.id } }),
  });
  return true;
}

async function main() {
  console.log('TaskFlow · configuração idempotente do Jira');
  console.log('1/7 Testando autenticação...');
  const myself = await jiraRequest<{ displayName: string }>('/rest/api/3/myself');
  console.log(`  Autenticado como ${myself.displayName}.`);

  console.log('2/7 Localizando projeto e board...');
  const [project, board] = await Promise.all([
    jiraRequest<{ id: string; key: string; name: string; issueTypes?: JiraIssueType[] }>(
      `/rest/api/3/project/${projectKey}`,
    ),
    jiraRequest<{ id: number; name: string; type: string }>(`/rest/agile/1.0/board/${boardId}`),
  ]);
  console.log(`  Projeto ${project.key} (${project.name}); board ${board.id} (${board.name}).`);

  console.log('3/7 Verificando issues existentes...');
  const existingIssues = await listAllIssues();
  const issuesBySummary = new Map(existingIssues.map((issue) => [normalize(issue.fields.summary), issue]));
  console.log(`  ${existingIssues.length} issue(s) encontrada(s) antes da sincronização.`);

  const issueTypes = project.issueTypes ?? [];
  const epicType = issueTypes.find(
    (type) => ['epic', 'epico'].includes(normalize(type.name)) || type.hierarchyLevel === 1,
  );
  const regularType =
    issueTypes.find(
      (type) => ['story', 'historia'].includes(normalize(type.name)) && !type.subtask,
    ) ??
    issueTypes.find(
      (type) => ['task', 'tarefa'].includes(normalize(type.name)) && !type.subtask,
    ) ??
    issueTypes.find((type) => !type.subtask && type.id !== epicType?.id);

  if (!regularType) throw new Error('O projeto não possui tipo Story ou Task disponível para criação.');
  if (!epicType) console.warn('  Aviso: tipo Epic não disponível; agrupadores serão criados como Task.');

  console.log('4/7 Sincronizando Epics e issues...');
  let createdIssueCount = 0;
  for (const epicDefinition of epicDefinitions) {
    let epic = issuesBySummary.get(normalize(epicDefinition.name));
    if (!epic) {
      epic = await createIssue(
        epicDefinition.name,
        epicDefinition.description,
        epicType?.id ?? regularType.id,
      );
      epic.fields = { summary: epicDefinition.name };
      issuesBySummary.set(normalize(epicDefinition.name), epic);
      createdIssueCount += 1;
      console.log(`  Criado ${epic.key}: ${epicDefinition.name}`);
    }

    for (const definition of epicDefinition.issues) {
      if (issuesBySummary.has(normalize(definition.summary))) continue;
      const issue = await createIssue(
        definition.summary,
        definition.description,
        regularType.id,
        epicType ? epic.key : undefined,
      );
      issue.fields = { summary: definition.summary };
      issuesBySummary.set(normalize(definition.summary), issue);
      createdIssueCount += 1;
      console.log(`  Criado ${issue.key}: ${definition.summary}`);
    }
  }

  console.log('5/7 Sincronizando sprints...');
  const existingSprints = await listAllSprints();
  const sprintsByName = new Map(existingSprints.map((sprint) => [normalize(sprint.name), sprint]));
  let createdSprintCount = 0;

  for (const definition of sprintDefinitions) {
    if (sprintsByName.has(normalize(definition.name))) continue;
    const sprint = await jiraRequest<JiraSprint>('/rest/agile/1.0/sprint', {
      method: 'POST',
      body: JSON.stringify({
        name: definition.name,
        goal: definition.goal,
        originBoardId: boardId,
      }),
    });
    sprintsByName.set(normalize(definition.name), sprint);
    createdSprintCount += 1;
    console.log(`  Criada sprint ${sprint.id}: ${sprint.name}`);
  }

  console.log('6/7 Associando issues às sprints...');
  for (const definition of sprintDefinitions) {
    const sprint = sprintsByName.get(normalize(definition.name));
    if (!sprint || sprint.state === 'closed') continue;
    const issueKeys = definition.issueSummaries
      .map((summary) => issuesBySummary.get(normalize(summary))?.key)
      .filter((key): key is string => Boolean(key));

    if (issueKeys.length > 0) {
      await jiraRequest(`/rest/agile/1.0/sprint/${sprint.id}/issue`, {
        method: 'POST',
        body: JSON.stringify({ issues: issueKeys }),
      });
      console.log(`  ${issueKeys.length} issue(s) associada(s) a ${sprint.name}.`);
    }
  }

  const sprintOne = sprintsByName.get(normalize(sprintDefinitions[0]!.name));
  const activeSprint = [...sprintsByName.values()].find((sprint) => sprint.state === 'active');
  if (sprintOne?.state === 'future' && !activeSprint) {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
    await jiraRequest(`/rest/agile/1.0/sprint/${sprintOne.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        name: sprintOne.name,
        goal: sprintDefinitions[0]!.goal,
        state: 'active',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      }),
    });
    sprintOne.state = 'active';
    console.log(`  ${sprintOne.name} ativada.`);
  } else if (activeSprint && activeSprint.id !== sprintOne?.id) {
    console.warn(`  Aviso: ${activeSprint.name} já está ativa; a Sprint 1 não foi ativada.`);
  }

  console.log('7/7 Atualizando status da AC1...');
  let transitionedCount = 0;
  if (shouldMarkAc1Done) {
    const refreshedIssues = await listAllIssues();
    const refreshedBySummary = new Map(
      refreshedIssues.map((issue) => [normalize(issue.fields.summary), issue]),
    );
    for (const summary of sprintDefinitions[0]!.issueSummaries) {
      const issue = refreshedBySummary.get(normalize(summary));
      if (issue && (await moveIssueToDone(issue))) {
        transitionedCount += 1;
        console.log(`  ${issue.key} movida para DONE: ${summary}`);
      }
    }
  } else {
    console.log('  Status preservados. Use --mark-ac1-done somente após validar toda a AC1.');
  }

  const finalIssues = await listAllIssues();
  const ac1Statuses = sprintDefinitions[0]!.issueSummaries.map((summary) => {
    const issue = finalIssues.find((candidate) => normalize(candidate.fields.summary) === normalize(summary));
    return `${issue?.key ?? 'sem-chave'} ${summary}: ${issue?.fields.status?.name ?? 'status indisponível'}`;
  });

  console.log('\nResumo');
  console.log(`- Issues criadas: ${createdIssueCount}`);
  console.log(`- Sprints criadas: ${createdSprintCount}`);
  console.log(`- Issues movidas para DONE: ${transitionedCount}`);
  console.log(`- Sprint 1: ${sprintOne?.state ?? 'não localizada'}`);
  console.log('- Status da AC1:');
  for (const status of ac1Statuses) console.log(`  • ${status}`);
  console.log(`- Board: ${baseUrl}/jira/software/projects/${projectKey}/boards/${boardId}`);
}

main().catch((error) => {
  console.error(`\nFalha ao configurar o Jira: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});

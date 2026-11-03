# artefact-technical-project

Aplicação web de gerenciamento de tarefas (Next.js 15 + tRPC), implementada a partir da especificação em [`docs/task-manager/`](docs/task-manager).

## Tecnologias

- Next.js 15 (App Router, Turbopack)
- tRPC 11 + React Query
- Zod para validação
- Armazenamento em memória (sem banco de dados)

## Compatibilidade com a especificação

A [`spec`](docs/task-manager/spec.md) pede os campos `titulo`, `descricao` e `dataCriacao`. A implementação usa nomes em inglês — decisão do projeto (variáveis, código e textos da UI em inglês):

| Spec (documento) | Implementação (código/API/UI) |
|---|---|
| `titulo` | `title` |
| `descricao` | `description` |
| `dataCriacao` | `createdAt` (`Date`, serializado via superjson) |

Semântica idêntica à da spec:

- `id`: string (UUID gerado na criação);
- `title`: obrigatório, validado com Zod (`trim` + não pode ser vazio);
- `description`: opcional, string vazia tratada como ausente;
- `createdAt`: gerado automaticamente no momento da criação.

Os nomes das procedures seguem a especificação: `task.list`, `task.create`, `task.update`, `task.delete`.

## Estrutura

```
src/
  app/            # páginas e rotas (SSR + rota de API do tRPC)
  components/     # componentes reutilizáveis de UI
  server/         # backend: routers tRPC, store em memória
  trpc/           # infraestrutura tRPC (client, provider, SSR)
```

## Paginação

A listagem usa **paginação por cursor com infinite scroll** (10 tarefas por vez). A decisão completa, alternativas e trade-offs estão em [`docs/task-manager/decisions/001-infinite-scroll-pagination.md`](docs/task-manager/decisions/001-infinite-scroll-pagination.md). Resumo: o SSR carrega só a 1ª página; o cliente busca as próximas quando o fim da lista se aproxima (sentinela + `IntersectionObserver`), e a ordenação é **mais recente primeiro**. Cada resposta de `task.list` também traz `total` (quantidade global de tarefas na memória), exibido na UI como "Showing X of Y tasks" — X são as tarefas já carregadas.

## Rodando

Desenvolvimento:

```bash
npm install
npm run dev
# abre em http://localhost:3000
```

Produção/build:

```bash
npm run build
npm start
```

## Limitações do armazenamento

O armazenamento é 100% em memória, conforme a especificação (sem banco de dados). Na prática, isso significa:

- **Volátil:** a lista zera a cada reinício — `npm run dev`, `npm start` ou `docker compose down/up`.
- **Por processo:** os dados vivem no processo do servidor. Rodar mais de uma instância/réplica (por exemplo, escalar o compose para 2 containers) resultaria em listagens divergentes entre elas; o compose deste projeto sobe uma única instância por design.
- **Sem compartilhamento:** a listagem só reflete as operações feitas naquele processo — não há persistência entre dispositivos, sessões ou servidores.

## Docker

A aplicação sobe no host na **porta 3003** (a porta 3002 já estava em uso por outra aplicação local). A porta pode ser alterada sem editar o arquivo:

```bash
# exemplo: mudando a porta para 3005
COMPOSE_PORT=3005 docker compose up --build
```

Uso padrão:

```bash
docker compose up --build
```

Acesse em `http://localhost:3003`. Para parar: `docker compose down`.

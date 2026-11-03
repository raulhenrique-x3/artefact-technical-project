# ADR 001 — Listagem paginada com infinite scroll

- **Status:** aceito
- **Data:** 03/11/2026
- **Fonte do contexto:** os critérios de aceitação pedem pré-carregamento da listagem via SSR, além de "feedback durante o carregamento"

## Contexto da decisão

`task.list` originalmente retornava o array completo de tarefas em uma única resposta, renderizada no SSR da página. Com 100 tarefas semeadas, o HTML pré-carregado chegou a ~117 KB (a lista inteira serializada três vezes: markup, aria-labels e o cache React Query hidratado). Tarefas adicionais aumentavam o payload linearmente, sem limite — a store é um armazenamento em memória sem teto de capacidade.

Era preciso decidir como a listagem deveria crescer sem inflar o payload do SSR.

## Decisão

1. **Paginação por cursor em `task.list`**, com **tamanho de página fixo de 10**:
   - Requisição: `{ limit?: number, cursor?: string }` — o `cursor` é o **id do último item** da página anterior; omita para carregar a primeira página.
   - Resposta: `{ items: Task[], nextCursor: string | null, total: number }` — `nextCursor` vem `null` quando não há mais páginas; `total` é a quantidade global de tarefas (exibida pela UI como "Showing X of Y tasks").
2. **Infinite scroll no cliente**, implementado com `useInfiniteQuery` (`getNextPageParam`) e um elemento sentinela observado via **`IntersectionObserver`** (`rootMargin 400px`, para a próxima página começar a ser buscada antes de aparecer na tela). Sem nova dependência.
3. **O SSR continua pré-carregando somente a 1ª página** (10 itens): o critério de aceitação de pré-carregamento fica satisfeito, com payload delimitado.
4. **Mutações seguem funcionando por revalidação:** create/update/delete invalidam `task.list`, e a infinite-query revalida todas as páginas já carregadas com seus próprios cursors.

### Por que cursor por id em vez de offset

A store em memória mantém a ordem de inserção, mas itens podem ser **excluídos de qualquer posição**. Um cursor por offset deslocaria silenciosamente a janela após uma exclusão no meio da lista (itens duplicados ou pulados na continuação). Um cursor por id é estável: a paginação retoma "depois do id X" independentemente de exclusões, e a paginação se mantém correta nos refetchs de invalidação.

### Ordem da listagem

A `store` devolve a listagem com a **mais recente primeiro** (inverte a ordem de inserção do Map). O cursor não é afetado — por ser baseado em id, a ordenação não muda a semântica de paginação.

## Alternativas consideradas

- **Cursor por offset** — mais simples, mas quebra com exclusões no meio da lista (rejeitada acima).
- **Carregar todas as tarefas (comportamento anterior)** — mais simples, mas payload e renderização crescem linear e ilimitadamente; já mensurável com 100 tarefas (~117 KB na página SSR).

## Consequências e trade-offs

- **Cursor excluído entre carregamentos de página:** se o id que ancora a próxima página for excluído antes do fetch, o loader degrada para a página 1 (id não encontrado → início da lista). É um efeito benigno enquanto o usuário cria/edita/exclui: a invalidação revalida as páginas carregadas e se autocorrige.
- **Total exposto:** a resposta do `task.list` inclui `total` (quantidade global de tarefas na store, custo O(1) via `Map.size`) e a UI mostra "Showing X of Y tasks", onde X são as páginas já carregadas. Ainda assim, a UI continua sinalizando o carregamento incremental com `hasNextPage`/`isFetchingNextPage`; o contador serve para o usuário saber quanto falta rolar, não como métrica do sistema.
- **Tamanho de página fixo em código (10):** não exposto como configuração de usuário — evita configurabilidade prematura.
- **A store ainda faz uma leitura da lista inteira por página** (`slice` após a leitura): O(n) por página, irrelevante na escala de testes deste projeto; revisitar se a store ganhar uma camada de persistência real.

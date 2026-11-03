"use client";

import { useEffect, useMemo } from "react";
import { trpc } from "@/trpc/react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { useToast } from "@/components/ui/Toast";
import { Feedback } from "./Feedback";
import { TaskItem } from "./TaskItem";
import { TaskForm } from "./TaskForm";

const PAGE_SIZE = 10; // tarefas por página, carregadas via scroll infinito (fixo)

export function TaskList() {
  // Scroll infinito: a primeira página vem hidratada do SSR; o restante é buscado
  // no cliente quando a sentinela chega ao viewport.
  const infiniteQuery = trpc.task.list.useInfiniteQuery(
    { limit: PAGE_SIZE },
    { getNextPageParam: (lastPage) => lastPage.nextCursor },
  );
  const { hasNextPage, fetchNextPage, isFetchingNextPage } = infiniteQuery;
  const pages = infiniteQuery.data;
  const queryUtils = trpc.useUtils();
  const toast = useToast();

  const create = trpc.task.create.useMutation({
    onSettled: () => queryUtils.task.list.invalidate(),
  });

  const tasks = useMemo(() => pages?.pages.flatMap((page) => page.items) ?? [], [pages]);
  // Contagem global de tarefas vinda da página carregada mais recentemente
  const total = pages?.pages.at(-1)?.total;

  // Feedback de "listar": toast quando a listagem falha ao carregar (incluindo páginas extras)
  useEffect(() => {
    if (infiniteQuery.isError) {
      toast.error("Failed to load tasks. Please try again.");
    }
    // O erro dispara de novo apenas quando o estado de erro muda (o retry o volta para falso)
  }, [infiniteQuery.isError, toast]);

  const sentinelRef = useInfiniteScroll<HTMLDivElement>({
    onLoadMore: () => void fetchNextPage(),
    hasNextPage,
    isLoading: isFetchingNextPage,
  });

  async function handleCreate(values: { title: string; description?: string }) {
    try {
      await create.mutateAsync(values);
      toast.success("Task created successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save the task. Please try again.");
      throw error; // mantém os valores do formulário em caso de falha
    }
  }

  return (
    <section aria-label="Tasks" className="flex flex-col gap-8">
      <TaskForm mode="create" submitLabel="Create task" onSubmit={handleCreate} />

      {total !== undefined && tasks.length > 0 ? (
        <div className="sticky top-0 z-10 -mx-6 px-6 py-2 bg-white dark:bg-neutral-950">
          <Feedback kind="info">
            Showing {tasks.length} of {total} tasks
          </Feedback>
        </div>
      ) : null}

      {tasks.length === 0 && !hasNextPage ? (
        <Feedback kind="info">No tasks yet. Create the first one above.</Feedback>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      {isFetchingNextPage ? (
        <Feedback kind="info">Loading more tasks…</Feedback>
      ) : hasNextPage ? (
        <div ref={sentinelRef} aria-hidden="true" />
      ) : null}
    </section>
  );
}

export function TaskListSkeleton() {
  return (
    <div aria-hidden="true" className="flex w-full flex-col gap-3">
      {[0, 1, 2].map((index) => (
        <div key={index} className="h-24 w-full animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />
      ))}
    </div>
  );
}

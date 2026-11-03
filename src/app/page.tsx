import { Suspense } from "react";
import { HydrateClient, trpc } from "@/trpc/server";
import { TaskList, TaskListSkeleton } from "@/components/task/TaskList";

// A lista vive na memória do processo do servidor: renderizar a cada requisição
// mantém os dados do SSR frescos (a especificação exige a listagem pré-carregada no servidor).
export const dynamic = "force-dynamic";

export default async function Home() {
  // Pré-carrega apenas a primeira página, no formato INFINITE — isso mantém
  // o markup do SSR em sincronia com a chave de cache do useInfiniteQuery do cliente
  // (o prefetch comum desidrata uma entrada {type:"query"}, que o hook de
  // scroll infinito nunca casaria, causando um flash de lista vazia após a hidratação).
  await trpc.task.list.prefetchInfinite(
    { limit: 10 },
    { getNextPageParam: (lastPage) => lastPage.nextCursor, pages: 1 },
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Task Manager</h1>
        <p className="text-neutral-600 dark:text-neutral-400">
          Manage your tasks — create, edit, delete and keep track of them in one place.
        </p>
      </header>
      <HydrateClient>
        <Suspense fallback={<TaskListSkeleton />}>
          <TaskList />
        </Suspense>
      </HydrateClient>
    </main>
  );
}

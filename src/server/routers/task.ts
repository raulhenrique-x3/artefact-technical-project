import { z } from "zod";
import { publicProcedure, router } from "../trpc";
import * as taskStore from "../store/task-store";

export const taskInputSchema = z.object({
  title: z.string().trim().min(1, "Title is required."),
  description: z.string().trim().optional(),
});

// Input de paginação para task.list — ver docs/task-manager/decisions/001-infinite-scroll-pagination.md
export const listTaskInputSchema = z.object({
  limit: z.number().int().min(1).max(50).default(10),
  // Cursor = o id do último item da página anterior. Omita na página 1.
  cursor: z.string().min(1).optional(),
});

export const taskRouter = router({
  list: publicProcedure.input(listTaskInputSchema).query(({ input }) => {
    const all = taskStore.list();
    // Cursor baseado em id: estável mesmo com exclusões no meio da lista (o offset deslocaria).
    // Se o id do cursor foi excluído entre carregamentos de página, degradamos para a página 1.
    if (all.length === 0) {
      return { items: [], nextCursor: null, total: 0 };
    }
    const cursorMatch = input.cursor
      ? all.findIndex((task) => task.id === input.cursor)
      : -1;
    const start = cursorMatch >= 0 ? cursorMatch + 1 : 0;
    const items = all.slice(start, start + input.limit);
    const hasNextPage = start + items.length < all.length;
    return {
      items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
      // Contagem global, O(1) — permite à UI exibir "Mostrando X de Y tarefas"
      total: all.length,
    };
  }),
  create: publicProcedure.input(taskInputSchema).mutation(({ input }) => taskStore.create(input)),
  update: publicProcedure
    .input(taskInputSchema.extend({ id: z.string().min(1) }))
    .mutation(({ input }) => taskStore.update(input.id, input)),
  delete: publicProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(({ input }) => taskStore.remove(input.id)),
});

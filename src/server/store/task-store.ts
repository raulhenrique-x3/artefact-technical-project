import { TRPCError } from "@trpc/server";

export interface Task {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
}

export interface TaskInput {
  title: string;
  description?: string;
}

// Armazena as tarefas em memória, sem persistência em banco de dados,
// conforme definido na especificação.
const globalForStore = globalThis as unknown as {
  __taskManagerStore?: Map<string, Task>;
};

// Mantém o mesmo Map entre recarregamentos do módulo durante o HMR,
// evitando que as tarefas sejam perdidas a cada atualização.
const tasks = (globalForStore.__taskManagerStore ??= new Map<string, Task>());

export function list(): Task[] {
  // Mais recentes primeiro: a última tarefa criada aparece no topo da listagem
  return [...tasks.values()].reverse();
}

export function create(input: TaskInput): Task {
  const task: Task = {
    id: crypto.randomUUID(),
    title: input.title,
    description: input.description || undefined,
    createdAt: new Date(),
  };
  tasks.set(task.id, task);
  return task;
}

export function update(id: string, input: TaskInput): Task {
  const existing = tasks.get(id);
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
  }
  existing.title = input.title;
  existing.description = input.description || undefined;
  return existing;
}

export function remove(id: string): Task {
  const existing = tasks.get(id);
  if (!existing) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Task not found." });
  }
  tasks.delete(id);
  return existing;
}

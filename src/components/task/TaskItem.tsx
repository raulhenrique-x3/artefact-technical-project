"use client";

import { useState } from "react";
import type { Task } from "@/server/store/task-store";
import { trpc } from "@/trpc/react";
import { useToast } from "@/components/ui/Toast";
import { TaskForm } from "./TaskForm";

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const queryUtils = trpc.useUtils();
  const toast = useToast();

  const update = trpc.task.update.useMutation({
    onSuccess: () => setEditing(false),
    onSettled: () => queryUtils.task.list.invalidate(),
  });

  const remove = trpc.task.delete.useMutation({
    onSettled: () => queryUtils.task.list.invalidate(),
  });

  if (editing) {
    return (
      <TaskForm
        mode="edit"
        initial={{ title: task.title, description: task.description }}
        submitLabel="Save changes"
        onCancel={() => setEditing(false)}
        onSubmit={async (values) => {
          try {
            await update.mutateAsync({ id: task.id, ...values });
            toast.success("Task updated successfully.");
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Could not save the task. Please try again.");
            throw error; // mantém os valores do formulário em caso de falha
          }
        }}
      />
    );
  }

  return (
    <li className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-700">
      <div className="flex flex-col gap-1">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">{task.title}</h3>
        {task.description ? (
          <p className="text-sm whitespace-pre-line text-neutral-600 dark:text-neutral-400">{task.description}</p>
        ) : null}
        <p className="text-xs text-neutral-400">
          Created at {task.createdAt.toLocaleString("en-US", { dateStyle: "short", timeStyle: "short" })}
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          disabled={remove.isPending}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            remove
              .mutateAsync({ id: task.id })
              .then(() => toast.success("Task deleted."))
              .catch((error) =>
                toast.error(error instanceof Error ? error.message : "Could not delete the task. Please try again."),
              );
          }}
          disabled={remove.isPending}
          aria-label={`Delete task "${task.title}"`}
          className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
        >
          {remove.isPending ? "Deleting…" : "Delete"}
        </button>
      </div>
    </li>
  );
}

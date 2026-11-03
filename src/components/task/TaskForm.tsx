"use client";

import { useRef, useState, type SubmitEvent } from "react";
import { useToast } from "@/components/ui/Toast";

export interface TaskFormValues {
  title: string;
  description?: string;
}

interface TaskFormProps {
  mode: "create" | "edit";
  /** Valores iniciais usados no modo de edição. Omita no formulário de criação. */
  initial?: { title: string; description?: string };
  submitLabel: string;
  /**
   * Deve rejeitar em caso de falha — o formulário mantém os valores digitados quando rejeitado.
   * Quem consome o componente exibe o feedback (toast de sucesso/erro); o formulário apenas valida.
   */
  onSubmit: (values: TaskFormValues) => Promise<unknown>;
  onCancel?: () => void;
}

const fieldStyles =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-neutral-400";

export function TaskForm({ mode, initial, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [pending, setPending] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.warning("Title is required.");
      titleRef.current?.focus();
      return;
    }

    setPending(true);
    try {
      const cleanDescription = description.trim();
      await onSubmit({
        title: cleanTitle,
        ...(cleanDescription ? { description: cleanDescription } : {}),
      });
      if (mode === "create") {
        setTitle("");
        setDescription("");
      }
    } catch {
      // O feedback de falha é exibido por quem consome o componente (toast); mantém os valores digitados.
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        ref={titleRef}
        id="title"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Title (required)"
        aria-label="Task title"
        maxLength={120}
        className={fieldStyles}
      />
      <textarea
        id="description"
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder="Description (optional)"
        aria-label="Task description"
        rows={3}
        className={`${fieldStyles} resize-y`}
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {pending ? "Saving…" : submitLabel}
        </button>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            disabled={pending}
            className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}

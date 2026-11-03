import type { ReactNode } from "react";

const kindStyles = {
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
  error:
    "border-red-300 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300",
  info: "border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
} as const;

interface FeedbackProps {
  kind: keyof typeof kindStyles;
  children: ReactNode;
}

export function Feedback({ kind, children }: FeedbackProps) {
  return (
    <div role={kind === "error" ? "alert" : "status"} className={`rounded-md border px-3 py-2 text-sm ${kindStyles[kind]}`}>
      {children}
    </div>
  );
}

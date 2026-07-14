import type { ReactNode } from "react";

type Tone = "neutral" | "warn" | "info" | "success" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground ring-border",
  warn: "bg-amber-500/10 text-amber-700 ring-amber-500/20",
  info: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/20",
  danger: "bg-destructive/10 text-destructive ring-destructive/20",
};

export function StatusBadge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ring-1 " +
        toneClasses[tone]
      }
    >
      <span className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}

export function SectionCard({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="bg-card ring-1 ring-border rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
        {label}
      </span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
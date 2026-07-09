import { type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1 block">
        {label}
      </label>
      {children}
      {hint ? <p className="text-[11px] text-muted-foreground ml-1">{hint}</p> : null}
    </div>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const { className = "", ...rest } = props;
  return (
    <input
      {...rest}
      className={
        "w-full bg-card ring-1 ring-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-primary focus:ring-2 " +
        className
      }
    />
  );
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const { className = "", ...rest } = props;
  return (
    <textarea
      {...rest}
      className={
        "w-full bg-card ring-1 ring-border rounded-xl px-4 py-3 text-sm outline-none transition-all focus:ring-primary focus:ring-2 resize-none " +
        className
      }
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-card ring-1 ring-border rounded-xl px-4 py-3 pr-10 text-sm outline-none focus:ring-primary focus:ring-2"
      >
        <option value="" disabled>
          {placeholder ?? "Sélectionner…"}
        </option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
        ▾
      </span>
    </div>
  );
}

export function SegmentedToggle<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <div className="bg-muted p-1 rounded-xl flex">
      {options.map((o) => {
        const active = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={
              "flex-1 py-2.5 px-3 text-xs font-bold rounded-lg transition-all " +
              (active ? "bg-card shadow-sm text-foreground" : "text-muted-foreground")
            }
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function YesNo({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <SegmentedToggle<"yes" | "no">
      value={value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
      options={[
        { id: "yes", label: "Oui" },
        { id: "no", label: "Non" },
      ]}
    />
  );
}

export function SectionTitle({ children, aside }: { children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex items-end justify-between">
      <h4 className="text-xs font-bold uppercase tracking-widest">{children}</h4>
      {aside}
    </div>
  );
}

export function RouteSchema({ from, to }: { from: string; to: string }) {
  return (
    <div className="relative py-6 px-4 bg-card ring-1 ring-border rounded-2xl overflow-hidden">
      <div className="flex justify-between items-center relative z-10 gap-2">
        <div className="text-center min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-tighter">
            Départ
          </p>
          <p className="text-sm font-bold truncate">{from || "—"}</p>
        </div>
        <div className="flex-1 px-2 shrink-0">
          <div className="h-px bg-border w-full relative">
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 size-2 bg-primary rounded-full" />
          </div>
        </div>
        <div className="text-center min-w-0 flex-1">
          <p className="text-[10px] text-muted-foreground mb-1 uppercase font-bold tracking-tighter">
            Arrivée
          </p>
          <p className="text-sm font-bold truncate">{to || "—"}</p>
        </div>
      </div>
    </div>
  );
}
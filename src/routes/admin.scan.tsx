import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Zap, Image as ImageIcon, Keyboard, ScanLine, Sparkles } from "lucide-react";
import { SCAN_SCENARIOS } from "@/features/admin/matching";
import { scanStore } from "@/features/admin/scanStore";

export const Route = createFileRoute("/admin/scan")({
  component: ScanScreen,
});

function ScanScreen() {
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState<null | "with" | "without">(null);

  function simulate(kind: "with" | "without") {
    setAnalyzing(kind);
    const ocr =
      kind === "with" ? SCAN_SCENARIOS.withTracking() : SCAN_SCENARIOS.withoutTracking();
    scanStore.setScan(ocr);
    setTimeout(() => {
      navigate({ to: "/admin/scan/match" });
    }, 1500);
  }

  return (
    <div className="min-h-full bg-foreground text-background pb-24 relative">
      {/* Top bar */}
      <div className="pt-10 px-5 pb-4 flex items-center justify-between">
        <Link
          to="/admin"
          className="size-9 rounded-full bg-background/10 grid place-items-center"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
          Réception colis
        </p>
        <button className="size-9 rounded-full bg-background/10 grid place-items-center">
          <Zap className="size-4" />
        </button>
      </div>

      {/* Viewfinder */}
      <div className="mx-5 aspect-[3/4] relative rounded-3xl overflow-hidden bg-gradient-to-b from-background/5 to-background/0">
        {/* Corners */}
        <div className="absolute inset-6 border-2 border-primary rounded-2xl">
          <span className="absolute -top-1 -left-1 size-6 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
          <span className="absolute -top-1 -right-1 size-6 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
          <span className="absolute -bottom-1 -left-1 size-6 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
          <span className="absolute -bottom-1 -right-1 size-6 border-b-4 border-r-4 border-primary rounded-br-2xl" />
          {/* Laser line */}
          <div className="absolute left-4 right-4 h-0.5 bg-primary shadow-[0_0_20px_var(--primary)] animate-pulse top-1/2" />
        </div>

        {analyzing ? (
          <div className="absolute inset-0 bg-foreground/70 backdrop-blur-sm grid place-items-center">
            <div className="text-center space-y-2">
              <Sparkles className="size-8 mx-auto text-primary animate-pulse" />
              <p className="text-sm font-bold">Analyse IA du bordereau…</p>
              <p className="text-[11px] opacity-70">Extraction nom, poids, tracking</p>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-4 left-0 right-0 text-center text-[11px] opacity-70">
            Cadrez le bordereau du colis
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="px-5 mt-5 grid grid-cols-3 gap-3">
        <ControlBtn icon={ImageIcon} label="Galerie" />
        <button
          type="button"
          disabled={analyzing !== null}
          className="size-16 mx-auto rounded-full bg-background text-foreground grid place-items-center ring-4 ring-background/30 disabled:opacity-50"
        >
          <ScanLine className="size-7" strokeWidth={2.5} />
        </button>
        <ControlBtn icon={Keyboard} label="Manuel" />
      </div>

      {/* Simulation panel */}
      <div className="mx-5 mt-6 bg-background/10 ring-1 ring-background/20 rounded-2xl p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
          Mode prototype · scénarios
        </p>
        <button
          type="button"
          disabled={analyzing !== null}
          onClick={() => simulate("with")}
          className="w-full bg-primary text-primary-foreground font-bold text-sm rounded-xl py-3 disabled:opacity-50"
        >
          Simuler scan · bordereau avec tracking
        </button>
        <button
          type="button"
          disabled={analyzing !== null}
          onClick={() => simulate("without")}
          className="w-full bg-background/10 ring-1 ring-background/30 text-background font-bold text-sm rounded-xl py-3 disabled:opacity-50"
        >
          Simuler scan · sans numéro de suivi
        </button>
      </div>
    </div>
  );
}

function ControlBtn({ icon: Icon, label }: { icon: typeof ScanLine; label: string }) {
  return (
    <button
      type="button"
      className="flex flex-col items-center gap-1 text-background/70"
    >
      <span className="size-11 rounded-full bg-background/10 grid place-items-center">
        <Icon className="size-5" />
      </span>
      <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
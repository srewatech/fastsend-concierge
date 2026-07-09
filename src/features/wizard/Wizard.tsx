import { useState } from "react";
import type { WizardState } from "./types";
import { initialWizardState } from "./state";
import {
  ContactStep,
  ServiceStep,
  DetailsStep,
  PaymentStep,
  SummaryStep,
  ConfirmationStep,
} from "./steps";

const STEPS = ["Contact", "Besoin", "Détails", "Paiement", "Récap", "Confirmation"] as const;

export function Wizard() {
  const [state, setState] = useState<WizardState>(initialWizardState);
  const step = state.step;
  const total = STEPS.length;

  const canNext = (): boolean => {
    if (step === 1) return !!state.contact.firstName && !!state.contact.email;
    if (step === 2) return !!state.serviceId;
    return true;
  };

  const next = () => setState((s) => ({ ...s, step: Math.min(total, s.step + 1) }));
  const prev = () => setState((s) => ({ ...s, step: Math.max(1, s.step - 1) }));
  const goto = (n: number) => setState((s) => ({ ...s, step: n }));

  const showFooter = step < total;
  const primaryLabel = step === 5 ? "Confirmer l'expédition" : step === total ? "" : "Continuer";
  const primaryAction = step === 5 ? () => next() : next;

  return (
    <div className="mx-auto max-w-[440px] min-h-screen bg-background text-foreground pb-40">
      {/* Stepper header */}
      <nav className="sticky top-0 z-40 bg-background/85 backdrop-blur-md border-b border-border px-5 py-4">
        <div className="flex justify-between items-center mb-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            FastSends / Nouvelle demande
          </span>
          <span className="text-[10px] font-bold font-mono">
            {String(step).padStart(2, "0")} — {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="flex gap-1.5 h-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={
                "flex-1 rounded-full transition-colors " +
                (i < step ? "bg-primary" : "bg-border")
              }
            />
          ))}
        </div>
        {step > 1 && step < total ? (
          <button
            type="button"
            onClick={prev}
            className="mt-3 text-[11px] font-bold text-muted-foreground hover:text-foreground"
          >
            ← Étape précédente
          </button>
        ) : null}
      </nav>

      <main className="p-5">
        {step === 1 && <ContactStep state={state} setState={setState} />}
        {step === 2 && <ServiceStep state={state} setState={setState} />}
        {step === 3 && <DetailsStep state={state} setState={setState} />}
        {step === 4 && <PaymentStep state={state} setState={setState} />}
        {step === 5 && <SummaryStep state={state} onEdit={goto} />}
        {step === 6 && <ConfirmationStep state={state} />}
      </main>

      {showFooter ? (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-4 pointer-events-none">
          <div className="pointer-events-auto bg-foreground text-background rounded-3xl p-4 shadow-2xl space-y-3 ring-1 ring-white/10">
            {state.serviceId && step >= 3 ? (
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
                  Tarification
                </p>
                <p className="text-xs opacity-70 leading-snug">
                  Le montant final est confirmé par un admin FastSends après vérification.
                </p>
              </div>
            ) : null}
            <button
              type="button"
              disabled={!canNext()}
              onClick={primaryAction}
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed text-primary-foreground font-bold py-4 rounded-xl transition-all active:scale-[0.98]"
            >
              {primaryLabel}
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] p-4">
          <button
            type="button"
            onClick={() => setState(initialWizardState)}
            className="w-full bg-foreground text-background font-bold py-4 rounded-xl"
          >
            Créer une nouvelle demande
          </button>
        </div>
      )}
    </div>
  );
}
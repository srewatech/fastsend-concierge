import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

function isSafeRelative(next: string | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/") || next.startsWith("//")) return "/";
  return next;
}

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    next: typeof s.next === "string" ? s.next : "/",
  }),
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      throw redirect({ href: isSafeRelative(search.next) });
    }
  },
  component: AuthPage,
});

function AuthPage() {
  const { next } = Route.useSearch();
  const navigate = useNavigate();
  const safeNext = isSafeRelative(next);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      if (session) navigate({ href: safeNext });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, safeNext]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === "signup") {
        const emailRedirectTo = window.location.origin + safeNext;
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo },
        });
        if (err) throw err;
        setInfo(
          "Compte créé. Si la confirmation par email est activée, vérifie ta boîte mail avant de te connecter.",
        );
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'authentification");
    } finally {
      setBusy(false);
    }
  }

  const title = mode === "signin" ? "Connexion" : "Créer un compte";
  const subtitle =
    mode === "signin"
      ? "Bienvenue sur FastSends"
      : "Rejoins FastSends dès maintenant";

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                <path d="M14 6h3.2a2 2 0 0 1 1.79 1.11l2.6 5.21A2 2 0 0 1 22 13.14V18a2 2 0 0 1-2 2h-7" />
                <path d="M18 22v-2.8a2 2 0 0 0-1.1-1.79l-2.5-1.25A2 2 0 0 0 12 16v3" />
                <circle cx="7" cy="18" r="2" />
                <circle cx="17" cy="18" r="2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">FastSends</h1>
              <p className="text-sm text-muted-foreground">Logistique express</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemple@email.com"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-base outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-ring/20"
              />
            </div>

            {error ? (
              <div
                className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                role="alert"
              >
                {error}
              </div>
            ) : null}
            {info ? (
              <div className="rounded-lg bg-muted px-3 py-2.5 text-sm text-muted-foreground">
                {info}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-primary px-4 py-3.5 text-base font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60 active:scale-[0.99]"
            >
              {busy ? "Chargement…" : mode === "signin" ? "Se connecter" : "Créer un compte"}
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "signin" ? "signup" : "signin");
              setError(null);
              setInfo(null);
            }}
            className="mt-4 w-full text-center text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {mode === "signin" ? (
              <>
                Pas encore de compte ?{" "}
                <span className="text-primary">S'inscrire</span>
              </>
            ) : (
              <>
                Déjà un compte ? <span className="text-primary">Se connecter</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="px-6 pb-8 pt-2">
        <a
          href="mailto:support@fastsends.com?subject=Demande%20d'aide%20-%20FastSends"
          className="mx-auto flex w-full max-w-sm items-center justify-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-card-foreground transition-colors hover:bg-accent active:scale-[0.99]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          Contacter le support
        </a>
      </div>
    </main>
  );
}

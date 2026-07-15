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

  return (
    <main className="min-h-screen grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-sm bg-card ring-1 ring-border rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold">FastSends</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {mode === "signin" ? "Connecte-toi à ton compte." : "Crée un compte FastSends."}
        </p>

        <form onSubmit={submit} className="mt-5 space-y-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg ring-1 ring-border bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Mot de passe
            </label>
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg ring-1 ring-border bg-background px-3 py-2 text-sm"
            />
          </div>
          {error ? (
            <p className="text-xs text-destructive" role="alert">
              {error}
            </p>
          ) : null}
          {info ? <p className="text-xs text-muted-foreground">{info}</p> : null}
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-foreground text-background rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {busy ? "…" : mode === "signin" ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
            setInfo(null);
          }}
          className="mt-4 text-xs text-muted-foreground hover:text-foreground w-full text-center"
        >
          {mode === "signin"
            ? "Pas de compte ? Créer un compte"
            : "Déjà un compte ? Se connecter"}
        </button>
      </div>
    </main>
  );
}
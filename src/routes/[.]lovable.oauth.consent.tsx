import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type OAuthClient = { name?: string; client_id?: string; redirect_uri?: string } | null;
type AuthorizationDetails = {
  client?: OAuthClient;
  redirect_url?: string;
  redirect_to?: string;
  scope?: string;
  scopes?: string[];
} | null;

type AuthOAuth = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{
    data: { redirect_url?: string; redirect_to?: string } | null;
    error: { message: string } | null;
  }>;
};

function oauthApi(): AuthOAuth {
  return (supabase.auth as unknown as { oauth: AuthOAuth }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) {
      throw new Error("Missing authorization_id");
    }
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) {
      throw redirect({ to: "/auth", search: { next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId =
      new URLSearchParams(location.search).get("authorization_id") ?? "";
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) {
      throw redirect({ href: immediate });
    }
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <main className="min-h-screen grid place-items-center px-4 py-10 text-center">
      <div>
        <h1 className="text-lg font-bold">Impossible de charger la demande d'autorisation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {String((error as Error)?.message ?? error)}
        </p>
      </div>
    </main>
  ),
});

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.name ?? "une application externe";
  const redirectUri = details?.client?.redirect_uri;
  const scopes =
    details?.scopes ??
    (details?.scope ? details.scope.split(/\s+/).filter(Boolean) : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error: err } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (err) {
      setBusy(false);
      setError(err.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("Aucune URL de redirection fournie par le serveur d'autorisation.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="min-h-screen grid place-items-center bg-background px-4 py-10">
      <div className="w-full max-w-md bg-card ring-1 ring-border rounded-2xl p-6 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
          Autorisation
        </p>
        <h1 className="mt-1 text-xl font-bold">
          Connecter {clientName} à FastSends
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {clientName} pourra utiliser les outils FastSends en ton nom, tant que
          tu restes connecté(e).
        </p>

        {redirectUri ? (
          <div className="mt-4 rounded-lg bg-muted/40 ring-1 ring-border px-3 py-2 text-xs break-all">
            <span className="text-muted-foreground">Redirection : </span>
            {redirectUri}
          </div>
        ) : null}

        {scopes.length > 0 ? (
          <div className="mt-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Permissions demandées
            </p>
            <ul className="mt-2 space-y-1 text-sm">
              {scopes.map((s: string) => (
                <li key={s} className="rounded-md bg-muted/40 px-2 py-1">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <p className="mt-4 text-[11px] text-muted-foreground">
          Cela ne contourne pas les règles d'accès de FastSends.
        </p>

        {error ? (
          <p className="mt-3 text-xs text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-6 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(false)}
            className="bg-card ring-1 ring-border rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            Refuser
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => decide(true)}
            className="bg-foreground text-background rounded-lg px-4 py-2.5 text-sm font-bold disabled:opacity-60"
          >
            {busy ? "…" : "Autoriser"}
          </button>
        </div>
      </div>
    </main>
  );
}
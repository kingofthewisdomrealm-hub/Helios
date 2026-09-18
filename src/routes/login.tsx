import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";

export const Route = createFileRoute("/login")({
  component: Login,
  head: () => ({
    meta: [{ title: "Helios — Sign in" }],
  }),
});

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-fg">
      <div className="w-full max-w-sm space-y-5">
        <p className="text-[11px] uppercase tracking-[0.28em] text-subtle">Helios</p>
        <h1 className="font-display text-4xl leading-none tracking-tight">Keep a birth</h1>
        <p className="text-sm leading-relaxed text-muted">
          Sign in so the sentence stays: if you were born in this dirt on this day, you should go there.
        </p>
        {authEnabled ? (
          <div className="flex flex-col gap-2">
            {GROK_PROVIDERS.map((p) => (
              <button
                key={p.providerId}
                type="button"
                onClick={() => signIn(p.providerId, { callbackURL: "/" })}
                className="h-12 w-full rounded-md border border-border bg-bg-elevated px-4 text-sm text-fg hover:bg-bg-subtle"
              >
                Continue with {p.label}
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-subtle">Sign-in is disabled.</p>
        )}
        <Link to="/" className="block text-center text-sm text-muted hover:text-fg">
          Back to the sky
        </Link>
      </div>
    </main>
  );
}

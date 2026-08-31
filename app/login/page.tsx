"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { GoogleSignInButton } from "@/components/GoogleSignInButton";
import { Logo } from "@/components/Logo";
import { useI18n } from "@/lib/locale";
import { normalizeUser } from "@/lib/auth";
import { syncCurrentGoogleUser } from "@/lib/db";
import { completeGoogleRedirect, signOutFirebase } from "@/lib/firebase";
import { getUser, setUser, transferInvitations } from "@/lib/store";
import type { PlanId } from "@/lib/types";

function LoginInner() {
  const { t } = useI18n();
  const router = useRouter();
  const search = useSearchParams();
  const plan = (search.get("plan") as PlanId | null) || null;
  const forceGoogle = search.get("google") === "1" || Boolean(plan && plan !== "free");

  const [name, setName] = useState("");
  const [role, setRole] = useState<"host" | "designer">("host");
  const [error, setError] = useState("");

  const finish = useCallback(
    async (auth: "name" | "google", profile: { id?: string; name: string; email?: string; picture?: string }) => {
      if (auth === "name") await signOutFirebase();
      const extra = new URLSearchParams(sessionStorage.getItem("chakyru-login-search") || "");
      sessionStorage.removeItem("chakyru-login-search");
      const planId = plan || (extra.get("plan") as PlanId | null);
      const from = search.get("from") || extra.get("from");
      const prev = getUser();
      const user = normalizeUser({
        ...prev,
        ...profile,
        auth,
        role: auth === "name" ? role : prev?.role ?? "host",
        plan: prev?.plan ?? "free",
      });
      if (auth === "name") user.plan = "free";
      if (auth === "google" && prev && prev.id !== user.id) {
        transferInvitations(prev.id, user.id);
      }
      setUser(user);
      if (auth === "google") {
        await Promise.race([
          syncCurrentGoogleUser(),
          new Promise((resolve) => window.setTimeout(resolve, 4000)),
        ]).catch(() => null);
      }
      const dest = search.get("next") || extra.get("next") || "";
      const safeNext =
        dest.startsWith("/") && !dest.startsWith("//") && !dest.startsWith("/login") ? dest : "";
      if (safeNext) {
        window.location.replace(safeNext);
        return;
      }
      if (planId && planId !== "free") {
        const q = new URLSearchParams({ pay: planId });
        if (from) q.set("from", from);
        window.location.replace(`/pricing?${q.toString()}`);
        return;
      }
      window.location.replace("/");
    },
    [plan, role, router, search],
  );

  useEffect(() => {
    const existing = getUser();
    if (existing) {
      const next = search.get("next") || "";
      const dest =
        next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/login") ? next : "/";
      void (async () => {
        if (existing.auth === "google") {
          await Promise.race([
            syncCurrentGoogleUser(),
            new Promise((resolve) => window.setTimeout(resolve, 4000)),
          ]).catch(() => null);
        }
        window.location.replace(dest);
      })();
      return;
    }
    const err = search.get("err");
    if (err) setError(t.login.googleFail);
    void completeGoogleRedirect()
      .then((profile) => {
        if (profile) return finish("google", profile);
      })
      .catch(() => setError(t.login.googleFail));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-page px-4 py-10">
      <div className="w-full max-w-[420px] px-2 py-12">
        <Logo className="mx-auto h-28 w-auto" />
        <h1 className="font-serif mt-6 text-center text-5xl uppercase tracking-[0.04em] text-ink">{t.login.title}</h1>
        <p className="mt-4 text-center text-sm leading-7 tracking-wide text-ink-soft">{t.login.desc}</p>
        {forceGoogle ? (
          <p className="mt-3 text-center text-sm text-rose">{t.login.planNeedGoogle}</p>
        ) : null}
        {error ? <p className="mt-3 text-center text-sm text-rose">{error}</p> : null}
        {error === t.login.googleDomain ? (
          <p className="mt-2 text-center">
            <a href="https://chakyru.vercel.app/login" className="text-sm underline underline-offset-4">
              chakyru.vercel.app/login
            </a>
          </p>
        ) : null}

        <div className="mt-10">
          <GoogleSignInButton
            onProfile={(p) => finish("google", p)}
            onError={(code) =>
              setError(
                code === "config"
                  ? t.login.googleNeedConfig
                  : code === "auth/unauthorized-domain"
                    ? t.login.googleDomain
                    : `${t.login.googleFail}${code !== "unknown" ? ` (${code})` : ""}`,
              )
            }
          />
          <p className="mt-2 text-center text-xs text-ink-soft">{t.login.googleHint}</p>
          {typeof window !== "undefined" &&
          (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") ? (
            <p className="mt-3 text-center text-[12px] leading-5 text-rose">{t.login.googleChrome}</p>
          ) : null}
          <p className="mt-3 text-center text-[12px] leading-5 text-meta">
            {t.login.terms.split(t.login.termsLink)[0]}
            <Link href="/terms" className="underline">
              {t.login.termsLink}
            </Link>
            {t.login.terms.split(t.login.termsLink)[1] ?? ""}
          </p>
        </div>

        {!forceGoogle ? (
          <>
            <div className="my-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-meta">
              <span className="h-px flex-1 bg-ink/10" />
              {t.login.or}
              <span className="h-px flex-1 bg-ink/10" />
            </div>
            <p className="mb-3 text-center text-xs text-ink-soft">{t.login.nameHint}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!name.trim()) return;
                if (plan && plan !== "free") {
                  setError(t.login.planNeedGoogle);
                  return;
                }
                void finish("name", { name: name.trim() });
              }}
            >
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t.login.name}
                className="w-full border border-ink/15 bg-transparent px-3 py-2.5 text-sm"
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("host")}
                  className={`py-2.5 text-sm ${role === "host" ? "bg-forest text-cream" : "border border-ink/10"}`}
                >
                  {t.login.host}
                </button>
                <button
                  type="button"
                  onClick={() => setRole("designer")}
                  className={`py-2.5 text-sm ${role === "designer" ? "bg-forest text-cream" : "border border-ink/10"}`}
                >
                  {t.login.designer}
                </button>
              </div>
              <button type="submit" className="mt-4 w-full border border-ink/20 py-3 text-sm">
                {t.login.go}
              </button>
            </form>
          </>
        ) : null}

        <Link href="/" className="mt-10 flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.14em] text-meta">
          <ArrowLeft size={16} />
          {t.login.home}
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-svh bg-cream" />}>
      <LoginInner />
    </Suspense>
  );
}

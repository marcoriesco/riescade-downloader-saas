"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { resolveDesktopClient } from "@/lib/desktop-clients";

function validParam(value: string | null): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{43,128}$/.test(value));
}

export default function AppLoginPage() {
  const [message, setMessage] = useState("Preparando login do aplicativo...");
  const [busy, setBusy] = useState(true);
  const [callbackUrl, setCallbackUrl] = useState<string | null>(null);
  const [appName, setAppName] = useState("RIESCADE");
  const authorizationStarted = useRef(false);

  const authorize = useCallback(async () => {
    if (authorizationStarted.current) return;
    authorizationStarted.current = true;

    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    const challenge = params.get("challenge");
    let client;
    try {
      client = resolveDesktopClient(params.get("client"), params.get("redirect_uri"));
      setAppName(client.name);
    } catch {
      setMessage("Solicitação de aplicativo inválida. Volte ao aplicativo e tente novamente.");
      setBusy(false);
      return;
    }
    if (!validParam(state) || !validParam(challenge)) {
      setMessage("Solicitação de login inválida. Volte ao aplicativo e tente novamente.");
      setBusy(false);
      return;
    }

    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setMessage("Entre com sua conta Google para continuar.");
        setBusy(false);
        return;
      }

      setMessage(`Autorizando o ${client.name}...`);
      const response = await fetch("/api/app/auth/authorize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ state, challenge, client: client.id, redirectUri: client.callback }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || typeof body.callbackUrl !== "string") {
        setMessage(body.error ?? "Não foi possível autorizar o aplicativo.");
        setBusy(false);
        return;
      }
      const returnedCallback = new URL(body.callbackUrl);
      const expectedCallback = new URL(client.callback);
      if (returnedCallback.protocol !== expectedCallback.protocol ||
          returnedCallback.hostname !== expectedCallback.hostname ||
          returnedCallback.pathname !== expectedCallback.pathname ||
          returnedCallback.username || returnedCallback.password ||
          returnedCallback.port || returnedCallback.hash) {
        setMessage("O servidor retornou um aplicativo diferente. Atualize o site e tente novamente.");
        setBusy(false);
        return;
      }

      setCallbackUrl(body.callbackUrl);
      setMessage(`Login concluído! Você já pode voltar ao ${client.name}.`);
      setBusy(false);
      window.setTimeout(() => {
        window.location.assign(body.callbackUrl);
      }, 350);
    } catch (error) {
      console.error("Erro ao autorizar o aplicativo:", error);
      setMessage("Não foi possível concluir o login. Verifique sua conexão e tente novamente.");
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void authorize();
  }, [authorize]);

  const signIn = async () => {
    setBusy(true);
    const redirectTo = window.location.href;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error || !data.url) {
      setMessage("Não foi possível iniciar o login com Google.");
      setBusy(false);
      return;
    }
    window.location.assign(data.url);
  };

  return (
    <main id="main-content" tabIndex={-1} className="site-page min-h-screen bg-background text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-primary/40 bg-black/40 p-8 text-center">
        <Link href="/" className="mb-8 inline-block font-brand-condensed text-2xl font-bold">{appName}</Link>
        {callbackUrl && (
          <CheckCircle2 className="mx-auto mb-5 h-14 w-14 text-primary" />
        )}
        <h1 className="text-2xl font-bold mb-3">Entrar no {appName}</h1>
        <p role="status" aria-live="polite" className="text-foreground/80 mb-6">{message}</p>
        {!busy && message.startsWith("Entre") && (
          <button
            onClick={signIn}
            className="w-full rounded-md bg-primary px-4 py-3 font-semibold hover:bg-[#d9006e]"
          >
            Entrar com Google
          </button>
        )}
        {busy && (
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-primary/30 border-t-[#ff0884]" />
        )}
        {!busy && callbackUrl && (
          <>
            <a
              href={callbackUrl}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-semibold transition-colors hover:bg-[#d9006e]"
            >
              Abrir {appName}
              <ExternalLink className="h-4 w-4" />
            </a>
            <p className="mt-4 text-sm text-muted-foreground">
              Se o aplicativo já abriu, você pode fechar esta página.
            </p>
          </>
        )}
      </section>
    </main>
  );
}

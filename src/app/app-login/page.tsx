"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

function validParam(value: string | null): value is string {
  return Boolean(value && /^[A-Za-z0-9_-]{43,128}$/.test(value));
}

export default function AppLoginPage() {
  const [message, setMessage] = useState("Preparando login do aplicativo...");
  const [busy, setBusy] = useState(true);

  const authorize = useCallback(async () => {
    const params = new URLSearchParams(window.location.search);
    const state = params.get("state");
    const challenge = params.get("challenge");
    if (!validParam(state) || !validParam(challenge)) {
      setMessage("Solicitação de login inválida. Volte ao aplicativo e tente novamente.");
      setBusy(false);
      return;
    }

    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      setMessage("Entre com sua conta Google para continuar.");
      setBusy(false);
      return;
    }

    setMessage("Autorizando o RIESCADE...");
    const response = await fetch("/api/app/auth/authorize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${data.session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state, challenge }),
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || typeof body.callbackUrl !== "string") {
      setMessage(body.error ?? "Não foi possível autorizar o aplicativo.");
      setBusy(false);
      return;
    }
    window.location.assign(body.callbackUrl);
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
    <main className="min-h-screen bg-gray-950 text-white flex items-center justify-center p-6">
      <section className="w-full max-w-md rounded-xl border border-[#ff0884]/40 bg-black/40 p-8 text-center">
        <h1 className="text-2xl font-bold mb-3">Entrar no RIESCADE</h1>
        <p className="text-gray-300 mb-6">{message}</p>
        {!busy && message.startsWith("Entre") && (
          <button
            onClick={signIn}
            className="w-full rounded-md bg-[#ff0884] px-4 py-3 font-semibold hover:bg-[#d9006e]"
          >
            Entrar com Google
          </button>
        )}
        {busy && (
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-[#ff0884]/30 border-t-[#ff0884]" />
        )}
      </section>
    </main>
  );
}

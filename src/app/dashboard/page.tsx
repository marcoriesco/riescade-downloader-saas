"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase, type Subscription } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  // Função para buscar assinatura
  const fetchSubscription = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      } else {
        console.log("Subscription data:", data);
        setSubscription(data);
      }
    } catch (error) {
      console.error("Error in fetchSubscription:", error);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle sign in with OAuth
  const handleSignIn = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
  }, []);

  // Verificar a sessão do checkout do Stripe
  const verifyCheckoutSession = useCallback(
    async (sessionId: string) => {
      setVerifyingSession(true);
      try {
        console.log("Verificando sessão:", sessionId);
        const response = await fetch("/api/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            userId: user?.id, // Enviar o userId para a API
          }),
        });

        const responseData = await response.json();

        if (response.ok) {
          console.log("Sessão verificada com sucesso:", responseData);
          // Atualizar a subscriptionInfo após a verificação
          await fetchSubscription(user?.id || "");

          // Remover parâmetros da URL para evitar verificações repetidas
          router.replace("/dashboard");
        } else {
          console.error("Falha ao verificar sessão:", responseData.message);
          // Remover parâmetros da URL mesmo em caso de erro
          // para evitar múltiplas tentativas
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        // Remover parâmetros da URL em caso de erro
        router.replace("/dashboard");
      } finally {
        setVerifyingSession(false);
      }
    },
    [user, router, fetchSubscription]
  );

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
        await fetchSubscription(session.user.id);
      } else {
        // Redirect to auth page if not logged in
        await handleSignIn();
      }

      setLoading(false);
    };

    checkUser();
  }, [handleSignIn, fetchSubscription]);

  // Efeito para verificar a sessão quando o usuário retorna do checkout
  useEffect(() => {
    if (success && sessionId && user && !verifyingSession) {
      console.log("Sessão detectada, verificando...");
      verifyCheckoutSession(sessionId);
    } else if (success && sessionId && !verifyingSession) {
      // Se temos parâmetros de sucesso mas o usuário ainda não está disponível,
      // vamos remover os parâmetros para evitar loops de verificação
      console.log(
        "Parâmetros de sucesso encontrados, mas usuário não disponível ainda"
      );
      setTimeout(() => {
        if (!user) {
          console.log("Removendo parâmetros da URL após timeout");
          router.replace("/dashboard");
        }
      }, 5000); // 5 segundos para o usuário carregar
    }
  }, [
    success,
    sessionId,
    user,
    verifyingSession,
    router,
    verifyCheckoutSession,
  ]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  const handleCheckout = async () => {
    if (!user) return;

    // Log para depuração
    console.log(
      "Iniciando checkout com price ID:",
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
    );

    try {
      // Chamar a nova API de checkout
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1", // Valor padrão como fallback
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        console.error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
    }
  };

  const downloadProduct = () => {
    // Implement product download logic
    alert("Product download started");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-indigo-600 border-opacity-50 mx-auto"></div>
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-gray-900">
            SaaS Platform
          </Link>
          {user && (
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Sign Out
            </button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-700">
              Payment successful! Your subscription is now active.
            </p>
          </div>
        )}

        {canceled && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-700">
              Payment canceled. If you have any questions, please contact
              support.
            </p>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your subscription and download products
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {user && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-500">
                  Account Information
                </h3>
                <p className="mt-1 text-base font-medium text-gray-900">
                  {user.email}
                </p>
              </div>
            )}

            {subscription ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Subscription Status
                  </h3>
                  <p
                    className={`mt-1 text-base font-medium ${
                      subscription.status === "active"
                        ? "text-green-600"
                        : "text-orange-600"
                    }`}
                  >
                    {subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Plan</h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {subscription.plan_id || "Premium Plan"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Current Period
                  </h3>
                  <p className="mt-1 text-base font-medium text-gray-900">
                    {new Date(subscription.start_date).toLocaleDateString()} -{" "}
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0">
                  {subscription.status === "active" ? (
                    <button
                      onClick={downloadProduct}
                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Download Product
                    </button>
                  ) : (
                    <>
                      <button
                        disabled
                        className="w-full sm:w-auto bg-gray-400 text-white font-medium py-2 px-4 rounded cursor-not-allowed"
                      >
                        Download Indisponível
                      </button>
                      <button
                        onClick={handleCheckout}
                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Renovar Assinatura
                      </button>
                    </>
                  )}
                </div>

                {subscription.status !== "active" && (
                  <div className="mt-2 p-3 bg-amber-50 text-amber-800 rounded-md text-sm">
                    <p>
                      <strong>Atenção:</strong> Sua assinatura não está ativa. O
                      download só estará disponível após a renovação da sua
                      assinatura.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Active Subscription
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You currently don&apos;t have an active subscription.
                    Subscribe to get access to our products.
                  </p>
                  <button
                    onClick={handleCheckout}
                    className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

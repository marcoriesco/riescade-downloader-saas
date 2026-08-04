"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase, type Subscription } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Zap,
  Flame,
  Shield,
  User as UserIcon,
  Download,
  AlertCircle,
  XCircle,
  ExternalLink,
  Gamepad2,
  CalendarDays,
  Mail,
  Clock3,
} from "lucide-react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { CancelSubscriptionModal } from "@/components/CancelSubscriptionModal";
import { faGamepad } from "@fortawesome/free-solid-svg-icons";

const formatAccountDate = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : "Não informado";

const formatAccountDateTime = (value?: string | null) =>
  value
    ? new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(value))
    : "Não informado";

const formatAccountAge = (value?: string | null) => {
  if (!value) return "Não informado";
  const createdAt = new Date(value);
  const now = new Date();
  const months =
    (now.getFullYear() - createdAt.getFullYear()) * 12 +
    now.getMonth() -
    createdAt.getMonth();
  if (months < 1) {
    const days = Math.max(
      1,
      Math.floor((now.getTime() - createdAt.getTime()) / 86_400_000)
    );
    return `${days} ${days === 1 ? "dia" : "dias"}`;
  }
  if (months < 12) return `${months} ${months === 1 ? "mês" : "meses"}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  return remainingMonths
    ? `${years} ${years === 1 ? "ano" : "anos"} e ${remainingMonths} ${remainingMonths === 1 ? "mês" : "meses"}`
    : `${years} ${years === 1 ? "ano" : "anos"}`;
};

// Componente que usa useSearchParams
export default function DashboardClient() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [verifyingSession, setVerifyingSession] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const success = searchParams.get("success");
  const canceled = searchParams.get("canceled");
  const sessionId = searchParams.get("session_id");

  // Fetch subscription function
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
    setAuthRedirecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Erro ao iniciar login:", error);
        setAuthRedirecting(false);
      } else if (data) {
        console.log("Login iniciado com sucesso, URL:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setAuthRedirecting(false);
    }
  }, []);

  // Verify checkout session
  const verifyCheckoutSession = useCallback(
    async (sessionId: string) => {
      setVerifyingSession(true);
      try {
        console.log("Verificando sessão:", sessionId);
        const response = await fetch("/api/verify-session", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            sessionId,
            userId: user?.id,
          }),
        });

        const responseData = await response.json();

        if (response.ok) {
          console.log("Sessão verificada com sucesso:", responseData);
          await fetchSubscription(user?.id || "");
          router.replace("/dashboard");
        } else {
          console.error("Falha ao verificar sessão:", responseData.message);
          router.replace("/dashboard");
        }
      } catch (error) {
        console.error("Erro ao verificar sessão:", error);
        router.replace("/dashboard");
      } finally {
        setVerifyingSession(false);
      }
    },
    [user, router, fetchSubscription]
  );

  // Effect to check if user is authenticated
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          setUser(session.user);
          await fetchSubscription(session.user.id);
        } else {
          console.log("No authenticated user found");
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [fetchSubscription]);

  // Effect to verify session when user returns from checkout
  useEffect(() => {
    if (success && sessionId && user && !verifyingSession) {
      console.log("Sessão detectada, verificando...");
      verifyCheckoutSession(sessionId);
    } else if (success && sessionId && !verifyingSession) {
      console.log(
        "Parâmetros de sucesso encontrados, mas usuário não disponível ainda"
      );
      setTimeout(() => {
        if (!user) {
          console.log("Removendo parâmetros da URL após timeout");
          router.replace("/dashboard");
        }
      }, 5000);
    }
  }, [
    success,
    sessionId,
    user,
    verifyingSession,
    router,
    verifyCheckoutSession,
  ]);

  const handleCheckout = async () => {
    if (!user) return;

    console.log(
      "Iniciando checkout com price ID:",
      process.env.NEXT_PUBLIC_STRIPE_PRICE_ID
    );

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1",
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

  const handleOpenLink = (url: string) => {
    if (url.startsWith("/")) {
      router.push(url);
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    setCancellingSubscription(true);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscription_id,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Atualizar subscription local
        setSubscription({
          ...subscription,
          status: "canceled",
        });

        // Fechar modal
        setShowCancelModal(false);

        // Atualizar a página após um breve delay para mostrar o status atualizado
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } else {
        console.error("Erro ao cancelar assinatura:", result);
        alert(
          "Erro ao cancelar sua assinatura. Por favor, tente novamente ou entre em contato com o suporte."
        );
      }
    } catch (error) {
      console.error("Erro na requisição de cancelamento:", error);
      alert(
        "Erro ao processar sua solicitação. Por favor, verifique sua conexão e tente novamente."
      );
    } finally {
      setCancellingSubscription(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-gamer-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#ff0884] border-opacity-50 mx-auto"></div>
            <p className="text-lg text-gray-300">Verificando autenticação...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show redirecting state when auth is in progress
  if (authRedirecting) {
    return (
      <div className="flex min-h-screen flex-col bg-gamer-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#ff0884] border-opacity-50 mx-auto"></div>
            <p className="text-lg text-gray-300">
              Redirecionando para autenticação...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show "Acesso Negado" message if not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-gamer-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-black/30 rounded-lg border border-[#ff0884]/30 max-w-md">
            <Gamepad2 className="h-12 w-12 text-[#ff0884] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Área Exclusiva
            </h2>
            <p className="text-gray-300 mb-6">
              Faça login para acessar seu dashboard e desfrutar de todos os
              recursos disponíveis para membros.
            </p>
            <button
              onClick={handleSignIn}
              disabled={authRedirecting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
            >
              <FontAwesomeIcon icon={faGoogle} size="xl" className="h-4 w-4" />
              Entrar com Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard content - only shown when authenticated
  return (
    <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>

      <Header />

      {/* Modal de Cancelamento */}
      <CancelSubscriptionModal
        isOpen={showCancelModal}
        userEmail={user?.email || ""}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelSubscription}
        isSubmitting={cancellingSubscription}
      />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success && (
          <div className="mb-8 p-4 bg-green-900/20 border border-green-500/30 rounded-md backdrop-blur-sm animate-fade-in">
            <p className="text-green-400 flex items-start">
              <svg
                className="h-5 w-5 mr-2 text-green-500 mt-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
              <span>
                <span className="block mb-1">
                  Pagamento confirmado! Sua assinatura está ativa.
                </span>
                <span className="block text-sm text-green-300/80">
                  Baixe o aplicativo abaixo e entre com a mesma conta Google
                  usada na assinatura.
                </span>
              </span>
            </p>
          </div>
        )}

        {canceled && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-md backdrop-blur-sm animate-fade-in">
            <p className="text-red-400 flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
              Pagamento cancelado. Se tiver dúvidas, entre em contato com o
              suporte.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Player Profile Card */}
          <div className="xl:col-span-2 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-700 bg-gradient-to-r from-[#ff0884]/10 to-transparent flex items-center">
              <UserIcon className="w-5 h-5 text-[#ff0884] mr-2" />
              <h2 className="text-lg font-medium text-white">
                Minha Conta
              </h2>
            </div>

            <div className="p-6">
              {user && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4 border-b border-gray-700/70 pb-6">
                    <div className="w-16 h-16 rounded-full bg-[#ff0884]/15 border border-[#ff0884]/50 flex items-center justify-center shrink-0 shadow-[0_0_24px_rgba(255,8,132,0.18)]">
                      <UserIcon className="h-8 w-8 text-[#ff0884]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#ff0884]">Perfil RIESCADE</p>
                      <h3 className="truncate text-xl text-white font-bold mt-1">
                        {user.user_metadata?.full_name || "Usuário"}
                      </h3>
                      <p className="truncate text-muted-foreground text-sm">{user.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                    <div className="flex items-start gap-3 rounded-lg border border-gray-700/80 bg-black/25 p-4">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#ff0884]" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-400">Email da conta</p>
                        <p className="truncate text-sm text-white">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-700/80 bg-black/25 p-4">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#ff0884]" />
                      <div>
                        <p className="text-xs text-gray-400">Usuário desde</p>
                        <p className="text-sm text-white">
                          {formatAccountDate(user.created_at)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Há {formatAccountAge(user.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-700/80 bg-black/25 p-4">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#ff0884]" />
                      <div>
                        <p className="text-xs text-gray-400">Último acesso</p>
                        <p className="text-sm text-white">
                          {formatAccountDateTime(user.last_sign_in_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 rounded-lg border border-gray-700/80 bg-black/25 p-4">
                      <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#ff0884]" />
                      <div>
                        <p className="text-xs text-gray-400">Plano atual</p>
                        <p className="text-sm text-white">
                          {subscription?.status === "active"
                            ? "RIESCADE Membro — Ativo"
                            : "Sem assinatura ativa"}
                        </p>
                        {subscription && (
                          <p className="text-xs text-gray-500">
                            Assinante desde{" "}
                            {formatAccountDate(subscription.created_at)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Card */}
          <div className="xl:col-span-3 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-700 bg-gradient-to-r from-[#ff0884]/10 to-transparent flex items-center">
              <Shield className="w-5 h-5 text-[#ff0884] mr-2" />
              <h2 className="text-lg font-medium text-white">
                Status da Assinatura
              </h2>
            </div>

            <div className="p-6 pb-0">
              {subscription ? (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-black/35 to-[#ff0884]/5 p-5 rounded-lg border border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Plano atual</p>
                        <h3 className="text-2xl font-bold text-white mt-1">
                        RIESCADE MEMBRO
                        </h3>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium 
                        ${
                          subscription.status === "active"
                            ? "bg-green-900/50 text-green-400 border border-green-500/50"
                            : "bg-amber-900/50 text-amber-400 border border-amber-500/50"
                        }`}
                      >
                        {subscription.status === "active" ? "ATIVO" : "INATIVO"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-black/35 rounded-lg p-4 border border-gray-700/80">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Assinante desde</h4>
                        <p className="text-white font-medium">{formatAccountDate(subscription.created_at)}</p>
                      </div>
                      <div className="bg-black/35 rounded-lg p-4 border border-gray-700/80">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 mb-2">Período atual</h4>
                        <p className="text-white font-medium">
                          {new Date(subscription.start_date).toLocaleDateString()}{" "}
                          <span className="text-gray-500">—</span>{" "}
                          {new Date(subscription.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pb-4">
                    {subscription.status === "active" ? (
                      <>
                        {/* Botão Cancelar Assinatura */}
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="w-full sm:w-auto bg-gray-800 hover:bg-red-900/70 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-none focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center border border-gray-700 hover:border-red-800"
                        >
                          <XCircle className="w-5 h-5 mr-2 text-red-500" />
                          Cancelar Assinatura
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleCheckout}
                          className="w-full sm:w-auto bg-[#ff0884] hover:bg-[#ff0884]/90 text-white font-medium py-3 px-6 rounded-none focus:outline-none focus:ring-2 focus:ring-[#ff0884]/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-[0_0_15px_rgba(255,8,132,0.3)]"
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          Renovar Assinatura
                        </button>
                      </>
                    )}
                  </div>

                  {subscription.status !== "active" && (
                    <div className="p-4 bg-amber-900/20 text-amber-400 rounded-md text-sm border border-amber-500/30 !mb-6 ">
                      <p className="flex items-start">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Sua assinatura não está ativa. O download só estará
                        disponível após a renovação.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-black/30 p-6 rounded-lg border border-gray-700 text-center">
                    <Image
                      src="/images/logos.webp"
                      alt="Gaming Logo"
                      className="h-20 w-20 object-contain mx-auto mb-4"
                      width={120}
                      height={120}
                    />
                    <h3 className="text-2xl font-bold text-white mb-3">
                      VIRAR MEMBRO
                    </h3>
                    <div className="mb-4 text-center">
                      <span className="text-3xl font-bold text-white">
                        R$30
                      </span>
                      <span className="text-gray-400">/mês</span>
                    </div>
                    <p className="text-gray-300 mb-6">
                      Você ainda não tem uma assinatura ativa. Assine agora para
                      desbloquear recursos exclusivos!
                    </p>

                    <ul className="space-y-2 text-left mb-6">
                      {[
                        "Acesso a todos os jogos",
                        "Matchmaking prioritário",
                        "Equipamentos raros exclusivos",
                        "Jogos ilimitados",
                        "Torneios personalizados",
                        "Acesso ao Discord VIP",
                      ].map((feature, index) => (
                        <li
                          key={index}
                          className="flex items-center text-gray-300"
                        >
                          <svg
                            className="h-5 w-5 text-[#ff0884] mr-2 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 13l4 4L19 7"
                            ></path>
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={handleCheckout}
                      className="w-full bg-[#ff0884] hover:bg-[#ff0884]/90 text-white font-bold py-3 px-6 rounded-none focus:outline-none focus:ring-2 focus:ring-[#ff0884]/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-[0_0_15px_rgba(255,8,132,0.3)] animate-pulse-glow"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      ASSINAR AGORA
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Download Section - ATUALIZADO */}
        <div className="mt-8 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700 bg-black/30 flex items-center">
            <Download className="w-5 h-5 text-[#ff0884] mr-2" />
            <h2 className="text-lg font-medium text-white">
              Downloads Disponíveis
            </h2>
          </div>

          <div className="p-6">
            {subscription && subscription.status === "active" ? (
              <div className="space-y-8">
                {/* Banner destacado para Drive de Membro */}
                <div className="relative overflow-hidden rounded-lg border border-[#ff0884]/30 group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-[#ff0884]/30 to-blue-900/40 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <div className="absolute inset-0 bg-[url('/images/logos.webp')] bg-no-repeat bg-right-bottom opacity-10"></div>

                  <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center">
                    <div className="mb-6 sm:mb-0 sm:mr-8 flex-shrink-0 bg-black/30 p-4 rounded-full border border-[#ff0884]/50 shadow-[0_0_15px_rgba(255,8,132,0.3)]">
                      <FontAwesomeIcon
                        icon={faGamepad}
                        className="h-10 w-10 sm:h-16 sm:w-16 text-[#ff0884]"
                      />
                    </div>

                    <div className="text-center sm:text-left flex-grow">
                      <div className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#ff0884]/20 text-[#ff0884] border border-[#ff0884]/30 mb-8">
                        VERSÃO MAIS RECENTE
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Aplicativo RIESCADE OS
                      </h3>
                      <p className="text-gray-300 mb-4 max-w-2xl">
                        Baixe a versão mais recente do aplicativo e faça os
                        downloads diretamente pela biblioteca integrada.
                      </p>

                      <button
                        onClick={() =>
                          handleOpenLink("https://github.com/marcoriesco/RIESCADE-OS-ARCADE/releases/latest/download/RIESCADE_OS.7z")
                        }
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-none text-white bg-[#ff0884] hover:bg-[#ff0884]/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-colors duration-200 shadow-[0_0_10px_rgba(255,8,132,0.4)]"
                      >
                        <ExternalLink className="w-5 h-5 mr-2" />
                        Baixar versão mais recente
                      </button>
                    </div>
                  </div>
                </div>

                {/* Seção de instruções */}
                <div className="bg-black/30 rounded-lg border border-gray-700 p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <AlertCircle className="w-5 h-5 mr-2 text-[#ff0884]" />
                    Instruções para Download
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-black/20 p-4 rounded-md border border-gray-700/50">
                      <h4 className="text-lg font-medium text-white mb-2">
                        Como acessar o conteúdo:
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-gray-300">
                        <li>
                          Baixe e extraia o arquivo RIESCADE_OS.7z
                        </li>
                        <li>
                          Abra o app e acesse Configurações → Minha conta
                        </li>
                        <li>
                          Entre com a mesma conta Google usada na assinatura
                        </li>
                        <li>
                          Escolha um jogo e faça o download dentro do app
                        </li>
                        <li>
                          O botão sempre aponta para a versão mais recente publicada
                        </li>
                      </ol>
                    </div>

                    <div className="bg-[#ff0884]/10 p-4 rounded-md border border-[#ff0884]/30">
                      <h4 className="text-lg font-medium text-white mb-2">
                        Importante:
                      </h4>
                      <ul className="list-disc list-inside space-y-2 text-gray-300">
                        <li>
                          O acesso ao conteúdo é exclusivo para membros com
                          assinatura ativa
                        </li>
                        <li>Use sua conta somente em seus próprios dispositivos</li>
                        <li>Para problemas de acesso, contate o suporte</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10">
                <Flame className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-400 mb-2">
                  Acesso Bloqueado
                </h3>
                <p className="text-gray-500 mb-6">
                  Assine o plano para desbloquear o acesso a todos os downloads.
                </p>
                <button
                  onClick={handleCheckout}
                  className="px-6 py-2 bg-[#ff0884]/20 hover:bg-[#ff0884]/30 text-[#ff0884] rounded-none border border-[#ff0884]/30 transition-colors duration-200"
                >
                  Assinar agora!
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Community Section */}
        {/* ... existing code ... */}
      </main>

      <Footer />
    </div>
  );
}

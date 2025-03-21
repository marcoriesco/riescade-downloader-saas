"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { supabase, type Subscription } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { Header } from "@/components/Header";
import {
  Zap,
  Flame,
  Shield,
  User as UserIcon,
  DownloadIcon,
  AlertCircleIcon,
  XCircle,
} from "lucide-react";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { CancelSubscriptionModal } from "@/components/CancelSubscriptionModal";
import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Componente que usa useSearchParams
function DashboardContent() {
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
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
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
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1",
          userId: user.id,
          userEmail: user.email,
          userName:
            user.user_metadata?.full_name || user.user_metadata?.name || "",
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

  const downloadProduct = (downloadUrl: string) => {
    alert("Download: " + downloadUrl);
  };

  // Adicionar função para cancelar assinatura
  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    setCancellingSubscription(true);
    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscriptionId: subscription.subscription_id,
          userId: user.id,
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
          <div className="text-center p-8 bg-black/30 rounded-lg border border-red-800/50 max-w-md">
            <AlertCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-gray-300 mb-6">
              É necessário fazer login para acessar o dashboard.
            </p>
            <button
              onClick={handleSignIn}
              disabled={authRedirecting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
            >
              <FontAwesomeIcon icon={faGoogle} size="xl" className="h-4 w-4" />
              Login com Google
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
            <p className="text-green-400 flex items-center">
              <svg
                className="h-5 w-5 mr-2 text-green-500"
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
              Pagamento confirmado! Sua assinatura está ativa.
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Player Profile Card */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-700 bg-black/30 flex items-center">
              <UserIcon className="w-5 h-5 text-[#ff0884] mr-2" />
              <h2 className="text-lg font-medium text-white">
                Perfil do Jogador
              </h2>
            </div>

            <div className="p-6">
              {user && (
                <div>
                  <div className="flex flex-col items-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-[#ff0884]/20 border-2 border-[#ff0884]/50 flex items-center justify-center mb-3 animate-pulse-glow">
                      <UserIcon className="h-10 w-10 text-[#ff0884]" />
                    </div>
                    <h3 className="text-xl text-white font-bold m-1">
                      {user.user_metadata?.full_name || "User"}
                    </h3>
                    <p
                      className={`${robotoCondensed.className} text-gray-400 text-sm`}
                    >
                      {user.email}
                    </p>
                  </div>

                  <div className="mb-4">
                    <div className="text-sm font-medium text-gray-400 mb-1">
                      Temporada
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#ff0884] to-purple-500 h-2 rounded-full"
                        style={{ width: "52%" }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>2</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Card */}
          <div className="lg:col-span-2 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-700 bg-black/30 flex items-center">
              <Shield className="w-5 h-5 text-[#ff0884] mr-2" />
              <h2 className="text-lg font-medium text-white">
                Status da Assinatura
              </h2>
            </div>

            <div className="p-6 pb-0">
              {subscription ? (
                <div className="space-y-6">
                  <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white flex items-center ml-2">
                        RIESCADE MEMBRO
                      </h3>
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

                    <div className="bg-black/40 rounded-lg p-4 border border-gray-700 mb-1">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Criado em
                      </h4>
                      <p className="text-white mb-4">
                        {new Date(subscription.created_at).toLocaleDateString()}
                      </p>

                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Período atual
                      </h4>
                      <p className="text-white">
                        {new Date(subscription.start_date).toLocaleDateString()}{" "}
                        - {new Date(subscription.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-3 sm:space-y-0 pb-4">
                    {subscription.status === "active" ? (
                      <>
                        {/* Botão Cancelar Assinatura */}
                        <button
                          onClick={() => setShowCancelModal(true)}
                          className="w-full sm:w-auto bg-gray-800 hover:bg-red-900/70 text-gray-300 hover:text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 flex items-center justify-center border border-gray-700 hover:border-red-800"
                        >
                          <XCircle className="w-5 h-5 mr-2 text-red-500" />
                          Cancelar Assinatura
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={handleCheckout}
                          className="w-full sm:w-auto bg-[#ff0884] hover:bg-[#ff0884]/90 text-white font-medium py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff0884]/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-[0_0_15px_rgba(255,8,132,0.3)]"
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
                        <AlertCircleIcon className="w-5 h-5 mr-2" />
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
                      src="/images/logos.png"
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
                      className="w-full bg-[#ff0884] hover:bg-[#ff0884]/90 text-white font-bold py-3 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff0884]/50 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-[0_0_15px_rgba(255,8,132,0.3)] animate-pulse-glow"
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

        {/* Download Section */}
        <div className="mt-8 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-700 bg-black/30 flex items-center">
            <DownloadIcon className="w-5 h-5 text-[#ff0884] mr-2" />
            <h2 className="text-lg font-medium text-white">
              Downloads Disponíveis
            </h2>
          </div>

          <div className="p-6">
            {subscription && subscription.status === "active" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[
                  {
                    title: "RIESCADE DOWNLOADER",
                    image: "/images/logo.png",
                    downloadUrl: "/images/logo.png",
                    genre: "APP",
                  },
                  {
                    title: "RIESCADE BASE",
                    image: "/images/logo.png",
                    downloadUrl: "/images/logo.png",
                    genre: "EmulationStation",
                  },
                  {
                    title: "DOWNLOADER + BASE",
                    image: "/images/logo.png",
                    downloadUrl: "/images/logo.png",
                    genre: "APP",
                  },
                ].map((game, i) => (
                  <div
                    key={i}
                    className="bg-black/30 rounded-lg overflow-hidden border border-gray-700 hover:border-[#ff0884]/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(255,8,132,0.2)]"
                  >
                    <div className="aspect-video bg-gray-800 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xl font-bold text-white">
                          {game.title}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">
                          {game.genre}
                        </span>
                        <button
                          className="text-xs bg-[#ff0884]/20 hover:bg-[#ff0884]/30 text-[#ff0884] px-2 py-1 rounded border border-[#ff0884]/30 transition-colors duration-200"
                          onClick={() => downloadProduct(game.downloadUrl)}
                        >
                          DOWNLOAD
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
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
                  className="px-6 py-2 bg-[#ff0884]/20 hover:bg-[#ff0884]/30 text-[#ff0884] rounded-md border border-[#ff0884]/30 transition-colors duration-200"
                >
                  Assinar agora
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Componente principal que envolve o conteúdo com Suspense
export default function Dashboard() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col bg-gamer-dark">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#ff0884] border-opacity-50 mx-auto"></div>
              <p className="text-lg text-gray-300">Carregando...</p>
            </div>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

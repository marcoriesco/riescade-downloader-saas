"use client";

import { useState, useEffect } from "react";
import { supabase, type Subscription } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import Image from "next/image";
import platformsData from "@/data/platforms.json";
import { Search, Flame } from "lucide-react";

import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function PlatformsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRedirecting, setAuthRedirecting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  // Fetch subscription function
  const fetchSubscription = async (userId: string) => {
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
    }
  };

  // Verificar autenticação
  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          setUser(session.user);
          await fetchSubscription(session.user.id);
        } else {
          console.log("Redirecionando para login (sem sessão)");
          router.push("/");
          return;
        }
      } catch (error) {
        console.error("Erro verificando sessão:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  // Handle sign in with OAuth
  const handleSignIn = async () => {
    setAuthRedirecting(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/platforms`,
        },
      });
    } catch (error) {
      console.error("Error signing in:", error);
      setAuthRedirecting(false);
    }
  };

  // Handle checkout para renovar assinatura
  const handleCheckout = async () => {
    if (!user) return;

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
        }),
      });

      const session = await response.json();

      if (session.url) {
        window.location.href = session.url;
      }
    } catch (error) {
      console.error("Error during checkout:", error);
    }
  };

  // Filtrar plataformas com base no termo de pesquisa e ordenar alfabeticamente
  const filteredPlatforms = platformsData
    .filter((platform) =>
      platform.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.fullName.localeCompare(b.fullName));

  // Loading state
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

  // Redirecting state
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

  // Not authenticated
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col bg-gamer-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8 bg-black/30 rounded-lg border border-red-800/50 max-w-md">
            <div className="h-12 w-12 text-red-500 mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Acesso Negado</h2>
            <p className="text-gray-300 mb-6">
              É necessário fazer login para acessar as plataformas.
            </p>
            <button
              onClick={handleSignIn}
              disabled={authRedirecting}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"></path>
              </svg>
              Login com Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Usuário autenticado, mas sem assinatura ativa
  if (!subscription || subscription.status !== "active") {
    return (
      <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>
        <Header />
        <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-10">
            <Flame className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              Acesso Bloqueado
            </h3>
            <p className="text-gray-500 mb-6">
              Assine o plano para desbloquear o acesso a todas as plataformas.
            </p>
            <button
              onClick={handleCheckout}
              className="px-6 py-2 bg-[#ff0884]/20 hover:bg-[#ff0884]/30 text-[#ff0884] rounded-md border border-[#ff0884]/30 transition-colors duration-200"
            >
              Assinar agora!
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Plataformas</h1>
          <p className="text-gray-400">
            Encontre jogos para diversas plataformas
          </p>
        </div>

        {/* Campo de pesquisa */}
        <div className="mb-8">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Pesquisar plataformas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800/60 border border-gray-700 rounded-lg py-3 pl-10 pr-4 placeholder-gray-500 text-gray-200 focus:outline-none focus:border-[#ff0884] focus:ring-1 focus:ring-[#ff0884] transition-colors"
            />
          </div>
        </div>

        {/* Grid de plataformas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {filteredPlatforms.map((platform) => (
            <a
              key={platform.name}
              href={platform.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 overflow-hidden shadow-lg transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.3)] hover:border-[#ff0884]/30 transform hover:-translate-y-1"
            >
              <div className="h-auto w-full overflow-hidden">
                <Image
                  src={platform.image || "/images/logos.webp"}
                  alt={platform.fullName}
                  width={300}
                  height={200}
                  className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 w-full p-4 text-center pb-3">
                <h3
                  className={`${robotoCondensed.className} text-md font-regular text-white flex items-center justify-center`}
                >
                  {platform.fullName}
                </h3>
              </div>
            </a>
          ))}
        </div>

        {/* Mensagem caso não encontre resultados */}
        {filteredPlatforms.length === 0 && (
          <div className="text-center py-10">
            <div className="text-gray-500 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-400 mb-2">
              Nenhuma plataforma encontrada
            </h3>
            <p className="text-gray-500">Tente outro termo de pesquisa</p>
          </div>
        )}
      </main>
    </div>
  );
}

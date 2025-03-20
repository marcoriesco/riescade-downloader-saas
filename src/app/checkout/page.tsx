
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { loadStripe } from "@stripe/stripe-js";
import {
  CardElement,
  Elements,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { User } from "@supabase/supabase-js";
import { Gamepad2, Zap, Shield, ArrowLeft } from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedPlan, setSelectedPlan] = useState(
    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || "price_1"
  );
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser(session.user);
      } else {
        router.push("/dashboard");
      }
    };

    checkUser();
  }, [router]);

  const plan = {
    id: "price_1",
    name: "GAMER PRO",
    price: "R$30/mês",
    features: [
      "Acesso a todos os jogos",
      "Matchmaking prioritário",
      "Equipamentos raros exclusivos",
      "Jogos ilimitados",
      "Torneios personalizados",
      "Acesso ao Discord VIP",
      "Suporte 24/7"
    ],
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cardElement = elements.getElement(CardElement);

      if (!cardElement) {
        throw new Error("Card element not found");
      }

      // Create payment method
      const { error: stripeError, paymentMethod } =
        await stripe.createPaymentMethod({
          type: "card",
          card: cardElement,
        });

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      // Call your API to create a subscription
      const response = await fetch("/api/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentMethodId: paymentMethod.id,
          priceId: selectedPlan,
          userId: user?.id,
          userEmail: user?.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      // Handle subscription success
      router.push("/dashboard?success=true");
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#ff0884] border-opacity-50 mx-auto"></div>
          <p className="text-lg text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-8 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff0884]/10 via-gray-900 to-gray-900 z-0"></div>
      <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px] z-0"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="text-white hover:text-[#ff0884] flex items-center transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar ao Dashboard
          </Link>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-md rounded-lg shadow-lg overflow-hidden border border-gray-700">
          <div className="px-6 py-4 bg-black/30 border-b border-gray-700 flex items-center">
            <Shield className="w-5 h-5 text-[#ff0884] mr-2" />
            <h2 className="text-xl font-bold text-white">Finalize sua Assinatura</h2>
          </div>

          <div className="p-6">
            <div className="mb-8 bg-black/30 p-6 rounded-lg border border-gray-700">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                <div className="flex items-center">
                  <img 
                    src="/public/lovable-uploads/96caf5b3-ec7d-4b1f-80d9-1ab8188eafef.png" 
                    alt="Gaming Logo" 
                    className="h-16 w-16 object-contain mr-4"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                    <p className="text-[#ff0884] font-bold">{plan.price}</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-[#ff0884]/20 rounded-md border border-[#ff0884]/40 text-center">
                  <span className="text-white text-sm font-medium">Plano Selecionado</span>
                </div>
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-gray-300 font-medium mb-3">O que está incluído:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-[#ff0884] mr-2 flex-shrink-0 mt-0.5"
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
                      <span className="text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-300 font-medium mb-2">
                  Dados do Cartão
                </label>
                <div className="border border-gray-600 rounded-md p-4 bg-black/30">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: "16px",
                          color: "#ffffff",
                          "::placeholder": {
                            color: "#9ca3af",
                          },
                          iconColor: "#ff0884",
                        },
                        invalid: {
                          color: "#ef4444",
                          iconColor: "#ef4444",
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-md">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!stripe || loading}
                className={`w-full bg-[#ff0884] hover:bg-[#ff0884]/90 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 transform hover:scale-105 shadow-[0_0_15px_rgba(255,8,132,0.3)] flex items-center justify-center ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Processando...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Assinar Agora
                  </>
                )}
              </button>
              
              <p className="text-sm text-gray-400 text-center">
                Ao assinar, você concorda com nossos Termos de Serviço e Política de Privacidade.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
}

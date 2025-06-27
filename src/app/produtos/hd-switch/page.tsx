"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Package,
  Truck,
  Zap,
  Gamepad2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Roboto_Condensed } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400"],
});

export default function HDProductPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cep, setCep] = useState("");
  const [shippingOptions, setShippingOptions] = useState<
    Array<{
      service: string;
      serviceName: string;
      shippingValue: number;
      shippingDays: number;
    }>
  >([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [gamesList, setGamesList] = useState<string[]>([]);
  const [isGamesListOpen, setIsGamesListOpen] = useState(false);

  const productPrice = 35000; // R$ 350,00 em centavos
  const selectedShippingOption = shippingOptions.find(
    (option) => option.service === selectedShipping
  );
  const shippingValue = selectedShippingOption?.shippingValue || 0;
  const totalPrice = productPrice + shippingValue;

  // Screenshots do produto
  const productScreenshots = [
    "/images/hdswitch/image.webp",
    "/images/hdswitch/image1.webp",
    "/images/hdswitch/image2.webp",
    "/images/hdswitch/image3.webp",
  ];

  // Carregar lista de jogos
  useEffect(() => {
    const loadGamesList = async () => {
      try {
        const response = await fetch("/images/hdswitch/games.txt");
        const text = await response.text();
        const games = text.split("\n").filter((game) => game.trim() !== "");
        setGamesList(games);
      } catch (error) {
        console.error("Erro ao carregar lista de jogos:", error);
      }
    };

    loadGamesList();
  }, []);

  // Verificar se o usuário está autenticado
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };

    checkUser();

    // Escutar mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const calculateShipping = async () => {
    if (!cep || cep.length !== 8) {
      alert("Por favor, insira um CEP válido (8 dígitos)");
      return;
    }

    setIsCalculatingShipping(true);
    try {
      const response = await fetch("/api/calculate-shipping", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cep }),
      });

      const data = await response.json();

      if (data.success) {
        setShippingOptions(data.options);
        // Selecionar automaticamente o SEDEX se disponível, senão o primeiro disponível
        const sedexOption = data.options.find(
          (option: { service: string }) => option.service === "40010"
        );
        const firstOption = data.options[0];
        setSelectedShipping(sedexOption?.service || firstOption?.service || "");
      } else {
        alert("Erro ao calcular frete. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao calcular frete:", error);
      alert("Erro ao calcular frete. Tente novamente.");
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      alert(
        "Para realizar a compra, você precisa estar logado com sua conta Google."
      );
      handleSignIn();
      return;
    }

    if (!selectedShipping) {
      alert("Por favor, calcule o frete primeiro");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID,
          userId: user.id,
          userEmail: user.email,
          userName: user.user_metadata?.full_name || user.email,
          shippingValue: selectedShippingOption?.shippingValue || 0,
          cep: cep,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar sessão de checkout");
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error("Erro no checkout:", error);
      alert("Erro ao processar o pagamento. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função de login com Google (Supabase)
  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/produtos/hd-switch",
      },
    });
    if (error) {
      alert("Erro ao iniciar login: " + error.message);
    } else if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      {/* Verificação de Login Obrigatória */}
      {!user && (
        <div className="flex-grow flex items-center justify-center px-4 py-16 bg-gamer-dark">
          <div className="text-center p-8 bg-black/30 rounded-lg border border-[#ff0884]/30 max-w-md">
            <Gamepad2 className="h-12 w-12 text-[#ff0884] mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Área Exclusiva
            </h2>
            <p className="text-gray-300 mb-6">
              Para realizar a compra, você precisa estar logado com sua conta
              Google.
            </p>
            <button
              onClick={handleSignIn}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
            >
              <FontAwesomeIcon icon={faGoogle} size="xl" className="h-4 w-4" />
              Entrar com Google
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo da Página (apenas para usuários logados) */}
      {user && (
        <main className="flex-grow">
          {/* Hero Section */}
          <div className="relative w-full overflow-hidden pb-20">
            {/* Background gradient */}
            <div className="inset-0 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900"></div>

            {/* Container para posicionar o conteúdo */}
            <div className="inset-0 z-40 flex flex-col justify-center">
              <div className="px-4 sm:px-6 lg:px-8 pt-20">
                <div className="max-w-7xl mx-auto">
                  {/* Header */}
                  <div className="text-center mb-12">
                    <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-shadow-lg">
                      <span className="text-white drop-shadow-[0_0_25px_rgba(255,8,132,0.8)]">
                        HD 1TB
                      </span>
                      <br />
                      <span
                        className={`${robotoCondensed.className} bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500`}
                      >
                        NINTENDO SWITCH
                      </span>
                    </h1>
                    <p
                      className={`${robotoCondensed.className} text-xl text-gray-300 max-w-2xl mx-auto drop-shadow-md`}
                    >
                      Emuladores já configurados + Artes de todos os jogos
                      <span className="block mt-3 font-semibold text-[#ff0884]">
                        Pronto para conectar e jogar
                      </span>
                    </p>
                  </div>

                  {/* Produto Grid */}
                  <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Imagem do Produto */}
                    <div className="relative">
                      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="p-6">
                          <div className="relative aspect-square rounded-lg overflow-hidden">
                            <Image
                              src="/images/hdswitch/hd_riescade_switch_1tb.webp"
                              alt="HD 1TB Nintendo Switch - RIESCADE"
                              fill
                              className="object-cover"
                              priority
                            />
                          </div>
                        </div>
                      </div>

                      {/* Screenshots do Produto */}
                      <div className="mt-6 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-700 bg-black/30">
                          <h2 className="text-xl font-bold text-white">
                            Screenshots do Produto
                          </h2>
                        </div>
                        <div className="p-6">
                          <div className="grid grid-cols-2 gap-4">
                            {productScreenshots.map((screenshot, index) => (
                              <a
                                key={index}
                                href={screenshot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="relative aspect-video rounded-lg overflow-hidden block hover:scale-105 transition-transform duration-300"
                              >
                                <Image
                                  src={screenshot}
                                  alt={`Screenshot ${index + 1} - HD Nintendo Switch`}
                                  fill
                                  className="object-cover"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Lista de Jogos */}
                      <div className="mt-6 bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <button
                          onClick={() => setIsGamesListOpen(!isGamesListOpen)}
                          className="w-full px-6 py-5 bg-black/30 border-b border-gray-700 flex items-center justify-between hover:bg-black/50 transition-colors duration-300"
                        >
                          <div className="flex items-center">
                            <Gamepad2 className="w-5 h-5 text-[#ff0884] mr-3" />
                            <h2 className="text-xl font-bold text-white">
                              Lista de Jogos ({gamesList.length} jogos)
                            </h2>
                          </div>
                          {isGamesListOpen ? (
                            <ChevronUp className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          )}
                        </button>

                        {isGamesListOpen && (
                          <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                              {gamesList.map((game, index) => (
                                <div
                                  key={index}
                                  className="bg-black/30 p-3 rounded-lg border border-gray-700 hover:border-[#ff0884]/50 transition-colors duration-300"
                                >
                                  <p className="text-gray-300 text-sm font-medium">
                                    {game}
                                  </p>
                                </div>
                              ))}
                            </div>
                            <div className="mt-4 text-center">
                              <p className="text-gray-400 text-sm">
                                Total de {gamesList.length} jogos incluídos
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Informações do Produto */}
                    <div className="space-y-6">
                      {/* Preço */}
                      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-700 bg-black/30">
                          <h2 className="text-2xl font-bold text-white">
                            Preço
                          </h2>
                        </div>
                        <div className="p-6">
                          <div className="text-4xl font-bold text-white mb-2">
                            R${" "}
                            {(productPrice / 100).toFixed(2).replace(".", ",")}
                          </div>
                        </div>
                      </div>

                      {/* Características */}
                      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-700 bg-black/30 flex items-center">
                          <Package className="w-5 h-5 text-[#ff0884] mr-2" />
                          <h2 className="text-xl font-bold text-white">
                            O que está incluído
                          </h2>
                        </div>
                        <div className="p-6 space-y-3">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#ff0884]" />
                            <span className="text-gray-300">
                              HD 1TB com jogos de Nintendo Switch
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#ff0884]" />
                            <span className="text-gray-300">
                              Emuladores já configurados
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#ff0884]" />
                            <span className="text-gray-300">
                              Artes de todos os jogos
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#ff0884]" />
                            <span className="text-gray-300">
                              Instruções de instalação
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#ff0884]" />
                            <span className="text-gray-300">
                              Suporte técnico
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Cálculo de Frete */}
                      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-700 bg-black/30 flex items-center">
                          <Truck className="w-5 h-5 text-[#ff0884] mr-2" />
                          <h2 className="text-xl font-bold text-white">
                            Calcular Frete
                          </h2>
                        </div>
                        <div className="p-6 space-y-4">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Digite seu CEP"
                              value={cep}
                              onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                              ) =>
                                setCep(
                                  e.target.value.replace(/\D/g, "").slice(0, 8)
                                )
                              }
                              className="flex h-10 w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff0884] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              maxLength={8}
                            />
                            <Button
                              onClick={calculateShipping}
                              disabled={
                                isCalculatingShipping || cep.length !== 8
                              }
                              className="bg-[#ff0884] hover:bg-[#ff0884]/90"
                            >
                              {isCalculatingShipping ? (
                                <div className="flex items-center gap-2">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Calculando...
                                </div>
                              ) : (
                                "Calcular"
                              )}
                            </Button>
                          </div>

                          {shippingOptions.length > 0 && (
                            <div className="bg-black/30 p-4 rounded-lg border border-gray-700">
                              <h4 className="text-white font-semibold mb-3">
                                Opções de Frete:
                              </h4>
                              <div className="space-y-3">
                                {shippingOptions.map((option) => (
                                  <label
                                    key={option.service}
                                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-600 hover:border-[#ff0884]/50 cursor-pointer transition-colors"
                                  >
                                    <div className="flex items-center">
                                      <input
                                        type="radio"
                                        name="shipping"
                                        value={option.service}
                                        checked={
                                          selectedShipping === option.service
                                        }
                                        onChange={(e) =>
                                          setSelectedShipping(e.target.value)
                                        }
                                        className="mr-3 text-[#ff0884] focus:ring-[#ff0884]"
                                      />
                                      <div>
                                        <div className="text-white font-medium">
                                          {option.serviceName}
                                        </div>
                                        <div className="text-gray-400 text-sm">
                                          {option.shippingDays} dia
                                          {option.shippingDays > 1
                                            ? "s"
                                            : ""}{" "}
                                          útil
                                          {option.shippingDays > 1 ? "eis" : ""}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-white font-semibold">
                                      R${" "}
                                      {(option.shippingValue / 100)
                                        .toFixed(2)
                                        .replace(".", ",")}
                                    </div>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Total e Botão de Compra */}
                      <div className="bg-gray-800/60 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden">
                        <div className="p-6">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-xl text-gray-300">
                              Total:
                            </span>
                            <span className="text-3xl font-bold text-white">
                              R${" "}
                              {(totalPrice / 100).toFixed(2).replace(".", ",")}
                            </span>
                          </div>

                          <Button
                            onClick={handleCheckout}
                            disabled={isLoading || !selectedShipping || !user}
                            className="w-full bg-[#ff0884] hover:bg-[#ff0884]/90 text-white py-4 text-lg font-bold shadow-[0_0_15px_rgba(255,8,132,0.4)] transition-all duration-300 transform hover:scale-105"
                          >
                            {isLoading ? "Processando..." : "COMPRAR AGORA"}
                          </Button>

                          <p className="text-sm text-gray-400 text-center mt-4">
                            Pagamento seguro via Stripe
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Benefícios */}
          <div className="py-20 bg-black relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-90"></div>
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                  <span className="text-[#ff0884]">POR QUE ESCOLHER</span> NOSSO
                  HD?
                </h2>
                <p
                  className={`${robotoCondensed.className} max-w-2xl text-xl text-gray-400 mx-auto`}
                >
                  A melhor experiência de jogos retro em um único dispositivo
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-[#ff0884]/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,8,132,0.2)] transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mb-6 border border-gray-700">
                    <Zap className="w-8 h-8 text-[#ff0884]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Pronto para usar
                  </h3>
                  <p className={`${robotoCondensed.className} text-gray-400`}>
                    Emuladores já configurados e otimizados para melhor
                    performance
                  </p>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-[#ff0884]/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,8,132,0.2)] transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mb-6 border border-gray-700">
                    <Gamepad2 className="w-8 h-8 text-[#ff0884]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Biblioteca selecionada
                  </h3>
                  <p className={`${robotoCondensed.className} text-gray-400`}>
                    Mais de 200 jogos com artes organizadas e categorizadas
                  </p>
                </div>

                <div className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-[#ff0884]/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,8,132,0.2)] transition-all duration-300 transform hover:-translate-y-2">
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mb-6 border border-gray-700">
                    <Package className="w-8 h-8 text-[#ff0884]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    Entrega rápida
                  </h3>
                  <p className={`${robotoCondensed.className} text-gray-400`}>
                    Envio para todo Brasil com rastreamento e garantia
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      )}

      <Footer />
    </div>
  );
}

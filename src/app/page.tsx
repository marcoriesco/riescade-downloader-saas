"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Zap, Trophy, Flame } from "lucide-react";
import Image from "next/image";
import { ImageSlider } from "@/components/ImageSlider";
import { GoogleReviews } from "@/components/GoogleReviews";

import { Roboto_Condensed } from "next/font/google";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Video } from "@/components/Video";
import BlogPostsPreview from "@/components/BlogPostsPreview";
import Footer from "@/components/Footer";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400"],
});

export default function Home() {
  const gameImages = [
    {
      title: "Loading",
      console: "RIESCADE",
      image: "/screenshots/loading.webp",
    },
    {
      title: "Jogos",
      console: "RIESCADE",
      image: "/screenshots/allgames.webp",
    },
    {
      title: "Emuladores",
      console: "RIESCADE",
      image: "/screenshots/emulators.webp",
    },
    {
      title: "Arcade",
      console: "RIESCADE",
      image: "/screenshots/arcade.webp",
    },
    {
      title: "Street Fighter III",
      console: "Arcade",
      image: "/screenshots/sf3.webp",
    },
    {
      title: "Nintendo Switch",
      console: "Consoles",
      image: "/screenshots/switch.webp",
    },
    {
      title: "Super Mario Bros. Wonder",
      console: "Nintendo Switch",
      image: "/screenshots/mariowonder.webp",
    },
    {
      title: "Windows",
      console: "PC Gamer",
      image: "/screenshots/windows.webp",
    },
    {
      title: "Nintendo 64 Disk",
      console: "Extensões",
      image: "/screenshots/n64dd.webp",
    },
    {
      title: "PS Vita",
      console: "Portáteis",
      image: "/screenshots/psvita.webp",
    },
    {
      title: "Pinball M",
      console: "Pinballs",
      image: "/screenshots/pinballm.webp",
    },
    {
      title: "DOOM 3",
      console: "Ports",
      image: "/screenshots/doom3.webp",
    },
  ];

  const handleLoginRedirect = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Erro ao iniciar login:", error);
      } else if (data) {
        console.log("Login iniciado com sucesso, URL:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section com vídeo em tela cheia */}
        <div className="relative w-full h-screen overflow-hidden">
          {/* Vídeo de fundo em tela cheia */}
          <Video video="/video/intro.webm" />

          {/* Overlay para melhorar a legibilidade */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent z-20"></div>

          {/* Container para posicionar o texto na parte inferior esquerda */}
          <div className="absolute inset-0 z-40 flex flex-col justify-center">
            <div className="px-4 sm:px-6 lg:px-8 pt-20">
              <div className="max-w-xl p-6">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-left text-shadow-lg">
                  <span className="text-white drop-shadow-[0_0_25px_rgba(255,8,132,0.8)]">
                    O MELHOR DOS
                  </span>
                  <br />
                  <span
                    className={`${robotoCondensed.className} bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500`}
                  >
                    RETROGAMES
                  </span>
                </h1>
                <p
                  className={`${robotoCondensed.className} text-xl text-white mb-8 max-w-lg text-left drop-shadow-md`}
                >
                  Acesso à mais de 250 plataformas de games, consoles e arcades
                  clássicos em um único lugar.
                  <span className="block mt-3 font-semibold text-[#ff0884]">
                    Emulação perfeita + 5 Temas Premium
                  </span>
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                    onClick={handleLoginRedirect}
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884] text-base font-bold rounded-md shadow-[0_0_20px_rgba(255,8,132,0.4)] text-white bg-[#ff0884] hover:bg-[#ff0884]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 transform hover:scale-105"
                  >
                    <Flame className="h-5 w-5" />
                    COMEÇAR AGORA
                  </button>
                  <Link
                    href="#features"
                    className={`${robotoCondensed.className} inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884]/70 text-base font-bold rounded-md text-white bg-transparent hover:bg-[#ff0884]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300`}
                  >
                    Explorar Recursos
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 bg-gray-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-900"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="relative inline-block">
                  RECURSOS DE GAMES
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0884] to-purple-500"></span>
                </span>
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl text-xl text-gray-400`}
              >
                Projetado para amantes de jogos retro e arcade clássico
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-[#ff0884]" />,
                  title: "Alto Desempenho",
                  description:
                    "Experimente uma jogabilidade ultrarrápida com nossa plataforma otimizada.",
                },
                {
                  icon: <Trophy className="w-8 h-8 text-[#ff0884]" />,
                  title: "+250 Plataformas",
                  description:
                    "Acesso a jogos de mais de 250 plataformas diferentes em um único lugar.",
                },
                {
                  icon: <Flame className="w-8 h-8 text-[#ff0884]" />,
                  title: "Comunidade VIP",
                  description:
                    "Acesso à nossa comunidade no Discord, WhatsApp e Telegram para suporte.",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="bg-gray-800/60 backdrop-blur-sm p-8 rounded-lg border border-gray-700 hover:border-[#ff0884]/50 shadow-lg hover:shadow-[0_0_20px_rgba(255,8,132,0.2)] transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center mb-6 border border-gray-700">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className={`${robotoCondensed.className} text-gray-400`}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Showcase Section */}
        <div className="py-20 bg-black relative overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">MULTISISTEMA</span> COMPLETO
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl text-xl text-gray-400`}
              >
                Mais de 250 sistemas em um único lugar
              </p>
            </div>

            {/* Slider de Sistemas */}
            <ImageSlider images={gameImages} slidesPerView={3} />
          </div>
        </div>

        {/* Pricing Section - Redesenhada */}
        <div className="py-20 bg-[#13111C] relative">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">POTENCIALIZE</span> SUA
                EXPERIÊNCIA
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl text-xl text-gray-400`}
              >
                A melhor experiência de jogos retro aguarda por você
              </p>
            </div>

            {/* Design moderno de plano */}
            <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.3)]">
              <div className="grid md:grid-cols-2 gap-0">
                {/* Lado esquerdo - Informações do plano */}
                <div className="p-8 md:p-12 bg-gradient-to-br from-gray-800/50 via-black/50 to-black/50">
                  <div className="flex items-center space-x-3 mb-8">
                    <div className="w-12 h-12 bg-[#ff0884]/20 rounded-full flex items-center justify-center border border-[#ff0884]/30">
                      <Flame className="h-6 w-6 text-[#ff0884]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      RIESCADE MEMBRO
                    </h3>
                  </div>

                  <div className="mb-8">
                    <div className="flex items-baseline">
                      <span className="text-5xl font-bold text-white">
                        R$30
                      </span>
                      <span className="text-gray-400 ml-2">/mês</span>
                    </div>
                    <p className="text-gray-400 mt-2">
                      Assinatura mensal sem fidelidade
                    </p>
                  </div>

                  <div className="space-y-4 mb-8">
                    <p className="text-gray-300">Acesso completo a:</p>
                    <ul className={`${robotoCondensed.className} space-y-4`}>
                      {[
                        {
                          title: "12TB de Jogos",
                          desc: "Download ilimitado de todo o conteúdo premium",
                        },
                        {
                          title: "Google Drive",
                          desc: "Acesso integrado com sua conta Google",
                        },
                        {
                          title: "Comunidade VIP",
                          desc: "Suporte prioritário e atualizações exclusivas",
                        },
                        {
                          title: "250+ Plataformas",
                          desc: "Do Atari até os consoles mais recentes",
                        },
                        {
                          title: "Integrações",
                          desc: "Retroachievements + scraping automático",
                        },
                      ].map((feature, index) => (
                        <li key={index} className="flex">
                          <svg
                            className="h-6 w-6 text-[#ff0884] mr-3 flex-shrink-0"
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
                          <div>
                            <span className="block text-white font-medium">
                              {feature.title}
                            </span>
                            <span className="block text-gray-400 text-sm">
                              {feature.desc}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Lado direito - Call to action e imagem */}
                <div className="relative p-8 md:p-12 bg-gradient-to-br from-[#ff0884]/10 via-black/70 to-black/70 flex flex-col justify-center">
                  <div className="absolute inset-0 opacity-10">
                    <Image
                      src="/images/logos.webp"
                      alt="RIESCADE Background"
                      width={500}
                      height={500}
                      className="opacity-20 object-cover w-full h-full"
                    />
                  </div>

                  <div className="relative">
                    <div className="mb-8">
                      <h4 className="text-2xl font-bold text-white mb-4">
                        Torne-se membro agora
                      </h4>
                      <p className="text-gray-300 mb-6">
                        Junte-se a milhares de jogadores que já estão
                        aproveitando nossa coleção exclusiva de jogos retro.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleLoginRedirect}
                        className="w-full block text-center px-6 py-4 rounded-md font-bold bg-[#ff0884] text-white hover:bg-[#ff0884]/90 shadow-[0_0_15px_rgba(255,8,132,0.4)] transition-all duration-300 transform hover:scale-105"
                      >
                        ASSINAR AGORA
                      </button>

                      <p className="text-center text-gray-400 text-sm">
                        Processo 100% seguro. Cancele quando quiser.
                      </p>
                    </div>

                    <div className="mt-12 p-4 bg-black/30 border border-gray-700 rounded-lg">
                      <p className="text-gray-300 text-sm">
                        &ldquo;O melhor sistema de retrogames que já usei. Vale
                        cada centavo pela experiência nostálgica!&rdquo;
                      </p>
                      <p className="text-right text-[#ff0884] text-sm mt-2">
                        — Membro desde 2023
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Blog Recente Section */}
        <div className="py-20 bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-900 opacity-90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-10">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">BLOG</span> RIESCADE
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl text-xl text-gray-400`}
              >
                Novidades e artigos sobre o universo dos jogos retro
              </p>
            </div>

            {/* Blog posts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {/* Este componente é renderizado do lado do cliente, então não podemos usar diretamente os dados do servidor.
                  Precisamos usar um servidor component ou fazer a chamada de forma client-side */}
              <BlogPostsPreview />
            </div>

            <div className="text-center">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884]/70 text-base font-bold rounded-md text-white bg-transparent hover:bg-[#ff0884]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300"
              >
                Ver todos os artigos
              </Link>
            </div>
          </div>
        </div>

        {/* Avaliações do Google */}
        <div className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-gray-800 via-black to-black opacity-90"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-left mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                O QUE{" "}
                <span className="text-[#ff0884]">NOSSOS COLABORADORES</span>{" "}
                DIZEM
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl text-xl text-gray-400`}
              >
                Avaliações reais de usuários satisfeitos
              </p>
            </div>

            {/* Slider de Avaliações */}
            <GoogleReviews slidesPerView={3} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

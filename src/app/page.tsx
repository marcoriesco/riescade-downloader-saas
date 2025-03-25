"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import { Zap, Trophy, Flame } from "lucide-react";
import Image from "next/image";
import { ImageSlider } from "@/components/ImageSlider";
import { PlatformIcons } from "@/components/PlatformIcons";

import { Roboto_Condensed } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTelegramPlane,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";

import { useCallback } from "react";
import { supabase } from "@/lib/supabase";

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
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section com gradiente animado */}
        <div className="relative bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff0884]/20 via-gray-900 to-gray-900"></div>
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="md:flex md:items-center md:space-x-12">
              <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                  <span className="text-white drop-shadow-[0_0_25px_rgba(255,8,132,0.8)]">
                    RIESCADE
                  </span>
                  <br />
                  <span
                    className={`${robotoCondensed.className} bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500`}
                  >
                    +250 PLATAFORMAS
                  </span>
                </h1>
                <p
                  className={`${robotoCondensed.className} text-xl text-gray-300 mb-8 max-w-lg`}
                >
                  Acesso à mais de 250 plataformas de jogos em um único lugar.
                  <span className="block mt-3 font-semibold text-[#ff0884]">
                    +5 Temas Premium
                  </span>
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884] text-base font-bold rounded-md shadow-[0_0_20px_rgba(255,8,132,0.4)] text-white bg-[#ff0884] hover:bg-[#ff0884]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 transform hover:scale-105"
                  >
                    <Flame className="h-5 w-5" />
                    COMEÇAR AGORA
                  </Link>
                  <Link
                    href="#features"
                    className={`${robotoCondensed.className} inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884]/70 text-base font-bold rounded-md text-white bg-transparent hover:bg-[#ff0884]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300`}
                  >
                    Explorar Recursos
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#ff0884]/30 shadow-[0_0_30px_rgba(255,8,132,0.3)] transform rotate-1 hover:rotate-0 transition-all duration-500">
                  <Image
                    src="/video/intro.webm"
                    alt="Animated gif"
                    width={100}
                    height={60}
                    className="w-full min-h-max"
                    unoptimized
                  />

                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-[#ff0884]/20 to-gray-900/80"></div>
                  <div className="absolute -bottom-6 right-4 flex items-center justify-center">
                    <Image
                      src="/images/logos.webp"
                      alt="RIESCADE logo"
                      width={100}
                      height={100}
                      className="drop-shadow-[0_0_8px_rgba(255,8,132,0.8)] rotate-12"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-20 bg-gray-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-gray-900"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="relative inline-block">
                  RECURSOS ÉPICOS
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0884] to-purple-500"></span>
                </span>
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl mx-auto text-xl text-gray-400`}
              >
                Projetado para gamers que exigem o melhor
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
          <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-5"></div>
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px]"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">MULTISISTEMA</span> COMPLETO
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl mx-auto text-xl text-gray-400`}
              >
                Mais de 250 sistemas em um único lugar
              </p>
            </div>

            {/* Slider de Sistemas */}
            <ImageSlider images={gameImages} slidesPerView={3} />
          </div>
        </div>

        {/* Pricing Section - Mostrando apenas um plano a R$30.00 */}
        <div className="py-20 bg-[#13111C] relative">
          <div className="absolute inset-0 bg-[url('/noise.webp')] opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">POTENCIALIZE</span> SUA
                EXPERIÊNCIA
              </h2>
              <p
                className={`${robotoCondensed.className} max-w-2xl mx-auto text-xl text-gray-400`}
              >
                A melhor experiência de jogos retro aguarda por você
              </p>
            </div>

            {/* Single plan centered */}
            <div className="max-w-md mx-auto">
              <div className="relative bg-gray-800/40 backdrop-blur-sm p-8 rounded-lg border-2 border-[#ff0884] shadow-[0_0_30px_rgba(255,8,132,0.3)] overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ff0884]/20 via-transparent to-transparent rounded-bl-full"></div>

                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/images/logos.webp"
                    alt="RIESCADE Mascot"
                    className="h-20 w-20 object-contain mb-2"
                    width={120}
                    height={120}
                  />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  SEJA MEMBRO POR
                </h3>
                <div className="mb-6 text-center">
                  <span className="text-4xl font-bold text-white">
                    Apenas R$ 30
                  </span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <ul className={`${robotoCondensed.className} space-y-3 mb-8`}>
                  {[
                    "Acesso a todos os jogos",
                    "Jogos ilimitados",
                    "Acesso ao Discord VIP",
                    "Acesso a Comunidade WhatsApp",
                    "+250 plataformas disponíveis",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
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
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleLoginRedirect}
                  className="w-full block text-center px-6 py-3 rounded-md font-bold bg-[#ff0884] text-white hover:bg-[#ff0884]/90 shadow-[0_0_15px_rgba(255,8,132,0.4)] transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                >
                  ASSINE AGORA
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Plataformas Suportadas */}
      <div className="bg-black relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#13111C] via-black to-black"></div>
        <div className="relative max-w mx-auto">
          <div className="text-center py-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              <span className="text-[#ff0884]">PLATAFORMAS</span> SUPORTADAS
            </h2>
          </div>
          <PlatformIcons speed={90} />
        </div>
      </div>

      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2">
                <Image
                  src="/images/logos.webp"
                  alt="RIESCADE Logo"
                  width={35}
                  height={35}
                />
                <h3 className="text-xl font-bold">RIESCADE</h3>
              </div>
              <p className={`${robotoCondensed.className} text-gray-400 mt-2`}>
                RetroGames e Games, sempre emulando...
              </p>
            </div>

            {/* Redes Sociais */}
            <div className="mt-8 flex flex-col space-y-4">
              <div className={`${robotoCondensed.className} flex space-x-6`}>
                <Link
                  href="https://t.me/riescade"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  target="_blank"
                >
                  <FontAwesomeIcon
                    icon={faTelegramPlane}
                    size="xl"
                    className="h-6 w-6 mr-2 fill-current"
                  />
                  <span className="hidden md:flex">Telegram</span>
                </Link>
                <Link
                  href="https://chat.whatsapp.com/Kn2eA8g8FIp0aTYV0iNYSe"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  target="_blank"
                >
                  <FontAwesomeIcon
                    icon={faWhatsapp}
                    size="xl"
                    className="h-6 w-6 mr-2 fill-current"
                  />
                  <span className="hidden md:flex">WhatsApp</span>
                </Link>
                <Link
                  href="https://facebook.com/riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 320 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
                  </svg>
                  <span className="hidden md:flex">Facebook</span>
                </Link>

                <Link
                  href="https://instagram.com/riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" />
                  </svg>
                  <span className="hidden md:flex">Instagram</span>
                </Link>

                <Link
                  href="https://youtube.com/@riescade"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 576 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M549.655 124.083c-6.281-23.65-24.787-42.276-48.284-48.597C458.781 64 288 64 288 64S117.22 64 74.629 75.486c-23.497 6.322-42.003 24.947-48.284 48.597-11.412 42.867-11.412 132.305-11.412 132.305s0 89.438 11.412 132.305c6.281 23.65 24.787 41.5 48.284 47.821C117.22 448 288 448 288 448s170.78 0 213.371-11.486c23.497-6.321 42.003-24.171 48.284-47.821 11.412-42.867 11.412-132.305 11.412-132.305s0-89.438-11.412-132.305zm-317.51 213.508V175.185l142.739 81.205-142.739 81.201z" />
                  </svg>
                  <span className="hidden md:flex">YouTube</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

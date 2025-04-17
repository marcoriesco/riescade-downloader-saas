"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";
import platformsData from "@/data/platforms.json";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabase";
import { User } from "@supabase/supabase-js";
import { Gamepad2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

// Define PlatformData interface
interface PlatformData {
  name: string;
  image: string;
  url: string;
  fullName: string;
}

// Metadata is defined outside of the component since this is a client component
// It will be picked up by the layout

export default function PlatformsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [authRedirecting, setAuthRedirecting] = useState(false);

  // Handle sign in with OAuth
  const handleSignIn = async () => {
    setAuthRedirecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/platforms",
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
  };

  // Verificar autenticação ao carregar a página
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          console.log("User authenticated:", session.user.email);
          setUser(session.user);
          setAuthChecking(false);
        } else {
          console.log("No authenticated user found");
          setUser(null);
          setAuthChecking(false);
        }
      } catch (error) {
        console.error("Error checking user session:", error);
        setAuthChecking(false);
      }
    };

    checkAuth();
  }, []);

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
        <Footer />
      </div>
    );
  }

  // Mostrar loader enquanto verifica autenticação
  if (authChecking) {
    return (
      <div className="flex min-h-screen flex-col bg-gamer-dark">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-t-4 border-[#ff0884] border-opacity-50 mx-auto"></div>
            <p className="text-lg text-gray-300">Verificando autenticação...</p>
          </div>
        </div>
        <Footer />
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
              Faça login para acessar nossa coleção completa de plataformas de
              jogos e desfrutar de todos os recursos disponíveis para membros.
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
        <Footer />
      </div>
    );
  }

  // Group platforms by first letter for A-Z navigation
  const groupedPlatforms: Record<string, PlatformData[]> = {};

  (platformsData as PlatformData[]).forEach((platform) => {
    const firstLetter = platform.fullName.charAt(0).toUpperCase();
    if (!groupedPlatforms[firstLetter]) {
      groupedPlatforms[firstLetter] = [];
    }
    groupedPlatforms[firstLetter].push(platform);
  });

  // Sort the alphabet keys
  const sortedLetters = Object.keys(groupedPlatforms).sort();

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow ${robotoCondensed.className}`}>
        {/* Hero banner */}
        <div
          className="w-full h-[30vh] relative bg-cover bg-center"
          style={{
            background:
              "linear-gradient(to right, rgba(255, 8, 132, 0.8), rgba(128, 0, 255, 0.8))",
            backgroundImage: "url(/images/platforms-banner.webp)",
            backgroundBlendMode: "overlay",
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                RIESCADE Platforms
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl">
                Descubra nossa coleção completa de plataformas de jogos retrô e
                modernas
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* A-Z Navigation */}
          <div className="sticky top-20 bg-gray-900/90 backdrop-blur-sm z-10 py-4 mb-8 shadow-md rounded-lg">
            <div className="flex flex-wrap justify-center gap-2">
              {sortedLetters.map((letter) => (
                <a
                  key={letter}
                  href={`#${letter}`}
                  className="w-10 h-10 flex items-center justify-center bg-gray-800 hover:bg-[#ff0884] rounded-md font-bold transition-colors"
                >
                  {letter}
                </a>
              ))}
            </div>
          </div>

          {/* Platforms grid by letter */}
          {sortedLetters.map((letter) => (
            <div key={letter} id={letter} className="mb-12 scroll-mt-32">
              <h2 className="text-3xl font-bold mb-6 pl-4 border-l-4 border-[#ff0884]">
                {letter}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {groupedPlatforms[letter].map((platform) => (
                  <div
                    key={platform.name}
                    className="bg-gray-800 rounded-lg p-4 flex flex-col items-center text-center hover:bg-gray-700 transition-all hover:shadow-lg hover:shadow-[#ff0884]/10 transform hover:-translate-y-1 group"
                  >
                    <div className="relative w-24 h-24 mb-4">
                      <Image
                        src={platform.image.replace(
                          "/images/platform/",
                          "/images/platforms/logos/"
                        )}
                        alt={platform.fullName}
                        fill
                        sizes="100px"
                        className="object-contain transition-transform group-hover:scale-110"
                        onError={(e) => {
                          // Fallback para a imagem original se a versão em /logos/ não existir
                          (e.target as HTMLImageElement).src = platform.image;
                        }}
                      />
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-[#ff0884] mb-4">
                      {platform.fullName}
                    </h3>
                    <div className="flex flex-col gap-2 w-full mt-auto">
                      <Link
                        href={`/platforms/${platform.name}`}
                        className="w-full bg-[#ff0884]/90 hover:bg-[#ff0884] text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Info</span>
                      </Link>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center space-x-1 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-4 h-4 mr-1"
                        >
                          <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                        </svg>
                        <span>Drive</span>
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

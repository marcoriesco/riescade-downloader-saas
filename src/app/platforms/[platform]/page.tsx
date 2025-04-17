"use client";

import React, { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";
import platformsData from "@/data/platforms.json";
import { supabase } from "@/lib/supabase";
import Footer from "@/components/Footer";
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

// Define PlatformMetadata interface
interface PlatformMetadata {
  systemName?: string;
  systemDescription?: string;
  systemManufacturer?: string;
  systemReleaseYear?: string;
  systemReleaseDate?: string;
  systemReleaseDateFormated?: string;
  systemHardwareType?: string;
  systemColor?: string;
  systemColorPalette1?: string;
  systemColorPalette2?: string;
  systemColorPalette3?: string;
  systemColorPalette4?: string;
}

export default function PlatformPage({
  params,
}: {
  params: Promise<{ platform: string }>;
}) {
  // Usando o hook 'use' para lidar com o Promise
  const resolvedParams = use(params);
  const platform = resolvedParams.platform;

  const [user, setUser] = useState<User | null>(null);
  const [metadata, setMetadata] = useState<PlatformMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [authRedirecting, setAuthRedirecting] = useState(false);

  const platformInfo = (platformsData as PlatformData[]).find(
    (p) => p.name === platform
  );

  if (!platformInfo) {
    notFound();
  }

  // Handle sign in with OAuth
  const handleSignIn = async () => {
    setAuthRedirecting(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + `/platforms/${platform}`,
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

  // Verificar autenticação
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

  useEffect(() => {
    // Função para verificar se o arquivo XML existe via API interna
    async function checkXmlFile() {
      // Não verificar XML se ainda estiver checando autenticação
      if (authChecking || !user) return;

      try {
        setLoading(true);

        // Rota interna do Next.js para verificar o arquivo e obter metadados
        const res = await fetch(`/api/xml-check?platform=${platform}`);
        const data = await res.json();

        if (data.exists && data.metadata) {
          setMetadata(data.metadata);
          setShowModal(false);
        } else {
          setMetadata(null);
          setShowModal(true);
        }
      } catch (error) {
        console.error("Erro ao verificar o arquivo XML:", error);
        setMetadata(null);
        setShowModal(true);
      } finally {
        setLoading(false);
      }
    }

    if (!authChecking) {
      checkXmlFile();
    }
  }, [platform, authChecking, user]);

  // Generate background gradient based on platform colors
  const bgGradient =
    metadata?.systemColor && metadata.systemColor.trim() !== ""
      ? `linear-gradient(to bottom, #${metadata.systemColor}33, #121212)`
      : "linear-gradient(to bottom, rgba(255, 8, 132, 0.2), #121212)";

  // Check if system image exists
  const systemImagePath = `/images/platforms/systems/${platform}.webp`;

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

  // Mostrar loader enquanto verifica autenticação ou carrega dados
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
              Faça login para acessar informações detalhadas sobre{" "}
              {platformInfo.fullName} e todos os recursos disponíveis para
              membros.
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

  // Mostrar loader enquanto carrega dados
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff0884] mx-auto mb-4"></div>
            <p className="text-xl">Carregando...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow ${robotoCondensed.className}`}>
        <div
          className="w-full h-[40vh] relative bg-cover bg-center"
          style={{ background: bgGradient }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center p-8">
              <div className="mx-auto mb-6 relative w-[128px] h-[128px] flex items-center justify-center">
                <Image
                  src={platformInfo.image.replace(
                    "/images/platform/",
                    "/images/platforms/logos/"
                  )}
                  alt={platformInfo.fullName}
                  width={128}
                  height={128}
                  className="object-contain"
                  onError={(e) => {
                    const imgElement = e.target as HTMLImageElement;
                    // Verifica se já não estamos usando a fonte original para evitar loop
                    if (imgElement.src !== platformInfo.image) {
                      imgElement.src = platformInfo.image;
                    } else {
                      // Se a imagem original também falhar, use um placeholder
                      imgElement.src =
                        "/images/platforms/placeholder-logo.webp";
                    }
                    // Evita novos erros
                    imgElement.onerror = null;
                  }}
                />
              </div>
              <h1 className="text-5xl font-bold mb-4">
                {platformInfo.fullName}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-12">
          {/* Platform buttons section */}
          <div className="flex flex-col md:flex-row gap-6 justify-center mb-12">
            <a
              href={platformInfo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#ff0884] hover:bg-[#ff0884]/80 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1 hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6"
              >
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
              </svg>
              <span>Link Direto do Google Drive</span>
            </a>

            <Link
              href={`/platforms`}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 px-8 rounded-xl flex items-center justify-center space-x-3 transition-all transform hover:-translate-y-1 hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
              <span>Ver Todas as Plataformas</span>
            </Link>
          </div>

          {/* Content section with actual metadata */}
          <div className="grid grid-cols-1 gap-12">
            {!showModal && metadata ? (
              <div className="grid grid-cols-1 gap-12">
                {/* Left column: Image and Description */}
                <div className="space-y-8">
                  {/* System Image - if available */}
                  <div className="bg-gray-800/40 rounded-xl p-6 shadow-xl border border-gray-700 flex items-center justify-center">
                    <div className="relative w-full aspect-square max-h-[400px] flex items-center justify-center">
                      <Image
                        src={systemImagePath}
                        alt={`${platformInfo.fullName} Console`}
                        fill
                        className="object-contain p-16"
                        sizes="(max-width: 768px) 100vw, 500px"
                        onError={(e) => {
                          console.log(
                            `Failed to load image: ${systemImagePath}`
                          );
                          // If image fails to load, replace with placeholder and prevent further attempts
                          const imgElement = e.target as HTMLImageElement;
                          if (
                            imgElement.src !==
                            "/images/platforms/placeholder-console.webp"
                          ) {
                            imgElement.src =
                              "/images/platforms/placeholder-console.webp";
                            imgElement.onerror = null; // Evita novos loops de erro
                          }
                        }}
                        priority={false}
                        loading="lazy"
                      />
                    </div>
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ff0884] to-purple-600 bg-clip-text text-transparent">
                      Sobre {metadata.systemName}
                    </h2>
                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700/50">
                      <p className="text-gray-300 leading-relaxed">
                        {metadata.systemDescription}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right column: Details and Colors */}
                <div className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ff0884] to-purple-600 bg-clip-text text-transparent">
                      Detalhes da Plataforma
                    </h2>
                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700/50">
                      <dl className="space-y-4">
                        {metadata.systemManufacturer && (
                          <div className="grid grid-cols-2">
                            <dt className="font-semibold text-gray-400">
                              Fabricante
                            </dt>
                            <dd>{metadata.systemManufacturer}</dd>
                          </div>
                        )}

                        {metadata.systemReleaseDateFormated && (
                          <div className="grid grid-cols-2">
                            <dt className="font-semibold text-gray-400">
                              Data de Lançamento
                            </dt>
                            <dd>{metadata.systemReleaseDateFormated}</dd>
                          </div>
                        )}

                        {metadata.systemReleaseYear && (
                          <div className="grid grid-cols-2">
                            <dt className="font-semibold text-gray-400">Ano</dt>
                            <dd>{metadata.systemReleaseYear}</dd>
                          </div>
                        )}

                        {metadata.systemHardwareType && (
                          <div className="grid grid-cols-2">
                            <dt className="font-semibold text-gray-400">
                              Tipo
                            </dt>
                            <dd>{metadata.systemHardwareType}</dd>
                          </div>
                        )}
                      </dl>
                    </div>
                  </div>

                  {/* Additional information */}
                  <div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ff0884] to-purple-600 bg-clip-text text-transparent">
                      Informações Adicionais
                    </h2>
                    <div className="bg-gray-800 rounded-xl p-6 shadow-xl border border-gray-700/50">
                      <p className="text-gray-300 mb-4">
                        Esta plataforma faz parte da coleção RIESCADE de jogos
                        retro. Acesse nossa comunidade para mais informações e
                        suporte.
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/blog"
                          className="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                            />
                          </svg>
                          <span>Ver Artigos do Blog</span>
                        </Link>
                        <Link
                          href="/platforms"
                          className="bg-gray-700 hover:bg-gray-600 transition-colors px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                            />
                          </svg>
                          <span>Todas as Plataformas</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-800/50 p-10 rounded-xl text-center shadow-xl border border-gray-700/50 relative">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-16 w-16 mx-auto mb-4 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h2 className="text-2xl font-bold mb-4">
                  Informações da Plataforma em Breve
                </h2>
                <p className="text-gray-400 mb-6 text-lg max-w-2xl mx-auto">
                  Ainda não temos metadados detalhados para esta plataforma.
                  Nossa equipe está trabalhando para adicionar mais informações
                  sobre {platformInfo.fullName}. Enquanto isso, você pode
                  acessar todos os jogos usando o link do Google Drive acima.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mt-8">
                  <Image
                    src={systemImagePath}
                    alt={`${platformInfo.fullName} Console`}
                    width={300}
                    height={300}
                    className="mx-auto object-contain bg-gray-900/50 p-6 rounded-xl"
                    onError={(e) => {
                      console.log(
                        `Failed to load fallback image: ${systemImagePath}`
                      );
                      // If image fails to load, hide it
                      const imgElement = e.target as HTMLImageElement;
                      imgElement.style.display = "none";

                      // Verify parent element exists before trying to hide it
                      const parent = imgElement.parentElement;
                      if (parent) {
                        parent.style.display = "none";
                      }

                      // Prevent further error loops
                      imgElement.onerror = null;
                    }}
                    loading="lazy"
                  />

                  <div className="flex flex-col justify-center items-center space-y-4">
                    <Link
                      href="/blog"
                      className="bg-gradient-to-r from-[#ff0884] to-purple-600 text-white px-6 py-3 w-full rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 font-medium inline-flex items-center justify-center"
                    >
                      <span>Confira Nosso Blog</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H3a1 1 0 110-2h9.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                    <Link
                      href="/platforms"
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 w-full rounded-lg transition-colors font-medium inline-flex items-center justify-center"
                    >
                      <span>Ver Outras Plataformas</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 ml-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

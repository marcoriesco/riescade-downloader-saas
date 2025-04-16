"use client";

import React, { use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Roboto_Condensed } from "next/font/google";
import platformsData from "@/data/platforms.json";

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
  const { platform } = use(params);

  const platformInfo = (platformsData as PlatformData[]).find(
    (p) => p.name === platform
  );

  if (!platformInfo) {
    notFound();
  }

  // Get metadata from API (we'll simulate fetching it)
  const fetchPlatformMetadata = async (): Promise<PlatformMetadata | null> => {
    // Simulating API call - in real app, you would call an API endpoint here
    await new Promise((resolve) => setTimeout(resolve, 500));
    return null; // Return null for now
  };

  // Use the 'use' hook to handle the async call
  const metadata = use(fetchPlatformMetadata());
  const hasMetadata = metadata !== null;

  // Generate background gradient based on platform colors
  const bgGradient =
    metadata?.systemColor && metadata.systemColor.trim() !== ""
      ? `linear-gradient(to bottom, #${metadata.systemColor}33, #121212)`
      : "linear-gradient(to bottom, rgba(255, 8, 132, 0.2), #121212)";

  // Check if system image exists
  const systemImagePath = `/images/platforms/systems/${platform}.webp`;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className={`flex-grow pt-20 ${robotoCondensed.className}`}>
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
                    (e.target as HTMLImageElement).src = platformInfo.image;
                  }}
                />
              </div>
              <h1 className="text-5xl font-bold mb-4">
                {platformInfo.fullName}
              </h1>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
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
          </div>

          {/* Content section with potential system image */}
          <div className="grid grid-cols-1 gap-12">
            {hasMetadata ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Left column: Image and Description */}
                <div className="space-y-8">
                  {/* System Image - if available */}
                  <div className="bg-gray-800/40 rounded-xl p-6 shadow-xl border border-gray-700 flex items-center justify-center">
                    <div className="relative w-full aspect-square max-h-[400px] flex items-center justify-center">
                      <Image
                        src={systemImagePath}
                        alt={`${platformInfo.fullName} Console`}
                        fill
                        className="object-contain p-4"
                        sizes="(max-width: 768px) 100vw, 500px"
                        onError={(e) => {
                          console.log(
                            `Failed to load image: ${systemImagePath}`
                          );
                          // If image fails to load, replace with placeholder
                          (e.target as HTMLImageElement).src =
                            "/images/platforms/placeholder-console.webp";
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

                      {/* Color palette display */}
                      {metadata.systemColor && (
                        <div className="mt-8">
                          <h3 className="text-lg font-semibold mb-3 text-gray-400">
                            Cores do Sistema
                          </h3>
                          <div className="flex space-x-3">
                            {metadata.systemColor && (
                              <div
                                className="w-12 h-12 rounded-full shadow-lg border border-white/10"
                                style={{
                                  backgroundColor: `#${metadata.systemColor}`,
                                }}
                                title="Cor Primária"
                              ></div>
                            )}
                            {metadata.systemColorPalette1 && (
                              <div
                                className="w-12 h-12 rounded-full shadow-lg border border-white/10"
                                style={{
                                  backgroundColor: `#${metadata.systemColorPalette1}`,
                                }}
                                title="Cor da Paleta 1"
                              ></div>
                            )}
                            {metadata.systemColorPalette2 && (
                              <div
                                className="w-12 h-12 rounded-full shadow-lg border border-white/10"
                                style={{
                                  backgroundColor: `#${metadata.systemColorPalette2}`,
                                }}
                                title="Cor da Paleta 2"
                              ></div>
                            )}
                            {metadata.systemColorPalette3 && (
                              <div
                                className="w-12 h-12 rounded-full shadow-lg border border-white/10"
                                style={{
                                  backgroundColor: `#${metadata.systemColorPalette3}`,
                                }}
                                title="Cor da Paleta 3"
                              ></div>
                            )}
                            {metadata.systemColorPalette4 && (
                              <div
                                className="w-12 h-12 rounded-full shadow-lg border border-white/10"
                                style={{
                                  backgroundColor: `#${metadata.systemColorPalette4}`,
                                }}
                                title="Cor da Paleta 4"
                              ></div>
                            )}
                          </div>
                        </div>
                      )}
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
                      (e.target as HTMLImageElement).style.display = "none";
                      // Try to adjust the parent container to avoid layout shift
                      try {
                        const parent = (e.target as HTMLImageElement)
                          .parentElement;
                        if (parent) {
                          parent.style.display = "none";
                        }
                      } catch (err) {
                        console.log("Error hiding parent element:", err);
                      }
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
              <p className="text-gray-400 mt-2">
                RetroGames e Games, sempre emulando...
              </p>
            </div>

            {/* Social links */}
            <div className="mt-8 flex flex-col space-y-4">
              <div className="flex space-x-6">
                <Link
                  href="https://t.me/riescade"
                  className="flex items-center text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  target="_blank"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 496 512"
                    className="h-6 w-6 mr-2 fill-current"
                  >
                    <path d="M248 8C111.033 8 0 119.033 0 256s111.033 248 248 248 248-111.033 248-248S384.967 8 248 8zm114.952 168.66c-3.732 39.215-19.881 134.378-28.1 178.3-3.476 18.584-10.322 24.816-16.948 25.425-14.4 1.326-25.338-9.517-39.287-18.661-21.827-14.308-34.158-23.215-55.346-37.177-24.485-16.135-8.612-25 5.342-39.5 3.652-3.793 67.107-61.51 68.335-66.746.153-.655.3-3.1-1.154-4.384s-3.59-.849-5.135-.5q-3.283.746-104.608 69.142-14.845 10.194-26.894 9.934c-8.855-.191-25.888-5.006-38.551-9.123-15.531-5.048-27.875-7.717-26.8-16.291q.84-6.7 18.45-13.7 108.446-47.248 144.628-62.3c68.872-28.647 83.183-33.623 92.511-33.789 2.052-.034 6.639.474 9.61 2.885a10.452 10.452 0 0 1 3.53 6.716 43.765 43.765 0 0 1 .417 9.769z" />
                  </svg>
                  <span className="hidden md:flex">Telegram</span>
                </Link>

                {/* Other social links */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

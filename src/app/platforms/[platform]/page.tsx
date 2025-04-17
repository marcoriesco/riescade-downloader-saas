"use client";

import React, { useState, useEffect, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import parse from "xml2js";
import * as fs from "fs/promises";
import path from "path";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileDownload,
  faGamepad,
  faDesktop,
  faCalendarAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

// Import platform data
import platformsData from "@/data/platforms.json";

interface PlatformData {
  name: string;
  image: string;
  url: string;
  fullName: string;
}

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
  // Extract platform from the URL
  const resolvedParams = use(params);
  const platform = resolvedParams.platform;

  // Get platform info from the JSON file
  const platformInfo: PlatformData =
    platformsData.find((p: PlatformData) => p.name === platform) ||
    ({} as PlatformData);

  // Initialize state
  const [metadata, setMetadata] = useState<PlatformMetadata | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Image path state with fallbacks
  const [imageSrc, setImageSrc] = useState(
    `/images/platforms/systems/${platform}.webp`
  );

  // Define all possible image paths to try
  const systemsPath = `/images/platforms/systems/${platform}.webp`;
  const platformPath = platformInfo?.image || "";
  const logoPath = `/images/platforms/logos/${platform}.webp`;
  const fallbackPath = "/images/platforms/placeholder-console.webp";

  // Handle sign in button click
  const handleSignIn = async () => {
    setIsRedirecting(true);
    try {
      // Implement your authentication logic here
      // For demo, just simulate a redirect
      setTimeout(() => {
        window.location.href = platformInfo.url;
      }, 1500);
    } catch (error) {
      console.error("Authentication error:", error);
      setIsRedirecting(false);
    }
  };

  // Redirect directly to the URL if authenticated
  const handleRedirectToUrl = () => {
    if (platformInfo.url) {
      window.open(platformInfo.url, "_blank");
    }
  };

  useEffect(() => {
    // Check if the user is authenticated
    const checkAuth = async () => {
      // Implement your actual auth check logic here
      // For demo purposes, the logic will instantly say they are authorized
      setIsAuthenticated(true);
    };

    checkAuth();

    // Check for XML metadata file using the API
    async function checkXmlFile() {
      try {
        const response = await fetch(`/api/xml-check?platform=${platform}`);
        if (response.ok) {
          const data = await response.json();
          setMetadata(data);
        } else {
          // If API returns an error or no metadata, show modal
          setShowModal(true);
        }
      } catch (error) {
        console.error("Error checking XML metadata:", error);
        setShowModal(true);
      }
    }

    checkXmlFile();
  }, [platform]);

  // If the platform doesn't exist, return 404
  if (!platformInfo.name) {
    notFound();
  }

  // Generate background color gradient from platform metadata or use default
  const backgroundGradient = metadata?.systemColor
    ? `linear-gradient(to bottom, ${metadata.systemColor}33, #121212)`
    : "linear-gradient(to bottom, rgba(255, 8, 132, 0.2), #121212)";

  // Show redirecting state when auth is in progress
  if (isRedirecting) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-900 text-white">
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff0884] mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold mb-4">Redirecionando...</h1>
            <p className="text-gray-400">
              Você está sendo redirecionado para o Google Drive de{" "}
              {platformInfo.fullName}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <Header />

      <main className="flex-grow">
        {/* Hero Section with Platform Info */}
        <div
          className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8"
          style={{ background: backgroundGradient }}
        >
          <div className="max-w-7xl mx-auto">
            {/* Platform Header */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                {platformInfo.fullName || platform}
              </h1>

              {/* Platform buttons */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mb-16">
                {isAuthenticated ? (
                  <button
                    onClick={handleRedirectToUrl}
                    className="bg-gradient-to-r from-[#ff0884] to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#ff0884]/20 transition-all duration-300 transform hover:-translate-y-1 font-medium flex items-center"
                  >
                    <FontAwesomeIcon
                      icon={faFileDownload}
                      className="mr-2 h-5 w-5"
                    />
                    Acessar No Google Drive
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    className="bg-gradient-to-r from-[#ff0884] to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg hover:shadow-[#ff0884]/20 transition-all duration-300 transform hover:-translate-y-1 font-medium flex items-center"
                  >
                    <FontAwesomeIcon
                      icon={faFileDownload}
                      className="mr-2 h-5 w-5"
                    />
                    Fazer Login para Acessar
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 gap-12">
            {!showModal && metadata ? (
              <div className="grid grid-cols-1 gap-12">
                {/* Left column: Image and Description */}
                <div className="space-y-8">
                  {/* System Image - if available */}
                  <div className="bg-gray-800/40 rounded-xl p-6 shadow-xl border border-gray-700 flex items-center justify-center">
                    <div className="relative w-full aspect-square max-h-[400px] flex items-center justify-center">
                      <Image
                        src={imageSrc}
                        alt={`${platformInfo.fullName} Console`}
                        fill
                        className="object-contain p-16"
                        sizes="(max-width: 768px) 100vw, 500px"
                        onError={() => {
                          console.log(`Failed to load image: ${imageSrc}`);

                          // Try different paths in sequence
                          if (imageSrc === systemsPath && platformPath) {
                            console.log("Trying platform path", platformPath);
                            setImageSrc(platformPath);
                          } else if (
                            (imageSrc === systemsPath ||
                              imageSrc === platformPath) &&
                            logoPath
                          ) {
                            console.log("Trying logo path", logoPath);
                            setImageSrc(logoPath);
                          } else {
                            // Final fallback
                            console.log("Using fallback placeholder");
                            setImageSrc(fallbackPath);
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
                    src={imageSrc}
                    alt={`${platformInfo.fullName} Console`}
                    width={300}
                    height={300}
                    className="mx-auto object-contain bg-gray-900/50 p-6 rounded-xl"
                    onError={() => {
                      console.log(`Failed to load fallback image: ${imageSrc}`);

                      // Try different paths in sequence
                      if (imageSrc === systemsPath && platformPath) {
                        console.log("Trying platform path", platformPath);
                        setImageSrc(platformPath);
                      } else if (
                        (imageSrc === systemsPath ||
                          imageSrc === platformPath) &&
                        logoPath
                      ) {
                        console.log("Trying logo path", logoPath);
                        setImageSrc(logoPath);
                      } else {
                        // Final fallback
                        console.log("Using fallback placeholder");
                        setImageSrc(fallbackPath);
                      }
                    }}
                    loading="lazy"
                  />
                  <div className="flex flex-col justify-center space-y-4">
                    <h3 className="text-xl font-bold">
                      {platformInfo.fullName}
                    </h3>
                    <p className="text-gray-400">
                      Esta plataforma está disponível em nossa coleção.
                    </p>
                    <button
                      onClick={handleRedirectToUrl}
                      className="bg-gradient-to-r from-[#ff0884] to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity font-medium self-center"
                    >
                      Ver Arquivos no Google Drive
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

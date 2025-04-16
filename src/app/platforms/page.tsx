"use client";

import React from "react";
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

// Metadata is defined outside of the component since this is a client component
// It will be picked up by the layout

export default function PlatformsPage() {
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

      <main className={`flex-grow pt-20 ${robotoCondensed.className}`}>
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
                Gaming Platforms
              </h1>
              <p className="text-xl md:text-2xl max-w-3xl">
                Discover our comprehensive collection of retro and modern gaming
                platforms
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
                  <Link
                    key={platform.name}
                    href={`/platforms/${platform.name}`}
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
                      />
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-[#ff0884]">
                      {platform.fullName}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer - Same as in platform detail page */}
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

                {/* Add other social links here */}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

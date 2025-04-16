import React, { use } from "react";
import { notFound } from "next/navigation";
import fs from "fs/promises";
import path from "path";
import { parseStringPromise } from "xml2js";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
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

// Define platform name mapping to XML file names
const PLATFORM_MAPPINGS: Record<string, string> = {
  gameboy: "gb",
  nintendo64: "n64",
  supernintendo: "snes",
  gameboycolor: "gbc",
  gameboyadvance: "gba",
  playstation: "psx",
  playstation2: "ps2",
  megadrive: "genesis",
  mastersystem: "sms",
  sega: "genesis",
  dreamcast: "dc",
  nes: "nes",
  snes: "snes",
  genesis: "genesis",
};

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ platform: string }>;
}): Promise<Metadata> {
  const { platform } = await params;
  const platformInfo = (platformsData as PlatformData[]).find(
    (p) => p.name === platform
  );

  if (!platformInfo) {
    return {
      title: "Platform not found",
    };
  }

  return {
    title: `${platformInfo.fullName} - RIESCADE`,
    description: `Explore ${platformInfo.fullName} games and emulators available on RIESCADE.`,
    openGraph: {
      title: `${platformInfo.fullName} - RIESCADE`,
      description: `Explore ${platformInfo.fullName} games and emulators available on RIESCADE.`,
      images: [platformInfo.image],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${platformInfo.fullName} - RIESCADE`,
      description: `Explore ${platformInfo.fullName} games and emulators available on RIESCADE.`,
      images: [platformInfo.image],
    },
  };
}

// Read platform XML metadata
async function getPlatformMetadata(
  platform: string
): Promise<PlatformMetadata | null> {
  try {
    // Map platform name to its potential XML file name
    const mappedName = PLATFORM_MAPPINGS[platform.toLowerCase()] || platform;

    // Determine the XML file path - try different possible file names
    const possiblePaths = [
      path.join(process.cwd(), "src", "data", "platforms", `${platform}.xml`),
      path.join(process.cwd(), "src", "data", "platforms", `${mappedName}.xml`),
    ];

    let xmlData = null;
    for (const xmlPath of possiblePaths) {
      try {
        xmlData = await fs.readFile(xmlPath, "utf-8");
        break; // Found a valid XML file
      } catch {
        // Continue to next potential path
        continue;
      }
    }

    if (!xmlData) {
      return null; // No XML file found for this platform
    }

    // Parse XML data
    const parsedData = await parseStringPromise(xmlData);
    const variables = parsedData.theme.variables[0];

    // Extract metadata
    const metadata: PlatformMetadata = {};
    for (const key in variables) {
      if (Object.prototype.hasOwnProperty.call(variables, key)) {
        metadata[key as keyof PlatformMetadata] = variables[key][0];
      }
    }

    return metadata;
  } catch (error) {
    console.error(`Error reading platform metadata for ${platform}:`, error);
    return null;
  }
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

  // Get XML metadata - wrap in use() since it's an async function
  const metadata = use(getPlatformMetadata(platform));
  const hasMetadata = metadata !== null;

  // Generate background gradient based on platform colors
  const bgGradient = metadata?.systemColor
    ? `linear-gradient(to bottom, #${metadata.systemColor}33, #121212)`
    : "linear-gradient(to bottom, rgba(255, 8, 132, 0.2), #121212)";

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
              <Image
                src={platformInfo.image}
                alt={platformInfo.fullName}
                width={128}
                height={128}
                className="mx-auto mb-6"
              />
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
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 16h-2v-6h2v6zm-1-6.891c-.607 0-1.1-.496-1.1-1.109 0-.612.492-1.109 1.1-1.109s1.1.497 1.1 1.109c0 .613-.493 1.109-1.1 1.109zm8 6.891h-1.998v-2.861c0-1.881-2.002-1.722-2.002 0v2.861h-2v-6h2v1.093c.872-1.616 4-1.736 4 1.548v3.359z" />
              </svg>
              <span>Google Drive Direct Link</span>
            </a>
          </div>

          {/* Platform metadata section */}
          {hasMetadata ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Description column */}
              <div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ff0884] to-purple-600 bg-clip-text text-transparent">
                  About {metadata.systemName}
                </h2>
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                  <p className="text-gray-300 leading-relaxed">
                    {metadata.systemDescription}
                  </p>
                </div>
              </div>

              {/* Details column */}
              <div>
                <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-[#ff0884] to-purple-600 bg-clip-text text-transparent">
                  Platform Details
                </h2>
                <div className="bg-gray-800 rounded-xl p-6 shadow-xl">
                  <dl className="space-y-4">
                    {metadata.systemManufacturer && (
                      <div className="grid grid-cols-2">
                        <dt className="font-semibold text-gray-400">
                          Manufacturer
                        </dt>
                        <dd>{metadata.systemManufacturer}</dd>
                      </div>
                    )}

                    {metadata.systemReleaseDateFormated && (
                      <div className="grid grid-cols-2">
                        <dt className="font-semibold text-gray-400">
                          Release Date
                        </dt>
                        <dd>{metadata.systemReleaseDateFormated}</dd>
                      </div>
                    )}

                    {metadata.systemReleaseYear && (
                      <div className="grid grid-cols-2">
                        <dt className="font-semibold text-gray-400">Year</dt>
                        <dd>{metadata.systemReleaseYear}</dd>
                      </div>
                    )}

                    {metadata.systemHardwareType && (
                      <div className="grid grid-cols-2">
                        <dt className="font-semibold text-gray-400">Type</dt>
                        <dd>{metadata.systemHardwareType}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Color palette display */}
                  {metadata.systemColor && (
                    <div className="mt-8">
                      <h3 className="text-lg font-semibold mb-3 text-gray-400">
                        System Colors
                      </h3>
                      <div className="flex space-x-3">
                        {metadata.systemColor && (
                          <div
                            className="w-12 h-12 rounded-full shadow-lg"
                            style={{
                              backgroundColor: `#${metadata.systemColor}`,
                            }}
                            title="Primary Color"
                          ></div>
                        )}
                        {metadata.systemColorPalette1 && (
                          <div
                            className="w-12 h-12 rounded-full shadow-lg"
                            style={{
                              backgroundColor: `#${metadata.systemColorPalette1}`,
                            }}
                            title="Palette Color 1"
                          ></div>
                        )}
                        {metadata.systemColorPalette2 && (
                          <div
                            className="w-12 h-12 rounded-full shadow-lg"
                            style={{
                              backgroundColor: `#${metadata.systemColorPalette2}`,
                            }}
                            title="Palette Color 2"
                          ></div>
                        )}
                        {metadata.systemColorPalette3 && (
                          <div
                            className="w-12 h-12 rounded-full shadow-lg"
                            style={{
                              backgroundColor: `#${metadata.systemColorPalette3}`,
                            }}
                            title="Palette Color 3"
                          ></div>
                        )}
                        {metadata.systemColorPalette4 && (
                          <div
                            className="w-12 h-12 rounded-full shadow-lg"
                            style={{
                              backgroundColor: `#${metadata.systemColorPalette4}`,
                            }}
                            title="Palette Color 4"
                          ></div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 p-10 rounded-xl text-center shadow-xl border border-transparent relative">
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
                Platform Information Coming Soon
              </h2>
              <p className="text-gray-400 mb-6 text-lg max-w-2xl mx-auto">
                We don&apos;t have detailed metadata for this platform yet. Our
                team is working on adding more information about{" "}
                {platformInfo.fullName}. In the meantime, you can still access
                all games using the Google Drive link above.
              </p>

              <Link
                href="/blog"
                className="bg-gradient-to-r from-[#ff0884] to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 font-medium inline-flex items-center"
              >
                <span>Check Out Our Blog</span>
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
            </div>
          )}
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

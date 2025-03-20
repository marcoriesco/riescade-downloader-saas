
import Link from "next/link";
import { Zap, Gamepad2, Trophy, Flame } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-black/60 backdrop-blur-md border-b border-pink-600/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Gamepad2 className="h-6 w-6 text-[#ff0884]" />
            <span className="text-xl font-bold text-white">
              <span className="text-[#ff0884]">Game</span>Platform
            </span>
          </div>
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
            >
              <Zap className="h-4 w-4" />
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section with animated gradient */}
        <div className="relative bg-gray-900 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff0884]/20 via-gray-900 to-gray-900"></div>
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="md:flex md:items-center md:space-x-12">
              <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
                  <span className="text-white drop-shadow-[0_0_25px_rgba(255,8,132,0.8)]">POWER UP</span><br />
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500">YOUR GAMING</span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-lg">
                  Unleash the ultimate gaming experience with our next-gen platform. 
                  <span className="block mt-3 font-semibold text-[#ff0884]">Level up. Dominate. Conquer.</span>
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884] text-base font-bold rounded-md shadow-[0_0_20px_rgba(255,8,132,0.4)] text-white bg-[#ff0884] hover:bg-[#ff0884]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 transform hover:scale-105"
                  >
                    <Flame className="h-5 w-5" />
                    GET STARTED
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884]/70 text-base font-bold rounded-md text-white bg-transparent hover:bg-[#ff0884]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300"
                  >
                    Explore Features
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#ff0884]/30 shadow-[0_0_30px_rgba(255,8,132,0.3)] transform rotate-1 hover:rotate-0 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-[#ff0884]/20 to-gray-900/80"></div>
                  <div className="p-8 flex items-center justify-center text-white text-xl">
                    <img 
                      src="/game-controller.webp" 
                      alt="Gaming Controller"
                      className="w-full h-full object-cover opacity-70 mix-blend-luminosity" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className="px-6 py-3 bg-black/50 backdrop-blur-sm rounded-lg border border-[#ff0884]/30">
                        <span className="text-2xl font-bold text-white">GAME <span className="text-[#ff0884]">ON</span></span>
                      </div>
                    </div>
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
                  EPIC FEATURES
                  <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0884] to-purple-500"></span>
                </span>
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-400">
                Designed for gamers who demand the absolute best
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-[#ff0884]" />,
                  title: "Ultra Performance",
                  description: "Experience lightning-fast gameplay with our optimized network infrastructure."
                },
                {
                  icon: <Trophy className="w-8 h-8 text-[#ff0884]" />,
                  title: "Global Rankings",
                  description: "Compete with players worldwide and climb the leaderboards to glory."
                },
                {
                  icon: <Flame className="w-8 h-8 text-[#ff0884]" />,
                  title: "Epic Rewards",
                  description: "Unlock exclusive content and rewards as you dominate the competition."
                }
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
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="py-20 bg-[#13111C] relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">POWER UP</span> YOUR GAME
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-400">
                Choose the plan that fits your gaming style
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "NOOB",
                  price: 19,
                  features: ["Basic matchmaking", "Standard gear", "10 games per day"]
                },
                {
                  name: "PRO GAMER",
                  price: 38,
                  features: ["Priority matchmaking", "Rare gear unlocks", "Unlimited games", "Custom tournaments", "Discord access"]
                },
                {
                  name: "LEGEND",
                  price: 57,
                  features: ["VIP matchmaking", "Legendary gear", "Unlimited everything", "Private tournaments", "Pro coaching sessions", "Exclusive merch"]
                }
              ].map((plan, i) => (
                <div
                  key={plan.name}
                  className={`relative bg-gray-800/40 backdrop-blur-sm p-8 rounded-lg ${
                    i === 1 ? "border-2 border-[#ff0884] transform scale-105 z-10 shadow-[0_0_30px_rgba(255,8,132,0.3)]" : "border border-gray-700"
                  } overflow-hidden`}
                >
                  {i === 1 && (
                    <span className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#ff0884] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ff0884]/20 via-transparent to-transparent rounded-bl-full"></div>
                  
                  <h3 className="text-xl font-bold text-white mb-4">
                    {plan.name}
                  </h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/month</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
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
                  <Link
                    href="/dashboard"
                    className={`w-full block text-center px-6 py-3 rounded-md font-bold ${
                      i === 1
                        ? "bg-[#ff0884] text-white hover:bg-[#ff0884]/90 shadow-[0_0_15px_rgba(255,8,132,0.4)]"
                        : "bg-gray-700 text-white hover:bg-gray-600"
                    } transition-all duration-300 transform hover:scale-105`}
                  >
                    SELECT PLAN
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2">
                <Gamepad2 className="h-6 w-6 text-[#ff0884]" />
                <h3 className="text-xl font-bold">
                  <span className="text-[#ff0884]">Game</span>Platform
                </h3>
              </div>
              <p className="text-gray-400 mt-2">Dominate. Conquer. Prevail.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                "About",
                "Features",
                "Pricing",
                "Contact",
                "Blog",
                "Support",
              ].map((item) => (
                <div key={item} className="mb-4">
                  <Link href="#" className="text-gray-400 hover:text-[#ff0884] transition-colors duration-200">
                    {item}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left md:flex md:justify-between">
            <p className="text-gray-500">
              © 2024 GamePlatform. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0">
              <div className="flex space-x-6 justify-center md:justify-end">
                {["Twitter", "Discord", "Twitch"].map((social) => (
                  <Link
                    key={social}
                    href="#"
                    className="text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  >
                    {social}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

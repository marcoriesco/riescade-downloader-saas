
import Link from "next/link";
import { Header } from "@/components/Header";
import { Zap, Gamepad2, Trophy, Flame } from "lucide-react";
import Image from "next/image";

export default function Home() {
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
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#ff0884] to-purple-500">
                    +220 PLATAFORMAS
                  </span>
                </h1>
                <p className="text-xl text-gray-300 mb-8 max-w-lg">
                  Tenha acesso à mais de 220 plataformas de jogos em um único lugar.
                  <span className="block mt-3 font-semibold text-[#ff0884]">
                    Template Premium Completo
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
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884]/70 text-base font-bold rounded-md text-white bg-transparent hover:bg-[#ff0884]/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300"
                  >
                    Explorar Recursos
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#ff0884]/30 shadow-[0_0_30px_rgba(255,8,132,0.3)] transform rotate-1 hover:rotate-0 transition-all duration-500">
                  <Image 
                    src="/lovable-uploads/62841482-3f7d-4a10-aa0e-fda7bb088cf9.png"
                    alt="RIESCADE Interface"
                    className="object-cover"
                    fill
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-900/70 via-[#ff0884]/20 to-gray-900/80"></div>
                  <div className="absolute bottom-4 right-4 flex items-center justify-center">
                    <Image 
                      src="/lovable-uploads/ddfc12ca-84bd-41d0-b7d8-fea61305958e.png" 
                      alt="RIESCADE Mascot"
                      width={100}
                      height={100}
                      className="drop-shadow-[0_0_8px_rgba(255,8,132,0.8)]"
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
              <p className="max-w-2xl mx-auto text-xl text-gray-400">
                Projetado para gamers que exigem o melhor
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="w-8 h-8 text-[#ff0884]" />,
                  title: "Alto Desempenho",
                  description:
                    "Experimente uma jogabilidade ultrarrápida com nossa infraestrutura de rede otimizada.",
                },
                {
                  icon: <Trophy className="w-8 h-8 text-[#ff0884]" />,
                  title: "+220 Plataformas",
                  description:
                    "Acesso a jogos de mais de 220 plataformas diferentes em um único lugar.",
                },
                {
                  icon: <Flame className="w-8 h-8 text-[#ff0884]" />,
                  title: "Comunidade VIP",
                  description:
                    "Acesso exclusivo à nossa comunidade no Discord e WhatsApp para suporte 24/7.",
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
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Game Showcase Section */}
        <div className="py-20 bg-black relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
          <div className="absolute inset-0 bg-grid-white/5 bg-[size:30px_30px]"></div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">JOGOS</span> CLÁSSICOS
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-400">
                Reviva os melhores jogos de todas as gerações
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "God of War II",
                  console: "PlayStation 2",
                  image: "/lovable-uploads/28aa7d1d-0ae3-4599-a909-6aaa558d95d4.png",
                },
                {
                  title: "Super Mario Bros U Deluxe",
                  console: "Nintendo Switch",
                  image: "/lovable-uploads/36cb9de2-956b-4fee-ae90-911a1aff9b0a.png",
                },
                {
                  title: "Red Dead Redemption",
                  console: "Xbox 360",
                  image: "/lovable-uploads/f508018a-99a2-43b8-a779-cb50697f9dc9.png",
                },
              ].map((game, index) => (
                <div 
                  key={index}
                  className="relative bg-gray-800/20 rounded-lg overflow-hidden border border-gray-700 hover:border-[#ff0884]/50 transition-all duration-300 group"
                >
                  <div className="h-64 overflow-hidden">
                    <Image
                      src={game.image}
                      alt={game.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-all duration-500"
                      width={500}
                      height={300}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-xl font-bold text-white mb-1">{game.title}</h3>
                    <p className="text-sm text-[#ff0884]">{game.console}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing Section - Mostrando apenas um plano a R$30.00 */}
        <div className="py-20 bg-[#13111C] relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-5"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">POTENCIALIZE</span> SUA EXPERIÊNCIA
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-400">
                A melhor experiência de jogos retro aguarda por você
              </p>
            </div>

            {/* Single plan centered */}
            <div className="max-w-md mx-auto">
              <div className="relative bg-gray-800/40 backdrop-blur-sm p-8 rounded-lg border-2 border-[#ff0884] shadow-[0_0_30px_rgba(255,8,132,0.3)] overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-[#ff0884]/20 via-transparent to-transparent rounded-bl-full"></div>

                <div className="flex items-center justify-center mb-6">
                  <Image
                    src="/lovable-uploads/ddfc12ca-84bd-41d0-b7d8-fea61305958e.png"
                    alt="RIESCADE Mascot"
                    className="h-20 w-20 object-contain mb-2"
                    width={120}
                    height={120}
                  />
                </div>

                <h3 className="text-2xl font-bold text-white mb-4 text-center">
                  MEMBRO
                </h3>
                <div className="mb-6 text-center">
                  <span className="text-4xl font-bold text-white">R$30</span>
                  <span className="text-gray-400">/mês</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    "Acesso a todos os jogos",
                    "Matchmaking prioritário",
                    "Jogos ilimitados",
                    "Acesso ao Discord VIP",
                    "Acesso a Comunidade WhatsApp",
                    "Suporte 24/7",
                    "+220 plataformas disponíveis",
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
                <Link
                  href="/dashboard"
                  className="w-full block text-center px-6 py-3 rounded-md font-bold bg-[#ff0884] text-white hover:bg-[#ff0884]/90 shadow-[0_0_15px_rgba(255,8,132,0.4)] transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                >
                  ASSINAR AGORA
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Emulators Showcase */}
        <div className="py-20 bg-black relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-[#13111C] via-black to-black"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
                <span className="text-[#ff0884]">MULTISISTEMA</span> COMPLETO
              </h2>
              <p className="max-w-2xl mx-auto text-xl text-gray-400">
                Mais de 220 sistemas em um único lugar
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "/lovable-uploads/1b5b7c52-1e0e-40c8-945b-36ee7f52f2ab.png",
                "/lovable-uploads/8748853f-dc48-4348-b90c-f528f08f145c.png",
                "/lovable-uploads/9a3d2d4a-7d88-411b-be79-e288daba9662.png",
                "/lovable-uploads/acb3142e-a375-4d94-af66-507f512f9022.png",
              ].map((img, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700 aspect-video relative group"
                >
                  <Image
                    src={img}
                    alt={`Emulator interface ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <div className="p-3">
                      <span className="text-xs px-2 py-1 bg-[#ff0884]/80 rounded-full text-white">
                        Sistema {index + 1}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 border-2 border-[#ff0884] text-base font-bold rounded-md shadow-[0_0_20px_rgba(255,8,132,0.4)] text-white bg-[#ff0884] hover:bg-[#ff0884]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 transform hover:scale-105"
              >
                <Flame className="h-5 w-5" />
                EXPLORAR AGORA
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-black text-white py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:justify-between">
            <div className="mb-8 md:mb-0">
              <div className="flex items-center space-x-2">
                <Image 
                  src="/lovable-uploads/ddfc12ca-84bd-41d0-b7d8-fea61305958e.png" 
                  alt="RIESCADE Mascot" 
                  width={40} 
                  height={40} 
                />
                <h3 className="text-xl font-bold">
                  <span className="text-[#ff0884]">RIES</span>CADE
                </h3>
              </div>
              <p className="text-gray-400 mt-2">Domine. Conquiste. Prevaleça.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              {[
                "Sobre",
                "Recursos",
                "Preços",
                "Contato",
                "Blog",
                "Suporte",
              ].map((item) => (
                <div key={item} className="mb-4">
                  <Link
                    href="#"
                    className="text-gray-400 hover:text-[#ff0884] transition-colors duration-200"
                  >
                    {item}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center md:text-left md:flex md:justify-between">
            <p className="text-gray-500">
              © 2024 RIESCADE. Todos os direitos reservados.
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

"use client";

import { Header } from "@/components/Header";
import { Home, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>

      <Header />

      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-132px)] px-4">
        <div className="text-center max-w-md">
          <div className="flex justify-center mb-6">
            <div className="relative h-32 w-32 overflow-hidden rounded-full border-4 border-[#ff0884]/40 p-2 bg-black/20 animate-pulse-slow">
              <Image
                src="/images/logos.webp"
                alt="RIESCADE Logo"
                fill
                className="object-contain p-2"
              />
            </div>
          </div>

          <div className="flex justify-center mb-6">
            <AlertTriangle className="h-16 w-16 text-[#ff0884] animate-bounce opacity-75" />
          </div>

          <h1 className="text-6xl font-bold text-white mb-4">404</h1>
          <h2 className="text-2xl font-bold text-white mb-6">
            Página não encontrada
          </h2>
          <p className="text-gray-400 mb-8">
            A página que você está procurando não existe ou foi movida para
            outro local.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]"
          >
            <Home className="h-5 w-5" />
            <span>Voltar para o início</span>
          </Link>

          <div className="mt-12 text-gray-500 text-xs">
            <p>
              © {new Date().getFullYear()} RIESCADE. Todos os direitos
              reservados.
            </p>
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(0.98);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}

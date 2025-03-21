"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";

import { Roboto_Condensed } from "next/font/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faWhatsapp,
  faTelegramPlane,
  faGoogle,
} from "@fortawesome/free-brands-svg-icons";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);

      // Configurar listener para mudanças de autenticação
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user || null);
      });

      return () => subscription.unsubscribe();
    };

    checkUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <header className="bg-black/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="RIESCADE Logo"
              width={240}
              height={40}
              className="mr-2"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Início
          </Link>
          <Link
            href="#features"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Recursos
          </Link>
          <Link
            href="#screenshots"
            className="text-gray-300 hover:text-white transition-colors pr-6"
          >
            Games
          </Link>
          <Link
            href="#"
            className={`${robotoCondensed.className} text-gray-300 hover:text-white transition-colors`}
            target="_blank"
          >
            <FontAwesomeIcon
              icon={faTelegramPlane}
              size="xl"
              className="mr-2"
            />
            Telegram
          </Link>
          <Link
            href="https://chat.whatsapp.com/Kn2eA8g8FIp0aTYV0iNYSe"
            className={`${robotoCondensed.className} text-gray-300 hover:text-white transition-colors`}
            target="_blank"
          >
            <FontAwesomeIcon icon={faWhatsapp} size="xl" className="mr-2" />
            WhatsApp
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          {!loading &&
            (user ? (
              <>
                <div className="hidden md:flex items-center mr-4">
                  <div className="w-8 h-8 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50 flex items-center justify-center mr-2">
                    <User className="h-4 w-4 text-[#ff0884]" />
                  </div>
                  <span className="text-gray-200">{user.email}</span>
                </div>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 border border-[#ff0884]/50 text-sm font-medium rounded-md text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium rounded-md border border-[#ff0884]/50 text-white hover:bg-[#ff0884]/10 transition-all duration-300"
                >
                  Sair
                </button>
              </>
            ) : (
              <Link
                href="/dashboard"
                className={`${robotoCondensed.className} inline-flex items-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)]`}
              >
                <FontAwesomeIcon
                  icon={faGoogle}
                  size="xl"
                  className="h-4 w-4"
                />
                Login com Google
              </Link>
            ))}

          {/* Mobile menu button */}
          <button
            className="md:hidden rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-gray-800/90 backdrop-blur-md border-t border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
            >
              Início
            </Link>
            <Link
              href="#features"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
            >
              Recursos
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
            >
              Planos
            </Link>
            <Link
              href="#"
              className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-gray-700"
            >
              Suporte
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

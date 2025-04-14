"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, Menu, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";

import { Roboto_Condensed } from "next/font/google";

const robotoCondensed = Roboto_Condensed({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export function Header() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/dashboard",
        },
      });

      if (error) {
        console.error("Erro ao iniciar login:", error);
        setIsLoggingIn(false);
      } else if (data) {
        console.log("Login iniciado com sucesso, URL:", data.url);
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error signing in:", error);
      setIsLoggingIn(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Fecha o menu quando um link é clicado
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 header-backdrop">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex items-center">
            <Image
              src="/images/logo.webp"
              alt="RIESCADE Logo"
              width={240}
              height={40}
              className="mr-2"
            />
          </div>
        </Link>

        {/* Botão de menu para mobile */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-[#ff0884]" />
          ) : (
            <Menu className="h-6 w-6 text-[#ff0884]" />
          )}
        </button>

        {/* Menu para desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6 mr-4">
            <Link
              href="/dashboard"
              className="text-gray-200 hover:text-[#ff0884] transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/tutorial"
              className="text-gray-200 hover:text-[#ff0884] transition-colors"
            >
              Tutorial
            </Link>
            <Link
              href="/platforms"
              className="text-gray-200 hover:text-[#ff0884] transition-colors"
            >
              Plataformas
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {!loading &&
              (user ? (
                <>
                  <div className="hidden md:flex items-center mr-4">
                    <div className="w-8 h-8 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50 flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-[#ff0884]" />
                    </div>
                    <span
                      className={`${robotoCondensed.className} text-gray-200`}
                    >
                      {user.email}
                    </span>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium rounded-md border border-[#ff0884]/50 text-white hover:bg-[#ff0884]/10 transition-all duration-300"
                  >
                    Sair
                  </button>
                </>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)] ${
                    isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-[#ff0884] border-opacity-50"></div>
                      <span>Carregando...</span>
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon
                        icon={faGoogle}
                        size="xl"
                        className="h-4 w-4"
                      />
                      Login com Google
                    </>
                  )}
                </button>
              ))}
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-md border-t border-gray-800">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <nav className="flex flex-col space-y-4 mb-6">
              <Link
                href="/dashboard"
                className="text-gray-200 hover:text-[#ff0884] transition-colors py-2 border-b border-gray-800"
                onClick={handleLinkClick}
              >
                Dashboard
              </Link>
              <Link
                href="/tutorial"
                className="text-gray-200 hover:text-[#ff0884] transition-colors py-2 border-b border-gray-800"
                onClick={handleLinkClick}
              >
                Tutorial
              </Link>
              <Link
                href="/platforms"
                className="text-gray-200 hover:text-[#ff0884] transition-colors py-2 border-b border-gray-800"
                onClick={handleLinkClick}
              >
                Plataformas
              </Link>
            </nav>

            {!loading && user && (
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-[#ff0884]" />
                </div>
                <span
                  className={`${robotoCondensed.className} text-gray-200 text-sm`}
                >
                  {user.email}
                </span>
              </div>
            )}

            <div className="flex justify-center">
              {!loading &&
                (user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm font-medium rounded-md border border-[#ff0884]/50 text-white hover:bg-[#ff0884]/10 transition-all duration-300"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isLoggingIn}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#ff0884] text-sm font-medium rounded-md shadow-sm text-white bg-[#ff0884]/20 hover:bg-[#ff0884]/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#ff0884] transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,8,132,0.6)] ${
                      isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-[#ff0884] border-opacity-50"></div>
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <FontAwesomeIcon
                          icon={faGoogle}
                          size="xl"
                          className="h-4 w-4"
                        />
                        Login com Google
                      </>
                    )}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

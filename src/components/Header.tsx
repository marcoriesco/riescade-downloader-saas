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
    <header className="fixed w-full top-0 z-50 header-backdrop">
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
          className="md:hidden text-foreground focus:outline-none"
          onClick={toggleMenu}
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-primary" />
          ) : (
            <Menu className="h-6 w-6 text-primary" />
          )}
        </button>

        {/* Menu para desktop */}
        <div className="hidden md:flex items-center space-x-6">
          <nav className="flex items-center space-x-6 mr-4">
            {/* O Dashboard só aparece quando o usuário está logado */}
            <Link
              href="/tutorial"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Tutorial
            </Link>
            <Link
              href="/platforms"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Plataformas
            </Link>
            <Link
              href="/blog"
              className="text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Blog
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {!loading &&
              (user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center mr-4">
                    <div className="w-8 h-8 bg-primary/20 border border-primary/50 flex items-center justify-center mr-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-muted-foreground text-sm">
                      {user.email}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 text-sm font-medium bg-primary/20 border border-primary/50 text-foreground hover:bg-primary/30 transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium border border-primary/50 text-foreground hover:bg-primary/10 transition-all duration-300"
                  >
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleSignIn}
                  disabled={isLoggingIn}
                  className={`inline-flex items-center gap-2 px-4 py-2 border border-primary text-sm font-medium shadow-sm text-foreground bg-primary/20 hover:bg-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.6)] ${
                    isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoggingIn ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-primary border-opacity-50"></div>
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
        <div className="md:hidden bg-background/95 backdrop-blur-md border-t border-border">
          <div className="px-4 pt-2 pb-6 space-y-4">
            <nav className="flex flex-col space-y-4 mb-6">
              {/* O Dashboard só aparece quando o usuário está logado */}
              {user && (
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                  onClick={handleLinkClick}
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/tutorial"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Tutorial
              </Link>
              <Link
                href="/platforms"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Plataformas
              </Link>
              <Link
                href="/blog"
                className="text-muted-foreground hover:text-primary transition-colors py-2 border-b border-border"
                onClick={handleLinkClick}
              >
                Blog
              </Link>
            </nav>

            {!loading && user && (
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-primary/20 border border-primary/50 flex items-center justify-center mr-2">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="text-muted-foreground text-sm">
                  {user.email}
                </span>
              </div>
            )}

            <div className="flex justify-center">
              {!loading &&
                (user ? (
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-sm font-medium border border-primary/50 text-foreground hover:bg-primary/10 transition-all duration-300"
                  >
                    Sair
                  </button>
                ) : (
                  <button
                    onClick={handleSignIn}
                    disabled={isLoggingIn}
                    className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-primary text-sm font-medium shadow-sm text-foreground bg-primary/20 hover:bg-primary/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 hover:shadow-[0_0_15px_hsl(var(--primary)/0.6)] ${
                      isLoggingIn ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLoggingIn ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-t-2 border-primary border-opacity-50"></div>
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

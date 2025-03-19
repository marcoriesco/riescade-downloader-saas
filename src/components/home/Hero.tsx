import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Hero() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      signIn();
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-24">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>

      {/* Decorative blurred circles */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary/30 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 text-balance">
              RIESCADE Downloader
            </h1>

            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 max-w-2xl mx-auto text-balance">
              A ferramenta definitiva para baixar e gerenciar seu conteúdo.
              Simples, rápida e confiável.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Link to="/dashboard">
                  <Button size="lg" className="group">
                    Ir para o Painel
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              ) : (
                <Button size="lg" className="group" onClick={handleGetStarted}>
                  Começar Agora
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              )}

              <Button
                variant="outline"
                size="lg"
                onClick={() => (user ? navigate("/checkout") : signIn())}
              >
                Assinar Plano
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-16 relative"
          >
            <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl">
              <img
                src="/lovable-uploads/6920a135-71f0-4627-b360-f0fcf8a86be2.png"
                alt="Painel"
                className="w-full rounded-lg"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent bottom-0 h-20"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

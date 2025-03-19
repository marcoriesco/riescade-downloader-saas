import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import { Check, ArrowRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { SUBSCRIPTION_PRICE_AMOUNT } from "@/lib/stripe";

const PricingPlan = {
  name: "RIESCADE Downloader",
  description: "Acesso completo ao RIESCADE Downloader e todos os recursos",
  monthlyPrice: SUBSCRIPTION_PRICE_AMOUNT,
  features: [
    "Downloads ilimitados",
    "Acesso completo ao aplicativo RIESCADE Downloader",
    "Atualizações regulares",
    "Suporte por e-mail",
    "Acesso a todos os recursos futuros",
  ],
  priceId: "price_riescade_monthly",
};

const Index = () => {
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubscribe = async () => {
    if (!user) {
      signIn();
      return;
    }

    // Redirecionar para a página de checkout
    navigate("/checkout");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar />
      <main>
        <Hero />

        {/* Pricing Section */}
        <section className="py-24 bg-gray-50 dark:bg-gray-900/50">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Preço Simples e Transparente
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Tenha acesso completo ao RIESCADE Downloader por apenas R$
                {PricingPlan.monthlyPrice.toFixed(2)} por mês
              </p>
            </div>

            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
              >
                <div className="bg-primary/5 p-4 text-center">
                  <span className="inline-block text-primary font-medium text-sm px-3 py-1 rounded-full bg-primary/10">
                    Recomendado
                  </span>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-2">
                    {PricingPlan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    {PricingPlan.description}
                  </p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      R${PricingPlan.monthlyPrice.toFixed(2)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      /mês
                    </span>
                  </div>

                  <ul className="space-y-3 mb-8 flex-grow">
                    {PricingPlan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={handleSubscribe}
                    className="mt-auto group"
                    size="lg"
                  >
                    {user ? "Assinar Agora" : "Entre para Assinar"}
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>

                  <p className="text-sm text-gray-500 mt-4 text-center">
                    Cancele a qualquer momento. Sem compromisso de longo prazo.
                  </p>
                </div>
              </motion.div>

              <div className="mt-12 text-center">
                <h3 className="text-xl font-bold mb-4">
                  O que é o RIESCADE Downloader?
                </h3>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Download className="h-6 w-6 text-primary" />
                  <p className="text-lg font-medium">
                    A ferramenta definitiva para gerenciamento de downloads
                  </p>
                </div>
                <p className="text-gray-600 dark:text-gray-300">
                  O RIESCADE Downloader é um aplicativo poderoso que ajuda você
                  a gerenciar e organizar seus downloads. Assine hoje para obter
                  acesso completo a todos os recursos e benefícios.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Features />

        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Pronto para transformar sua experiência de download?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                Junte-se a milhares de usuários que utilizam nossa plataforma
                para melhorar sua experiência de download.
              </p>
              <Button
                size="lg"
                onClick={handleSubscribe}
                className="bg-primary hover:bg-primary/90 text-white font-semibold"
              >
                Comece Hoje Mesmo
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Index;

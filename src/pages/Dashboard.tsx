import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SubscriptionStatus from "@/components/dashboard/SubscriptionStatus";
import DownloadSection from "@/components/dashboard/DownloadSection";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Navbar />
      <main className="min-h-screen pt-28 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Painel</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Bem-vindo, {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 mb-8">
              {/* Subscription Overview Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral da Assinatura</CardTitle>
                  <CardDescription>
                    Gerencie sua assinatura atual e informações de pagamento.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SubscriptionStatus />
                </CardContent>
              </Card>

              {/* Download Section */}
              <DownloadSection />

              {/* Payment Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Pagamento</CardTitle>
                  <CardDescription>
                    Gerencie seu método de pagamento e detalhes de cobrança.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="gap-2">
                    <CreditCard className="h-4 w-4" />
                    Atualizar Método de Pagamento
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Dashboard;

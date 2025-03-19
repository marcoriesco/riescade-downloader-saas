import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  mockCreateCheckoutSession,
  SUBSCRIPTION_PRICE_AMOUNT,
} from "@/lib/stripe";
import { Check, CreditCard, ArrowLeft, Loader2 } from "lucide-react";

const formSchema = z.object({
  cardNumber: z
    .string()
    .min(16, {
      message: "O número do cartão deve ter pelo menos 16 dígitos",
    })
    .max(19),
  cardHolder: z.string().min(3, {
    message: "O nome deve ter pelo menos 3 caracteres",
  }),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: "Data de validade deve estar no formato MM/AA",
  }),
  cvc: z
    .string()
    .min(3, {
      message: "CVC deve ter pelo menos 3 dígitos",
    })
    .max(4),
});

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Redireciona para o login se o usuário não estiver autenticado
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cardNumber: "",
      cardHolder: "",
      expiryDate: "",
      cvc: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsProcessing(true);

      // Simula o processamento do pagamento
      toast({
        title: "Processando pagamento",
        description: "Aguarde enquanto processamos seu pagamento...",
      });

      // Em uma implementação real, aqui chamaríamos a API do Stripe
      // Mas como é uma simulação, usamos a função mockCreateCheckoutSession
      if (user) {
        await mockCreateCheckoutSession(user.id);

        toast({
          title: "Pagamento concluído",
          description: "Sua assinatura foi ativada com sucesso!",
        });

        // Redireciona para o dashboard após o pagamento
        setTimeout(() => {
          navigate("/dashboard");
        }, 2000);
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro no pagamento",
        description: "Não foi possível processar o pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

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
          <div className="max-w-2xl mx-auto">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-6"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar para o início
            </Button>

            <Card className="border shadow-lg">
              <CardHeader>
                <CardTitle>Checkout</CardTitle>
                <CardDescription>
                  Complete seu pagamento para ativar sua assinatura
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">RIESCADE Downloader</h3>
                    <span className="font-bold">
                      R$ {SUBSCRIPTION_PRICE_AMOUNT.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Assinatura mensal
                  </div>
                  <div className="mt-3 pt-3 border-t flex items-center text-sm text-green-600 dark:text-green-400">
                    <Check className="mr-1 h-4 w-4" />
                    Acesso imediato após confirmação
                  </div>
                </div>

                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Cartão</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                placeholder="1234 5678 9012 3456"
                                {...field}
                                className="pl-10"
                              />
                              <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cardHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome no Cartão</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Data de Validade</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/AA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input placeholder="123" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full mt-6"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          Finalizar Compra - R${" "}
                          {SUBSCRIPTION_PRICE_AMOUNT.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>

              <CardFooter className="flex flex-col items-center text-sm text-gray-500 pt-0">
                <div className="flex items-center mb-2">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pagamento seguro via Stripe
                </div>
                <p>Você pode cancelar sua assinatura a qualquer momento</p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Checkout;

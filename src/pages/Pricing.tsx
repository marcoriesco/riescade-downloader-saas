import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Check, ArrowRight, Download } from "lucide-react";
import { mockCreateCheckoutSession } from "@/lib/stripe";

const PricingPlan = {
  name: "RIESCADE Downloader",
  description: "Full access to RIESCADE Downloader and all features",
  monthlyPrice: 30,
  features: [
    "Unlimited downloads",
    "Full access to RIESCADE Downloader app",
    "Regular updates",
    "Email support",
    "Access to all future features",
  ],
  priceId: "price_riescade_monthly",
};

const Pricing = () => {
  const { user, signIn } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      signIn();
      return;
    }

    try {
      toast({
        title: "Subscription initiated",
        description: "Redirecting to checkout...",
      });

      // In a real implementation, this would create a Stripe checkout session
      await mockCreateCheckoutSession(user.id);
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description: "Failed to initiate subscription. Please try again.",
        variant: "destructive",
      });
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
      <main className="min-h-screen pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Get full access to RIESCADE Downloader for only R$30.00 per month
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
                  Recommended
                </span>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold mb-2">{PricingPlan.name}</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {PricingPlan.description}
                </p>

                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    R${PricingPlan.monthlyPrice}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">/mo</span>
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
                  {user ? "Subscribe Now" : "Sign In to Subscribe"}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>

                <p className="text-sm text-gray-500 mt-4 text-center">
                  Cancel anytime. No long-term commitment required.
                </p>
              </div>
            </motion.div>

            <div className="mt-12 text-center">
              <h3 className="text-xl font-bold mb-4">
                What is RIESCADE Downloader?
              </h3>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Download className="h-6 w-6 text-primary" />
                <p className="text-lg font-medium">
                  The ultimate download management tool
                </p>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                RIESCADE Downloader is a powerful application that helps you
                manage and organize your downloads. Subscribe today to get full
                access to all features and benefits.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Pricing;

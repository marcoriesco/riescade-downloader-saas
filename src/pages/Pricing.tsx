
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Check, ArrowRight } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const pricingPlans = [
  {
    name: 'Basic',
    description: 'Perfect for small businesses and startups',
    monthlyPrice: 49,
    yearlyPrice: 39,
    features: [
      'Basic subscription management',
      'Customer portal',
      'Up to 100 customers',
      'Email support',
      'Basic analytics',
    ],
    priceId: 'price_basic',
    highlighted: false,
  },
  {
    name: 'Professional',
    description: 'For growing businesses with advanced needs',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: [
      'Everything in Basic',
      'Advanced subscription management',
      'Unlimited customers',
      'Priority support',
      'Advanced analytics',
      'Multiple payment gateways',
      'Custom branding',
    ],
    priceId: 'price_professional',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    description: 'Custom solutions for larger organizations',
    monthlyPrice: 249,
    yearlyPrice: 199,
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom integrations',
      'Advanced security features',
      'SLA guarantees',
      'Team management',
      'Custom reporting',
    ],
    priceId: 'price_enterprise',
    highlighted: false,
  }
];

const Pricing = () => {
  const { user, signIn } = useAuth();
  const { toast } = useToast();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = (plan: typeof pricingPlans[0]) => {
    if (!user) {
      signIn();
      return;
    }

    // This would typically redirect to Stripe checkout
    toast({
      title: 'Subscription initiated',
      description: `You're subscribing to the ${plan.name} plan. Redirecting to checkout...`,
    });
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
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Choose the plan that fits your business needs
            </p>
            
            <div className="flex items-center justify-center mt-8">
              <div className="flex items-center space-x-2">
                <Label htmlFor="billing-toggle" className={billingCycle === 'monthly' ? 'font-semibold' : ''}>Monthly</Label>
                <Switch 
                  id="billing-toggle" 
                  checked={billingCycle === 'yearly'} 
                  onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                />
                <Label htmlFor="billing-toggle" className={billingCycle === 'yearly' ? 'font-semibold' : ''}>
                  Yearly <span className="text-green-600 text-sm font-semibold">Save 20%</span>
                </Label>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`
                  flex flex-col rounded-2xl overflow-hidden border 
                  ${plan.highlighted 
                    ? 'border-primary shadow-lg shadow-primary/10' 
                    : 'border-gray-200 dark:border-gray-700'}
                `}
              >
                {plan.highlighted && (
                  <div className="bg-primary text-primary-foreground text-center py-2 font-medium text-sm">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">/mo</span>
                    
                    {billingCycle === 'yearly' && (
                      <div className="text-green-600 text-sm font-medium mt-1">
                        Billed annually (${plan.yearlyPrice * 12}/year)
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-8 flex-grow">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    onClick={() => handleSubscribe(plan)} 
                    className={`mt-auto group ${plan.highlighted ? '' : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600'}`}
                    size="lg"
                  >
                    {user ? 'Choose Plan' : 'Sign In to Subscribe'} 
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">Need a custom solution?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Contact our sales team for a tailored package that meets your specific requirements.
            </p>
            <Button variant="outline" size="lg">
              Contact Sales
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Pricing;

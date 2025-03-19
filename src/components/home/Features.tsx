
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  BarChart3, 
  Users, 
  Zap, 
  ShieldCheck, 
  Globe, 
  Clock, 
  Repeat 
} from 'lucide-react';

const features = [
  {
    icon: CreditCard,
    title: 'Flexible Billing',
    description: 'Support for multiple pricing models, including subscriptions, metered billing, and one-time charges.',
  },
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Comprehensive customer profiles with subscription history and payment methods.',
  },
  {
    icon: BarChart3,
    title: 'Detailed Analytics',
    description: 'Track revenue, growth, and churn with real-time dashboards and reports.',
  },
  {
    icon: Zap,
    title: 'Automated Workflows',
    description: 'Automate subscription renewals, notifications, and payment retry logic.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure & Compliant',
    description: 'PCI DSS compliant with robust security features to protect sensitive data.',
  },
  {
    icon: Globe,
    title: 'Global Support',
    description: 'Accept payments in multiple currencies with localized billing formats.',
  },
  {
    icon: Clock,
    title: 'Trial Management',
    description: 'Flexible trial periods with automated conversion and notifications.',
  },
  {
    icon: Repeat,
    title: 'Seamless Integration',
    description: 'Connects with your existing tools through our extensive API and webhooks.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need in One Platform
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Our comprehensive solution handles the complexity of subscription management so you can focus on growing your business.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-100px" }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className="bg-primary/10 dark:bg-primary/20 p-3 rounded-lg w-fit mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600 dark:text-gray-300">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

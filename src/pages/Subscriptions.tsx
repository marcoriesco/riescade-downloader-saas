
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getActiveSubscriptions, Subscription } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Check, X, Clock } from 'lucide-react';

type SubscriptionWithUser = Subscription & {
  auth: {
    users: {
      email: string;
    }
  }
};

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchSubscriptions() {
      setIsLoading(true);
      try {
        const data = await getActiveSubscriptions();
        setSubscriptions(data as SubscriptionWithUser[]);
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSubscriptions();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><Check className="h-3 w-3 mr-1" /> Active</Badge>;
      case 'trialing':
        return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" /> Trial</Badge>;
      case 'past_due':
        return <Badge className="bg-amber-500">Past Due</Badge>;
      case 'canceled':
        return <Badge className="bg-red-500"><X className="h-3 w-3 mr-1" /> Canceled</Badge>;
      default:
        return <Badge className="bg-gray-500">{status}</Badge>;
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
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Subscriptions</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage and view all active subscriptions
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>
                  Overview of all subscriptions in the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  </div>
                ) : subscriptions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {subscriptions.map((subscription) => (
                          <TableRow key={subscription.id}>
                            <TableCell className="font-medium">{subscription.auth.users.email}</TableCell>
                            <TableCell>{subscription.plan_id || 'Standard'}</TableCell>
                            <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                            <TableCell>
                              {subscription.start_date ? format(new Date(subscription.start_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                            <TableCell>
                              {subscription.end_date ? format(new Date(subscription.end_date), 'MMM d, yyyy') : '-'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
}

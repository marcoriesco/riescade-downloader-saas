
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Users, CreditCard, Settings, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

const Admin = () => {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, auth.users!inner(*)');

        if (error) {
          console.error('Error fetching subscriptions:', error);
          return;
        }

        setSubscriptions(data || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const email = sub.auth?.users?.email || '';
    const status = sub.status || '';
    const plan = sub.plan_id || '';
    
    return (
      email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string, text: string }> = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', text: 'Active' },
      trialing: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', text: 'Trial' },
      past_due: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', text: 'Past Due' },
      canceled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', text: 'Canceled' },
      incomplete: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400', text: 'Incomplete' },
    };

    const { color, text } = statusMap[status] || { color: 'bg-gray-100 text-gray-800', text: status };

    return <Badge className={`${color} font-medium`}>{text}</Badge>;
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
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Manage subscriptions and users
              </p>
            </div>

            <Tabs defaultValue="subscriptions" className="space-y-6">
              <TabsList>
                <TabsTrigger value="subscriptions" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Subscriptions</span>
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>Users</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="subscriptions">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <CardTitle>Subscription Management</CardTitle>
                        <CardDescription>
                          View and manage all customer subscriptions
                        </CardDescription>
                      </div>
                      <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                          placeholder="Search subscriptions..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="py-8 text-center text-gray-500">Loading subscriptions...</div>
                    ) : filteredSubscriptions.length === 0 ? (
                      <div className="py-8 text-center text-gray-500">
                        {searchTerm ? 'No subscriptions matching your search' : 'No subscriptions found'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Customer</TableHead>
                              <TableHead>Plan</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Started</TableHead>
                              <TableHead>Ends</TableHead>
                              <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {filteredSubscriptions.map((subscription) => (
                              <TableRow key={subscription.id}>
                                <TableCell className="font-medium">
                                  {subscription.auth?.users?.email || 'Unknown user'}
                                </TableCell>
                                <TableCell>{subscription.plan_id || 'Standard'}</TableCell>
                                <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                                <TableCell>
                                  {subscription.start_date ? format(new Date(subscription.start_date), 'MMM d, yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                  {subscription.end_date ? format(new Date(subscription.end_date), 'MMM d, yyyy') : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                  <Button variant="outline" size="sm">
                                    Manage
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="users">
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      View and manage user accounts
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      User management interface will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Analytics</CardTitle>
                    <CardDescription>
                      View subscription metrics and performance data
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      Analytics dashboard will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Admin Settings</CardTitle>
                    <CardDescription>
                      Configure system settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      Admin settings will appear here.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Admin;

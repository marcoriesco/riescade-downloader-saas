
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SubscriptionStatus from '@/components/dashboard/SubscriptionStatus';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CreditCard, User, Settings, Bell, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuth();

  // Admin check - this is a simple check, in a real app you would have proper roles
  const isAdmin = user?.email?.endsWith('@admin.com') || false;

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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Welcome, {user?.email}
                </p>
              </div>
              
              {isAdmin && (
                <Link to="/subscriptions">
                  <Button variant="outline" className="gap-2">
                    <Users className="h-4 w-4" />
                    Manage Subscriptions
                  </Button>
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscription Overview</CardTitle>
                    <CardDescription>
                      Manage your current subscription and billing information.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SubscriptionStatus />
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and shortcuts.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-3">
                    <button className="flex items-center gap-2 p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <CreditCard className="h-5 w-5 text-gray-500" />
                      <span>Update Payment Method</span>
                    </button>
                    <button className="flex items-center gap-2 p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <Bell className="h-5 w-5 text-gray-500" />
                      <span>Notification Settings</span>
                    </button>
                    <button className="flex items-center gap-2 p-3 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <User className="h-5 w-5 text-gray-500" />
                      <span>Edit Profile</span>
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Billing</span>
                </TabsTrigger>
                <TabsTrigger value="account" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Account</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Usage Summary</CardTitle>
                    <CardDescription>
                      View your current usage and limits.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <p className="text-gray-600 dark:text-gray-300">
                        Service usage overview will appear here.
                      </p>
                      {/* Add usage charts and metrics here */}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="billing" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>
                      View your payment history and download invoices.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      No billing history available yet.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="account" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Information</CardTitle>
                    <CardDescription>
                      Manage your account details.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your dashboard experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-300">
                      Settings options will appear here.
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

export default Dashboard;

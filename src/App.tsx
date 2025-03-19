
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth";
import { SubscriptionProvider } from "./hooks/useSubscription";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Pricing from "./pages/Pricing";
import Admin from "./pages/Admin";
import Subscriptions from "./pages/Subscriptions";
import NotFound from "./pages/NotFound";
import { PrivateRoute } from "./components/auth/PrivateRoute";
import { AdminRoute } from "./components/auth/AdminRoute";
import { AnimatePresence } from "framer-motion";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SubscriptionProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/admin" 
                  element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } 
                />
                <Route 
                  path="/subscriptions" 
                  element={
                    <AdminRoute>
                      <Subscriptions />
                    </AdminRoute>
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </BrowserRouter>
        </TooltipProvider>
      </SubscriptionProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

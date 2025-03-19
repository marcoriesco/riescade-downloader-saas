import { createContext, useContext, useEffect, useState } from "react";
import { getSubscription, Subscription } from "../lib/supabase";
import { updateSubscriptionStatus } from "../lib/stripe";
import { useAuth } from "./useAuth";

type SubscriptionContextProps = {
  subscription: Subscription | null;
  isLoading: boolean;
  isActive: boolean;
  updateStatus: (status: string) => Promise<void>;
  refetch: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextProps | undefined>(
  undefined
);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      return;
    }

    setIsLoading(true);
    const data = await getSubscription(user.id);
    setSubscription(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  // Function to update subscription status in Supabase
  const updateStatus = async (status: string) => {
    if (!user) return;

    try {
      setIsLoading(true);
      await updateSubscriptionStatus(user.id, status);
      await fetchSubscription(); // Refresh subscription data
    } catch (error) {
      console.error("Error updating subscription status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isActive =
    subscription?.status === "active" || subscription?.status === "trialing";

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        isActive,
        updateStatus,
        refetch: fetchSubscription,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
};

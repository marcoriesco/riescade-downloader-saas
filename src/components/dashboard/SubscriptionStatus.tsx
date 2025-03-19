
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertCircle, 
  Clock,
  CalendarClock, 
  CalendarX 
} from 'lucide-react';
import { format } from 'date-fns';

export default function SubscriptionStatus() {
  const { subscription, isLoading, isActive } = useSubscription();

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 animate-pulse">
        <div className="h-7 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />
          <h3 className="text-lg font-medium">No Subscription</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          You don't have an active subscription. Subscribe to access premium features.
        </p>
        <Link to="/pricing">
          <Button>View Plans</Button>
        </Link>
      </div>
    );
  }

  const getStatusDetails = () => {
    switch (subscription.status) {
      case 'active':
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />,
          title: 'Active Subscription',
          description: 'Your subscription is active and in good standing.',
          className: 'border-green-100 dark:border-green-900/20 bg-green-50/50 dark:bg-green-900/10',
        };
      case 'trialing':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500 mr-2" />,
          title: 'Trial Period',
          description: `Your trial will end on ${subscription.trial_end ? format(new Date(subscription.trial_end), 'MMMM d, yyyy') : 'soon'}.`,
          className: 'border-blue-100 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-900/10',
        };
      case 'past_due':
        return {
          icon: <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />,
          title: 'Payment Past Due',
          description: 'We were unable to process your last payment. Please update your payment method.',
          className: 'border-amber-100 dark:border-amber-900/20 bg-amber-50/50 dark:bg-amber-900/10',
        };
      case 'canceled':
        return {
          icon: <CalendarX className="h-5 w-5 text-red-500 mr-2" />,
          title: 'Subscription Canceled',
          description: `Your subscription has been canceled. Access will end on ${format(new Date(subscription.end_date), 'MMMM d, yyyy')}.`,
          className: 'border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10',
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />,
          title: 'Subscription Status',
          description: `Status: ${subscription.status}`,
          className: '',
        };
    }
  };

  const status = getStatusDetails();

  return (
    <div className={`border rounded-lg p-6 ${status.className}`}>
      <div className="flex items-center mb-4">
        {status.icon}
        <h3 className="text-lg font-medium">{status.title}</h3>
      </div>
      <p className="text-gray-600 dark:text-gray-300 mb-4">{status.description}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plan</p>
          <p className="font-medium">{subscription.plan_id || 'Standard'}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Billing Period</p>
          <p className="font-medium">
            {format(new Date(subscription.start_date), 'MMM d, yyyy')} - {format(new Date(subscription.end_date), 'MMM d, yyyy')}
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Link to="/pricing">
          <Button variant="outline" size="sm">Change Plan</Button>
        </Link>
        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10">
          Cancel Subscription
        </Button>
      </div>
    </div>
  );
}

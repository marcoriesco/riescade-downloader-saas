import { useSubscription } from "@/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  CalendarX,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function SubscriptionStatus() {
  const { subscription, isLoading, isActive } = useSubscription();
  const navigate = useNavigate();

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
          <h3 className="text-lg font-medium">Sem Assinatura</h3>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Você não tem uma assinatura ativa. Assine o RIESCADE Downloader para
          acessar todos os recursos e fazer downloads.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button
            onClick={() => navigate("/checkout")}
            className="flex items-center gap-1"
          >
            <CreditCard className="h-4 w-4 mr-1" />
            Assinar Agora
          </Button>
          <Link to="/">
            <Button variant="outline">Ver Detalhes do Plano</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusDetails = () => {
    switch (subscription.status) {
      case "active":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />,
          title: "Assinatura Ativa",
          description: "Sua assinatura está ativa e em dia.",
          className:
            "border-green-100 dark:border-green-900/20 bg-green-50/50 dark:bg-green-900/10",
        };
      case "trialing":
        return {
          icon: <Clock className="h-5 w-5 text-blue-500 mr-2" />,
          title: "Período de Teste",
          description: `Seu período de teste terminará em ${
            subscription.trial_end
              ? format(
                  new Date(subscription.trial_end),
                  "d 'de' MMMM 'de' yyyy",
                  { locale: ptBR }
                )
              : "breve"
          }.`,
          className:
            "border-blue-100 dark:border-blue-900/20 bg-blue-50/50 dark:bg-blue-900/10",
        };
      case "past_due":
        return {
          icon: <AlertCircle className="h-5 w-5 text-amber-500 mr-2" />,
          title: "Pagamento Atrasado",
          description:
            "Não conseguimos processar seu último pagamento. Por favor, atualize seu método de pagamento.",
          className:
            "border-amber-100 dark:border-amber-900/20 bg-amber-50/50 dark:bg-amber-900/10",
        };
      case "canceled":
        return {
          icon: <CalendarX className="h-5 w-5 text-red-500 mr-2" />,
          title: "Assinatura Cancelada",
          description: `Sua assinatura foi cancelada. O acesso terminará em ${format(
            new Date(subscription.end_date),
            "d 'de' MMMM 'de' yyyy",
            { locale: ptBR }
          )}.`,
          className:
            "border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/10",
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500 mr-2" />,
          title: "Status da Assinatura",
          description: `Status: ${subscription.status}`,
          className: "",
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
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {status.description}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Plano</p>
          <p className="font-medium">{subscription.plan_id || "Padrão"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Período de Cobrança
          </p>
          <p className="font-medium">
            {format(new Date(subscription.start_date), "d MMM yyyy", {
              locale: ptBR,
            })}{" "}
            -{" "}
            {format(new Date(subscription.end_date), "d MMM yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
      </div>

      {/* Botões de renovação ou atualização de pagamento para assinaturas com problemas */}
      {subscription.status === "past_due" && (
        <Button onClick={() => navigate("/checkout")} className="mt-2">
          Atualizar Pagamento
        </Button>
      )}

      {subscription.status === "canceled" && (
        <Button onClick={() => navigate("/checkout")} className="mt-2">
          Renovar Assinatura
        </Button>
      )}
    </div>
  );
}

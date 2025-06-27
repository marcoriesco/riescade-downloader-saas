"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, Mail, Clock } from "lucide-react";

interface OrderDetails {
  id: number;
  stripe_session_id: string;
  customer_email: string;
  customer_name: string;
  amount_total: number;
  currency: string;
  status: string;
  shipping_address?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
  };
  cep?: string;
  shipping_value: number;
  created_at: string;
}

export default function SucessoContent() {
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      // Buscar detalhes do pedido
      fetchOrderDetails(sessionId);
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchOrderDetails = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/orders/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else if (response.status === 404) {
        console.log(
          "Pedido não encontrado, mas isso é normal se o webhook ainda não processou"
        );
        // Não definir orderDetails, deixar mostrar a mensagem padrão
      } else {
        console.error("Erro ao buscar detalhes do pedido:", response.status);
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-white">Carregando detalhes do pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header de Sucesso */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Pedido Confirmado!
            </h1>
            <p className="text-xl text-gray-300">
              Seu HD Nintendo Switch será enviado em breve
            </p>
          </div>

          {/* Card Principal */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center mb-6">
              <Package className="w-8 h-8 text-pink-500 mr-3" />
              <h2 className="text-2xl font-bold text-white">
                Detalhes do Pedido
              </h2>
            </div>

            {orderDetails ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-300">Produto:</span>
                  <span className="text-white font-semibold">
                    HD 1TB Nintendo Switch
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-300">Valor:</span>
                  <span className="text-white font-semibold">
                    R${" "}
                    {(orderDetails.amount_total / 100)
                      .toFixed(2)
                      .replace(".", ",")}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                  <span className="text-gray-300">Email:</span>
                  <span className="text-white font-semibold">
                    {orderDetails.customer_email}
                  </span>
                </div>
                {orderDetails.shipping_address && (
                  <div className="py-3 border-b border-white/10">
                    <span className="text-gray-300 block mb-2">
                      Endereço de Entrega:
                    </span>
                    <span className="text-white">
                      {orderDetails.shipping_address.line1},{" "}
                      {orderDetails.shipping_address.line2 || ""}
                      <br />
                      {orderDetails.shipping_address.city} -{" "}
                      {orderDetails.shipping_address.state}
                      <br />
                      CEP: {orderDetails.shipping_address.postal_code}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-300 mb-4">
                  Pedido processado com sucesso!
                </p>
                <p className="text-gray-400 text-sm mb-4">
                  Os detalhes completos foram enviados para seu email.
                </p>
                <p className="text-gray-500 text-xs">
                  💡 Os detalhes do pedido podem demorar alguns segundos para
                  aparecer enquanto processamos sua compra.
                </p>
              </div>
            )}
          </div>

          {/* Próximos Passos */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <Clock className="w-6 h-6 text-pink-500 mr-3" />
              Próximos Passos
            </h3>

            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white text-xs font-bold">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Email de Confirmação
                  </p>
                  <p className="text-gray-300 text-sm">
                    Você receberá um email com todos os detalhes do pedido em
                    instantes.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white text-xs font-bold">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold">
                    Preparação do Produto
                  </p>
                  <p className="text-gray-300 text-sm">
                    Seu HD será configurado com todos os jogos e emuladores em
                    até 24 horas.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white text-xs font-bold">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Envio</p>
                  <p className="text-gray-300 text-sm">
                    O produto será enviado via SEDEX ou PAC conforme sua
                    escolha.
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-6 h-6 bg-pink-500 rounded-full flex items-center justify-center mr-3 mt-1">
                  <span className="text-white text-xs font-bold">4</span>
                </div>
                <div>
                  <p className="text-white font-semibold">Acompanhamento</p>
                  <p className="text-gray-300 text-sm">
                    Você receberá o código de rastreamento por email.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Suporte */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-8 border border-white/20">
            <div className="flex items-center mb-4">
              <Mail className="w-6 h-6 text-pink-500 mr-3" />
              <h3 className="text-xl font-bold text-white">
                Precisa de Ajuda?
              </h3>
            </div>
            <p className="text-gray-300 mb-4">
              Em caso de dúvidas sobre seu pedido, entre em contato conosco:
            </p>
            <div className="space-y-2">
              <p className="text-white">
                <span className="text-pink-500">Email:</span> riescade@gmail.com
              </p>
              <p className="text-white">
                <span className="text-pink-500">WhatsApp:</span> (11) 99999-9999
              </p>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-bold py-4 px-6 rounded-xl transition-colors text-center"
            >
              Voltar ao Início
            </Link>
            <Link
              href="/dashboard"
              className="flex-1 bg-transparent border-2 border-pink-500 text-pink-500 hover:bg-pink-500 hover:text-white font-bold py-4 px-6 rounded-xl transition-colors text-center"
            >
              Ver Pedidos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

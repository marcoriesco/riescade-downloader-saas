"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Scroll,
  AlertTriangle,
  ShieldCheck,
  CreditCard,
  Download,
  XCircle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";

export default function TermsOfService() {

  return (
    <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>

      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50">
              <Scroll className="h-10 w-10 text-[#ff0884]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Termos de Serviço
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Ao utilizar nossos serviços, você concorda com os seguintes termos e
            condições.
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <AlertCircle className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Última Atualização
                </h2>
                <p className="text-gray-300">
                  Estes termos de serviço foram atualizados em 25 de Março de
                  2024.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <ShieldCheck className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Aceitação dos Termos
                </h2>
                <p className="text-gray-300 mb-4">
                  Ao acessar ou usar o serviço RIESCADE, você concorda em estar
                  vinculado a estes Termos de Serviço. Se você não concordar com
                  alguma parte destes termos, você não poderá acessar o serviço.
                </p>
                <p className="text-gray-300">
                  Estes Termos de Serviço se aplicam a todos os visitantes,
                  usuários e outras pessoas que acessam ou usam o Serviço.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <CreditCard className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Assinaturas e Pagamentos
                </h2>
                <p className="text-gray-300 mb-4">
                  Algumas partes do serviço RIESCADE estão disponíveis mediante
                  o pagamento de uma taxa de assinatura. Você será cobrado
                  antecipadamente em uma base recorrente e periódica (como
                  mensal ou anual), dependendo do tipo de plano de assinatura
                  que você selecionar.
                </p>
                <p className="text-gray-300 mb-4">
                  No final de cada período, sua assinatura será automaticamente
                  renovada sob os mesmos termos, a menos que você a cancele ou o
                  RIESCADE cancele. Você pode cancelar sua assinatura a qualquer
                  momento através da sua página de configurações de conta.
                </p>
                <p className="text-gray-300">
                  Todas as taxas de assinatura são não reembolsáveis. Nenhum
                  reembolso ou crédito será concedido por períodos parciais de
                  serviço, upgrades/downgrades ou meses não utilizados.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Download className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Conteúdo e Acesso
                </h2>
                <p className="text-gray-300 mb-4">
                  O RIESCADE oferece acesso a uma variedade de conteúdos
                  digitais, incluindo jogos e software para diversas
                  plataformas. O acesso a determinados conteúdos pode ser
                  restrito a membros com assinatura ativa.
                </p>
                <p className="text-gray-300 mb-4">
                  O conteúdo disponibilizado através do RIESCADE é apenas para
                  uso pessoal e não comercial. Você não tem permissão para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>
                    Redistribuir, vender ou licenciar qualquer parte do conteúdo
                  </li>
                  <li>
                    Contornar, desativar ou interferir nos recursos de segurança
                    do serviço
                  </li>
                  <li>
                    Utilizar o serviço para fins que violem leis ou regulamentos
                    aplicáveis
                  </li>
                  <li>
                    Compartilhar sua conta ou credenciais de acesso com
                    terceiros
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <XCircle className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Limitação de Responsabilidade
                </h2>
                <p className="text-gray-300 mb-4">
                  Em nenhum caso o RIESCADE, nem seus diretores, funcionários,
                  parceiros, agentes, fornecedores ou afiliados, serão
                  responsáveis por quaisquer danos indiretos, incidentais,
                  especiais, consequenciais ou punitivos, incluindo, sem
                  limitação, perda de lucros, dados, uso, boa vontade, ou outras
                  perdas intangíveis, resultantes:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>
                    Do seu acesso ou uso ou incapacidade de acessar ou usar o
                    serviço
                  </li>
                  <li>
                    De qualquer conduta ou conteúdo de terceiros no serviço
                  </li>
                  <li>De qualquer conteúdo obtido do serviço</li>
                  <li>
                    De acesso não autorizado, uso ou alteração de suas
                    transmissões ou conteúdo
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <AlertTriangle className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Rescisão</h2>
                <p className="text-gray-300 mb-4">
                  Podemos encerrar ou suspender o acesso ao nosso serviço
                  imediatamente, sem aviso prévio ou responsabilidade, por
                  qualquer motivo, incluindo, sem limitação, se você violar os
                  Termos.
                </p>
                <p className="text-gray-300">
                  Todas as disposições dos Termos que, por sua natureza, devem
                  sobreviver à rescisão, sobreviverão à rescisão, incluindo, sem
                  limitação, disposições de propriedade, renúncias de garantia,
                  indenização e limitações de responsabilidade.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Se você tiver dúvidas sobre estes termos, entre em contato
                conosco.
              </p>
              <div className="flex justify-center gap-4 mt-4">
                <Link
                  href="/politica"
                  className="text-[#ff0884] hover:text-[#ff0884]/70 transition-colors duration-200"
                >
                  Política de Privacidade
                </Link>
                <span className="text-gray-600">|</span>
                <Link
                  href="/dashboard"
                  className="text-[#ff0884] hover:text-[#ff0884]/70 transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </div>
              <div className="inline-flex mt-6 border border-[#ff0884]/30 rounded-lg overflow-hidden">
                <Image
                  src="/images/logos.webp"
                  alt="RIESCADE Logo"
                  width={120}
                  height={120}
                  className="h-16 w-16 object-contain"
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

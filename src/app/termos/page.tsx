"use client";

import {
  FileText,
  AlertTriangle,
  Copyright,
  Download,
  Zap,
  CreditCard,
} from "lucide-react";
import { Header } from "@/components/Header";
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
              <FileText className="h-10 w-10 text-[#ff0884]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Termos de Uso</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Leia com atenção os termos e condições para utilização dos nossos
            serviços
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <AlertTriangle className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Última Atualização
                </h2>
                <p className="text-gray-300">
                  Estes termos foram atualizados em 25 de Março de 2024.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <FileText className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Aceitação dos Termos
                </h2>
                <p className="text-gray-300 mb-4">
                  Ao acessar ou usar o serviço RIESCADE, você concorda em ficar
                  vinculado a estes Termos de Serviço. Se você não concordar com
                  qualquer parte dos termos, não poderá acessar o serviço.
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
                <CreditCard className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Assinaturas e Pagamentos
                </h2>
                <p className="text-gray-300 mb-4">
                  O RIESCADE oferece assinaturas pagas que dão acesso a
                  conteúdos exclusivos. Ao assinar nosso serviço:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>
                    Você concorda em pagar todas as taxas na data de vencimento
                  </li>
                  <li>
                    As assinaturas são renovadas automaticamente até que sejam
                    canceladas
                  </li>
                  <li>
                    Você pode cancelar sua assinatura a qualquer momento através
                    do seu painel
                  </li>
                  <li>
                    Não oferecemos reembolsos para períodos parciais de
                    assinatura
                  </li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Podemos modificar os preços das assinaturas mediante aviso
                  prévio. Continuando a usar o serviço após uma mudança de
                  preço, você aceita o novo preço.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Copyright className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Direitos Autorais e Propriedade Intelectual
                </h2>
                <p className="text-gray-300 mb-4">
                  Todo o conteúdo disponibilizado através do RIESCADE, incluindo
                  textos, gráficos, logotipos, ícones, imagens, clipes de áudio,
                  downloads digitais e software, é propriedade do RIESCADE ou de
                  seus fornecedores de conteúdo e está protegido por leis de
                  direitos autorais.
                </p>
                <p className="text-gray-300">
                  O RIESCADE respeita os direitos de propriedade intelectual de
                  terceiros e espera que seus usuários façam o mesmo. Se você
                  acredita que seu trabalho foi copiado de uma maneira que
                  constitui violação de direitos autorais, entre em contato
                  conosco.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Zap className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Limitação de Responsabilidade
                </h2>
                <p className="text-gray-300 mb-4">
                  O RIESCADE não garante que o serviço atenderá aos seus
                  requisitos ou que o serviço será ininterrupto, oportuno,
                  seguro ou livre de erros.
                </p>
                <p className="text-gray-300 mb-4">
                  O RIESCADE não será responsável por quaisquer danos indiretos,
                  incidentais, especiais, consequenciais ou exemplares,
                  incluindo, entre outros, danos por perda de lucros, boa
                  vontade, uso, dados ou outras perdas intangíveis.
                </p>
                <p className="text-gray-300">
                  O uso de qualquer conteúdo baixado ou obtido através do
                  serviço é por sua conta e risco, e você será o único
                  responsável por qualquer dano ao seu sistema de computador ou
                  perda de dados que resulte do download de tal conteúdo.
                </p>
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
                Ao utilizar o RIESCADE, você confirma que leu, entendeu e
                concorda com estes termos.
              </p>
              <div className="inline-flex mt-2 border border-[#ff0884]/30 rounded-lg overflow-hidden">
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
    </div>
  );
}

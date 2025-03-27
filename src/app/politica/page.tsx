"use client";

import { Shield, Lock, Eye, Users, Server, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import Image from "next/image";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>

      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50">
              <Shield className="h-10 w-10 text-[#ff0884]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Política de Privacidade
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Comprometidos com a proteção e transparência no uso dos seus dados
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
                  Esta política de privacidade foi atualizada em 25 de Março de
                  2024.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Eye className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Coleta de Informações
                </h2>
                <p className="text-gray-300 mb-4">
                  Coletamos informações quando você se registra em nosso site,
                  faz login com sua conta do Google, realiza uma compra ou
                  assina nossos serviços.
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>
                    Informações de identificação pessoal (nome, e-mail, etc.)
                  </li>
                  <li>
                    Informações de faturamento para processamento de pagamentos
                  </li>
                  <li>
                    Informações do dispositivo e navegador para melhorar a
                    experiência
                  </li>
                  <li>
                    Dados de uso e preferências para personalizar o serviço
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Users className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Uso das Informações
                </h2>
                <p className="text-gray-300 mb-4">
                  As informações que coletamos são utilizadas para:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Fornecer, operar e manter nossos serviços</li>
                  <li>Processar transações e gerenciar sua conta</li>
                  <li>Enviar informações administrativas</li>
                  <li>Melhorar nossos serviços e experiência do usuário</li>
                  <li>Providenciar suporte ao cliente</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Server className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Proteção de Informações
                </h2>
                <p className="text-gray-300 mb-4">
                  Implementamos uma variedade de medidas de segurança para
                  manter a segurança das suas informações pessoais quando você
                  realiza uma transação ou acessa suas informações pessoais.
                </p>
                <p className="text-gray-300">
                  Utilizamos criptografia de ponta a ponta para proteger dados
                  sensíveis transmitidos online, e também protegemos suas
                  informações offline. Apenas funcionários que precisam realizar
                  um trabalho específico têm acesso a informações pessoais
                  identificáveis.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Lock className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">Cookies</h2>
                <p className="text-gray-300 mb-4">
                  Usamos cookies para melhorar sua experiência em nosso site,
                  incluindo:
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-300 pl-4">
                  <li>Manter você conectado durante sua visita</li>
                  <li>Entender como você usa nosso serviço</li>
                  <li>Personalizar o conteúdo com base em suas preferências</li>
                </ul>
                <p className="text-gray-300 mt-4">
                  Você pode escolher desativar os cookies através das
                  configurações do seu navegador. No entanto, isso pode afetar
                  sua experiência com nossos serviços.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Users className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Divulgação a Terceiros
                </h2>
                <p className="text-gray-300 mb-4">
                  Não vendemos, negociamos ou transferimos suas informações de
                  identificação pessoal para terceiros sem o seu consentimento,
                  exceto para fornecer os serviços solicitados, como
                  processamento de pagamentos.
                </p>
                <p className="text-gray-300">
                  Podemos divulgar suas informações quando acreditamos que a
                  liberação é apropriada para cumprir a lei, fazer cumprir as
                  políticas do nosso site ou proteger nossos ou outros direitos,
                  propriedade ou segurança.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="text-center">
              <p className="text-gray-400 mb-4">
                Se tiver dúvidas sobre esta política de privacidade, entre em
                contato conosco.
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

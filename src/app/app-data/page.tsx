"use client";

import Link from "next/link";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Trash2,
  AlertTriangle,
  Smartphone,
  Mail,
  Shield,
  Clock,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

export default function AppDataDeletion() {
  return (
    <div className="min-h-screen bg-gray-900 bg-grid-white/5 relative">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gamer-dark via-black to-black opacity-90 z-0"></div>

      <Header />

      <main className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-[#ff0884]/20 border border-[#ff0884]/50">
              <Trash2 className="h-10 w-10 text-[#ff0884]" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Exclusão de Dados do Aplicativo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Informações sobre como solicitar a exclusão dos seus dados pessoais do nosso aplicativo.
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
                  Aviso Importante
                </h2>
                <p className="text-gray-300">
                  A exclusão dos dados é permanente e irreversível. Uma vez excluídos, 
                  não será possível recuperar suas informações, progresso no jogo ou 
                  configurações personalizadas.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Smartphone className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Método 1: Exclusão pelo Aplicativo
                </h2>
                <p className="text-gray-300 mb-4">
                  A forma mais rápida de excluir seus dados é diretamente pelo aplicativo:
                </p>
                <ol className="list-decimal list-inside text-gray-300 space-y-2">
                  <li>Abra o aplicativo RIESCADE</li>
                  <li>Vá para "Configurações" ou "Settings"</li>
                  <li>Procure por "Conta" ou "Account"</li>
                  <li>Selecione "Excluir Conta" ou "Delete Account"</li>
                  <li>Confirme a exclusão seguindo as instruções na tela</li>
                </ol>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Trash2 className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Método 2: Desinstalação do Aplicativo
                </h2>
                <p className="text-gray-300 mb-4">
                  Desinstalar o aplicativo também remove automaticamente todos os dados locais:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li>Dados de progresso salvos localmente</li>
                  <li>Configurações personalizadas</li>
                  <li>Cache e arquivos temporários</li>
                  <li>Preferências do usuário</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Mail className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Método 3: Solicitação Manual por E-mail
                </h2>
                <p className="text-gray-300 mb-4">
                  Se você não conseguir excluir seus dados pelos métodos acima, 
                  pode solicitar a exclusão por e-mail:
                </p>
                <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                  <p className="text-gray-300 mb-2">
                    <strong>E-mail:</strong> <span className="text-[#ff0884]">support@riescade.com</span>
                  </p>
                  <p className="text-gray-300 mb-2">
                    <strong>Assunto:</strong> Solicitação de Exclusão de Dados
                  </p>
                  <p className="text-gray-300">
                    <strong>Informações necessárias:</strong>
                  </p>
                  <ul className="list-disc list-inside text-gray-300 mt-2 space-y-1">
                    <li>Seu ID de usuário ou e-mail cadastrado</li>
                    <li>Confirmação de que deseja excluir todos os dados</li>
                    <li>Motivo da solicitação (opcional)</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Shield className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Dados de Terceiros
                </h2>
                <p className="text-gray-300 mb-4">
                  Nosso aplicativo utiliza serviços de terceiros que podem armazenar dados adicionais:
                </p>
                <div className="space-y-4">
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Google Play Games Services</h3>
                    <p className="text-gray-300 mb-2">
                      Para excluir dados do Google Play Games:
                    </p>
                    <ol className="list-decimal list-inside text-gray-300 space-y-1">
                      <li>Acesse play.google.com/settings</li>
                      <li>Vá para "Dados salvos nos jogos"</li>
                      <li>Encontre RIESCADE e clique em "Excluir"</li>
                    </ol>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-white mb-2">Unity Ads</h3>
                    <p className="text-gray-300">
                      Para gerenciar dados de publicidade do Unity, visite: 
                      <a href="https://unity3d.com/legal/privacy-policy" className="text-[#ff0884] hover:underline ml-1">
                        unity3d.com/legal/privacy-policy
                      </a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <Clock className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Tempo de Processamento
                </h2>
                <p className="text-gray-300 mb-4">
                  Os prazos para exclusão de dados variam conforme o método:
                </p>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  <li><strong>Exclusão pelo app:</strong> Imediata</li>
                  <li><strong>Desinstalação:</strong> Imediata para dados locais</li>
                  <li><strong>Solicitação por e-mail:</strong> Até 30 dias úteis</li>
                  <li><strong>Dados de terceiros:</strong> Conforme política de cada serviço</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <CheckCircle className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Confirmação de Exclusão
                </h2>
                <p className="text-gray-300">
                  Após a exclusão dos dados, você receberá uma confirmação por e-mail 
                  (quando aplicável) informando que o processo foi concluído com sucesso. 
                  A partir desse momento, não será mais possível recuperar os dados excluídos.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 shadow-lg overflow-hidden p-6">
            <div className="flex items-start mb-4">
              <div className="p-2 rounded-full bg-[#ff0884]/20 mr-4">
                <HelpCircle className="h-6 w-6 text-[#ff0884]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Precisa de Ajuda?
                </h2>
                <p className="text-gray-300 mb-4">
                  Se você tiver dúvidas sobre o processo de exclusão de dados ou 
                  encontrar dificuldades, nossa equipe de suporte está pronta para ajudar:
                </p>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-gray-300">
                    <strong>E-mail de Suporte:</strong> 
                    <a href="mailto:support@riescade.com" className="text-[#ff0884] hover:underline ml-1">
                      support@riescade.com
                    </a>
                  </p>
                  <p className="text-gray-300 mt-2">
                    <strong>Horário de Atendimento:</strong> Segunda a Sexta, 9h às 18h (horário de Brasília)
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

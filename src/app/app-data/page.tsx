"use client";

import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import { Trash2, AlertTriangle, CheckCircle, ExternalLink, Mail, Smartphone } from "lucide-react";

export default function AppDataDeletion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Trash2 className="w-16 h-16 text-red-400" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Exclusão de Dados - RIESCADE Quiz Gamer
            </h1>
          </div>

          <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-6 mb-8">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-300 font-semibold mb-2">⚠️ ATENÇÃO:</h3>
                <p className="text-yellow-100">
                  A exclusão de dados é permanente e irreversível. Após a exclusão, você perderá todo o seu progresso, pontuações e conquistas no jogo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 text-white">
            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3" />
                📋 Dados que Serão Excluídos
              </h2>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-green-300 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    ✅ Dados que PODEMOS excluir:
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-200 ml-6">
                    <li><strong>Progresso Local:</strong> Todas as pontuações e progresso salvos no seu dispositivo</li>
                    <li><strong>Preferências:</strong> Configurações e preferências do jogo</li>
                    <li><strong>Estatísticas Locais:</strong> Dados de uso armazenados localmente</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-blue-300 mb-3 flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2" />
                    ℹ️ Dados gerenciados por terceiros:
                  </h3>
                  <ul className="list-disc list-inside space-y-3 text-gray-200 ml-6">
                    <li>
                      <strong>Google Play Games:</strong> Você deve excluir através do próprio Google
                      <br />
                      <a 
                        href="https://support.google.com/accounts/answer/3024190" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center mt-1"
                      >
                        → Como excluir dados do Google Play Games
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </li>
                    <li>
                      <strong>Unity Ads:</strong> Dados publicitários gerenciados pela Unity
                      <br />
                      <a 
                        href="https://unity3d.com/legal/privacy-policy" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline inline-flex items-center mt-1"
                      >
                        → Política de Privacidade Unity
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-6">🔄 Métodos de Exclusão</h2>
              
              <div className="space-y-6">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-medium text-green-300 mb-3">Método 1: Exclusão Automática (Recomendado)</h3>
                  <p className="text-gray-200 mb-4">Para excluir automaticamente seus dados locais:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-200 ml-4">
                    <li>Abra o app RIESCADE Quiz Gamer</li>
                    <li>Vá para ⚙️ <strong>Configurações</strong></li>
                    <li>Toque em 🗑️ <strong>&quot;Excluir Todos os Dados&quot;</strong></li>
                    <li>Confirme a exclusão</li>
                  </ol>
                  <p className="text-sm text-green-200 mt-3 italic">
                    Este método remove instantaneamente todos os dados locais do app.
                  </p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-medium text-blue-300 mb-3 flex items-center">
                    <Smartphone className="w-5 h-5 mr-2" />
                    Método 2: Desinstalação do App
                  </h3>
                  <p className="text-gray-200 mb-4">Desinstalar o app remove automaticamente todos os dados locais:</p>
                  <ol className="list-decimal list-inside space-y-2 text-gray-200 ml-4">
                    <li>Vá para <strong>Configurações</strong> do seu dispositivo</li>
                    <li>Selecione <strong>Apps</strong> ou <strong>Gerenciar Apps</strong></li>
                    <li>Encontre <strong>RIESCADE Quiz Gamer</strong></li>
                    <li>Toque em <strong>Desinstalar</strong></li>
                  </ol>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-6">
                  <h3 className="text-xl font-medium text-purple-300 mb-3 flex items-center">
                    <Mail className="w-5 h-5 mr-2" />
                    Método 3: Solicitação Manual
                  </h3>
                  <p className="text-gray-200 mb-4">Se você não conseguir usar os métodos acima, envie uma solicitação:</p>
                  
                  <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-4 mb-4">
                    <h4 className="text-blue-300 font-semibold mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2" />
                      📧 Contato para Exclusão:
                    </h4>
                    <p className="text-white"><strong>Email:</strong> privacy@riescade.com</p>
                    <p className="text-white"><strong>Assunto:</strong> Solicitação de Exclusão de Dados - RIESCADE Quiz Gamer</p>
                  </div>

                  <p className="text-gray-200 mb-3"><strong>Inclua as seguintes informações:</strong></p>
                  <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                    <li>Seu nome completo</li>
                    <li>Email usado no Google Play Games (se aplicável)</li>
                    <li>ID do Google Play Games (se souber)</li>
                    <li>Modelo do dispositivo</li>
                    <li>Confirmação: &quot;Eu confirmo que desejo excluir permanentemente todos os meus dados do RIESCADE Quiz Gamer&quot;</li>
                  </ul>

                  <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
                    <p className="text-yellow-200">
                      <strong>📅 Prazo:</strong> Processaremos sua solicitação em até 30 dias úteis conforme LGPD e GDPR.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-6">🔒 Dados de Terceiros</h2>
              <p className="text-gray-200 mb-4">Para excluir dados coletados por serviços de terceiros, use os links diretos:</p>
              
              <div className="bg-white/5 rounded-lg p-6 border border-white/10 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Google Play Games Services</h3>
                  <p className="text-gray-200 mb-3">Exclua seus dados diretamente no Google:</p>
                  <a 
                    href="https://support.google.com/accounts/answer/3024190" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Excluir Dados do Google Play Games
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Unity Ads (Dados Publicitários)</h3>
                  <p className="text-gray-200 mb-3">Opte por não receber anúncios personalizados:</p>
                  <a 
                    href="https://unity3d.com/legal/privacy-policy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    Configurar Privacidade Unity Ads
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-6 flex items-center">
                <CheckCircle className="w-6 h-6 mr-3" />
                ✅ Confirmação de Exclusão
              </h2>
              <p className="text-gray-200 mb-3">Após a exclusão dos dados locais, você receberá:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                <li>Confirmação visual no app (se usando Método 1)</li>
                <li>Email de confirmação (se usando Método 3)</li>
                <li>Remoção imediata de todos os dados locais</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-blue-300 mb-6">🆘 Suporte</h2>
              <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg p-6">
                <p className="text-gray-200 mb-4">Se você tiver problemas com a exclusão de dados ou dúvidas:</p>
                <div className="space-y-2 text-white">
                  <p><strong>📧 Email:</strong> privacy@riescade.com</p>
                  <p><strong>📱 Desenvolvedor:</strong> RIESCADE</p>
                  <p><strong>🌍 Website:</strong> riescade.com</p>
                  <p><strong>⏰ Resposta:</strong> Em até 48 horas</p>
                </div>
              </div>
            </section>

            <div className="border-t border-white/20 pt-6 mt-8">
              <p className="text-sm text-gray-400 text-center">
                Esta página está em conformidade com LGPD, GDPR e políticas do Google Play Store. Última atualização: 3 de agosto de 2025.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import { Header } from "@/components/Header";
import Footer from "@/components/Footer";

export default function AppPrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="prose prose-invert max-w-none">
            <h1 className="text-4xl font-bold text-white mb-6 text-center">
              Política de Privacidade - RIESCADE Quiz Gamer
            </h1>
            <p className="text-gray-300 italic text-center mb-8">
              Data de atualização: 3 de agosto de 2025
            </p>

            <div className="space-y-8 text-white">
              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">1. Introdução</h2>
                <p className="text-gray-200 leading-relaxed">
                  Esta Política de Privacidade descreve como o RIESCADE Quiz Gamer (&quot;nós&quot;, &quot;nosso&quot; ou &quot;app&quot;) coleta, usa e protege suas informações quando você usa nosso aplicativo móvel.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">2. Informações que Coletamos</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-purple-300 mb-3">2.1 Informações Coletadas Automaticamente</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                    <li><strong>Google Play Games Services:</strong> ID do jogador, pontuações, conquistas e dados de progresso no jogo</li>
                    <li><strong>Unity Ads:</strong> Identificador de publicidade, dados de interação com anúncios, informações do dispositivo</li>
                    <li><strong>Dados de Uso:</strong> Tempo de jogo, perguntas respondidas, níveis alcançados</li>
                    <li><strong>Informações do Dispositivo:</strong> Modelo do dispositivo, versão do sistema operacional, identificadores únicos</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-purple-300 mb-3">2.2 Informações que Você Fornece</h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                    <li>Perfil do Google Play Games (se optar por usar)</li>
                    <li>Preferências de jogo salvas localmente</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">3. Como Usamos Suas Informações</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                  <li><strong>Funcionalidade do Jogo:</strong> Para salvar progresso, exibir rankings e desbloquear conquistas</li>
                  <li><strong>Publicidade:</strong> Para exibir anúncios relevantes através do Unity Ads</li>
                  <li><strong>Melhorias:</strong> Para entender como os jogadores usam o app e fazer melhorias</li>
                  <li><strong>Suporte:</strong> Para fornecer suporte técnico quando necessário</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">4. Compartilhamento de Informações</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-medium text-purple-300 mb-3">4.1 Serviços de Terceiros</h3>
                  <p className="text-gray-200 mb-3">Utilizamos os seguintes serviços de terceiros que podem coletar informações:</p>
                  <ul className="list-disc list-inside space-y-3 text-gray-200 ml-4">
                    <li>
                      <strong>Google Play Games Services:</strong> Para recursos sociais e ranking
                      <br />
                      <span className="text-sm">Política: </span>
                      <a href="https://policies.google.com/privacy" className="text-blue-400 hover:text-blue-300 underline">
                        https://policies.google.com/privacy
                      </a>
                    </li>
                    <li>
                      <strong>Unity Ads:</strong> Para exibição de anúncios publicitários
                      <br />
                      <span className="text-sm">Política: </span>
                      <a href="https://unity3d.com/legal/privacy-policy" className="text-blue-400 hover:text-blue-300 underline">
                        https://unity3d.com/legal/privacy-policy
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-medium text-purple-300 mb-3">4.2 Não Vendemos Dados</h3>
                  <p className="text-gray-200">
                    Não vendemos, trocamos ou transferimos suas informações pessoais para terceiros, exceto conforme descrito nesta política.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">5. Dados de Crianças</h2>
                <p className="text-gray-200 leading-relaxed">
                  Nosso app não é direcionado para crianças menores de 13 anos. Não coletamos conscientemente informações pessoais de crianças menores de 13 anos. Se descobrirmos que coletamos informações de uma criança menor de 13 anos, excluiremos essas informações imediatamente.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">6. Segurança dos Dados</h2>
                <p className="text-gray-200 leading-relaxed">
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">7. Seus Direitos</h2>
                <p className="text-gray-200 mb-3">Você tem o direito de:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                  <li>Acessar os dados que temos sobre você</li>
                  <li>Solicitar a correção de dados incorretos</li>
                  <li>Solicitar a exclusão de seus dados</li>
                  <li>Retirar o consentimento para processamento de dados</li>
                  <li>Desconectar do Google Play Games Services a qualquer momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">8. Armazenamento de Dados</h2>
                <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                  <li><strong>Dados Locais:</strong> Progresso do jogo é armazenado localmente no seu dispositivo</li>
                  <li><strong>Google Play Games:</strong> Dados de conquistas e ranking são armazenados nos servidores do Google</li>
                  <li><strong>Unity Ads:</strong> Dados publicitários são processados conforme política da Unity</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">9. Cookies e Tecnologias Similares</h2>
                <p className="text-gray-200 mb-3">O app pode usar tecnologias similares a cookies para:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                  <li>Salvar preferências do usuário</li>
                  <li>Melhorar a experiência publicitária</li>
                  <li>Analisar o uso do aplicativo</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">10. Transferências Internacionais</h2>
                <p className="text-gray-200 leading-relaxed">
                  Seus dados podem ser transferidos e processados em países diferentes do seu país de residência, incluindo Estados Unidos (servidores Google e Unity). Garantimos que essas transferências estejam em conformidade com as leis aplicáveis de proteção de dados.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">11. Retenção de Dados</h2>
                <p className="text-gray-200 leading-relaxed">
                  Retemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais. Dados de jogo são mantidos enquanto você usar o app ou até solicitar exclusão.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">12. Alterações na Política</h2>
                <p className="text-gray-200 leading-relaxed">
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos sobre mudanças significativas através de atualizações no app ou por outros meios apropriados.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">13. Contato</h2>
                <p className="text-gray-200 mb-3">Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato:</p>
                <ul className="list-disc list-inside space-y-2 text-gray-200 ml-4">
                  <li><strong>Email:</strong> privacy@riescade.com</li>
                  <li><strong>Desenvolvedor:</strong> RIESCADE</li>
                  <li><strong>Endereço:</strong> Brasília, DF, Brasil</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-blue-300 mb-4">14. Consentimento</h2>
                <p className="text-gray-200 leading-relaxed">
                  Ao usar nosso aplicativo, você consente com nossa Política de Privacidade e concorda com seus termos.
                </p>
              </section>

              <div className="border-t border-white/20 pt-6 mt-8">
                <p className="text-sm text-gray-400 text-center">
                  Esta política está em conformidade com LGPD (Lei Geral de Proteção de Dados), GDPR e políticas do Google Play Store.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

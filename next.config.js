/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["www.riescade.com.br", "riescade.com.br", "riescade.com"],
    unoptimized: false, // Habilitar otimização para obter melhor qualidade
  },
  // Configuração de segurança para permitir o proxy de imagens
  async headers() {
    return [
      {
        // Aplicando a todas as rotas
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; font-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:;",
          },
        ],
      },
    ];
  },
  // Garantir que os módulos do Node.js estejam disponíveis para as APIs
  serverExternalPackages: ["sharp"],
  // Configuração de API para OpenGraph
  serverRuntimeConfig: {
    PROJECT_ROOT: __dirname,
  },
};

module.exports = nextConfig;

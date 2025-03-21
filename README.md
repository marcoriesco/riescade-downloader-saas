# RIESCADE Downloader

Plataforma para gerenciamento de assinaturas para acesso a conteúdo exclusivo.

## Funcionalidades

- Autenticação com Google
- Processamento de pagamentos com Stripe
- Gerenciamento de assinaturas
- Integração automática com Google Drive para conceder acesso a pastas compartilhadas

## Configuração

### Variáveis de Ambiente

1. Copie o arquivo `.env.example` para `.env.local`:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha as variáveis com seus valores:
   - **Supabase**: Credenciais do seu projeto Supabase
   - **Stripe**: Credenciais do Stripe para processamento de pagamentos
   - **Google Drive**: Credenciais da conta de serviço e ID da pasta para conceder acesso

### Configuração do Google Drive

Para a integração com o Google Drive funcionar corretamente:

1. Crie uma conta de serviço no [Google Cloud Console](https://console.cloud.google.com/)
2. Habilite a API do Google Drive para o seu projeto
3. Crie uma chave JSON para sua conta de serviço
4. Compartilhe a pasta do Drive com a conta de serviço e dê permissões de gerenciamento
5. Adicione as seguintes variáveis ao seu `.env.local`:
   ```
   GOOGLE_CLIENT_EMAIL=sua-conta-de-servico@seu-projeto.iam.gserviceaccount.com
   GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nsua-chave-privada\n-----END PRIVATE KEY-----\n"
   GOOGLE_PROJECT_ID=seu-id-do-projeto
   GOOGLE_DRIVE_FOLDER_ID=id-da-pasta-do-drive
   ```

### Configuração do Supabase

Para o Supabase Admin funcionar corretamente:

1. Obtenha a Service Role Key do seu projeto Supabase
2. Adicione ao `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=sua-chave-de-servico
   ```

## Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev
```

## Fluxo de Assinaturas

1. Usuário se autentica com Google
2. Usuário assina via Stripe
3. O webhook do Stripe atualiza o status da assinatura no Supabase
4. Quando uma assinatura se torna ativa, o sistema adiciona o email do usuário na pasta compartilhada do Google Drive
5. Quando uma assinatura é cancelada, o acesso é removido automaticamente

## Webhook do Stripe

Para testar o webhook localmente, use o Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhook
```

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

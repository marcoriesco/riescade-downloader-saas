# RIESCADE Downloader

Plataforma para gerenciamento de assinaturas para acesso a conteúdo exclusivo.

## Funcionalidades

- Autenticação com Google
- Processamento de pagamentos com Stripe
- Gerenciamento de assinaturas
- Integração automática com Google Drive para conceder acesso a pastas compartilhadas
- Reconciliação periódica de permissões via Vercel Cron Jobs

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
6. Um processo de reconciliação diário verifica e corrige eventuais inconsistências entre assinaturas ativas e permissões concedidas

## Cron Job de Reconciliação

O sistema utiliza Vercel Cron Jobs para executar automaticamente a reconciliação de permissões:

1. O job está configurado para rodar diariamente às 03:00 UTC
2. Verifica todas as assinaturas ativas no Supabase
3. Para cada usuário com assinatura ativa, confirma se há permissão no Google Drive
4. Adiciona permissões faltantes automaticamente
5. Gera logs detalhados do processo

A configuração do cron job está no arquivo `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/reconcile-permissions",
      "schedule": "0 3 * * *"
    }
  ]
}
```

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

# RIESCADE SAAS

Esta é a aplicação web do RIESCADE, uma plataforma de preservação de jogos arcade e consoles retro.

## Desenvolvimento

Certifique-se de ter o Node.js instalado (versão 18 ou superior).

1. Clone este repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente: copie `.env.example` para `.env.local` e configure as variáveis
4. Inicie o servidor de desenvolvimento: `npm run dev`

## Sistema de Blog

O blog do RIESCADE usa um sistema híbrido que permite:

1. Posts serem escritos/editados em arquivos JSON organizados por semanas
2. Publicação automática dos posts no banco de dados Supabase quando chegar a data agendada
3. Visualização dos posts através da interface web

### Estrutura dos Arquivos de Post

Os posts são armazenados em arquivos JSON na pasta `src/content/scheduled-posts/` com o formato `YYYY-WXX.json` (por exemplo, `2025-W17.json` para a semana 17 de 2025).

Cada arquivo contém informações sobre a semana e uma lista de posts:

```json
{
  "week": 17,
  "year": 2025,
  "posts": [
    {
      "title": "Título do Post",
      "publish_date": "2025-04-27",
      "content": "<p>Conteúdo HTML do post...</p>",
      "excerpt": "Resumo curto do post",
      "image_path": "nome-da-imagem.jpg",
      "category": "Categoria",
      "tags": ["tag1", "tag2"],
      "author": "Nome do Autor",
      "featured": false,
      "published": false
    }
  ]
}
```

### Publicação de Posts

O sistema publica automaticamente **um post por dia** da seguinte forma:

1. Os posts são verificados diariamente às 8:00 da manhã pelo cronjob
2. O sistema seleciona todos os posts programados para a data atual
3. O primeiro post destacado (`featured: true`) é publicado
4. Se não houver posts destacados, será publicado o primeiro post por ordem alfabética
5. O post publicado é marcado como `published: true` no arquivo JSON

#### Publicação Manual

Para publicar posts manualmente:

```bash
# Publicar posts agendados para hoje
npm run publish-post
```

#### Configuração do Cronjob

O agendador está configurado para executar todos os dias às 8:00 da manhã. Para iniciar o cronjob em um servidor:

```bash
# Iniciar o agendador (deixe rodando em segundo plano)
npm run cron
```

### Implementação Técnica

O sistema usa as seguintes tecnologias:

- **TypeScript**: Scripts de publicação usando TypeScript
- **node-cron**: Para agendamento das publicações
- **Supabase**: Como banco de dados para armazenar os posts publicados
- **Next.js**: Para renderização do blog na interface web

### Arquivos do Sistema

- `src/scripts/cron-scheduler.ts`: Agendador que executa diariamente
- `src/scripts/publish-scheduled-posts.ts`: Script principal de publicação
- `logs/publish-logs.log`: Registro das publicações realizadas
- `logs/publish-errors.log`: Registro de erros durante a publicação

# Configuração das Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

## Supabase

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Stripe

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID=price_your_hd_switch_1tb_price_id
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## NextAuth (se necessário)

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

## Como obter o Price ID do HD Switch

1. Acesse o [Dashboard do Stripe](https://dashboard.stripe.com/)
2. **Mude para TEST MODE** (toggle no canto superior direito)
3. Vá para **Produtos** > **Preços**
4. Encontre o preço do HD 1TB Nintendo Switch
5. Copie o ID do preço (começa com `price_`)
6. Adicione ao arquivo `.env.local` como `NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID`

## Como configurar o Webhook do Stripe

1. No [Dashboard do Stripe](https://dashboard.stripe.com/), vá para **Desenvolvedores** > **Webhooks**
2. Clique em **Adicionar endpoint**
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos a escutar:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
5. Copie o **Signing secret** e adicione como `STRIPE_WEBHOOK_SECRET`

## Configurar tabela de pedidos no Supabase

Execute este SQL no Supabase SQL Editor:

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  stripe_session_id TEXT UNIQUE NOT NULL,
  customer_email TEXT,
  customer_name TEXT,
  amount_total INTEGER,
  currency TEXT,
  status TEXT,
  shipping_address JSONB,
  cep TEXT,
  shipping_value INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índice para busca por email
CREATE INDEX idx_orders_customer_email ON orders(customer_email);

-- Criar índice para busca por status
CREATE INDEX idx_orders_status ON orders(status);
```

## Configurar envio de emails

Para enviar emails reais, você pode usar:

### Opção 1: Resend (Recomendado)

```bash
npm install resend
```

Adicione ao `.env.local`:

```
RESEND_API_KEY=your_resend_api_key
```

### Opção 2: SendGrid

```bash
npm install @sendgrid/mail
```

Adicione ao `.env.local`:

```
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Opção 3: Supabase Edge Functions

Use as Edge Functions do Supabase para envio de emails.

## Exemplo de arquivo .env.local completo

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_HDSWITCH1TB_PRICE_ID=price_1ABC123DEF456
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret
RESEND_API_KEY=your_resend_api_key
SENDGRID_API_KEY=your_sendgrid_api_key
```

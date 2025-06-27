# 🧪 Guia de Teste do Webhook Stripe

## Configuração para Teste Local

### 1. Instalar Stripe CLI

```bash
npm install -g stripe
```

### 2. Fazer Login no Stripe CLI

```bash
stripe login
```

### 3. Iniciar o Forwarding de Webhooks

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

### 4. Copiar o Webhook Secret

O comando acima vai gerar um webhook secret. Copie-o e adicione ao `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_1234567890abcdef...
```

## Testando o Fluxo Completo

### 1. Fazer uma Compra de Teste

- Acesse: `http://localhost:3001/produtos/hd-switch`
- Calcule o frete com um CEP válido
- Insira um email de teste
- Clique em "COMPRAR AGORA"

### 2. Usar Cartão de Teste

No checkout do Stripe, use:

- **Número:** 4242 4242 4242 4242
- **Data:** Qualquer data futura
- **CVC:** Qualquer 3 dígitos
- **CEP:** Qualquer CEP válido

### 3. Verificar os Logs

- **Terminal do servidor:** Logs do webhook
- **Console do navegador:** Logs da página
- **Email:** Se configurado o Resend

## Cartões de Teste Disponíveis

| Número              | Resultado       | Descrição          |
| ------------------- | --------------- | ------------------ |
| 4242 4242 4242 4242 | ✅ Sucesso      | Pagamento aprovado |
| 4000 0000 0000 0002 | ❌ Recusado     | Pagamento recusado |
| 4000 0000 0000 9995 | ❌ Insuficiente | Saldo insuficiente |

## Verificando se Funcionou

### 1. Logs do Webhook

```
Webhook event received: checkout.session.completed
Processing completed checkout session: cs_test_...
✅ Email de confirmação enviado para: teste@email.com
Order saved to database: {...}
```

### 2. Banco de Dados

Verifique se o pedido foi salvo na tabela `orders` do Supabase.

### 3. Email

Se configurado o Resend, verifique se o email foi enviado.

## Troubleshooting

### Webhook não recebido

- Verifique se o `stripe listen` está rodando
- Confirme se o `STRIPE_WEBHOOK_SECRET` está correto
- Verifique se a URL do webhook está correta

### Email não enviado

- Verifique se o `RESEND_API_KEY` está configurado
- Confirme se o domínio está verificado no Resend
- Verifique os logs de erro

### Erro no banco de dados

- Verifique se a tabela `orders` foi criada
- Confirme as permissões do Supabase
- Verifique os logs de erro do Supabase

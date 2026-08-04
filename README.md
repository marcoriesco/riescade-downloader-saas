# RIESCADE

Site de autenticação, assinatura e gerenciamento de conta do aplicativo RIESCADE OS.

## Fluxo do assinante

1. O usuário entra no site com sua conta Google.
2. A assinatura é processada pelo Stripe Checkout.
3. O endpoint `/api/webhooks/stripe` sincroniza o estado da assinatura no Supabase.
4. O usuário baixa a versão mais recente do RIESCADE OS no dashboard.
5. No aplicativo, acessa **Configurações → Minha conta** e entra com a mesma conta Google.
6. Os downloads de jogos são feitos exclusivamente dentro do aplicativo.

Download permanente da versão mais recente:

`https://github.com/marcoriesco/RIESCADE-OS-ARCADE/releases/latest/download/RIESCADE_OS.7z`

## Desenvolvimento

1. Instale o Node.js 18 ou superior.
2. Execute `npm install`.
3. Copie `.env.example` para `.env.local` e preencha as credenciais.
4. Execute `npm run dev`.

Para validar:

```bash
npm run typecheck
npm run build
```

## Stripe

O webhook de produção deve apontar para:

`https://www.riescade.com.br/api/webhooks/stripe`

Eventos necessários:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Teste local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Armazenamento do aplicativo

Os downloads usam uma camada independente de provedor compatível com S3. As variáveis atuais estão documentadas em `.env.example`; as credenciais de armazenamento devem ser restritas ao bucket e nunca usar uma chave mestre.

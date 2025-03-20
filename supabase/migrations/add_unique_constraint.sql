-- Adiciona restrição de unicidade para user_id na tabela subscriptions
-- Isso garante que cada usuário só pode ter uma assinatura

-- Primeiro, remove possíveis entradas duplicadas mantendo apenas a mais recente
WITH ranked_subscriptions AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC) as rn
  FROM subscriptions
)
DELETE FROM subscriptions
WHERE id IN (
  SELECT id FROM ranked_subscriptions WHERE rn > 1
);

-- Adiciona a restrição de unicidade
ALTER TABLE subscriptions ADD CONSTRAINT unique_user_subscription UNIQUE (user_id); 
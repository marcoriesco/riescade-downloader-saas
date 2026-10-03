begin;

create schema if not exists internal;
revoke all on schema internal from public, anon, authenticated;

create table if not exists internal.subscription_duplicates_archive
(like public.subscriptions including defaults including generated including identity);

with ranked as (
  select id,
         row_number() over (
           partition by user_id
           order by
             case when status in ('active', 'trialing') then 0 else 1 end,
             updated_at desc nulls last,
             created_at desc nulls last,
             id desc
         ) as position
  from public.subscriptions
)
insert into internal.subscription_duplicates_archive
select s.*
from public.subscriptions s
join ranked r using (id)
where r.position > 1
;

with ranked as (
  select id,
         row_number() over (
           partition by user_id
           order by
             case when status in ('active', 'trialing') then 0 else 1 end,
             updated_at desc nulls last,
             created_at desc nulls last,
             id desc
         ) as position
  from public.subscriptions
)
delete from public.subscriptions s
using ranked r
where s.id = r.id and r.position > 1;

alter table public.subscriptions
  drop constraint if exists valid_payment_provider;
update public.subscriptions set payment_provider = 'stripe'
where payment_provider is distinct from 'stripe';
alter table public.subscriptions
  alter column payment_provider set default 'stripe',
  alter column payment_provider set not null,
  add constraint valid_payment_provider check (payment_provider = 'stripe');
alter table public.subscriptions
  drop column if exists buyer_name,
  drop column if exists buyer_email;

create unique index if not exists subscriptions_user_id_unique
  on public.subscriptions(user_id);
create unique index if not exists subscriptions_subscription_id_unique
  on public.subscriptions(subscription_id)
  where subscription_id is not null;

alter table public.orders
  add column if not exists user_id uuid references auth.users(id) on delete set null;
update public.orders o
set user_id = u.id
from auth.users u
where o.user_id is null and lower(o.customer_email) = lower(u.email);
create index if not exists orders_user_id_created_at_idx
  on public.orders(user_id, created_at desc);

alter table public.orders enable row level security;
alter table public.subscriptions enable row level security;

drop policy if exists "Enable all access for all users" on public.subscriptions;
drop policy if exists "Enable insert for all users" on public.subscriptions;
drop policy if exists "Users can view their own subscriptions" on public.subscriptions;
drop policy if exists "Users can view own subscriptions" on public.subscriptions;
drop policy if exists "Users can view their own orders" on public.orders;

revoke all on public.orders from anon, authenticated;
revoke all on public.subscriptions from anon, authenticated;
grant select on public.orders to authenticated;
grant select on public.subscriptions to authenticated;

create policy "Users can view their own orders"
on public.orders for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users can view their own subscriptions"
on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

commit;


-- Tabela de Produtos (com suporte a base64 no image_url se necessário)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal not null,
  original_price decimal,
  category text,
  image_url text,
  rating decimal default 4.5,
  rating_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Tabela de Pedidos (Garantindo colunas lat/lng)
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  user_email text not null,
  product_names text not null,
  total_price decimal not null,
  status text default 'Processando' not null,
  tracking_code text,
  last_location text default 'Centro de Distribuição',
  delivery_lat decimal not null default 0,
  delivery_lng decimal not null default 0,
  payment_method text default 'Pagamento na Entrega',
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Políticas de Produtos
drop policy if exists "Permitir leitura para todos" on public.products;
create policy "Permitir leitura para todos" on public.products for select using (true);
drop policy if exists "Admins total produtos" on public.products;
create policy "Admins total produtos" on public.products for all using (auth.role() = 'authenticated');

-- Políticas de Pedidos
drop policy if exists "Usuários veem seus próprios pedidos" on public.orders;
create policy "Usuários veem seus próprios pedidos" on public.orders for select using (auth.uid() = user_id);
drop policy if exists "Admins veem todos" on public.orders;
create policy "Admins veem todos" on public.orders for all using (auth.role() = 'authenticated');
drop policy if exists "Usuários criam pedidos" on public.orders;
create policy "Usuários criam pedidos" on public.orders for insert with check (auth.role() = 'authenticated');

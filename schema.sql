
-- Tabela de Produtos
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

-- Tabela de Pedidos/Rastreio
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  user_email text not null,
  product_names text not null,
  total_price decimal not null,
  status text default 'Processando' not null,
  tracking_code text,
  last_location text default 'Centro de Distribuição',
  delivery_lat decimal,
  delivery_lng decimal,
  payment_method text default 'Pagamento na Entrega',
  created_at timestamp with time zone default now()
);

-- Habilitar RLS (Idempotente por padrão no Postgres)
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- Políticas de Produtos - Limpeza prévia para evitar erros de "already exists"
drop policy if exists "Permitir leitura para todos" on public.products;
drop policy if exists "Admin total produtos" on public.products;
drop policy if exists "Admins podem inserir" on public.products;
drop policy if exists "Admins podem atualizar" on public.products;
drop policy if exists "Admins podem deletar" on public.products;

-- Criação das Políticas de Produtos
create policy "Permitir leitura para todos" on public.products for select using (true);

create policy "Admins podem inserir" on public.products for insert with check (auth.role() = 'authenticated');
create policy "Admins podem atualizar" on public.products for update using (auth.role() = 'authenticated');
create policy "Admins podem deletar" on public.products for delete using (auth.role() = 'authenticated');

-- Políticas de Pedidos - Limpeza prévia para evitar erros de "already exists"
drop policy if exists "Usuários veem seus próprios pedidos" on public.orders;
drop policy if exists "Admins veem todos os pedidos" on public.orders;
drop policy if exists "Admins editam pedidos" on public.orders;
drop policy if exists "Usuários criam pedidos" on public.orders;

-- Criação das Políticas de Pedidos
create policy "Usuários veem seus próprios pedidos" on public.orders 
  for select using (auth.uid() = user_id);

create policy "Admins veem todos os pedidos" on public.orders 
  for select using (auth.role() = 'authenticated');

create policy "Admins editam pedidos" on public.orders 
  for update using (auth.role() = 'authenticated');

create policy "Usuários criam pedidos" on public.orders 
  for insert with check (auth.role() = 'authenticated');

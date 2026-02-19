
-- Tabela de Produtos
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price decimal not null,
  original_price decimal,
  category text, -- Agora será 'Produtos' ou 'Serviços'
  image_urls text[] default '{}',
  rating decimal default 5.0,
  rating_count integer default 0,
  created_at timestamp with time zone default now()
);

-- Tabela de Pedidos
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  user_email text not null,
  whatsapp_number text not null,
  product_names text not null,
  total_price decimal not null,
  status text default 'Processando' not null,
  tracking_code text,
  last_location text default 'Processando no Riacho',
  delivery_lat decimal not null default 0,
  delivery_lng decimal not null default 0,
  payment_method text default 'Pagamento na Entrega',
  created_at timestamp with time zone default now()
);

-- Tabela de Avaliações (Feedbacks)
create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id),
  user_email text,
  user_name text,
  rating integer check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now()
);

-- Habilitar RLS
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.reviews enable row level security;

-- Políticas de Produtos
create policy "Leitura pública produtos" on public.products for select using (true);
create policy "Admin total produtos" on public.products for all using (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Políticas de Pedidos
create policy "Ver próprios pedidos" on public.orders for select using (auth.uid() = user_id);
create policy "Criar pedidos" on public.orders for insert with check (auth.role() = 'authenticated');
create policy "Admin total pedidos" on public.orders for all using (
  (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
);

-- Políticas de Reviews
create policy "Leitura pública reviews" on public.reviews for select using (true);
create policy "Usuários criam reviews" on public.reviews for insert with check (auth.role() = 'authenticated');

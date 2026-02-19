
-- Tabela de Produtos
create table public.products (
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

-- Habilitar RLS (Row Level Security)
alter table public.products enable row level security;

-- Políticas de Acesso
create policy "Permitir leitura para todos" on public.products
  for select using (true);

create policy "Permitir inserção para usuários autenticados" on public.products
  for insert with check (auth.role() = 'authenticated');

create policy "Permitir atualização para usuários autenticados" on public.products
  for update using (auth.role() = 'authenticated');

create policy "Permitir exclusão para usuários autenticados" on public.products
  for delete using (auth.role() = 'authenticated');

-- Inserir dados de exemplo (opcional)
insert into public.products (name, description, price, original_price, category, image_url)
values 
('Beats Studio Wireless', 'Som premium e cancelamento de ruído.', 1299.00, 1599.00, 'Electronics', 'https://picsum.photos/seed/beats/400/400'),
('Apple Watch Series 3', 'O parceiro ideal para sua saúde.', 1899.00, 2199.00, 'Watches', 'https://picsum.photos/seed/watch/400/400'),
('Bolsa Feminina Amarela', 'Estilo e praticidade para o dia a dia.', 149.90, 199.00, 'Apparel', 'https://picsum.photos/seed/bag/400/400');

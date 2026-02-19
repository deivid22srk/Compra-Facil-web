
-- ==========================================================
-- SCRIPT DE PROMOÇÃO DE ADMINISTRADORES (RIACHO DOS BARREIROS)
-- ==========================================================
-- Como usar:
-- 1. Vá no painel do Supabase -> SQL Editor -> New Query.
-- 2. Cole este código abaixo.
-- 3. Edite os e-mails na lista ('admin@email.com', 'outro@email.com').
-- 4. Clique em RUN.

UPDATE auth.users 
SET raw_user_meta_data = 
  CASE 
    WHEN raw_user_meta_data IS NULL THEN '{"is_admin": true}'::jsonb
    ELSE raw_user_meta_data || '{"is_admin": true}'::jsonb
  END
WHERE email IN (
  'seu-email@aqui.com',    -- Substitua pelo seu e-mail
  'admin@exemplo.com'       -- Adicione outros e-mails aqui
);

-- DICA: Se você quiser remover o admin de alguém, mude para '{"is_admin": false}'


# Guia do Administrador - CompraFácil Riacho

Este aplicativo separa usuários comuns de Administradores (ADM) para garantir a segurança dos dados e gestão da loja.

## Como tornar um usuário Administrador

Atualmente, a verificação é feita através do `user_metadata` do Supabase. Para promover um usuário, você deve:

1. Acesse o [Painel do Supabase](https://supabase.com).
2. Vá em **Authentication** > **Users**.
3. Selecione o usuário desejado.
4. Clique em **Edit User Metadata**.
5. Adicione a seguinte chave JSON:
   ```json
   {
     "is_admin": true
   }
   ```
6. Salve. Na próxima vez que o usuário entrar no app, ele terá acesso ao botão **Admin** no menu inferior.

## O que o Administrador pode fazer:
- **Produtos**: Criar, editar e excluir produtos ou serviços.
- **Pedidos**: Ver todos os pedidos de todos os moradores do Riacho, alterar o status (Em Trânsito/Entregue) e ver a localização exata no mapa para entrega.
- **WhatsApp**: Link direto para iniciar conversa com o cliente que fez o pedido.

## Categorias Atuais:
O sistema foi simplificado para:
- `Produtos`: Itens físicos (roupas, eletrônicos, etc).
- `Serviços`: Mão de obra ou serviços locais (consertos, aulas, etc).

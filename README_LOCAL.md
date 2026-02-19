# Guia de Solução: Tela Branca ao Rodar Localmente

Se o seu projeto funciona na plataforma mas fica com a **tela branca** ao rodar `npm run dev` ou abrir o `index.html` localmente, aqui estão os motivos técnicos e como resolver sem alterar o código principal.

---

### 1. O Navegador não entende arquivos `.tsx`
Navegadores (Chrome, Edge, Safari) só conseguem ler arquivos JavaScript (`.js`). O arquivo `index.tsx` contém sintaxe de **TypeScript** e **React (JSX)** que precisa ser "transpilada" (convertida) antes de chegar ao navegador.

**Como resolver:**
Certifique-se de que você está usando um servidor de desenvolvimento que suporte React + TypeScript, como o **Vite**.
1. No seu terminal, verifique se você tem o Vite configurado.
2. O arquivo `index.html` local precisa de uma tag script apontando para o ponto de entrada (que muitas plataformas injetam automaticamente, mas o seu local pode não ter):
   ```html
   <script type="module" src="/index.tsx"></script>
   ```

### 2. Erro de Variável de Ambiente (`process.env`)
O código utiliza `process.env.API_KEY`. O objeto `process` é nativo do Node.js, não do navegador. Ao rodar localmente sem um bundler (como Vite ou Webpack), o navegador tentará acessar `process` e lançará um erro `Uncaught ReferenceError: process is not defined`, travando a renderização e deixando a tela branca.

**Como resolver no Vite:**
Crie um arquivo chamado `.env` na raiz do projeto e adicione sua chave:
```env
VITE_GEMINI_API_KEY=sua_chave_aqui
```
*Nota: O Vite exige o prefixo `VITE_` e você precisaria ajustar a chamada no código, ou configurar o `define` no `vite.config.ts`.*

### 3. Verifique o Console do Desenvolvedor (F12)
A tela branca é quase sempre acompanhada de um erro no console.
1. Abra o seu `localhost` no Chrome.
2. Pressione `F12` e vá na aba **Console**.
3. Procure por erros em vermelho. Comumente você verá:
   - `Failed to load module script`: O navegador não achou o `index.tsx`.
   - `ReferenceError: process is not defined`: Problema com a API Key.
   - `SyntaxError`: O navegador tentou ler o código TSX como se fosse JS puro.

### 4. Configuração Recomendada de Localhost
Para este projeto específico, a estrutura de pastas deve ser:
```text
projeto/
├── index.html
├── index.tsx
├── App.tsx
├── types.ts
├── supabaseClient.ts
├── components/
│   └── ...
└── package.json
```
Se você estiver usando o **Vite**, o seu `package.json` deve ter:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc && vite build"
}
```

### 5. Supabase e Domínios
Verifique se a URL do seu Supabase em `supabaseClient.ts` permite conexões do domínio `localhost`. Normalmente, o Supabase aceita conexões de qualquer origem para chaves "anon/public", mas vale checar as configurações de CORS no painel do Supabase se o erro for de rede.

---
**Dica de Ouro:** Se você apenas abriu o arquivo `index.html` direto da pasta (clique duplo), **nunca funcionará** devido a políticas de segurança de módulos ES6 (CORS). Você **precisa** de um servidor local (como o que o `npm run dev` provê).
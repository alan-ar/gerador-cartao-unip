# Configuração de Variáveis de Ambiente (Supabase)

Para estabelecer a conexão entre sua aplicação React (Vite) e o banco de dados Supabase, são necessárias duas variáveis fundamentais: `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

## O que são essas variáveis?

### 1. VITE_SUPABASE_URL

- ** Função**: É o "endereço IP" ou ponto de entrada (RESTful endpoint) do seu backend no Supabase.
- ** Para que serve**: Diz ao cliente Supabase (`@supabase/supabase-js`) para qual servidor ele deve enviar as requisições de dados e autenticação.
- ** Segurança**: Pode ser pública, pois ela apenas identifica o seu projeto.

### 2. VITE_SUPABASE_ANON_KEY

- ** Função**: É uma chave de acesso "pública" de baixo privilégio.
- ** Para que serve**: Identifica que sua aplicação tem permissão para interagir com o projeto Supabase. Ela funciona em conjunto com o **Row Level Security (RLS)**: sem uma sessão de usuário válida, essa chave só permite acesso a dados que você explicitamente marcou como públicos no banco de dados.
- ** Segurança**: Embora seja chamada de "anon", ela é segura para ser incluída no código do cliente (frontend), desde que o RLS esteja habilitado no seu banco de dados.

---

## Como configurar o arquivo `.env`

Na raiz do seu projeto, você deve ter um arquivo chamado `.env`. O conteúdo deve seguir este formato:

```bash
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

> [!IMPORTANT]
> **O prefixo `VITE_` é obrigatório.** Por padrão, o Vite só expõe variáveis de ambiente que começam com este prefixo para o seu código frontend via `import.meta.env`. Se você omitir o prefixo, as variáveis serão `undefined` no seu código.

---

## Onde encontrar essas chaves no Supabase?

1.  Acesse o [Dashboard do Supabase](https://app.supabase.com/).
2.  Selecione o seu projeto.
3.  No menu lateral esquerdo, clique no ícone de engrenagem (**Project Settings**).
4.  Clique na aba **API**.
5.  Na seção **Project API keys**, você encontrará:
    - **Project URL**: Use para `VITE_SUPABASE_URL`.
    - **anon public**: Use para `VITE_SUPABASE_ANON_KEY`.

---

## Verificação de Funcionamento

No seu código, a inicialização deve ser feita da seguinte forma (arquivo `src/lib/supabase.js`):

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Se as variáveis não estiverem configuradas corretamente, você verá erros de conexão ou de "URL inválida" no console do navegador.

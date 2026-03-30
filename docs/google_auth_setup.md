# Configuração de Autenticação Google (Supabase)

Para habilitar o login via Google em sua aplicação, você deve configurar o **Google Cloud Console** e o **Dashboard do Supabase**. Siga rigorosamente os passos abaixo.

## 1. Google Cloud Console

1.  Acesse o [Google Cloud Console](https://console.cloud.google.com/).
2.  Crie um novo projeto (ex: `Gerador Cartão UNIP`).
3.  Vá em **APIs e Serviços > Tela de permissão OAuth**:
    *   **User Type**: Externo.
    *   Preencha o nome do app, e-mail de suporte e dados de contato do desenvolvedor.
    *   Adicione o escopo `.../auth/userinfo.email` e `.../auth/userinfo.profile`.
4.  Vá em **APIs e Serviços > Credenciais**:
    *   Clique em **+ Criar Credenciais > ID do cliente OAuth**.
    *   **Tipo de aplicativo**: Aplicativo da Web.
    *   **Origens JavaScript autorizadas**: 
        *   `http://localhost:5173` (para desenvolvimento).
        *   `https://seu-dominio-producao.vercel.app` (se houver).
    *   **URIs de redirecionamento autorizados**: Você precisará da "Callback URL" do Supabase (veja passo abaixo).
5.  **Crie** e copie o **ID do cliente** e o **Segredo do cliente**.

---

## 2. Supabase Dashboard

1.  Acesse o projeto no [Dashboard do Supabase](https://app.supabase.com/).
2.  Vá em **Authentication > Providers > Google**.
3.  Ative a opção **Enable Google-Sign In**.
4.  Cole o **Client ID** e o **Client Secret** obtidos no Google Cloud Console.
5.  **Importante:** No final da página do provedor Google no Supabase, haverá uma **Callback URL**. Copie este link (ex: `https://xxxx.supabase.co/auth/v1/callback`).
6.  Volte ao Google Cloud Console (nas credenciais criadas no passo 1.4) e adicione este link ao campo **URIs de redirecionamento autorizados**.

---

## 3. Configuração de URL (Supabase)

Ainda no Supabase Dashboard:
1.  Vá em **Authentication > URL Configuration**.
2.  **Site URL**: URL final da aplicação (ex: `https://gerador-unip.vercel.app`).
3.  **Redirect URLs**: Adicione `http://localhost:5173/**` para permitir redirecionamentos corretos durante o desenvolvimento local.

---

## 4. Verificação no Código

O serviço já está pré-configurado no arquivo `src/services/authService.js`:

```javascript
  loginWithGoogle: async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin, // Garante redirecionamento para a URL atual
      },
    })
    if (error) throw error
    return data
  },
```

## Problemas Comuns

*   **Error 400: redirect_uri_mismatch**: Verifique se a callback URL do Supabase foi adicionada no Google Cloud Console exatamente como aparece no dashboard.
*   **O usuário volta deslogado**: Verifique se a URL em `Redirect URLs` (Supabase) inclui o `/**` no final para contextos locais.
*   **Atraso na Propagação**: Após alterar as configurações no Google Cloud, pode levar alguns minutos para entrar em vigor.

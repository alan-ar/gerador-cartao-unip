# Guia de Acesso Administrativo

Este documento descreve como gerenciar permissões de alto nível no sistema.

## 1. Primeiros Passos (Bootstrapping)

Como o sistema inicia com todos os usuários no nível `user` e status `BRONZE`, o primeiro administrador deve ser definido manualmente via SQL no Dashboard do Supabase:

```sql
-- Substitua pelo seu e-mail do Google
UPDATE public.profiles
SET role = 'admin', status = 'GOLD'
WHERE email = 'seu-email@gmail.com';

-- Cria um código que pode ser usado na tela de Onboarding
INSERT INTO public.secret_codes (code, is_active, created_by)
VALUES ('UNIP2024', true, NULL); -- created_by NULL para o primeiro código
```

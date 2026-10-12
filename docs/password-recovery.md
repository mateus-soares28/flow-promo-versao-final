# Recuperação de senha

O FlowPromos usa o código temporário do Supabase Auth. O usuário solicita o código em `/recuperar-senha`, informa e-mail, código e nova senha em `/redefinir-senha`, e entra novamente em `/login`. A resposta ao pedido de código não revela se o e-mail está cadastrado. A senha precisa ter pelo menos 12 caracteres, como no cadastro.

## Configurar o e-mail no Supabase

1. Em **Authentication → URL Configuration**, defina **Site URL** como `https://flow-promo-versao-final.vercel.app` (sem barra final). Ajuste o endereço quando o produto ganhar domínio próprio.
2. Em **Authentication → Email Templates → Reset Password**, substitua o conteúdo do e-mail por um modelo que inclua `{{ .Token }}`. Exemplo:

   ```html
   <h2>Redefinir senha do FlowPromos</h2>
   <p>Digite o código abaixo para criar uma nova senha:</p>
   <p><strong>{{ .Token }}</strong></p>
   <p><a href="{{ .SiteURL }}/redefinir-senha">Abrir a página de redefinição</a></p>
   <p>Se você não solicitou essa alteração, ignore esta mensagem.</p>
   ```

3. Salve o modelo. Em **Authentication → Emails → SMTP Settings**, configure um serviço SMTP próprio para produção. O serviço padrão do Supabase tem limite baixo e não garante entrega de produção. Se disponível no plano, habilite também a notificação de segurança **Password changed**.
4. Confira as configurações de expiração e frequência do código em **Authentication → Providers → Email**. A validação e os limites são aplicados pelo Supabase Auth.

O modelo padrão da Supabase envia um link de confirmação. Este fluxo precisa do código `{{ .Token }}`; configure o modelo antes de publicar a nova tela.

## Testar com uma conta sua

1. Abra `/login` e clique em **Esqueceu sua senha?**.
2. Informe o e-mail da sua conta. A mensagem de confirmação deve ser igual para e-mails cadastrados e não cadastrados.
3. Leia o código recebido. Você pode abrir o e-mail em outro navegador ou aparelho.
4. Em `/redefinir-senha`, informe e-mail, código e uma nova senha com pelo menos 12 caracteres. Após salvar, entre com a nova senha.
5. Teste também um código errado e um código expirado. Eles devem mostrar erro, sem alterar a senha.

Não envie códigos, senhas ou capturas do e-mail em tickets ou conversas. Se o e-mail não chegar, confira SMTP, logs de autenticação do Supabase, pasta de spam e limites de envio.

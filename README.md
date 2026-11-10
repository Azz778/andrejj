# Cheat Set — autenticação com código por e-mail

## Como executar localmente
1. Instale o [Node.js 18 ou superior](https://nodejs.org/).
2. Abra um terminal dentro desta pasta (`cheat-set`).
3. Execute `npm install`.
4. Copie `.env.example` para `.env`.
5. Configure os dados SMTP no `.env` (veja a seção abaixo) e altere `SESSION_SECRET` para uma chave aleatória longa.
6. Execute `npm start`.
7. Acesse `http://localhost:3000/conta.html` — não abra os HTMLs diretamente pelo explorador de arquivos.

## Configurar envio de e-mail
O Cheat Set envia um código de 6 dígitos por e-mail, válido por 10 minutos. Para Gmail:
- Ative a verificação em duas etapas na conta Google que enviará os códigos.
- Gere uma **senha de app** na Conta Google.
- Preencha `SMTP_USER` com o endereço remetente, `SMTP_PASS` com a senha de app e `MAIL_FROM` com o mesmo endereço.
- Mantenha `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465` e `SMTP_SECURE=true`.

Nunca coloque credenciais SMTP no HTML ou no `script.js`, nem compartilhe o arquivo `.env`.

## Como funciona a autenticação
- Cadastro: os dados são validados no servidor; a senha é armazenada com hash bcrypt e a conta só é criada depois que o código enviado por e-mail é confirmado.
- Login: primeiro valida e-mail/usuário e senha; depois envia um novo código ao e-mail cadastrado. A sessão só é criada após a confirmação do código.
- Código: 6 dígitos, expira em 10 minutos e permite no máximo 5 tentativas por desafio. Há limitação de requisições por IP.
- Sessão: cookie `HttpOnly` e `SameSite=Lax`; o navegador consulta `/api/auth/me` ao abrir cada página protegida.

## Publicação em produção
Este pacote é uma base funcional para desenvolvimento. Antes de publicar:
- Use HTTPS e `NODE_ENV=production`.
- Configure `SESSION_SECRET` com pelo menos 32 caracteres aleatórios.
- Configure um armazenamento persistente de sessões (o armazenamento padrão em memória do Express é apenas para desenvolvimento e reinicia junto com o servidor).
- Troque o arquivo JSON de usuários por banco de dados com backup e controle de concorrência.
- Configure limites de envio por e-mail/IP e monitore abuso; para escala, use fila de e-mail e armazenamento compartilhado dos desafios.
- Hospede frontend e API na mesma origem, ou configure CORS e cookies de forma explícita se separar os domínios.

## O que continua local
Projetos, publicações, perfil e editor continuam usando `localStorage`, como no protótipo anterior. A autenticação e a verificação do e-mail agora são realizadas pelo servidor. Os dados locais antigos de contas (`cheatset_users_v1` e `cheatset_session_v1`) não são migrados; os usuários precisarão criar uma conta novamente.

## Arquivos principais
- `server.js`: API, sessões, verificação de código e envio SMTP.
- `conta.html`: telas de cadastro, login e código de verificação.
- `script.js`: integração do frontend com a API.
- `.env.example`: modelo de configuração SMTP.

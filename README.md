# Painel da Agencia - MVP

Sistema interno simples para uma agencia/servicos freelance. A Fase 1 ja vem com dashboard, clientes, tarefas, financeiro basico e login preparado com Better Auth.

## O que tem no projeto

- Next.js + TailwindCSS
- Componentes no estilo shadcn/ui
- Dashboard com cards e grafico
- Cadastro/listagem de clientes
- Kanban de tarefas
- Financeiro com receitas, despesas, recorrencias e parcelas
- Prisma + Neon PostgreSQL
- Better Auth com email/senha
- Estrutura de upload via Cloudinary
- Modulos iniciais de calendario, CRM, arquivos e relatorios

## Como rodar no seu computador

1. Instale o Node.js LTS em [nodejs.org](https://nodejs.org).
2. Extraia o `.zip` e abra a pasta do projeto.
3. Copie `.env.example` e renomeie a copia para `.env`.
4. Crie um banco gratis no [Neon](https://neon.tech) e cole a connection string em `DATABASE_URL`.
5. Crie uma conta gratis no [Cloudinary](https://cloudinary.com) e preencha:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
   - `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
6. Em `BETTER_AUTH_SECRET`, coloque um texto grande e aleatorio. Exemplo: uma senha forte com mais de 32 caracteres.
7. No terminal, dentro da pasta do projeto, rode:

```bash
npm install
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

8. Abra [http://localhost:3000](http://localhost:3000).
9. Entre em `/login` e clique em "Criar primeiro acesso".

## Configuracao do `.env` local

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST.neon.tech/DB?sslmode=require"
BETTER_AUTH_SECRET="um-segredo-bem-grande-aqui"
BETTER_AUTH_URL="http://localhost:3000"
REQUIRE_AUTH="false"

CLOUDINARY_CLOUD_NAME="seu-cloud-name"
CLOUDINARY_API_KEY="sua-api-key"
CLOUDINARY_API_SECRET="seu-api-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="seu-cloud-name"
```

Use `REQUIRE_AUTH="false"` no comeco para conseguir ver o painel mesmo se ainda estiver ajustando login. Depois que criar seu acesso e confirmar que o login funciona, pode trocar para `true`.

## Como publicar na Vercel

1. Crie uma conta em [vercel.com](https://vercel.com).
2. Suba o projeto para um repositorio no GitHub ou importe a pasta pela Vercel CLI.
3. Na Vercel, adicione as mesmas variaveis do `.env`.
4. Troque `BETTER_AUTH_URL` para a URL final do projeto, por exemplo:

```env
BETTER_AUTH_URL="https://seu-projeto.vercel.app"
```

5. O comando de build ja esta configurado:

```bash
npm run build
```

6. Depois do primeiro deploy, rode o `db:push` localmente apontando para o Neon ou use o terminal da Vercel se preferir.

## Observacoes importantes

- Imagens e arquivos nao ficam salvos no banco. O banco guarda so dados e referencias; arquivos entram no Cloudinary.
- O seed cria dados de exemplo para voce testar o painel.
- As telas funcionam em modo demonstracao sem `DATABASE_URL`, mas cadastros so persistem depois de conectar o Neon.
- Fase 2 sugerida: CRUD completo de calendario, CRM e area de arquivos.
- Fase 3 sugerida: portal do cliente, aprovacao de conteudo, automacoes e integracoes.

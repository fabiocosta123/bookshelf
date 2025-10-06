📚 BookShelf - Sistema de Gerenciamento de Biblioteca
🎯 Sobre o Projeto
Sistema completo para gerenciamento de biblioteca pessoal ou institucional, com controle de livros, usuários, empréstimos e notificações.

🚀 Tecnologias Utilizadas
Frontend
Next.js 15 com App Router

React 19

TypeScript

Tailwind CSS

shadcn/ui (componentes)

Backend
Next.js API Routes

SQL Server (ou SQLite para desenvolvimento)

Prisma ORM

APIs Externas
Google Books API - para busca e preenchimento automático

🛠️ Configuração do Ambiente
Pré-requisitos
Node.js 18+

npm ou yarn

SQL Server (ou SQLite para desenvolvimento)

Git

1. Clone o Projeto
bash
git clone https://github.com/seu-usuario/bookshelf.git
cd bookshelf
2. Instale as Dependências
bash
npm install
# ou
yarn install
3. Configure as Variáveis de Ambiente
Crie o arquivo .env.local baseado no .env.example:

env
# Banco de Dados
DATABASE_URL="Server=localhost;Database=BookShelf;User Id=sa;Password=sua_senha;Encrypt=false"

# Para SQLite (desenvolvimento):
# DATABASE_URL="file:./dev.db"

# Google Books API
GOOGLE_BOOKS_API_KEY="sua_chave_api_opcional"

# Next.js
NEXTAUTH_SECRET="sua_chave_secreta_nextauth"
NEXTAUTH_URL="http://localhost:3000"
4. Configure o Banco de Dados
Opção A: SQL Server (Recomendado para produção)
Execute o script scripts/setup-database.sql no SQL Server Management Studio

Ou use o Prisma para criar as tabelas:

bash
npx prisma generate
npx prisma db push
Opção B: SQLite (Para desenvolvimento)
bash
npx prisma generate
npx prisma db push
5. Popule com Dados Iniciais (Opcional)
bash
npm run db:seed
# ou
npx prisma db seed
6. Execute o Projeto
bash
npm run dev
# ou
yarn dev
Acesse: http://localhost:3000

📊 Funcionalidades Principais
✅ Gestão de Livros
Cadastrar/editar/excluir livros

Busca por título, autor ou ISBN

Controle de múltiplas cópias

Upload de capas

Integração com Google Books API

✅ Gestão de Usuários
Cadastrar/editar usuários

Busca por nome, email ou matrícula

Controle de status (ativo/inativo)

✅ Sistema de Empréstimos
Registrar empréstimos

Controle de datas (início, vencimento, devolução)

Renovação de empréstimos

Histórico completo

✅ Controle de Estado
Registrar condições dos livros

Observações sobre danos

Histórico de alterações

✅ Sistema de Notificações
Alertas de atraso

Lembretes de vencimento

Notificações do sistema

✅ Dashboard e Relatórios
Estatísticas em tempo real

Livros mais populares

Relatórios de empréstimos

🎮 Comandos Disponíveis
bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run start        # Inicia servidor de produção

# Banco de Dados
npm run db:push      # Atualiza schema do banco
npm run db:studio    # Abre Prisma Studio
npm run db:seed      # Popula com dados de exemplo

# Utilitários
npm run lint         # Executa ESLint
npm run type-check   # Verifica tipos TypeScript
🔧 Configuração do Google Books API (Opcional)
Acesse: https://console.developers.google.com/

Crie um projeto ou selecione um existente

Ative a Google Books API

Crie uma chave de API

Adicione no .env.local:

env
GOOGLE_BOOKS_API_KEY="sua_chave_aqui"
🐛 Solução de Problemas
Erro de Conexão com Banco
Verifique se o SQL Server está rodando

Confirme as credenciais no .env.local

Teste a conexão com: npm run db:studio

Problemas de Build
Execute npm run type-check para verificar tipos

Use npm run lint para identificar problemas

Limpe cache: rm -rf .next && npm run build

Imagens Não Carregam
Verifique se as URLs das capas são válidas

Confirme permissões CORS para imagens externas

🤝 Contribuindo
Fork o projeto

Crie uma branch: git checkout -b feature/nova-funcionalidade

Commit suas mudanças: git commit -m 'Add nova funcionalidade'

Push para a branch: git push origin feature/nova-funcionalidade

Abra um Pull Request# bookshelf

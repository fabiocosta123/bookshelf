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

📁 Estrutura do Projeto
text
bookshelf/
├── 📁 app/                          # Next.js App Router
│   ├── 📄 layout.tsx               # Layout principal
│   ├── 📄 page.tsx                 # Página inicial
│   ├── 📁 (dashboard)/            # Grupo de rotas do dashboard
│   │   └── 📄 page.tsx
│   ├── 📁 (library)/              # Grupo de rotas da biblioteca
│   │   ├── 📄 page.tsx            # Listagem de livros
│   │   ├── 📁 books/
│   │   │   ├── 📄 page.tsx        # Detalhes do livro
│   │   │   ├── 📁 new/
│   │   │   │   └── 📄 page.tsx    # Adicionar livro
│   │   │   └── 📁 [id]/
│   │   │       ├── 📄 page.tsx    # Detalhes do livro
│   │   │       └── 📁 edit/
│   │   │           └── 📄 page.tsx # Editar livro
│   ├── 📁 (users)/                # Grupo de rotas de usuários
│   │   ├── 📄 page.tsx            # Lista de usuários
│   │   ├── 📁 new/
│   │   │   └── 📄 page.tsx        # Novo usuário
│   │   └── 📁 [id]/
│   │       ├── 📄 page.tsx        # Perfil do usuário
│   │       └── 📁 edit/
│   │           └── 📄 page.tsx    # Editar usuário
│   ├── 📁 (loans)/                # Grupo de rotas de empréstimos
│   │   ├── 📄 page.tsx            # Lista de empréstimos
│   │   ├── 📁 new/
│   │   │   └── 📄 page.tsx        # Novo empréstimo
│   │   └── 📁 [id]/
│   │       └── 📄 page.tsx        # Detalhes do empréstimo
│   └── 📁 api/                    # API Routes
│       ├── 📁 books/
│       ├── 📁 users/
│       ├── 📁 loans/
│       └── 📁 notifications/
├── 📁 components/                 # Componentes React
│   ├── 📁 ui/                    # Componentes shadcn/ui
│   ├── 📁 layout/                # Componentes de layout
│   │   ├── 📄 navigation.tsx
│   │   ├── 📄 sidebar.tsx
│   │   └── 📄 header.tsx
│   ├── 📁 books/                 # Componentes de livros
│   │   ├── 📄 book-card.tsx
│   │   ├── 📄 book-form.tsx
│   │   └── 📄 book-search.tsx
│   ├── 📁 users/                 # Componentes de usuários
│   │   ├── 📄 user-card.tsx
│   │   └── 📄 user-form.tsx
│   ├── 📁 loans/                 # Componentes de empréstimos
│   │   ├── 📄 loan-card.tsx
│   │   ├── 📄 loan-form.tsx
│   │   └── 📄 return-dialog.tsx
│   ├── 📁 notifications/         # Componentes de notificações
│   │   └── 📄 notification-bell.tsx
│   └── 📁 conditions/            # Componentes de estado dos livros
│       └── 📄 condition-badge.tsx
├── 📁 lib/                       # Configurações e utilitários
│   ├── 📄 database.ts            # Configuração do banco
│   ├── 📁 services/              # Serviços de negócio
│   │   ├── 📄 book-service.ts
│   │   ├── 📄 user-service.ts
│   │   ├── 📄 loan-service.ts
│   │   ├── 📄 notification-service.ts
│   │   └── 📄 google-books-service.ts
│   ├── 📁 utils/                 # Utilitários
│   │   ├── 📄 date-utils.ts
│   │   └── 📄 validation.ts
│   └── 📁 middleware/            # Middlewares
│       └── 📄 auth.ts
├── 📁 types/                     # Tipos TypeScript
│   ├── 📄 book.ts
│   ├── 📄 user.ts
│   ├── 📄 loan.ts
│   └── 📄 index.ts
├── 📁 prisma/                    # Schema do Prisma
│   └── 📄 schema.prisma
├── 📁 scripts/                   # Scripts utilitários
│   ├── 📄 setup-database.sql
│   └── 📄 seed-data.sql
├── 📁 public/                    # Arquivos estáticos
│   ├── 📄 favicon.ico
│   └── 📁 images/
├── 📄 .env.local                 # Variáveis de ambiente (local)
├── 📄 .env.example               # Exemplo de variáveis de ambiente
├── 📄 package.json
├── 📄 tailwind.config.js
├── 📄 tsconfig.json
└── 📄 README.md                  # Este arquivo
🗄️ Modelo do Banco de Dados
Tabelas Principais
📚 Livros (books)
sql
CREATE TABLE books (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    title NVARCHAR(255) NOT NULL,
    author NVARCHAR(255) NOT NULL,
    genre NVARCHAR(100),
    year INT,
    pages INT,
    total_copies INT DEFAULT 1,
    available_copies INT DEFAULT 1,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    synopsis NVARCHAR(MAX),
    cover NVARCHAR(500),
    isbn NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
👥 Usuários (users)
sql
CREATE TABLE users (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    phone NVARCHAR(20),
    registration_number NVARCHAR(50) UNIQUE,
    user_type NVARCHAR(20) DEFAULT 'STANDARD', -- STANDARD, ADMIN
    is_active BIT DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);
📋 Empréstimos (loans)
sql
CREATE TABLE loans (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    book_id NVARCHAR(50) NOT NULL,
    user_id NVARCHAR(50) NOT NULL,
    loan_date DATE NOT NULL,
    due_date DATE NOT NULL,
    return_date DATE NULL,
    status NVARCHAR(20) DEFAULT 'ACTIVE', -- ACTIVE, RETURNED, OVERDUE
    condition_before NVARCHAR(50), -- Estado do livro antes
    condition_after NVARCHAR(50), -- Estado do livro depois
    notes NVARCHAR(500),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (book_id) REFERENCES books(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
🏷️ Estado dos Livros (book_conditions)
sql
CREATE TABLE book_conditions (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    book_id NVARCHAR(50) NOT NULL,
    condition NVARCHAR(50) NOT NULL, -- EXCELLENT, GOOD, DAMAGED, etc.
    notes NVARCHAR(500),
    reported_by NVARCHAR(50) NOT NULL,
    reported_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (book_id) REFERENCES books(id)
);
🔔 Notificações (notifications)
sql
CREATE TABLE notifications (
    id NVARCHAR(50) PRIMARY KEY DEFAULT NEWID(),
    user_id NVARCHAR(50) NOT NULL,
    title NVARCHAR(255) NOT NULL,
    message NVARCHAR(500) NOT NULL,
    type NVARCHAR(50) NOT NULL, -- OVERDUE, REMINDER, SYSTEM
    is_read BIT DEFAULT 0,
    related_loan_id NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (related_loan_id) REFERENCES loans(id)
);
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

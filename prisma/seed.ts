// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes (opcional)
  console.log('🧹 Limpando dados existentes...')
  await prisma.notification.deleteMany()
  await prisma.bookCondition.deleteMany()
  await prisma.loan.deleteMany()
  await prisma.book.deleteMany()
  await prisma.user.deleteMany()

  // Criar usuário admin
  console.log('👤 Criando usuário admin...')
  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email: 'admin@bookshelf.com',
      user_type: 'ADMIN',
      registration_number: 'ADM001'
    }
  })

  // Criar usuário comum
  const user = await prisma.user.create({
    data: {
      name: 'João Silva',
      email: 'joao@email.com',
      phone: '(11) 99999-9999',
      registration_number: 'USER001'
    }
  })

  // Criar livros de exemplo
  console.log('📚 Criando livros de exemplo...')
  const books = await prisma.book.createMany({
    data: [
      {
        title: 'O Cortiço',
        author: 'Aluísio Azevedo',
        genre: 'Literatura Brasileira',
        year: 1890,
        pages: 256,
        total_copies: 3,
        available_copies: 3,
        rating: 4,
        synopsis: 'Clássico da literatura naturalista brasileira que retrata a vida em um cortiço no Rio de Janeiro.',
        cover: 'https://covers.openlibrary.org/b/id/8317231-M.jpg',
        reading_status: 'LIDO'
      },
      {
        title: 'Fundação',
        author: 'Isaac Asimov',
        genre: 'Ficção Científica',
        year: 1951,
        pages: 255,
        total_copies: 2,
        available_copies: 2,
        rating: 5,
        synopsis: 'Um império galáctico está à beira do colapso e um cientista cria um plano para preservar o conhecimento humano.',
        cover: 'https://covers.openlibrary.org/b/id/8251103-M.jpg',
        reading_status: 'LENDO'
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        genre: 'Programação',
        year: 2008,
        pages: 464,
        total_copies: 5,
        available_copies: 5,
        rating: 5,
        synopsis: 'Um manual de agile software craftsmanship com princípios para escrever código limpo e maintainable.',
        cover: 'https://covers.openlibrary.org/b/id/10512532-M.jpg',
        reading_status: 'QUERO_LER'
      },
      {
        title: 'Dom Casmurro',
        author: 'Machado de Assis',
        genre: 'Literatura Brasileira',
        year: 1899,
        pages: 256,
        total_copies: 2,
        available_copies: 2,
        rating: 5,
        synopsis: 'Romance que explora ciúme e traição através da narrativa de Bentinho sobre sua esposa Capitu.',
        cover: 'https://covers.openlibrary.org/b/id/12880066-M.jpg',
        reading_status: 'LIDO'
      },
      {
        title: '1984',
        author: 'George Orwell',
        genre: 'Ficção',
        year: 1949,
        pages: 328,
        total_copies: 4,
        available_copies: 4,
        rating: 5,
        synopsis: 'Distopia clássica sobre vigilância governamental e controle social em um regime totalitário.',
        cover: 'https://covers.openlibrary.org/b/id/7222246-M.jpg',
        reading_status: 'QUERO_LER'
      }
    ]
  })

  // Criar alguns empréstimos de exemplo
  console.log('📋 Criando empréstimos de exemplo...')
  const loan = await prisma.loan.create({
    data: {
      bookId: (await prisma.book.findFirst({ where: { title: 'Fundação' } }))!.id,
      userId: user.id,
      loan_date: new Date('2024-01-15'),
      due_date: new Date('2024-02-15'),
      status: 'ACTIVE',
      condition_before: 'EXCELLENT'
    }
  })

  console.log('✅ Seed completado com sucesso!')
  console.log(`📊 Estatísticas:`)
  console.log(`   👥 Usuários: 2`)
  console.log(`   📚 Livros: 5`) 
  console.log(`   📋 Empréstimos: 1`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed do banco de dados...')
  
  // Hash da senha
  const saltRounds = 12
  const hashedPassword = await bcrypt.hash('admin123', saltRounds)
  const salt = bcrypt.genSaltSync(saltRounds)
  
  // Criar usuário admin
  try {
    const admin = await prisma.user.upsert({
      where: { email: 'admin@biblioteca.com' },
      update: {
        // Atualiza se já existir
        name: 'Administrador',
        role: 'ADMIN',
        password: hashedPassword,
        salt: salt,
        status: 'ACTIVE'
      },
      create: {
        name: 'Administrador',
        email: 'admin@biblioteca.com',
        role: 'ADMIN',
        password: hashedPassword,
        salt: salt,
        status: 'ACTIVE'
      }
    })
    
    console.log('Usuário admin criado/atualizado:')
    console.log(`   Email: ${admin.email}`)
    console.log(`   Nome: ${admin.name}`)
    console.log(`   Role: ${admin.role}`)
    console.log(`   Status: ${admin.status}`)
    
  } catch (error) {
    console.error(' Erro ao criar usuário admin:', error)
  }
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
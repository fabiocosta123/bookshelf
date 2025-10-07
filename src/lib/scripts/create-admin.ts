// scripts/create-admin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@biblioteca.com';
  const password = 'admin123';
  const name = 'Administrador';
  
  console.log('🔧 Iniciando criação do usuário admin...');

  // Verifica se o admin já existe
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (existingAdmin) {
    console.log('✅ Usuário admin já existe');
    return;
  }

  try {
    // Gera o hash da senha
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Cria o usuário admin
    await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        salt,
        role: 'ADMIN',
        status: 'ACTIVE',
      }
    });

    console.log('🎉 Usuário admin criado com sucesso!');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    console.log('👤 Nome:', name);
    console.log('🎯 Role: ADMIN');
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário admin:', error);
  }
}

// Executa a função
createAdminUser()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
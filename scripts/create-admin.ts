const PrismaClient = require('@prisma/client');
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdminUser() {
  const email = 'admin@biblioteca.com';
  const password = 'admin123';
  const name = 'Administrador';
  
  console.log('🔧 Criando usuário admin...');

  try {
    const existingAdmin = await prisma.user.findUnique({
      where: { email }
    });

    if (existingAdmin) {
      console.log('✅ Admin já existe, atualizando senha...');
      
      const hashedPassword = await bcrypt.hash(password, 12);
      await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          salt: 'default',
          role: 'ADMIN',
        }
      });
    } else {
      const hashedPassword = await bcrypt.hash(password, 12);
      
      await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          salt: 'default',
          role: 'ADMIN',
          status: 'ACTIVE',
        }
      });
      console.log('🎉 Admin criado com sucesso!');
    }

    console.log('📧 Email:', email);
    console.log('🔑 Senha:', password);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
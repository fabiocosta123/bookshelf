// scripts/check-db.ts
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('🔍 Verificando estrutura do banco...');
    
    const users = await prisma.user.findMany({
      take: 1,
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        salt: true,
      }
    });
    
    if (users.length > 0) {
      const user = users[0];
      console.log('✅ ESTRUTURA DO BANCO:');
      console.log('   - password:', user.password ? '✅ Existe' : '❌ NULL');
      console.log('   - salt:', user.salt ? '✅ Existe' : '❌ NULL');
      console.log('🎉 Campos password e salt estão disponíveis!');
    } else {
      console.log('ℹ️  Nenhum usuário encontrado no banco');
    }
    
  } catch (error: any) {
    console.error('❌ ERRO:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
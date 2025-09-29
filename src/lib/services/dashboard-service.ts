import { prisma } from '../database';

export class DashboardService {
    async getDashboardStats() {
        // buscar totais em paralelo para performance
        const [
            totalBooks,
            totalUsers,
            activeLoans,
            completedLoans,
            recentBooks
        ] = await Promise.all([
            // total de livros
            prisma.book.count(),
            // total de usuários
            prisma.user.count(),
            // total de empréstimos ativos
            prisma.loan.count({ where: { status: 'ACTIVE'} }),
            // total de empréstimos concluídos
            prisma.loan.count({ where: { status: 'RETURNED'} }),

            // últimos 5 livros adicionados
            prisma.book.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                select: { id: true, title: true, author: true, cover: true, reading_status: true }
            })
        ]);

        return {
            totalBooks,
            totalUsers,
            activeLoans,
            completedLoans,
            recentBooks
        }
    }

    async getReadingStats (){
        const readingStatus = await prisma.book.groupBy ({
            by: ['reading_status'],
            _count: {
                id: true
            }
        })

        return readingStatus.reduce((acc, item) => {
            acc[item.reading_status] = item._count.id;
            return acc;
        }, {} as Record<string, number>);
    }
}

export const dashboardService = new DashboardService();
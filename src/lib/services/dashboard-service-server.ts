import { prisma } from "../prisma";

export class DashboardService {
  async getDashboardStats() {
    // buscar totais em paralelo para performance
    const [totalBooks, totalUsers, activeLoans, completedLoans, recentBooks] =
      await Promise.all([
        // total de livros
        prisma.book.count(),
        // total de usuários
        prisma.user.count(),
        // total de empréstimos ativos
        prisma.loan.count({
          where: { status: { in: ["ACTIVE", "APPROVED"] } },
        }),
        // total de empréstimos concluídos
        prisma.loan.count({ where: { status: "RETURNED" } }),

        // últimos 5 livros adicionados
        prisma.book.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            title: true,
            author: true,
            cover: true,
            reading_status: true,
          },
        }),
      ]);

    return {
      totalBooks,
      totalUsers,
      activeLoans,
      completedLoans,
      recentBooks,
    };
  }

  // async getReadingStats (){
  //     const readingStatus = await prisma.book.groupBy ({
  //         by: ['reading_status'],
  //         _count: {
  //             id: true
  //         }
  //     })

  //     return readingStatus.reduce((acc: Record<string, number>, item: {reading_status: string; _count: {
  //         id: number
  //     }}) => {
  //         acc[item.reading_status] = item._count.id;
  //         return acc;
  //     }, {} as Record<string, number>);
  // }

  async getReadingStats() {
    // conta por status de leitura
    const readingStatus = await prisma.book.groupBy({
      by: ["reading_status"],
      _count: { id: true },
    });

    // soma total de páginas (usa o campo pages do seu schema)
    const pagesAgg = await prisma.book.aggregate({
      _sum: { pages: true },
    });

    const stats = readingStatus.reduce(
      (
        acc: Record<string, number>,
        item: { reading_status: string; _count: { id: number } }
      ) => {
        acc[item.reading_status] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      QUERO_LER: stats["QUERO_LER"] ?? 0,
      LENDO: stats["LENDO"] ?? 0,
      LIDO: stats["LIDO"] ?? 0,
      PAUSADO: stats["PAUSADO"] ?? 0,
      ABANDONADO: stats["ABANDONADO"] ?? 0,
      totalPagesRead: pagesAgg._sum.pages ?? 0,
    };
  }
}

export const dashboardService = new DashboardService();

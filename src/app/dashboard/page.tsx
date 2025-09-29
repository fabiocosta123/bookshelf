import { Book, Users, ClipboardList, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { dashboardService } from "@/lib/services/dashboard-service";
import { RecentBooks } from "@/components/dashboard/recent-books";

export default async function Dashboard() {
  const stats = await dashboardService.getDashboardStats();
  const readingStats = await dashboardService.getReadingStats();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Visão geral da sua biblioteca pessoal de livros.
        </p>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Livros"
          value={stats.totalBooks}
          icon={Book}
          description="Na sua biblioteca"
          color="blue"
        />

        <StatsCard
          title="Usuários Cadastrados"
          value={stats.totalUsers}
          icon={Users}
          description="No sistema"
          color="green"
        />

        <StatsCard
          title="Empréstimos Ativos"
          value={stats.activeLoans}
          icon={ClipboardList}
          description="Livros emprestados"
          color="purple"
        />

        <StatsCard
          title="Empréstimos Finalizados"
          value={stats.completedLoans}
          icon={CheckCircle}
          description="Histórico total"
          color="orange"
        />
      </div>

      {/* Conteudo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Status de Leitura */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Status de Leitura</h2>
          <div className="space-y-3">
            {Object.entries(readingStats).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {status.toLowerCase().replace("_", " ")}
                </span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Livros Recentes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Livros Recentes</h2>
          <RecentBooks books={stats.recentBooks} />
        </div>
      </div>

      {/* Mensagem de boas-vindas */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">Bem-vindo ao BookShelf!</h2>
        <p className="text-gray-600">
          Seu sistema de gerenciamento de biblioteca está funcionando
          perfeitamente. Aqui você pode acompanhar todas as estatísticas da sua
          coleção de livros.
        </p>
      </div>
    </div>
  );
}

'use client';

import { Book, Users, ClipboardList, CheckCircle } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";
import { dashboardService } from "@/lib/services/dashboard-service";
import { RecentBooks } from "@/components/dashboard/recent-books";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useEffect, useState } from "react";

interface DashboardData {
  stats: any;
  readingStats: any;
}

export default function Dashboard() {
  useRequireAuth(); // Protege a página
  const { user, canViewReports } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [stats, readingStats] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getReadingStats()
        ]);
        setData({ stats, readingStats });
      } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-600">Erro ao carregar dados do dashboard.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {user ? `Bem-vindo, ${user.name}! ` : ''}Visão geral da sua biblioteca pessoal de livros.
        </p>
        
        {/* Mostrar role do usuário */}
        {user && (
          <div className="mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
              user.role === 'EMPLOYEE' ? 'bg-blue-100 text-blue-800' :
              'bg-green-100 text-green-800'
            }`}>
              {user.role === 'ADMIN' ? 'Administrador' :
               user.role === 'EMPLOYEE' ? 'Funcionário' : 'Cliente'}
            </span>
          </div>
        )}
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total de Livros"
          value={data.stats.totalBooks}
          icon={Book}
          description="Na sua biblioteca"
          color="blue"
        />

        <StatsCard
          title="Usuários Cadastrados"
          value={data.stats.totalUsers}
          icon={Users}
          description="No sistema"
          color="green"
        />

        <StatsCard
          title="Empréstimos Ativos"
          value={data.stats.activeLoans}
          icon={ClipboardList}
          description="Livros emprestados"
          color="purple"
        />

        <StatsCard
          title="Empréstimos Finalizados"
          value={data.stats.completedLoans}
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
            {Object.entries(data.readingStats).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 capitalize">
                  {status.toLowerCase().replace("_", " ")}
                </span>
                <span className="font-semibold">{count as number}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Livros Recentes */}
        <div className="bg-white rounded-lg shadow-sm p-6 border">
          <h2 className="text-xl font-semibold mb-4">Livros Recentes</h2>
          <RecentBooks books={data.stats.recentBooks} />
        </div>
      </div>

      {/* Mensagem de boas-vindas personalizada */}
      <div className="bg-white rounded-lg shadow-sm p-6 border">
        <h2 className="text-xl font-semibold mb-4">
          {user ? `Bem-vindo de volta, ${user.name}!` : 'Bem-vindo ao BookShelf!'}
        </h2>
        <p className="text-gray-600 mb-4">
          {user?.role === 'ADMIN' 
            ? 'Como administrador, você tem acesso completo a todas as funcionalidades do sistema.'
            : user?.role === 'EMPLOYEE'
            ? 'Como funcionário, você pode gerenciar livros e empréstimos do sistema.'
            : 'Como cliente, você pode explorar nossa biblioteca e fazer observações nos livros.'
          }
        </p>
        <div className="flex items-center text-sm text-gray-500">
          <span>Email: {user?.email}</span>
        </div>
      </div>
    </div>
  );
}
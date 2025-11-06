"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  BarChart3,
  Download,
  Users,
  Book,
  ClipboardList,
  AlertTriangle,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface ReportsData {
  generalStats: {
    totalBooks: number;
    totalUsers: number;
    activeLoans: number;
    completedLoans: number;
    overdueLoans: number;
    pendingLoans: number;
  };
  popularBooks: {
    id: string;
    title: string;
    author: string;
    loanCount: number;
    available: boolean;
  }[];
  activeUsers: {
    id: string;
    name: string;
    email: string;
    loanCount: number;
    role: string;
  }[];
  monthlyGrowth: {
    month: string;
    newUsers: number;
    newLoans: number;
    returns: number;
  }[];
}

export default function ReportsPage() {
  const { isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("month"); // month, quarter, year

  // Redirecionar se não for employee ou admin
  useEffect(() => {
    if (!isLoading && !isEmployee && !isAdmin) {
      router.push("/books");
    }
  }, [isLoading, isEmployee, isAdmin, router]);

  useEffect(() => {
    if (isEmployee || isAdmin) {
      loadReportsData();
    }
  }, [isEmployee, isAdmin, dateRange]);

  const loadReportsData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/reports?range=${dateRange}`);

      if (!res.ok) throw new Error("Erro ao buscar dados");
      const json: ReportsData = await res.json();
      setData(json);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      toast.error("Erro ao carregar dados dos relatórios");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    toast.info("Funcionalidade de exportação em desenvolvimento");
  };

  if (isLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isEmployee && !isAdmin) {
    return null;
  }

  if (!data) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Erro ao carregar relatórios
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />

      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Análises e estatísticas do sistema BookShelf
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
          </select>
          <button
            onClick={handleExport}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: "Total Livros",
            value: data.generalStats.totalBooks,
            icon: Book,
            color: "text-blue-600",
          },
          {
            label: "Total Usuários",
            value: data.generalStats.totalUsers,
            icon: Users,
            color: "text-green-600",
          },
          {
            label: "Empréstimos Ativos",
            value: data.generalStats.activeLoans,
            icon: ClipboardList,
            color: "text-purple-600",
          },
          {
            label: "Concluídos",
            value: data.generalStats.completedLoans,
            icon: TrendingUp,
            color: "text-orange-600",
          },
          {
            label: "Em Atraso",
            value: data.generalStats.overdueLoans,
            icon: AlertTriangle,
            color: "text-red-600",
          },
          {
            label: "Pendentes",
            value: data.generalStats.pendingLoans,
            icon: Calendar,
            color: "text-yellow-600",
          },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 rounded-md border shadow-sm">
            <div className="flex items-center mb-2">
              <stat.icon className={`h-5 w-5 mr-2 ${stat.color}`} />
              <span className="font-medium text-sm">{stat.label}</span>
            </div>
            <div className={`text-xl font-bold ${stat.color}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Livros e Usuários */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livros Mais Emprestados */}
        <div className="bg-white rounded-md border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">
            Livros Mais Emprestados
          </h2>
          <div className="space-y-3">
            {data.popularBooks.map((book) => (
              <div
                key={book.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{book.title}</div>
                  <div className="text-xs text-gray-600">{book.author}</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    {book.loanCount} empréstimos
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      book.available
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {book.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usuários Mais Ativos */}
        <div className="bg-white rounded-md border shadow-sm p-4">
          <h2 className="text-lg font-semibold mb-4">Usuários Mais Ativos</h2>
          <div className="space-y-3">
            {data.activeUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 border rounded-md"
              >
                <div className="flex-1">
                  <div className="font-medium text-sm">{user.name}</div>
                  <div className="text-xs text-gray-600">{user.email}</div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-600">
                    {user.loanCount} empréstimos
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "EMPLOYEE"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {user.role === "ADMIN"
                      ? "Admin"
                      : user.role === "EMPLOYEE"
                      ? "Funcionário"
                      : "Cliente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crescimento Mensal */}
      <div className="bg-white rounded-md border shadow-sm p-4">
        <h2 className="text-lg font-semibold mb-4">Crescimento Mensal</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {data.monthlyGrowth.map((month) => (
            <div
              key={month.month}
              className="text-center p-4 border rounded-md"
            >
              <div className="font-semibold text-base mb-2">
                {month.month.toUpperCase()}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Novos usuários:</span>
                  <span className="font-medium text-green-600">
                    +{month.newUsers}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Novos empréstimos:</span>
                  <span className="font-medium text-blue-600">
                    +{month.newLoans}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Devoluções:</span>
                  <span className="font-medium text-orange-600">
                    {month.returns}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensagem Informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start gap-3">
          <BarChart3 className="h-6 w-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900 text-sm">
              Relatórios em Tempo Real
            </h3>
            <p className="text-blue-700 mt-1 text-sm">
              Os dados são atualizados automaticamente. Use os filtros para
              analisar períodos específicos e exporte os relatórios para
              compartilhar com a equipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
  Calendar
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
      // Por enquanto, vamos mockar os dados. Depois criamos a API específica
      const mockData: ReportsData = {
        generalStats: {
          totalBooks: 245,
          totalUsers: 156,
          activeLoans: 23,
          completedLoans: 489,
          overdueLoans: 5,
          pendingLoans: 12
        },
        popularBooks: [
          { id: "1", title: "O Hobbit", author: "J.R.R. Tolkien", loanCount: 15, available: true },
          { id: "2", title: "1984", author: "George Orwell", loanCount: 12, available: false },
          { id: "3", title: "Dom Casmurro", author: "Machado de Assis", loanCount: 10, available: true },
          { id: "4", title: "A Revolução dos Bichos", author: "George Orwell", loanCount: 9, available: true },
          { id: "5", title: "Harry Potter e a Pedra Filosofal", author: "J.K. Rowling", loanCount: 8, available: true }
        ],
        activeUsers: [
          { id: "1", name: "João Silva", email: "joao@email.com", loanCount: 8, role: "CLIENT" },
          { id: "2", name: "Maria Santos", email: "maria@email.com", loanCount: 6, role: "CLIENT" },
          { id: "3", name: "Pedro Oliveira", email: "pedro@email.com", loanCount: 5, role: "CLIENT" },
          { id: "4", name: "Ana Costa", email: "ana@email.com", loanCount: 4, role: "EMPLOYEE" },
          { id: "5", name: "Carlos Lima", email: "carlos@email.com", loanCount: 4, role: "CLIENT" }
        ],
        monthlyGrowth: [
          { month: "Jan", newUsers: 15, newLoans: 45, returns: 38 },
          { month: "Fev", newUsers: 12, newLoans: 52, returns: 45 },
          { month: "Mar", newUsers: 18, newLoans: 61, returns: 52 },
          { month: "Abr", newUsers: 14, newLoans: 58, returns: 49 },
          { month: "Mai", newUsers: 16, newLoans: 67, returns: 55 },
          { month: "Jun", newUsers: 20, newLoans: 72, returns: 60 }
        ]
      };

      setData(mockData);
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
          <h3 className="mt-4 text-lg font-medium text-gray-900">Erro ao carregar relatórios</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600 mt-2">
            Análises e estatísticas do sistema BookShelf
          </p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="month">Último mês</option>
            <option value="quarter">Último trimestre</option>
            <option value="year">Último ano</option>
          </select>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <Book className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium">Total Livros</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{data.generalStats.totalBooks}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <Users className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium">Total Usuários</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{data.generalStats.totalUsers}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <ClipboardList className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium">Empréstimos Ativos</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{data.generalStats.activeLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium">Concluídos</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{data.generalStats.completedLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium">Em Atraso</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{data.generalStats.overdueLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <Calendar className="h-5 w-5 text-yellow-600 mr-2" />
            <span className="font-medium">Pendentes</span>
          </div>
          <div className="text-2xl font-bold text-yellow-600">{data.generalStats.pendingLoans}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Livros Mais Populares */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Livros Mais Emprestados</h2>
          <div className="space-y-3">
            {data.popularBooks.map((book, index) => (
              <div key={book.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{book.title}</div>
                  <div className="text-sm text-gray-600">{book.author}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{book.loanCount} empréstimos</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    book.available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {book.available ? "Disponível" : "Indisponível"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usuários Mais Ativos */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Usuários Mais Ativos</h2>
          <div className="space-y-3">
            {data.activeUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-600">{user.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{user.loanCount} empréstimos</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                    user.role === "EMPLOYEE" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {user.role === "ADMIN" ? "Admin" :
                     user.role === "EMPLOYEE" ? "Funcionário" : "Cliente"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Crescimento Mensal */}
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Crescimento Mensal</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {data.monthlyGrowth.map((month) => (
            <div key={month.month} className="text-center p-4 border rounded-lg">
              <div className="font-semibold text-lg mb-2">{month.month}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Novos usuários:</span>
                  <span className="font-medium text-green-600">+{month.newUsers}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Novos empréstimos:</span>
                  <span className="font-medium text-blue-600">+{month.newLoans}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Devoluções:</span>
                  <span className="font-medium text-orange-600">{month.returns}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensagem Informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <BarChart3 className="h-6 w-6 text-blue-600 mr-3 mt-1" />
          <div>
            <h3 className="font-semibold text-blue-900">Relatórios em Tempo Real</h3>
            <p className="text-blue-700 mt-1">
              Os dados são atualizados automaticamente. Use os filtros para analisar períodos específicos 
              e exporte os relatórios para compartilhar com a equipe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
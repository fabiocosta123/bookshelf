"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { 
  Users, 
  Search, 
  UserPlus,
  Download,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "CLIENT" | "EMPLOYEE" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
  _count: {
    loans: number;
    reviews: number;
  };
}

interface Stats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  clients: number;
  employees: number;
  admins: number;
  usersWithLoans: number;
  newUsersThisMonth: number;
}

export default function UsersAdminPage() {
  const { user, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Redirecionar se não for admin
  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/books");
    }
  }, [isLoading, isAdmin, router]);

  // Carregar dados
  useEffect(() => {
    if (isAdmin) {
      loadUsers();
      loadStats();
    }
  }, [isAdmin, search, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (roleFilter) params.append("role", roleFilter);
      if (statusFilter) params.append("status", statusFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      if (!response.ok) throw new Error("Erro ao carregar usuários");
      
      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch("/api/admin/users/stats");
      if (!response.ok) throw new Error("Erro ao carregar estatísticas");
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro ao carregar estatísticas");
    }
  };

  const handleExport = () => {
    toast.info("Funcionalidade de exportação em desenvolvimento");
  };

  const handleAddUser = () => {
    toast.info("Funcionalidade de adicionar usuário em desenvolvimento");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Será redirecionado pelo useEffect
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Toaster para notificações */}
      <Toaster position="top-right" richColors closeButton />
      
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciar Usuários</h1>
          <p className="text-gray-600 mt-2">
            Administre os usuários do sistema BookShelf
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleAddUser}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <UserPlus className="h-4 w-4" />
            Adicionar Usuário
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.totalUsers}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-red-600">{stats.suspendedUsers}</div>
            <div className="text-sm text-gray-600">Suspensos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-gray-600">{stats.clients}</div>
            <div className="text-sm text-gray-600">Clientes</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.employees}</div>
            <div className="text-sm text-gray-600">Funcionários</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.admins}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{stats.usersWithLoans}</div>
            <div className="text-sm text-gray-600">Com Empréstimos</div>
          </div>
          <div className="bg-white p-4 rounded-lg border shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.newUsersThisMonth}</div>
            <div className="text-sm text-gray-600">Novos/Mês</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Filtro de Role */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os tipos</option>
            <option value="CLIENT">Clientes</option>
            <option value="EMPLOYEE">Funcionários</option>
            <option value="ADMIN">Administradores</option>
          </select>

          {/* Filtro de Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="ACTIVE">Ativos</option>
            <option value="INACTIVE">Inativos</option>
            <option value="SUSPENDED">Suspensos</option>
          </select>
        </div>
      </div>

      {/* Tabela de Usuários */}
      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum usuário encontrado</h3>
            <p className="mt-2 text-gray-500">
              {search || roleFilter || statusFilter 
                ? "Tente ajustar os filtros de busca." 
                : "Ainda não há usuários cadastrados no sistema."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empréstimos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reviews
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={user.image || "/default-avatar.png"}
                          alt={user.name}
                          className="h-10 w-10 rounded-full mr-3"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                        user.role === "EMPLOYEE" ? "bg-blue-100 text-blue-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {user.role === "ADMIN" ? "Administrador" :
                         user.role === "EMPLOYEE" ? "Funcionário" : "Cliente"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                        user.status === "SUSPENDED" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {user.status === "ACTIVE" ? "Ativo" :
                         user.status === "SUSPENDED" ? "Suspenso" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user._count.loans}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user._count.reviews}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => router.push(`/admin/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Ver detalhes
                      </button>
                      <button 
                        onClick={() => toast.info("Funcionalidade de edição em desenvolvimento")}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
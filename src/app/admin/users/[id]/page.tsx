"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Book,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Edit,
  Shield,
  UserCheck,
  UserX,
} from "lucide-react";

import Link from "next/link";
import { EditUserModal } from "@/components/admin/EditUserModal";

interface UserDetails {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "CLIENT" | "ADMIN" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  phone?: string;
  registration_number?: string;
  createdAt: string;
  updatedAt: string;
  stats: {
    totalLoans: number;
    activeLoans: number;
    totalReviews: number;
    completedLoans: number;
    overdueLoans: number;
  };
  loans: {
    active: [any];
    history: [any];
    pending: [any];
  };
  reviews: [any];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

interface ModalUser {
  id: string;
  name: string;
  email: string;
  image?: string;
  role: "CLIENT" | "ADMIN" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  phone?: string;
  registration_number?: string;
}

export default function UserDetailsPage({ params }: PageProps) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<ModalUser | null>(null);


   // Função para formatar datas com segurança
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data inválida";
    
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) 
        ? "Data inválida" 
        : date.toLocaleDateString("pt-BR");
    } catch {
      return "Data inválida";
    }
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/books");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      loadUserDetails();
    }
  }, [isAdmin]);

  const loadUserDetails = async () => {
    try {
      const { id } = await params;
      const response = await fetch(`/api/admin/users/${id}`);

      if (!response.ok) {
        throw new Error("Erro ao carregar usuário");
      }

      const data = await response.json();
      setUserDetails(data);
    } catch (error) {
      console.error("Erro ao carregar detalhes do usuário:", error);
      toast.error("Erro ao carregar detalhes do usuário");
    } finally {
      setLoading(false);
    }
  };

  // Edita Usuarios
  const handleEditUser = () => {
   setEditModalOpen(true)
  };

  

  const handleUserUpdated = () => {
    loadUserDetails();
    toast.success("Usuário atualizado com sucesso");
  }


// troca nivel de função
 const handleChangeRole = (newRole: string) => {
    if (userDetails) {
      setSelectedUser({
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        image: userDetails.image,
        role: userDetails.role,
        status: userDetails.status,
        phone: userDetails.phone,
        registration_number: userDetails.registration_number
      } as ModalUser);

      // pré-preencher o modal com novo role
      setTimeout(() => {
        setEditModalOpen(true);
      }, 100);
    }
  }

  const handleChangeStatus = (newStatus: string) => {
    if (userDetails) {
      setSelectedUser({
        id: userDetails.id,
        name: userDetails.name,
        email: userDetails.email,
        image: userDetails.image,
        role: userDetails.role,
        status: userDetails.status,
        phone: userDetails.phone,
        registration_number: userDetails.registration_number
      } as ModalUser);
      
    // pré-preencher o modal com novo status
      setTimeout(() => {
      setEditModalOpen(true);
    }, 100);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  if (!userDetails) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Usuário não encontrado
          </h3>
          <Link
            href="/admin/users"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mt-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Usuários
          </Link>
        </div>
      </div>
    );
  }

 

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Toaster position="top-right" richColors closeButton />

      {/* modal de edição */}
      <EditUserModal 
        user={userDetails ? {
          id: userDetails.id,
          name: userDetails.name,
          email: userDetails.email,
          role: userDetails.role,
          status: userDetails.status,
          phone: userDetails.phone,
          registration_number: userDetails.registration_number,
          image: userDetails.image
        } : null } 
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onUserUpdated={handleUserUpdated}
      />

      {/* Cabeçalho */}

      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para pagina de "Usuários"
        </Link>

        <div className="flex items-center gap-4">
          {userDetails.image ? (
            <img
              src={userDetails.image}
              alt={userDetails.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {userDetails.name}
            </h1>
            <p className="text-gray-600 mt-1">{userDetails.email}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleEditUser}
            className="flex items-center gap-2 px-4 py-2 mt-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <Edit className="h-4 w-4" />
            Editar Usuário
          </button>
        </div>
      </div>

      {/* Estatisticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <Book className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-medium">Total Empréstimos</span>
          </div>
          <div className="text-2xl font-bold text-blue-600">{userDetails.stats.totalLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <Clock className="h-5 w-5 text-orange-600 mr-2" />
            <span className="font-medium">Empréstimos Ativos</span>
          </div>
          <div className="text-2xl font-bold text-orange-600">{userDetails.stats.activeLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <span className="font-medium">Empréstimos Concluídos</span>
          </div>
          <div className="text-2xl font-bold text-green-600">{userDetails.stats.completedLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium">Empréstimos Atrasados</span>
          </div>
          <div className="text-2xl font-bold text-red-600">{userDetails.stats.overdueLoans}</div>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm">
          <div className="flex items-center mb-2">
            <FileText className="h-5 w-5 text-purple-600 mr-2" />
            <span className="font-medium">Total Avaliações</span>
          </div>
          <div className="text-2xl font-bold text-purple-600">{userDetails.stats.totalReviews}</div>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do usuário */}
        <div className="lg:col-span-1 space-y-6">
        {/* Card de Informações  */}
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Informações do Usuário</h2>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tipo: </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                 userDetails.role === "ADMIN" ? "bg-purple-100 text-purple-800" :
                  userDetails.role === "EMPLOYEE" ? "bg-blue-100 text-blue-800" :
                  "bg-green-100 text-green-800"
                }`}>
                   {userDetails.role === "ADMIN" ? "Administrador" :
                   userDetails.role === "EMPLOYEE" ? "Funcionário" : "Cliente"}
                </span>
              </div>

               <div className="flex justify-between items-center">
                <span className="text-gray-600">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  userDetails.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                  userDetails.status === "SUSPENDED" ? "bg-red-100 text-red-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {userDetails.status === "ACTIVE" ? "Ativo" :
                   userDetails.status === "SUSPENDED" ? "Suspenso" : "Inativo"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Cadastro:</span>
                <span className="text-sm">
                  {formatDate(userDetails.createdAt)}
                </span>
              </div>               
              

               {userDetails.registration_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Matrícula:</span>
                  <span className="text-sm">{userDetails.registration_number}</span>
                </div>
              )}

            </div>
          </div>

          {/* Ações Rápidas */}

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Ações Rápidas</h2>
            
            <div className="space-y-3">
              <button
                onClick={() => handleChangeRole("EMPLOYEE")}
                className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
              >
                <Shield className="h-4 w-4 mr-2" />
                Promover para Funcionário
              </button>

              
              <button
                onClick={() => handleChangeStatus("ACTIVE")}
                className="flex items-center w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors cursor-pointer"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Reativar Usuário
              </button>

              <button
                onClick={() => handleChangeStatus("SUSPENDED")}
                className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              >
                <UserX className="h-4 w-4 mr-2" />
                Suspender Usuário
              </button>

            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Empréstimos Ativos */}
          {userDetails.loans.active.length > 0 && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Empréstimos Ativos</h2>
              <div className="space-y-3">
                {userDetails.loans.active.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{loan.book.title}</div>
                      <div className="text-sm text-gray-600">Solicitado em {new Date(loan.requestedAt).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      {loan.status === "ACTIVE" ? "Em Andamento" : "Aprovado"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empréstimos Pendentes */}
          {userDetails.loans.pending.length > 0 && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Solicitações Pendentes</h2>
              <div className="space-y-3">
                {userDetails.loans.pending.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{loan.book.title}</div>
                      <div className="text-sm text-gray-600">Solicitado em {new Date(loan.requestedAt).toLocaleDateString("pt-BR")}</div>
                    </div>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                      Pendente
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {userDetails.reviews.length > 0 && (
            <div className="bg-white rounded-lg border shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">Últimas Reviews</h2>
              <div className="space-y-4">
                {userDetails.reviews.slice(0, 5).map((review) => (
                  <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-medium">{review.book.title}</div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 line-clamp-3">{review.content}</p>
                    {review.page && (
                      <div className="text-xs text-gray-500 mt-1">Página {review.page}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sem Conteúdo */}
          {userDetails.loans.active.length +
            userDetails.loans.pending.length +
            userDetails.reviews.length === 0 ? (
              <div className="bg-white rounded-lg border shadow-sm p-6 text-center">
               <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhuma atividade</h3>
              <p className="mt-2 text-gray-500">
                Este usuário ainda não possui empréstimos ou reviews.
              </p>
              </div>
            ) : null }

        </div>
      </div>
    </div>
  );
}

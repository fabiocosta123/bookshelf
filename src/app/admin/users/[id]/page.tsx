"use client";

import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Toaster, toast } from "sonner";
import { ArrowLeft, User, Mail, Calendar, Book, FileText } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function UserDetailsPage({ params }: PageProps) {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/books");
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6">
      <Toaster position="top-right" richColors closeButton />

      {/* Cabeçalho */}

      <div className="mb-6">
        <Link
          href="/admin/users"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para pagina de "Usuários"
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">
          Detalhes do Usuário
        </h1>
        <p className="text-gray-600 mt-2">Pagina em desenvolvimento</p>
      </div>

      {/* Card de Informações */}
      <div className="bg-whhite rounded-lg border shadow-sm p-6 max-w-2xl">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="h-10 w-10 text-blue-600" />
          </div>

          <h2 className="text-xl font-semibold">
            Funcionalidade em Desenvolvimento
          </h2>
          <p className="text-gray-600 mt-2">
            Em breve, você poderá ver os detalhes completos do usuário aqui.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Estatisticas placeholder*/}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Book className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium">Empréstimos Ativos</span>
            </div>

            <div className="text-2xl font-bold text-blue-600">-</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <FileText className="h-5 w-5 text-green-600 mr-2" />
              <span className="font-medium">Reviews Escritas</span>
            </div>
            <div className="text-2xl font-bold text-green-600">-</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Mail className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Tipo de Usuário</span>
            </div>
            <div className="text-lg font-semibold text-purple-600">-</div>
          </div>

           <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <Calendar className="h-5 w-5 text-orange-600 mr-2" />
              <span className="font-medium">Membro Desde</span>
            </div>
            <div className="text-lg font-semibold text-orange-600">-</div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex gap-3">
                <button
                    onClick={() => toast.info("Edição de usuário em desenvolvimento")}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                    Editar Usuário
                </button>

                <button
                    onClick={() => toast.info("Visualização de histórico em desenvolvimento")}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                    Ver histórico Completo
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}

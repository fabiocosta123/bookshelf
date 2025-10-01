"use client";

import { Edit, Trash2, Eye, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { DeleteConfirmation } from "./delete-confirmation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    genre?: string | null;
    year?: number | null;
    pages?: number | null;
    total_copies: number;
    available_copies: number;
    rating?: number | null;
    cover?: string | null;
    reading_status: string;
    loans: Array<{
      id: string;
      user: { name: string };
    }>;
  };
  onDelete?: (id: string) => void;
  showAdminActions?: boolean;
}

export function BookCard({ book, onDelete, showAdminActions = true }: BookCardProps) {
  const { isClient, isEmployee, isAdmin } = useAuth();
  const router = useRouter();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusColor = (status: string) => {
    const colors = {
      QUERO_LER: "bg-blue-100 text-blue-800",
      LENDO: "bg-yellow-100 text-yellow-800",
      LIDO: "bg-green-100 text-green-800",
      PAUSADO: "bg-orange-100 text-orange-800",
      ABANDONADO: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const availableCopies = book.available_copies;
  const isAvailable = availableCopies > 0;

  // Clientes NÃO podem fazer ações administrativas
  const canManageBooks = isEmployee || isAdmin;
  const canDelete = canManageBooks && book.loans.length === 0;
  const canEdit = canManageBooks;

  const handleDelete = async () => {
    if (!canManageBooks) return; // Proteção extra
    
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/books/${book.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir o livro");
      }

      toast.success("Livro excluído com sucesso!", {
        description: `"${book.title}" foi removido da biblioteca.`,
        duration: 3000,
      });

      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Erro ao excluir livro:", error);
      toast.error("Erro ao excluir livro", {
        description: "Tente novamente mais tarde.",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow duration-200">
        {/* Capa do livro */}
        <div className="relative">
          <div className="h-48 bg-gray-200 rounded-t-lg flex items-center justify-center overflow-hidden">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400 text-center p-4">
                <div className="text-4xl mb-2">📚</div>
                <div className="text-sm">Sem capa</div>
              </div>
            )}
          </div>

          {/* Badge de status */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                book.reading_status
              )}`}
            >
              {book.reading_status.replace("_", " ")}
            </span>
          </div>

          {/* Badge de disponibilidade */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                isAvailable
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isAvailable ? `${availableCopies} disponível` : "Indisponível"}
            </span>
          </div>
        </div>

        {/* Informações do livro */}
        <div className="p-4">
          <h3
            className="font-semibold text-lg mb-1 line-clamp-2"
            title={book.title}
          >
            {book.title}
          </h3>

          <p className="text-gray-600 text-sm mb-2" title={book.author}>
            por {book.author}
          </p>

          {/* Metadados */}
          <div className="flex flex-wrap gap-1 mb-3">
            {book.genre && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                {book.genre}
              </span>
            )}
            {book.year && (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                {book.year}
              </span>
            )}
            {book.rating && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                ⭐ {book.rating}/5
              </span>
            )}
          </div>

          {/* Empréstimos ativos */}
          {book.loans.length > 0 && (
            <div className="flex items-center text-xs text-gray-500 mb-3">
              <Users className="h-3 w-3 mr-1" />
              {book.loans.length} empréstimo(s) ativo(s)
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              {/* Botão VER DETALHES - Disponível para todos */}
              <Link
                href={`/books/${book.id}`}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Ver detalhes"
              >
                <Eye className="h-4 w-4" />
              </Link>

              {/* Botão EDITAR - Só para funcionários/admin */}
              {canEdit && (
                <Link
                  href={`/books/${book.id}/edit`}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Editar livro"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              )}
            </div>

            {/* Botão EXCLUIR - Só para funcionários/admin */}
            {canManageBooks && (
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  canDelete
                    ? "text-red-600 hover:bg-red-50"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                title={
                  canDelete
                    ? "Excluir livro"
                    : "Não pode ser excluído - possui empréstimos ativos"
                }
                disabled={!canDelete}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Mensagem se tiver empréstimos - Só para admin/funcionários */}
          {canManageBooks && book.loans.length > 0 && (
            <div className="mt-2 text-xs text-orange-600">
              ⚠️ Não pode ser excluído - possui empréstimos ativos
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmação - Só aparece para admin/funcionários */}
      {canManageBooks && (
        <DeleteConfirmation
          isOpen={isDeleteModalOpen && canDelete}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDelete}
          bookTitle={book.title}
          isLoading={isDeleting}
        />
      )}
    </>
  );
}
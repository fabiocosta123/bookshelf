"use client";

import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { useEffect, useState } from "react";
import { Book, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";
import { ReviewSection } from "@/components/books/review-section";
import { toast } from "sonner";
import { CreateLoanModal } from "@/components/admin/CreateLoanModal";
import { Edit, UserPlus} from 'lucide-react';

interface BookDetail {
  id: string;
  title: string;
  author: string;
  genre?: string | null;
  year?: number | null;
  pages?: number | null;
  total_copies: number;
  available_copies: number;
  rating?: number | null;
  synopsis?: string | null;
  cover?: string | null;
  reading_status: string;
  loans: Array<{
    id: string;
    user: { name: string };
  }>;
}

export default function BookDetailPage() {
  useRequireAuth();
  const { isClient } = useAuth();
  const params = useParams();
  const router = useRouter();

  const [book, setBook] = useState<BookDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isRequestingLoan, setIsRequestingLoan] = useState(false);

  const [openCreateModal, setOpenCreateModal] = useState(false);

  useEffect(() => {
    async function loadBook() {
      try {
        const response = await fetch(`/api/books/${params.id}`);
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/404");
            return;
          }
          throw new Error("Erro ao carregar livro");
        }
        const bookData = await response.json();
        setBook(bookData);
      } catch (error) {
        console.error("Erro ao carregar livro:", error);
        router.push("/books");
      } finally {
        setLoading(false);
      }
    }

    loadBook();
  }, [params.id, router]);

  // solicita empréstimo
  const handleLoanRequest = async () => {
    if (!book) return;

    try {
      setIsRequestingLoan(true);

      const response = await fetch("/api/loans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book.id,
          userNotes: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao solicitar empréstimo");
      }

      toast.success("Solicitação de empréstimo enviada com sucesso!");

      // atualiza os dados do livro para futura mudança
      const updatedResponse = await fetch(`/api/books/${params.id}`);
      if (updatedResponse.ok) {
        const updatedBook = await updatedResponse.json();
        setBook(updatedBook);
      }
    } catch (error: any) {
      console.error("Erro ao solicitar empréstimo:", error);
      toast.error(error.message);
    } finally {
      setIsRequestingLoan(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Livro não encontrado
        </h1>
        <Link href="/books" className="text-blue-600 hover:text-blue-700">
          Voltar para a biblioteca
        </Link>
      </div>
    );
  }

  const isAvailable = book.available_copies > 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/books"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Biblioteca
        </Link>

        <h1 className="text-3xl font-bold text-gray-900">{book.title}</h1>
        <p className="text-gray-600 mt-2">por {book.author}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Capa e Informações Básicas */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="aspect-[3/4] bg-gray-200 rounded-lg flex items-center justify-center mb-4">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-gray-400 text-center">
                  <Book className="h-16 w-16 mx-auto mb-2" />
                  <div className="text-sm">Sem capa</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Disponibilidade:</span>
                <span
                  className={`font-medium ${
                    isAvailable ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isAvailable
                    ? `${book.available_copies} disponível`
                    : "Indisponível"}
                </span>
              </div>

              {book.rating && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Avaliação:</span>
                  <span className="flex items-center text-yellow-600">
                    <Star className="h-4 w-4 fill-current mr-1" />
                    {book.rating}/5
                  </span>
                </div>
              )}

              {book.loans.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Empréstimos ativos:</span>
                  <span className="text-orange-600">{book.loans.length}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Detalhes do Livro */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold mb-4">Detalhes do Livro</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              {book.genre && (
                <div>
                  <span className="text-gray-600">Gênero:</span>
                  <p className="font-medium">{book.genre}</p>
                </div>
              )}

              {book.year && (
                <div>
                  <span className="text-gray-600">Ano:</span>
                  <p className="font-medium">{book.year}</p>
                </div>
              )}

              {book.pages && (
                <div>
                  <span className="text-gray-600">Páginas:</span>
                  <p className="font-medium">{book.pages}</p>
                </div>
              )}

              <div>
                <span className="text-gray-600">Status:</span>
                <p className="font-medium capitalize">
                  {book.reading_status.toLowerCase().replace("_", " ")}
                </p>
              </div>
            </div>

            {book.synopsis && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Sinopse</h3>
                <p className="text-gray-700 leading-relaxed">{book.synopsis}</p>
              </div>
            )}

            {/* Ações */}
            <div className="flex space-x-4 pt-6 border-t border-gray-200">
              {isClient ? (
                <>
                  {isAvailable && (
                    <button
                      onClick={handleLoanRequest}
                      disabled={isRequestingLoan}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        isRequestingLoan
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 cursor-pointer"
                      } text-white`}
                    >
                      {isRequestingLoan
                        ? "Solicitando..."
                        : "Solicitar Empréstimo"}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <Link
                    href={`/books/${book.id}/edit`}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <button className="...">
  <Edit className="h-4 w-4 mr-2" />
  Editar Livro
</button>

                  </Link>
                  <button
                    onClick={() => setOpenCreateModal(true)}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                     <UserPlus className="h-4 w-4 mr-2" />
                    Criar Empréstimo
                  </button>

                  <CreateLoanModal
                    bookId={book.id}
                    open={openCreateModal}
                    onOpenChange={setOpenCreateModal}
                    onCreated={async () => {
                      // atualiza os dados do livro após criação do empréstimo
                      const updatedResp = await fetch(
                        `/api/books/${params.id}`
                      );
                      if (updatedResp.ok) setBook(await updatedResp.json());
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Seção de Observações (apenas para clientes) */}
          {isClient && (
            <ReviewSection
              bookId={book.id}
              showFormInitially={showReviewForm}
              onFormClose={() => setShowReviewForm(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}


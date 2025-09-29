import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Users, Calendar, Star, BookOpen } from "lucide-react";
import Link from "next/link";
import { bookService } from "@/lib/services/book-service";

interface BookDetailPageProps {
  params: { id: string };
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const book = await bookService.getBookById(params.id);

  if (!book) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    const colors = {
      QUERO_LER: "bg-blue-100 text-blue-800 border-blue-200",
      LENDO: "bg-yellow-100 text-yellow-800 border-yellow-200",
      LIDO: "bg-green-100 text-green-800 border-green-200",
      ABANDONADO: "bg-red-100 text-red-800 border-red-200",
      PAUSADO: "bg-orange-100 text-orange-800 border-orange-200",
    };
    return (
      colors[status as keyof typeof colors] ||
      "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const getStatusText = (status: string) => {
    const texts = {
      QUERO_LER: "Quero Ler",
      LENDO: "Lendo",
      LIDO: "Lido",
      ABANDONADO: "Abandonado",
      PAUSADO: "Pausado",
    };
    return texts[status as keyof typeof texts] || status;
  };

  return (
    <div>
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/books"
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar para Biblioteca
        </Link>

        <Link
          href={`/books/${book.id}/edit`}
          className="flex items-center text-white bg-green-600 px-4 py-2 hover:text-green-700 transition-colors font-medium"
        >
          <Edit className="h-4 w-4 mr-2" />
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="md:flex">
          {/* Coluna da esquerda - Capa e informações básicas */}
          <div className="md:w-1/3 p-8 border-r border-gray-200">
            <div className="flex flex-col items-center">
              {/* Capa do livro */}
              <div className="w-48 h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden mb-6">
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-center p-4">
                    <div className="text-6xl mb-2">📚</div>
                    <div className="text-sm">Sem capa</div>
                  </div>
                )}
              </div>

              {/* Informações rápidas */}
              <div className="w-full space-y-4">
                {/* Status */}
                <div className="text-center">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(
                      book.reading_status
                    )}`}
                  >
                    {getStatusText(book.reading_status)}
                  </span>
                </div>

                {/* Disponibilidade */}
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {book.available_copies} / {book.total_copies}
                  </div>
                  <div className="text-sm text-gray-600">
                    cópias disponíveis
                  </div>
                </div>

                {/* Rating */}
                {book.rating && (
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Star className="h-5 w-5 text-yellow-400 fill-current" />
                      <span className="font-semibold text-gray-900">
                        {book.rating}
                      </span>
                      <span className="text-gray-600">/5</span>
                    </div>
                    <div className="text-sm text-gray-600">avaliação</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Coluna da direita - Informações detalhadas */}
          <div className="md:w-2/3 p-8">
            {/* Título e autor */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-gray-600">por {book.author}</p>
            </div>

            {/* Metadados em grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {book.genre && (
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Gênero</div>
                    <div className="font-medium">{book.genre}</div>
                  </div>
                </div>
              )}

              {book.year && (
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Ano</div>
                    <div className="font-medium">{book.year}</div>
                  </div>
                </div>
              )}

              {book.pages && (
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">Páginas</div>
                    <div className="font-medium">{book.pages}</div>
                  </div>
                </div>
              )}

              {book.isbn && (
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <div className="text-sm text-gray-600">ISBN</div>
                    <div className="font-medium font-mono">{book.isbn}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Sinopse */}
            {book.synopsis && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Sinopse
                </h3>
                <p className="text-gray-700 leading-relaxed">{book.synopsis}</p>
              </div>
            )}

            {/* Empréstimos ativos */}
            {book.loans.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Empréstimos Ativos ({book.loans.length})
                </h3>
                <div className="space-y-2">
                  {book.loans.map((loan) => (
                    <div
                      key={loan.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{loan.user.name}</div>
                        <div className="text-sm text-gray-600">
                          Emprestado em{" "}
                          {new Date(loan.loan_date).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        Devolução:{" "}
                        {new Date(loan.due_date).toLocaleDateString("pt-BR")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Estado de conservação */}
            {book.conditions && book.conditions.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Estado de Conservação
                </h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-medium capitalize">
                    {book.conditions[0].condition.toLowerCase()}
                  </div>
                  {book.conditions[0].notes && (
                    <div className="text-sm text-gray-700 mt-1">
                      {book.conditions[0].notes}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

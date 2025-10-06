"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { Search, BookOpen, Plus, Shield } from "lucide-react"; // ← Adicionei Shield aqui
import { toast } from "sonner";

interface GoogleBookResult {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };
}

export default function ImportBooksPage() {
  useRequireAuth();
  const { user, isEmployee, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GoogleBookResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [importingIds, setImportingIds] = useState<Set<string>>(new Set());

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // apenas funcionarios e admin podem acessar
  if (!isEmployee && !isAdmin) {
    // Removi o toast.error de dentro do JSX - isso causa erro
    return (
      <div className="max-w-4xl mx-auto py-16">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Acesso Negado
          </h1>
          <p className="text-gray-600 mb-4">
            Você não tem permissão para importar livros.
          </p>
        </div>
        <div className="text-center">
          <button
            onClick={() => router.push("/books")}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Voltar para Biblioteca
          </button>
        </div>
      </div>
    );
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Digite um termo para buscar");
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `/api/google-books?q=${encodeURIComponent(searchQuery)}`
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar livros");
      }

      const books = await response.json();
      setSearchResults(books || []);

      if (!books || books.length === 0) {
        toast.info("Nenhum livro encontrado. Tente outros termos de busca.");
      }
    } catch (error: any) {
      console.error("Erro na busca:", error);
      toast.error(error.message || "Erro ao buscar livros");
    } finally {
      setIsSearching(false);
    }
  };

  const handleImport = async (googleBookId: string, bookTitle: string) => {
    try {
      setImportingIds((prev) => new Set(prev.add(googleBookId)));

      const response = await fetch("/api/books/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ googleBookId }),
      });

      const data = await response.json(); // ← Corrigi: faltava os parênteses ()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao importar livro");
      }

      toast.success(`"${bookTitle}" importado com sucesso`);
      router.push(`/books/${data.id}`);
    } catch (error: any) {
      console.error("Erro na importação:", error);
      toast.error(error.message);
    } finally {
      setImportingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(googleBookId);
        return newSet;
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Importar Livros
        </h1>
        <p className="text-gray-600">
          Busque e importe livros da Google Books API
          {user?.name && (
            <span className="text-blue-600 font-medium">
              {" "}
              • Logado como: {user.name}
            </span>
          )}
        </p>
      </div>

      {/* Barra de busca */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite o título, autor ou ISBN do livro..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Search className="h-5 w-5" />
            {isSearching ? "Buscando..." : "Buscar"}
          </button>
        </div>

        <div className="mt-3 text-sm text-gray-500">
          <p>
            💡 Dica: busque por títulos como "Harry Potter", "1984" ou autores
            como "Stephen King"
          </p>
        </div>
      </div>

      {/* Resultados */}
      {searchResults.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-sm border p-4"
            >
              <div className="flex gap-4">
                {book.volumeInfo.imageLinks?.thumbnail && (
                  <img
                    src={book.volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                    alt={book.volumeInfo.title}
                    className="w-20 h-28 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                    {book.volumeInfo.title}
                  </h3>
                  {book.volumeInfo.authors && (
                    <p className="text-gray-600 text-sm mb-2">
                      por {book.volumeInfo.authors.join(", ")}
                    </p>
                  )}
                  {book.volumeInfo.publishedDate && (
                    <p className="text-gray-500 text-xs">
                      {new Date(book.volumeInfo.publishedDate).getFullYear()}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleImport(book.id, book.volumeInfo.title)} // ← Corrigi: adicionei o segundo argumento
                disabled={importingIds.has(book.id)}
                className="w-full mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {importingIds.has(book.id) ? (
                  <>Importando...</>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Importar para Biblioteca
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && !isSearching && searchQuery && (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            Nenhum livro encontrado. Tente outros termos de busca.
          </p>
        </div>
      )}

      {!searchQuery && !isSearching && (
        <div className="text-center py-12">
          <Search className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Digite acima para buscar livros</p>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, BookOpen, Search } from "lucide-react";
import Link from "next/link";
import { bookService, GENRES } from "@/lib/services/book-service";
import { ReadingStatus } from "@prisma/client";

export default function NewBookPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [coverPreview, setCoverPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    genre: "",
    year: "",
    pages: "",
    total_copies: "1",
    rating: "",
    synopsis: "",
    cover: "",
    reading_status: "QUERO_LER" as ReadingStatus,
    isbn: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    if (name === "cover" && value) {
      setCoverPreview(value);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.author.trim()) {
      newErrors.author = "Autor é obrigatório";
    }

    if (formData.year && (Number(formData.year) < 1000 || Number(formData.year) > new Date().getFullYear())) {
      newErrors.year = "Ano inválido";
    }

    if (formData.total_copies && Number(formData.total_copies) <= 0) {
      newErrors.total_copies = "Número de cópias deve ser maior que zero";
    }

    if (formData.pages && Number(formData.pages) <= 0) {
      newErrors.pages = "Número de páginas deve ser maior que zero";
    }

    if (formData.rating && (Number(formData.rating) < 1 || Number(formData.rating) > 5)) {
      newErrors.rating = "Avaliação deve ser entre 1 e 5";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSearchByISBN = async () => {
    if (!formData.isbn) return;

    setIsLoading(true);
    try {
      console.log("Buscando livro por ISBN:", formData.isbn);
      // TODO: Integrar com Google Books API
    } catch (error) {
      console.error("Erro ao buscar livro:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await bookService.createBook({
        title: formData.title,
        author: formData.author,
        genre: formData.genre || undefined,
        year: formData.year ? Number(formData.year) : undefined,
        pages: formData.pages ? Number(formData.pages) : undefined,
        total_copies: Number(formData.total_copies),
        rating: formData.rating ? Number(formData.rating) : undefined,
        synopsis: formData.synopsis || undefined,
        cover: formData.cover || undefined,
        reading_status: formData.reading_status,
        isbn: formData.isbn || undefined,
      });

      router.push("/books");
      router.refresh();
    } catch (error) {
      console.error("Erro ao criar livro:", error);
      setErrors({ submit: "Erro ao salvar livro. Tente novamente." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/books"
          className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Voltar para Biblioteca
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Adicionar Novo Livro</h1>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              Informações Básicas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Título do livro"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Autor *
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.author ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nome do autor"
                />
                {errors.author && <p className="text-red-500 text-sm mt-1">{errors.author}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gênero
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um gênero</option>
                  {GENRES.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="reading_status"
                  value={formData.reading_status}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="QUERO_LER">Quero Ler</option>
                  <option value="LENDO">Lendo</option>
                  <option value="LIDO">Lido</option>
                  <option value="PAUSADO">Pausado</option>
                  <option value="ABANDONADO">Abandonado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ano
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.year ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="2024"
                />
                {errors.year && <p className="text-red-500 text-sm mt-1">{errors.year}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Páginas
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.pages ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="300"
                />
                {errors.pages && <p className="text-red-500 text-sm mt-1">{errors.pages}</p>}
              </div>
            </div>
          </div>

          {/* Capa e ISBN */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Capa e Identificação</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ISBN
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="isbn"
                    value={formData.isbn}
                    onChange={handleInputChange}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="ISBN do livro"
                  />
                  <button
                    type="button"
                    onClick={handleSearchByISBN}
                    disabled={isLoading || !formData.isbn}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL da Capa
                </label>
                <input
                  type="url"
                  name="cover"
                  value={formData.cover}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="https://exemplo.com/capa.jpg"
                />
              </div>
            </div>

            {coverPreview && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview da Capa
                </label>
                <div className="w-32 h-48 bg-gray-200 rounded-lg overflow-hidden">
                  <img
                    src={coverPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Informações Adicionais */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold mb-4">Informações Adicionais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cópias *
                </label>
                <input
                  type="number"
                  name="total_copies"
                  value={formData.total_copies}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.total_copies ? "border-red-500" : "border-gray-300"
                  }`}
                  min="1"
                />
                {errors.total_copies && <p className="text-red-500 text-sm mt-1">{errors.total_copies}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avaliação
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 ${
                    errors.rating ? "border-red-500" : "border-gray-300"
                  }`}
                  min="1"
                  max="5"
                  step="0.5"
                  placeholder="4.5"
                />
                {errors.rating && <p className="text-red-500 text-sm mt-1">{errors.rating}</p>}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sinopse
              </label>
              <textarea
                name="synopsis"
                value={formData.synopsis}
                onChange={handleInputChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Sinopse do livro..."
              />
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-4">
            <Link
              href="/books"
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {isLoading ? "Salvando..." : "Salvar Livro"}
            </button>
          </div>

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
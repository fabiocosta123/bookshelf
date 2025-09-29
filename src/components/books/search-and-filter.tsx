"use client";

import { Search, Filter, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useCallback } from "react";
import { ReadingStatus } from "@prisma/client";
import { GENRES, Genre } from "@/lib/services/book-service";

interface SearchAndFilterProps {
  genres: string[];
  initialFilter: {
    search?: string;
    genre?: string;
    status?: string;
  };
}

const READING_STATUSES: ReadingStatus[] = [
  "QUERO_LER",
  "LENDO",
  "LIDO",
  "PAUSADO",
  "ABANDONADO",
];

export function SearchAndFilter({
  genres,
  initialFilter,
}: SearchAndFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialFilter.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState(initialFilter.genre || "");
  const [selectedStatus, setSelectedStatus] = useState(
    initialFilter.status || ""
  );

  const updateFilter = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set("search", search);
    if (selectedGenre) params.set("genre", selectedGenre);
    if (selectedStatus) params.set("status", selectedStatus);

    router.push(`/library?${params.toString()}`);
  }, [search, selectedGenre, selectedStatus, router]);

  const clearFilters = () => {
    setSearch("");
    setSelectedGenre("");
    setSelectedStatus("");
    router.push("/library");
  };

  const hasActiveFilters = search || selectedGenre || selectedStatus;

  return (
    <div className="bg-white rounded-lg border p-6 mb-6">
      {/* Barra de busca */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Buscar por título ou autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && updateFilter()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>

          <button
            onClick={updateFilter}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Buscar
          </button>
        </div>
      </div>

      {/* Filtros expandidos */}
      {showFilters && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por Gênero */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gênero
              </label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os gêneros</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status de Leitura
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todos os status</option>
                {READING_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filtros ativos */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4">
          {search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Busca: "{search}"
              <button
                onClick={() => setSearch("")}
                className="ml-1 hover:bg-blue-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedGenre && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Gênero: {selectedGenre}
              <button
                onClick={() => setSelectedGenre("")}
                className="ml-1 hover:bg-purple-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          {selectedStatus && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {selectedStatus.replace("_", " ")}
              <button
                onClick={() => setSelectedStatus("")}
                className="ml-1 hover:bg-green-200 rounded-full"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}

          <button
            onClick={clearFilters}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Limpar todos
          </button>
        </div>
      )}
    </div>
  );
}

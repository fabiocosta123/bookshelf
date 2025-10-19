"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const STATUS_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "APPROVED", label: "Aprovado" },
  { value: "REJECTED", label: "Rejeitado" },
  { value: "RETURNED", label: "Devolvido" },
  { value: "PENDING", label: "Pendente" },
  { value: "ACTIVE", label: "Ativo" },
  { value: "OVERDUE", label: "Atrasado" },
];

export default function LoansFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [book, setBook] = useState(searchParams.get("book") ?? "");
  const [user, setUser] = useState(searchParams.get("user") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      
      if (book.trim()) params.set("book", book.trim());
      if (user.trim()) params.set("user", user.trim());
      if (status) params.set("status", status);

      router.push(`/loans?${params.toString()}`, { scroll: false });
    }, 500);

    return () => clearTimeout(timeout);
  }, [book, user, status]);

  

  return (
    <div className="grid grid cols-1 sm:grid-cols-3 gap-4 mb-6">
      <input
        value={book}
        onChange={(e) => setBook(e.target.value)}
        placeholder="Título do Livro"
        className="px-3 py-2 border rounded w-full"
      />

      <input
        value={user}
        onChange={(e) => setUser(e.target.value)}
        placeholder="Nome ou e-mail do usuário"
        className="px-3 py-2 border rounded w-full"
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="px-3 py-2 border rounded w-full"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* <div className="flex justify-end">
        <Button onClick={applyFilters} className="flex items-center gap-2">
          🔍 Buscar
        </Button>
      </div> */}
    </div>
  );
}

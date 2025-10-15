"use client";

import { useEffect, useState } from "react";

type Loan = {
  id: string;
  status: string;
  bookId: string;
  book?: { title?: string };
  userId: string;
  user?: { name?: string; email?: string };
  requestedAt?: string;
  approvedAt?: string | null;
  dueDate?: string | null;
  returnedAt?: string | null;
};

export default function LoansAdminPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [filter, setFilter] = useState<
    "PENDING" | "APPROVED" | "ACTIVE" | "OVERDUE" | "ALL"
  >("PENDING");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLoans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  async function fetchLoans() {
    setLoading(true);
    setError(null);
    try {
      const qs = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/loans${qs}`, { cache: "no-store" });

      // tenta ler corpo com segurança
      const contentType = res.headers.get("content-type") || "";
      const hasJson = contentType.includes("application/json");

      if (!res.ok){
        if(hasJson) {
          const errBody = await res.json().catch(() => null)
          throw new Error(errBody?.error || `Erro ao buscar empréstimos (status ${res.status})`)
        }

        const text = await res.text().catch(() => null)
        throw new Error(text || `Erro ao buscar empréstimos (status ${res.status})`)
    }
      // resposta OK
      const data = hasJson ? await res.json().catch(() => []) : [];
      setLoans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("fetchLoans error", err);
      setError(err?.message ?? "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  }

  async function performAction(
    loanId: string,
    action: "approve" | "reject" | "return"
  ) {
    setActionLoading((prev) => ({ ...prev, [loanId]: true }));
    try {
      const url = `/api/loans/${loanId}/${action}`;
      const body =
        action === "reject"
          ? JSON.stringify({ reason: "Rejeitado pelo administrador" })
          : undefined;
      const res = await fetch(url, {
        method: "PATCH",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erro na ação");
      // Atualiza lista depois da ação
      setLoans((prev) => prev.filter((l) => l.id !== loanId));
    } catch (err: any) {
      console.error("performAction error", err);
      alert(err?.message || "Erro ao executar ação");
    } finally {
      setActionLoading((prev) => ({ ...prev, [loanId]: false }));
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Empréstimos</h1>
          <p className="text-sm text-gray-600">
            Gerencie pedidos de empréstimo: aprovar, rejeitar e marcar
            devolução.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Filtro:</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="border px-3 py-2 rounded"
          >
            <option value="PENDING">Pendentes</option>
            <option value="APPROVED">Aprovados</option>
            <option value="ACTIVE">Ativos</option>
            <option value="OVERDUE">Atrasados</option>
            <option value="ALL">Todos</option>
          </select>
          <button
            onClick={() => fetchLoans()}
            className="ml-2 px-3 py-2 bg-gray-100 rounded hover:bg-gray-200"
          >
            Atualizar
          </button>
        </div>
      </header>

      {loading ? (
        <div className="p-6 bg-white border rounded text-center">
          Carregando empréstimos...
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded">
          {error}
        </div>
      ) : loans.length === 0 ? (
        <div className="p-6 bg-white border rounded text-center">
          Nenhum empréstimo encontrado para o filtro atual.
        </div>
      ) : (
        <ul className="space-y-4">
          {loans.map((loan) => (
            <li
              key={loan.id}
              className="p-4 bg-white border rounded flex flex-col md:flex-row md:items-center md:justify-between"
            >
              <div className="mb-3 md:mb-0">
                <div className="font-semibold text-lg">
                  {loan.book?.title ?? "— Título indisponível —"}
                </div>
                <div className="text-sm text-gray-500">
                  Solicitado por: {loan.user?.name ?? "—"} (
                  {loan.user?.email ?? "—"}) •{" "}
                  {loan.requestedAt
                    ? new Date(loan.requestedAt).toLocaleString()
                    : ""}
                </div>
                <div className="text-sm mt-1">
                  Status: <span className="font-medium">{loan.status}</span>
                  {loan.dueDate && (
                    <span className="ml-3 text-xs text-gray-500">
                      Vencimento: {new Date(loan.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {loan.status === "PENDING" && (
                  <>
                    <button
                      onClick={() => performAction(loan.id, "approve")}
                      disabled={!!actionLoading[loan.id]}
                      className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
                    >
                      {actionLoading[loan.id] ? "Processando..." : "Aprovar"}
                    </button>

                    <button
                      onClick={() => {
                        if (!confirm("Confirmar rejeição deste empréstimo?"))
                          return;
                        performAction(loan.id, "reject");
                      }}
                      disabled={!!actionLoading[loan.id]}
                      className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-60"
                    >
                      {actionLoading[loan.id] ? "Processando..." : "Rejeitar"}
                    </button>
                  </>
                )}

                {loan.status === "ACTIVE" && (
                  <button
                    onClick={() => {
                      if (!confirm("Confirmar registro de devolução?")) return;
                      performAction(loan.id, "return");
                    }}
                    disabled={!!actionLoading[loan.id]}
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
                  >
                    {actionLoading[loan.id]
                      ? "Processando..."
                      : "Registrar Devolução"}
                  </button>
                )}

                {/* botão para visualizar detalhes / editar se necessário */}
                <a
                  href={`/loans/${loan.id}`}
                  className="px-3 py-2 border rounded hover:bg-gray-50 text-sm"
                >
                  Ver
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

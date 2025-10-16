"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LoansList, type LoanItem } from "@/components/loans/LoansList";
import { Toaster, toast} from "sonner";

type ApiLoansResponse = {
  loans: LoanItem[];
  total?: number;
};

export default function LoansPage() {
  const router = useRouter();

  const [loans, setLoans] = React.useState<LoanItem[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(12);
  const [filterMine, setFilterMine] = React.useState(true);

  const fetchLoans = React.useCallback(
    async (opts?: { page?: number; size?: number; mine?: boolean }) => {
      setLoading(true);
      setError(null);
      try {
        const p = opts?.page ?? page;
        const size = opts?.size ?? pageSize;
        const mine = opts?.mine ?? filterMine;
        const q = new URLSearchParams();
        q.set("page", String(p));
        q.set("size", String(size));
        if (mine) q.set("mine", "1");

        const res = await fetch(`/api/loans?${q.toString()}`, {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!res.ok) {
          const text = await res.text().catch(() => ""); 
          throw new Error(text || `Falha ao carregar (${res.status})`);
        }
        const json: ApiLoansResponse = await res.json();
        setLoans(json.loans ?? []);

      } catch (err: any) {
        setError(err?.message ?? "Erro ao carregar empréstimos");
        setLoans([]);
      } finally {
        setLoading(false);
      }
    },
    [page, pageSize, filterMine]
  );

  React.useEffect(() => {
    fetchLoans({ page, size: pageSize, mine: filterMine });    
  }, [page, pageSize, filterMine]);

  const refreshAndReload = React.useCallback(async () => {
    await fetchLoans({ page, size: pageSize, mine: filterMine });
    router.refresh();
  }, [fetchLoans, page, pageSize, filterMine, router]);

  const readErrorMessage = async (res: Response) => {
    let msg = `Erro (${res.status})`;

    try {
      const j = await res.json().catch(() => null);
      if (j && typeof j === "object" && "error" in j) msg = String((j as any).error)
    } catch {}

    try {
      if (msg.startsWith("Erro")) {
        const txt = await res.text().catch(() => "")
        if (txt) msg = txt
      }
    } catch {}

    return msg
  }

  const onApprove = React.useCallback(
    async (loanId: string) => {
      setLoading(true);
      setError(null);
      const toastId = toast.loading("Aprovando empréstimo...");

      try {
        const res = await fetch(`/api/loans/${loanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "approve"}),
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!res.ok) {
          const msg = await readErrorMessage(res);
          toast.error(msg)
          setError(msg)
          return
        }

        toast.success("Empréstimo aprovado");
        await refreshAndReload();

      } catch (err: any) {
        const message = err?.message ?? "Erro ao aprovar empréstimo";
        toast.error(message)
        setError(message);
      } finally {
        toast.dismiss(toastId)
        setLoading(false);
      }
    },
    [refreshAndReload]
  );

  const onReject = React.useCallback(
    async (loanId: string) => {
      const reason = window.prompt("Motivo da rejeição (obrigatório):", "Rejeitado pelo Administrador" )
      if (reason === null) {
        toast.error("Rejeição cancelada")
        return;
      }

      const rejectionReason = String(reason).trim();
      if (!rejectionReason) {
        toast.error("Rejeição cancelada: motivo obrigatório")
        setError("Rejeição cancelada: motivo obrigatório")
        return
      }

      setLoading(true);
      setError(null);
      const toastId = toast.loading("Registrando rejeição...");

      try {
        const res = await fetch(`/api/loans/${loanId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "reject", rejectionReason}),
          cache: "no-store",
          credentials: "same-origin",
        });

        if (!res.ok) {
          const msg = await readErrorMessage(res);
          toast.error(msg)
          setError(msg)
          return
        }

        toast.success("Empréstimo rejeitado")
        await refreshAndReload();
        
      } catch (err: any) {
        const message =  err?.message ?? "Erro ao rejeitar empréstimo";
        toast.error(message)
        setError(message)

      } finally {
        toast.dismiss(toastId)
        setLoading(false);
      }
    },
    [refreshAndReload]
  );

  return (
    <main className="min-h-screen bg-slate-50 w-full">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <Toaster position="top-right" richColors closeButton />
        
        {/* Header */}
        <header className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-semibold">Empréstimos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Solicitações e empréstimos recentes
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className={cn(
                "inline-flex items-center px-3 py-2 text-sm rounded-md",
                filterMine ? "bg-gray-900 text-white" : "bg-white border"
              )}
              onClick={() => {
                setPage(1);
                setFilterMine((v) => !v);
              }}
              aria-pressed={filterMine}
              aria-label="Alternar meus empréstimos"
            >
              {filterMine ? "Meus" : "Todos"}
            </button>

            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                fetchLoans({ page: 1, size: pageSize, mine: filterMine })
              }
            >
              Atualizar
            </Button>
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-sm text-red-700">
            {error}
            <button
              className="ml-3 underline"
              onClick={() =>
                fetchLoans({ page, size: pageSize, mine: filterMine })
              }
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && loans === null && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-white border rounded-lg p-4 flex gap-3"
              >
                <div className="w-14 h-20 bg-gray-100 rounded-md" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-3" />
                  <div className="h-8 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && loans && loans.length === 0 && (
          <div className="mt-6 text-center p-6 bg-white border rounded-lg">
            <p className="text-sm text-gray-600">
              Nenhum empréstimo encontrado.
            </p>
            <div className="mt-4 flex justify-center">
              <Link
                href="/books"
                className="text-sm text-blue-600 hover:underline"
              >
                Ver livros disponíveis
              </Link>
            </div>
          </div>
        )}

        {/* Loans list */}
        {!loading && loans && loans.length > 0 && (
          <>
            <LoansList
              loans={loans}
              onApprove={onApprove}
              onReject={onReject}
            />

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600 truncate w-full sm:w-auto">
                Exibindo {loans.length} empréstimo{loans.length > 1 ? "s" : ""}
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border disabled:opacity-50 w-full sm:w-auto justify-center"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </button>

                <div className="px-3 py-1.5 text-sm bg-white border rounded-md hidden sm:inline-block">
                  Página {page}
                </div>

                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border w-full sm:w-auto justify-center"
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

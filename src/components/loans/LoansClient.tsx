"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LoansList, type LoanItem } from "@/components/loans/LoansList";
import LoansFilter from "@/components/loans/LoansFilter";
import { Toaster, toast } from "sonner";
import Link from "next/link";

interface Props {
  initialLoans: LoanItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status?: string;
    book?: string;
    user?: string;
  };
}

export default function LoansClient({ initialLoans, pagination, filters }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loans, setLoans] = React.useState<LoanItem[]>(initialLoans);
  const [loading, setLoading] = React.useState(false);

  // React.useEffect(() => {
  //   setLoans(initialLoans);
  // }, [initialLoans]);

   // **DEBUG: Log quando initialLoans muda**
  React.useEffect(() => {
    console.log('🔄 LoansClient: initialLoans atualizado', {
      count: initialLoans.length,
      statusFilter: filters.status,
      loans: initialLoans.map(l => ({ id: l.id, status: l.status, title: l.book?.title }))
    });
    setLoans(initialLoans);
  }, [initialLoans, filters.status]);

  const [rejectModalOpen, setRejectModalOpen] = React.useState(false);
  const [rejectingLoanId, setRejectingLoanId] = React.useState<string | null>(null);
  const [rejectReason, setRejectReason] = React.useState("");

  const page = pagination.page;

  const goToPage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(newPage));
    console.log('📄 Mudando para página:', newPage);
    router.push(`/loans?${params.toString()}`, { scroll: false });
    // router.refresh();
  };

   const refresh = () => {
    console.log('🔄 Refresh manual acionado');
    router.refresh();
  };

   // **DEBUG: Log quando searchParams mudam**
  React.useEffect(() => {
    console.log('🔍 SearchParams atualizados:', {
      status: searchParams.get('status'),
      book: searchParams.get('book'),
      user: searchParams.get('user'),
      page: searchParams.get('page')
    });
  }, [searchParams]);

  

  const onApprove = async (loanId: string) => {
    setLoading(true);
    const toastId = toast.loading("Aprovando empréstimo...");
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });

      if (!res.ok) throw new Error(await res.text());
      toast.success("Empréstimo aprovado");
      refresh();

    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao aprovar");

    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const onRejectConfirmed = async (loanId: string, reason: string) => {
    setLoading(true);
    const toastId = toast.loading("Rejeitando...");
    try {
      const res = await fetch(`/api/loans/${loanId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", rejectionReason: reason }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success("Empréstimo rejeitado");
      refresh();
    } catch (err: any) {
      toast.error(err?.message ?? "Erro ao rejeitar");
    } finally {
      toast.dismiss(toastId);
      setLoading(false);
    }
  };

  const openRejectModal = (id: string) => {
    setRejectingLoanId(id);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    setRejectModalOpen(false);
    setRejectingLoanId(null);
    setRejectReason("");
  };

  const confirmReject = async () => {
    if (!rejectingLoanId || !rejectReason.trim()) {
      toast.error("Motivo obrigatório");
      return;
    }
    closeRejectModal();
    await onRejectConfirmed(rejectingLoanId, rejectReason.trim());
  };

  return (
    <main className="min-h-screen bg-slate-50 w-full">
      <div className="w-full max-w-4xl mx-auto px-4 py-6">
        <Toaster position="top-right" richColors closeButton />

        <header className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl font-semibold">Empréstimos</h1>
            <p className="mt-1 text-sm text-gray-500">             
              {filters.status ? ` Filtrado por: ${filters.status}` : "Todos os empréstimos"}
              {` (${loans.length} resultados)`}
            </p>
          </div>
         
        </header>

        <LoansFilter />

     

        {!loading && loans.length === 0 && (
          <div className="mt-6 text-center p-6 bg-white border rounded-lg">
            <p className="text-sm text-gray-600">
               {filters.status 
                ? `Nenhum empréstimo encontrado com status: ${filters.status}`
                : 'Nenhum empréstimo encontrado.'
              }
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

        {!loading && loans.length > 0 && (
          <>
            <LoansList
              loans={loans}
              onApprove={onApprove}
              onReject={openRejectModal}
            />

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="text-sm text-gray-600 truncate w-full sm:w-auto">
                 Exibindo {loans.length} de {pagination.total} empréstimo{loans.length > 1 ? "s" : ""}
                {filters.status && ` (Filtrado por: ${filters.status})`}
              </div>

              <div className="flex w-full sm:w-auto items-center gap-2">
                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border disabled:opacity-50 w-full sm:w-auto justify-center"
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Anterior
                </button>

                <div className="px-3 py-1.5 text-sm bg-white border rounded-md hidden sm:inline-block">
                  Página {page} de {pagination.totalPages}
                </div>

                <button
                  className="inline-flex items-center px-3 py-1.5 rounded-md bg-white border w-full sm:w-auto justify-center"
                  onClick={() => goToPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Próxima
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {rejectModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="reject-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={closeRejectModal}
            aria-hidden="true"
          />
          <div className="relative bg-white rounded-lg w-full max-w-lg p-6 shadow-lg z-10">
            <h2 id="reject-modal-title" className="text-lg font-semibold mb-2">
              Rejeitar solicitação
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Informe o motivo da rejeição.
            </p>

            <textarea
              autoFocus
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full border rounded-md p-2 text-sm resize-y"
              placeholder="Motivo da rejeição"
              aria-label="Motivo da rejeição"
            />

            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={closeRejectModal}>
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={confirmReject}
                disabled={loading}
              >
                Confirmar rejeição
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

"use client";

import React, { useState } from "react";
import { X, Check, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { toast, Toaster } from "sonner";

type Props = {
  loanId: string;
  onSuccess?: (updatedLoan?: any) => void;
};

export default function ReturnLoanModal({ loanId, onSuccess }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returnedAt, setReturnedAt] = useState<string>(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [notes, setNotes] = useState<string>("");

  async function refetchStatsAndEmit() {
    try {
      const res = await fetch("/api/dashboard/stats", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) return;
      const stats = await res.json().catch(() => null);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("dashboard:stats:updated", { detail: stats }));
      }
    } catch (err) {
      console.warn("Não foi possível refetch /api/dashboard/stats", err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        returnedById: user.id,
        returnedAt: new Date(returnedAt).toISOString(),
        notes: notes.trim() || null,
      };

      const res = await fetch(`/api/loans/${loanId}/return`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Erro ao processar devolução");
      }

      const updated = await res.json().catch(() => null);

      await refetchStatsAndEmit();

      setOpen(false);
      setNotes("");
      if (onSuccess) onSuccess(updated);

      toast.success("Livro devolvido com sucesso");

      // deixa o toast aparecer antes de forçar reload (opcional)
      setTimeout(() => {
        // atualiza a página para reconsultar dados server-side; comente se preferir atualizar via evento
        if (typeof window !== "undefined") window.location.reload();
      }, 1200);
    } catch (err: any) {
      console.error("Erro ao devolver livro:", err);
      toast.error(err?.message ?? "Erro ao devolver livro");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors closeButton />
      <button
        type="button"
        title="Registrar devolução"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
      >
        <ArrowLeft size={16} />
        Devolver
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => (!submitting ? setOpen(false) : undefined)}
          />
          <form
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Registrar Devolução</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
                aria-label="Fechar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block">Usuário que devolve</label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded text-sm bg-gray-50"
                  value={user?.name ?? user?.email ?? ""}
                  readOnly
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block">Data e hora da devolução</label>
                <input
                  type="datetime-local"
                  className="mt-1 w-full px-3 py-2 border rounded text-sm"
                  value={returnedAt}
                  onChange={(e) => setReturnedAt(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block">Devolvido por (responsável)</label>
                <input
                  className="mt-1 w-full px-3 py-2 border rounded text-sm bg-gray-50"
                  value={user?.name ?? user?.email ?? ""}
                  readOnly
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 block">Observações</label>
                <textarea
                  className="mt-1 w-full px-3 py-2 border rounded text-sm"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={submitting}
                className="px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-60"
              >
                {submitting ? "Registrando..." : (
                  <>
                    <Check size={14} /> Confirmar devolução
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_LABELS_PT } from "@/lib/constants/status-labels";

export type LoanItem = {
  id: string;
  status: string;
  requestedAt?: string | null;
  book?: { id: string; title?: string; cover?: string | null };
  user?: { id?: string; name?: string | null; email?: string | null };
};

const STATUS_CLASSES: Record<string, string> = {
  PENDING: "text-yellow-600",
  APPROVED: "text-green-600",
  REJECTED: "text-red-600",
  RETURNED: "text-blue-600",
  ACTIVE: "text-indigo-600",
  OVERDUE: "text-orange-600",
};

const STATUS_BG_CLASSES: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  APPROVED: "bg-green-50 text-green-700",
  REJECTED: "bg-red-50 text-red-700",
  RETURNED: "bg-blue-50 text-blue-700",
  ACTIVE: "bg-indigo-50 text-indigo-700",
  OVERDUE: "bg-orange-50 text-orange-700",
};

export function LoansList({
  loans,
  onApprove,
  onReject,
}: {
  loans: LoanItem[];
  onApprove?: (id: string) => Promise<void> | void;
  onReject?: (id: string) => Promise<void> | void;
}) {
  return (
    <section className="w-full">
      {/* Mobile cards */}
      <ul className="space-y-4 md:hidden">
        {loans.map((loan) => (
          <li
            key={loan.id}
            className="bg-white rounded-lg shadow-sm border p-4 w-full max-w-full"
            role="listitem"
          >
            <div className="flex gap-3 items-start">
              {/* Capa: tamanho fixo, sem causar overflow */}
              <div className="w-14 h-20 flex-shrink-0 rounded-md bg-gray-100 overflow-hidden">
                {loan.book?.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={loan.book.cover}
                    alt={loan.book.title ?? "Capa"}
                    className="w-full h-full object-cover block max-w-full"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                    Capa
                  </div>
                )}
              </div>

              {/* Conteúdo: min-w-0 é crucial para truncar dentro de flex */}
              <div className="flex-1 min-w-0 overflow-hidden">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div
                      className="font-medium text-sm text-gray-900 truncate"
                      title={loan.book?.title ?? undefined}
                    >
                      {loan.book?.title ?? "—"}
                    </div>
                    <div
                      className="text-xs text-gray-500 truncate"
                      title={loan.user?.name ?? loan.user?.email ?? undefined}
                    >
                      {loan.user?.name ?? loan.user?.email ?? "—"}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 ml-2">
                    <div className="text-xs text-gray-500">Status</div>
                    <div
                      className={cn(
                        "text-sm font-medium mt-1",
                        STATUS_CLASSES[loan.status] ?? "text-gray-600"
                      )}
                    >
                      {STATUS_LABELS_PT[loan.status] ?? loan.status}
                    </div>
                  </div>
                </div>

                {/* Ações: vertical no mobile, horizontal a partir de sm */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs bg-gray-100 hover:bg-gray-200"
                    >
                      Detalhes
                    </Link>
                  </div>

                  <div className="w-full sm:w-auto">
                    {loan.status === "PENDING" && (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => onApprove?.(loan.id)}
                          className="min-w-[88px] w-full sm:w-auto justify-center"
                          size="sm"
                          variant="default"
                        >
                          Aprovar
                        </Button>

                        <Button
                          onClick={() => onReject?.(loan.id)}
                          className="min-w-[88px] w-full sm:w-auto justify-center"
                          size="sm"
                          variant="ghost"
                        >
                          Rejeitar
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Desktop table (escondida no mobile) */}
      <div className="hidden md:block mt-4">
        <div className="bg-white border rounded-lg overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Livro</th>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Solicitado</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loans.map((loan) => (
                <tr key={loan.id} className="border-t">
                  <td className="px-4 py-3 max-w-xs truncate">
                    {loan.book?.title ?? "—"}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">
                    {loan.user?.name ?? loan.user?.email ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {loan.requestedAt
                      ? new Date(loan.requestedAt).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-4 py-3">
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded-md text-xs font-medium",
                          STATUS_BG_CLASSES[loan.status] ??
                            "bg-gray-100 text-gray-800"
                        )}
                      >
                        {STATUS_LABELS_PT[loan.status] ?? loan.status}
                      </span>
                    </td>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {loan.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => onApprove?.(loan.id)}
                          >
                            Aprovar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onReject?.(loan.id)}
                          >
                            Rejeitar
                          </Button>
                        </>
                      )}
                      <Link
                        href={`/loans/${loan.id}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Detalhes
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

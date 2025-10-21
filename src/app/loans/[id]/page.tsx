// import React from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { Toaster } from "sonner";
// import { loanService } from "@/lib/services/loan-service";
// import { prisma } from "@/lib/prisma";
// import ReturnLoanModal from "@/components/loans/ReturnLoanModal";
// import { STATUS_LABELS_PT } from "@/lib/constants/status-labels";


// type Props = {
//   params: { id: string };
// };

// // formatação de datas
// function formatDate(value?: string | Date | null) {
//   if (!value) return "-";
//   const d = typeof value === "string" ? new Date(value) : value;

//   if (Number.isNaN(d.getTime())) return "-";
//   return d.toLocaleDateString("pt-BR", {
//     day: "2-digit",
//     month: "2-digit",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });
// }

// async function fetchLoanWithFallback(id: string) {
//   // tenta primeiro com loanService
//   try {
//     const fromService = await loanService.getLoanById(id);
//     if (fromService) return fromService;
//   } catch (error) {
//     // ignora o erro e faz fallback
//     console.warn(
//       "loanService.getLoanById falhou, fazendo fallback com prisma",
//       error
//     );
//   }

//   // fallback direto com prisma
//   const loan = await prisma.loan.findUnique({
//     where: { id },
//     include: {
//       book: true,
//       user: true,
//       approvedBy: true,
//     },
//   });

//   return loan;
// }

// export default async function LoanDetailsPage({ params }: Props) {
//   const id = params?.id;
//   if (!id) return notFound();

//   try {
//     const loan: any = await fetchLoanWithFallback(id);
//     if (!loan) return notFound();

//     const bookTitle = loan.book?.title ?? "Título indisponível";
//     const status = (loan.status ?? "UNKNOWN").toString();
//     const requestedBy =
//       loan.user?.name ?? loan.user?.email ?? "Usuário desconhecido";
//     const dueDate = loan.dueDate ?? null;
//     const decisionBy = loan.approvedBy
//       ? loan.approvedBy.name ?? loan.approvedBy.email
//       : null;

//     // aprovado ou rejeitado se existir
//     const decisionAt = loan.approvedAt ?? loan.rejectedAt ?? null;
//     const notes = loan.userNotes ?? "";

//     return (
//       <main className="min-h-screen bg-slate-50">
//         <div className="w-full max-w-3xl mx-auto px-4 py-8">
//           <Toaster position="top-right" richColors closeButton />
//           <header className="mb-6">
//             <h1 className="text-2xl font-semibold mb-1">
//               Detalhes do Empréstimo
//             </h1>
//             <p className="text-sm text-gray-600">
//               Informações sobre o empréstimo selecionado
//             </p>
//           </header>

//           <section className="bg-white border rounded-lg p-6 shadow-sm">
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-1">
//                 <h2 className="text-lg font-medium">{bookTitle}</h2>

//                 <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
//                   <div>
//                     <div className="text-xs text-gray-500">Status</div>
//                     <div className="mt-1">
//                       <span
//                         className={
//                           "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
//                           (status === "APPROVED"
//                             ? "bg-green-100 text-green-800"
//                             : status === "REJECTED"
//                             ? "bg-red-100 text-red-800"
//                             : status === "PENDING"
//                             ? "bg-yellow-100 text-yellow-800"
//                             : "bg-gray-100 text-gray-800")
//                         }
//                         aria-live="polite"
//                       >
//                         {STATUS_LABELS_PT[status] ?? status}
//                       </span>
//                     </div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">Solicitado por</div>
//                     <div className="mt-1">{requestedBy}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">
//                       Data de devolução
//                     </div>
//                     <div className="mt-1">{formatDate(dueDate)}</div>
//                   </div>

//                   <div>
//                     <div className="text-xs text-gray-500">
//                       Aprovado/Rejeitado por
//                     </div>
//                     <div className="mt-1">{decisionBy ?? "—"}</div>
//                   </div>
//                 </div>

//                 {notes ? (
//                   <div className="mt-4">
//                     <div className="text-xs text-gray-500">
//                       Observações do solicitante
//                     </div>
//                     <div className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
//                       {notes}
//                     </div>
//                   </div>
//                 ) : null}

//                 {decisionAt ? (
//                   <div className="mt-4 text-sm text-gray-600">
//                     <div className="text-xs text-gray-500">Decisão em</div>
//                     <div className="mt-1">{formatDate(decisionAt)}</div>
//                   </div>
//                 ) : null}
//               </div>

//               <aside className="w-full sm:w-56">
//                 <div className="bg-gray-50 border rounded-md p-3 text-sm text-gray-700">
//                   <div className="mb-3">
//                     <div className="text-xs text-gray-500">Ações</div>
//                     <div className="mt-2 flex flex-col gap-2">
//                       <Link
//                         href="/loans"
//                         className="inline-block text-center px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
//                       >
//                         Voltar
//                       </Link>

//                       <ReturnLoanModal loanId={id} />
//                     </div>
//                   </div>
//                 </div>
//               </aside>
//             </div>
//           </section>
//         </div>
//       </main>
//     );
//   } catch (error: any) {
//     console.error("Erro ao carregar detalhes do empréstimo", error);
//     return notFound();
//   }
// }

import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { loanService } from "@/lib/services/loan-service";
import { prisma } from "@/lib/prisma";
import ReturnLoanModal from "@/components/loans/ReturnLoanModal";
import { STATUS_LABELS_PT } from "@/lib/constants/status-labels";

// CORREÇÃO: params como Promise
type Props = {
  params: Promise<{ id: string }>;
};

// formatação de datas
function formatDate(value?: string | Date | null) {
  if (!value) return "-";
  const d = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function fetchLoanWithFallback(id: string) {
  // tenta primeiro com loanService
  try {
    const fromService = await loanService.getLoanById(id);
    if (fromService) return fromService;
  } catch (error) {
    // ignora o erro e faz fallback
    console.warn(
      "loanService.getLoanById falhou, fazendo fallback com prisma",
      error
    );
  }

  // fallback direto com prisma
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      book: true,
      user: true,
      approvedBy: true,
    },
  });

  return loan;
}

// CORREÇÃO: função async e await params
export default async function LoanDetailsPage({ params }: Props) {
  // CORREÇÃO: await dos params
  const { id } = await params;
  
  if (!id) return notFound();

  try {
    const loan: any = await fetchLoanWithFallback(id);
    if (!loan) return notFound();

    const bookTitle = loan.book?.title ?? "Título indisponível";
    const status = (loan.status ?? "UNKNOWN").toString();
    const requestedBy =
      loan.user?.name ?? loan.user?.email ?? "Usuário desconhecido";
    const dueDate = loan.dueDate ?? null;
    const decisionBy = loan.approvedBy
      ? loan.approvedBy.name ?? loan.approvedBy.email
      : null;

    // aprovado ou rejeitado se existir
    const decisionAt = loan.approvedAt ?? loan.rejectedAt ?? null;
    const notes = loan.userNotes ?? "";

    return (
      <main className="min-h-screen bg-slate-50">
        <div className="w-full max-w-3xl mx-auto px-4 py-8">
          <Toaster position="top-right" richColors closeButton />
          <header className="mb-6">
            <h1 className="text-2xl font-semibold mb-1">
              Detalhes do Empréstimo
            </h1>
            <p className="text-sm text-gray-600">
              Informações sobre o empréstimo selecionado
            </p>
          </header>

          <section className="bg-white border rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-medium">{bookTitle}</h2>

                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-700">
                  <div>
                    <div className="text-xs text-gray-500">Status</div>
                    <div className="mt-1">
                      <span
                        className={
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
                          (status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800")
                        }
                        aria-live="polite"
                      >
                        {STATUS_LABELS_PT[status] ?? status}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Solicitado por</div>
                    <div className="mt-1">{requestedBy}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">
                      Data de devolução
                    </div>
                    <div className="mt-1">{formatDate(dueDate)}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">
                      Aprovado/Rejeitado por
                    </div>
                    <div className="mt-1">{decisionBy ?? "—"}</div>
                  </div>
                </div>

                {notes ? (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500">
                      Observações do solicitante
                    </div>
                    <div className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">
                      {notes}
                    </div>
                  </div>
                ) : null}

                {decisionAt ? (
                  <div className="mt-4 text-sm text-gray-600">
                    <div className="text-xs text-gray-500">Decisão em</div>
                    <div className="mt-1">{formatDate(decisionAt)}</div>
                  </div>
                ) : null}
              </div>

              <aside className="w-full sm:w-56">
                <div className="bg-gray-50 border rounded-md p-3 text-sm text-gray-700">
                  <div className="mb-3">
                    <div className="text-xs text-gray-500">Ações</div>
                    <div className="mt-2 flex flex-col gap-2">
                      <Link
                        href="/loans"
                        className="inline-block text-center px-3 py-2 bg-white border rounded text-sm hover:bg-gray-50"
                      >
                        Voltar
                      </Link>

                      <ReturnLoanModal loanId={id} />
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </section>
        </div>
      </main>
    );
  } catch (error: any) {
    console.error("Erro ao carregar detalhes do empréstimo", error);
    return notFound();
  }
}
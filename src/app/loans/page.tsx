// src/app/loans/page.tsx (ALTERNATIVA)
import { loanService } from "@/lib/services/loan-service";
import { LoanStatus } from "@prisma/client";
import LoansClient from "@/components/loans/LoansClient";

// **ALTERNATIVA: Use searchParams como Promise**
interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function LoansPage({ searchParams }: PageProps) {
  // **CORREÇÃO: Aguarde os searchParams**
  const params = await searchParams;
  
  console.log('=== 🚀 SERVER: LoansPage executando ===');
  console.log('📋 Todos os searchParams:', params);

  const rawStatus = params.status;
  let status: LoanStatus | undefined;
  
  if (typeof rawStatus === 'string') {
    status = Object.values(LoanStatus).includes(rawStatus as LoanStatus)
      ? (rawStatus as LoanStatus)
      : undefined;
  }

  const book = typeof params.book === "string" ? params.book : undefined;
  const user = typeof params.user === "string" ? params.user : undefined;
  const page = Number(params.page) || 1;
  const limit = 5;

  console.log('📋 Parâmetros processados:', { status, book, user, page });
  
  const result = await loanService.getAllLoans(status, page, limit, book, user);

  console.log('📊 Resultado do serviço:', {
    loansCount: result.loans.length,
    statusFilter: status,
    loansStatuses: result.loans.map(l => l.status),
    pagination: result.pagination
  });

  const normalizedLoans = result.loans.map((loan) => ({
    ...loan,
    requestedAt: loan.requestedAt?.toISOString() ?? null,
    updatedAt: loan.updatedAt?.toISOString() ?? null,
    createdAt: loan.createdAt?.toISOString() ?? null,
    dueDate: loan.dueDate?.toISOString() ?? null,
  }));

  return (
    <LoansClient
      initialLoans={normalizedLoans}
      pagination={result.pagination}
      filters={{ status, book, user }}
    />
  );
}
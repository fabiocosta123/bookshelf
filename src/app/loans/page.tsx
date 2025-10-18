import { loanService } from "@/lib/services/loan-service";
import { LoanStatus } from "@prisma/client";
import LoansClient from "@/components/loans/LoansClient";

export default async function LoansPage({ searchParams }: { searchParams: Record<string, string> }) {
  const rawStatus = searchParams.status;
  const status = Object.values(LoanStatus).includes(rawStatus as LoanStatus)
    ? (rawStatus as LoanStatus)
    : undefined;

  const book = searchParams.book ?? undefined;
  const user = searchParams.user ?? undefined;
  const page = Number(searchParams.page || 1);
  const limit = Number(searchParams.limit || 12);

  const result = await loanService.getAllLoans(status, page, limit, book, user);

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
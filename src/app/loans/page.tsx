import { loanService } from "@/lib/services/loan-service";
import { LoanStatus } from "@prisma/client";
import LoansClient from "@/components/loans/LoansClient";
import { headers } from "next/headers";

export default async function LoansPage({searchParams}: {searchParams: { [key: string]: string | string[] | undefined };
}) {
  
  const rawStatus = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const status = Object.values(LoanStatus).includes(rawStatus as LoanStatus)
    ? (rawStatus as LoanStatus)
    : undefined;

  const book = typeof searchParams.book === "string" ? searchParams.book : undefined;
  const user = typeof searchParams.user === "string" ? searchParams.user : undefined;

  const page = Number(searchParams.page ?? 1);
  const limit = 5;

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
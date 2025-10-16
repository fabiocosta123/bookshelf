import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { loanService } from "@/lib/services/loan-service";
import type { Session } from "next-auth";
import { prisma } from '@/lib/prisma';

const getSessionTyped = async (): Promise<Session | null> => {
    return (await getServerSession(authOptions as any)) as Session | null
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const status = url.searchParams.get("status") || undefined;
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");

    // se id informado, retorna detalhe
    if (id) {
      try {
        const loan = await loanService.getLoanById(id);
        return NextResponse.json(loan, { status: 200 });
      } catch (err: any) {
        return NextResponse.json({ error: err?.message || "Empréstimo não encontrado" }, { status: 404 });
      }
    }

    // tenta obter sessão para decidir se retorna loans do usuário ou todos (admin/employee)
    const session = await getSessionTyped();

    // se user e não admin/employee: retorna apenas empréstimos do próprio usuário
    const userRole = session?.user?.role;
    const userId = session?.user?.id;

    if (userId && userRole && !["ADMIN", "EMPLOYEE"].includes(userRole)) {
      // cliente autenticado — retorna os empréstimos do próprio usuário
      const loans = await loanService.getUserLoans(userId, status as any);
      return NextResponse.json(loans ?? [], { status: 200 });
    }

    // para admin/employee ou sem sessão (se você permitir lista pública), retorna getAllLoans
    const result = await loanService.getAllLoans(status as any, page, limit);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/loans error:", error);
    return NextResponse.json({ error: error?.message ?? "Erro ao listar empréstimos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSessionTyped();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const callerRole = (session.user as any).role as string | undefined;
  const isStaff = callerRole === "ADMIN" || callerRole === "EMPLOYEE";

  
  const targetUserId = isStaff && body.userId ? String(body.userId) : String(session.user.id);
  const bookId = String(body.bookId);

  
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) return NextResponse.json({ error: "Livro não encontrado" }, { status: 404 });

  const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
  if (!targetUser) return NextResponse.json({ error: "Usuário alvo não encontrado" }, { status: 404 });

  // cria emprestimo e registra quem fez
  const created = await prisma.loan.create({
    data: {
      bookId,
      userId: targetUserId,
      status: "PENDING", 
      userNotes: body.userNotes ?? null,
      approvedById: session.user.id as string, 
    },
  });

  // cria notificação cliente sobre a solicitação
  await prisma.notification.create({
    data: {
      userId: targetUserId,
      title: "Nova solicitação de empréstimo",
      message: `${session.user.name ?? "Administrador"} solicitou o livro "${book.title}" em seu nome.`,
      type: "NEW_LOAN_REQUEST",
      relatedLoanId: created.id,
    },
  });


  // cria notificação admin
  await prisma.notification.create({
    data: {
      userId: session.user.id as string,
      title: "Solicitação enviada",
      message: `Solicitação de empréstimo para "${book.title}" enviada para ${targetUser.name ?? targetUser.email}.`,
      type: "SYSTEM",
      relatedLoanId: created.id,
    },
  });


  // return the created loan including relations so client can reflect state
  const loanWithRelations = await prisma.loan.findUnique({
    where: { id: created.id },
    include: { user: true, book: true, approvedBy: true },
  });

  return NextResponse.json(loanWithRelations);
}

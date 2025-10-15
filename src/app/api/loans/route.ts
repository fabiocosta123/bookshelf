import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { loanService } from "@/lib/services/loan-service";
import type { Session } from "next-auth";

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

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionTyped();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { bookId, userNotes } = body as { bookId?: string; userNotes?: string };

    if (!bookId) {
      return NextResponse.json({ error: "ID do livro é obrigatório." }, { status: 400 });
    }

    try {
      const loan = await loanService.createLoan({
        bookId,
        userId: session.user.id,
        userNotes,
      });
      return NextResponse.json(loan, { status: 201 });
    } catch (err: any) {
      console.error("Erro ao criar empréstimo (service):", err);
      return NextResponse.json({ error: err?.message || "Erro ao criar empréstimo" }, { status: 400 });
    }
  } catch (error: any) {
    console.error("POST /api/loans error:", error);
    return NextResponse.json({ error: error?.message ?? "Erro interno" }, { status: 500 });
  }
}
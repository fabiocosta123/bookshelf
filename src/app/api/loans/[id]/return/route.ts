import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * PATCH /api/loans/[id]/return
 * Marca um empréstimo como RETURNED, registra quem processou, data e notas,
 * incrementa available_copies do livro (sem ultrapassar total_copies) e cria notificação.
 *
 * Regras:
 * - somente usuários autenticados com role ADMIN ou EMPLOYEE podem processar devolução.
 * - valida se o empréstimo existe e ainda não foi devolvido.
 */
export async function PATCH(request: Request, { params }: { params: any}) {
  try {
    // valida sessão e tipa corretamente
    const rawSession = await getServerSession(authOptions as any);
    const session = rawSession as Session | null;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const callerRole = (session.user as any)?.role as string | undefined;
    if (!callerRole || !["ADMIN", "EMPLOYEE"].includes(callerRole)) {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
    }

    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: "Id do empréstimo não informado" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const returnedAt = body.returnedAt ? new Date(body.returnedAt) : new Date();
    const returnedById = body.returnedById ?? session.user.id;
    const notes = body.notes ?? null;

    // busca empréstimo atual com relação ao livro
    const existing = await prisma.loan.findUnique({
      where: { id },
      include: { book: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Empréstimo não encontrado" }, { status: 404 });
    }

    if (existing.status === "RETURNED") {
      return NextResponse.json({ error: "Empréstimo já marcado como devolvido" }, { status: 400 });
    }

    // atualiza empréstimo
    const updatedLoan = await prisma.loan.update({
      where: { id },
      data: {
        status: "RETURNED",
        returnedAt,
        approvedById: returnedById,
        employeeNotes: notes,
      },
      include: { book: true, user: true, approvedBy: true },
    });

    // atualiza cópias disponíveis do livro com proteção contra overflow
    if (updatedLoan.bookId) {
      try {
        await prisma.book.update({
          where: { id: updatedLoan.bookId },
          data: { available_copies: { increment: 1 } },
        });

        const bookAfter = await prisma.book.findUnique({ where: { id: updatedLoan.bookId } });
        if (bookAfter && bookAfter.available_copies > bookAfter.total_copies) {
          await prisma.book.update({
            where: { id: updatedLoan.bookId },
            data: { available_copies: bookAfter.total_copies },
          });
        }
      } catch (err) {
        console.warn("Erro ao atualizar cópias disponíveis do livro", err);
      }
    }

    // cria notificação para o usuário solicitante
    try {
      await prisma.notification.create({
        data: {
          userId: updatedLoan.userId,
          title: "Livro devolvido",
          message: `O livro "${updatedLoan.book?.title ?? "Título"}" foi registrado como devolvido.`,
          type: "RETURN_CONFIRMATION",
          relatedLoanId: updatedLoan.id,
        },
      });
    } catch (err) {
      console.warn("Falha ao criar notificação de devolução", err);
    }

    return NextResponse.json(updatedLoan, { status: 200 });
  } catch (error: any) {
    console.error("PATCH /api/loans/[id]/return error:", error);
    return NextResponse.json({ error: error?.message ?? "Erro ao registrar devolução" }, { status: 500 });
  }
}
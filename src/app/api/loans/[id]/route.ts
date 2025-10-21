
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loanService } from "@/lib/services/loan-service";

const getSessionTyped = async (): Promise<Session | null> =>
 (await getServerSession(authOptions as any)) as Session | null;

export async function PATCH(request: Request, {params}: { params: { id: string }}){
    try {
        const loanId = params.id;
        if (!loanId){
            return NextResponse.json({ error: "ID do empréstimo ausente"}, { status: 400})
        }

        const session = await getSessionTyped();
        const body = await request.json().catch(() => ({}));
        const action = (body.action || "").toString();

        // checa o role
        const isEmployeeOrAdmin = !!session?.user && ["EMPLOYEE", "ADMIN"].includes((session.user as any).role);

        switch (action) {
            case "approve": {
                if (!isEmployeeOrAdmin) {
                    return NextResponse.json({ error: "Permissão Negada"}, { status: 403 })
                }
                const employeeId = body.employeeId ?? session!.user!.id;
                const dueDate = body.dueDate ? new Date(body.dueDate) : undefined;

                try {
                    const updated = await loanService.approveLoan(loanId, employeeId, dueDate )
                    return NextResponse.json(updated, { status: 200 })
                } catch (err: any) {
                    return NextResponse.json( { error: err?.message ?? "Erro ao aprovar empréstimo"}, { status: 400 })
                }
            }

            case "reject": {
                if (!isEmployeeOrAdmin) {
                    return NextResponse.json({ error: "Permissão Negada" }, { status: 403 })
                }
                const employeeId = body.employeeId ?? session!.user!.id;
                const rejectionReason = body.rejectionReason

                if (!rejectionReason) {
                    return NextResponse.json({ error: "rejectionReason é obrigatório" }, { status: 400})
                }

                try {
                    const updated = await loanService.rejectLoan(loanId, employeeId, rejectionReason)
                    return NextResponse.json(updated, { status: 200})
                } catch (err: any) {
                    return NextResponse.json({ error: err?.message ?? "Erro ao rejeitar empréstimo" }, { status: 400})
                }
            }

            case "withdraw": {
                if (!isEmployeeOrAdmin) {
                return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
                }
                const employeeId = body.employeeId ?? session!.user!.id;
                const conditionBefore = body.conditionBefore;
                if (!conditionBefore) {
                return NextResponse.json({ error: "conditionBefore é obrigatório" }, { status: 400 });
                }
                const employeeNotes = body.employeeNotes;
                try {
                const updated = await loanService.registerLoanWithdrawal(loanId, employeeId, conditionBefore, employeeNotes);
                return NextResponse.json(updated, { status: 200 });
                } catch (err: any) {
                return NextResponse.json({ error: err?.message ?? "Erro ao registrar retirada" }, { status: 400 });
                }
            }

            case "return": {
                if (!isEmployeeOrAdmin) {
                return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
                }
                const conditionAfter = body.conditionAfter;
                if (!conditionAfter) {
                return NextResponse.json({ error: "conditionAfter é obrigatório" }, { status: 400 });
                }
                const employeeNotes = body.employeeNotes;
                try {
                const updated = await loanService.registerReturn(loanId, conditionAfter, employeeNotes);
                return NextResponse.json(updated, { status: 200 });
                } catch (err: any) {
                return NextResponse.json({ error: err?.message ?? "Erro ao registrar devolução" }, { status: 400 });
                }
            }

            case "cancel": {
                // permitir que o próprio usuário cancele; se for funcionário/admin, permitir cancelar também
                const userIdFromBody = body.userId;
                const sessionUserId = session?.user?.id;
                if (!sessionUserId && !userIdFromBody) {
                return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
                }

                // se não for employee/admin, apenas permitir cancelar se for dono
                if (!isEmployeeOrAdmin) {
                const userId = userIdFromBody ?? sessionUserId;
                if (userId !== sessionUserId) {
                    return NextResponse.json({ error: "Permissão negada" }, { status: 403 });
                }
                try {
                    const updated = await loanService.cancelLoan(loanId, userId!);
                    return NextResponse.json(updated, { status: 200 });
                } catch (err: any) {
                    return NextResponse.json({ error: err?.message ?? "Erro ao cancelar empréstimo" }, { status: 400 });
                }
                } else {
                // funcionário/admin pode cancelar em nome do usuário se passar userId, ou apenas cancelar sem checar owner
                const userId = userIdFromBody ?? sessionUserId!;
                try {
                    const updated = await loanService.cancelLoan(loanId, userId);
                    return NextResponse.json(updated, { status: 200 });
                } catch (err: any) {
                    return NextResponse.json({ error: err?.message ?? "Erro ao cancelar empréstimo" }, { status: 400 });
                }
            }

        }

        default:
            return NextResponse.json({ error: "Ação inválida. Use approve, reject, withdraw, return ou cancel"})
        }
    } catch(error: any) {
        console.error("PATCH /api/loans/:id error:", error)
        return NextResponse.json({ error: error?.message ?? "Erro interno"}, { status: 500})
    }
}



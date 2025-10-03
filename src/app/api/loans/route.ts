import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { loanService } from "@/lib/services/loan-service";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user.id) {
            return NextResponse.json(
                {error: 'Não autorizado'},
                { status: 401}
            )
        }

        const { bookId, userNotes } = await request.json()

        if (!bookId) {
            return NextResponse.json(
                { error: 'ID do livro é obrigatório.'},
                { status: 400 }
            )
        }

        const loan = await loanService.createLoan({
            bookId,
            userId: session.user.id,
            userNotes
        })

        return NextResponse.json(loan)

    } catch (error: any) {
        console.error('Erro ao criar empréstimo:', error)
        return NextResponse.json(
            {error: error.message || 'Erro interno do servidor'},
            {status: 400}
        )
    }
}
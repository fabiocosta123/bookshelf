import { PrismaClient, LoanStatus, BookConditionType, UserRole } from "@prisma/client";
import { toast } from 'sonner';

const prisma = new PrismaClient();

export interface CreateLoanInput {
    bookId: string;
    userId: string;
    userNotes?: string;
}

export interface UpdateLoanInput {
    approvedAt?: Date;
    loanDate?: Date;
    dueDate?: Date;
    returnedAt?: Date;
    status?: LoanStatus;
    conditionAfter?: BookConditionType;
    employeeNotes?: string;
    rejectionReason?: string;
    approvedById?: string;
}

export class LoanService {
    // criar solicitação de empréstimo (cliente)
    async createLoan(data: CreateLoanInput) {
        try {
            // verifica se o livro existe e está disponivel
            const book = await prisma.book.findUnique({
                where: { id: data.bookId },
                select: {
                    id: true,
                    available_copies: true,
                    total_copies: true,
                    title: true
                }
            });

            if (!book) {
               toast.error('Livro não encontrado')
               return 
            }

            if (book.available_copies <= 0) {
                toast.error('Livro indisponivel para empréstimo')
                return
            }

            // verifica se o usuário já tem empréstimo ativo para este livro
            const existingActiveLoan = await prisma.loan.findFirst({
                where: {
                    bookId: data.bookId,
                    userId: data.userId,
                    status: {
                        in: [LoanStatus.PENDING, LoanStatus.APPROVED, LoanStatus.ACTIVE]
                    }
                }
            })

            if (existingActiveLoan) {
                toast.error('Você já tem empréstimos ativo ou pendente para este livro')
                return
            }

            // verifica se o usuario tem empréstimos em atraso
            const overdueLoans = await prisma.loan.count({
                where: {
                    userId: data.userId,
                    status: LoanStatus.OVERDUE
                }
            })

            if (overdueLoans > 0) {
                toast.error('Você tem empréstimos em atraso. Regularize-os antes de solicitar novo empréstimo.')
                return
            }

            // Criar empréstimo
            const loan = await prisma.loan.create({
                data: {
                    bookId: data.bookId,
                    userId: data.userId,
                    userNotes: data.userNotes,
                    status: LoanStatus.PENDING,
                    requestedAt: new Date(),
                },
                include: {
                    book: {
                        select: {
                            title: true,
                            author: true,
                            cover: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            }) 

            // cria notificação para funcionarios
            
        }
    }
}
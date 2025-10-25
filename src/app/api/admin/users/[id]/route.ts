import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toast } from "sonner";

// Get => Detalhes completos do usuário
export async function GET(request: Request, { params }: { params: Promise<{ id: string }>}) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ message: "Não autorizado" }, { status: 401 });
        }

        // verifica se o usuário é admin
        const correntUSer = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if(correntUSer?.role !== "ADMIN") {
            return NextResponse.json({ message: "Acesso negado" }, { status: 403 });
        }

        // busca usuario com todos os dados
        const user = await prisma.user.findUnique({
            where: { id },
            include: {
                loans: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                author: true,
                                title: true,
                                cover: true
                            }
                        }
                    },
                    orderBy: {
                        requestedAt: 'desc'
                    }
                },
                reviews: {
                    include: {
                        book: {
                            select: {
                                id: true,
                                title: true,
                                author: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        loans: {
                            where: {
                                status: { in: ["APPROVED", "ACTIVE"]}
                            }
                        },
                        reviews: true
                    }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ message: "Usuário não encontrado" }, { status: 404 });
        }

        // formatar dados para resposta
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
            status: user.status,
            phone: user.phone,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            registration_number: user.registration_number,

            // estatisticas
            stats: {
                totalLoans: user._count.loans,
                activeLoans: user.loans.filter(loan => ["APPROVED", "ACTIVE"].includes(loan.status)).length,
                totalReviews: user._count.reviews,

                completedLoans: user.loans.filter(loan => loan.status === "RETURNED").length,
                overdueLoans: user.loans.filter(loan => loan.status === "OVERDUE").length,
            },

            // empréstimos agrupados por stats
            loans: {
                active: user.loans.filter(loan => ["APPROVED", "ACTIVE"].includes(loan.status)),
                history: user.loans.filter(loan => ["RETURNED", "REJECTED", "OVERDUE", "CANCELLED"].includes(loan.status)),
                pending: user.loans.filter(loan => loan.status === "PENDING"),
            },

            // reviews
            reviews: user.reviews           
        }

        return NextResponse.json(userData, { status: 200 });

    } catch (error) {
        toast.error("Erro ao buscar detalhes do usuário.");
        console.error("Erro ao buscar detalhes do usuário:", error);
        return NextResponse.json({ message: "Erro interno do servidor" }, { status: 500 });
        
    }
}
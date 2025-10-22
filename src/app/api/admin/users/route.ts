import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// lista usuarios
export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // verifica se é admin
        if (!session?.user) {
            return NextResponse.json({ error: "Não autorizado"}, { status: 401})
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { role: true }
        });

        if (user?.role !== "ADMIN") {
            return NextResponse.json({ error: "Acesso Negado" }, { status: 403})
        }

        // busca parâmetro da url
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const status = searchParams.get("status") || "";

        const skip = (page - 1) * limit;

        // constroi where clause
        const where: any = {};

        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" }},
                { email: { contains: search, mode: "insensitive" }}
            ]
        }

        if (role) {
            where.role = role;
        }

        if (status) {
            where.status = status
        }
        
        // buscar usuários
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                    role: true,
                    status: true,
                    createdAt: true,
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
                },
                orderBy: { createdAt: "desc"},
                skip,
                take: limit,
            }),
            prisma.user.count({ where })
        ])

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        
        return NextResponse.json(
            { error: "Erro interno do servidor" },
            { status: 500}
        )
    }
}
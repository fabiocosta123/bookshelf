import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Helpers */
function parseIntOrNull(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isInteger(n) ? n : Math.trunc(n);
}
function parseNumberNullable(value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}
function safeString(v: unknown) {
  return v === undefined || v === null ? null : String(v);
}

/** Build where for GET */
function buildWhere(search?: string | null, genre?: string | null, readingStatus?: string | null) {
  const where: any = {};
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { author: { contains: search, mode: "insensitive" } },
    ];
  }
  if (genre) where.genre = genre;
  if (readingStatus) where.reading_status = readingStatus;
  return where;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const genre = searchParams.get("genre");
    const readingStatus = searchParams.get("readingStatus");

    const where = buildWhere(search, genre, readingStatus);

    const books = await prisma.book.findMany({
      where,
      orderBy: { title: "asc" },
      include: {
        loans: {
          where: { status: "ACTIVE" },
          include: { user: { select: { name: true } } },
        },
      },
    });

    return NextResponse.json(books, { status: 200 });
  } catch (error: any) {
    console.error("Erro ao buscar livros:", error);
    return NextResponse.json({ error: error?.message || "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      console.warn("POST /api/books recebido com content-type inesperado:", contentType);
    }

    const body = await request.json();
    console.log("📦 Dados recebidos no POST /api/books:", body);

    // validações mínimas
    if (!body?.title || !String(body.title).trim()) {
      return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
    }
    if (!body?.author || !String(body.author).trim()) {
      return NextResponse.json({ error: "Autor é obrigatório" }, { status: 400 });
    }

    // converter e validar campos numéricos conforme schema
    const year = parseIntOrNull(body.year);
    const pages = parseIntOrNull(body.pages);
    const totalCopies = parseIntOrNull(body.total_copies) ?? 1;
    const rating = parseIntOrNull(body.rating); // rating é Int? no schema

    if (body.year !== undefined && body.year !== "" && year === null) {
      return NextResponse.json({ error: "Ano inválido" }, { status: 400 });
    }
    if (body.pages !== undefined && body.pages !== "" && pages === null) {
      return NextResponse.json({ error: "Páginas inválidas" }, { status: 400 });
    }
    if (Number.isNaN(Number(totalCopies)) || totalCopies <= 0) {
      return NextResponse.json({ error: "total_copies deve ser um número maior que zero" }, { status: 400 });
    }
    if (body.rating !== undefined && body.rating !== "" && rating === null) {
      return NextResponse.json({ error: "Avaliação inválida" }, { status: 400 });
    }

    // obter createdById a partir da sessão
    let createdById: string | null = null;
    // Tenta usar session.user.id diretamente, se não existir, busca usuário por email
    if ((session as any).user?.id) {
      createdById = (session as any).user.id;
    } else if ((session as any).user?.email) {
      const user = await prisma.user.findUnique({ where: { email: (session as any).user.email }, select: { id: true } });
      if (user) createdById = user.id;
    }

    if (!createdById) {
      return NextResponse.json({ error: "Usuário não encontrado na sessão" }, { status: 401 });
    }

    // montar objeto conforme schema.prisma
    const data: any = {
      title: String(body.title).trim(),
      author: String(body.author).trim(),
      genre: safeString(body.genre),
      year: year,
      pages: pages,
      total_copies: totalCopies,
      available_copies: totalCopies,
      rating: rating,
      synopsis: safeString(body.synopsis),
      cover: safeString(body.cover),
      isbn: safeString(body.isbn),
      reading_status: body.reading_status ? String(body.reading_status) : undefined,
      createdById,
    };

    console.log("➡️ Dados enviados ao Prisma:", data);

    const newBook = await prisma.book.create({ data });

    return NextResponse.json(newBook, { status: 201 });
  } catch (error: any) {
    console.error("❌ Erro ao salvar livro (detalhado):", error);
    return NextResponse.json({ error: error?.message || "Erro ao salvar livro" }, { status: 500 });
  }
}

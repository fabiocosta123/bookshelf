import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import type { Session } from "next-auth";

const getSessionTyped = async (): Promise<Session | null> =>
  (await getServerSession(authOptions as any)) as Session | null;

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const q = url.searchParams.get("search") || "";
  // opcional: checar permissão do caller
  const session = await getSessionTyped();
  if (!session?.user) return NextResponse.json({ users: [] });

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
        { registration_number: { contains: q, mode: "insensitive" } },
      ],
    },
    select: { id: true, name: true, email: true },
    take: 10,
  });

  return NextResponse.json({ users });
}
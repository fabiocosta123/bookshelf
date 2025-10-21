import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Busca informações adicionais do usuário no banco de dados
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          role: true,
          status: true,
          email: true,
          name: true,
          image: true,
        },
      });

      if (dbUser) {
        session.user.id = dbUser.id;
        session.user.role = dbUser.role;
        session.user.status = dbUser.status;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Verifica se o usuário está ativo
      if (user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { status: true },
        });

        if (existingUser && existingUser.status === "SUSPENDED") {
          return false; // Impede o login de usuários suspensos
        }
      }

      return true; // Permite o login
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
};

// Extendendo tipos do NextAuth - FORA do authOptions
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: string;
      status: string;
    };
  }

  interface User {
    role: string;
    status: string;
  }
}
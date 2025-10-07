import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Busca usuário no banco INCLUINDO password e salt
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            select: {
              id: true,
              email: true,
              name: true,
              password: true,
              salt: true,
              role: true,
              status: true,
              image: true,
            }
          });

          // Verifica se usuário existe e tem senha
          if (!user || !user.password || !user.salt) {
            return null;
          }

          // Verifica a senha
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          // Retorna o usuário sem os campos sensíveis
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            image: user.image,
          };

        } catch (error) {
          console.error('Erro no authorize:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user, token }) {
      // Para login com Google
      if (user) {
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
      }
      
      // Para login com credenciais
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        session.user.status = token.status as string;
      }

      return session;
    },

    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (user.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { status: true },
          });

          if (existingUser && existingUser.status === "SUSPENDED") {
            return false;
          }
        }
      }
      
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
};

// Extendendo tipos do NextAuth
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

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    status: string;
  }
}
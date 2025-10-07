import { NextAuthOptions } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // provider para admin/func
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // busca usuario no banco
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // verifica se usuario existe e tem senha
        if (!user || !user.password) {
          return null;
        }

        // verifica a senha
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // retorna o usuario para a sessão
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      // Busca informações adicionais do usuário no banco de dados
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
      // Para login com credenciais
      if (user) {
        token.role = user.role;
        token.status = user.status;
      }
      return token;
    },

    async signIn({ user, account, profile }) {
      // permite login tanto por google quanto por email e senha
      if(account?.provider === 'google'){
        // Verifica se o usuário está ativo
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

      return true; // Permite o login
    },
  },
  pages: {
    signIn: "/auth/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  }
};

// Extendendo tipos do NextAuth - 
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


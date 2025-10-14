import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Account, User } from "next-auth";

// 🔐 Configuração principal do NextAuth
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    signOut: "/auth/logout",
    error: "/auth/error",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
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
            },
          });

          if (!user || !user.password || !user.salt) return null;

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) return null;

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status,
            image: user.image,
          };
        } catch (error) {
          console.error("❌ Erro no authorize:", error);
          return null;
        }
      },
    }),
  ],

  // 🔁 Callbacks
  callbacks: {
    async session({ session, user }) {
      if (!user?.id) return session;

      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            role: true,
            status: true,
          },
        });

        if (dbUser) {
          session.user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            image: dbUser.image ?? undefined,
            role: dbUser.role,
            status: dbUser.status,
          };
        }
      } catch (error) {
        console.error("❌ Erro ao buscar usuário no banco:", error);
      }

      return session;
    },

    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
    }): Promise<JWT> {
      if (user) {
        token.role = (user as any).role;
        token.status = (user as any).status;
      }
      return token;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        const existingUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { status: true },
        });

        if (existingUser?.status === "SUSPENDED") {
          return false;
        }
      }

      return true;
    },
  },
};

// 🧠 Extendendo tipos do NextAuth
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

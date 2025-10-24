import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";
import { JWT } from "next-auth/jwt";
import { Account, User } from "next-auth";

// Configuração principal do NextAuth
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

  // Callbacks
  callbacks: {
    async session({ session, token }) {
      if (!session.user) session.user = {} as any;

      session.user.id = (token as any).id ?? session.user.id;
      session.user.email = (token as any).email ?? session.user.email;
      session.user.name = (token as any).name ?? session.user.name;
      session.user.image = (token as any).picture ?? session.user.image;
      session.user.role = (token as any).role ?? session.user.role;
      session.user.status = (token as any).status ?? session.user.status;

      // Atualiza com DB copy quando possível
      try {
        if (session.user.id) {
          const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
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
            } as any;
          }
        }
      } catch (e) {
        console.error("Erro ao sincronizar sessão com DB:", e);
      }

      return session;
    },

    // Dentro de authOptions.callbacks
    // async redirect(params: any) {
    //   const { url, baseUrl, token, account } = params
    //   // Se não houver token ainda, usa baseUrl
    //   const role = (token as any)?.role ?? undefined;

    //   // Login via Google ou qualquer OAuth: role normalmente será CLIENT (default)
    //   if (account?.provider === 'google') {
    //     if (role === 'CLIENT') return `${baseUrl}/client/dashboard`;
    //     return `${baseUrl}/dashboard`;
    //   }

    //   // Login via Credentials (admin/employee) — mantém destino admin por padrão
    //   if (role === 'ADMIN' || role === 'EMPLOYEE') {
    //     return `${baseUrl}/dashboard`;
    //   }

    //   // fallback: mantém a URL pedida ou baseUrl
    //   return url.startsWith(baseUrl) ? url : baseUrl;
    // },

    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos customizados
      if (url.startsWith(baseUrl)) return url;

      // Redirecionamento padrão para dashboard
      return `${baseUrl}/dashboard`;
    },

    async jwt({ token, user, account }) {
      if (user) {
        // Na primeira geração de token, popula campos vindos do user
        token.id = (user as any).id ?? token.id;
        token.email = (user as any).email ?? token.email;
        token.name = (user as any).name ?? token.name;
        token.picture = (user as any).image ?? token.picture;
        token.role = (user as any).role ?? token.role;
        token.status = (user as any).status ?? token.status;
      }
      return token;
    },

    // async signIn({ user, account, profile }) {
    //   if (account?.provider === "google" && user.email) {
    //     const existingUser = await prisma.user.findUnique({
    //       where: { email: user.email },
    //       select: { status: true },
    //     });

    //     if (existingUser?.status === "SUSPENDED") {
    //       return false;
    //     }
    //   }

    //   return true;
    // },

    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && user.email) {
          // Verifica se o usuário existe
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, status: true, role: true },
          });

          // Se usuário suspenso, bloqueia login
          if (existingUser?.status === "SUSPENDED") {
            return false;
          }

          // Se não existe, cria o usuário
          if (!existingUser) {
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || profile?.name || "Usuário Google",
                image: user.image,
                role: "CLIENT", // Default para novos usuários Google
                status: "ACTIVE",
              },
            });
          }
        }

        return true;
      } catch (error) {
        console.error("Erro no signIn:", error);
        return false;
      }
    },
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

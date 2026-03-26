import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        phone: { label: "WhatsApp", type: "text", placeholder: "55839..." },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.password) {
          throw new Error("Telefone e senha são obrigatórios.");
        }

        const cleanPhone = credentials.phone.replace(/\D/g, '');
        // Tentativa de buscar com e sem o prefixo 55
        const phoneVariants = [cleanPhone];
        if (cleanPhone.startsWith('55')) {
          phoneVariants.push(cleanPhone.substring(2));
        } else {
          phoneVariants.push('55' + cleanPhone);
        }

        const user = await prisma.user.findFirst({
          where: { 
            phone: { in: phoneVariants }
          },
        });

        if (!user) {
          throw new Error("Usuário não encontrado.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Senha incorreta.");
        }

        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

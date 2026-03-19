import { NextResponse, NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, password } = body;

    if (!name || !phone || !password) {
      return NextResponse.json({ message: "Dados incompletos" }, { status: 400 });
    }

    if (password.length < 4) {
      return NextResponse.json({ message: "A senha deve ter no mínimo 4 caracteres" }, { status: 400 });
    }

    // Verificar se NOME já existe (usuario)
    const nameExists = await prisma.user.findUnique({
      where: { name }
    });

    if (nameExists) {
      return NextResponse.json({ message: "Este Nome de Piloto já está em uso" }, { status: 400 });
    }

    // Verificar se TELEFONE já existe
    const phoneExists = await prisma.user.findUnique({
      where: { phone }
    });

    if (phoneExists) {
      return NextResponse.json({ message: "Este WhatsApp já está em uso" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        password: hashedPassword,
        role: "USER" // Default
      }
    });

    return NextResponse.json({ message: "Piloto cadastrado com sucesso", user: { phone: user.phone } }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: "Erro interno", error: err.message }, { status: 500 });
  }
}

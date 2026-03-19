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

    const exists = await prisma.user.findUnique({
      where: { phone }
    });

    if (exists) {
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

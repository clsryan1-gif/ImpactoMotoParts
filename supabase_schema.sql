-- SQL para configurar o banco de dados no Supabase para IMPACTO MOTO PARTS

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Usuários (User)
CREATE TABLE IF NOT EXISTS "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "name" TEXT UNIQUE NOT NULL,
    "phone" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT DEFAULT 'USER',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Produtos (Product)
CREATE TABLE IF NOT EXISTS "Product" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "compatibilidade" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "imagem" TEXT,
    "estoque" INTEGER DEFAULT 0 NOT NULL,
    "ativo" BOOLEAN DEFAULT true NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Pedidos (Order)
CREATE TABLE IF NOT EXISTS "Order" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "total" DOUBLE PRECISION NOT NULL,
    "status" TEXT DEFAULT 'PENDENTE' NOT NULL,
    "paymentType" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Itens do Pedido (OrderItem)
CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "orderId" UUID NOT NULL REFERENCES "Order"("id") ON DELETE CASCADE,
    "productId" UUID NOT NULL REFERENCES "Product"("id") ON DELETE CASCADE,
    "quantity" INTEGER DEFAULT 1 NOT NULL,
    "price" DOUBLE PRECISION NOT NULL
);

-- 5. Tabela de Controle Financeiro (Financeiro)
CREATE TABLE IF NOT EXISTS "Financeiro" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "tipo" TEXT NOT NULL, -- 'ENTRADA' ou 'SAIDA'
    "valor" DOUBLE PRECISION NOT NULL,
    "descricao" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "data" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Tabela de Logs de Atividade (ActivityLog)
CREATE TABLE IF NOT EXISTS "ActivityLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user" TEXT NOT NULL,
    "role" TEXT,
    "type" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "metadata" TEXT, -- JSON stringificado
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar Índices para Performance
CREATE INDEX IF NOT EXISTS "idx_product_categoria" ON "Product"("categoria");
CREATE INDEX IF NOT EXISTS "idx_product_preco" ON "Product"("preco");
CREATE INDEX IF NOT EXISTS "idx_order_status" ON "Order"("status");
CREATE INDEX IF NOT EXISTS "idx_order_userid" ON "Order"("userId");
CREATE INDEX IF NOT EXISTS "idx_activitylog_createdat" ON "ActivityLog"("createdAt");
CREATE INDEX IF NOT EXISTS "idx_activitylog_user" ON "ActivityLog"("user");

-- Habilitar RLS (Row Level Security) se desejar (opcional, Prisma geralmente pula isso se usar connection string direta)
-- ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "Product" ENABLE ROW LEVEL SECURITY;
-- ... adicione políticas conforme necessário

import { z } from 'zod';

// Esquema para Criação e Atualização de Produtos
// Este esquema garante que NENHUM dado inválido chegue ao banco de dados.
export const productSchema = z.object({
  nome: z.string()
    .min(3, "O nome deve ter pelo menos 3 caracteres")
    .max(100, "O nome é muito longo")
    .trim(),
  
  categoria: z.string()
    .min(2, "Informe uma categoria válida")
    .trim(),
  
  compatibilidade: z.string()
    .min(2, "Informe a compatibilidade")
    .trim(),
  
  preco: z.number()
    .positive("O preço deve ser maior que zero")
    .max(99999.99, "Preço excede o limite de segurança (R$ 99.999)"),
  
  imagem: z.string()
    .min(1, "A imagem ou URL é obrigatória")
    .or(z.literal(''))
    .nullable(),
  
  estoque: z.number()
    .int("O estoque deve ser um número inteiro")
    .min(0, "O estoque não pode ser negativo")
    .max(99999, "Estoque excede o limite de segurança (99.999 unidades)"),
  
  ativo: z.boolean().optional().default(true),
});

// Tipo derivado do esquema para uso em TypeScript
export type ProductInput = z.infer<typeof productSchema>;

// Esquema para atualizações parciais (PATCH)
export const partialProductSchema = productSchema.partial();

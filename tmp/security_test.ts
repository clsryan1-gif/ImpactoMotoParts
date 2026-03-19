const BASE_URL = 'http://localhost:3000/api';

async function testSecurity() {
  console.log('🛡️ Iniciando Testes de Segurança Elite (Fetch Nativo)...');

  // 1. Tentar mudar status de pedido sem estar logado
  console.log('🧪 Teste 1: PATCH /admin/pedidos/XXX sem login');
  try {
    const res1 = await fetch(`${BASE_URL}/admin/pedidos/d4812894`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PAGO' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(` Resultado: ${res1.status} (Esperado: 401)`);
  } catch (e) {
    console.log(' Erro na conexão: ' + e.message);
  }

  // 2. Tentar criar produto sem ser ADMIN
  console.log('🧪 Teste 2: POST /admin/produtos');
  try {
    const res2 = await fetch(`${BASE_URL}/admin/produtos`, {
      method: 'POST',
      body: JSON.stringify({ nome: 'Hacker Part', preco: 1.0, categoria: 'TESTE', compatibilidade: 'TESTE', estoque: 1, imagem: '' }),
      headers: { 'Content-Type': 'application/json' }
    });
    console.log(` Resultado: ${res2.status} (Esperado: 401)`);
  } catch (e) {
     console.log(' Erro na conexão: ' + e.message);
  }

  console.log('🏁 Testes básicos de segurança concluídos.');
}

testSecurity();

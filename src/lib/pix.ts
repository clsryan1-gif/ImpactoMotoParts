/**
 * Utilitário para geração de Payload PIX (BRCode) estático
 * Baseado no padrão EMV QRCPS / Arranjo de Pagamentos do BCB
 */

function crc16(data: string): string {
  let crc = 0xFFFF;
  for (let i = 0; i < data.length; i++) {
    crc ^= data.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = (crc << 1) ^ 0x1021;
      } else {
        crc <<= 1;
      }
    }
  }
  return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

export function generatePixPayload(key: string, amount: number, city: string = 'JOAO PESSOA', name: string = 'IMPACTO MOTO PARTS'): string {
  const amountStr = amount.toFixed(2);
  
  // Tags PIX
  const payloadArr = [
    '000201', // Payload Format Indicator
    '26', // Merchant Account Information (Tag 26)
    `0014BR.GOV.BCB.PIX0114${key}`, // Chave PIX (Telefone no formato +55...)
    '52040000', // Merchant Category Code
    '5303986', // Transaction Currency (BRL)
    `54${amountStr.length.toString().padStart(2, '0')}${amountStr}`, // Transaction Amount
    '5802BR', // Country Code
    `59${name.length.toString().padStart(2, '0')}${name}`, // Merchant Name
    `60${city.length.toString().padStart(2, '0')}${city}`, // Merchant City
    '62070503***' // Additional Data Field Template
  ];

  let rawPayload = payloadArr.join('') + '6304';
  const checksum = crc16(rawPayload);
  
  return rawPayload + checksum;
}

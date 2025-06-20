// services/mockDataService.ts

import { Product } from '../types';

const productNames = ['Pão', 'Bolo', 'Torta', 'Leite', 'Queijo', 'Presunto', 'Suco', 'Refrigerante', 'Manteiga', 'Café', 'Farinha', 'Açúcar', 'Ovos', 'Croissant', 'Sonho'];
const productDescriptors = ['Francês', 'Integral', 'de Milho', 'de Fubá', 'de Chocolate', 'de Laranja', 'Holandês', 'Prato', 'Cozido', 'com Sal', 'Moído', 'Refinado', 'Caixa com 12', 'Garrafa 2L', 'Pote 250g'];
const categories = ['Panificação', 'Confeitaria', 'Frios e Laticínios', 'Bebidas', 'Mercearia'];

// Função para formatar a data como DD/MM/AAAA
const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função principal que gera os produtos
export const generateMockProducts = (count: number): Product[] => {
  const products: Product[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const namePart1 = productNames[Math.floor(Math.random() * productNames.length)];
    const namePart2 = productDescriptors[Math.floor(Math.random() * productDescriptors.length)];
    
    // Gerar data de validade aleatória
    let expirationDate = new Date();
    const dateType = Math.random();
    if (dateType < 0.1) { // 10% de chance de estar vencido
      expirationDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    } else if (dateType < 0.3) { // 20% de chance de vencer em breve
      expirationDate.setDate(today.getDate() + Math.floor(Math.random() * 28) + 1);
    } else { // 70% de chance de ter validade OK
      expirationDate.setMonth(today.getMonth() + Math.floor(Math.random() * 12) + 2);
    }

    const product: Product = {
      id: `mock-${i + 1}`,
      name: `${namePart1} ${namePart2}`,
      quantity: Math.floor(Math.random() * 200) + 1,
      price: parseFloat((Math.random() * 50 + 1.5).toFixed(2)),
      imageUri: `https://picsum.photos/seed/padaria${i}/200`,
      category: categories[Math.floor(Math.random() * categories.length)],
      lowStockThreshold: Math.random() > 0.7 ? 10 : undefined, // 30% de chance de ter um alerta
      expirationDate: formatDate(expirationDate),
      history: [],
    };
    products.push(product);
  }
  return products;
};
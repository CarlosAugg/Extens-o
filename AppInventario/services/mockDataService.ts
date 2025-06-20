// services/mockDataService.ts

import { Product } from '../types';

const productNames = ['Pão', 'Bolo', 'Torta', 'Leite', 'Queijo', 'Presunto', 'Suco', 'Refrigerante', 'Manteiga', 'Café', 'Farinha', 'Açúcar', 'Ovos', 'Croissant', 'Sonho', 'Biscoito', 'Rosca', 'Salgado'];
const productDescriptors = ['Francês', 'Integral', 'de Milho', 'de Fubá', 'de Chocolate', 'de Laranja', 'Holandês', 'Prato', 'Cozido', 'com Sal', 'Moído', 'Refinado', 'Caixa com 12', 'Garrafa 2L', 'Pote 250g', 'Polvilho', 'Doce', 'Assado'];
const categories = ['Panificação', 'Confeitaria', 'Frios e Laticínios', 'Bebidas', 'Mercearia'];

const imageKeywordMap: { [key: string]: string } = {
  'Pão': 'bread', 'Bolo': 'cake', 'Torta': 'pie', 'Leite': 'milk', 'Queijo': 'cheese', 'Presunto': 'ham', 'Suco': 'juice', 'Refrigerante': 'soda', 'Manteiga': 'butter', 'Café': 'coffee', 'Farinha': 'flour', 'Açúcar': 'sugar', 'Ovos': 'eggs', 'Croissant': 'croissant', 'Sonho': 'doughnut', 'Biscoito': 'cookie', 'Rosca': 'bagel', 'Salgado': 'pastry',
};

const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

export const generateMockProducts = (count: number): Product[] => {
  const products: Product[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const namePart1 = productNames[Math.floor(Math.random() * productNames.length)];
    const namePart2 = productDescriptors[Math.floor(Math.random() * productDescriptors.length)];
    
    const keyword = imageKeywordMap[namePart1] || 'bakery';
    const imageUri = `https://picsum.photos/seed/${keyword}${i}/200`;

    let expirationDate = new Date();
    const dateType = Math.random();
    if (dateType < 0.1) {
      expirationDate.setDate(today.getDate() - Math.floor(Math.random() * 30));
    } else if (dateType < 0.3) {
      expirationDate.setDate(today.getDate() + Math.floor(Math.random() * 28) + 1);
    } else {
      expirationDate.setMonth(today.getMonth() + Math.floor(Math.random() * 12) + 2);
    }

    const product: Product = {
      id: `mock-${i + 1}`,
      name: `${namePart1} ${namePart2}`,
      quantity: Math.floor(Math.random() * 200) + 1,
      price: parseFloat((Math.random() * 50 + 1.5).toFixed(2)),
      imageUri: imageUri,
      category: categories[Math.floor(Math.random() * categories.length)],
      lowStockThreshold: Math.random() > 0.7 ? 10 : undefined,
      expirationDate: formatDate(expirationDate),
      history: [],
    };
    products.push(product);
  }
  return products;
};
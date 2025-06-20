// types/index.ts

export interface Movement {
  id: string;
  date: string; // Usando string para simplificar o armazenamento no AsyncStorage
  type: 'entrada' | 'saida';
  quantityChange: number;
  reason?: string;
}

export interface Product {
  id: string;
  name: string;
  quantity: number;
  price?: number;
  expirationDate?: string;
  imageUri?: string;
  category?: string;
  lowStockThreshold?: number;
  history?: Movement[];
}
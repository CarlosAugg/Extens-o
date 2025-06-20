// services/csvService.ts

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Product } from '../types';

export const exportProductsToCSV = async (products: Product[]) => {
  const header = 'ID,Nome,Quantidade,Preco,Validade,Categoria,AlertaEstoqueBaixo\n';
  const rows = products.map(p => 
    [
      p.id,
      p.name,
      p.quantity,
      p.price?.toFixed(2).replace('.', ',') || '',
      p.expirationDate || '',
      p.category || '',
      p.lowStockThreshold || ''
    ].join(',')
  ).join('\n');

  const csvString = header + rows;
  const fileName = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
  const filePath = `${FileSystem.cacheDirectory}${fileName}`;

  try {
    await FileSystem.writeAsStringAsync(filePath, csvString, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(filePath, {
        mimeType: 'text/csv',
        dialogTitle: 'Exportar Inventário',
      });
    } else {
      alert('Compartilhamento não disponível neste dispositivo.');
    }
  } catch (error) {
    console.error('Erro ao exportar para CSV:', error);
    alert('Ocorreu um erro ao exportar os dados.');
  }
};
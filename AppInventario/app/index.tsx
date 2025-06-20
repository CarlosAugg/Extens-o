// app/index.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { SafeAreaView, View, TextInput, FlatList, Text, StyleSheet, Pressable, Image, TouchableOpacity, ScrollView, Modal, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Product } from '../types';
import { ProductModal } from '../components/ProductModal';
import { exportProductsToCSV } from '../services/csvService';
import { generateMockProducts } from '../services/mockDataService';

// --- Funções de Ajuda ---
const formatCurrency = (value: number): string => {
  if (isNaN(value)) {
    return 'R$ 0,00';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const parseDate = (dateString: string): Date => {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    return new Date('invalid');
  }
  const parts = dateString.split('/');
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
};

const getExpirationStatus = (dateString?: string): 'expired' | 'expiring_soon' | 'ok' => {
  if (!dateString) return 'ok';
  try {
    const productDate = parseDate(dateString);
    if (isNaN(productDate.getTime())) return 'ok';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (productDate < today) return 'expired';
    
    const oneMonthFromNow = new Date();
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    if (productDate <= oneMonthFromNow) return 'expiring_soon';
    
    return 'ok';
  } catch (error) {
    return 'ok';
  }
};

const STORAGE_KEY = '@inventory_app:products';
const MOCK_DATA_COUNT = 100;

// --- Componente Principal ---
export default function InventoryScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>('Todos');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' as 'asc' | 'desc' });
  const [isExpirationModalVisible, setIsExpirationModalVisible] = useState(false);

  const loadProducts = async () => {
    try {
      // Para forçar a recriação dos dados com fotos novas, DESCOMENTE a linha abaixo uma vez
      // await AsyncStorage.removeItem(STORAGE_KEY); 
      
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue !== null && JSON.parse(jsonValue).length > 0) {
        setProducts(JSON.parse(jsonValue));
      } else {
        const mockData = generateMockProducts(MOCK_DATA_COUNT);
        setProducts(mockData);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
      }
    } catch (e) {
      console.error('Erro ao carregar produtos', e);
      setProducts(generateMockProducts(MOCK_DATA_COUNT));
    }
  };
  
  useFocusEffect(useCallback(() => { loadProducts(); }, []));

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'history'>, id?: string) => {
    let updatedProducts: Product[] = [];
    if (id) {
      updatedProducts = products.map(p => (p.id === id ? { ...p, ...productData } : p));
    } else {
      const newProduct: Product = { id: Date.now().toString(), ...productData, history: [] };
      updatedProducts = [...products, newProduct];
    }
    setProducts(updatedProducts);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
    setIsModalVisible(false);
  };
  
  const handleDeleteProduct = async (id: string) => {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProducts));
  };
  
  const handleSort = (key: 'name' | 'quantity' | 'expirationDate') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const expiringSoonProducts = useMemo(() => {
    return products.filter(p => getExpirationStatus(p.expirationDate) === 'expiring_soon');
  }, [products]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((total, p) => total + (p.price || 0) * p.quantity, 0);
  }, [products]);

  const categories = useMemo(() => {
    const cats = products.map(p => p.category).filter(Boolean);
    return ['Todos', ...Array.from(new Set(cats as string[]))];
  }, [products]);
  
  const processedProducts = useMemo(() => {
    let tempProducts = [...products];
    tempProducts.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Product];
        const bValue = b[sortConfig.key as keyof Product];
        if (aValue === undefined || aValue === null) return 1;
        if (bValue === undefined || bValue === null) return -1;
        let comparison = 0;
        switch (sortConfig.key) {
          case 'quantity':
            comparison = (aValue as number) - (bValue as number); break;
          case 'expirationDate':
            comparison = parseDate(aValue as string).getTime() - parseDate(bValue as string).getTime(); break;
          default:
            comparison = String(aValue).localeCompare(String(bValue));
        }
        return sortConfig.direction === 'asc' ? comparison : -comparison;
    });
    if (activeCategory && activeCategory !== 'Todos') {
        tempProducts = tempProducts.filter(p => p.category === activeCategory);
    }
    if (searchQuery) {
        tempProducts = tempProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return tempProducts;
  }, [products, sortConfig, activeCategory, searchQuery]);
  
  const renderGridItem = ({ item }: { item: Product }) => {
    const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold;
    const status = getExpirationStatus(item.expirationDate);
    const cardStyle = [styles.productCard, isLowStock ? styles.lowStockWarning : null];
    
    return (
      <Pressable style={cardStyle} onPress={() => { setEditingProduct(item); setIsModalVisible(true); }}>
        <TouchableOpacity style={styles.deleteIconContainer} onPress={() => handleDeleteProduct(item.id)}><Text style={styles.deleteButton}>❌</Text></TouchableOpacity>
        {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.productImage_grid} /> : <View style={styles.imagePlaceholder_grid}><Text style={styles.placeholderText}>SEM FOTO</Text></View>}
        <View style={styles.infoContainer_grid}>
          <Text style={styles.productName_grid} numberOfLines={2}>{item.name}</Text>
          <Text style={styles.productQuantity_grid}>Qtd: {item.quantity}</Text>
          {item.price && <Text style={styles.productPrice_grid}>{formatCurrency(item.price)}</Text>}
          {item.expirationDate && (
             <Text style={[styles.expirationBase, status === 'ok' && styles.expiration_ok, status === 'expiring_soon' && styles.expiration_expiring_soon, status === 'expired' && styles.expiration_expired]}>
              Val: {item.expirationDate}
            </Text>
          )}
        </View>
      </Pressable>
    );
  };
  
  const renderListItem = ({ item }: { item: Product }) => {
    const isLowStock = item.lowStockThreshold && item.quantity <= item.lowStockThreshold;
    const status = getExpirationStatus(item.expirationDate);
    const itemStyle = [styles.productListItem, isLowStock ? styles.lowStockWarning : null];

    return (
      <Pressable style={itemStyle} onPress={() => { setEditingProduct(item); setIsModalVisible(true); }}>
        {item.imageUri ? <Image source={{ uri: item.imageUri }} style={styles.productImage_list} /> : <View style={styles.imagePlaceholder_list}><Text style={styles.placeholderText}>SEM FOTO</Text></View>}
        <View style={styles.infoContainer_list}>
          <Text style={styles.productName_list} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.productQuantity_list}>Qtd: {item.quantity}</Text>
          {item.price && <Text style={styles.productPrice_list}>{formatCurrency(item.price)}</Text>}
        </View>
        <View style={styles.rightContainer_list}>
          {item.expirationDate && (
            <Text style={[styles.expirationBase, status === 'ok' && styles.expiration_ok, status === 'expiring_soon' && styles.expiration_expiring_soon, status === 'expired' && styles.expiration_expired]}>
              Val: {item.expirationDate}
            </Text>
          )}
          <TouchableOpacity onPress={() => handleDeleteProduct(item.id)}><Text style={styles.deleteButton_list}>❌</Text></TouchableOpacity>
        </View>
      </Pressable>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.topHeader}>
            <Image source={require('../assets/logo.png')} style={styles.logo} />
            <Text style={styles.bakeryName}>Padaria Nova Vista</Text>
            <TouchableOpacity style={styles.notificationButton} onPress={() => setIsExpirationModalVisible(true)}>
                <Ionicons name="notifications-outline" size={28} color="#333" />
                {expiringSoonProducts.length > 0 && (
                    <View style={styles.notificationBadge}>
                        <Text style={styles.notificationBadgeText}>{expiringSoonProducts.length}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>

        <View style={styles.content}>
            <View style={styles.headerContainer}>
                <TextInput style={styles.searchBar} placeholder="Buscar produto..." onChangeText={setSearchQuery} />
                <TouchableOpacity style={styles.viewModeButton} onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                    <Ionicons name={viewMode === 'grid' ? "list" : "grid"} size={24} color="white" />
                </TouchableOpacity>
            </View>
            <View style={styles.sortContainer}>
                <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('name')}><Text style={styles.sortButtonText}>Nome {sortConfig.key === 'name' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('quantity')}><Text style={styles.sortButtonText}>Qtd {sortConfig.key === 'quantity' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</Text></TouchableOpacity>
                <TouchableOpacity style={styles.sortButton} onPress={() => handleSort('expirationDate')}><Text style={styles.sortButtonText}>Validade {sortConfig.key === 'expirationDate' ? (sortConfig.direction === 'asc' ? '▲' : '▼') : ''}</Text></TouchableOpacity>
            </View>
            <View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryContainer}>
                    {categories.map(cat => (
                        <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)} style={[styles.categoryButton, activeCategory === cat && styles.categoryActive]}>
                            <Text style={[styles.categoryText, activeCategory === cat && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
            <View style={styles.reportBar}>
                <Text style={styles.reportText}>Valor Total em Estoque: </Text>
                <Text style={styles.reportValue}>{formatCurrency(totalInventoryValue)}</Text>
            </View>
            <FlatList
                key={viewMode}
                data={processedProducts}
                renderItem={viewMode === 'grid' ? renderGridItem : renderListItem}
                keyExtractor={item => item.id}
                numColumns={viewMode === 'grid' ? 2 : 1}
                ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto encontrado.</Text>}
                contentContainerStyle={{ paddingBottom: 220 }}
            />
        </View>

        <TouchableOpacity style={styles.fabExport} onPress={() => exportProductsToCSV(products)}>
            <Ionicons name="share-social" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fabShopping} onPress={() => router.push('/shopping-list')}>
            <Ionicons name="list" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.fab} onPress={() => { setEditingProduct(null); setIsModalVisible(true); }}>
            <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
        
        <ProductModal 
            visible={isModalVisible} 
            onClose={() => setIsModalVisible(false)}
            onSubmit={handleSaveProduct}
            editingProduct={editingProduct}
        />

        <Modal
            animationType="slide"
            transparent={true}
            visible={isExpirationModalVisible}
            onRequestClose={() => setIsExpirationModalVisible(false)}
        >
            <Pressable style={styles.modalContainer} onPress={() => setIsExpirationModalVisible(false)}>
                <Pressable style={styles.modalContentSmall} onPress={() => {}}>
                    <Text style={styles.modalTitle}>Vencimento Próximo</Text>
                    <FlatList
                        data={expiringSoonProducts}
                        keyExtractor={item => item.id}
                        renderItem={({ item }) => (
                            <View style={styles.expiringItem}>
                                <Text style={styles.expiringItemName}>{item.name}</Text>
                                <Text style={styles.expiringItemDate}>Val: {item.expirationDate}</Text>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum produto para vencer no próximo mês.</Text>}
                    />
                    <View style={{marginTop: 15}}><Button title="Fechar" onPress={() => setIsExpirationModalVisible(false)} /></View>
                </Pressable>
            </Pressable>
        </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    content: { flex: 1, paddingHorizontal: 10 },
    emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
    placeholderText: { color: '#aaa', fontSize: 14, fontWeight: 'bold' },
    topHeader: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, paddingTop: 35, paddingBottom: 5, backgroundColor: '#f5f5f5' },
    logo: { width: 50, height: 50, borderRadius: 25 },
    bakeryName: { flex: 1, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#444' },
    notificationButton: { padding: 5, position: 'relative' },
    notificationBadge: { position: 'absolute', right: 0, top: 0, backgroundColor: 'red', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
    notificationBadgeText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    searchBar: { flex: 1, height: 45, backgroundColor: '#fff', borderRadius: 25, paddingHorizontal: 20, fontSize: 16, borderWidth: 1, borderColor: '#ddd' },
    viewModeButton: { marginLeft: 10, width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#0275d8', justifyContent: 'center', alignItems: 'center' },
    sortContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 10 },
    sortButton: { padding: 8 },
    sortButtonText: { fontSize: 16, color: '#0275d8' },
    categoryContainer: { paddingBottom: 10 },
    categoryButton: { paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#fff', borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#ddd' },
    categoryActive: { backgroundColor: '#0275d8', borderWidth: 1, borderColor: '#0275d8' },
    categoryText: { color: '#0275d8' },
    categoryTextActive: { color: '#fff', fontWeight: 'bold' },
    reportBar: { padding: 10, backgroundColor: '#e9ecef', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginBottom: 10 },
    reportText: { fontSize: 16, color: '#495057' },
    reportValue: { fontSize: 16, fontWeight: 'bold', color: '#000' },
    fab: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#0275d8', alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, elevation: 8 },
    fabIcon: { fontSize: 30, color: 'white' },
    fabShopping: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: '#28a745', alignItems: 'center', justifyContent: 'center', right: 25, bottom: 90, elevation: 6 },
    fabExport: { position: 'absolute', width: 50, height: 50, borderRadius: 25, backgroundColor: '#5bc0de', alignItems: 'center', justifyContent: 'center', right: 25, bottom: 150, elevation: 6 },
    deleteButton: { fontSize: 16 },
    deleteIconContainer: { position: 'absolute', top: 5, right: 5, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 10, padding: 2 },
    productCard: { backgroundColor: 'white', borderRadius: 8, padding: 10, margin: 5, flex: 1, elevation: 3, position: 'relative', borderWidth: 2, borderColor: 'transparent' },
    imagePlaceholder_grid: { width: '100%', height: 100, backgroundColor: '#eee', borderRadius: 6, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
    productImage_grid: { width: '100%', height: 100, borderRadius: 6, marginBottom: 8 },
    infoContainer_grid: { alignItems: 'center', width: '100%', marginTop: 5 },
    productName_grid: { fontSize: 16, fontWeight: '600', color: '#444', textAlign: 'center' },
    productQuantity_grid: { fontSize: 14, color: '#666', marginTop: 4 },
    productPrice_grid: { fontSize: 15, fontWeight: 'bold', color: '#0275d8', marginTop: 6 },
    productListItem: { flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 8, marginBottom: 10, alignItems: 'center', elevation: 2, minHeight: 80, borderWidth: 2, borderColor: 'transparent' },
    imagePlaceholder_list: { width: 60, height: 60, backgroundColor: '#eee', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
    productImage_list: { width: 60, height: 60, borderRadius: 6 },
    infoContainer_list: { flex: 1, marginLeft: 15, justifyContent: 'center' },
    productName_list: { fontSize: 18, fontWeight: 'bold', color: '#333' },
    productQuantity_list: { fontSize: 14, color: '#666' },
    productPrice_list: { fontSize: 15, color: '#0275d8', marginTop: 4 },
    rightContainer_list: { alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 60 },
    deleteButton_list: { fontSize: 20 },
    lowStockWarning: { borderColor: '#f0ad4e', borderWidth: 2 },
     expirationBase: { 
        borderRadius: 4, 
        fontWeight: 'bold', 
        overflow: 'hidden', 
        paddingHorizontal: 5, 
        paddingVertical: 2, 
        marginTop: 4, 
        // ANTES:
        // alignSelf: 'flex-start', 
        // DEPOIS:
        alignSelf: 'center', // <<-- MUDE AQUI
        fontSize: 12 
    },
    expiration_ok: { color: 'white', backgroundColor: '#3ebf5c' },
    expiration_expiring_soon: { color: '#333', backgroundColor: '#f0ad4e' },
    expiration_expired: { color: 'white', backgroundColor: '#d9534f' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContentSmall: { width: '90%', maxHeight: '60%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    expiringItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
    expiringItemName: { fontSize: 16 },
    expiringItemDate: { fontSize: 16, color: '#f0ad4e', fontWeight: 'bold' }
});
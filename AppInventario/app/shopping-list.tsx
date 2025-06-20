// app/shopping-list.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';

const STORAGE_KEY = '@inventory_app:products';

export default function ShoppingListScreen() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const loadData = useCallback(async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      const productsFromStorage = jsonValue != null ? JSON.parse(jsonValue) : [];
      setAllProducts(productsFromStorage);
    } catch (e) {
      console.error('Failed to load shopping list data from storage', e);
      Alert.alert("Erro", "Não foi possível carregar os dados da lista de compras.");
      // Ensure a stable state in case of error
      setAllProducts([]);
      setCheckedItems({});
    }
  }, []);

   useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        try {
          const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
          setAllProducts(jsonValue != null ? JSON.parse(jsonValue) : []);
        } catch (e) {
          console.error("Erro ao carregar produtos na lista de compras", e);
        }
      };

      fetchData();
    }, [])
  );
  
  const shoppingList = useMemo(() => {
    return allProducts.filter(p => p.lowStockThreshold && p.quantity <= p.lowStockThreshold);
  }, [allProducts]);

  const toggleCheckItem = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCompletePurchase = () => {
    Alert.alert(
      "Função Futura", 
      "Esta funcionalidade permitirá registrar os itens comprados no estoque. Os itens marcados seriam processados."
    );
  }

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity onPress={() => toggleCheckItem(item.id)} style={styles.checkbox}>
        <Ionicons name={checkedItems[item.id] ? "checkbox" : "square-outline"} size={24} color="#0275d8" />
      </TouchableOpacity>
      <Text style={[styles.itemName, checkedItems[item.id] && styles.itemChecked]}>{item.name}</Text>
      <Text style={styles.itemDetails}>(Atual: {item.quantity} | Mín: {item.lowStockThreshold})</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={shoppingList}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum item com estoque baixo ou lista de compras vazia.</Text>}
        contentContainerStyle={styles.listContentContainer}
      />
      {shoppingList.length > 0 && (
        <TouchableOpacity style={styles.fab} onPress={handleCompletePurchase}>
          <Ionicons name="cart" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f5f5f5' },
  listContentContainer: { 
    paddingBottom: 80, // Prevents FAB from overlapping the last item
  },
  itemContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 8, elevation: 2 },
  checkbox: { marginRight: 15 },
  itemName: { fontSize: 18, flex: 1, color: '#333' },
  itemChecked: { textDecorationLine: 'line-through', color: '#999' },
  itemDetails: { fontSize: 14, color: '#d9534f' },
  emptyText: { textAlign: 'center', marginTop: 50, fontSize: 16, color: '#888' },
  fab: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: '#28a745', alignItems: 'center', justifyContent: 'center', right: 20, bottom: 20, elevation: 8 },
});
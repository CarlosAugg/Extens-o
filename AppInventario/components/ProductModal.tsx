// components/ProductModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Pressable, Image, ScrollView, Alert, Platform, TouchableOpacity } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Product } from '../types';

interface ProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<Product, 'id' | 'history'>, id?: string) => void;
  editingProduct: Product | null;
}

const formatDateInput = (text: string) => {
  const cleaned = text.replace(/[^0-9]/g, '');
  if (cleaned.length > 4) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}/${cleaned.slice(4, 8)}`;
  } else if (cleaned.length > 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2)}`;
  }
  return cleaned;
};

export const ProductModal = ({ visible, onClose, onSubmit, editingProduct }: ProductModalProps) => {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [price, setPrice] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [category, setCategory] = useState('');
  const [lowStockThreshold, setLowStockThreshold] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setProductName(editingProduct.name);
      setQuantity(editingProduct.quantity.toString());
      setImageUri(editingProduct.imageUri);
      setPrice(editingProduct.price?.toString().replace('.', ',') || '');
      setExpirationDate(editingProduct.expirationDate || '');
      setCategory(editingProduct.category || '');
      setLowStockThreshold(editingProduct.lowStockThreshold?.toString() || '');
    } else {
      setProductName('');
      setQuantity('');
      setImageUri(undefined);
      setPrice('');
      setExpirationDate('');
      setCategory('');
      setLowStockThreshold('');
    }
  }, [editingProduct, visible]);
  
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "Você precisa permitir o acesso à galeria de fotos!");
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (productName.trim() === '' || quantity.trim() === '') {
      Alert.alert('Erro', 'Preencha ao menos o nome e a quantidade do produto.');
      return;
    }
    const productData = {
      name: productName.trim(),
      quantity: parseInt(quantity) || 0,
      price: parseFloat(price.replace(',', '.')) || undefined,
      expirationDate: expirationDate.trim() || undefined,
      imageUri: imageUri,
      category: category.trim() || undefined,
      lowStockThreshold: parseInt(lowStockThreshold) || undefined,
    };
    onSubmit(productData, editingProduct?.id);
  };

  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.modalContainer} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={() => {}}>
          <ScrollView>
            <Text style={styles.modalTitle}>{editingProduct ? 'Editar Produto' : 'Adicionar Produto'}</Text>
            
            <TouchableOpacity onPress={pickImage}>
                {imageUri ? <Image source={{ uri: imageUri }} style={styles.imagePreview} /> : <View style={styles.imagePreview}><Text style={styles.placeholderText}>ESCOLHER FOTO</Text></View>}
            </TouchableOpacity>

            <TextInput style={styles.input} placeholder="Nome do Produto" value={productName} onChangeText={setProductName} />
            <TextInput style={styles.input} placeholder="Quantidade" value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Preço (ex: 12,50)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
            <TextInput style={styles.input} placeholder="Validade (DD/MM/AAAA)" value={expirationDate} onChangeText={(text) => setExpirationDate(formatDateInput(text))} keyboardType="number-pad" maxLength={10} />
            <TextInput style={styles.input} placeholder="Categoria" value={category} onChangeText={setCategory} />
            <TextInput style={styles.input} placeholder="Alerta de Estoque Baixo (Qtd Mínima)" value={lowStockThreshold} onChangeText={setLowStockThreshold} keyboardType="numeric" />
            
            <View style={styles.modalButtonContainer}>
              <Button title="Cancelar" onPress={onClose} color="#888" />
              <Button title={editingProduct ? 'Atualizar' : 'Salvar'} onPress={handleSubmit} />
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { width: '90%', maxHeight: '85%', backgroundColor: 'white', borderRadius: 10, padding: 20, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 5, marginBottom: 15, fontSize: 16 },
  modalButtonContainer: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 10 },
   imagePreview: { 
        width: 120, 
        height: 120, 
        borderRadius: 60, 
        marginBottom: 20, 
        alignSelf: 'center', 
        borderColor: '#ddd', 
        borderWidth: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: '#eee' 
    },
   placeholderText: { 
        color: '#aaa', 
        fontSize: 14, 
        fontWeight: 'bold',
        // ANTES: (não tinha essa linha)
        // DEPOIS:
        textAlign: 'center' // <<-- ADICIONE ESTA LINHA
    },
});
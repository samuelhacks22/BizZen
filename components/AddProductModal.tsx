import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';

interface AddProductModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (product: { name: string; price: number; stock: number; category: string }) => void;
  initialProduct?: { name: string; price: number; stock: number; category: string } | null;
}

export function AddProductModal({ visible, onClose, onSave, initialProduct }: AddProductModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');

  // Update state when initialProduct changes
  React.useEffect(() => {
    if (initialProduct) {
        setName(initialProduct.name);
        setPrice(initialProduct.price.toString());
        setStock(initialProduct.stock.toString());
        setCategory(initialProduct.category);
    } else {
        setName('');
        setPrice('');
        setStock('');
        setCategory('');
    }
  }, [initialProduct, visible]);

  const handleSave = () => {
    if (!name || !price || !stock) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    onSave({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      category: category || 'General',
    });
    
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <GlassCard className="w-11/12 max-w-md p-0" intensity={90}>
            <View className="p-4">
                <Text className="text-white text-xl font-bold mb-4">{initialProduct ? 'Edit Product' : 'Add New Product'}</Text>
                
                <Text className="text-gray-300 mb-1">Product Name</Text>
                <TextInput 
                    className="bg-white/10 text-white p-3 rounded-lg mb-3 border border-white/20"
                    placeholder="e.g. Wireless Mouse"
                    placeholderTextColor="#9ca3af"
                    value={name}
                    onChangeText={setName}
                />

                <View className="flex-row justify-between mb-3">
                    <View className="flex-1 mr-2">
                        <Text className="text-gray-300 mb-1">Price ($)</Text>
                        <TextInput 
                            className="bg-white/10 text-white p-3 rounded-lg border border-white/20"
                            placeholder="0.00"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={price}
                            onChangeText={setPrice}
                        />
                    </View>
                    <View className="flex-1 ml-2">
                        <Text className="text-gray-300 mb-1">Stock</Text>
                        <TextInput 
                            className="bg-white/10 text-white p-3 rounded-lg border border-white/20"
                            placeholder="0"
                            placeholderTextColor="#9ca3af"
                            keyboardType="numeric"
                            value={stock}
                            onChangeText={setStock}
                        />
                    </View>
                </View>

                <Text className="text-gray-300 mb-1">Category</Text>
                <TextInput 
                    className="bg-white/10 text-white p-3 rounded-lg mb-6 border border-white/20"
                    placeholder="e.g. Electronics"
                    placeholderTextColor="#9ca3af"
                    value={category}
                    onChangeText={setCategory}
                />

                <View className="flex-row justify-end space-x-3">
                    <TouchableOpacity 
                        onPress={onClose}
                        className="py-3 px-6 rounded-lg bg-gray-600"
                    >
                        <Text className="text-white font-bold">Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleSave}
                        className="py-3 px-6 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/50"
                    >
                        <Text className="text-white font-bold">Save Product</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

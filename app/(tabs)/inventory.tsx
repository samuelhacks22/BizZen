import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category: string;
};

export default function Inventory() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<Product[]>([]);

  const loadProducts = async () => {
    const result = await db.getAllAsync<Product>('SELECT * FROM products');
    setProducts(result);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <GlassCard className="mb-3 mx-4" intensity={30}>
      <View className="flex-row justify-between items-center">
        <View className="flex-1">
          <Text className="text-white text-lg font-bold">{item.name}</Text>
          <Text className="text-cyan-300 text-sm">{item.category}</Text>
        </View>
        <View className="items-end">
          <Text className="text-green-400 font-bold text-xl">${item.price}</Text>
          <Text className="text-gray-400 text-xs">Stock: {item.stock}</Text>
        </View>
      </View>
    </GlassCard>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#0f172a', '#3f1a39']} // Purple tint
        className="absolute w-full h-full"
      />
      <View className="pt-12 px-6 pb-4 flex-row justify-between items-center">
        <Text className="text-white text-3xl font-bold">Inventory</Text>
        <TouchableOpacity 
          className="bg-cyan-500 p-3 rounded-full shadow-lg shadow-cyan-500/50"
          onPress={loadProducts} // Reload for demo
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

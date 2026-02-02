import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { AddProductModal } from '../../components/AddProductModal';
import { ToastNotification, ToastRef } from '../../components/ToastNotification';

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
  const [modalVisible, setModalVisible] = useState(false);
  const toastRef = useRef<ToastRef>(null);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadProducts = async () => {
    try {
        const result = await db.getAllAsync<Product>('SELECT * FROM products ORDER BY id DESC');
        setProducts(result);
    } catch (e) {
        console.error("Failed to load products", e);
    }
  };

  const handleSaveProduct = async (productData: { name: string; price: number; stock: number; category: string }) => {
    if (editingProduct) {
        // Update
        try {
            await db.runAsync(
                'UPDATE products SET name = ?, price = ?, stock = ?, category = ? WHERE id = ?',
                productData.name, productData.price, productData.stock, productData.category, editingProduct.id
            );
            loadProducts();
            setEditingProduct(null);
            toastRef.current?.show("¡Producto Actualizado!", "success");
        } catch (e) {
             Alert.alert("Error", "Error al actualizar producto");
        }
    } else {
        // Create
        try {
            await db.runAsync(
                'INSERT INTO products (name, price, stock, category) VALUES (?, ?, ?, ?)',
                productData.name, productData.price, productData.stock, productData.category
            );
            loadProducts();
            toastRef.current?.show("¡Producto Agregado!", "success");
        } catch (e) {
            Alert.alert("Error", "Error al agregar producto");
            console.error(e);
        }
    }
  };

  const deleteProduct = async (id: number) => {
     try {
        await db.runAsync('DELETE FROM products WHERE id = ?', id);
        loadProducts();
        toastRef.current?.show("Producto Eliminado", "error");
     } catch (e) {
        Alert.alert("Error", "Error al eliminar producto");
     }
  };

  const showOptions = (product: Product) => {
    Alert.alert(
        product.name,
        "Elige una acción",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Editar", 
                onPress: () => {
                    setEditingProduct(product);
                    setModalVisible(true);
                } 
            },
            { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: () => {
                    Alert.alert("Confirmar Eliminación", "¿Estás seguro?", [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Eliminar", style: "destructive", onPress: () => deleteProduct(product.id) }
                    ])
                } 
            }
        ]
    );
  };

  const sellProduct = async (product: Product) => {
    if (product.stock <= 0) {
        Alert.alert("Sin Stock", "No se puede vender este ítem.");
        return;
    }

    try {
        await db.withTransactionAsync(async () => {
            await db.runAsync('UPDATE products SET stock = stock - 1 WHERE id = ?', product.id);
            await db.runAsync(
                'INSERT INTO transactions (type, amount, date, note) VALUES (?, ?, ?, ?)',
                'SALE', product.price, new Date().toISOString(), `Vendido ${product.name}`
            );
        });
        loadProducts();
        toastRef.current?.show(`¡Vendido 1 ${product.name}!`, "xp");
    } catch (e) {
        console.error("Sell transaction failed", e);
        Alert.alert("Error", "Transacción fallida");
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const renderItem = ({ item }: { item: Product }) => (
    <TouchableOpacity onLongPress={() => showOptions(item)} activeOpacity={0.9}>
        <GlassCard className="mb-3 mx-4" intensity={30}>
        <View className="flex-row justify-between items-center">
            <View className="flex-1">
            <Text className="text-white text-lg font-bold">{item.name}</Text>
            <Text className="text-cyan-300 text-sm">{item.category}</Text>
            </View>
            <View className="items-end mr-3">
            <Text className="text-green-400 font-bold text-xl">${item.price.toFixed(2)}</Text>
            <Text className={`text-xs ${item.stock < 5 ? 'text-red-400 font-bold' : 'text-gray-400'}`}>
                Stock: {item.stock}
            </Text>
            </View>
            <TouchableOpacity 
                onPress={() => sellProduct(item)}
                className="bg-green-600/80 p-2 rounded-full"
            >
                <Ionicons name="cart-outline" size={20} color="white" />
            </TouchableOpacity>
        </View>
        </GlassCard>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-900">
      <ToastNotification ref={toastRef} />
      <LinearGradient
        colors={['#0f172a', '#3f1a39']} // Purple tint
        className="absolute w-full h-full"
      />
      <View className="pt-12 px-6 pb-4 flex-row justify-between items-center">
        <Text className="text-white text-3xl font-bold">Inventario</Text>
        <TouchableOpacity 
          className="bg-cyan-500 p-3 rounded-full shadow-lg shadow-cyan-500/50"
          onPress={() => {
            setEditingProduct(null);
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">Aún no hay productos. ¡Agrega uno!</Text>
        }
      />

      <AddProductModal 
        visible={modalVisible}
        onClose={() => {
            setModalVisible(false);
            setEditingProduct(null);
        }}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />
    </View>
  );
}

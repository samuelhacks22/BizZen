import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { AddAssetModal } from '../../components/AddAssetModal';
import { ToastNotification, ToastRef } from '../../components/ToastNotification';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Asset = {
  id: number;
  name: string;
  asset_tag: string;
  category: string;
  location: string;
  serial_number: string;
  cost: number;
  status: string; // 'Active', 'In Repair', 'Disposed'
};

export default function Inventory() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const toastRef = useRef<ToastRef>(null);

  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  const loadAssets = useCallback(async () => {
    try {
        const result = await db.getAllAsync<Asset>('SELECT * FROM assets ORDER BY id DESC');
        setAssets(result);
        setFilteredAssets(result);
    } catch (e) {
        console.error("Failed to load assets", e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
        loadAssets();
    }, [loadAssets])
  );

  useEffect(() => {
    const lowerText = searchQuery.toLowerCase();
    const filtered = assets.filter(asset => 
        asset.name.toLowerCase().includes(lowerText) || 
        asset.asset_tag?.toLowerCase().includes(lowerText) ||
        asset.location?.toLowerCase().includes(lowerText)
    );
    setFilteredAssets(filtered);
  }, [searchQuery, assets]);

  const handleSaveAsset = async (assetData: Omit<Asset, 'id'> & { id?: number }) => {
    if (assetData.id) {
        // Update
        try {
            await db.runAsync(
                'UPDATE assets SET name = ?, asset_tag = ?, category = ?, location = ?, serial_number = ?, cost = ?, status = ? WHERE id = ?',
                assetData.name, assetData.asset_tag, assetData.category, assetData.location, assetData.serial_number, assetData.cost, assetData.status, assetData.id
            );
            loadAssets();
            setEditingAsset(null);
            toastRef.current?.show("¡Activo Actualizado!", "success");
        } catch (e) {
             Alert.alert("Error", "Error al actualizar activo");
             console.error(e);
        }
    } else {
        // Create
        try {
            await db.runAsync(
                'INSERT INTO assets (name, asset_tag, category, location, serial_number, cost, status, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                assetData.name, assetData.asset_tag, assetData.category, assetData.location, assetData.serial_number, assetData.cost, assetData.status, new Date().toISOString()
            );
            loadAssets();
            toastRef.current?.show("¡Activo Registrado!", "success");
        } catch (e) {
            Alert.alert("Error", "Error al agregar activo");
            console.error(e);
        }
    }
  };

  const deleteAsset = async (id: number) => {
     try {
        await db.runAsync('DELETE FROM assets WHERE id = ?', id);
        loadAssets();
        toastRef.current?.show("Activo Eliminado", "error");
     } catch (e) {
        Alert.alert("Error", "Error al eliminar activo");
     }
  };

  const showOptions = (asset: Asset) => {
    Alert.alert(
        `${asset.name} (${asset.asset_tag})`,
        "Elige una acción",
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Editar", 
                onPress: () => {
                    setEditingAsset(asset);
                    setModalVisible(true);
                } 
            },
            { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: () => {
                    Alert.alert("Confirmar Eliminación", "¿Estás seguro?", [
                        { text: "Cancelar", style: "cancel" },
                        { text: "Eliminar", style: "destructive", onPress: () => deleteAsset(asset.id) }
                    ])
                } 
            }
        ]
    );
  };


  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'bg-green-500';
          case 'In Repair': return 'bg-yellow-500';
          case 'Disposed': return 'bg-red-500';
          default: return 'bg-gray-500';
      }
  };

   const getStatusText = (status: string) => {
      switch(status) {
          case 'Active': return 'Activo';
          case 'In Repair': return 'En Reparación';
          case 'Disposed': return 'Eliminado';
          default: return status;
      }
  };

  const renderItem = ({ item, index }: { item: Asset, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity 
          onPress={() => router.push(`/asset/${item.id}`)}
          onLongPress={() => showOptions(item)} 
          activeOpacity={0.9}
      >
          <GlassCard className="mb-4 mx-4" intensity={20}>
              <View className="flex-row justify-between items-start">
                  <View className="flex-1 mr-2">
                      <Text className="text-white text-lg font-bold mb-1">{item.name}</Text>
                      <View className="flex-row flex-wrap gap-2 mb-2">
                          <View className="bg-white/10 px-2 py-0.5 rounded-md">
                              <Text className="text-neon-cyan text-xs font-medium">{item.category}</Text>
                          </View>
                          <View className="bg-white/10 px-2 py-0.5 rounded-md">
                              <Text className="text-gray-300 text-xs">{item.asset_tag}</Text>
                          </View>
                      </View>
                      
                       <View className="flex-row items-center mt-1">
                           <Ionicons name="location-outline" size={14} color="#9ca3af" />
                           <Text className="text-gray-400 text-xs ml-1">{item.location}</Text>
                       </View>
                  </View>

                  <View className="items-end">
                      <Text className="text-white font-bold text-xl mb-2">${item.cost.toFixed(2)}</Text>
                      <View className={`px-2 py-1 rounded-lg bg-black/40 border border-white/5 flex-row items-center gap-1`}>
                           <View className={`w-2 h-2 rounded-full ${getStatusColor(item.status)}`} />
                           <Text className="text-gray-300 text-xs font-medium">{getStatusText(item.status)}</Text>
                      </View>
                  </View>
              </View>
          </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <ToastNotification ref={toastRef} />
      
      <View className="pt-6 px-4 pb-4">
          <View className="flex-row justify-between items-center mb-6">
            <View>
                <Text className="text-neon-purple font-bold tracking-widest text-xs uppercase mb-1">GESTIÓN</Text>
                <Text className="text-white text-3xl font-black">Mis Activos</Text>
            </View>
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => {
                    setEditingAsset(null);
                    setModalVisible(true);
                }}
            >
                <LinearGradient
                    colors={['#22d3ee', '#3b82f6']}
                    className="w-12 h-12 rounded-full items-center justify-center shadow-lg shadow-neon-cyan/50"
                >
                    <Ionicons name="add" size={28} color="white" />
                </LinearGradient>
            </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <GlassCard intensity={30} className="flex-row items-center px-4 py-3 mb-2" gradientBorder={false}>
            <Ionicons name="search" size={20} color="#22d3ee" />
            <TextInput 
                className="flex-1 text-white ml-3 font-medium"
                placeholder="Buscar activo..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
            )}
        </GlassCard>
      </View>

      <FlatList
        data={filteredAssets}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
            <View className="items-center justify-center mt-20 opacity-50">
                <Ionicons name="cube-outline" size={80} color="#22d3ee" />
                <Text className="text-white text-lg font-bold mt-4">
                    {searchQuery ? 'Sin resultados' : 'No hay activos'}
                </Text>
                <Text className="text-gray-400 text-center mt-2 px-10">
                    {searchQuery ? 'Intenta con otro término de búsqueda' : 'Toca el botón + para registrar tu primer activo'}
                </Text>
            </View>
        }
      />

      <AddAssetModal 
        visible={modalVisible}
        onClose={() => {
            setModalVisible(false);
            setEditingAsset(null);
        }}
        onSave={handleSaveAsset}
        initialAsset={editingAsset}
      />
    </ScreenWrapper>
  );
}

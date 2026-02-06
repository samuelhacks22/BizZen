import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { AddAssetModal } from '../../components/AddAssetModal';
import { ToastNotification, ToastRef } from '../../components/ToastNotification';
import { useRouter } from 'expo-router';

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

  const loadAssets = async () => {
    try {
        const result = await db.getAllAsync<Asset>('SELECT * FROM assets ORDER BY id DESC');
        setAssets(result);
        setFilteredAssets(result);
    } catch (e) {
        console.error("Failed to load assets", e);
    }
  };

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

  useEffect(() => {
    loadAssets();
  }, []);

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'Active': return 'text-green-400';
          case 'In Repair': return 'text-yellow-400';
          case 'Disposed': return 'text-red-400';
          default: return 'text-gray-400';
      }
  };

  const renderItem = ({ item }: { item: Asset }) => (
    <TouchableOpacity 
        onPress={() => router.push(`/asset/${item.id}`)}
        onLongPress={() => showOptions(item)} 
        activeOpacity={0.9}
    >
        <GlassCard className="mb-3 mx-4" intensity={30}>
            <View className="flex-row justify-between items-center">
                <View className="flex-1">
                    <Text className="text-white text-lg font-bold">{item.name}</Text>
                    <Text className="text-cyan-300 text-sm mb-1">{item.asset_tag} • {item.location}</Text>
                    <View className="flex-row items-center">
                         <View className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(item.status).replace('text-', 'bg-')}`} />
                         <Text className="text-gray-400 text-xs">{item.status}</Text>
                    </View>
                </View>
                <View className="items-end mr-1">
                    <Text className="text-white font-bold text-lg">${item.cost.toFixed(2)}</Text>
                    <Text className="text-gray-500 text-xs">{item.category}</Text>
                </View>
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
      <View className="pt-12 px-6 pb-4">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-white text-3xl font-bold">Activos</Text>
            <TouchableOpacity 
            className="bg-cyan-500 p-3 rounded-full shadow-lg shadow-cyan-500/50"
            onPress={() => {
                setEditingAsset(null);
                setModalVisible(true);
            }}
            >
            <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View className="bg-white/10 rounded-xl flex-row items-center px-3 py-2 border border-white/10 mb-2">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput 
                className="flex-1 text-white ml-2"
                placeholder="Buscar por tag, nombre o lugar..."
                placeholderTextColor="#9ca3af"
                value={searchQuery}
                onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#9ca3af" />
                </TouchableOpacity>
            )}
        </View>
      </View>

      <FlatList
        data={filteredAssets}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
            <Text className="text-gray-400 text-center mt-10">
                {searchQuery ? 'No se encontraron activos.' : 'No hay activos registrados.'}
            </Text>
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
    </View>
  );
}

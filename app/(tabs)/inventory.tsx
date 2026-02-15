import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { AddAssetModal } from '../../components/AddAssetModal';
import { ToastNotification, ToastRef } from '../../components/ToastNotification';
import { useRouter, useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTycoon } from '../../context/TycoonContext';
import * as Haptics from 'expo-haptics';

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
  const { addXP } = useTycoon();
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); // 'All', 'Active', 'In Repair', 'Disposed'
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
    const filtered = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(lowerText) || 
            asset.asset_tag?.toLowerCase().includes(lowerText) ||
            asset.location?.toLowerCase().includes(lowerText);
        const matchesFilter = activeFilter === 'All' || asset.status === activeFilter;
        return matchesSearch && matchesFilter;
    });
    setFilteredAssets(filtered);
  }, [searchQuery, activeFilter, assets]);

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
            await addXP(250); // XP gain for new asset
            toastRef.current?.show("¡Activo Registrado! +250 XP", "success");
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
    <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
          <GlassCard 
            className="border-white/5 bg-space-900/10 mb-4 mx-6" 
            intensity={20}
            isPressable={true}
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/asset/${item.id}`);
            }}
          >
              <View className="flex-row justify-between items-center">
                  <View className="flex-1 mr-4">
                      <Text className="text-white text-base font-black tracking-tight mb-2 uppercase">{item.name}</Text>
                      <View className="flex-row flex-wrap gap-2.5 mb-3">
                          <View className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                              <Text className="text-neon-cyan text-[8px] font-black uppercase tracking-[2px] opacity-80">{item.category}</Text>
                          </View>
                          <View className="bg-white/5 px-3 py-1 rounded-full border border-white/5">
                              <Text className="text-gray-500 text-[8px] font-black uppercase tracking-[2px]">{item.asset_tag}</Text>
                          </View>
                      </View>
                      
                       <View className="flex-row items-center">
                           <View className="w-1 h-1 rounded-full bg-white/10 mr-2.5" />
                           <Text className="text-gray-500 text-[9px] font-bold tracking-tight opacity-40">{item.location}</Text>
                       </View>
                  </View>

                  <View className="items-end">
                      <View className="bg-white/5 px-3 py-1.5 rounded-xl border border-white/5 mb-3">
                        <Text className="text-white font-black text-lg tracking-tightest">${item.cost.toLocaleString('en-US', { minimumFractionDigits: 0 })}</Text>
                      </View>
                      <View className={`px-3 py-1.5 rounded-xl bg-black/10 border border-white/5 flex-row items-center gap-2 shadow-sm`}>
                           <View className={`w-1.5 h-1.5 rounded-full ${getStatusColor(item.status)} opacity-60`} />
                           <Text className="text-gray-500 text-[7px] font-black uppercase tracking-[2px]">{getStatusText(item.status)}</Text>
                      </View>
                  </View>
              </View>
          </GlassCard>
    </Animated.View>
  );

  return (
    <ScreenWrapper>
      <ToastNotification ref={toastRef} />
      
      <View className="pt-12 px-8 pb-4">
          <View className="flex-row justify-between items-center mb-10">
            <View>
                <View className="flex-row items-center mb-2">
                    <View className="w-6 h-6 rounded-lg bg-white/5 items-center justify-center border border-white/10 mr-4 shadow-2xl overflow-hidden">
                        <Image 
                            source={require('../../assets/icon.png')} 
                            style={{ width: 14, height: 14 }}
                            resizeMode="contain"
                        />
                    </View>
                    <View className="h-[1px] w-6 bg-white/10 mr-4" />
                    <Text className="text-gray-500 font-bold tracking-[3px] text-[9px] uppercase">ASSET ECOSYSTEM</Text>
                </View>
                <Text className="text-white text-5xl font-black tracking-tightest">Inventario<Text className="text-neon-cyan opacity-60">.</Text></Text>
            </View>
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setEditingAsset(null);
                    setModalVisible(true);
                }}
                className="w-16 h-16 rounded-[28px] bg-space-900/40 items-center justify-center border border-white/10 shadow-2xl"
            >
                <LinearGradient
                    colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.02)']}
                    className="absolute w-full h-full rounded-[28px]"
                />
                <Ionicons name="add" size={32} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
        </View>

        {/* Status Filter Tabs */}
        <View className="flex-row gap-2 mb-6">
            {[
                { label: 'Todos', value: 'All' },
                { label: 'Activos', value: 'Active' },
                { label: 'Reparación', value: 'In Repair' }
            ].map((f) => (
                <TouchableOpacity
                    key={f.value}
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setActiveFilter(f.value);
                    }}
                    className={`px-5 py-2.5 rounded-2xl border ${activeFilter === f.value ? 'bg-neon-cyan/10 border-neon-cyan/30' : 'bg-white/5 border-white/5'}`}
                >
                    <Text className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === f.value ? 'text-neon-cyan' : 'text-gray-500'}`}>
                        {f.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>

        {/* Spatial Search Bar */}
        <View className="mb-6 relative">
            <View className="absolute inset-0 bg-white/5 blur-2xl rounded-full opacity-20" />
            <GlassCard intensity={30} className="flex-row items-center border-white/5" gradientBorder={false} parallax={true}>
                <Ionicons name="search" size={16} color="rgba(255,255,255,0.3)" />
                <TextInput 
                    className="flex-1 text-white ml-5 font-bold text-sm tracking-tight"
                    placeholder="Buscar en el ecosistema..."
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery('')} className="bg-white/5 p-2 rounded-xl">
                        <Ionicons name="close" size={14} color="rgba(255,255,255,0.5)" />
                    </TouchableOpacity>
                )}
            </GlassCard>
        </View>
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

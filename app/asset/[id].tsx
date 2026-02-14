import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { AddAssetModal } from '../../components/AddAssetModal';
import { ToastNotification, ToastRef } from '../../components/ToastNotification';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

type Asset = {
  id: number;
  name: string;
  asset_tag: string;
  category: string;
  location: string;
  serial_number: string;
  cost: number;
  status: string;
  purchase_date: string;
};

export default function AssetDetails() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const toastRef = useRef<ToastRef>(null);

  const loadAsset = useCallback(async () => {
    if (id) {
        try {
            const result = await db.getFirstAsync<Asset>('SELECT * FROM assets WHERE id = ?', id);
            setAsset(result);
        } catch (e) {
            console.error(e);
        }
    }
  }, [id, db]);

  useFocusEffect(
    useCallback(() => {
        loadAsset();
    }, [loadAsset])
  );

  if (!asset) {
    return (
        <ScreenWrapper>
             <View className="flex-1 justify-center items-center">
                <Text className="text-neon-cyan">Cargando...</Text>
            </View>
        </ScreenWrapper>
    );
  }

  // Depreciation Calculation (Straight-line 5 years)
  const purchaseDate = new Date(asset.purchase_date);
  const ageInYears = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const usefulLife = 5;
  const yearlyDepreciation = asset.cost / usefulLife;
  const currentValue = Math.max(0, asset.cost - (yearlyDepreciation * ageInYears));

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
        case 'In Repair': return 'Reparación';
        case 'Disposed': return 'Baja';
        default: return status;
    }
  };

  const handleSaveAsset = async (assetData: Omit<Asset, 'id'> & { id?: number }) => {
    try {
        await db.runAsync(
            'UPDATE assets SET name = ?, asset_tag = ?, category = ?, location = ?, serial_number = ?, cost = ?, status = ? WHERE id = ?',
            assetData.name, assetData.asset_tag, assetData.category, assetData.location, assetData.serial_number, assetData.cost, assetData.status, Number(id)
        );
        loadAsset();
        toastRef.current?.show("¡Activo Actualizado!", "success");
    } catch (e) {
         Alert.alert("Error", "Error al actualizar activo");
         console.error(e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
        "Eliminar Activo", 
        "¿Estás seguro de que deseas eliminar este activo permanentemente?", 
        [
            { text: "Cancelar", style: "cancel" },
            { 
                text: "Eliminar", 
                style: "destructive", 
                onPress: async () => {
                    await db.runAsync('DELETE FROM assets WHERE id = ?', id);
                    router.back();
                }
            }
        ]
    );
  };

  return (
    <ScreenWrapper>
      <ToastNotification ref={toastRef} />
      <View className="pt-6 px-6 flex-row items-center justify-between pb-6">
        <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-white/10 p-2 rounded-full border border-white/10"
        >
            <Ionicons name="chevron-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-black">Detalle</Text>
        <TouchableOpacity 
            onPress={() => setModalVisible(true)}
            className="bg-neon-cyan/10 p-2 rounded-full border border-neon-cyan/20"
        >
            <Ionicons name="create-outline" size={24} color="#22d3ee" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} className="px-4">
        
        {/* Header Card */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
            <GlassCard className="mb-6 p-6" intensity={40}>
                <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1">
                        <Text className="text-neon-cyan font-bold tracking-widest text-xs uppercase mb-1">{asset.asset_tag}</Text>
                        <Text className="text-white text-3xl font-black mb-1">{asset.name}</Text>
                        <View className="bg-white/10 self-start px-2 py-0.5 rounded-md">
                            <Text className="text-gray-400 text-xs font-medium uppercase tracking-tighter">{asset.category}</Text>
                        </View>
                    </View>
                    <View className={`px-4 py-1.5 rounded-full bg-black/40 border border-white/5 flex-row items-center gap-2`}>
                        <View className={`w-2 h-2 rounded-full ${getStatusColor(asset.status)} shadow-lg shadow-white/50`} />
                        <Text className="text-white text-[10px] font-black uppercase tracking-widest">{getStatusText(asset.status)}</Text>
                    </View>
                </View>
            </GlassCard>
        </Animated.View>

        {/* Info Grid */}
        <View className="flex-row gap-4 mb-6">
            <Animated.View entering={FadeInRight.delay(200).springify()} className="flex-1">
                <GlassCard className="p-4 items-center" intensity={20}>
                    <View className="bg-neon-purple/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                        <Ionicons name="location" size={20} color="#a855f7" />
                    </View>
                    <Text className="text-gray-500 text-[10px] font-black uppercase">Ubicación</Text>
                    <Text className="text-white font-bold text-center mt-1" numberOfLines={1}>{asset.location}</Text>
                </GlassCard>
            </Animated.View>
            <Animated.View entering={FadeInRight.delay(300).springify()} className="flex-1">
                <GlassCard className="p-4 items-center" intensity={20}>
                    <View className="bg-blue-500/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                        <Ionicons name="qr-code" size={20} color="#60a5fa" />
                    </View>
                    <Text className="text-gray-500 text-[10px] font-black uppercase">Serie</Text>
                    <Text className="text-white font-bold text-center mt-1" numberOfLines={1}>{asset.serial_number || 'S/N'}</Text>
                </GlassCard>
            </Animated.View>
        </View>

        {/* Financials & Depreciation */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
            <Text className="text-white/80 font-bold text-lg mb-4 ml-2">Valoración Económica</Text>
            <GlassCard className="mb-6 p-6" intensity={30}>
                <View className="flex-row justify-between mb-6 pb-6 border-b border-white/5">
                    <View>
                        <Text className="text-gray-500 text-xs font-black uppercase mb-1">Costo Original</Text>
                        <Text className="text-white text-2xl font-black">${asset.cost.toFixed(2)}</Text>
                    </View>
                    <View className="items-end">
                        <Text className="text-gray-500 text-xs font-black uppercase mb-1">Adquirido el</Text>
                        <Text className="text-white text-lg font-bold">{purchaseDate.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    </View>
                </View>
                
                <View>
                    <View className="flex-row items-center mb-2">
                        <Ionicons name="trending-up" size={16} color="#4ade80" className="mr-1" />
                        <Text className="text-green-500 text-xs font-black uppercase">Valor Actual Proyectado</Text>
                    </View>
                    <Text className="text-white text-5xl font-black tracking-tighter shadow-xl">
                        ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <View className="bg-white/5 rounded-2xl p-4 flex-row items-center">
                        <Ionicons name="information-circle-outline" size={18} color="#9ca3af" />
                        <Text className="text-gray-500 text-[10px] ml-3 flex-1">
                            Estimación basada en depreciación lineal a 5 años. El valor real puede variar según el mercado y uso.
                        </Text>
                    </View>
                </View>
            </GlassCard>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(500).springify()} className="pb-10">
            <NeonButton 
                variant="danger" 
                title="Eliminar Activo" 
                icon="trash-outline"
                onPress={handleDelete}
            />
        </Animated.View>

      </ScrollView>

      <AddAssetModal 
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data: any) => handleSaveAsset(data)}
        initialAsset={asset}
      />
    </ScreenWrapper>
  );
}

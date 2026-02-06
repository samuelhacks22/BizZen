import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ParticleBackground } from '../../components/ParticleBackground';

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

  useEffect(() => {
    if (id) {
        db.getFirstAsync<Asset>('SELECT * FROM assets WHERE id = ?', id)
          .then(setAsset)
          .catch(console.error);
    }
  }, [id]);

  if (!asset) {
    return (
        <View className="flex-1 bg-slate-900 justify-center items-center">
            <Text className="text-white">Cargando...</Text>
        </View>
    );
  }

  // Depreciation Calculation (Straight-line 5 years)
  const purchaseDate = new Date(asset.purchase_date);
  const ageInYears = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 365);
  const usefulLife = 5;
  const yearlyDepreciation = asset.cost / usefulLife;
  const currentValue = Math.max(0, asset.cost - (yearlyDepreciation * ageInYears));

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        className="absolute w-full h-full"
      />
      
      <View className="pt-12 px-6 flex-row items-center justify-between pb-4 z-10">
        <TouchableOpacity onPress={() => router.back()} className="bg-slate-700/50 p-2 rounded-full">
            <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold flex-1 text-center mr-10">Detalles del Activo</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} className="px-4">
        
        {/* Header Card */}
        <GlassCard className="mb-6 border-cyan-500/30">
            <View className="flex-row justify-between items-start">
                <View>
                    <Text className="text-cyan-400 font-bold text-lg mb-1">{asset.asset_tag}</Text>
                    <Text className="text-white text-3xl font-bold">{asset.name}</Text>
                    <Text className="text-gray-400 text-sm mt-1">{asset.category}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full border ${asset.status === 'Active' ? 'border-green-500 bg-green-500/20' : 'border-gray-500'}`}>
                    <Text className="text-white text-xs font-bold">{asset.status}</Text>
                </View>
            </View>
        </GlassCard>

        {/* Info Grid */}
        <View className="flex-row flex-wrap gap-4 mb-6">
            <View className="flex-1">
                <GlassCard className="h-full justify-center">
                    <Ionicons name="location-outline" size={24} color="#22d3ee" />
                    <Text className="text-gray-400 text-xs mt-2">Ubicación</Text>
                    <Text className="text-white font-bold">{asset.location}</Text>
                </GlassCard>
            </View>
            <View className="flex-1">
                <GlassCard className="h-full justify-center">
                    <Ionicons name="barcode-outline" size={24} color="#a78bfa" />
                    <Text className="text-gray-400 text-xs mt-2">Nº Serie</Text>
                    <Text className="text-white font-bold" numberOfLines={1}>{asset.serial_number || 'N/A'}</Text>
                </GlassCard>
            </View>
        </View>

        {/* Financials & Depreciation */}
        <Text className="text-white text-xl font-bold mb-3">Valoración</Text>
        <GlassCard className="mb-6">
            <View className="flex-row justify-between mb-4 pb-4 border-b border-white/10">
                <View>
                    <Text className="text-gray-400 text-xs">Costo Original</Text>
                    <Text className="text-white text-xl font-bold">${asset.cost.toFixed(2)}</Text>
                </View>
                <View className="items-end">
                    <Text className="text-gray-400 text-xs">Fecha Compra</Text>
                    <Text className="text-white text-xl font-bold">{purchaseDate.toLocaleDateString()}</Text>
                </View>
            </View>
            
            <View className="flex-row justify-between items-center">
                <View>
                    <Text className="text-green-400 text-xs font-bold mb-1">VALOR ACTUAL (Est.)</Text>
                    <Text className="text-green-400 text-4xl font-bold tracking-tighter">
                        ${currentValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1">Depreciación Lineal (5 años)</Text>
                </View>
                <View className="bg-slate-700/50 p-3 rounded-full">
                    <Ionicons name="trending-down" size={24} color="#ef4444" />
                </View>
            </View>
        </GlassCard>

        {/* Actions (Placeholder for future actions) */}
        <TouchableOpacity 
            className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl flex-row justify-center items-center"
            onPress={() => {
                Alert.alert("Eliminar", "¿Seguro?", [
                    { text: "Cancelar" },
                    { text: "Eliminar", style: "destructive", onPress: async () => {
                        await db.runAsync('DELETE FROM assets WHERE id = ?', id);
                        router.back();
                    }}
                ])
            }}
        >
            <Ionicons name="trash-outline" size={20} color="#f87171" />
            <Text className="text-red-400 font-bold ml-2">Dar de Baja / Eliminar</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

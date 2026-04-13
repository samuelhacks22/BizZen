import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { AddAssetModal } from '../../components/AddAssetModal';
import { useSQLiteContext } from 'expo-sqlite';
import { useTycoon } from '../../context/TycoonContext';
import { Ionicons } from '@expo/vector-icons';

export default function AssetDetails() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const { refreshTycoon, addXP, showToast } = useTycoon();
  const [asset, setAsset] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadAsset = useCallback(async () => {
    try {
      const result = await db.getFirstAsync<any>('SELECT * FROM assets WHERE id = ?', [id]);
      if (result) {
        setAsset(result);
      } else {
        router.back();
      }
    } catch (e) {
      console.error('Error loading asset:', e);
    }
  }, [db, id]);

  useEffect(() => {
    loadAsset();
  }, [loadAsset]);

  const handleUpdateAsset = async (assetData: any) => {
    try {
      await db.runAsync(
        'UPDATE assets SET name = ?, asset_tag = ?, category = ?, location = ?, serial_number = ?, cost = ?, status = ? WHERE id = ?',
        [
          assetData.name,
          assetData.asset_tag,
          assetData.category,
          assetData.location,
          assetData.serial_number,
          assetData.cost,
          assetData.status,
          id
        ]
      );
      await refreshTycoon();
      await loadAsset();
      Alert.alert('Éxito', 'Activo actualizado correctamente.');
    } catch (e) {
      console.error('Error updating asset:', e);
      Alert.alert('Error', 'No se pudo actualizar el activo.');
    }
  };

  const handleValidate = async () => {
    try {
      const now = new Date().toISOString();
      await db.runAsync('UPDATE assets SET last_validated = ? WHERE id = ?', [now, id]);
      await addXP(100); // Recompensa por validar existencia
      await loadAsset();
      showToast('Activo validado y auditado', 'success');
    } catch (e) {
      console.error('Validation error:', e);
      showToast('Error al validar activo', 'error');
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Activo', 
      '¿Estás seguro de que deseas eliminar este activo permanentemente del inventario?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive', 
          onPress: async () => {
            await db.runAsync('DELETE FROM assets WHERE id = ?', [id]);
            await refreshTycoon();
            router.back();
          } 
        }
      ]
    );
  };

  if (!asset) return (
    <ScreenWrapper>
        <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Cargando...</Text>
        </View>
    </ScreenWrapper>
  );

  return (
    <ScreenWrapper>
      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center mb-8">
            <TouchableOpacity 
                onPress={() => router.back()} 
                activeOpacity={0.7}
                className="mr-4 w-11 h-11 rounded-2xl bg-white/5 items-center justify-center border border-white/5"
            >
                <Ionicons name="arrow-back" size={22} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-2xl font-black tracking-tight">Detalles del Activo</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
            <GlassCard className="mb-6 p-6 border-white/5" parallax>
                <View className="items-center mb-8">
                    <View className="w-24 h-24 rounded-[32px] bg-neon-cyan/10 items-center justify-center mb-5 border border-neon-cyan/20">
                        <Ionicons name="cube" size={48} color="#22d3ee" />
                    </View>
                    <Text className="text-white text-3xl font-black text-center leading-tight">{asset.name}</Text>
                    <View className="bg-white/5 px-4 py-1.5 rounded-full mt-2 border border-white/10">
                        <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">{asset.category}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between mb-2">
                    <View>
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-2">Estado Actual</Text>
                        <View className="flex-row items-center bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                            <View className={`w-2.5 h-2.5 rounded-full mr-2.5 ${asset.status === 'Active' ? 'bg-green-500' : asset.status === 'In Repair' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                            <Text className="text-white font-black text-xs uppercase tracking-wider">{asset.status}</Text>
                        </View>
                    </View>
                    <View className="items-end">
                        <Text className="text-gray-500 text-[10px] font-black uppercase tracking-[2px] mb-2">Valoración</Text>
                        <Text className="text-neon-cyan font-black text-3xl">${asset.cost.toLocaleString()}</Text>
                    </View>
                </View>

                <View className="h-[1px] bg-white/10 w-full my-6" />

                <View className="gap-6">
                    <View className="flex-row items-center">
                        <Ionicons name="barcode-outline" size={18} color="#64748b" className="mr-4" />
                        <View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Asset Tag / ID</Text>
                            <Text className="text-white font-bold text-base mt-1">{asset.asset_tag}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="location-outline" size={18} color="#64748b" className="mr-4" />
                        <View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Ubicación Registrada</Text>
                            <Text className="text-white font-bold text-base mt-1">{asset.location || 'Sin asignar'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="settings-outline" size={18} color="#64748b" className="mr-4" />
                        <View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Número de Serie</Text>
                            <Text className="text-white font-bold text-base mt-1">{asset.serial_number || 'N/A'}</Text>
                        </View>
                    </View>

                    <View className="flex-row items-center">
                        <Ionicons name="checkmark-circle-outline" size={18} color={asset.last_validated ? "#10b981" : "#64748b"} className="mr-4" />
                        <View>
                            <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Última Auditoría</Text>
                            <Text className={`font-bold text-base mt-1 ${asset.last_validated ? 'text-white' : 'text-gray-600 italic'}`}>
                                {asset.last_validated ? new Date(asset.last_validated).toLocaleDateString() : 'Nunca validado'}
                            </Text>
                        </View>
                    </View>
                </View>
            </GlassCard>

            <View className="gap-4 mb-24">
                <NeonButton 
                  title="VALIDAR ACTIVO" 
                  variant="primary" 
                  icon="shield-checkmark-outline"
                  onPress={handleValidate}
                />
                <NeonButton 
                  title="EDITAR ACTIVOS" 
                  variant="primary" 
                  icon="create-outline"
                  onPress={() => setModalVisible(true)}
                />
                <NeonButton 
                  title="ELIMINAR DEL IMPERIO" 
                  variant="danger" 
                  icon="trash-outline"
                  onPress={handleDelete}
                />
            </View>
        </ScrollView>

        <AddAssetModal 
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onSave={handleUpdateAsset}
            initialAsset={asset}
        />
      </View>
    </ScreenWrapper>
  );
}

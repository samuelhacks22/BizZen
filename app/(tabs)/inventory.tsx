import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { AddAssetModal } from '../../components/AddAssetModal';
import { useSQLiteContext } from 'expo-sqlite';
import { useTycoon } from '../../context/TycoonContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Alert } from 'react-native';

export default function Inventory() {
  const db = useSQLiteContext();
  const { addXP, refreshTycoon } = useTycoon();
  const [assets, setAssets] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadAssets = useCallback(async () => {
    try {
      const result = await db.getAllAsync<any>('SELECT * FROM assets ORDER BY id DESC');
      console.log(`[Inventory] Cargados ${result?.length || 0} activos`);
      setAssets(result || []);
    } catch (e) {
      console.error('Error loading assets:', e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadAssets();
      refreshTycoon();
    }, [loadAssets, refreshTycoon])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAssets();
    setRefreshing(false);
  };

  const handleSaveAsset = async (assetData: any) => {
    try {
      await db.runAsync(
        'INSERT INTO assets (name, asset_tag, category, location, serial_number, cost, status, purchase_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          assetData.name,
          assetData.asset_tag,
          assetData.category,
          assetData.location,
          assetData.serial_number,
          assetData.cost,
          assetData.status,
          new Date().toISOString()
        ]
      );
      
      // Reward XP for adding asset
      await addXP(500);
      await refreshTycoon();
      await loadAssets();
    } catch (e) {
      console.error('Error saving asset:', e);
    }
  };

  const repairDB = async () => {
    try {
      await db.execAsync('DELETE FROM assets');
      await db.execAsync(`
        INSERT INTO assets (name, asset_tag, category, location, cost, status, purchase_date) VALUES 
        ('Dell XPS 15', 'TAG-001', 'Laptops', 'Office 101', 1500.00, 'Active', datetime('now', '-30 days')),
        ('Herman Miller Chair', 'TAG-002', 'Furniture', 'Office 101', 800.00, 'Active', datetime('now', '-60 days')),
        ('Projector 4K', 'TAG-003', 'Electronics', 'Conf Room A', 1200.00, 'In Repair', datetime('now', '-10 days')),
        ('Mac Studio', 'TAG-004', 'Electronics', 'Office 102', 3500.00, 'Active', datetime('now', '-5 days')),
        ('iPad Pro', 'TAG-005', 'Mobile', 'Office 102', 1100.00, 'Active', datetime('now', '-15 days')),
        ('Ergo Desk', 'TAG-006', 'Furniture', 'Office 101', 600.00, 'Active', datetime('now', '-2 days'));
      `);
      
      // Seed employees also during repair
      await db.execAsync('DELETE FROM employees');
      await db.execAsync(`
        INSERT INTO employees (name, role, department, salary, hire_date, status) VALUES 
        ('Ana García', 'CTO', 'Tecnología', 8500.00, datetime('now', '-365 days'), 'Active'),
        ('Carlos Ruiz', 'Lead Developer', 'Tecnología', 6200.00, datetime('now', '-200 days'), 'Active'),
        ('Diana Prince', 'Operations Mgr', 'Logística', 4800.00, datetime('now', '-120 days'), 'Active'),
        ('Steve Trevor', 'Security Chief', 'Seguridad', 3500.00, datetime('now', '-60 days'), 'Active');
      `);
      Alert.alert('Sincronización', '¡Base de datos reparada con éxito! Los activos de prueba han sido restaurados.');
      await loadAssets();
      await refreshTycoon();
    } catch (e) {
      Alert.alert('Error de Reparación', (e as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10b981'; // Green
      case 'In Repair': return '#fbbf24'; // Yellow
      case 'Disposed': return '#f43f5e'; // Red
      default: return '#9ca3af';
    }
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between mb-8">
            <Text className="text-white text-3xl font-black tracking-tightest">ACTIVOS</Text>
            <View className="flex-row gap-2">
                <TouchableOpacity 
                  onPress={repairDB}
                  activeOpacity={0.7}
                  className="w-12 h-12 rounded-2xl bg-neon-purple/10 items-center justify-center border border-neon-purple/20"
                >
                    <Ionicons name="sync" size={24} color="#a855f7" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => setModalVisible(true)}
                  activeOpacity={0.7}
                  className="w-12 h-12 rounded-2xl bg-neon-cyan/10 items-center justify-center border border-neon-cyan/20"
                >
                    <Ionicons name="add" size={28} color="#22d3ee" />
                </TouchableOpacity>
            </View>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22d3ee" />}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {assets.length === 0 ? (
            <GlassCard className="items-center py-20 mb-6">
                <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4 border border-white/5">
                    <Ionicons name="cube-outline" size={40} color="#64748b" />
                </View>
                <Text className="text-white text-lg font-bold">Sin activos registrados</Text>
                <Text className="text-gray-500 text-center px-10 mt-2">
                    Comienza a construir tu imperio agregando tu primer producto o propiedad.
                </Text>
                <NeonButton 
                  title="AGREGAR AHORA" 
                  className="mt-8" 
                  icon="add" 
                  onPress={() => setModalVisible(true)} 
                />
            </GlassCard>
          ) : (
            <View className="pb-32">
              {assets.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  onPress={() => router.push(`/asset/${item.id}`)}
                  activeOpacity={0.7}
                >
                  <GlassCard className="mb-4 border-white/5" gradientBorder={false}>
                    <View className="flex-row items-center">
                        <View className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center mr-4 border border-white/5">
                        <Ionicons name="cube" size={24} color={getStatusColor(item.status)} />
                        </View>
                        <View className="flex-1">
                        <Text className="text-white font-bold text-lg leading-tight">{item.name}</Text>
                        <View className="flex-row items-center mt-1">
                            <Text className="text-gray-500 text-xs font-medium mr-3 tracking-wide">{item.category}</Text>
                            <View className="w-1 h-1 rounded-full bg-gray-700 mr-3" />
                            <Text className="text-blue-400 text-xs font-black uppercase">${(item.cost || 0).toLocaleString()}</Text>
                        </View>
                        </View>
                        <View className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
                            <Ionicons name="chevron-forward" size={16} color="#475569" />
                        </View>
                    </View>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        <AddAssetModal 
          visible={modalVisible} 
          onClose={() => setModalVisible(false)} 
          onSave={handleSaveAsset} 
        />
      </View>
    </ScreenWrapper>
  );
}

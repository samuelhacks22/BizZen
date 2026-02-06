import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ParticleBackground } from '../../components/ParticleBackground';

export default function Dashboard() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState({ 
    totalValue: 0, 
    totalAssets: 0, 
    activeCount: 0,
    repairCount: 0 
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const valueResult = await db.getAllAsync<{ total: number }>('SELECT SUM(cost) as total FROM assets WHERE status != "Disposed"');
      const countResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status != "Disposed"');
      
      const activeResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status = "Active"');
      const repairResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status = "In Repair"');

      setStats({
        totalValue: valueResult[0]?.total || 0,
        totalAssets: countResult[0]?.count || 0,
        activeCount: activeResult[0]?.count || 0,
        repairCount: repairResult[0]?.count || 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  return (
    <View className="flex-1 bg-slate-900">
      <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        className="absolute w-full h-full"
      />
      <ParticleBackground />
      
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22d3ee" />}
      >
        <View className="pt-12 px-6 pb-6">
          <Text className="text-gray-400 text-lg">Control de Inventario</Text>
          <Text className="text-white text-3xl font-bold">Resumen de Activos</Text>
        </View>

        {/* Hero Card: Total Value */}
        <View className="px-4 mb-6">
          <GlassCard className="border-cyan-500/30">
            <View className="flex-row items-center mb-2">
                <View className="p-2 bg-green-500/20 rounded-full mr-3">
                    <Ionicons name="cash-outline" size={24} color="#4ade80" />
                </View>
                <Text className="text-gray-300 font-semibold">Valor Total de Activos</Text>
            </View>
            <Text className="text-4xl text-white font-bold tracking-tighter">
                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </GlassCard>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-2">
          <View className="w-1/2 p-2">
            <GlassCard>
              <Ionicons name="cube-outline" size={32} color="#22d3ee" />
              <Text className="text-gray-400 mt-2">Total Activos</Text>
              <Text className="text-white text-2xl font-bold">{stats.totalAssets}</Text>
            </GlassCard>
          </View>
          <View className="w-1/2 p-2">
            <GlassCard>
              <Ionicons name="checkmark-circle-outline" size={32} color="#4ade80" />
              <Text className="text-gray-400 mt-2">Activos</Text>
              <Text className="text-white text-2xl font-bold">{stats.activeCount}</Text>
            </GlassCard>
          </View>
           <View className="w-1/2 p-2">
            <GlassCard>
              <Ionicons name="construct-outline" size={32} color="#fbbf24" />
              <Text className="text-gray-400 mt-2">En Reparación</Text>
              <Text className="text-white text-2xl font-bold">{stats.repairCount}</Text>
            </GlassCard>
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

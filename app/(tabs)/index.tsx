import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

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
    <ScreenWrapper>
      <ScrollView 
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#22d3ee" />}
      >
        <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="pt-6 px-6 pb-6"
        >
          <Text className="text-neon-cyan font-bold tracking-widest text-sm uppercase mb-1">BizZen Inventory</Text>
          <Text className="text-white text-4xl font-black tracking-tight">
            Resumen<Text className="text-neon-purple">.</Text>
          </Text>
        </Animated.View>

        {/* Hero Card: Total Value */}
        <Animated.View 
            entering={FadeInRight.delay(300).springify()}
            className="px-4 mb-8"
        >
          <GlassCard intensity={40} className="border-neon-cyan/30">
            <View className="flex-row items-center mb-4">
                <View className="p-3 bg-neon-cyan/10 rounded-full mr-4 border border-neon-cyan/20">
                    <Ionicons name="wallet-outline" size={24} color="#22d3ee" />
                </View>
                <View>
                    <Text className="text-gray-400 font-medium">Valor Total de Activos</Text>
                    <Text className="text-xs text-gray-500">Estimado al costo de compra</Text>
                </View>
            </View>
            <Text className="text-5xl text-white font-black tracking-tighter shadow-neon-cyan">
                ${stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Stats Title */}
        <Animated.View entering={FadeInDown.delay(400)} className="px-6 mb-4">
            <Text className="text-white font-bold text-xl">Métricas Clave</Text>
        </Animated.View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-2">
          <View className="w-1/2 p-2">
            <GlassCard intensity={30} className="h-40 justify-between">
              <View className="bg-blue-500/20 w-10 h-10 rounded-full items-center justify-center">
                 <Ionicons name="layers-outline" size={24} color="#60a5fa" />
              </View>
              <View>
                  <Text className="text-gray-400 text-sm">Total Activos</Text>
                  <Text className="text-white text-3xl font-bold">{stats.totalAssets}</Text>
              </View>
              <View className="absolute top-4 right-4 opacity-50">
                  <Ionicons name="layers" size={60} color="rgba(255,255,255,0.05)" />
              </View>
            </GlassCard>
          </View>

          <View className="w-1/2 p-2">
            <GlassCard intensity={30} className="h-40 justify-between">
              <View className="bg-neon-green/20 w-10 h-10 rounded-full items-center justify-center bg-green-500/20">
                 <Ionicons name="shield-checkmark-outline" size={24} color="#4ade80" />
              </View>
              <View>
                  <Text className="text-gray-400 text-sm">Activos Operativos</Text>
                  <Text className="text-white text-3xl font-bold">{stats.activeCount}</Text>
              </View>
               <View className="absolute top-4 right-4 opacity-50">
                  <Ionicons name="checkmark-circle" size={60} color="rgba(255,255,255,0.05)" />
              </View>
            </GlassCard>
          </View>
          
           <View className="w-full p-2">
            <GlassCard intensity={30} className="flex-row items-center justify-between p-6">
              <View className="flex-row items-center">
                  <View className="bg-yellow-500/20 w-12 h-12 rounded-full items-center justify-center mr-4">
                    <Ionicons name="construct-outline" size={24} color="#fbbf24" />
                  </View>
                  <View>
                    <Text className="text-gray-400 text-sm">En Mantenimiento</Text>
                    <Text className="text-white text-2xl font-bold">{stats.repairCount} <Text className="text-base text-gray-500 font-normal">equipos</Text></Text>
                  </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#525252" />
            </GlassCard>
          </View>
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { TycoonHeader } from '../../components/TycoonHeader';
import { XPPopOver } from '../../components/XPPopOver';
import { useTycoon } from '../../context/TycoonContext';

export default function Dashboard() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState({ 
    totalValue: 0, 
    totalAssets: 0, 
    activeCount: 0,
    repairCount: 0 
  });
  const [refreshing, setRefreshing] = useState(false);
  const [showXP, setShowXP] = useState(false);
  const { addXP } = useTycoon();

  const loadData = useCallback(async () => {
    try {
      const valueResult = await db.getAllAsync<{ total: number }>('SELECT SUM(cost) as total FROM assets WHERE status != "Disposed"');
      const countResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status != "Disposed"');
      
      const activeResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status = "Active"');
      const repairResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status = "In Repair"');

      const healthPercent = countResult[0]?.count > 0 
        ? Math.round((activeResult[0]?.count / countResult[0]?.count) * 100) 
        : 0;

      setStats({
        totalValue: valueResult[0]?.total || 0,
        totalAssets: countResult[0]?.count || 0,
        activeCount: healthPercent,
        repairCount: repairResult[0]?.count || 0
      });
    } catch (e) {
      console.error(e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );


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
            className="pt-12 px-6 pb-6"
        >
          <View className="flex-row items-center mb-3">
            <View className="w-8 h-8 rounded-xl bg-white/5 items-center justify-center border border-white/5 mr-4 overflow-hidden">
                <Image 
                    source={require('../../assets/icon.png')} 
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="text-gray-500 font-black tracking-[4px] text-[8px] uppercase opacity-40">System Control</Text>
          </View>
          <Text className="text-white text-5xl font-black tracking-tightest">
            Control<Text className="text-neon-cyan opacity-40">.</Text>
          </Text>
        </Animated.View>

        <TycoonHeader />

        {/* Hero Segment */}
        <Animated.View 
            entering={FadeInRight.delay(300).springify()}
            className="px-6 mb-8"
        >
          <GlassCard intensity={30} className="border-white/5 py-10" gradientBorder={true}>
            <View className="items-center">
                <Text className="text-gray-500 font-bold uppercase tracking-[4px] text-[8px] mb-4 opacity-40">Valoración Neta</Text>
                <View className="flex-row items-baseline mb-4">
                    <Text className="text-white text-xl font-light mr-3 opacity-10">$</Text>
                    <Text className="text-6xl text-white font-black tracking-tightest">
                        {stats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                </View>
                <View className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                    <Text className="text-gray-500 text-[10px] font-bold tracking-tight opacity-60">Ecosistema Activo</Text>
                </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Grid Header */}
        <View className="px-6 mb-4 flex-row justify-between items-center">
            <Text className="text-white font-black text-lg tracking-tight">Módulos</Text>
            <TouchableOpacity className="bg-white/5 p-2 rounded-xl">
                 <Ionicons name="apps-outline" size={14} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
        </View>

        {/* Global Modular Grid */}
        <View className="flex-row flex-wrap px-4 pb-12">
          {/* Module 1 */}
          <View className="w-1/2 p-2">
            <GlassCard intensity={25} className="p-6 h-40 justify-between">
              <View className="bg-white/5 w-12 h-12 rounded-2xl items-center justify-center border border-white/5">
                 <Ionicons name="layers-outline" size={24} color="rgba(255,255,255,0.4)" />
              </View>
              <View>
                  <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[2px] mb-1 opacity-40">Stock</Text>
                  <Text className="text-white text-4xl font-black tracking-tightest">{stats.totalAssets}</Text>
              </View>
            </GlassCard>
          </View>

          {/* Module 2 */}
          <View className="w-1/2 p-2">
            <GlassCard intensity={25} className="p-6 h-40 justify-between">
              <View className="bg-white/5 w-12 h-12 rounded-2xl items-center justify-center border border-white/5">
                 <Ionicons name="flash-outline" size={24} color="#22d3ee" className="opacity-40" />
              </View>
              <View>
                  <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[2px] mb-1 opacity-40">Health</Text>
                  <View className="flex-row items-baseline">
                      <Text className="text-white text-4xl font-black tracking-tightest">{stats.activeCount}</Text>
                      <Text className="text-neon-cyan text-[10px] font-bold ml-1.5 opacity-20">%</Text>
                  </View>
              </View>
            </GlassCard>
          </View>
          
          {/* Module 3 Wide */}
           <View className="w-full p-2">
            <GlassCard intensity={30} className="flex-row items-center justify-between p-7 border-neon-cyan/20">
              <View className="flex-row items-center flex-1">
                  <View className="bg-neon-cyan/10 w-16 h-16 rounded-[32px] items-center justify-center mr-5 border border-neon-cyan/20">
                    <Ionicons name="cash-outline" size={26} color="#22d3ee" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-neon-cyan text-[10px] font-bold uppercase tracking-[3px] mb-1 opacity-60">Revenue Mensual</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-white text-3xl font-black tracking-tightest">Recolectar</Text>
                    </View>
                  </View>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  addXP(50);
                  setShowXP(true);
                }}
                className="bg-neon-cyan p-4 rounded-2xl shadow-neon shadow-neon-cyan/50"
              >
                 <Ionicons name="gift-outline" size={20} color="black" />
              </TouchableOpacity>
            </GlassCard>
          </View>

          {showXP && <XPPopOver amount={50} onComplete={() => setShowXP(false)} />}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

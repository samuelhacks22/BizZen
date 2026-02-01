import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSQLiteContext } from 'expo-sqlite';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ParticleBackground } from '../../components/ParticleBackground';

export default function Dashboard() {
  const db = useSQLiteContext();
  const [stats, setStats] = useState({ sales: 0, products: 0, xp: 0 });
  const [refreshing, setRefreshing] = useState(false);

  // Gamification Logic
  const LEVEL_THRESHOLDS = [0, 100, 500, 1000, 5000];
  const currentLevel = LEVEL_THRESHOLDS.findIndex(t => stats.xp < t) || LEVEL_THRESHOLDS.length;
  const nextLevelXp = LEVEL_THRESHOLDS[currentLevel] || 10000;
  const progress = (stats.xp / nextLevelXp) * 100;

  const loadData = async () => {
    try {
      const salesResult = await db.getAllAsync<{ total: number }>('SELECT SUM(amount) as total FROM transactions WHERE type = "SALE"');
      const productsResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM products');
      
      const totalSales = salesResult[0]?.total || 0;
      const count = productsResult[0]?.count || 0;
      
      // XP = Sales + (Products * 10)
      const calculatedXp = Math.floor(totalSales + (count * 10));

      setStats({
        sales: totalSales,
        products: count,
        xp: calculatedXp
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

  const ProgressStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${progress}%`, { duration: 1000 })
    };
  });

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
          <Text className="text-gray-400 text-lg">Welcome back, Tycoon</Text>
          <Text className="text-white text-3xl font-bold">Empire Overview</Text>
        </View>

        {/* Level Card */}
        <View className="px-4 mb-6">
          <GlassCard className="border-cyan-500/30">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-cyan-400 font-bold text-lg">Level {currentLevel}</Text>
              <Text className="text-gray-300 text-sm">{stats.xp} / {nextLevelXp} XP</Text>
            </View>
            <View className="h-4 bg-slate-700 rounded-full overflow-hidden">
              <Animated.View className="h-full bg-cyan-400 shadow-lg shadow-cyan-500/50" style={ProgressStyle} />
            </View>
            <Text className="text-gray-400 text-xs mt-2 text-center">
              Make more sales to reach Level {currentLevel + 1}!
            </Text>
          </GlassCard>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-2">
          <View className="w-1/2 p-2">
            <GlassCard>
              <Ionicons name="cash-outline" size={32} color="#4ade80" />
              <Text className="text-gray-400 mt-2">Total Revenue</Text>
              <Text className="text-white text-2xl font-bold">${stats.sales.toFixed(2)}</Text>
            </GlassCard>
          </View>
          <View className="w-1/2 p-2">
            <GlassCard>
              <Ionicons name="cube-outline" size={32} color="#f472b6" />
              <Text className="text-gray-400 mt-2">Active Products</Text>
              <Text className="text-white text-2xl font-bold">{stats.products}</Text>
            </GlassCard>
          </View>
        </View>

        {/* Quests / Daily Goals */}
        <View className="px-4 mt-4">
          <Text className="text-white text-xl font-bold mb-4">Daily Quests</Text>
          
          <GlassCard className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${stats.sales > 100 ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                {stats.sales > 100 && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <View>
                <Text className="text-white font-semibold">First High Value</Text>
                <Text className="text-gray-400 text-xs">Reach $100 in revenue</Text>
              </View>
            </View>
            <View>
               <Text className="text-yellow-400 font-bold">+50 XP</Text>
            </View>
          </GlassCard>

           <GlassCard className="mb-3 flex-row items-center justify-between">
            <View className="flex-row items-center flex-1">
              <View className={`w-6 h-6 rounded-full border-2 mr-3 items-center justify-center ${stats.products >= 5 ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                {stats.products >= 5 && <Ionicons name="checkmark" size={16} color="white" />}
              </View>
              <View>
                 <Text className="text-white font-semibold">Stockpile</Text>
                 <Text className="text-gray-400 text-xs">Have 5+ products in stock</Text>
              </View>
            </View>
            <View>
               <Text className="text-yellow-400 font-bold">+100 XP</Text>
            </View>
          </GlassCard>
        </View>

      </ScrollView>
    </View>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Share, Alert, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';

type CategoryStat = {
  category: string;
  totalValue: number;
  count: number;
  avgValue?: number;
};

export default function Reports() {
  const db = useSQLiteContext();
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const loadStats = useCallback(async () => {
    try {
      // Get stats by category
      const result = await db.getAllAsync<CategoryStat>(`
        SELECT category, SUM(cost) as totalValue, COUNT(*) as count 
        FROM assets 
        WHERE status != 'Disposed' 
        GROUP BY category
        ORDER BY totalValue DESC
      `);
      setCategoryStats(result);

      const total = result.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
      setTotalValue(total);
    } catch (e) {
      console.error(e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const handleExport = async () => {
    try {
        const allAssets = await db.getAllAsync('SELECT * FROM assets');
        const jsonString = JSON.stringify(allAssets, null, 2);
        
        await Share.share({
            message: jsonString,
            title: 'Managex Inventory Export'
        });
    } catch (e) {
        Alert.alert("Error", "Failed to export data");
    }
  };


  const renderItem = ({ item, index }: { item: CategoryStat, index: number }) => {
    const percentage = totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <GlassCard className="mb-5 mx-6" intensity={20}>
            <View className="flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <View className="w-14 h-14 rounded-3xl bg-white/5 items-center justify-center mr-5 border border-white/5 shadow-2xl">
                  <Ionicons name="pie-chart-outline" size={26} color="rgba(255,255,255,0.4)" />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg tracking-tight uppercase mb-1">{item.category}</Text>
                  <Text className="text-gray-500 text-[10px] font-bold tracking-tight uppercase opacity-60">{item.count} Activos</Text>
                </View>
              </View>
              <View className="items-end">
                  <Text className="font-bold text-2xl text-white tracking-tightest">
                    ${item.totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </Text>
                  <Text className="text-neon-cyan text-[10px] font-bold tracking-[2px] mt-1 opacity-60">{percentage.toFixed(0)}%</Text>
              </View>
            </View>
            
            {/* Progress Bar Container */}
            <View className="h-[6px] bg-white/2 rounded-full overflow-hidden w-full border border-white/2">
                <View 
                    className="h-full bg-neon-purple/40 rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </View>
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <ScreenWrapper>
        <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="pt-12 px-8 pb-8"
        >
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
                    <Text className="text-gray-500 font-bold tracking-[3px] text-[9px] uppercase">DATA ANALYTICS</Text>
                </View>
                <Text className="text-white text-5xl font-black tracking-tightest">Reportes<Text className="text-neon-purple opacity-60">.</Text></Text>
            </View>
            <View className="flex-row gap-4">
                <TouchableOpacity 
                    onPress={handleExport}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl"
                >
                    <Ionicons name="share-social-outline" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={loadStats}
                    className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl"
                >
                    <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
            </View>
          </View>

          <GlassCard className="mb-8 border-white/5 py-10" intensity={40}>
              <View className="items-center">
                  <View className="w-10 h-1 bg-neon-cyan opacity-10 rounded-full mb-6" />
                  <Text className="text-gray-500 font-bold uppercase tracking-[4px] text-[8px] mb-4 opacity-60">Valor Consolidado</Text>
                  <View className="flex-row items-baseline mb-3">
                    <Text className="text-white text-xl font-light mr-3 opacity-20">$</Text>
                    <Text className="text-5xl text-white font-black tracking-tightest">
                        {totalValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </Text>
                  </View>
                  <View className="bg-white/5 px-4 py-1.5 rounded-full border border-white/5">
                      <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest opacity-40">Auditoría Real-Time</Text>
                  </View>
              </View>
          </GlassCard>

          <View className="px-1 flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <Ionicons name="pie-chart-outline" size={18} color="rgba(255,255,255,0.4)" />
                <Text className="text-white font-black text-xl tracking-tight ml-4">Distribución</Text>
              </View>
              <View className="h-[1px] flex-1 bg-white/5 ml-8" />
          </View>
      </Animated.View>

      <FlatList
        data={categoryStats}
        keyExtractor={item => item.category}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-20 opacity-50">
              <Ionicons name="analytics-outline" size={80} color="#a855f7" />
              <Text className="text-white text-lg font-bold mt-4">Sin datos analíticos</Text>
              <Text className="text-gray-400 text-center mt-2 px-10">
                  Registra activos con costo en el inventario para generar reportes visuales.
              </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Share, Alert } from 'react-native';
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
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <GlassCard className="mb-4 mx-4 p-4" intensity={25}>
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-neon-purple/20 items-center justify-center mr-3 border border-neon-purple/30">
                  <Ionicons name="pie-chart-outline" size={20} color="#a855f7" />
                </View>
                <View>
                  <Text className="text-white font-bold text-lg">{item.category}</Text>
                  <Text className="text-gray-400 text-xs">{item.count} Activos</Text>
                </View>
              </View>
              <View className="items-end">
                  <Text className="font-black text-xl text-white">
                    ${item.totalValue.toFixed(2)}
                  </Text>
                  <Text className="text-neon-cyan text-xs font-bold">{percentage.toFixed(1)}%</Text>
              </View>
            </View>
            
            {/* Progress Bar Container */}
            <View className="h-3 bg-black/40 rounded-full overflow-hidden w-full border border-white/5">
                <LinearGradient
                    colors={['#22d3ee', '#a855f7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="h-full rounded-full shadow-lg shadow-neon-cyan/50"
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
            className="pt-6 px-4 pb-4"
        >
          <View className="flex-row justify-between items-center mb-6">
             <View>
                <Text className="text-neon-cyan font-bold tracking-widest text-xs uppercase mb-1">ANÁLISIS</Text>
                <Text className="text-white text-3xl font-black">Reportes</Text>
            </View>
            <View className="flex-row gap-3">
                <TouchableOpacity 
                    onPress={handleExport}
                    className="bg-neon-purple/20 border border-neon-purple/50 p-3 rounded-full"
                >
                    <Ionicons name="share-social-outline" size={20} color="#d8b4fe" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={loadStats}
                    className="bg-white/10 p-3 rounded-full border border-white/20"
                >
                    <Ionicons name="refresh" size={20} color="white" />
                </TouchableOpacity>
            </View>
          </View>

          <GlassCard className="mb-6 border-neon-green/30" intensity={40}>
              <View className="flex-row items-center space-x-2 mb-2">
                 <Ionicons name="trending-up" size={20} color="#4ade80" />
                 <Text className="text-gray-400 font-medium">Valor Total del Inventario</Text>
              </View>
              
              <Text className="text-white text-5xl font-black tracking-tighter shadow-green-500/50">
                  ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </Text>
          </GlassCard>

          <Text className="text-white/80 font-bold text-lg mb-4 ml-1">Desglose por Categoría</Text>
      </Animated.View>

      <FlatList
        data={categoryStats}
        keyExtractor={item => item.category}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center justify-center mt-10">
              <Text className="text-gray-500">No hay datos suficientes para mostrar.</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}

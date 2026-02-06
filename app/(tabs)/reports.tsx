import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Share, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type CategoryStat = {
  category: string;
  totalValue: number;
  count: number;
};

export default function Reports() {
  const db = useSQLiteContext();
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]);
  const [totalValue, setTotalValue] = useState(0);

  const loadStats = async () => {
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
  };

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

  useEffect(() => {
    loadStats();
  }, []);

  const renderItem = ({ item }: { item: CategoryStat }) => {
    const percentage = totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;

    return (
      <GlassCard className="mb-3 mx-4 p-3" intensity={20}>
        <View className="flex-row justify-between items-center mb-2">
          <View className="flex-row items-center">
            <View className="p-2 rounded-full mr-3 bg-cyan-500/20">
              <Ionicons name="pricetag-outline" size={20} color="#22d3ee" />
            </View>
            <View>
              <Text className="text-white font-semibold">{item.category}</Text>
              <Text className="text-gray-400 text-xs">{item.count} Activos</Text>
            </View>
          </View>
          <Text className="font-bold text-lg text-white">
            ${item.totalValue.toFixed(2)}
          </Text>
        </View>
        
        {/* Progress Bar */}
        <View className="h-2 bg-slate-700 rounded-full overflow-hidden w-full">
            <View 
                className="h-full bg-cyan-400" 
                style={{ width: `${percentage}%` }}
            />
        </View>
        <Text className="text-right text-xs text-gray-400 mt-1">{percentage.toFixed(1)}% del valor total</Text>
      </GlassCard>
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
       <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        className="absolute w-full h-full"
      />
      
      <FlatList
        ListHeaderComponent={
          <View className="pt-12 px-6 pb-4">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-white text-3xl font-bold">Reportes</Text>
                <View className="flex-row gap-2">
                    <TouchableOpacity 
                        onPress={handleExport}
                        className="bg-cyan-500/80 p-2 rounded-full"
                    >
                        <Ionicons name="share-outline" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={loadStats}
                        className="bg-slate-700/50 p-2 rounded-full"
                    >
                        <Ionicons name="refresh" size={20} color="white" />
                    </TouchableOpacity>
                </View>
              </View>

              <GlassCard className="mb-6 border-green-500/30">
                  <Text className="text-gray-400 text-sm">Valor Total del Inventario</Text>
                  <Text className="text-white text-4xl font-bold mt-1">
                      ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
              </GlassCard>

              <Text className="text-white text-xl font-bold mb-4">Valor por Categoría</Text>
          </View>
        }
        data={categoryStats}
        keyExtractor={item => item.category}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">No hay datos suficientes.</Text>
        }
      />
    </View>
  );
}

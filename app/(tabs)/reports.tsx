import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { useSQLiteContext } from 'expo-sqlite';
import { useTycoon } from '../../context/TycoonContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Reports() {
  const db = useSQLiteContext();
  const { netValuation, stats, showToast, unlockAchievement, refreshTycoon } = useTycoon();
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleExport = async () => {
    try {
      const allAssets = await db.getAllAsync('SELECT * FROM assets');
      const data = {
        empireValue: netValuation,
        stats: stats,
        inventory: allAssets,
        exportedAt: new Date().toISOString()
      };
      
      const fileUri = `${(FileSystem as any).documentDirectory}managex_empire_report.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        await unlockAchievement('EXPORT_DATA');
      } else {
        showToast('La función de compartir no está disponible en este dispositivo', 'error');
      }
    } catch (e) {
      console.error('Export error:', e);
      showToast('Error al generar el reporte', 'error');
    }
  };

  const loadReportData = useCallback(async () => {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT category, COUNT(*) as count, SUM(cost) as total FROM assets WHERE status != "Disposed" GROUP BY category'
      );
      setCategories(result || []);
    } catch (e) {
      console.error('Error loading report data:', e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadReportData();
      refreshTycoon();
    }, [loadReportData, refreshTycoon])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between mb-8">
            <Text className="text-white text-3xl font-black tracking-tightest">ESTADÍSTICAS</Text>
            <TouchableOpacity 
                onPress={handleExport}
                activeOpacity={0.7}
                className="w-12 h-12 rounded-2xl bg-neon-purple/10 items-center justify-center border border-neon-purple/20"
            >
                <Ionicons name="share-outline" size={24} color="#a855f7" />
            </TouchableOpacity>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Main Financial Card */}
          <GlassCard className="mb-6 bg-neon-purple/5 border-white/5" tint="dark">
            <View className="flex-row items-center justify-between mb-4">
               <View className="flex-1">
                 <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Valor Neto del Imperio</Text>
                 <Text className="text-white text-4xl font-black mt-1 leading-none">${netValuation.toLocaleString()}</Text>
               </View>
               <View className="w-14 h-14 rounded-2xl bg-neon-purple/20 items-center justify-center border border-neon-purple/30">
                 <Ionicons name="stats-chart" size={28} color="#a855f7" />
               </View>
            </View>
            <View className="h-[1px] bg-white/5 w-full mb-4" />
            <View className="flex-row justify-between">
               <View>
                 <Text className="text-gray-500 text-[9px] font-black uppercase">Ingresos Totales</Text>
                 <Text className="text-neon-cyan font-black text-base">${stats.totalRevenue.toLocaleString()}</Text>
               </View>
               <View className="items-end">
                 <Text className="text-gray-500 text-[9px] font-black uppercase">Capital Humano</Text>
                 <Text className="text-neon-indigo font-black text-base">{stats.employees} Empleados</Text>
               </View>
            </View>
          </GlassCard>

          <Text className="text-white text-lg font-black mb-4 tracking-tight">Desglose por Categoría</Text>
          
          {categories.length === 0 ? (
            <GlassCard className="items-center py-10 border-white/5" gradientBorder={false}>
                <Text className="text-gray-500 font-medium">No hay activos registrados para reportar</Text>
            </GlassCard>
          ) : (
            <View className="pb-32">
              {categories.map((cat, idx) => (
                <GlassCard key={idx} className="mb-4 p-4 border-white/5" gradientBorder={false}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center mr-4 border border-white/5">
                        <Ionicons name="pricetag-outline" size={20} color="#94a3b8" />
                      </View>
                      <View>
                        <Text className="text-white font-bold text-base">{cat.category}</Text>
                        <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{cat.count} unidades</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-white font-black text-lg leading-tight">${cat.total.toLocaleString()}</Text>
                      <Text className="text-neon-purple text-[9px] font-black uppercase opacity-60">
                        {((cat.total / (netValuation || 1)) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <View className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                      <View 
                        className="h-full bg-neon-purple shadow-sm shadow-neon-purple" 
                        style={{ width: `${(cat.total / (netValuation || 1)) * 100}%` }} 
                      />
                  </View>
                </GlassCard>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

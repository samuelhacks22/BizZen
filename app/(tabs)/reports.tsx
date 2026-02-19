import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Share, Alert, Image } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTycoon } from '../../context/TycoonContext';

// Tipo de dato para estadísticas por categoría
type CategoryStat = {
  category: string; // Nombre de la categoría
  totalValue: number; // Valor total en dólares
  count: number; // Cantidad de activos
  avgValue?: number; // Valor promedio (opcional)
};

// Pantalla de Reportes y Análisis
export default function Reports() {
  const db = useSQLiteContext(); // Hook de base de datos
  const { addXP } = useTycoon(); // Hook de lógica del juego
  const [categoryStats, setCategoryStats] = useState<CategoryStat[]>([]); // Estadísticas por categoría
  const [totalValue, setTotalValue] = useState(0); // Valor total del inventario

  // Cargar estadísticas y agrupar por categoría
  const loadStats = useCallback(async () => {
    try {
      // Consulta SQL para agrupar activos por categoría y sumar costos
      const result = await db.getAllAsync<CategoryStat>(`
        SELECT category, SUM(cost) as totalValue, COUNT(*) as count 
        FROM assets 
        WHERE status != 'Disposed' 
        GROUP BY category
        ORDER BY totalValue DESC
      `);
      setCategoryStats(result);

      // Calcular el valor total sumando todas las categorías
      const total = result.reduce((acc, curr) => acc + (curr.totalValue || 0), 0);
      setTotalValue(total);
    } catch (e) {
      console.error(e);
    }
  }, [db]);

  // Recargar estadísticas al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  // Función para exportar datos del inventario (JSON)
  const handleExport = async () => {
    try {
        const allAssets = await db.getAllAsync('SELECT * FROM assets');
        const jsonString = JSON.stringify(allAssets, null, 2);
        
        // Compartir el JSON usando la API nativa de compartir
        await Share.share({
            message: jsonString,
            title: 'Exportación de Inventario Managex'
        });
        await addXP(500); // Recompensa de 500 XP por exportar
    } catch (e) {
        Alert.alert("Error", "Error al exportar datos");
    }
  };


  // Renderizar cada fila de estadística (barra de progreso visual)
  const renderItem = ({ item, index }: { item: CategoryStat, index: number }) => {
    // Calcular porcentaje relativo al total
    const percentage = totalValue > 0 ? (item.totalValue / totalValue) * 100 : 0;
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
        <GlassCard className="mb-5 mx-6" intensity={20}>
            {/* Encabezado de la tarjeta con nombre y total */}
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
            
            {/* Barra de Progreso Visual */}
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
        {/* Encabezado Principal */}
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
                    <Text className="text-gray-500 font-bold tracking-[3px] text-[9px] uppercase">ANÁLISIS DE DATOS</Text>
                </View>
                <Text className="text-white text-5xl font-black tracking-tightest">Estrategia<Text className="text-neon-purple opacity-60">.</Text></Text>
            </View>
            {/* Botones de Exportar y Recargar */}
            <View className="flex-row gap-4">
                <TouchableOpacity 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        handleExport();
                    }}
                    className="bg-white/5 border border-white/10 p-4 rounded-2xl shadow-2xl"
                >
                    <Ionicons name="share-social-outline" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        loadStats();
                    }}
                    className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-2xl"
                >
                    <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
            </View>
          </View>

          {/* Tarjeta de Resumen Total */}
          <GlassCard className="mb-8 border-white/5" intensity={40} parallax={true}>
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
                      <Text className="text-gray-500 text-[8px] font-black uppercase tracking-widest opacity-40">Auditoría en Tiempo Real</Text>
                  </View>
              </View>
          </GlassCard>

          {/* Separador de Distribución */}
          <View className="px-1 flex-row justify-between items-center mb-6">
              <View className="flex-row items-center">
                <Ionicons name="pie-chart-outline" size={18} color="rgba(255,255,255,0.4)" />
                <Text className="text-white font-black text-xl tracking-tight ml-4">Distribución</Text>
              </View>
              <View className="h-[1px] flex-1 bg-white/5 ml-8" />
          </View>
      </Animated.View>

      {/* Lista de Categorías */}
      <FlatList
        data={categoryStats}
        keyExtractor={item => item.category}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          // Estado Vacío
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

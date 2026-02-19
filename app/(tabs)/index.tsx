import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, Image, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { Ionicons } from '@expo/vector-icons';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useFocusEffect } from 'expo-router';
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing 
} from 'react-native-reanimated';
import { TycoonHeader } from '../../components/TycoonHeader';
import { XPPopOver } from '../../components/XPPopOver';
import { useTycoon } from '../../context/TycoonContext';

// Pantalla principal del Tablero (Dashboard)
export default function Dashboard() {
  const db = useSQLiteContext(); // Hook para acceder a la base de datos
  // Estado para almacenar las estadísticas financieras y de inventario
  const [stats, setStats] = useState({ 
    totalValue: 0, 
    totalAssets: 0, 
    activeCount: 0,
    repairCount: 0 
  });
  const [refreshing, setRefreshing] = useState(false); // Estado para controlar el refresco manual
  const [showXP, setShowXP] = useState(false); // Estado para mostrar la animación de ganancia de XP
  const { addXP, addRevenue } = useTycoon(); // Funciones del contexto Tycoon

  // Función para cargar datos de la base de datos
  const loadData = useCallback(async () => {
    try {
      // Obtener el valor total de los activos (excluyendo los eliminados)
      const valueResult = await db.getAllAsync<{ total: number }>('SELECT SUM(cost) as total FROM assets WHERE status != "Disposed"');
      // Obtener el conteo total de activos funcionales
      const countResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status != "Disposed"');
      
      // Obtener conteos específicos por estado
      const activeResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status = "Active"');
      const repairResult = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM assets WHERE status = "In Repair"');

      // Calcular el porcentaje de salud del inventario
      const healthPercent = countResult[0]?.count > 0 
        ? Math.round((activeResult[0]?.count / countResult[0]?.count) * 100) 
        : 0;

      // Actualizar el estado con los nuevos datos
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

  // Cargar datos cada vez que la pantalla obtiene el foco
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Valor compartido para la animación de flotación
  const floatValue = useSharedValue(0);

  // Configurar la animación de flotación continua
  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2500, easing: Easing.inOut(Easing.sin) }), // Mover arriba
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })    // Mover abajo
      ),
      -1, // Infinito
      true
    );
  }, []);

  // Estilo animado para aplicar la transformación de flotación
  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }]
  }));


  // Manejador para la acción de refrescar (pull-to-refresh)
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
        {/* Encabezado animado de la sección */}
        <Animated.View 
            entering={FadeInDown.delay(200).springify()}
            className="pt-12 px-6 pb-6"
        >
          <View className="flex-row items-center mb-3">
            {/* Icono pequeño de la app */}
            <View className="w-8 h-8 rounded-xl bg-white/5 items-center justify-center border border-white/5 mr-4 overflow-hidden">
                <Image 
                    source={require('../../assets/icon.png')} 
                    style={{ width: 18, height: 18 }}
                    resizeMode="contain"
                />
            </View>
            <Text className="text-gray-500 font-black tracking-[4px] text-[8px] uppercase opacity-40">Control del Sistema</Text>
          </View>
          <Text className="text-white text-5xl font-black tracking-tightest">
            Control<Text className="text-neon-cyan opacity-40">.</Text>
          </Text>
        </Animated.View>

        {/* Encabezado de estado Tycoon (Nivel, XP) */}
        <TycoonHeader />

        {/* Segmento Hero: Valoración Neta (Tarjeta flotante) */}
        <Animated.View 
            entering={FadeInRight.delay(300).springify()}
            className="px-6 mb-8"
            style={floatingStyle}
        >
          <GlassCard intensity={30} className="border-white/5 py-10" gradientBorder={true} parallax={true}>
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

        {/* Encabezado de la cuadrícula de módulos */}
        <View className="px-6 mb-4 flex-row justify-between items-center">
            <Text className="text-white font-black text-lg tracking-tight">Módulos</Text>
            <TouchableOpacity className="bg-white/5 p-2 rounded-xl">
                 <Ionicons name="apps-outline" size={14} color="rgba(255,255,255,0.2)" />
            </TouchableOpacity>
        </View>

        {/* Cuadrícula Modular Global */}
        <View className="flex-row flex-wrap px-4 pb-12">
          {/* Módulo 1: Resumen de Inventario */}
          <Animated.View entering={FadeInDown.delay(400).springify()} className="w-1/2 p-2">
            <GlassCard intensity={25} className="h-44" gradientBorder={true} parallax={true}>
              <View className="h-full justify-between">
                <View className="bg-neon-cyan/10 w-12 h-12 rounded-2xl items-center justify-center border border-neon-cyan/20">
                   <Ionicons name="layers-outline" size={24} color="#22d3ee" className="opacity-60" />
                </View>
                <View>
                    <Text className="text-neon-cyan text-[10px] font-bold uppercase tracking-[2px] mb-1 opacity-60">Inventario</Text>
                    <Text className="text-white text-4xl font-black tracking-tightest">{stats.totalAssets}</Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Módulo 2: Salud del Sistema */}
          <Animated.View entering={FadeInDown.delay(500).springify()} className="w-1/2 p-2">
            <GlassCard intensity={25} className="h-44" gradientBorder={true} parallax={true}>
              <View className="h-full justify-between">
                <View className="bg-neon-cyan/10 w-12 h-12 rounded-2xl items-center justify-center border border-neon-cyan/20">
                   <Ionicons name="flash-outline" size={24} color="#22d3ee" className="opacity-60" />
                </View>
                <View>
                    <Text className="text-neon-cyan text-[10px] font-bold uppercase tracking-[2px] mb-1 opacity-60">Salud</Text>
                    <View className="flex-row items-baseline">
                        <Text className="text-white text-4xl font-black tracking-tightest">{stats.activeCount}</Text>
                        <Text className="text-neon-cyan text-[10px] font-bold ml-1.5 opacity-40">%</Text>
                    </View>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
          
          {/* Módulo 3: Ingresos Mensuales (Ancho completo) */}
           <Animated.View entering={FadeInDown.delay(600).springify()} className="w-full p-2">
            <GlassCard intensity={30} className="border-neon-cyan/20" gradientBorder={true}>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                    <View className="bg-neon-cyan/10 w-16 h-16 rounded-[32px] items-center justify-center mr-5 border border-neon-cyan/20">
                      <Ionicons name="cash-outline" size={26} color="#22d3ee" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-neon-cyan text-[10px] font-bold uppercase tracking-[3px] mb-1 opacity-60">Ingresos Mensuales</Text>
                      <View className="flex-row items-baseline">
                          <Text className="text-white text-3xl font-black tracking-tightest">Recolectar</Text>
                      </View>
                    </View>
                </View>
                {/* Botón para recolectar ingresos y XP */}
                <TouchableOpacity 
                  onPress={() => {
                    addXP(100);
                    addRevenue(500); // Generar ingresos virtuales
                    setShowXP(true);
                  }}
                  className="bg-neon-cyan p-4 rounded-2xl shadow-neon shadow-neon-cyan/50"
                >
                   <Ionicons name="gift-outline" size={20} color="black" />
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>

          {/* Animación de XP flotante cuando se activa */}
          {showXP && <XPPopOver amount={100} onComplete={() => setShowXP(false)} />}
        </View>

      </ScrollView>
    </ScreenWrapper>
  );
}

import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInLeft, FadeInRight, FadeInUp } from 'react-native-reanimated';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { TycoonHeader } from '../../components/TycoonHeader';
import { GlassCard } from '../../components/GlassCard';
import { RankBadge } from '../../components/RankBadge';
import { useTycoon } from '../../context/TycoonContext';

export default function Dashboard() {
  const { stats, currentRank, netValuation, addRevenue, addXP, showToast, refreshTycoon } = useTycoon();
  const [saleAmount, setSaleAmount] = useState('');

  useFocusEffect(
    useCallback(() => {
        refreshTycoon();
    }, [refreshTycoon])
  );

  const handleRegisterSale = async () => {
    const amount = parseFloat(saleAmount);
    if (isNaN(amount) || amount <= 0) {
      showToast('Monto de venta inválido', 'error');
      return;
    }

    try {
      await addRevenue(amount);
      await addXP(100); // Recompensa fija por operación de venta
      showToast(`¡Venta de $${amount.toLocaleString()} procesada!`, 'success');
      setSaleAmount('');
    } catch (e) {
      showToast('Error al procesar la venta', 'error');
    }
  };

  return (
    <ScreenWrapper>
      <TycoonHeader />
      
      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="py-6">
          {/* Grid de Estadísticas Principales */}
          <View className="flex-row gap-4 mb-6">
            <Animated.View entering={FadeInLeft.delay(200).springify()} className="flex-1">
                <GlassCard className="p-4 flex-1 border-white/5" gradientBorder={false}>
                <View className="w-8 h-8 rounded-xl bg-neon-cyan/20 items-center justify-center border border-neon-cyan/20">
                    <Ionicons name="cash-outline" size={18} color="#22d3ee" />
                </View>
                <Text className="text-gray-500 text-[9px] font-black uppercase mt-3 tracking-widest">Valoración Total</Text>
                <Text className="text-white text-xl font-black mt-1">${netValuation.toLocaleString()}</Text>
                </GlassCard>
            </Animated.View>
            
            <Animated.View entering={FadeInRight.delay(200).springify()} className="flex-1">
                <GlassCard 
                  className="p-4 flex-1 border-white/5" 
                  gradientBorder={false}
                  isPressable={true}
                  onPress={() => router.push('/employees')}
                >
                <View className="w-8 h-8 rounded-xl bg-neon-purple/20 items-center justify-center border border-neon-purple/20">
                    <Ionicons name="people-outline" size={18} color="#a855f7" />
                </View>
                <Text className="text-gray-500 text-[9px] font-black uppercase mt-3 tracking-widest">Nómina Mensual</Text>
                <Text className="text-white text-xl font-black mt-1">-${(stats.employees * 2500).toLocaleString()}</Text>
                </GlassCard>
            </Animated.View>
          </View>

          {/* Panel de Operaciones de Venta */}
          <Animated.View entering={FadeInUp.delay(400).springify()} className="mb-8">
            <GlassCard className="p-6 border-neon-cyan/10 bg-neon-cyan/5" gradientBorder={true}>
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-white text-lg font-black tracking-tight">Registro de Ventas</Text>
                <View className="w-8 h-8 rounded-full bg-neon-cyan/20 items-center justify-center">
                    <Ionicons name="cart-outline" size={18} color="#22d3ee" />
                </View>
              </View>
              
              <View className="flex-row items-center bg-black/40 rounded-2xl p-2 border border-white/5">
                <TextInput 
                  className="flex-1 text-white px-4 font-bold text-lg"
                  placeholder="Monto ($)"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                  value={saleAmount}
                  onChangeText={setSaleAmount}
                />
                <TouchableOpacity 
                  onPress={handleRegisterSale}
                  activeOpacity={0.8}
                  className="bg-neon-cyan px-6 py-3 rounded-xl shadow-lg shadow-cyan-400/50"
                >
                  <Text className="text-black font-black text-xs">VENDER</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-neon-cyan/40 text-[9px] uppercase font-black text-center mt-4 tracking-[3px]">
                BONIFICACIÓN: +100 XP
              </Text>
            </GlassCard>
          </Animated.View>

          {/* Métricas Operativas */}
          <Text className="text-white text-lg font-black mb-4 tracking-tight">Métricas de Rendimiento</Text>
          
          <Animated.View entering={FadeInLeft.delay(600).springify()}>
            <GlassCard className="mb-4 border-white/5">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-2xl bg-neon-green/10 items-center justify-center mr-3 border border-neon-green/20">
                            <Ionicons name="happy-outline" size={20} color="#10b981" />
                        </View>
                        <View>
                            <Text className="text-white font-bold">Satisfacción</Text>
                            <Text className="text-gray-500 text-[10px]">Experiencia del cliente</Text>
                        </View>
                    </View>
                    <Text className="text-neon-green font-black text-xl">{stats.satisfaction}%</Text>
                </View>
                <View className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <View className="h-full bg-neon-green shadow-sm shadow-neon-green" style={{ width: `${stats.satisfaction}%` }} />
                </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInRight.delay(700).springify()}>
            <GlassCard className="mb-32 border-white/5">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-2xl bg-neon-indigo/10 items-center justify-center mr-3 border border-neon-indigo/20">
                            <Ionicons name="star-outline" size={20} color="#6366f1" />
                        </View>
                        <View>
                            <Text className="text-white font-bold">Reputación</Text>
                            <Text className="text-gray-500 text-[10px]">Influencia de mercado</Text>
                        </View>
                    </View>
                    <Text className="text-neon-indigo font-black text-xl">{stats.reputation}/100</Text>
                </View>
                <View className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <View className="h-full bg-neon-indigo shadow-sm shadow-neon-indigo" style={{ width: `${stats.reputation}%` }} />
                </View>
            </GlassCard>
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

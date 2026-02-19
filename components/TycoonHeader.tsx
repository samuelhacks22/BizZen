import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTycoon } from '../context/TycoonContext';
import { GlassCard } from './GlassCard';
import Animated, { 
  FadeInDown, 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  Easing 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { RankBadge } from './RankBadge';
import { RanksModal } from './RanksModal';

// Encabezado del juego que muestra el progreso del usuario
export function TycoonHeader() {
  const { stats, nextLevelXP, progress, currentRank } = useTycoon();
  const [showRanks, setShowRanks] = useState(false);
  const shimmer = useSharedValue(-1);

  // Animación de brillo para la barra de progreso
  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 2000, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(shimmer.value, [-1, 1], [-300, 300]) }]
  }));

  // Animación suave de pulso para el nivel
  const pulseScale = useSharedValue(1);
  useEffect(() => {
      pulseScale.value = withRepeat(
          withSequence(
              withTiming(1.03, { duration: 1500 }),
              withTiming(1, { duration: 1500 })
          ),
          -1,
          true
      );
  }, []);

  const levelStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }]
  }));

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} className="px-6 mt-4 mb-2">
      <GlassCard intensity={20} className="p-4 border-white/5">
        <View className="flex-row justify-between items-center mb-3">
          <TouchableOpacity onPress={() => setShowRanks(true)} className="flex-row items-center">
             <LinearGradient
                colors={['#22d3ee', '#818cf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="w-10 h-10 rounded-xl items-center justify-center shadow-lg shadow-cyan-500/50"
            >
                <Ionicons name={currentRank.icon as any} size={20} color="black" />
            </LinearGradient>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setShowRanks(true)} className="items-end">
            <View className="flex-row items-center mb-1">
                <Text className="text-gray-500 text-[10px] font-bold uppercase tracking-[2px] mr-2">Nivel</Text>
                <Animated.Text style={levelStyle} className="text-white text-2xl font-black">{stats.level}</Animated.Text>
            </View>
            <View className="bg-neon-cyan/10 px-3 py-1 rounded-full border border-neon-cyan/20">
                <Text className="text-neon-cyan text-[9px] font-black uppercase tracking-[2px]">{currentRank.name}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="items-end mb-3">
            <Text className="text-gray-500 font-bold uppercase tracking-[2px] text-[8px] opacity-40">XP para Siguiente Nivel</Text>
            <Text className="text-white font-black text-sm">{stats.xp} / {nextLevelXP}</Text>
          </View>

        {/* Contenedor de Barra de Progreso */}
        <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <View 
            className="h-full bg-neon-cyan" 
            style={{ width: `${progress}%`, shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 5 }} 
          >
              <Animated.View style={[shimmerStyle, { width: '100%', height: '100%' }]}>
                <LinearGradient
                    colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ width: 100, height: '100%' }}
                />
              </Animated.View>
          </View>
        </View>
      </GlassCard>

      <RanksModal 
        visible={showRanks} 
        onClose={() => setShowRanks(false)} 
        currentRankTier={currentRank.tier}
        totalRevenue={stats.totalRevenue}
      />
    </Animated.View>
  );
}

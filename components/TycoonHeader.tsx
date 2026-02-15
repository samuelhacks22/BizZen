import React from 'react';
import { View, Text } from 'react-native';
import { useTycoon } from '../context/TycoonContext';
import { GlassCard } from './GlassCard';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function TycoonHeader() {
  const { stats, nextLevelXP, progress } = useTycoon();

  return (
    <Animated.View entering={FadeInDown.delay(100).springify()} className="px-6 mt-4 mb-2">
      <GlassCard intensity={20} className="p-4 border-white/5">
        <View className="flex-row justify-between items-center mb-3">
          <View>
            <Text className="text-gray-500 font-bold uppercase tracking-[2px] text-[8px] opacity-40">Nivel Empresarial</Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-2xl font-black">Lvl {stats.level}</Text>
              <Text className="text-neon-cyan text-[10px] font-bold ml-2 opacity-60">Director</Text>
            </View>
          </View>
          <View className="items-end">
            <Text className="text-gray-500 font-bold uppercase tracking-[2px] text-[8px] opacity-40">XP para Siguiente Nivel</Text>
            <Text className="text-white font-black text-sm">{stats.xp} / {nextLevelXP}</Text>
          </View>
        </View>

        {/* Progress Bar Container */}
        <View className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
          <View 
            className="h-full bg-neon-cyan" 
            style={{ width: `${progress}%`, shadowColor: '#22d3ee', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 5 }} 
          />
        </View>

        {/* Glossy overlay for bar */}
        <View className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
           {/* Add subtle gradient or lighting effect if needed */}
        </View>
      </GlassCard>
    </Animated.View>
  );
}

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { useAuth } from '../../context/AuthContext';
import { useTycoon, ACHIEVEMENTS } from '../../context/TycoonContext';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { TycoonHeader } from '../../components/TycoonHeader';

export default function Profile() {
  const { user, logout } = useAuth();
  const { stats, netValuation } = useTycoon();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Encabezado Principal */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          className="pt-12 px-8 pb-4"
        >
          <View className="flex-row items-center mb-3">
            <View className="bg-neon-cyan/20 w-10 h-10 rounded-xl items-center justify-center mr-4 border border-neon-cyan/30">
              <Ionicons name="person-outline" size={24} color="#22d3ee" />
            </View>
            <Text className="text-gray-500 font-black tracking-[4px] text-[10px] uppercase opacity-60">Perfil del Tycoon</Text>
          </View>
          <Text className="text-white text-5xl font-black tracking-tightest">
            {user?.username || 'Usuario'}<Text className="text-neon-cyan opacity-40">.</Text>
          </Text>
        </Animated.View>

        {/* TycoonHeader Component */}
        <TycoonHeader />

        {/* Stats Grid */}
        <View className="flex-row flex-wrap px-4 mb-2 mt-4">
          <Animated.View entering={FadeInRight.delay(300).springify()} className="w-1/2 p-2">
            <GlassCard intensity={20} className="items-center p-4 h-32 justify-center border-white/5">
              <View className="bg-neon-purple/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                <Ionicons name="wallet-outline" size={20} color="#a855f7" />
              </View>
              <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest text-center mt-2">Valoración Neta</Text>
              <Text className="text-white font-black text-xl mt-1">${netValuation.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</Text>
            </GlassCard>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(400).springify()} className="w-1/2 p-2">
            <GlassCard intensity={20} className="items-center p-4 h-32 justify-center border-white/5">
              <View className="bg-green-500/20 w-10 h-10 rounded-full items-center justify-center mb-2">
                <Ionicons name="star-outline" size={20} color="#4ade80" />
              </View>
              <Text className="text-gray-500 text-[9px] font-black uppercase tracking-widest text-center mt-2">Experiencia</Text>
              <Text className="text-white font-black text-xl mt-1">{stats.xp}</Text>
            </GlassCard>
          </Animated.View>
        </View>

        {/* Global Stats */}
        <Animated.View entering={FadeInDown.delay(500).springify()} className="px-6 mb-8 mt-2">
          <GlassCard intensity={25} className="p-6 border-white/5">
            <Text className="text-white font-black text-lg mb-6">Métricas Globales</Text>
            
            <View className="flex-row justify-between items-center mb-5 border-b border-white/5 pb-5">
              <View className="flex-row items-center">
                <View className="bg-blue-500/20 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Ionicons name="calendar-outline" size={16} color="#3b82f6" />
                </View>
                <Text className="text-gray-300 text-sm font-bold uppercase tracking-wider">Días Activos</Text>
              </View>
              <Text className="text-white font-black text-xl">{stats.daysActive}</Text>
            </View>
            
            <View className="flex-row justify-between items-center mb-5 border-b border-white/5 pb-5">
              <View className="flex-row items-center">
                <View className="bg-yellow-500/20 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Ionicons name="people-outline" size={16} color="#eab308" />
                </View>
                <Text className="text-gray-300 text-sm font-bold uppercase tracking-wider">Empleados Sim.</Text>
              </View>
              <Text className="text-white font-black text-xl">{stats.employees}</Text>
            </View>

            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View className="bg-red-500/20 w-8 h-8 rounded-full items-center justify-center mr-3">
                  <Ionicons name="heart-outline" size={16} color="#ef4444" />
                </View>
                <Text className="text-gray-300 text-sm font-bold uppercase tracking-wider">Satisfacción</Text>
              </View>
              <Text className="text-white font-black text-xl">{stats.satisfaction}%</Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Logros (Achievements) */}
        <Animated.View entering={FadeInDown.delay(550).springify()} className="px-6 mb-8 mt-2">
          <Text className="text-white font-black text-lg mb-4">Medallas Tycoon</Text>
          <View className="flex-row flex-wrap gap-3">
            {ACHIEVEMENTS.map((achievement) => {
                const isUnlocked = stats.unlockedAchievements?.includes(achievement.id);
                return (
                    <GlassCard 
                        key={achievement.id} 
                        intensity={isUnlocked ? 30 : 10} 
                        className={`w-[47%] p-4 items-center justify-center border ${isUnlocked ? 'border-neon-cyan/50 bg-neon-cyan/10' : 'border-white/5 opacity-50'}`}
                    >
                        <View className={`w-12 h-12 rounded-full items-center justify-center mb-2 ${isUnlocked ? 'bg-neon-cyan/20' : 'bg-white/5'}`}>
                            <Ionicons name={achievement.icon as any} size={24} color={isUnlocked ? "#22d3ee" : "rgba(255,255,255,0.3)"} />
                        </View>
                        <Text className={`text-center font-black ${isUnlocked ? 'text-white' : 'text-gray-500'}`} numberOfLines={1}>{achievement.title}</Text>
                        <Text className="text-gray-500 text-[8px] text-center mt-1" numberOfLines={2}>{achievement.description}</Text>
                        {!isUnlocked && (
                            <View className="absolute top-2 right-2">
                                <Ionicons name="lock-closed" size={12} color="rgba(255,255,255,0.2)" />
                            </View>
                        )}
                    </GlassCard>
                );
            })}
          </View>
        </Animated.View>

        {/* Account Actions */}
        <Animated.View entering={FadeInDown.delay(600).springify()} className="px-6 mb-8">
            <Text className="text-white/50 text-[10px] font-black uppercase tracking-[3px] mb-4 ml-2">Ajustes de Cuenta</Text>
            <NeonButton 
                variant="danger" 
                title="Cerrar Sesión" 
                icon="log-out-outline"
                onPress={logout}
            />
        </Animated.View>

      </ScrollView>
    </ScreenWrapper>
  );
}

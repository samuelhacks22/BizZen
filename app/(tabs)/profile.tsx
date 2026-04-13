import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { useAuth } from '../../context/AuthContext';
import { useTycoon, ACHIEVEMENTS } from '../../context/TycoonContext';
import { RankBadge } from '../../components/RankBadge';
import { AchievementCard } from '../../components/AchievementCard';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Profile() {
  const db = useSQLiteContext();
  const { user, logout } = useAuth();
  const { currentRank, stats, showToast, refreshTycoon } = useTycoon();

  return (
    <ScreenWrapper>
      <ScrollView className="flex-1 px-6 pt-10" showsVerticalScrollIndicator={false}>
        <Text className="text-white text-3xl font-black mb-8 tracking-tightest">PERFIL</Text>
        
        <Animated.View entering={FadeInUp.springify()}>
            <GlassCard className="items-center py-8 mb-6 border-white/5" parallax>
            <View className="mb-4">
                <RankBadge rank={currentRank} size="large" />
            </View>
            <Text className="text-white text-2xl font-black">{user?.username || 'Magnate del Mañana'}</Text>
            <View className="bg-neon-cyan/20 px-4 py-1 rounded-full mt-2 border border-neon-cyan/30">
                <Text className="text-neon-cyan text-[10px] font-black uppercase tracking-widest">{currentRank.name}</Text>
            </View>
            </GlassCard>
        </Animated.View>

        <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white text-lg font-black tracking-tight">Carrera de Logros</Text>
            <Text className="text-gray-500 text-[10px] font-black uppercase">
                {stats.unlockedAchievements.length} / {ACHIEVEMENTS.length}
            </Text>
        </View>
        
        <View className="mb-10">
            {ACHIEVEMENTS.map((achievement) => (
                <AchievementCard 
                    key={achievement.id}
                    achievement={achievement}
                    isUnlocked={stats.unlockedAchievements.includes(achievement.id)}
                />
            ))}
        </View>

        <View className="mb-32">
            <NeonButton 
                title="REINICIAR IMPERIO" 
                variant="primary" 
                color="#f43f5e"
                onPress={() => {
                    Alert.alert(
                        '¡ADVERTENCIA CRÍTICA!',
                        'Estás a punto de borrar todo tu imperio: activos, empleados y progreso. Esta acción no se puede deshacer.',
                        [
                            { text: 'CANCELAR', style: 'cancel' },
                            { 
                                text: 'SÍ, BORRAR TODO', 
                                style: 'destructive',
                                onPress: async () => {
                                    try {
                                        await db.execAsync('DELETE FROM assets');
                                        await db.execAsync('DELETE FROM employees');
                                        await db.execAsync('UPDATE tycoon_stats SET level = 1, xp = 0, total_revenue = 0, unlocked_achievements = "[]" WHERE id = 1');
                                        showToast('Imperio reiniciado con éxito', 'success');
                                        const { restart } = require('expo-router');
                                        // Simple refresh
                                        await refreshTycoon();
                                    } catch (e) {
                                        showToast('Error al reiniciar', 'error');
                                    }
                                }
                            }
                        ]
                    );
                }}
                className="mb-4"
                icon="refresh-outline"
            />
            <NeonButton 
                title="CERRAR SESIÓN" 
                variant="secondary" 
                onPress={logout}
                icon="log-out-outline"
            />
            <Text className="text-gray-600 text-center text-[10px] mt-6 font-bold uppercase tracking-widest">Managex Tycoon v1.0.0</Text>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
}

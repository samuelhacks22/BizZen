import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { AchievementInfo } from '../context/TycoonContext';
import { LinearGradient } from 'expo-linear-gradient';

interface AchievementCardProps {
    achievement: AchievementInfo;
    isUnlocked: boolean;
}

export function AchievementCard({ achievement, isUnlocked }: AchievementCardProps) {
    return (
        <GlassCard 
            className={`mb-4 border-white/5 ${!isUnlocked ? 'opacity-40' : ''}`}
            gradientBorder={isUnlocked}
            intensity={isUnlocked ? 25 : 10}
        >
            <View className="flex-row items-center">
                <View className="relative">
                    <LinearGradient
                        colors={isUnlocked ? ['#fbbf24', '#f59e0b'] : ['#334155', '#1e293b']}
                        className="w-14 h-14 rounded-2xl items-center justify-center border border-white/10"
                    >
                        <Ionicons 
                            name={achievement.icon as any} 
                            size={28} 
                            color={isUnlocked ? '#000' : '#475569'} 
                        />
                    </LinearGradient>
                    {!isUnlocked && (
                        <View className="absolute -bottom-1 -right-1 bg-space-950 rounded-full p-1 border border-white/10">
                            <Ionicons name="lock-closed" size={12} color="#475569" />
                        </View>
                    )}
                </View>
                
                <View className="flex-1 ml-4">
                    <Text className={`font-black text-lg ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.title}
                    </Text>
                    <Text className="text-gray-500 text-xs mt-1" numberOfLines={2}>
                        {achievement.description}
                    </Text>
                    {isUnlocked && (
                        <View className="flex-row items-center mt-2">
                             <Ionicons name="flash" size={12} color="#22d3ee" />
                             <Text className="text-neon-cyan text-[10px] font-black uppercase ml-1">
                                +{achievement.xpReward} XP Recompensados
                             </Text>
                        </View>
                    )}
                </View>
            </View>
        </GlassCard>
    );
}

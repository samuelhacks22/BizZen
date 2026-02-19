import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RankInfo } from '../context/TycoonContext';
import { LinearGradient } from 'expo-linear-gradient';

interface RankBadgeProps {
    rank: RankInfo;
    size?: 'small' | 'large';
}

// Componente para mostrar la insignia de rango
export function RankBadge({ rank, size = 'small' }: RankBadgeProps) {
    const isLarge = size === 'large';
    
    return (
        <View className="flex-row items-center">
            {/* Ícono con fondo degradado */}
            <LinearGradient
                colors={['#22d3ee', '#818cf8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className={isLarge ? "w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-cyan-500/50" : "w-7 h-7 rounded-lg items-center justify-center mr-3"}
            >
                <Ionicons name={rank.icon as any} size={isLarge ? 24 : 14} color="black" />
            </LinearGradient>
            
            <View>
                <Text className={`${isLarge ? "text-white text-xl font-black" : "text-neon-cyan text-[10px] font-black uppercase tracking-[2px]"}`}>
                    {rank.name}
                </Text>
                {isLarge && (
                    <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest opacity-60">
                        Rango Nivel {rank.tier}
                    </Text>
                )}
            </View>
        </View>
    );
}

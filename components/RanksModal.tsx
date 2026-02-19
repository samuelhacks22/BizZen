import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GlassCard } from './GlassCard';
import { RANKS, RankInfo } from '../context/TycoonContext';
import { RankBadge } from './RankBadge';
import { NeonButton } from './NeonButton';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

interface RanksModalProps {
    visible: boolean;
    onClose: () => void;
    currentRankTier: number;
    totalRevenue: number;
}

// Modal para mostrar los rangos disponibles y el progreso del usuario
export function RanksModal({ visible, onClose, currentRankTier, totalRevenue }: RanksModalProps) {
    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 bg-black/80 justify-end">
                <Animated.View 
                    entering={FadeInUp.springify()}
                    className="h-[85%] bg-space-950 rounded-t-[50px] overflow-hidden border-t border-white/10"
                >
                    {/* Encabezado del Modal */}
                    <View className="pt-8 px-8 pb-4 flex-row justify-between items-center">
                        <View>
                            <Text className="text-white text-3xl font-black tracking-tightest">Carrera</Text>
                            <Text className="text-neon-cyan text-[10px] font-bold uppercase tracking-[3px]">Tu Progresión Empresarial</Text>
                        </View>
                        <TouchableOpacity onPress={onClose} className="bg-white/5 p-3 rounded-2xl">
                            <Ionicons name="close" size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
                        {RANKS.map((rank, index) => (
                            <RankItem 
                                key={rank.tier} 
                                rank={rank} 
                                isLocked={rank.tier > currentRankTier}
                                isCurrent={rank.tier === currentRankTier}
                                totalRevenue={totalRevenue}
                            />
                        ))}
                    </ScrollView>

                    <View className="absolute bottom-10 left-8 right-8">
                        <NeonButton title="Entendido" onPress={onClose} variant="primary" />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// Componente para mostrar un elemento de rango individual
function RankItem({ rank, isLocked, isCurrent, totalRevenue }: { rank: RankInfo, isLocked: boolean, isCurrent: boolean, totalRevenue: number }) {
    // Requisitos (Simplificados basados en la lógica de TycoonContext)
    const requirements = [
        rank.tier === 1 ? '• $1,000 acumulado' : '',
        rank.tier === 2 ? '• $10,000 acumulado' : '',
        rank.tier === 3 ? '• $100,000 acumulado' : '',
        rank.tier === 4 ? '• $1,000,000 acumulado' : '',
        rank.tier === 5 ? '• $10,000,000 acumulado' : '',
        rank.tier === 6 ? '• Dominio absoluto del mercado' : '',
    ].filter(Boolean);

    // Meta de ingresos para calcular progreso
    const revenueGoal = rank.tier === 1 ? 1000 : 
                        rank.tier === 2 ? 10000 : 
                        rank.tier === 3 ? 100000 : 
                        rank.tier === 4 ? 1000000 : 
                        rank.tier === 5 ? 10000000 : Infinity;

    const progress = Math.min(100, (totalRevenue / revenueGoal) * 100);

    return (
        <Animated.View entering={FadeInDown.delay(rank.tier * 100).springify()} className="mb-6">
            <GlassCard 
                intensity={isCurrent ? 30 : 15} 
                className={`border-white/5 ${isLocked ? 'opacity-40' : ''} ${isCurrent ? 'border-neon-cyan/30' : ''}`}
                gradientBorder={isCurrent}
            >
                <View className="flex-row items-center justify-between mb-4">
                    <RankBadge rank={rank} size="small" />
                    {isLocked && <Ionicons name="lock-closed" size={16} color="rgba(255,255,255,0.2)" />}
                    {isCurrent && (
                        <View className="bg-neon-cyan/20 px-3 py-1 rounded-full border border-neon-cyan/30">
                            <Text className="text-neon-cyan text-[8px] font-black uppercase">Actual</Text>
                        </View>
                    )}
                </View>
                
                <Text className="text-gray-400 text-xs mb-4">{rank.description}</Text>
                
                <View className="mb-4">
                    <Text className="text-gray-500 text-[8px] font-bold uppercase tracking-widest mb-2">Requisitos</Text>
                    {requirements.map((req, i) => (
                        <Text key={i} className="text-white/60 text-[10px] mb-1">{req}</Text>
                    ))}
                </View>

                {isLocked && rank.tier <= 5 && (
                    <View className="mt-2">
                        <View className="flex-row justify-between mb-1">
                            <Text className="text-gray-600 text-[8px] font-bold uppercase">Progreso Financiero</Text>
                            <Text className="text-neon-cyan text-[8px] font-bold">{progress.toFixed(0)}%</Text>
                        </View>
                        <View className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <View className="h-full bg-neon-cyan" style={{ width: `${progress}%` }} />
                        </View>
                    </View>
                )}
            </GlassCard>
        </Animated.View>
    );
}

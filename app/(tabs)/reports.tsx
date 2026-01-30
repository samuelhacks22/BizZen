import React from 'react';
import { View, Text } from 'react-native';
import { GlassCard } from '../../components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';

export default function Reports() {
  return (
    <View className="flex-1 bg-slate-900 justify-center items-center">
       <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        className="absolute w-full h-full"
      />
      <GlassCard className="w-3/4 items-center">
        <Text className="text-white text-2xl font-bold mb-2">Reports</Text>
        <Text className="text-gray-400 text-center">Charts module coming soon with Victory Native!</Text>
      </GlassCard>
    </View>
  );
}

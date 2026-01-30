import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function Home() {
  return (
    <View className="flex-1 bg-slate-900 justify-center items-center">
      <LinearGradient
        colors={['#4c669f', '#3b5998', '#192f6a']}
        className="absolute w-full h-full"
      />
      
      <View className="p-8 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 items-center">
        <Text className="text-4xl font-bold text-white mb-2">BizZen</Text>
        <Text className="text-cyan-300 text-lg mb-6">Business Control & Zen</Text>
        
        <Link href="/dashboard" asChild>
          <TouchableOpacity className="bg-cyan-500 px-6 py-3 rounded-full shadow-lg shadow-cyan-500/50">
            <Text className="text-white font-bold text-lg">Enter Dashboard</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </View>
  );
}

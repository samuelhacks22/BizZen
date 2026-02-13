import React from 'react';
import { View, Text, Image } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { ParticleBackground } from '../components/ParticleBackground';
import Animated, { 
    FadeInDown, 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing,
    RotateInUpLeft
} from 'react-native-reanimated';

export default function Home() {
  const glow = useSharedValue(1);

  React.useEffect(() => {
    glow.value = withRepeat(
        withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
    );
  }, []);

  const animatedGlow = useAnimatedStyle(() => ({
    opacity: 0.3 + (glow.value - 1) * 0.4,
    transform: [{ scale: glow.value }],
  }));

  return (
    <View className="flex-1 bg-black justify-center items-center">
      {/* Dynamic Background */}
      <ParticleBackground />
      
      {/* Background Gradient for depth */}
      <LinearGradient
        colors={['transparent', 'rgba(168, 85, 247, 0.1)', 'transparent']}
        className="absolute w-full h-full"
      />
      
      <GlassCard 
        className="w-[88%] max-w-[380px] items-center border-white/5 py-10 px-8 bg-space-900/10" 
        intensity={40}
      >
        <Animated.View entering={FadeInDown.delay(400).springify().damping(12)} className="items-center mb-10">
            {/* Spatial Animated Logo Container */}
            <View className="relative w-28 h-28 items-center justify-center mb-6">
                <Animated.View 
                    style={animatedGlow}
                    className="absolute w-24 h-24 rounded-full bg-neon-cyan/20 blur-3xl" 
                />
                <View className="w-24 h-24 rounded-[32px] bg-black/40 items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                    <Image 
                        source={require('../assets/icon.png')} 
                        style={{ width: 60, height: 60 }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            <Text className="text-5xl font-black text-white tracking-tightest">
                Manage<Text className="text-neon-cyan opacity-40">X</Text>
            </Text>
            
            <View className="flex-row items-center mt-3">
                <View className="h-[1px] w-6 bg-white/10 mr-4" />
                <Text className="text-gray-500 text-[9px] font-bold tracking-[6px] uppercase opacity-50">
                    Spatial UI
                </Text>
                <View className="h-[1px] w-6 bg-white/10 ml-4" />
            </View>
        </Animated.View>

        <View className="w-full">
             <Link href="/(tabs)" asChild>
                <NeonButton 
                    title="Control Panel" 
                    variant="primary" 
                    icon="enter-outline"
                    className="w-full"
                />
            </Link>
            
            <View className="h-10" />
            
            <Text className="text-gray-700 text-center text-[9px] font-bold uppercase tracking-[4px] opacity-30">
                MANAGE X • 2026
            </Text>
        </View>
      </GlassCard>
    </View>
  );
}

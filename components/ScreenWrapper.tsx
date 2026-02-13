import React from 'react';
import { View, ViewProps, SafeAreaView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ParticleBackground } from './ParticleBackground';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  showParticles?: boolean;
}

export function ScreenWrapper({ children, style, showParticles = true, className, ...props }: ScreenWrapperProps) {
  return (
    <View className="flex-1 bg-space-950" {...props}>
      <StatusBar barStyle="light-content" />
      
      {/* Mesh Gradient Base */}
      <View className="absolute w-full h-full overflow-hidden">
        <LinearGradient
            colors={['#030712', '#0f172a']}
            className="absolute w-full h-full"
        />
        
        {/* Secondary Ambient Glow */}
        <View className="absolute -top-[10%] -right-[20%] w-[80%] h-[60%] rounded-full bg-neon-purple/10 blur-[100px]" />
        <View className="absolute top-[40%] -left-[30%] w-[90%] h-[70%] rounded-full bg-neon-cyan/5 blur-[120px]" />
        
        {/* Dynamic Mesh Accents */}
        <Animated.View 
            entering={FadeInDown.delay(300).duration(2000)}
            className="absolute -bottom-[20%] right-[10%] w-[70%] h-[50%] rounded-full bg-neon-indigo/5 blur-[100px]" 
        />
      </View>

      {showParticles && <ParticleBackground />}
      
      <SafeAreaView className={`flex-1 ${className}`} style={style}>
        {children}
      </SafeAreaView>
    </View>
  );
}

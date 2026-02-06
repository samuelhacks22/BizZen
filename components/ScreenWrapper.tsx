import React from 'react';
import { View, ViewProps, SafeAreaView, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ParticleBackground } from './ParticleBackground';

interface ScreenWrapperProps extends ViewProps {
  children: React.ReactNode;
  showParticles?: boolean;
}

export function ScreenWrapper({ children, style, showParticles = true, className, ...props }: ScreenWrapperProps) {
  return (
    <View className="flex-1 bg-slate-900" {...props}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#0f172a', '#1e1b4b', '#000000']}
        locations={[0, 0.5, 1]}
        className="absolute w-full h-full"
      />
      {showParticles && <ParticleBackground />}
      
      <SafeAreaView className={`flex-1 ${className}`} style={style}>
        {children}
      </SafeAreaView>
    </View>
  );
}

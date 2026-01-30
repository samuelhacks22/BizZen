import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
}

export function GlassCard({ children, style, intensity = 20, tint = 'dark', className, ...props }: GlassCardProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      className={`overflow-hidden rounded-2xl border border-white/20 ${className}`} 
      style={style}
      {...props}
    >
      <BlurView intensity={intensity} tint={tint} className="flex-1 p-4">
        {children}
      </BlurView>
    </Animated.View>
  );
}

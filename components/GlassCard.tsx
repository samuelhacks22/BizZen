import React from 'react';
import { View, ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradientBorder?: boolean;
}

export function GlassCard({ children, style, intensity = 20, tint = 'dark', gradientBorder = true, className, ...props }: GlassCardProps) {
  return (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      className={`rounded-2xl overflow-hidden ${className}`}
      style={style}
      {...props}
    >
        {/* Gradient Border Container */}
        {gradientBorder ? (
             <LinearGradient
                colors={['rgba(34, 211, 238, 0.3)', 'rgba(168, 85, 247, 0.3)', 'rgba(34, 211, 238, 0.1)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-[1px] rounded-2xl"
             >
                <View className="rounded-2xl overflow-hidden bg-black/40">
                    <BlurView intensity={intensity} tint={tint} className="p-4">
                        {children}
                    </BlurView>
                </View>
             </LinearGradient>
        ) : (
             <View className="border border-white/10 rounded-2xl overflow-hidden bg-black/40">
                <BlurView intensity={intensity} tint={tint} className="p-4">
                    {children}
                </BlurView>
            </View>
        )}
      
    </Animated.View>
  );
}

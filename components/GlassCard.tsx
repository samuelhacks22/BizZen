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
      className={`rounded-3xl overflow-hidden ${className}`}
      style={style}
      {...props}
    >
        {/* Refined Glass Layer */}
        {gradientBorder ? (
             <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-[1px] rounded-3xl"
             >
                <View className="rounded-3xl overflow-hidden bg-transparent">
                    <BlurView 
                        intensity={intensity} 
                        tint={tint} 
                        className="p-5"
                        style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(10, 10, 15, 0.6)' }}
                    >
                        {children}
                    </BlurView>
                </View>
             </LinearGradient>
        ) : (
             <View className="border border-white/10 rounded-3xl overflow-hidden bg-transparent">
                <BlurView 
                    intensity={intensity} 
                    tint={tint} 
                    className="p-5"
                    style={{ borderRadius: 24, overflow: 'hidden', backgroundColor: 'rgba(10, 10, 15, 0.6)' }}
                >
                    {children}
                </BlurView>
            </View>
        )}
      
    </Animated.View>
  );
}

import React, { useEffect, useState } from 'react';
import { View, ViewProps, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { DeviceMotion } from 'expo-sensors';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  gradientBorder?: boolean;
  isPressable?: boolean;
  onPress?: () => void;
  parallax?: boolean;
}

export function GlassCard({ children, style, intensity = 20, tint = 'dark', gradientBorder = true, isPressable, onPress, parallax = false, className, ...props }: GlassCardProps) {
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    if (!parallax) return;

    let subscription: { remove: () => void } | null = null;
    let isMounted = true;

    DeviceMotion.isAvailableAsync().then((available: boolean) => {
        if (available && isMounted) {
            subscription = DeviceMotion.addListener(({ rotation }: { rotation: { beta: number, gamma: number } }) => {
                // beta is tilt forward/backward, gamma is left/right
                // beta is roughly -PI to PI, gamma is -PI/2 to PI/2
                // We convert to degrees and limit intensity
                rotateX.value = withSpring((rotation.beta * 180 / Math.PI) * 0.1, { damping: 20 });
                rotateY.value = withSpring((-rotation.gamma * 180 / Math.PI) * 0.1, { damping: 20 });
            });
            DeviceMotion.setUpdateInterval(100);
        }
    });

    return () => {
        isMounted = false;
        subscription?.remove();
    };
  }, [parallax]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
        { scale: scale.value },
        { perspective: 1000 },
        { rotateX: parallax ? `${rotateX.value}deg` : '0deg' },
        { rotateY: parallax ? `${rotateY.value}deg` : '0deg' }
    ]
  }));

  const handlePressIn = () => {
    if (isPressable) {
        scale.value = withSpring(0.98);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const content = (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      className={`rounded-[40px] overflow-hidden ${className}`}
      style={[style, animatedStyle]}
      {...props}
    >
        {/* Refined Glass Layer */}
        {gradientBorder ? (
             <LinearGradient
                colors={['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="p-[1px] rounded-[40px]"
             >
                <View className="rounded-[40px] overflow-hidden bg-transparent">
                    <BlurView 
                        intensity={intensity} 
                        tint={tint} 
                        className="p-5"
                        style={{ borderRadius: 40, overflow: 'hidden', backgroundColor: 'rgba(10, 10, 20, 0.5)' }}
                    >
                        {children}
                    </BlurView>
                </View>
             </LinearGradient>
        ) : (
             <View className="border border-white/10 rounded-[40px] overflow-hidden bg-transparent">
                <BlurView 
                    intensity={intensity} 
                    tint={tint} 
                    className="p-5"
                    style={{ borderRadius: 40, overflow: 'hidden', backgroundColor: 'rgba(10, 10, 20, 0.5)' }}
                >
                    {children}
                </BlurView>
            </View>
        )}
    </Animated.View>
  );

  if (isPressable) {
    return (
        <Pressable 
            onPressIn={handlePressIn}
            onPressOut={() => scale.value = withSpring(1)}
            onPress={onPress}
        >
            {content}
        </Pressable>
    );
  }

  return content;
}

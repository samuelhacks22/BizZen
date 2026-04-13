import React, { useEffect } from 'react';
import { View, ViewProps, Pressable, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
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

export function GlassCard({ 
  children, 
  style, 
  intensity = 30, 
  tint = 'dark', 
  gradientBorder = true, 
  isPressable, 
  onPress, 
  parallax = false, 
  className, 
  ...props 
}: GlassCardProps) {
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    if (!parallax) return;
    let subscription: any = null;
    let isMounted = true;

    DeviceMotion.isAvailableAsync().then((available) => {
        if (available && isMounted) {
            subscription = DeviceMotion.addListener((event) => {
                if (!event || !event.rotation) return;
                const { rotation } = event;
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

  const backgroundColor = tint === 'dark' ? 'rgba(15, 23, 42, 0.9)' : 'rgba(255, 255, 255, 0.9)';

  const content = (
    <Animated.View 
      entering={FadeInDown.delay(100).springify()}
      className={`rounded-[32px] overflow-hidden ${className || ''}`}
      style={[style, animatedStyle]}
      {...props}
    >
        <View style={[
            styles.container, 
            { backgroundColor, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1 }
        ]}>
            <BlurView 
                intensity={intensity} 
                tint={tint} 
                style={StyleSheet.absoluteFill}
            />
            <View style={styles.content}>
                {children}
            </View>
        </View>
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    overflow: 'hidden',
    minHeight: 50, // Asegurar que no colapse a 0
  },
  content: {
    padding: 20,
  }
});

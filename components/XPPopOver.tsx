import React, { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS,
  withSpring
} from 'react-native-reanimated';
import { Text, View } from 'react-native';

interface XPPopOverProps {
  amount: number;
  onComplete: () => void;
}

const PARTICLE_COUNT = 8;

export function XPPopOver({ amount, onComplete }: XPPopOverProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="absolute top-1/2 left-1/2 items-center justify-center z-[1000]">
      {/* Main XP Text */}
      <AnimatedXPText amount={amount} />
      
      {/* Burst Particles */}
      {Array.from({ length: PARTICLE_COUNT }).map((_, i) => (
        <XPParticle key={i} index={i} />
      ))}
    </View>
  );
}

function AnimatedXPText({ amount }: { amount: number }) {
    const opacity = useSharedValue(0);
    const scale = useSharedValue(0.5);
    const translateY = useSharedValue(0);

    useEffect(() => {
        opacity.value = withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(1200, withTiming(0, { duration: 400 }))
        );
        scale.value = withSpring(1.2, { damping: 12 });
        translateY.value = withTiming(-80, { duration: 1800, easing: Easing.out(Easing.quad) });
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { scale: scale.value },
            { translateY: translateY.value }
        ],
        position: 'absolute'
    }));

    return (
        <Animated.View style={style}>
            <Text className="text-neon-cyan font-black text-3xl" style={{ textShadowColor: '#22d3ee', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 15 }}>
                +{amount} XP
            </Text>
        </Animated.View>
    );
}

function XPParticle({ index }: { index: number }) {
    const angle = (index / PARTICLE_COUNT) * Math.PI * 2;
    const distance = 60 + Math.random() * 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;

    const opacity = useSharedValue(0);
    const tx = useSharedValue(0);
    const ty = useSharedValue(0);
    const rotate = useSharedValue(0);

    useEffect(() => {
        opacity.value = withSequence(
            withTiming(1, { duration: 100 }),
            withDelay(400, withTiming(0, { duration: 300 }))
        );
        tx.value = withSpring(destX, { damping: 15 });
        ty.value = withSpring(destY, { damping: 15 });
        rotate.value = withTiming(Math.random() * 360, { duration: 800 });
    }, []);

    const style = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateX: tx.value },
            { translateY: ty.value },
            { rotate: `${rotate.value}deg` }
        ],
        position: 'absolute',
        width: 6,
        height: 6,
        backgroundColor: '#22d3ee',
        borderRadius: 2
    }));

    return <Animated.View style={style} />;
}

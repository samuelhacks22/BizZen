import React, { useEffect } from 'react';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Text } from 'react-native';

interface XPPopOverProps {
  amount: number;
  onComplete: () => void;
}

export function XPPopOver({ amount, onComplete }: XPPopOverProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withSequence(
      withTiming(1, { duration: 300 }),
      withDelay(1000, withTiming(0, { duration: 500 }, (finished) => {
        if (finished) {
          runOnJS(onComplete)();
        }
      }))
    );
    translateY.value = withTiming(-50, { 
      duration: 1800, 
      easing: Easing.out(Easing.quad) 
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
    position: 'absolute',
    top: '50%',
    left: '50%',
    zIndex: 1000,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text className="text-neon-cyan font-black text-2xl" style={{ textShadowColor: '#22d3ee', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 10 }}>
        +{amount} XP
      </Text>
    </Animated.View>
  );
}

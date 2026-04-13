import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  FadeIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface TabIconProps {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  activeColor?: string;
}

export function TabIcon({ name, color, focused, activeColor = '#22d3ee' }: TabIconProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.2, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(1, { duration: 200 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      scale.value = withSpring(1, { damping: 10, stiffness: 100 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: withTiming(focused ? 1 : 0.8) }],
    backgroundColor: `${activeColor}15`,
  }));

  return (
    <View className="items-center justify-center w-12 h-12">
      <Animated.View 
        style={backgroundStyle}
        className="absolute w-10 h-10 rounded-xl"
      />
      <Animated.View style={animatedStyle}>
        <Ionicons 
            name={focused ? name.replace('-outline', '') as any : name} 
            size={24} 
            color={color} 
        />
      </Animated.View>
      
      {focused && (
          <Animated.View 
            entering={FadeIn.duration(300)}
            className="absolute -bottom-1 w-1 h-1 rounded-full"
            style={{ backgroundColor: activeColor }}
          />
      )}
    </View>
  );
}

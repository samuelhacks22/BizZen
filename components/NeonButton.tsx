import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface NeonButtonProps extends TouchableOpacityProps {
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function NeonButton({ title, icon, variant = 'primary', className, ...props }: NeonButtonProps) {
  
  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'primary': return ['#22d3ee', '#3b82f6']; // Cyan to Blue
      case 'secondary': return ['#a855f7', '#d946ef']; // Purple to Pink
      case 'danger': return ['#f43f5e', '#ef4444']; // Rose to Red
      default: return ['#22d3ee', '#3b82f6'];
    }
  };

  const getShadowColor = () => {
      switch (variant) {
        case 'primary': return 'shadow-cyan-500/50';
        case 'secondary': return 'shadow-purple-500/50';
        case 'danger': return 'shadow-red-500/50';
      }
  };

  return (
    <TouchableOpacity 
        activeOpacity={0.8}
        className={`shadow-lg ${getShadowColor()} ${className}`}
        {...props}
    >
      <LinearGradient
        colors={getGradientColors()}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="px-6 py-3 rounded-xl flex-row items-center justify-center"
      >
        {icon && <Ionicons name={icon} size={20} color="white" style={title ? { marginRight: 8 } : {}} />}
        {title && <Text className="text-white font-bold text-base">{title}</Text>}
      </LinearGradient>
    </TouchableOpacity>
  );
}

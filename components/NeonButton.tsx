import React from 'react';
import { Text, Pressable, TouchableOpacityProps, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Propiedades del Botón Neón
interface NeonButtonProps extends TouchableOpacityProps {
  title?: string; // Texto del botón
  icon?: keyof typeof Ionicons.glyphMap; // Nombre del icono (opcional)
  variant?: 'primary' | 'secondary' | 'danger'; // Variante de color
}

// Componente de Botón con estilo Neón y degradado
export function NeonButton({ title, icon, variant = 'primary', className, ...props }: NeonButtonProps) {
  const scale = useSharedValue(1); // Valor de escala para animación
  
  // Obtener colores del degradado según la variante
  const getGradientColors = (): readonly [string, string, ...string[]] => {
    switch (variant) {
      case 'primary': return ['#22d3ee', '#3b82f6']; // Cian a Azul
      case 'secondary': return ['#a855f7', '#d946ef']; // Púrpura a Rosa
      case 'danger': return ['#f43f5e', '#ef4444']; // Rosa a Rojo
      default: return ['#22d3ee', '#3b82f6'];
    }
  };

  // Obtener color de sombra según la variante
  const getShadowColor = () => {
      switch (variant) {
        case 'primary': return 'shadow-cyan-500/50';
        case 'secondary': return 'shadow-purple-500/50';
        case 'danger': return 'shadow-red-500/50';
      }
  };

  // Estilo animado para efecto de pulsación
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  // Manejar inicio de presión
  const handlePressIn = () => {
    scale.value = withSpring(0.96); // Reducir escala ligeramente
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <Pressable 
        onPressIn={handlePressIn}
        onPressOut={() => scale.value = withSpring(1)} // Restaurar escala
        className={`shadow-lg ${getShadowColor()} ${className}`}
        {...(props as any)}
    >
      <Animated.View style={animatedStyle}>
        <LinearGradient
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="px-6 py-3 rounded-full flex-row items-center justify-center"
        >
            {/* Mostrar icono si está definido */}
            {icon && <Ionicons name={icon} size={20} color="white" style={title ? { marginRight: 8 } : {}} />}
            {/* Mostrar texto si está definido */}
            {title && <Text className="text-white font-bold text-base">{title}</Text>}
        </LinearGradient>
      </Animated.View>
    </Pressable>
  );
}

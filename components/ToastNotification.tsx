import React, { useEffect, forwardRef, useImperativeHandle } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, runOnJS } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

// Interfaz para controlar el Toast desde el componente padre
export interface ToastRef {
  show: (message: string, type?: 'success' | 'error' | 'xp') => void;
}

// Componente de Notificación Toast animado
export const ToastNotification = forwardRef<ToastRef, {}>((props, ref) => {
  const translateY = useSharedValue(-100); // Posición inicial fuera de pantalla
  const opacity = useSharedValue(0);
  const [message, setMessage] = React.useState('');
  const [type, setType] = React.useState<'success' | 'error' | 'xp'>('success');

  // Exponer método show al componente padre
  useImperativeHandle(ref, () => ({
    show: (msg, t = 'success') => {
      setMessage(msg);
      setType(t);
      opacity.value = 1;
      // Secuencia de animación: Bajar -> Esperar -> Subir
      translateY.value = withSequence(
        withSpring(50, { damping: 12 }), // Deslizar hacia abajo
        withTiming(50, { duration: 2000 }), // Mantenerse visible
        withTiming(-100, { duration: 500 }) // Deslizar hacia arriba
      );
    },
  }));

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    };
  });

  // Obtener icono según el tipo de mensaje
  const getIcon = () => {
    switch (type) {
        case 'success': return 'checkmark-circle';
        case 'error': return 'alert-circle';
        case 'xp': return 'star';
        default: return 'checkmark-circle';
    }
  };

  // Obtener color según el tipo de mensaje
  const getColor = () => {
    switch (type) {
        case 'success': return '#4ade80'; // Verde
        case 'error': return '#f87171'; // Rojo
        case 'xp': return '#facc15'; // Amarillo
        default: return '#4ade80';
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={80} tint="dark" style={[styles.toast, { borderColor: getColor(), borderWidth: 1 }]}>
        <Ionicons name={getIcon()} size={24} color={getColor()} />
        <Text style={styles.text}>{message}</Text>
      </BlurView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 9999, // Asegurar que esté por encima de todo
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.5)',
    gap: 10,
    minWidth: 200,
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

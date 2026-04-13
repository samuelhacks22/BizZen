import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToastNotification, ToastRef } from './ToastNotification';
import { XPPopOver } from './XPPopOver';
import { useTycoon } from '../context/TycoonContext';

interface ScreenWrapperProps {
  children: React.ReactNode;
  bg?: string;
  showParticles?: boolean;
}

export function ScreenWrapper({ children, bg = '#020617', showParticles = false }: ScreenWrapperProps) {
  const { toast, lastXPGain } = useTycoon();
  const toastRef = useRef<ToastRef>(null);
  const [activeXP, setActiveXP] = useState<{ amount: number; id: number } | null>(null);

  // Observa cambios en el toast del contexto
  useEffect(() => {
    if (toast) {
      toastRef.current?.show(toast.message, toast.type);
    }
  }, [toast?.timestamp]);

  // Observa ganancias de XP para disparar la animación
  useEffect(() => {
    if (lastXPGain) {
      setActiveXP({ amount: lastXPGain.amount, id: lastXPGain.timestamp });
    }
  }, [lastXPGain?.timestamp]);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar style="light" />
      <SafeAreaView style={styles.safe} edges={['right', 'left']}>
        {showParticles && (
          <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Partículas decorativas estáticas para profundidad visual */}
            <View className="absolute top-20 left-10 w-1 h-1 bg-neon-cyan/40 rounded-full" />
            <View className="absolute top-40 right-20 w-2 h-2 bg-neon-purple/20 rounded-full" />
            <View className="absolute bottom-60 left-40 w-1.5 h-1.5 bg-neon-indigo/30 rounded-full" />
            <View className="absolute top-1/2 right-10 w-1 h-1 bg-white/10 rounded-full" />
            <View className="absolute bottom-20 right-1/4 w-2 h-2 bg-neon-cyan/10 rounded-full" />
          </View>
        )}
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboard}
        >
          {children}
        </KeyboardAvoidingView>
      </SafeAreaView>
      
      {/* Sistema de Notificaciones Global */}
      <ToastNotification ref={toastRef} />
      
      {/* Animación de Ganancia de XP */}
      {activeXP && (
        <XPPopOver 
            key={activeXP.id}
            amount={activeXP.amount} 
            onComplete={() => setActiveXP(null)} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
});

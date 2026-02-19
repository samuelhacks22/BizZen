import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

// Diseño de la navegación por pestañas (TabLayout)
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Ocultar la cabecera predeterminada
        // Estilos personalizados para la barra de pestañas flotante
        tabBarStyle: {
          position: 'absolute', // Posición absoluta para flotar
          bottom: 24, // Margen inferior
          left: 24, // Margen izquierdo
          right: 24, // Margen derecho
          borderRadius: 24, // Bordes redondeados
          height: 64, // Altura de la barra
          backgroundColor: 'transparent', // Fondo transparente (usamos BlurView)
          elevation: 0, // Sin elevación predeterminada de Android
          borderTopWidth: 0, // Sin borde superior
          shadowColor: '#000', // Sombra personalizada
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        },
        // Fondo de la barra de pestañas usando BlurView (efecto de desenfoque)
        tabBarBackground: () => (
          <BlurView 
            intensity={60} // Intensidad del desenfoque
            tint="dark" // Tinte oscuro
            style={{ 
              borderRadius: 24, 
              overflow: 'hidden', 
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)', // Fondo semitransparente oscuro
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)', // Borde sutil
            }} 
          />
        ),
        tabBarActiveTintColor: '#22d3ee', // Color del icono activo (Cyan-400)
        tabBarInactiveTintColor: '#9ca3af', // Color del icono inactivo (Gray-400)
        tabBarShowLabel: false, // Ocultar etiquetas de texto
      }}
    >
      {/* Pestaña: Panel de Control (Dashboard) */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      {/* Pestaña: Inventario */}
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />
      {/* Pestaña: Reportes */}
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

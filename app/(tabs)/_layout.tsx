import { Tabs } from 'expo-router';
import React from 'react';
import { View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 24,
          right: 24,
          borderRadius: 24,
          height: 64,
          backgroundColor: 'transparent',
          elevation: 0,
          borderTopWidth: 0,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={60} 
            tint="dark" 
            style={{ 
              borderRadius: 24, 
              overflow: 'hidden', 
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.6)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.05)',
            }} 
          />
        ),
        tabBarActiveTintColor: '#22d3ee', // Cyan-400
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="cube" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

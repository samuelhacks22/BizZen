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
          bottom: 20,
          left: 20,
          right: 20,
          borderRadius: 30,
          height: 70,
          backgroundColor: 'transparent',
          elevation: 0,
          borderTopWidth: 0,
        },
        tabBarBackground: () => (
          <BlurView 
            intensity={50} 
            tint="dark" 
            style={{ 
              borderRadius: 30, 
              overflow: 'hidden', 
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)'
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

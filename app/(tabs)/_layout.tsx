import { Tabs } from 'expo-router';
import React from 'react';
import { View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { TabIcon } from '../../components/TabIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: Platform.OS === 'ios' ? 40 : 25,
          left: 16,
          right: 16,
          borderRadius: 35,
          height: 75,
          backgroundColor: 'transparent',
          elevation: 0,
          borderTopWidth: 0,
          borderWidth: 1.5,
          borderColor: 'rgba(255,255,255,0.08)',
          shadowColor: '#22d3ee',
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.4,
          shadowRadius: 20,
          paddingBottom: 0,
        },
        tabBarBackground: () => (
          <View style={{ flex: 1, borderRadius: 35, overflow: 'hidden' }}>
            <BlurView 
                intensity={95} 
                tint="dark" 
                style={{ flex: 1 }} 
            />
            <View className="absolute inset-0 bg-slate-900/60" />
          </View>
        ),
        tabBarActiveTintColor: '#22d3ee',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="grid-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="cube-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="employees"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="people-outline" color={color} focused={focused} activeColor="#a855f7" />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="analytics-outline" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person-outline" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

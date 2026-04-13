import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ScreenWrapper showParticles={true}>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#22d3ee" />
        </View>
      </ScreenWrapper>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

import "../global.css";
import React, { useEffect } from 'react';
import { Slot, Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  useEffect(() => {
    if (loaded || error) {
       SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
    <SQLiteProvider databaseName="managex.db" onInit={migrateDbIfNeeded}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </SQLiteProvider>
  );
}

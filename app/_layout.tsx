import "../global.css";
import React, { useEffect } from 'react';
import { Slot, Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../db/database';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    // Load custom fonts here if needed
  });

  useEffect(() => {
    if (loaded) { // or always if no fonts yet
       SplashScreen.hideAsync();
    }
  }, [loaded]);

  return (
    <SQLiteProvider databaseName="bizzen.db" onInit={migrateDbIfNeeded}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="light" />
    </SQLiteProvider>
  );
}

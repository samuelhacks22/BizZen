import "../global.css"; // Importar estilos globales
import React, { useEffect, Suspense } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Stack, useRouter, useSegments } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDbIfNeeded } from '../db/database';

import { TycoonProvider } from '../context/TycoonContext';
import { AuthProvider, useAuth } from '../context/AuthContext';

// Prevenir que la pantalla de carga (splash screen) se oculte automáticamente
SplashScreen.preventAutoHideAsync();

// Componente para manejar la lógica de navegación protegida
function NavigationGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // Determinar si el usuario está intentando acceder a las pestañas del juego
    const inTabsGroup = segments[0] === '(tabs)';

    if (!user && inTabsGroup) {
      // Si no hay usuario y está en las pestañas, redirigir al login
      router.replace('/login');
    } else if (user && !inTabsGroup) {
      // Si hay usuario y NO está en las pestañas (está en login/index), redirigir al juego
      router.replace('/(tabs)');
    }
  }, [user, isLoading, segments]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

// Componente de diseño raíz (RootLayout)
export default function RootLayout() {
  // Cargar fuentes personalizadas (en este caso, los iconos de Ionicons)
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  // Efecto para manejar la ocultación de la pantalla de carga
  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {
        /* Ignorar errores al ocultar si ya está oculto */
      });
    }
  }, [loaded, error]);

  // Si las fuentes no han cargado ni hay error, no renderizar nada aún
  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      {/* Proveedor de SQLite para la base de datos "managex.db" */}
      {/* 'onInit' ejecuta la migración de la base de datos si es necesario */}
      <Suspense fallback={
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0f172a' }}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      }>
        <SQLiteProvider databaseName="managex.db" onInit={migrateDbIfNeeded} useSuspense>
          {/* Proveedor de Autenticación */}
          <AuthProvider>
            {/* Proveedor del contexto Tycoon (lógica del juego) */}
            <TycoonProvider>
              {/* Guardia de Navegación centralizado */}
              <NavigationGuard />
              {/* Barra de estado con estilo claro (texto blanco) */}
              <StatusBar style="light" />
            </TycoonProvider>
          </AuthProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}

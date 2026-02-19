import "../global.css"; // Importar estilos globales
import React, { useEffect } from 'react';
import { Slot, Stack } from "expo-router";
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../db/database';

import { TycoonProvider } from '../context/TycoonContext';

// Prevenir que la pantalla de carga (splash screen) se oculte automáticamente
SplashScreen.preventAutoHideAsync();

// Componente de diseño raíz (RootLayout)
export default function RootLayout() {
  // Cargar fuentes personalizadas (en este caso, los iconos de Ionicons)
  const [loaded, error] = useFonts({
    ...Ionicons.font,
  });

  // Efecto para manejar la ocultación de la pantalla de carga
  useEffect(() => {
    if (loaded || error) {
      // Garantizar que el splash screen se vea al menos 2 segundos para mejor experiencia
      setTimeout(() => {
        SplashScreen.hideAsync().catch(() => {
          /* Ignorar errores al ocultar si ya está oculto */
        });
      }, 2000);
    }
  }, [loaded, error]);

  // Si las fuentes no han cargado ni hay error, no renderizar nada aún
  if (!loaded && !error) {
    return null;
  }

  return (
    // Proveedor de SQLite para la base de datos "managex.db"
    // 'onInit' ejecuta la migración de la base de datos si es necesario
    <SQLiteProvider databaseName="managex.db" onInit={migrateDbIfNeeded}>
      {/* Proveedor del contexto Tycoon (lógica del juego) */}
      <TycoonProvider>
        {/* Navegación por Stack (pila) sin cabeceras predeterminadas */}
        <Stack screenOptions={{ headerShown: false }} />
        {/* Barra de estado con estilo claro (texto blanco) */}
        <StatusBar style="light" />
      </TycoonProvider>
    </SQLiteProvider>
  );
}

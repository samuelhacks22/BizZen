import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

// Definición de las estadísticas del Magnate (Tycoon)
interface TycoonStats {
  level: number; // Nivel del jugador
  xp: number; // Experiencia actual
  totalRevenue: number; // Ingresos totales acumulados
  satisfaction: number; // Tasa de satisfacción (0-100)
  reputation: number; // Puntuación de reputación
  employees: number; // Cantidad de empleados contratados
  daysActive: number; // Días activos en el juego/app
  assetValuation: number; // Sum of active and in-repair asset values
  unlockedAchievements: string[]; // Logros desbloqueados
}

// Información sobre los rangos disponibles
export interface RankInfo {
    name: string; // Nombre del rango
    tier: number; // Nivel del rango (1-6)
    icon: string; // Icono representativo
    description: string; // Descripción del rango
}

// Lista de Rangos predefinidos
export const RANKS: RankInfo[] = [
    { name: 'Emprendedor Novato', tier: 1, icon: 'seed-outline', description: 'Iniciando el imperio' },
    { name: 'Gerente en Crecimiento', tier: 2, icon: 'trending-up-outline', description: 'Optimizando procesos' },
    { name: 'Director Ejecutivo', tier: 3, icon: 'briefcase-outline', description: 'Estrategia corporativa' },
    { name: 'Magnate Empresarial', tier: 4, icon: 'business-outline', description: 'Dominio regional' },
    { name: 'Titán Corporativo', tier: 5, icon: 'globe-outline', description: 'Influencia global' },
    { name: 'Leyenda del Mercado', tier: 6, icon: 'trophy-outline', description: 'Estatus legendario' },
];

// Tipos de logros y definición
export interface AchievementInfo {
    id: string; // ID único
    title: string;
    description: string;
    icon: string;
    xpReward: number;
}

export const ACHIEVEMENTS: AchievementInfo[] = [
    { id: 'FIRST_ASSET', title: 'Primera Piedra', description: 'Registra tu primer activo en el ecosistema.', icon: 'cube-outline', xpReward: 500 },
    { id: 'NET_VAL_1M', title: 'Millionario', description: 'Alcanza $1,000,000 en valoración neta.', icon: 'cash-outline', xpReward: 2000 },
    { id: 'REACH_LEVEL_5', title: 'Magnate en Ascenso', description: 'Alcanza el nivel Tycoon 5.', icon: 'trending-up-outline', xpReward: 1000 },
    { id: 'EXPORT_DATA', title: 'Analista de Datos', description: 'Exporta tu primer reporte de inventario.', icon: 'stats-chart-outline', xpReward: 500 },
];

// Tipos para el Contexto Tycoon
interface TycoonContextType {
  stats: TycoonStats; // Estado actual
  addXP: (amount: number) => Promise<void>; // Función para añadir XP
  addRevenue: (amount: number) => Promise<void>; // Función para añadir ingresos
  nextLevelXP: number; // XP necesaria para el siguiente nivel
  progress: number; // Porcentaje de progreso al siguiente nivel
  currentRank: RankInfo; // Rango actual del jugador
  netValuation: number; // Total Revenue + Asset Valuation
  refreshTycoon: () => Promise<void>; // Refresh specific states like assets from DB
  unlockAchievement: (achievementId: string) => Promise<void>; // Función para desbloquear un logro
}

// Creación del Contexto
const TycoonContext = createContext<TycoonContextType | undefined>(undefined);

// Proveedor del Contexto Tycoon
export function TycoonProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext(); // Conexión a base de datos para persistencia
  // Estado inicial de las estadísticas
  const [stats, setStats] = useState<TycoonStats>({ 
    level: 1, 
    xp: 0, 
    totalRevenue: 0,
    satisfaction: 100,
    reputation: 50,
    employees: 0,
    daysActive: 1,
    assetValuation: 0,
    unlockedAchievements: []
  });

  // Cálculos de progreso y nivel
  const nextLevelXP = stats.level * 1000; // XP requerida escala con el nivel
  const progress = (stats.xp / nextLevelXP) * 100;

  // Calcular Valoración Neta
  const netValuation = stats.totalRevenue + stats.assetValuation;

  // Calcular rango basado en valoración neta
  const calculateRank = (): RankInfo => {
      // Simplificación de métricas para cálculo de rango
      if (netValuation >= 10000000) return RANKS[5]; // Leyenda
      if (netValuation >= 1000000) return RANKS[4]; // Titán
      if (netValuation >= 100000) return RANKS[3]; // Magnate
      if (netValuation >= 10000) return RANKS[2]; // Director
      if (netValuation >= 1000) return RANKS[1]; // Gerente
      return RANKS[0]; // Emprendedor (Default)
  };

  const currentRank = calculateRank();

  // Función para refrescar datos calculados exteriormente (como los activos)
  const refreshTycoon = useCallback(async () => {
    try {
      const valueResult = await db.getAllAsync<{ total: number }>('SELECT SUM(cost) as total FROM assets WHERE status != "Disposed"');
      const assetTotal = valueResult[0]?.total || 0;
      setStats(prev => ({ ...prev, assetValuation: assetTotal }));
    } catch (e) {
      console.error('Error refreshing tycoon external val', e);
    }
  }, [db]);

  // Cargar estadísticas desde la base de datos al iniciar
  const loadStats = useCallback(async () => {
    try {
      const result = await db.getFirstAsync<any>(
        'SELECT * FROM tycoon_stats WHERE id = 1'
      );
      if (result) {
        setStats(prev => ({
          ...prev, // Preserve assetValuation if it's not loaded from tycoon_stats
          level: result.level,
          xp: result.xp,
          totalRevenue: result.total_revenue,
          satisfaction: result.satisfaction_rate,
          reputation: result.reputation_score,
          employees: result.employees_count,
          daysActive: result.days_active,
          unlockedAchievements: result.unlocked_achievements ? JSON.parse(result.unlocked_achievements) : []
        }));
      }
    } catch (e) {
      console.error('Error loading tycoon stats:', e);
    }
    await refreshTycoon(); // Carga de valoración al iniciar
  }, [db, refreshTycoon]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Chequear logros automáticos
  useEffect(() => {
     if (stats.level >= 5) unlockAchievement('REACH_LEVEL_5');
     if (netValuation >= 1000000) unlockAchievement('NET_VAL_1M');
  }, [stats.level, netValuation]);

  // Función para añadir XP y subir de nivel si corresponde
  const addXP = async (amount: number) => {
    let newXP = stats.xp + amount;
    let newLevel = stats.level;

    // Verificar si sube de nivel (bucle while por si sube múltiples niveles)
    while (newXP >= (newLevel * 1000)) {
      newXP -= (newLevel * 1000); // Restar XP consumida por el nivel
      newLevel += 1; // Incrementar nivel
    }

    try {
      await db.runAsync(
        'UPDATE tycoon_stats SET level = ?, xp = ? WHERE id = 1',
        [newLevel, newXP]
      );
      setStats(prev => ({ ...prev, level: newLevel, xp: newXP }));
    } catch (e) {
      console.error('Error updating XP:', e);
    }
  };

  // Función para añadir ingresos
  const addRevenue = async (amount: number) => {
      const newRevenue = stats.totalRevenue + amount;
      try {
          await db.runAsync(
              'UPDATE tycoon_stats SET total_revenue = ? WHERE id = 1',
              [newRevenue]
          );
          setStats(prev => ({ ...prev, totalRevenue: newRevenue }));
      } catch (e) {
          console.error('Error updating revenue:', e);
      }
  };

  // Función para desbloquear un logro
  const unlockAchievement = async (achievementId: string) => {
      if (stats.unlockedAchievements.includes(achievementId)) return;

      const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
      if (!achievement) return;

      const newAchievements = [...stats.unlockedAchievements, achievementId];
      try {
          await db.runAsync(
              'UPDATE tycoon_stats SET unlocked_achievements = ? WHERE id = 1',
              [JSON.stringify(newAchievements)]
          );
          setStats(prev => ({ ...prev, unlockedAchievements: newAchievements }));
          
          // Recompensar XP por el logro
          await addXP(achievement.xpReward);
          
          // Podríamos mostrar una notificación aquí o desde donde se llame.
      } catch (e) {
          console.error("Error unlocking achievement", e);
      }
  };

  return (
    <TycoonContext.Provider value={{ stats, addXP, addRevenue, nextLevelXP, progress, currentRank, netValuation, refreshTycoon, unlockAchievement }}>
      {children}
    </TycoonContext.Provider>
  );
}

// Hook personalizado para usar el contexto Tycoon
export function useTycoon() {
  const context = useContext(TycoonContext);
  if (context === undefined) {
    throw new Error('useTycoon must be used within a TycoonProvider');
  }
  return context;
}

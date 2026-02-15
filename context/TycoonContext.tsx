import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

interface TycoonStats {
  level: number;
  xp: number;
  totalRevenue: number;
  satisfaction: number;
  reputation: number;
  employees: number;
  daysActive: number;
}

export interface RankInfo {
    name: string;
    tier: number;
    icon: string;
    description: string;
}

export const RANKS: RankInfo[] = [
    { name: 'Emprendedor Novato', tier: 1, icon: 'seed-outline', description: 'Iniciando el imperio' },
    { name: 'Gerente en Crecimiento', tier: 2, icon: 'trending-up-outline', description: 'Optimizando procesos' },
    { name: 'Director Ejecutivo', tier: 3, icon: 'briefcase-outline', description: 'Estrategia corporativa' },
    { name: 'Magnate Empresarial', tier: 4, icon: 'business-outline', description: 'Dominio regional' },
    { name: 'Titán Corporativo', tier: 5, icon: 'globe-outline', description: 'Influencia global' },
    { name: 'Leyenda del Mercado', tier: 6, icon: 'trophy-outline', description: 'Estatus legendario' },
];

interface TycoonContextType {
  stats: TycoonStats;
  addXP: (amount: number) => Promise<void>;
  addRevenue: (amount: number) => Promise<void>;
  nextLevelXP: number;
  progress: number;
  currentRank: RankInfo;
}

const TycoonContext = createContext<TycoonContextType | undefined>(undefined);

export function TycoonProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<TycoonStats>({ 
    level: 1, 
    xp: 0, 
    totalRevenue: 0,
    satisfaction: 100,
    reputation: 50,
    employees: 0,
    daysActive: 1
  });

  const nextLevelXP = stats.level * 1000;
  const progress = (stats.xp / nextLevelXP) * 100;

  const calculateRank = (): RankInfo => {
      const { totalRevenue, level } = stats;
      // Simplification of metrics for rank calculation
      if (totalRevenue >= 10000000) return RANKS[5];
      if (totalRevenue >= 1000000) return RANKS[4];
      if (totalRevenue >= 100000) return RANKS[3];
      if (totalRevenue >= 10000) return RANKS[2];
      if (totalRevenue >= 1000) return RANKS[1];
      return RANKS[0];
  };

  const currentRank = calculateRank();

  const loadStats = useCallback(async () => {
    try {
      const result = await db.getFirstAsync<any>(
        'SELECT * FROM tycoon_stats WHERE id = 1'
      );
      if (result) {
        setStats({
          level: result.level,
          xp: result.xp,
          totalRevenue: result.total_revenue,
          satisfaction: result.satisfaction_rate,
          reputation: result.reputation_score,
          employees: result.employees_count,
          daysActive: result.days_active
        });
      }
    } catch (e) {
      console.error('Error loading tycoon stats:', e);
    }
  }, [db]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const addXP = async (amount: number) => {
    let newXP = stats.xp + amount;
    let newLevel = stats.level;

    while (newXP >= (newLevel * 1000)) {
      newXP -= (newLevel * 1000);
      newLevel += 1;
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

  return (
    <TycoonContext.Provider value={{ stats, addXP, addRevenue, nextLevelXP, progress, currentRank }}>
      {children}
    </TycoonContext.Provider>
  );
}

export function useTycoon() {
  const context = useContext(TycoonContext);
  if (context === undefined) {
    throw new Error('useTycoon must be used within a TycoonProvider');
  }
  return context;
}

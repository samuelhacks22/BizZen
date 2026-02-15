import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

interface TycoonStats {
  level: number;
  xp: number;
  totalRevenue: number;
}

interface TycoonContextType {
  stats: TycoonStats;
  addXP: (amount: number) => Promise<void>;
  nextLevelXP: number;
  progress: number;
}

const TycoonContext = createContext<TycoonContextType | undefined>(undefined);

export function TycoonProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [stats, setStats] = useState<TycoonStats>({ level: 1, xp: 0, totalRevenue: 0 });

  const nextLevelXP = stats.level * 1000;
  const progress = (stats.xp / nextLevelXP) * 100;

  const loadStats = useCallback(async () => {
    try {
      const result = await db.getFirstAsync<{ level: number, xp: number, total_revenue: number }>(
        'SELECT level, xp, total_revenue FROM tycoon_stats WHERE id = 1'
      );
      if (result) {
        setStats({
          level: result.level,
          xp: result.xp,
          totalRevenue: result.total_revenue
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

  return (
    <TycoonContext.Provider value={{ stats, addXP, nextLevelXP, progress }}>
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

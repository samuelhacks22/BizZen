import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

// Definición del tipo de usuario
interface User {
  id: number;
  username: string;
}

// Tipos para el Contexto de Autenticación
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Intentar cargar la sesión al iniciar (podría usarse SecureStore aquí para persistencia real)
  useEffect(() => {
    // Por ahora, solo simulamos que no hay sesión activa al recargar
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const result = await db.getFirstAsync<User>(
        'SELECT id, username FROM users WHERE username = ? AND password = ?',
        [username, password]
      );

      if (result) {
        setUser(result);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM users WHERE username = ?',
        [username]
      );

      if (existingUser) {
        return { success: false, message: 'El nombre de usuario ya está en uso.' };
      }

      // Insertar nuevo usuario
      const result = await db.runAsync(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, password]
      );

      if (result.changes > 0) {
        // Iniciar sesión automáticamente después de registrarse
        setUser({ id: result.lastInsertRowId, username });
        return { success: true };
      }

      return { success: false, message: 'Error al crear el usuario.' };
    } catch (error) {
      console.error('Error durante el registro:', error);
      return { success: false, message: 'Error interno de la base de datos.' };
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

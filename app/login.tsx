import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { ParticleBackground } from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    setIsLoggingIn(true);
    const success = await login(username, password);
    setIsLoggingIn(false);

    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error de acceso', 'Usuario o contraseña incorrectos.');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-black"
    >
      <ParticleBackground />
      
      <LinearGradient
        colors={['transparent', 'rgba(168, 85, 247, 0.1)', 'transparent']}
        className="absolute w-full h-full"
      />

      <View className="flex-1 justify-center items-center px-6">
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="items-center mb-8"
        >
          <Text className="text-5xl font-black text-white tracking-tightest">
            Biz<Text className="text-neon-cyan opacity-40">Zen</Text>
          </Text>
          <Text className="text-gray-400 text-sm mt-2 font-medium tracking-widest uppercase">
            Acceso al Sistema
          </Text>
        </Animated.View>

        <GlassCard 
          className="w-full max-w-[400px] p-8 border-white/5 bg-space-900/10"
          intensity={40}
        >
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            {/* Campo de Usuario */}
            <View className="mb-6">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                Usuario
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.5)" />
                <TextInput
                  className="flex-1 ml-3 text-white font-medium"
                  placeholder="admin"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Campo de Contraseña */}
            <View className="mb-8">
              <Text className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2 ml-1">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" />
                <TextInput
                  className="flex-1 ml-3 text-white font-medium"
                  placeholder="••••"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <NeonButton
              title={isLoggingIn ? "Iniciando sesión..." : "Entrar"}
              variant="primary"
              icon="log-in-outline"
              onPress={handleLogin}
              className="w-full"
            />

            <View className="mt-6 flex-row justify-center items-center">
                <Text className="text-gray-400 text-xs">¿No tienes cuenta? </Text>
                <Link href="/register" asChild>
                    <Text className="text-neon-cyan font-bold text-xs uppercase tracking-wider">
                        Regístrate
                    </Text>
                </Link>
            </View>
          </Animated.View>
        </GlassCard>

        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          className="mt-8"
        >
          <Text className="text-gray-600 text-[10px] font-bold uppercase tracking-[4px] opacity-50">
            Powered by ManageX Engine
          </Text>
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

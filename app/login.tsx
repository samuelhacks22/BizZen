import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor ingresa todos los campos');
      return;
    }

    const success = await login(username, password);
    if (success) {
      router.replace('/(tabs)');
    } else {
      Alert.alert('Error', 'Credenciales incorrectas');
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6">
          <GlassCard className="py-8">
            <Text className="text-white text-4xl font-black text-center mb-2 tracking-tightest">¡HOLA!</Text>
            <Text className="text-gray-400 text-center mb-10 text-base">Ingresa a tu imperio <Text className="text-neon-cyan font-bold">Managex</Text></Text>

            <View className="mb-5">
              <Text className="text-neon-cyan text-[10px] font-black uppercase mb-2 ml-1 tracking-widest">Usuario</Text>
              <View className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4">
                <TextInput
                  className="text-white text-base"
                  placeholder="Nombre de usuario"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-neon-cyan text-[10px] font-black uppercase mb-2 ml-1 tracking-widest">Contraseña</Text>
              <View className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4">
                <TextInput
                  className="text-white text-base"
                  placeholder="********"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <NeonButton title="INICIAR SESIÓN" variant="primary" onPress={handleLogin} />

            <TouchableOpacity className="mt-8" onPress={() => router.push('/register')}>
              <Text className="text-gray-500 text-center text-sm font-medium">
                ¿Aún no tienes cuenta? <Text className="text-neon-cyan font-bold underline">Regístrate aquí</Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

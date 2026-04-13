import React, { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ScreenWrapper } from '../components/ScreenWrapper';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Todos los campos son obligatorios');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    const { success, message } = await register(username, password);
    if (success) {
      Alert.alert('Éxito', 'Usuario registrado correctamente', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') }
      ]);
    } else {
      Alert.alert('Error', message || 'No se pudo completar el registro');
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="px-6 py-10">
          <GlassCard className="py-8">
            <Text className="text-white text-4xl font-black text-center mb-2 tracking-tightest">UNIRSE</Text>
            <Text className="text-gray-400 text-center mb-10 text-base">Crea tu identidad de <Text className="text-neon-purple font-bold">Tycoon</Text></Text>

            <View className="mb-5">
              <Text className="text-neon-purple text-[10px] font-black uppercase mb-2 ml-1 tracking-widest">Usuario</Text>
              <View className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4">
                <TextInput
                  className="text-white text-base"
                  placeholder="Elige tu nombre"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-neon-purple text-[10px] font-black uppercase mb-2 ml-1 tracking-widest">Contraseña</Text>
              <View className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4">
                <TextInput
                  className="text-white text-base"
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor="#64748b"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <View className="mb-10">
              <Text className="text-neon-purple text-[10px] font-black uppercase mb-2 ml-1 tracking-widest">Confirmar Contraseña</Text>
              <View className="bg-white/5 border border-white/10 rounded-3xl px-5 py-4">
                <TextInput
                  className="text-white text-base"
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="#64748b"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <NeonButton title="CREAR CUENTA" variant="secondary" onPress={handleRegister} />

            <TouchableOpacity className="mt-8" onPress={() => router.back()}>
              <Text className="text-gray-500 text-center text-sm font-medium">
                ¿Ya tienes cuenta? <Text className="text-neon-purple font-bold underline">Inicia sesión</Text>
              </Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
}

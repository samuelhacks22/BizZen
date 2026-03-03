import React, { useState } from 'react';
import { View, Text, TextInput, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { useRouter, Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { ParticleBackground } from '../components/ParticleBackground';
import { useAuth } from '../context/AuthContext';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (password.length < 4) {
      Alert.alert('Error', 'La contraseña debe tener al menos 4 caracteres para mayor seguridad.');
      return;
    }

    setIsRegistering(true);
    const result = await register(username, password);
    setIsRegistering(false);

    if (result.success) {
      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada. Ingresando al sistema...',
        [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
      );
    } else {
      Alert.alert('Error de registro', result.message || 'Ha ocurrido un error inesperado al registrar la cuenta.');
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

      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 }}>
        <Animated.View 
          entering={FadeInUp.delay(200).springify()}
          className="items-center mb-6 mt-10"
        >
          <Text className="text-4xl font-black text-white tracking-tightest">
            Biz<Text className="text-neon-cyan opacity-40">Zen</Text>
          </Text>
          <Text className="text-gray-400 text-xs mt-2 font-medium tracking-widest uppercase">
            Crear Nueva Cuenta
          </Text>
        </Animated.View>

        <GlassCard 
          className="w-full max-w-[400px] p-8 border-white/5 bg-space-900/10"
          intensity={40}
        >
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            {/* Campo de Usuario */}
            <View className="mb-5">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                Usuario
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.5)" />
                <TextInput
                  className="flex-1 ml-3 text-white font-medium text-sm"
                  placeholder="Elige un nombre de usuario"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Campo de Contraseña */}
            <View className="mb-5">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                Contraseña
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.5)" />
                <TextInput
                  className="flex-1 ml-3 text-white font-medium text-sm"
                  placeholder="Mínimo 4 caracteres"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Campo de Confirmar Contraseña */}
            <View className="mb-8">
              <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-2 ml-1">
                Confirmar Contraseña
              </Text>
              <View className="flex-row items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                <Ionicons name="shield-checkmark-outline" size={18} color="rgba(255,255,255,0.5)" />
                <TextInput
                  className="flex-1 ml-3 text-white font-medium text-sm"
                  placeholder="Repite tu contraseña"
                  placeholderTextColor="rgba(255,255,255,0.2)"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <NeonButton
              title={isRegistering ? "Creando cuenta..." : "Registrarse"}
              variant="primary"
              icon="person-add-outline"
              onPress={handleRegister}
              className="w-full"
            />
            
            <View className="mt-6 flex-row justify-center items-center">
                <Text className="text-gray-400 text-xs">¿Ya tienes cuenta? </Text>
                <Link href="/login" asChild>
                    <Text className="text-neon-pink font-bold text-xs uppercase tracking-wider">
                        Inicia Sesión
                    </Text>
                </Link>
            </View>

          </Animated.View>
        </GlassCard>

        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          className="mt-6 mb-10"
        >
          <Text className="text-gray-600 text-[9px] font-bold uppercase tracking-[4px] opacity-30">
            Secure Platform
          </Text>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

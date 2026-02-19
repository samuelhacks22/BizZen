import React from 'react';
import { View, Text, Image } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassCard } from '../components/GlassCard';
import { NeonButton } from '../components/NeonButton';
import { ParticleBackground } from '../components/ParticleBackground';
import Animated, { 
    FadeInDown, 
    useSharedValue, 
    useAnimatedStyle, 
    withRepeat, 
    withTiming, 
    Easing,
    RotateInUpLeft
} from 'react-native-reanimated';

// Componente principal de la pantalla de bienvenida (Home)
export default function Home() {
  // Valor compartido para la animación de brillo (glow)
  const glow = useSharedValue(1);

  // Efecto para iniciar la animación de pulso continua
  React.useEffect(() => {
    glow.value = withRepeat(
        // Animación de tiempo: escala a 1.5x en 2 segundos
        withTiming(1.5, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1, // Repetir infinitamente
        true // Reversa (efecto yoyo)
    );
  }, []);

  // Estilo animado que depende del valor de 'glow'
  const animatedGlow = useAnimatedStyle(() => ({
    opacity: 0.3 + (glow.value - 1) * 0.4, // Opacidad dinámica
    transform: [{ scale: glow.value }], // Escala dinámica
  }));

  return (
    // Contenedor principal de pantalla completa con fondo negro
    <View className="flex-1 bg-black justify-center items-center">
      {/* Componente de fondo de partículas animadas */}
      <ParticleBackground />
      
      {/* Gradiente lineal de fondo para dar profundidad visual */}
      <LinearGradient
        colors={['transparent', 'rgba(168, 85, 247, 0.1)', 'transparent']}
        className="absolute w-full h-full"
      />
      
      {/* Tarjeta con efecto de vidrio (Glassmorphism) que contiene el contenido principal */}
      <GlassCard 
        className="w-[88%] max-w-[380px] items-center border-white/5 py-10 px-8 bg-space-900/10" 
        intensity={40}
      >
        {/* Contenedor animado que aparece desde abajo con retraso */}
        <Animated.View entering={FadeInDown.delay(400).springify().damping(12)} className="items-center mb-10">
            {/* Contenedor del Logo con efectos espaciales */}
            <View className="relative w-28 h-28 items-center justify-center mb-6">
                {/* Círculo de brillo animado detrás del logo */}
                <Animated.View 
                    style={animatedGlow}
                    className="absolute w-24 h-24 rounded-full bg-neon-cyan/20 blur-3xl" 
                />
                {/* Contenedor de la imagen del icono con bordes y sombra */}
                <View className="w-24 h-24 rounded-[32px] bg-black/40 items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
                    <Image 
                        source={require('../assets/icon.png')} 
                        style={{ width: 60, height: 60 }}
                        resizeMode="contain"
                    />
                </View>
            </View>

            {/* Título de la aplicación */}
            <Text className="text-5xl font-black text-white tracking-tightest">
                Manage<Text className="text-neon-cyan opacity-40">X</Text>
            </Text>
            
            {/* Línea divisoria decorativa con texto "Interfaz Espacial" */}
            <View className="flex-row items-center mt-3">
                <View className="h-[1px] w-6 bg-white/10 mr-4" />
                <Text className="text-gray-500 text-[9px] font-bold tracking-[6px] uppercase opacity-50">
                    Interfaz Espacial
                </Text>
                <View className="h-[1px] w-6 bg-white/10 ml-4" />
            </View>
        </Animated.View>

        {/* Contenedor de botones y pie de página */}
        <View className="w-full">
             {/* Enlace para navegar a la pantalla de pestañas (tabs) */}
             <Link href="/(tabs)" asChild>
                <NeonButton 
                    title="Panel de Control" 
                    variant="primary" 
                    icon="enter-outline"
                    className="w-full"
                />
            </Link>
            
            {/* Espaciador */}
            <View className="h-10" />
            
            {/* Texto de pie de página con el año */}
            <Text className="text-gray-700 text-center text-[9px] font-bold uppercase tracking-[4px] opacity-30">
                MANAGE X • 2026
            </Text>
        </View>
      </GlassCard>
    </View>
  );
}

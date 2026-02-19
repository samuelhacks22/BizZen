import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Canvas, Circle, Group, Blur } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing, cancelAnimation, interpolate } from 'react-native-reanimated';

const NUM_PARTICLES = 40; // Número de partículas flotantes
const NUM_BLOBS = 3; // Número de manchas de fondo (Blobs)

// Componente de Fondo de Partículas Animado con Skia
export const ParticleBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0); // Valor compartido para el tiempo global de animación

  // Iniciar ciclo de animación continua
  useEffect(() => {
    time.value = withRepeat(
        withTiming(1000, { duration: 450000, easing: Easing.linear }), 
        -1 
    );
    return () => cancelAnimation(time);
  }, []);

  // Generar partículas aleatorias (memoizado)
  const particles = React.useMemo(() => Array.from({ length: NUM_PARTICLES }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2.5 + 0.5, // Radio aleatorio
    speed: Math.random() * 0.8 + 0.2, // Velocidad aleatoria
    opacity: Math.random() * 0.3 + 0.05, // Opacidad base aleatoria
    phase: Math.random() * Math.PI * 2, // Fase para parpadeo
  })), [width, height]);

  // Generar blobs de fondo (memoizado)
  const blobs = React.useMemo(() => Array.from({ length: NUM_BLOBS }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 150 + 100, // Radio grande para efecto ambiental
    speed: Math.random() * 0.1 + 0.05, // Movimiento muy lento
    color: Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.03)' : 'rgba(168, 85, 247, 0.03)', // Cian o Púrpura muy tenue
  })), [width, height]);

  return (
    <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
      <Group>
        {/* Blobs Ambientales para profundidad */}
        {blobs.map((b, index) => (
            <Blob key={`blob-${index}`} b={b} time={time} height={height} width={width} />
        ))}
        
        {/* Partículas definidas */}
        {particles.map((p, index) => (
             <Particle 
                key={index} 
                p={p} 
                time={time} 
                height={height} 
             />
        ))}
      </Group>
      {/* Efecto de desenfoque global para suavizar */}
      <Blur blur={2} />
    </Canvas>
  );
};

// Componente Blob (Mancha suave de fondo)
const Blob = ({ b, time, height, width }: any) => {
    const cx = useDerivedValue(() => {
        const move = interpolate(time.value, [0, 1], [0, width * 0.5]);
        return ((b.x + move) % width); // Movimiento horizontal cíclico
    });
    const cy = useDerivedValue(() => {
        const move = interpolate(time.value, [0, 1], [0, height * 0.3]);
        return ((b.y + move) % height); // Movimiento vertical cíclico
    });

    return (
        <Group>
            <Circle cx={cx} cy={cy} r={b.r} color={b.color} />
            <Blur blur={60} />
        </Group>
    );
}

// Componente Partícula (Punto brillante flotante)
const Particle = ({ p, time, height }: any) => {
    // Movimiento vertical ascendente
    const cy = useDerivedValue(() => {
        const movement = time.value * 1000 * p.speed; 
        const newY = p.y - movement;
        return ((newY % height) + height) % height; // Ajuste cíclico (wrap around)
    }, [p.y, p.speed, height]);

    // Efecto de parpadeo (fade in/out) suave
    const opacity = useDerivedValue(() => {
        const pulse = Math.sin(time.value * 100 + p.phase) * 0.1;
        return Math.max(0.01, p.opacity + pulse);
    }, [p.opacity, p.phase]);

    return <Circle cx={p.x} cy={cy} r={p.r} color={`rgba(34, 211, 238, ${opacity.value})`} />;
}

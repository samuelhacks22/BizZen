import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Canvas, Circle, Group, Blur } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing, cancelAnimation, interpolate } from 'react-native-reanimated';

const NUM_PARTICLES = 40;
const NUM_BLOBS = 3;

export const ParticleBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
        withTiming(1000, { duration: 450000, easing: Easing.linear }), 
        -1 
    );
    return () => cancelAnimation(time);
  }, []);

  const particles = React.useMemo(() => Array.from({ length: NUM_PARTICLES }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 2.5 + 0.5,
    speed: Math.random() * 0.8 + 0.2,
    opacity: Math.random() * 0.3 + 0.05,
    phase: Math.random() * Math.PI * 2,
  })), [width, height]);

  const blobs = React.useMemo(() => Array.from({ length: NUM_BLOBS }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 150 + 100,
    speed: Math.random() * 0.1 + 0.05,
    color: Math.random() > 0.5 ? 'rgba(34, 211, 238, 0.03)' : 'rgba(168, 85, 247, 0.03)',
  })), [width, height]);

  return (
    <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
      <Group>
        {/* Ambient Blobs for Depth */}
        {blobs.map((b, index) => (
            <Blob key={`blob-${index}`} b={b} time={time} height={height} width={width} />
        ))}
        
        {/* Sharp Particles */}
        {particles.map((p, index) => (
             <Particle 
                key={index} 
                p={p} 
                time={time} 
                height={height} 
             />
        ))}
      </Group>
      <Blur blur={2} />
    </Canvas>
  );
};

const Blob = ({ b, time, height, width }: any) => {
    const cx = useDerivedValue(() => {
        const move = interpolate(time.value, [0, 1], [0, width * 0.5]);
        return ((b.x + move) % width);
    });
    const cy = useDerivedValue(() => {
        const move = interpolate(time.value, [0, 1], [0, height * 0.3]);
        return ((b.y + move) % height);
    });

    return (
        <Group>
            <Circle cx={cx} cy={cy} r={b.r} color={b.color} />
            <Blur blur={60} />
        </Group>
    );
}

const Particle = ({ p, time, height }: any) => {
    const cy = useDerivedValue(() => {
        const movement = time.value * 1000 * p.speed; 
        const newY = p.y - movement;
        return ((newY % height) + height) % height; 
    }, [p.y, p.speed, height]);

    const opacity = useDerivedValue(() => {
        const pulse = Math.sin(time.value * 100 + p.phase) * 0.1;
        return Math.max(0.01, p.opacity + pulse);
    }, [p.opacity, p.phase]);

    return <Circle cx={p.x} cy={cy} r={p.r} color={`rgba(34, 211, 238, ${opacity.value})`} />;
}

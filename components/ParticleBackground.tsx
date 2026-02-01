import React, { useEffect } from 'react';
import { useWindowDimensions } from 'react-native';
import { Canvas, Circle, Group } from '@shopify/react-native-skia';
import { useSharedValue, useDerivedValue, withRepeat, withTiming, Easing, cancelAnimation } from 'react-native-reanimated';

const NUM_PARTICLES = 25;

export const ParticleBackground = () => {
  const { width, height } = useWindowDimensions();
  const time = useSharedValue(0);

  useEffect(() => {
    time.value = withRepeat(
        withTiming(1000, { duration: 60000, easing: Easing.linear }), // 1 minute cycle
        -1 // infinite
    );
    return () => cancelAnimation(time);
  }, []);

  // Create stable random values
  const particles = React.useMemo(() => Array.from({ length: NUM_PARTICLES }).map(() => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 3 + 1,
    speed: Math.random() * 0.5 + 0.2, // Movement multiplier
    opacity: Math.random() * 0.4 + 0.1,
  })), [width, height]);

  return (
    <Canvas style={{ position: 'absolute', width, height }} pointerEvents="none">
      <Group>
        {particles.map((p, index) => (
             <Particle 
                key={index} 
                p={p} 
                time={time} 
                height={height} 
             />
        ))}
      </Group>
    </Canvas>
  );
};

const Particle = ({ p, time, height }: any) => {
    // Animate Y based on time
    const cy = useDerivedValue(() => {
        // Move upwards: initialY - (time * speed * factor)
        // We use a large factor because 'time' goes 0->1000
        const movement = time.value * 100 * p.speed; 
        const newY = p.y - movement;
        
        // Wrap logic
        return ((newY % height) + height) % height; 
    }, [time]);

    return <Circle cx={p.x} cy={cy} r={p.r} color={`rgba(34, 211, 238, ${p.opacity})`} />;
}

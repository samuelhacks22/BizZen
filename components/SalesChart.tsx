import React, { useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Canvas, Path, LinearGradient, vec, Skia } from '@shopify/react-native-skia';
import { GlassCard } from './GlassCard';

interface SalesChartProps {
  data: number[]; // Array of sales amounts
}

export function SalesChart({ data }: SalesChartProps) {
  const { width } = Dimensions.get('window');
  const GRAPH_WIDTH = width - 60; // Padding
  const GRAPH_HEIGHT = 150;
  
  const path = useMemo(() => {
    const skPath = Skia.Path.Make();
    if (data.length === 0) return skPath;

    const maxVal = Math.max(...data, 1);
    const stepX = GRAPH_WIDTH / (data.length - 1 || 1);

    skPath.moveTo(0, GRAPH_HEIGHT); // Start bottom left

    data.forEach((val, index) => {
      const x = index * stepX;
      const y = GRAPH_HEIGHT - (val / maxVal) * GRAPH_HEIGHT;
      
      if (index === 0) {
        skPath.moveTo(x, y);
      } else {
        // Simple straight lines for now, can be curved with cubicTo
        skPath.lineTo(x, y);
      }
    });

    return skPath;
  }, [data]);

  const fillPath = useMemo(() => {
    const skPath = Skia.Path.Make();
    if (data.length === 0) return skPath;
    
    skPath.addPath(path);
    skPath.lineTo(GRAPH_WIDTH, GRAPH_HEIGHT);
    skPath.lineTo(0, GRAPH_HEIGHT);
    skPath.close();
    return skPath;
  }, [path]);

  if (data.length < 2) {
    return (
        <GlassCard className="mx-4 mb-4 items-center justify-center" style={{ height: 200 }}>
            <Text className="text-gray-400">No hay suficientes datos para el gráfico</Text>
        </GlassCard>
    )
  }

  return (
    <GlassCard className="mx-4 mb-4" intensity={20}>
      <Text className="text-white font-bold text-lg mb-4 ml-2">Tendencia de Ventas</Text>
      <View style={{ height: GRAPH_HEIGHT, width: GRAPH_WIDTH }}>
        <Canvas style={{ flex: 1 }}>
            {/* Gradient Fill */}
          <Path path={fillPath}>
            <LinearGradient
              start={vec(0, 0)}
              end={vec(0, GRAPH_HEIGHT)}
              colors={["rgba(34, 211, 238, 0.5)", "rgba(34, 211, 238, 0.0)"]} // Cyan gradient
            />
          </Path>
          {/* Stroke Line */}
          <Path
            path={path}
            color="#22d3ee"
            style="stroke"
            strokeWidth={3}
            strokeJoin="round"
            strokeCap="round"
          />
        </Canvas>
      </View>
    </GlassCard>
  );
}

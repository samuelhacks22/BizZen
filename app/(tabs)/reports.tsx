import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { useSQLiteContext } from 'expo-sqlite';
import { useTycoon } from '../../context/TycoonContext';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function Reports() {
  const db = useSQLiteContext();
  const { netValuation, stats, showToast, unlockAchievement, refreshTycoon } = useTycoon();
  const [categories, setCategories] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const handleExportJSON = async () => {
    try {
      showToast('Generando archivo JSON...', 'success');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      const allAssets = await db.getAllAsync('SELECT * FROM assets');
      const allEmployees = await db.getAllAsync('SELECT * FROM employees');
      
      const data = {
        empireValue: netValuation,
        stats: stats,
        inventory: allAssets,
        humanCapital: allEmployees,
        exportedAt: new Date().toISOString()
      };
      
      const fileUri = `${(FileSystem as any).documentDirectory}managex_empire_report.json`;
      await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
        await unlockAchievement('EXPORT_DATA');
      } else {
        showToast('Compartir no disponible', 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Error al exportar JSON', 'error');
    }
  };

  const handleExportPDF = async () => {
    try {
      showToast('Generando reporte PDF...', 'success');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const allAssets = await db.getAllAsync<any>('SELECT * FROM assets WHERE status != "Disposed"');
      const allEmployees = await db.getAllAsync<any>('SELECT * FROM employees');

      const html = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; padding: 40px; }
              .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22d3ee; padding-bottom: 20px; margin-bottom: 30px; }
              .logo { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #22d3ee; }
              .date { font-size: 12px; color: #64748b; }
              .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
              .card { background-color: #0f172a; border: 1px solid #1e293b; padding: 20px; borderRadius: 16px; }
              .label { font-size: 10px; text-transform: uppercase; font-weight: 800; color: #64748b; margin-bottom: 5px; }
              .value { font-size: 24px; font-weight: 900; color: #fff; }
              .neon-text { color: #22d3ee; }
              .section-title { font-size: 18px; font-weight: 900; margin-bottom: 15px; border-left: 4px solid #a855f7; padding-left: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th { text-align: left; font-size: 10px; text-transform: uppercase; color: #64748b; padding: 10px; border-bottom: 1px solid #1e293b; }
              td { padding: 12px 10px; font-size: 13px; border-bottom: 1px solid #0f172a; }
              .status-badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; }
              .status-active { background-color: rgba(16, 185, 129, 0.1); color: #10b981; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">MANAGE<span style="color:#a855f7">X</span> TYCOON</div>
              <div class="date">REPORTE OFICIAL: ${new Date().toLocaleDateString()}</div>
            </div>

            <div class="summary-grid">
              <div class="card">
                <div class="label">Valoración Total</div>
                <div class="value">$${netValuation.toLocaleString()}</div>
              </div>
              <div class="card">
                <div class="label">Ingresos Anuales</div>
                <div class="value neon-text">$${stats.totalRevenue.toLocaleString()}</div>
              </div>
              <div class="card">
                <div class="label">Fuerza Laboral</div>
                <div class="value">${allEmployees.length} EMP</div>
              </div>
            </div>

            <div class="section-title">INVENTARIO DE ACTIVOS</div>
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Categoría</th>
                  <th>Costo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                ${allAssets.map(asset => `
                  <tr>
                    <td><b>${asset.name}</b><br/><small style="color:#64748b">${asset.asset_tag}</small></td>
                    <td>${asset.category}</td>
                    <td>$${asset.cost.toLocaleString()}</td>
                    <td><span class="status-badge status-active">${asset.status}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="section-title" style="margin-top: 40px;">CAPITAL HUMANO</div>
            <table>
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Cargo</th>
                  <th>Salario</th>
                  <th>Estatus</th>
                </tr>
              </thead>
              <tbody>
                ${allEmployees.map(emp => `
                  <tr>
                    <td><b>${emp.name}</b></td>
                    <td>${emp.role}</td>
                    <td>$${emp.salary?.toLocaleString()}</td>
                    <td>${emp.status}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #475569;">
              Este documento es confidencial y propiedad intelectual de Managex Tycoon Corporation.
            </div>
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      const pdfName = `${(FileSystem as any).documentDirectory}Reporte_Managex_${Date.now()}.pdf`;
      await FileSystem.moveAsync({ from: uri, to: pdfName });
      
      await Sharing.shareAsync(pdfName);
      await unlockAchievement('EXPORT_DATA');
    } catch (e) {
      console.error(e);
      showToast('Error al generar PDF', 'error');
    }
  };

  const loadReportData = useCallback(async () => {
    try {
      const result = await db.getAllAsync<any>(
        'SELECT category, COUNT(*) as count, SUM(cost) as total FROM assets WHERE status != "Disposed" GROUP BY category'
      );
      setCategories(result || []);
    } catch (e) {
      console.error('Error loading report data:', e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadReportData();
      refreshTycoon();
    }, [loadReportData, refreshTycoon])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 px-6 pt-10">
        <View className="flex-row items-center justify-between mb-8">
            <Text className="text-white text-3xl font-black tracking-tightest">ESTADÍSTICAS</Text>
            <View className="flex-row gap-3">
                <TouchableOpacity 
                    onPress={handleExportJSON}
                    activeOpacity={0.7}
                    className="w-12 h-12 rounded-2xl bg-white/5 items-center justify-center border border-white/5"
                >
                    <Ionicons name="code-working" size={20} color="#94a3b8" />
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={handleExportPDF}
                    activeOpacity={0.7}
                    className="w-12 h-12 rounded-2xl bg-neon-cyan/10 items-center justify-center border border-neon-cyan/20"
                >
                    <Ionicons name="document-text" size={22} color="#22d3ee" />
                </TouchableOpacity>
            </View>
        </View>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {/* Main Financial Card */}
          <GlassCard className="mb-6 bg-neon-purple/5 border-white/5" tint="dark">
            <View className="flex-row items-center justify-between mb-4">
               <View className="flex-1">
                 <Text className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Valor Neto del Imperio</Text>
                 <Text className="text-white text-4xl font-black mt-1 leading-none">${netValuation.toLocaleString()}</Text>
               </View>
               <View className="w-14 h-14 rounded-2xl bg-neon-purple/20 items-center justify-center border border-neon-purple/30">
                 <Ionicons name="stats-chart" size={28} color="#a855f7" />
               </View>
            </View>
            <View className="h-[1px] bg-white/5 w-full mb-4" />
            <View className="flex-row justify-between">
               <View>
                 <Text className="text-gray-500 text-[9px] font-black uppercase">Ingresos Totales</Text>
                 <Text className="text-neon-cyan font-black text-base">${stats.totalRevenue.toLocaleString()}</Text>
               </View>
               <View className="items-end">
                 <Text className="text-gray-500 text-[9px] font-black uppercase">Capital Humano</Text>
                 <Text className="text-neon-indigo font-black text-base">{stats.employees} Empleados</Text>
               </View>
            </View>
          </GlassCard>

          <Text className="text-white text-lg font-black mb-4 tracking-tight">Desglose por Categoría</Text>
          
          {categories.length === 0 ? (
            <GlassCard className="items-center py-10 border-white/5" gradientBorder={false}>
                <Text className="text-gray-500 font-medium">No hay activos registrados para reportar</Text>
            </GlassCard>
          ) : (
            <View className="pb-32">
              {categories.map((cat, idx) => (
                <GlassCard key={idx} className="mb-4 p-4 border-white/5" gradientBorder={false}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 rounded-xl bg-white/5 items-center justify-center mr-4 border border-white/5">
                        <Ionicons name="pricetag-outline" size={20} color="#94a3b8" />
                      </View>
                      <View>
                        <Text className="text-white font-bold text-base">{cat.category}</Text>
                        <Text className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">{cat.count} unidades</Text>
                      </View>
                    </View>
                    <View className="items-end">
                      <Text className="text-white font-black text-lg leading-tight">${cat.total.toLocaleString()}</Text>
                      <Text className="text-neon-purple text-[9px] font-black uppercase opacity-60">
                        {((cat.total / (netValuation || 1)) * 100).toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                  <View className="h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                      <View 
                        className="h-full bg-neon-purple shadow-sm shadow-neon-purple" 
                        style={{ width: `${(cat.total / (netValuation || 1)) * 100}%` }} 
                      />
                  </View>
                </GlassCard>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ScreenWrapper>
  );
}

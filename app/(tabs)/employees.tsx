import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { ScreenWrapper } from '../../components/ScreenWrapper';
import { GlassCard } from '../../components/GlassCard';
import { NeonButton } from '../../components/NeonButton';
import { AddEmployeeModal } from '../../components/AddEmployeeModal';
import { useSQLiteContext } from 'expo-sqlite';
import { useTycoon } from '../../context/TycoonContext';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function EmployeesScreen() {
  const db = useSQLiteContext();
  const { addXP, refreshTycoon, showToast } = useTycoon();
  const [employees, setEmployees] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadEmployees = useCallback(async () => {
    try {
      const result = await db.getAllAsync<any>('SELECT * FROM employees ORDER BY id DESC');
      setEmployees(result || []);
    } catch (e) {
      console.error('Error loading employees:', e);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      loadEmployees();
      refreshTycoon();
    }, [loadEmployees, refreshTycoon])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEmployees();
    setRefreshing(false);
  };

  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const handleSaveEmployee = async (empData: any, isRetry = false) => {
    try {
      if (empData.id) {
          const isValidation = empData.last_validated && empData.last_validated !== selectedEmployee?.last_validated;
          
          await db.runAsync(
            'UPDATE employees SET name = ?, role = ?, department = ?, salary = ?, status = ?, last_validated = ? WHERE id = ?',
            [empData.name, empData.role, empData.department, empData.salary, empData.status, empData.last_validated || selectedEmployee?.last_validated || null, empData.id]
          );

          if (isValidation) {
              await addXP(150);
              showToast(`Auditoría de ${empData.name} completada`, 'success');
          } else {
              showToast('Datos actualizados', 'success');
          }
      } else {
          await db.runAsync(
            'INSERT INTO employees (name, role, department, salary, hire_date, status) VALUES (?, ?, ?, ?, ?, ?)',
            [empData.name, empData.role, empData.department, empData.salary, new Date().toISOString(), empData.status]
          );
          await addXP(300);
          showToast(`${empData.name} se ha unido al equipo`, 'success');
      }
      
      await refreshTycoon();
      await loadEmployees();
      setSelectedEmployee(null);
      return true;
    } catch (e: any) {
      console.error('Error saving employee:', e);
      
      // Lógica de Auto-Reparación si falta la columna
      if (!isRetry && e.message?.includes('no such column: last_validated')) {
          console.log('[Auto-Repair] Intentando añadir columna faltante...');
          try {
              await db.execAsync('ALTER TABLE employees ADD COLUMN last_validated TEXT;');
              return handleSaveEmployee(empData, true); // Reintentar
          } catch (repairError) {
              console.error('[Auto-Repair] Falló la reparación:', repairError);
          }
      }

      Alert.alert('Error de Sistema', `No se pudo procesar la operación: ${e.message}`);
      return false;
    }
  };

  const deleteEmployee = (id: number, name: string) => {
    Alert.alert(
      'Dar de Baja',
      `¿Estás seguro de que deseas dar de baja a ${name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: 'destructive',
          onPress: async () => {
            await db.runAsync('DELETE FROM employees WHERE id = ?', [id]);
            await refreshTycoon();
            await loadEmployees();
            showToast('Empleado retirado', 'success');
          }
        }
      ]
    );
  };

  return (
    <ScreenWrapper>
      <View className="flex-1 px-6 pt-10">
        <View className="mb-8">
            <View>
                <Text className="text-white text-4xl font-black tracking-tightest">EQUIPO</Text>
                <Text className="text-neon-purple text-[10px] font-black uppercase tracking-widest mt-1">Gestión de Capital Humano</Text>
            </View>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          {employees.length === 0 ? (
            <GlassCard className="items-center py-20 mb-6 border-white/5">
                <View className="w-20 h-20 rounded-full bg-neon-purple/10 items-center justify-center mb-4 border border-neon-purple/20">
                    <Ionicons name="people-outline" size={40} color="#a855f7" />
                </View>
                <Text className="text-white text-lg font-bold text-center">Sin personal registrado</Text>
                <Text className="text-gray-500 text-center px-10 mt-2">
                    Tu imperio necesita líderes. Comienza contratando a tu primer colaborador.
                </Text>
                <NeonButton 
                  title="CONTRATAR AHORA" 
                  className="mt-8" 
                  icon="person-add" 
                  color="#a855f7"
                  onPress={() => setModalVisible(true)} 
                />
            </GlassCard>
          ) : (
            <View className="pb-32">
              {employees.map((item, index) => (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).springify()}>
                  <TouchableOpacity 
                    onPress={() => {
                        setSelectedEmployee(item);
                        setModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <GlassCard className={`mb-4 border-white/5 ${item.last_validated ? 'border-l-4 border-l-green-500' : ''}`}>
                      <View className="flex-row items-center">
                          <View className="w-14 h-14 rounded-2xl bg-neon-purple/10 items-center justify-center mr-4 border border-neon-purple/20">
                              <Ionicons name={item.last_validated ? "shield-checkmark" : "person"} size={28} color={item.last_validated ? "#10b981" : "#a855f7"} />
                          </View>
                          <View className="flex-1">
                              <View className="flex-row items-center">
                                  <Text className="text-white font-black text-lg mr-2">{item.name}</Text>
                                  {item.last_validated && (
                                      <View className="bg-green-500/20 px-2 py-0.5 rounded-full border border-green-500/30">
                                          <Text className="text-[8px] color-green-400 font-black uppercase">Auditado</Text>
                                      </View>
                                  )}
                              </View>
                              <View className="flex-row items-center mt-0.5">
                                  <Text className="text-neon-purple text-[10px] font-black uppercase tracking-widest mr-3">{item.role}</Text>
                                  <View className={`w-1.5 h-1.5 rounded-full mr-1 ${item.status === 'Active' ? 'bg-green-500' : item.status === 'On Leave' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                                  <Text className={`text-[10px] font-bold uppercase tracking-tight ${item.status === 'Active' ? 'text-green-500' : item.status === 'On Leave' ? 'text-yellow-500' : 'text-red-500'}`}>
                                      {item.status === 'Active' ? 'Activo' : item.status === 'On Leave' ? 'Licencia' : 'Inactivo'}
                                  </Text>
                              </View>
                              <View className="flex-row items-center mt-2">
                                  <Ionicons name="business-outline" size={12} color="#64748b" className="mr-1" />
                                  <Text className="text-gray-500 text-xs mr-3">{item.department}</Text>
                                  <Ionicons name="cash-outline" size={12} color="#10b981" className="mr-1" />
                                  <Text className="text-green-400 text-xs font-bold">${item.salary.toLocaleString()}</Text>
                              </View>
                          </View>
                          <TouchableOpacity 
                              onPress={() => deleteEmployee(item.id, item.name)}
                              className="w-10 h-10 rounded-full bg-red-500/10 items-center justify-center border border-red-500/20"
                          >
                              <Ionicons name="trash-outline" size={18} color="#f87171" />
                          </TouchableOpacity>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </ScrollView>

        <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => {
                setSelectedEmployee(null);
                setModalVisible(true);
            }}
            className="absolute bottom-32 right-6 w-16 h-16 rounded-full bg-neon-purple items-center justify-center shadow-xl shadow-purple-500/50"
        >
            <Ionicons name="person-add" size={28} color="white" />
        </TouchableOpacity>

        <AddEmployeeModal 
          visible={modalVisible} 
          initialEmployee={selectedEmployee}
          onClose={() => {
              setModalVisible(false);
              setSelectedEmployee(null);
          }} 
          onSave={handleSaveEmployee} 
        />
      </View>
    </ScreenWrapper>
  );
}

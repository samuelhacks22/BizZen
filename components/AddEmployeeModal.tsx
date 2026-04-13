import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface Employee {
  id?: number;
  name: string;
  role: string;
  department: string;
  salary: number;
  status: string;
  last_validated?: string;
}

interface AddEmployeeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (employee: any) => Promise<boolean>;
  initialEmployee?: Employee | null;
}

export function AddEmployeeModal({ visible, onClose, onSave, initialEmployee }: AddEmployeeModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [salary, setSalary] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (initialEmployee) {
        setName(initialEmployee.name);
        setRole(initialEmployee.role);
        setDepartment(initialEmployee.department || '');
        setSalary(initialEmployee.salary ? initialEmployee.salary.toString() : '');
        setStatus(initialEmployee.status || 'Active');
    } else {
        resetForm();
    }
  }, [initialEmployee, visible]);

  const resetForm = () => {
    setName('');
    setRole('');
    setDepartment('');
    setSalary('');
    setStatus('Active');
  };

  const handleSave = () => {
    if (!name || !role || !salary) {
      Alert.alert('Incompleto', 'El Nombre, Puesto y Salario son obligatorios.');
      return;
    }

    Keyboard.dismiss();
    onSave({
      ...(initialEmployee?.id ? { id: initialEmployee.id } : {}),
      name,
      role,
      department: department || 'General',
      salary: parseFloat(salary) || 0,
      status
    });
    
    onClose();
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior="padding"
        className="flex-1"
      >
        <Animated.View 
            entering={FadeIn.duration(300)}
            className="flex-1 justify-center items-center bg-black/60 p-4"
        >
            <Animated.View 
                entering={SlideInDown.duration(400)}
                className="w-full max-w-lg"
            >
                <GlassCard className="border-neon-purple/20" intensity={80}>
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-neon-purple font-bold tracking-widest text-xs uppercase mb-1">
                                    {initialEmployee ? 'ACTUALIZAR' : 'NUEVO TALENTO'}
                                </Text>
                                <Text className="text-white text-2xl font-black">
                                    {initialEmployee ? 'Editar Empleado' : 'Contratar Personal'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="bg-white/10 p-3 rounded-full">
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView 
                            showsVerticalScrollIndicator={false} 
                            className="max-h-[60vh]"
                            contentContainerStyle={{ paddingBottom: 20 }}
                        >
                            <Text className="text-gray-400 mb-2 font-bold text-xs uppercase ml-1">Datos Personales</Text>
                            <TextInput 
                                className="bg-black/20 text-white p-4 rounded-xl mb-4 border border-white/10 focus:border-neon-purple/50 font-medium"
                                placeholder="Nombre Completo"
                                placeholderTextColor="#4b5563"
                                value={name}
                                onChangeText={setName}
                            />

                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-1">
                                    <TextInput 
                                        className="bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-neon-purple/50 font-medium"
                                        placeholder="Puesto / Cargo"
                                        placeholderTextColor="#4b5563"
                                        value={role}
                                        onChangeText={setRole}
                                    />
                                </View>
                                <View className="flex-1">
                                    <TextInput 
                                        className="bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-neon-purple/50 font-medium"
                                        placeholder="Salario ($)"
                                        placeholderTextColor="#4b5563"
                                        keyboardType="numeric"
                                        value={salary}
                                        onChangeText={setSalary}
                                    />
                                </View>
                            </View>

                            <Text className="text-gray-400 mb-2 font-bold text-xs uppercase ml-1">Organización</Text>
                            <TextInput 
                                className="bg-black/20 text-white p-4 rounded-xl mb-4 border border-white/10 focus:border-neon-purple/50 font-medium"
                                placeholder="Departamento"
                                placeholderTextColor="#4b5563"
                                value={department}
                                onChangeText={setDepartment}
                            />

                             <Text className="text-gray-400 mb-3 font-bold text-xs uppercase ml-1">Estatus Laboral</Text>
                            <View className="flex-row flex-wrap gap-2 mb-2">
                                {[
                                    { label: 'Activo', value: 'Active', color: 'bg-green-500' },
                                    { label: 'Licencia', value: 'On Leave', color: 'bg-yellow-500' },
                                    { label: 'Inactivo', value: 'Inactive', color: 'bg-red-500' }
                                ].map((s) => (
                                    <TouchableOpacity 
                                        key={s.value}
                                        onPress={() => setStatus(s.value)}
                                        activeOpacity={0.7}
                                        className={`px-5 py-3 rounded-2xl flex-row items-center border ${status === s.value ? 'bg-white/10 border-white/30' : 'bg-transparent border-white/5'}`}
                                    >
                                        <View className={`w-2 h-2 rounded-full mr-3 ${status === s.value ? s.color : 'bg-gray-600'}`} />
                                        <Text className={`text-xs font-bold ${status === s.value ? 'text-white' : 'text-gray-500'}`}>{s.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>

                        <View className="mt-8">
                            <NeonButton 
                                title={initialEmployee ? "Actualizar Datos" : "Confirmar Contratación"} 
                                onPress={handleSave}
                                variant={initialEmployee ? 'secondary' : 'primary'}
                                color="#a855f7"
                            />
                            
                            {initialEmployee && (
                                <TouchableOpacity 
                                    onPress={async () => {
                                        Keyboard.dismiss();
                                        const success = await onSave({ 
                                            ...(initialEmployee?.id ? { id: initialEmployee.id } : {}),
                                            name,
                                            role,
                                            department,
                                            salary: parseFloat(salary) || 0,
                                            status,
                                            last_validated: new Date().toISOString() 
                                        });
                                        if (success) onClose();
                                    }}
                                    className="mt-4 p-4 rounded-2xl bg-green-500/10 border border-green-500/20 flex-row items-center justify-center"
                                >
                                    <Ionicons name="shield-checkmark-outline" size={20} color="#10b981" className="mr-2" />
                                    <Text className="text-green-400 font-bold uppercase tracking-widest text-xs">Auditar Desempeño (+150 XP)</Text>
                                </TouchableOpacity>
                            )}

                            <TouchableOpacity 
                                onPress={onClose}
                                className="mt-2 py-3 items-center"
                            >
                                <Text className="text-gray-500 font-bold">CANCELAR</Text>
                            </TouchableOpacity>
                        </View>
                </GlassCard>
            </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

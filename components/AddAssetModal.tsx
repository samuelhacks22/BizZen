import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { GlassCard } from './GlassCard';
import { NeonButton } from './NeonButton';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface Asset {
  id?: number;
  name: string;
  asset_tag: string;
  category: string;
  location: string;
  serial_number: string;
  cost: number;
  status: string;
}

interface AddAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (asset: Asset) => void;
  initialAsset?: Asset | null;
}

export function AddAssetModal({ visible, onClose, onSave, initialAsset }: AddAssetModalProps) {
  const [name, setName] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [cost, setCost] = useState('');
  const [status, setStatus] = useState('Active');

  useEffect(() => {
    if (initialAsset) {
        setName(initialAsset.name);
        setAssetTag(initialAsset.asset_tag || '');
        setCategory(initialAsset.category || '');
        setLocation(initialAsset.location || '');
        setSerialNumber(initialAsset.serial_number || '');
        setCost(initialAsset.cost ? initialAsset.cost.toString() : '');
        setStatus(initialAsset.status || 'Active');
    } else {
        resetForm();
    }
  }, [initialAsset, visible]);

  const resetForm = () => {
    setName('');
    setAssetTag('');
    setCategory('');
    setLocation('');
    setSerialNumber('');
    setCost('');
    setStatus('Active');
  };

  const handleSave = () => {
    if (!name || !assetTag || !cost) {
      Alert.alert('Incompleto', 'El Nombre, Tag y Costo son obligatorios.');
      return;
    }

    onSave({
      ...(initialAsset?.id ? { id: initialAsset.id } : {}),
      name,
      asset_tag: assetTag,
      category: category || 'General',
      location: location || 'Sin asignar',
      serial_number: serialNumber,
      cost: parseFloat(cost) || 0,
      status
    });
    
    onClose();
  };

  const getStatusColor = (s: string) => {
      switch(status) {
          case 'Active': return '#4ade80';
          case 'In Repair': return '#fbbf24';
          case 'Disposed': return '#f87171';
          default: return '#9ca3af';
      }
  };

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <Animated.View 
            entering={FadeIn.duration(300)}
            className="flex-1 justify-center items-center bg-black/60 p-4"
        >
            <Animated.View 
                entering={SlideInDown.springify().damping(15)}
                className="w-full max-w-lg"
            >
                <GlassCard className="p-0 border-neon-cyan/20" intensity={80}>
                    <View className="p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <View>
                                <Text className="text-neon-cyan font-bold tracking-widest text-xs uppercase mb-1">
                                    {initialAsset ? 'ACTUALIZAR' : 'NUEVO REGISTRO'}
                                </Text>
                                <Text className="text-white text-2xl font-black">
                                    {initialAsset ? 'Editar Activo' : 'Registrar Activo'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} className="bg-white/10 p-3 rounded-full">
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView showsVerticalScrollIndicator={false} className="max-h-[60vh]">
                            <Text className="text-gray-400 mb-2 font-bold text-xs uppercase ml-1">Información General</Text>
                            <TextInput 
                                className="bg-black/20 text-white p-4 rounded-xl mb-4 border border-white/10 focus:border-neon-cyan/50 font-medium"
                                placeholder="Nombre (ej. MacBook Pro)"
                                placeholderTextColor="#4b5563"
                                value={name}
                                onChangeText={setName}
                            />

                            <View className="flex-row gap-3 mb-4">
                                <View className="flex-1">
                                    <TextInput 
                                        className="bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-neon-cyan/50 font-medium"
                                        placeholder="Asset Tag"
                                        placeholderTextColor="#4b5563"
                                        value={assetTag}
                                        onChangeText={setAssetTag}
                                    />
                                </View>
                                <View className="flex-1">
                                    <TextInput 
                                        className="bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-neon-cyan/50 font-medium"
                                        placeholder="Costo ($)"
                                        placeholderTextColor="#4b5563"
                                        keyboardType="numeric"
                                        value={cost}
                                        onChangeText={setCost}
                                    />
                                </View>
                            </View>

                            <Text className="text-gray-400 mb-2 font-bold text-xs uppercase ml-1">Detalles Técnicos</Text>
                            <TextInput 
                                className="bg-black/20 text-white p-4 rounded-xl mb-4 border border-white/10 focus:border-neon-cyan/50 font-medium"
                                placeholder="Categoría"
                                placeholderTextColor="#4b5563"
                                value={category}
                                onChangeText={setCategory}
                            />

                            <TextInput 
                                className="bg-black/20 text-white p-4 rounded-xl mb-4 border border-white/10 focus:border-neon-cyan/50 font-medium"
                                placeholder="Ubicación"
                                placeholderTextColor="#4b5563"
                                value={location}
                                onChangeText={setLocation}
                            />

                            <TextInput 
                                className="bg-black/20 text-white p-4 rounded-xl mb-4 border border-white/10 focus:border-neon-cyan/50 font-medium"
                                placeholder="Número de Serie"
                                placeholderTextColor="#4b5563"
                                value={serialNumber}
                                onChangeText={setSerialNumber}
                            />

                             <Text className="text-gray-400 mb-3 font-bold text-xs uppercase ml-1">Estado Operativo</Text>
                            <View className="flex-row flex-wrap gap-2 mb-2">
                                {[
                                    { label: 'Activo', value: 'Active', color: 'bg-green-500' },
                                    { label: 'Reparación', value: 'In Repair', color: 'bg-yellow-500' },
                                    { label: 'Baja', value: 'Disposed', color: 'bg-red-500' }
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
                                title={initialAsset ? "Actualizar Activo" : "Registrar Activo"} 
                                onPress={handleSave}
                                variant={initialAsset ? 'secondary' : 'primary'}
                            />
                            <TouchableOpacity 
                                onPress={onClose}
                                className="mt-2 py-3 items-center"
                            >
                                <Text className="text-gray-500 font-bold">CANCELAR</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </GlassCard>
            </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

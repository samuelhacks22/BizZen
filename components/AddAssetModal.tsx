import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { GlassCard } from './GlassCard';

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
        setName('');
        setAssetTag('');
        setCategory('');
        setLocation('');
        setSerialNumber('');
        setCost('');
        setStatus('Active');
    }
  }, [initialAsset, visible]);

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
      location: location || 'Unassigned',
      serial_number: serialNumber,
      cost: parseFloat(cost) || 0,
      status
    });
    
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <GlassCard className="w-full max-w-lg max-h-[90%] p-0" intensity={90}>
            <View className="p-4 h-full">
                <Text className="text-white text-xl font-bold mb-4">{initialAsset ? 'Editar Activo' : 'Registrar Activo'}</Text>
                
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text className="text-gray-300 mb-1 font-bold">Nombre del Activo</Text>
                    <TextInput 
                        className="bg-white/10 text-white p-3 rounded-lg mb-3 border border-white/20"
                        placeholder="e.g. MacBook Pro M1"
                        placeholderTextColor="#9ca3af"
                        value={name}
                        onChangeText={setName}
                    />

                    <View className="flex-row gap-2 mb-3">
                        <View className="flex-1">
                            <Text className="text-gray-300 mb-1 font-bold">Asset Tag (ID)</Text>
                            <TextInput 
                                className="bg-white/10 text-white p-3 rounded-lg border border-white/20"
                                placeholder="TAG-XXX"
                                placeholderTextColor="#9ca3af"
                                value={assetTag}
                                onChangeText={setAssetTag}
                            />
                        </View>
                        <View className="flex-1">
                             <Text className="text-gray-300 mb-1 font-bold">Costo ($)</Text>
                            <TextInput 
                                className="bg-white/10 text-white p-3 rounded-lg border border-white/20"
                                placeholder="0.00"
                                placeholderTextColor="#9ca3af"
                                keyboardType="numeric"
                                value={cost}
                                onChangeText={setCost}
                            />
                        </View>
                    </View>

                    <Text className="text-gray-300 mb-1 font-bold">Categoría</Text>
                    <TextInput 
                        className="bg-white/10 text-white p-3 rounded-lg mb-3 border border-white/20"
                        placeholder="e.g. IT Equipment"
                        placeholderTextColor="#9ca3af"
                        value={category}
                        onChangeText={setCategory}
                    />

                    <Text className="text-gray-300 mb-1 font-bold">Ubicación</Text>
                    <TextInput 
                        className="bg-white/10 text-white p-3 rounded-lg mb-3 border border-white/20"
                        placeholder="e.g. Oficinas Centrales"
                        placeholderTextColor="#9ca3af"
                        value={location}
                        onChangeText={setLocation}
                    />

                    <Text className="text-gray-300 mb-1 font-bold">Número de Serie</Text>
                    <TextInput 
                        className="bg-white/10 text-white p-3 rounded-lg mb-3 border border-white/20"
                        placeholder="SN-12345678"
                        placeholderTextColor="#9ca3af"
                        value={serialNumber}
                        onChangeText={setSerialNumber}
                    />

                     <Text className="text-gray-300 mb-1 font-bold">Estado</Text>
                    <View className="flex-row flex-wrap gap-2 mb-6">
                        {['Active', 'In Repair', 'Disposed'].map((s) => (
                            <TouchableOpacity 
                                key={s}
                                onPress={() => setStatus(s)}
                                className={`px-4 py-2 rounded-full border ${status === s ? 'bg-cyan-500 border-cyan-500' : 'bg-transparent border-gray-500'}`}
                            >
                                <Text className="text-white text-xs">{s}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>

                <View className="flex-row justify-end space-x-3 mt-4 pt-4 border-t border-white/10">
                    <TouchableOpacity 
                        onPress={onClose}
                        className="py-3 px-6 rounded-lg bg-gray-600"
                    >
                        <Text className="text-white font-bold">Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={handleSave}
                        className="py-3 px-6 rounded-lg bg-cyan-500 shadow-lg shadow-cyan-500/50"
                    >
                        <Text className="text-white font-bold">Guardar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </GlassCard>
      </View>
    </Modal>
  );
}

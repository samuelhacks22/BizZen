import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { GlassCard } from '../../components/GlassCard';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { SalesChart } from '../../components/SalesChart';

type Transaction = {
  id: number;
  type: string;
  amount: number;
  date: string;
  note: string;
};

export default function Reports() {
  const db = useSQLiteContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartData, setChartData] = useState<number[]>([]);

  const loadTransactions = async () => {
    try {
      const result = await db.getAllAsync<Transaction>('SELECT * FROM transactions ORDER BY date DESC LIMIT 50');
      setTransactions(result);

      // Process data for chart: Reverse to chronological order (Oldest -> Newest)
      // Filter only SALES and map to amounts
      const sales = result
        .filter(t => t.type === 'SALE')
        .reverse() // Oldest first for the chart
        .map(t => t.amount);
        
      setChartData(sales);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const renderItem = ({ item }: { item: Transaction }) => {
    const isSale = item.type === 'SALE';
    const date = new Date(item.date).toLocaleDateString() + ' ' + new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <GlassCard className="mb-3 mx-4 p-3" intensity={20}>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center">
            <View className={`p-2 rounded-full mr-3 ${isSale ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Ionicons 
                name={isSale ? "arrow-up" : "arrow-down"} 
                size={20} 
                color={isSale ? "#4ade80" : "#f87171"} 
              />
            </View>
            <View>
              <Text className="text-white font-semibold">{item.note || item.type}</Text>
              <Text className="text-gray-400 text-xs">{date}</Text>
            </View>
          </View>
          <Text className={`font-bold text-lg ${isSale ? 'text-green-400' : 'text-red-400'}`}>
            {isSale ? '+' : '-'}${item.amount.toFixed(2)}
          </Text>
        </View>
      </GlassCard>
    );
  };

  return (
    <View className="flex-1 bg-slate-900">
       <LinearGradient
        colors={['#0f172a', '#1e1b4b']}
        className="absolute w-full h-full"
      />
      
      <FlatList
        ListHeaderComponent={
          <>
            <View className="pt-12 px-6 pb-4 flex-row justify-between items-center">
              <Text className="text-white text-3xl font-bold">Reports</Text>
              <TouchableOpacity 
                onPress={loadTransactions}
                className="bg-slate-700/50 p-2 rounded-full"
              >
                <Ionicons name="refresh" size={20} color="white" />
              </TouchableOpacity>
            </View>
            <SalesChart data={chartData} />
            <Text className="text-white text-xl font-bold px-6 mb-4">History</Text>
          </>
        }
        data={transactions}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListEmptyComponent={
          <Text className="text-gray-400 text-center mt-10">No transactions found.</Text>
        }
      />
    </View>
  );
}

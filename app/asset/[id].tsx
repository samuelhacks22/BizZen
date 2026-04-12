import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function AssetDetails() {
  const { id } = useLocalSearchParams();
  return (
    <View>
      <Text>Asset ID: {id}</Text>
    </View>
  );
}

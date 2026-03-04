import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

// Placeholder — replace with Victory Native <VictoryBar /> or <VictoryLine />
export default function SalesChart() {
  const router = useRouter();

  return (
    <View className="bg-white rounded-2xl p-4 shadow">
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-base font-bold text-gray-800">Daily Sales</Text>
        <TouchableOpacity onPress={() => router.push("/reports")}>
          <Text className="text-green-600 text-sm font-semibold">View More</Text>
        </TouchableOpacity>
      </View>

      {/* Chart placeholder */}
      <View className="h-40 items-center justify-center bg-gray-50 rounded-xl">
        <Text className="text-gray-400">Chart goes here</Text>
      </View>
    </View>
  );
}

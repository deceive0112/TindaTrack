import { ScrollView, Text, View } from "react-native";
import SalesChart from "@/components/dashboard/SalesChart";
import LowStockCard from "@/components/dashboard/LowStockCard";
import QuickStats from "@/components/dashboard/QuickStats";

export default function DashboardScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">TindaTrack</Text>

      {/* Quick Stats */}
      <QuickStats />

      {/* Sales Chart */}
      <View className="mt-4">
        <SalesChart />
      </View>

      {/* Low Stock Warning */}
      <View className="mt-4">
        <LowStockCard />
      </View>
    </ScrollView>
  );
}

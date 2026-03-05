import { ScrollView, Text, View, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import SalesChart from "@/components/dashboard/SalesChart";
import LowStockCard from "@/components/dashboard/LowStockCard";
import QuickStats from "@/components/dashboard/QuickStats";
import { format } from "date-fns";

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [key, setKey] = useState(0);

  // Refresh all components by remounting them
  const refresh = () => {
    setKey((k) => k + 1);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    refresh();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  return (
    <ScrollView
      className="flex-1 bg-gray-100 px-4 py-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />
      }
    >
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-gray-800">TindaTrack</Text>
        <Text className="text-xs text-gray-400">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </Text>
      </View>

      {/* Low Stock Warning */}
      <LowStockCard key={`low-${key}`} />

      {/* Quick Stats */}
      <View className="mt-4">
        <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
          Summary
        </Text>
        <QuickStats key={`stats-${key}`} />
      </View>

      {/* Sales Chart */}
      <View className="mt-4 mb-6">
        <Text className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">
          Sales Trend
        </Text>
        <SalesChart key={`chart-${key}`} />
      </View>
    </ScrollView>
  );
}

import { ScrollView, Text, View, TouchableOpacity } from "react-native";
import { useState } from "react";

const FILTERS = ["Weekly", "Monthly"];

// Placeholder chart data — replace with Supabase query + date-fns
const mockData = {
  Weekly: [10, 40, 30, 80, 60, 90, 50],
  Monthly: [300, 500, 400, 700, 600, 800, 750, 900, 650, 700, 500, 850],
};

export default function ReportsScreen() {
  const [filter, setFilter] = useState<"Weekly" | "Monthly">("Weekly");

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-4">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Reports</Text>

      {/* Filter Toggle */}
      <View className="flex-row gap-2 mb-4">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f as "Weekly" | "Monthly")}
            className={`px-4 py-2 rounded-full ${
              filter === f ? "bg-green-600" : "bg-white border border-gray-300"
            }`}
          >
            <Text className={filter === f ? "text-white font-semibold" : "text-gray-600"}>
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chart Placeholder — replace with Victory Native chart */}
      <View className="bg-white rounded-2xl p-4 shadow items-center justify-center h-48">
        <Text className="text-gray-400">{filter} Chart goes here</Text>
      </View>
    </ScrollView>
  );
}

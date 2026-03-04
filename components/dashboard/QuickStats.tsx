import { View, Text } from "react-native";

// Placeholder — replace with Supabase aggregated queries
const stats = [
  { label: "Today", value: "₱1,200" },
  { label: "This Week", value: "₱8,400" },
  { label: "This Month", value: "₱32,000" },
];

export default function QuickStats() {
  return (
    <View className="flex-row gap-2">
      {stats.map((stat) => (
        <View
          key={stat.label}
          className="flex-1 bg-white rounded-2xl p-3 shadow items-center"
        >
          <Text className="text-xs text-gray-500">{stat.label}</Text>
          <Text className="text-sm font-bold text-green-600 mt-1">{stat.value}</Text>
        </View>
      ))}
    </View>
  );
}

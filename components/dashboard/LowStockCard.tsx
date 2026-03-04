import { View, Text } from "react-native";
import { AlertTriangle } from "lucide-react-native";

// Placeholder — replace with Supabase query filtering stock <= threshold
const lowStockItems = [
  { id: "1", name: "Product B", stock: 3 },
];

export default function LowStockCard() {
  if (lowStockItems.length === 0) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow">
      <View className="flex-row items-center gap-2 mb-2">
        <AlertTriangle size={18} color="#dc2626" />
        <Text className="text-red-600 font-bold text-base">Low Stock Warning</Text>
      </View>
      {lowStockItems.map((item) => (
        <Text key={item.id} className="text-red-500 text-sm">
          • {item.name} — only {item.stock} left
        </Text>
      ))}
    </View>
  );
}

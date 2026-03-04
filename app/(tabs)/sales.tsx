import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import SaleItem from "@/components/sales/SaleItem";

// Placeholder — replace with Supabase query
const mockSales = [
  { id: "1", product: "Product A", qty: 2, total: 100 },
  { id: "2", product: "Product B", qty: 1, total: 30 },
];

export default function SalesScreen() {
  const router = useRouter();

  const grandTotal = mockSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={mockSales}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4 gap-3"
        renderItem={({ item }) => <SaleItem sale={item} />}
        ListFooterComponent={
          <View className="mt-4 p-4 bg-white rounded-2xl shadow">
            <Text className="text-lg font-bold text-gray-800">
              Total: ₱{grandTotal}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/modals/receipt")}
              className="mt-3 bg-green-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">View Receipt</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB - Add Sale */}
      <TouchableOpacity
        onPress={() => router.push("/modals/add-sale")}
        className="absolute bottom-6 right-6 bg-green-600 rounded-full p-4 shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

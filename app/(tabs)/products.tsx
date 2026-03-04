import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import ProductCard from "@/components/inventory/ProductCard";

// Placeholder data — replace with Supabase query
const mockProducts = [
  { id: "1", name: "Product A", price: 50, stock: 20 },
  { id: "2", name: "Product B", price: 30, stock: 3 },
];

export default function ProductsScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-100">
      <FlatList
        data={mockProducts}
        keyExtractor={(item) => item.id}
        contentContainerClassName="px-4 py-4 gap-3"
        renderItem={({ item }) => <ProductCard product={item} />}
        ListEmptyComponent={
          <Text className="text-center text-gray-400 mt-10">No products yet.</Text>
        }
      />

      {/* FAB - Add Product */}
      <TouchableOpacity
        onPress={() => router.push("/modals/add-product")}
        className="absolute bottom-6 right-6 bg-green-600 rounded-full p-4 shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

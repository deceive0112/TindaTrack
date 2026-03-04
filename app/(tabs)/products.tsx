import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";
import ProductCard from "@/components/inventory/ProductCard";

export default function ProductsScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching products:", error);
    else setProducts(data ?? []);
    setLoading(false);
  };

  // Refetch every time screen is focused (e.g. after adding a product)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  return (
    <View className="flex-1 bg-gray-100">
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4 gap-3"
          renderItem={({ item }) => (
            <ProductCard product={item} onStockUpdate={fetchProducts} />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">
              No products yet. Tap + to add one!
            </Text>
          }
        />
      )}

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

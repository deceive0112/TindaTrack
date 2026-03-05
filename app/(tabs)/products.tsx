import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState, useCallback } from "react";
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

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const AddButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/modals/add-product")}
      className="mt-3 bg-green-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
    >
      <Plus size={20} color="white" />
      <Text className="text-white font-bold text-base">Add Product</Text>
    </TouchableOpacity>
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
          ListFooterComponent={<AddButton />}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">
              No products yet. Add your first one!
            </Text>
          }
        />
      )}
    </View>
  );
}

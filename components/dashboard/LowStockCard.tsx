import { View, Text, ActivityIndicator } from "react-native";
import { AlertTriangle } from "lucide-react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Product } from "@/types";

const LOW_STOCK_THRESHOLD = 3;

export default function LowStockCard() {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .lte("stock", LOW_STOCK_THRESHOLD)
        .order("stock", { ascending: true });

      if (error) console.error("Error fetching low stock:", error);
      else setItems(data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <ActivityIndicator color="#16a34a" />;
  if (items.length === 0) return null;

  return (
    <View className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow">
      <View className="flex-row items-center gap-2 mb-3">
        <AlertTriangle size={18} color="#dc2626" />
        <Text className="text-red-600 font-bold text-lg">
          Low Stock Warning ({items.length})
        </Text>
      </View>
      {items.map((item) => (
        <View
          key={item.id}
          className="flex-row justify-between py-2 border-b border-red-100"
        >
          <Text className="text-red-500 text-base font-semibold">{item.name}</Text>
          {item.stock === 0 ? (
            <Text className="text-red-600 text-base font-bold">Out of stock!</Text>
          ) : (
            <Text className="text-red-400 text-base">Only {item.stock} left</Text>
          )}
        </View>
      ))}
    </View>
  );
}

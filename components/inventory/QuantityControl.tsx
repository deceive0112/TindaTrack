import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { Minus, Plus } from "lucide-react-native";
import { supabase } from "@/lib/supabase";

type Props = {
  productId: string;
  stock: number;
  onStockUpdate?: () => void;
};

export default function QuantityControl({ productId, stock, onStockUpdate }: Props) {
  const [qty, setQty] = useState(stock);
  const [loading, setLoading] = useState(false);

  const requestChange = (delta: number) => {
    const next = qty + delta;
    if (next < 0) return;

    Alert.alert(
      "Confirm Change",
      `Update stock from ${qty} to ${next}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => updateStock(next),
        },
      ]
    );
  };

  const updateStock = async (newQty: number) => {
    setLoading(true);
    const { error } = await supabase
      .from("products")
      .update({ stock: newQty })
      .eq("id", productId);

    if (error) {
      Alert.alert("Error", "Failed to update stock. Please try again.");
      console.error(error);
    } else {
      setQty(newQty);
      onStockUpdate?.();
    }
    setLoading(false);
  };

  return (
    <View className="flex-row items-center gap-3">
      <TouchableOpacity
        onPress={() => requestChange(-1)}
        disabled={loading || qty === 0}
        className="bg-red-100 rounded-full p-2"
      >
        <Minus size={16} color="#dc2626" />
      </TouchableOpacity>

      <Text className="text-base font-bold text-gray-800 w-6 text-center">
        {qty}
      </Text>

      <TouchableOpacity
        onPress={() => requestChange(1)}
        disabled={loading}
        className="bg-green-100 rounded-full p-2"
      >
        <Plus size={16} color="#16a34a" />
      </TouchableOpacity>
    </View>
  );
}

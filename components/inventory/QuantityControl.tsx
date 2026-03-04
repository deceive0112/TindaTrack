import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useState } from "react";
import { Minus, Plus } from "lucide-react-native";

type Props = {
  productId: string;
  stock: number;
};

export default function QuantityControl({ productId, stock }: Props) {
  const [qty, setQty] = useState(stock);
  const [pending, setPending] = useState<number | null>(null);

  const requestChange = (delta: number) => {
    const next = qty + delta;
    if (next < 0) return;
    setPending(next);

    Alert.alert(
      "Confirm Change",
      `Update stock to ${next}?`,
      [
        { text: "Cancel", style: "cancel", onPress: () => setPending(null) },
        {
          text: "Confirm",
          onPress: () => {
            setQty(next);
            setPending(null);
            // TODO: update Supabase stock here
          },
        },
      ]
    );
  };

  return (
    <View className="flex-row items-center gap-3">
      <TouchableOpacity
        onPress={() => requestChange(-1)}
        className="bg-red-100 rounded-full p-2"
      >
        <Minus size={16} color="#dc2626" />
      </TouchableOpacity>

      <Text className="text-base font-bold text-gray-800 w-6 text-center">
        {pending !== null ? pending : qty}
      </Text>

      <TouchableOpacity
        onPress={() => requestChange(1)}
        className="bg-green-100 rounded-full p-2"
      >
        <Plus size={16} color="#16a34a" />
      </TouchableOpacity>
    </View>
  );
}

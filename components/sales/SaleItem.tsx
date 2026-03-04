import { View, Text } from "react-native";

type Sale = {
  id: string;
  product: string;
  qty: number;
  total: number;
};

export default function SaleItem({ sale }: { sale: Sale }) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow flex-row justify-between items-center">
      <View>
        <Text className="text-base font-bold text-gray-800">{sale.product}</Text>
        <Text className="text-sm text-gray-500">Qty: {sale.qty}</Text>
      </View>
      <Text className="text-green-600 font-bold text-base">₱{sale.total}</Text>
    </View>
  );
}

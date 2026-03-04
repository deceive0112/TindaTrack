import { View, Text } from "react-native";
import QuantityControl from "./QuantityControl";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow flex-row justify-between items-center">
      <View>
        <Text className="text-base font-bold text-gray-800">{product.name}</Text>
        <Text className="text-sm text-gray-500">₱{product.price}</Text>
        <Text className={`text-xs mt-1 ${product.stock <= 5 ? "text-red-500" : "text-gray-400"}`}>
          Stock: {product.stock}
        </Text>
      </View>
      <QuantityControl productId={product.id} stock={product.stock} />
    </View>
  );
}

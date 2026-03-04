import { View, Text } from "react-native";
import { Product } from "@/types";
import QuantityControl from "./QuantityControl";

type Props = {
  product: Product;
  onStockUpdate?: () => void;
};

export default function ProductCard({ product, onStockUpdate }: Props) {
  return (
    <View className="bg-white rounded-2xl p-4 shadow flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-bold text-gray-800">{product.name}</Text>
        <Text className="text-sm text-gray-500">₱{product.price}</Text>
        {product.stock <= 5 ? (
          <Text className="text-xs mt-1 text-red-500">
            Stock: {product.stock} — Low!
          </Text>
        ) : (
          <Text className="text-xs mt-1 text-gray-400">
            Stock: {product.stock}
          </Text>
        )}
      </View>
      <QuantityControl
        productId={product.id}
        stock={product.stock}
        onStockUpdate={onStockUpdate}
      />
    </View>
  );
}

import { View, Text, TextInput, TouchableOpacity, FlatList } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

// Placeholder — replace with Supabase product fetch
const availableProducts = [
  { id: "1", name: "Product A", price: 50, stock: 20 },
  { id: "2", name: "Product B", price: 30, stock: 10 },
];

type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};

export default function AddSaleModal() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (product: typeof availableProducts[0]) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const onConfirm = () => {
    console.log("Sale confirmed:", cart);
    // TODO: Insert sale into Supabase, deduct stock
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-100 px-4 py-6">
      <Text className="text-xl font-bold text-gray-800 mb-4">New Sale</Text>

      {/* Product List */}
      <Text className="text-sm text-gray-500 mb-2">Tap to add product</Text>
      <FlatList
        data={availableProducts}
        keyExtractor={(item) => item.id}
        className="max-h-48"
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => addToCart(item)}
            className="bg-white rounded-xl px-4 py-3 mb-2 flex-row justify-between shadow"
          >
            <Text className="text-gray-800 font-semibold">{item.name}</Text>
            <Text className="text-green-600">₱{item.price}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Cart */}
      <Text className="text-sm text-gray-500 mt-4 mb-2">Cart</Text>
      {cart.length === 0 ? (
        <Text className="text-gray-400 text-sm">No items added yet.</Text>
      ) : (
        cart.map((item) => (
          <View key={item.id} className="flex-row justify-between mb-1">
            <Text className="text-gray-700">{item.name} x{item.qty}</Text>
            <Text className="text-gray-700">₱{item.price * item.qty}</Text>
          </View>
        ))
      )}

      {/* Total & Confirm */}
      <View className="mt-6 border-t border-gray-200 pt-4">
        <Text className="text-lg font-bold text-gray-800 mb-3">Total: ₱{total}</Text>
        <TouchableOpacity
          onPress={onConfirm}
          className="bg-green-600 rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">Confirm Sale</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

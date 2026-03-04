import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { EntryType, ExpenseCategory } from "@/types";

const ENTRY_TYPES: { label: string; value: EntryType }[] = [
  { label: "Product Sale", value: "product_sale" },
  { label: "Undeclared Sale", value: "undeclared_sale" },
  { label: "Expense", value: "expense" },
];

const EXPENSE_CATEGORIES: { label: string; value: ExpenseCategory }[] = [
  { label: "Necessities", value: "necessities" },
  { label: "Bills", value: "bills" },
  { label: "Other", value: "other" },
];

// Placeholder — replace with Supabase product fetch
const availableProducts = [
  { id: "1", name: "Shampoo", price: 50, stock: 20 },
  { id: "2", name: "Soap", price: 30, stock: 10 },
];

export default function AddSaleModal() {
  const router = useRouter();
  const [type, setType] = useState<EntryType>("product_sale");
  const [category, setCategory] = useState<ExpenseCategory>("necessities");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<typeof availableProducts[0] | null>(null);
  const [qty, setQty] = useState("1");

  const handleConfirm = () => {
    const entry = {
      name: type === "product_sale" ? `${selectedProduct?.name} x${qty}` : name,
      amount: type === "product_sale"
        ? (selectedProduct?.price ?? 0) * Number(qty)
        : Number(amount),
      type,
      category: type === "expense" ? category : undefined,
    };
    console.log("New Entry:", entry);
    // TODO: Insert into Supabase
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6">
      <Text className="text-xl font-bold text-gray-800 mb-4">Add Entry</Text>

      {/* Entry Type Selector */}
      <Text className="text-sm text-gray-500 mb-2">Type</Text>
      <View className="flex-row gap-2 mb-4">
        {ENTRY_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => setType(t.value)}
            className={`flex-1 py-2 rounded-xl items-center border ${
              type === t.value
                ? "bg-green-600 border-green-600"
                : "bg-white border-gray-200"
            }`}
          >
            <Text className={`text-xs font-semibold ${type === t.value ? "text-white" : "text-gray-600"}`}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Product Sale */}
      {type === "product_sale" && (
        <View className="gap-3">
          <Text className="text-sm text-gray-500">Select Product</Text>
          {availableProducts.map((p) => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setSelectedProduct(p)}
              className={`bg-white rounded-xl px-4 py-3 flex-row justify-between shadow border ${
                selectedProduct?.id === p.id ? "border-green-600" : "border-transparent"
              }`}
            >
              <View>
                <Text className="text-gray-800 font-semibold">{p.name}</Text>
                <Text className="text-xs text-gray-400">Stock: {p.stock}</Text>
              </View>
              <Text className="text-green-600 font-semibold">₱{p.price}</Text>
            </TouchableOpacity>
          ))}

          {selectedProduct && (
            <>
              <Text className="text-sm text-gray-500 mt-2">Quantity</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => setQty((q) => String(Math.max(1, Number(q) - 1)))}
                  className="bg-red-100 rounded-full p-3"
                >
                  <Text className="text-red-500 font-bold text-base">−</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">{qty}</Text>
                <TouchableOpacity
                  onPress={() => setQty((q) => String(Math.min(selectedProduct.stock, Number(q) + 1)))}
                  className="bg-green-100 rounded-full p-3"
                >
                  <Text className="text-green-600 font-bold text-base">+</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-sm text-green-600 font-semibold">
                Total: ₱{selectedProduct.price * Number(qty)}
              </Text>
            </>
          )}
        </View>
      )}

      {/* Undeclared Sale */}
      {type === "undeclared_sale" && (
        <View className="gap-3">
          <Text className="text-sm text-gray-500">Name</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
            placeholder="e.g. Sideline job"
            value={name}
            onChangeText={setName}
          />
          <Text className="text-sm text-gray-500">Amount (₱)</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
            placeholder="e.g. 500"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      )}

      {/* Expense */}
      {type === "expense" && (
        <View className="gap-3">
          {/* Category */}
          <Text className="text-sm text-gray-500">Category</Text>
          <View className="flex-row gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                onPress={() => setCategory(c.value)}
                className={`flex-1 py-2 rounded-xl items-center border ${
                  category === c.value
                    ? "bg-red-500 border-red-500"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text className={`text-xs font-semibold ${category === c.value ? "text-white" : "text-gray-600"}`}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-sm text-gray-500">Name</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
            placeholder="e.g. Electricity bill"
            value={name}
            onChangeText={setName}
          />
          <Text className="text-sm text-gray-500">Amount (₱)</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
            placeholder="e.g. 800"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
      )}

      <TouchableOpacity
        onPress={handleConfirm}
        className="mt-6 bg-green-600 rounded-xl py-4 items-center"
      >
        <Text className="text-white font-bold text-base">Add Entry</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

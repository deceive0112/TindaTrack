import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Product, EntryType, ExpenseCategory } from "@/types";

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

export default function AddSaleModal() {
  const router = useRouter();
  const [type, setType] = useState<EntryType>("product_sale");
  const [category, setCategory] = useState<ExpenseCategory>("necessities");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setFetchingProducts(true);
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .gt("stock", 0)
      .order("name", { ascending: true });

    if (error) console.error("Error fetching products:", error);
    else setProducts(data ?? []);
    setFetchingProducts(false);
  };

  const handleConfirm = async () => {
    setError(null);

    // Validation
    if (type === "product_sale" && !selectedProduct) {
      setError("Please select a product.");
      return;
    }
    if (type !== "product_sale" && !name.trim()) {
      setError("Please enter a name.");
      return;
    }
    if (type !== "product_sale" && !amount.trim()) {
      setError("Please enter an amount.");
      return;
    }

    setLoading(true);

    if (type === "product_sale" && selectedProduct) {
      const total = selectedProduct.price * qty;

      // Insert entry
      const { error: entryError } = await supabase.from("entries").insert({
        name: `${selectedProduct.name} x${qty}`,
        amount: total,
        type: "product_sale",
        product_id: selectedProduct.id,
        qty,
      });

      if (entryError) {
        setError("Failed to save sale. Please try again.");
        setLoading(false);
        return;
      }

      // Deduct stock
      const { error: stockError } = await supabase
        .from("products")
        .update({ stock: selectedProduct.stock - qty })
        .eq("id", selectedProduct.id);

      if (stockError) {
        setError("Sale saved but failed to update stock.");
        setLoading(false);
        return;
      }

    } else {
      // Undeclared sale or expense
      const { error: entryError } = await supabase.from("entries").insert({
        name: name.trim(),
        amount: parseFloat(amount),
        type,
        category: type === "expense" ? category : null,
      });

      if (entryError) {
        setError("Failed to save entry. Please try again.");
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.back();
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6" contentContainerStyle={{ paddingBottom: 80 }}>
      <Text className="text-xl font-bold text-gray-800 mb-4">Add Entry</Text>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <Text className="text-red-500 text-base">{error}</Text>
        </View>
      )}

      {/* Entry Type Selector */}
      <Text className="text-base text-gray-500 mb-2">Type</Text>
      <View className="flex-row gap-2 mb-4">
        {ENTRY_TYPES.map((t) => (
          <TouchableOpacity
            key={t.value}
            onPress={() => setType(t.value)}
            className={`flex-1 py-2 rounded-xl items-center border ${
              type === t.value ? "bg-green-600 border-green-600" : "bg-white border-gray-200"
            }`}
          >
            {type === t.value ? (
              <Text className="text-sm font-semibold text-white">{t.label}</Text>
            ) : (
              <Text className="text-sm font-semibold text-gray-600">{t.label}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Product Sale */}
      {type === "product_sale" && (
        <View className="gap-3">
          <Text className="text-base text-gray-500">Select Product</Text>
          {fetchingProducts ? (
            <ActivityIndicator color="#16a34a" />
          ) : products.length === 0 ? (
            <Text className="text-gray-400 text-base">No products in stock.</Text>
          ) : (
            products.map((p) => (
              <TouchableOpacity
                key={p.id}
                onPress={() => { setSelectedProduct(p); setQty(1); }}
                className={`bg-white rounded-xl px-4 py-3 flex-row justify-between shadow border ${
                  selectedProduct?.id === p.id ? "border-green-600" : "border-transparent"
                }`}
              >
                <View>
                  <Text className="text-gray-800 font-semibold">{p.name}</Text>
                  <Text className="text-sm text-gray-400">Stock: {p.stock}</Text>
                </View>
                <Text className="text-green-600 font-semibold">₱{p.price}</Text>
              </TouchableOpacity>
            ))
          )}

          {selectedProduct && (
            <>
              <Text className="text-base text-gray-500 mt-2">Quantity</Text>
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => setQty((q) => Math.max(1, q - 1))}
                  className="bg-red-100 rounded-full p-2"
                >
                  <Text className="text-red-500 font-bold text-lg px-2">−</Text>
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">{qty}</Text>
                <TouchableOpacity
                  onPress={() => setQty((q) => Math.min(selectedProduct.stock, q + 1))}
                  className="bg-green-100 rounded-full p-2"
                >
                  <Text className="text-green-600 font-bold text-lg px-2">+</Text>
                </TouchableOpacity>
              </View>
              <Text className="text-base text-green-600 font-semibold">
                Total: ₱{selectedProduct.price * qty}
              </Text>
            </>
          )}
        </View>
      )}

      {/* Undeclared Sale */}
      {type === "undeclared_sale" && (
        <View className="gap-3">
          <Text className="text-base text-gray-500">Name</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
            placeholder="e.g. Sideline job"
            value={name}
            onChangeText={setName}
          />
          <Text className="text-base text-gray-500">Amount (₱)</Text>
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
          <Text className="text-base text-gray-500">Category</Text>
          <View className="flex-row gap-2">
            {EXPENSE_CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.value}
                onPress={() => setCategory(c.value)}
                className={`flex-1 py-2 rounded-xl items-center border ${
                  category === c.value ? "bg-red-500 border-red-500" : "bg-white border-gray-200"
                }`}
              >
                {category === c.value ? (
                  <Text className="text-sm font-semibold text-white">{c.label}</Text>
                ) : (
                  <Text className="text-sm font-semibold text-gray-600">{c.label}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-base text-gray-500">Name</Text>
          <TextInput
            className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
            placeholder="e.g. Food/Rent/Minions"
            value={name}
            onChangeText={setName}
          />
          <Text className="text-base text-gray-500">Amount (₱)</Text>
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
        disabled={loading}
        className="mt-6 bg-green-600 rounded-xl py-4 items-center"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-lg">Add Entry</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

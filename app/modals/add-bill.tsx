import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function AddBillModal() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);

    if (!name.trim()) { setError("Bill name is required."); return; }
    if (!amount.trim()) { setError("Amount is required."); return; }

    setLoading(true);
    const now = new Date();

    const { error } = await supabase.from("bills").insert({
      name: name.trim(),
      amount: parseFloat(amount),
      is_paid: false,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    });

    if (error) {
      setError("Failed to save bill. Please try again.");
      console.error(error);
    } else {
      router.back();
    }

    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-100 px-4 py-6 gap-4">
      <Text className="text-xl font-bold text-gray-800">Add Monthly Bill</Text>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Text className="text-red-500 text-sm">{error}</Text>
        </View>
      )}

      <View>
        <Text className="text-sm text-gray-600 mb-1">Bill Name</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
          placeholder="e.g. Electricity"
          value={name}
          onChangeText={setName}
        />
      </View>

      <View>
        <Text className="text-sm text-gray-600 mb-1">Amount (₱)</Text>
        <TextInput
          className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
          placeholder="e.g. 800"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <TouchableOpacity
        onPress={onSubmit}
        disabled={loading}
        className="bg-green-600 rounded-xl py-4 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">Save Bill</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

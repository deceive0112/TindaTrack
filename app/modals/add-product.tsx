import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const schema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().min(1, "Price is required"),
  stock: z.string().min(1, "Initial stock is required"),
});

type FormData = z.infer<typeof schema>;

export default function AddProductModal() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("products").insert({
      name: data.name,
      price: parseFloat(data.price),
      stock: parseInt(data.stock),
    });

    if (error) {
      setError("Failed to save product. Please try again.");
      console.error(error);
    } else {
      router.back();
    }

    setLoading(false);
  };

  return (
    <View className="flex-1 bg-gray-100 px-4 py-6 gap-4">
      <Text className="text-xl font-bold text-gray-800">Add New Product</Text>

      {error && (
        <View className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <Text className="text-red-500 text-sm">{error}</Text>
        </View>
      )}

      {/* Name */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Product Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
              placeholder="e.g. Shampoo"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.name?.message && (
          <Text className="text-red-500 text-xs mt-1">{errors.name.message}</Text>
        )}
      </View>

      {/* Price */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Price (₱)</Text>
        <Controller
          control={control}
          name="price"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
              placeholder="e.g. 50"
              keyboardType="numeric"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.price?.message && (
          <Text className="text-red-500 text-xs mt-1">{errors.price.message}</Text>
        )}
      </View>

      {/* Stock */}
      <View>
        <Text className="text-sm text-gray-600 mb-1">Initial Stock</Text>
        <Controller
          control={control}
          name="stock"
          render={({ field: { onChange, value } }) => (
            <TextInput
              className="bg-white rounded-xl px-4 py-3 text-gray-800 shadow"
              placeholder="e.g. 100"
              keyboardType="numeric"
              onChangeText={onChange}
              value={value}
            />
          )}
        />
        {errors.stock?.message && (
          <Text className="text-red-500 text-xs mt-1">{errors.stock.message}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        disabled={loading}
        className="bg-green-600 rounded-xl py-4 items-center mt-2"
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-bold text-base">Save Product</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

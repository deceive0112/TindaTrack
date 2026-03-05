import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Entry } from "@/types";
import SaleItem from "@/components/sales/SaleItem";
import { format } from "date-fns";

const SECTION_CONFIG = [
  { title: "Product Sales", filter: (e: Entry) => e.type === "product_sale", sign: 1 },
  { title: "Undeclared Sales", filter: (e: Entry) => e.type === "undeclared_sale", sign: 1 },
  { title: "Necessities", filter: (e: Entry) => e.type === "expense" && e.category === "necessities", sign: -1 },
  { title: "Bills", filter: (e: Entry) => e.type === "expense" && e.category === "bills", sign: -1 },
  { title: "Other Expenses", filter: (e: Entry) => e.type === "expense" && e.category === "other", sign: -1 },
];

export default function SalesScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEntries = async () => {
    setLoading(true);

    // Get today's date range
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching entries:", error);
    else setEntries(data ?? []);
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchEntries();
    }, [])
  );

  const handleDelete = async (entry: Entry) => {
    // If product sale, restore stock first
    if (entry.type === "product_sale" && entry.product_id && entry.qty) {
      const { data: product } = await supabase
        .from("products")
        .select("stock")
        .eq("id", entry.product_id)
        .single();

      if (product) {
        await supabase
          .from("products")
          .update({ stock: product.stock + entry.qty })
          .eq("id", entry.product_id);
      }
    }

    const { error } = await supabase
      .from("entries")
      .delete()
      .eq("id", entry.id);

    if (error) console.error("Error deleting entry:", error);
    else fetchEntries();
  };

  const sections = SECTION_CONFIG
    .map(({ title, filter, sign }) => ({
      title,
      sign,
      data: entries.filter(filter),
    }))
    .filter((s) => s.data.length > 0);

  const totalIncome = entries
    .filter((e) => e.type !== "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netTotal = totalIncome - totalExpense;

  return (
    <View className="flex-1 bg-gray-100">
      {/* Date Header */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-base font-bold text-gray-800">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </Text>
        <Text className="text-xs text-gray-400">Today's entries only</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#16a34a" className="mt-10" />
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-4 py-4 gap-2"
          renderSectionHeader={({ section }) => (
            section.sign === 1 ? (
              <Text className="text-xs font-bold uppercase tracking-widest mt-4 mb-1 text-green-600">
                {section.title}
              </Text>
            ) : (
              <Text className="text-xs font-bold uppercase tracking-widest mt-4 mb-1 text-red-500">
                {section.title}
              </Text>
            )
          )}
          renderItem={({ item, section }) => (
            <SaleItem
              entry={item}
              sign={section.sign}
              onDelete={() => handleDelete(item)}
            />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 mt-10">
              No entries yet. Tap + to add one!
            </Text>
          }
          ListFooterComponent={
            entries.length > 0 ? (
              <View className="mt-6 p-4 bg-white rounded-2xl shadow">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-500">Total Income</Text>
                  <Text className="text-sm text-green-600 font-semibold">₱{totalIncome}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-sm text-gray-500">Total Expenses</Text>
                  <Text className="text-sm text-red-500 font-semibold">-₱{totalExpense}</Text>
                </View>
                <View className="flex-row justify-between border-t border-gray-100 pt-3">
                  <Text className="text-base font-bold text-gray-800">Net Total</Text>
                  {netTotal >= 0 ? (
                    <Text className="text-base font-bold text-green-600">₱{netTotal}</Text>
                  ) : (
                    <Text className="text-base font-bold text-red-500">-₱{Math.abs(netTotal)}</Text>
                  )}
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/modals/receipt")}
                  className="mt-4 bg-green-600 rounded-xl py-3 items-center"
                >
                  <Text className="text-white font-semibold">View Receipt</Text>
                </TouchableOpacity>
              </View>
            ) : null
          }
        />
      )}

      <TouchableOpacity
        onPress={() => router.push("/modals/add-sale")}
        className="absolute bottom-6 right-6 bg-green-600 rounded-full p-4 shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { supabase } from "@/lib/supabase";
import { Entry } from "@/types";
import SaleItem from "@/components/sales/SaleItem";
import { format, subDays, addDays, isSameDay, startOfYear } from "date-fns";

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
  const [selectedDate, setSelectedDate] = useState(new Date());

  const today = new Date();
  const isToday = isSameDay(selectedDate, today);
  const isPast = selectedDate < today && !isToday;
  const yearStart = startOfYear(today);

  const fetchEntries = async (date: Date) => {
    setLoading(true);

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
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
      fetchEntries(selectedDate);
    }, [selectedDate])
  );

  const handleDelete = async (entry: Entry) => {
    if (isPast) return;

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
    else fetchEntries(selectedDate);
  };

  const goToPrevDay = () => {
    const prev = subDays(selectedDate, 1);
    if (prev >= yearStart) setSelectedDate(prev);
  };

  const goToNextDay = () => {
    const next = addDays(selectedDate, 1);
    if (next <= today) setSelectedDate(next);
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

  const AddButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/modals/add-sale")}
      className="mt-3 bg-green-600 rounded-2xl py-4 flex-row items-center justify-center gap-2"
    >
      <Plus size={20} color="white" />
      <Text className="text-white font-bold text-lg">Add Entry</Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">

      {/* Date Selector */}
      <View className="flex-row items-center justify-between bg-white px-4 py-3 shadow">
        <TouchableOpacity onPress={goToPrevDay} className="p-2">
          <Text className={`font-bold text-xl ${selectedDate <= yearStart ? "text-gray-300" : "text-green-600"}`}>
            ‹
          </Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-bold text-gray-800">
            {format(selectedDate, "MMMM d, yyyy")}
          </Text>
          {isToday && <Text className="text-sm text-green-500">Today</Text>}
          {isPast && <Text className="text-sm text-gray-400">Archive — Read Only</Text>}
        </View>

        <TouchableOpacity onPress={goToNextDay} className="p-2">
          <Text className={`font-bold text-xl ${isToday ? "text-gray-300" : "text-green-600"}`}>
            ›
          </Text>
        </TouchableOpacity>
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
              <Text className="text-base font-bold uppercase tracking-widest mt-4 mb-1 text-green-600">
                {section.title}
              </Text>
            ) : (
              <Text className="text-base font-bold uppercase tracking-widest mt-4 mb-1 text-red-500">
                {section.title}
              </Text>
            )
          )}
          renderItem={({ item, section }) => (
            <SaleItem
              entry={item}
              sign={section.sign}
              onDelete={() => handleDelete(item)}
              readOnly={isPast}
            />
          )}
          ListEmptyComponent={
            <View className="gap-3">
              <Text className="text-center text-gray-400 mt-10">
                {isPast ? "No entries for this day." : "No entries yet. Add your first one!"}
              </Text>
              {isToday && <AddButton />}
            </View>
          }
          ListFooterComponent={
            entries.length > 0 ? (
              <View>
                {isToday && <AddButton />}
                <View className="mt-3 p-4 bg-white rounded-2xl shadow">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-base text-gray-500">Total Income</Text>
                    <Text className="text-base text-green-600 font-semibold">₱{totalIncome}</Text>
                  </View>
                  <View className="flex-row justify-between mb-3">
                    <Text className="text-base text-gray-500">Total Expenses</Text>
                    <Text className="text-base text-red-500 font-semibold">-₱{totalExpense}</Text>
                  </View>
                  <View className="flex-row justify-between border-t border-gray-100 pt-3">
                    <Text className="text-xl font-bold text-gray-800">Net Total</Text>
                    {netTotal >= 0 ? (
                      <Text className="text-lg font-bold text-green-600">₱{netTotal}</Text>
                    ) : (
                      <Text className="text-lg font-bold text-red-500">-₱{Math.abs(netTotal)}</Text>
                    )}
                  </View>
                  <TouchableOpacity
                      onPress={() => router.push(`/modals/receipt?date=${selectedDate.toISOString()}`)}
                      className="mt-4 bg-green-600 rounded-xl py-3 items-center"
                    >
                      <Text className="text-white font-semibold text-lg">View Receipt</Text>
                    </TouchableOpacity>
                </View>
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}

import { View, Text, SectionList, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import SaleItem from "@/components/sales/SaleItem";
import { Entry } from "@/types";

// Placeholder — replace with Supabase query
const mockEntries: Entry[] = [
  { id: "1", name: "Shampoo x2", amount: 100, type: "product_sale", created_at: new Date().toISOString() },
  { id: "2", name: "Sideline job", amount: 500, type: "undeclared_sale", created_at: new Date().toISOString() },
  { id: "3", name: "Rice, ulam", amount: 150, type: "expense", category: "necessities", created_at: new Date().toISOString() },
  { id: "4", name: "Electricity", amount: 800, type: "expense", category: "bills", created_at: new Date().toISOString() },
  { id: "5", name: "Rent", amount: 3000, type: "expense", category: "bills", created_at: new Date().toISOString() },
  { id: "6", name: "Random expense", amount: 200, type: "expense", category: "other", created_at: new Date().toISOString() },
];

const SECTION_CONFIG = [
  { title: "Product Sales", filter: (e: Entry) => e.type === "product_sale", sign: 1 },
  { title: "Undeclared Sales", filter: (e: Entry) => e.type === "undeclared_sale", sign: 1 },
  { title: "Necessities", filter: (e: Entry) => e.type === "expense" && e.category === "necessities", sign: -1 },
  { title: "Bills", filter: (e: Entry) => e.type === "expense" && e.category === "bills", sign: -1 },
  { title: "Other Expenses", filter: (e: Entry) => e.type === "expense" && e.category === "other", sign: -1 },
];

export default function SalesScreen() {
  const router = useRouter();

  const sections = SECTION_CONFIG
    .map(({ title, filter, sign }) => ({
      title,
      sign,
      data: mockEntries.filter(filter),
    }))
    .filter((s) => s.data.length > 0);

  const totalIncome = mockEntries
    .filter((e) => e.type !== "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = mockEntries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netTotal = totalIncome - totalExpense;

  return (
    <View className="flex-1 bg-gray-100">
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
          <SaleItem entry={item} sign={section.sign} />
        )}
        ListFooterComponent={
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
              <Text className={`text-base font-bold ${netTotal >= 0 ? "text-green-600" : "text-red-500"}`}>
                ₱{netTotal}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => router.push("/modals/receipt")}
              className="mt-4 bg-green-600 rounded-xl py-3 items-center"
            >
              <Text className="text-white font-semibold">View Receipt</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={() => router.push("/modals/add-sale")}
        className="absolute bottom-6 right-6 bg-green-600 rounded-full p-4 shadow-lg"
      >
        <Plus size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

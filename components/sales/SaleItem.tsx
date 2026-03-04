import { View, Text, TouchableOpacity } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import { Entry } from "@/types";

type Props = {
  entry: Entry;
  sign: number;
};

export default function SaleItem({ entry, sign }: Props) {
  const isIncome = sign === 1;

  return (
    <View className="bg-white rounded-2xl px-4 py-3 shadow flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-800">{entry.name}</Text>
      </View>

      <View className="flex-row items-center gap-3">
        {isIncome ? (
          <Text className="text-base font-bold text-green-600">
            ₱{entry.amount}
          </Text>
        ) : (
          <Text className="text-base font-bold text-red-500">
            -₱{entry.amount}
          </Text>
        )}

        {/* Edit + Delete only for non-product entries */}
        {entry.type !== "product_sale" && (
          <>
            <TouchableOpacity onPress={() => console.log("edit", entry.id)}>
              <Pencil size={16} color="#6b7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => console.log("delete", entry.id)}>
              <Trash2 size={16} color="#dc2626" />
            </TouchableOpacity>
          </>
        )}

        {/* Delete only for product sales */}
        {entry.type === "product_sale" && (
          <TouchableOpacity onPress={() => console.log("delete", entry.id)}>
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

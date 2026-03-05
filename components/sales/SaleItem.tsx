import { View, Text, TouchableOpacity, Alert } from "react-native";
import { Pencil, Trash2 } from "lucide-react-native";
import { Entry } from "@/types";

type Props = {
  entry: Entry;
  sign: number;
  onDelete: () => void;
  readOnly?: boolean;
};

export default function SaleItem({ entry, sign, onDelete, readOnly = false }: Props) {
  const isIncome = sign === 1;

  const confirmDelete = () => {
    Alert.alert(
      "Delete Entry",
      `Are you sure you want to delete "${entry.name}"?${
        entry.type === "product_sale" ? "\n\nStock will be restored." : ""
      }`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onDelete },
      ]
    );
  };

  return (
    <View className="bg-white rounded-2xl px-4 py-3 shadow flex-row justify-between items-center">
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800">{entry.name}</Text>
      </View>

      <View className="flex-row items-center gap-3">
        {isIncome ? (
          <Text className="text-lg font-bold text-green-600">₱{entry.amount}</Text>
        ) : (
          <Text className="text-lg font-bold text-red-500">-₱{entry.amount}</Text>
        )}

        {!readOnly && entry.type !== "product_sale" && (
          <TouchableOpacity onPress={() => console.log("edit", entry.id)}>
            <Pencil size={16} color="#6b7280" />
          </TouchableOpacity>
        )}

        {!readOnly && (
          <TouchableOpacity onPress={confirmDelete}>
            <Trash2 size={16} color="#dc2626" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

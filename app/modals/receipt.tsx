import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { format } from "date-fns";

// Placeholder — replace with actual sale data passed via route params or state
const receiptData = {
  items: [
    { name: "Product A", qty: 2, price: 50 },
    { name: "Product B", qty: 1, price: 30 },
  ],
  date: new Date(),
};

export default function ReceiptModal() {
  const total = receiptData.items.reduce((sum, i) => sum + i.qty * i.price, 0);

  const handlePrint = async () => {
    const html = `
      <h2>TindaTrack Receipt</h2>
      <p>Date: ${format(receiptData.date, "PPP")}</p>
      <hr/>
      ${receiptData.items.map(i => `<p>${i.name} x${i.qty} — ₱${i.qty * i.price}</p>`).join("")}
      <hr/>
      <h3>Total: ₱${total}</h3>
    `;
    await Print.printAsync({ html });
  };

  const handleShare = async () => {
    const html = `
      <h2>TindaTrack Receipt</h2>
      <p>Date: ${format(receiptData.date, "PPP")}</p>
      <hr/>
      ${receiptData.items.map(i => `<p>${i.name} x${i.qty} — ₱${i.qty * i.price}</p>`).join("")}
      <hr/>
      <h3>Total: ₱${total}</h3>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6">
      <Text className="text-2xl font-bold text-gray-800 text-center mb-1">TindaTrack</Text>
      <Text className="text-sm text-gray-400 text-center mb-6">
        {format(receiptData.date, "PPP p")}
      </Text>

      {/* Items */}
      <View className="bg-white rounded-2xl p-4 shadow mb-4">
        {receiptData.items.map((item, i) => (
          <View key={i} className="flex-row justify-between py-2 border-b border-gray-100">
            <Text className="text-gray-700">{item.name} x{item.qty}</Text>
            <Text className="text-gray-800 font-semibold">₱{item.qty * item.price}</Text>
          </View>
        ))}
        <View className="flex-row justify-between pt-3">
          <Text className="text-base font-bold text-gray-800">Total</Text>
          <Text className="text-base font-bold text-green-600">₱{total}</Text>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity
        onPress={handlePrint}
        className="bg-green-600 rounded-xl py-4 items-center mb-3"
      >
        <Text className="text-white font-bold text-base">Print Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleShare}
        className="bg-white border border-green-600 rounded-xl py-4 items-center"
      >
        <Text className="text-green-600 font-bold text-base">Download / Share</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

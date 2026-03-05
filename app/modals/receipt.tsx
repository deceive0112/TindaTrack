import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Entry } from "@/types";

const SECTION_CONFIG = [
  { title: "Product Sales", filter: (e: Entry) => e.type === "product_sale" },
  { title: "Undeclared Sales", filter: (e: Entry) => e.type === "undeclared_sale" },
  { title: "Necessities", filter: (e: Entry) => e.type === "expense" && e.category === "necessities" },
  { title: "Bills", filter: (e: Entry) => e.type === "expense" && e.category === "bills" },
  { title: "Other Expenses", filter: (e: Entry) => e.type === "expense" && e.category === "other" },
];

export default function ReceiptModal() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const today = new Date();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString())
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching entries:", error);
    else setEntries(data ?? []);
    setLoading(false);
  };

  const totalIncome = entries
    .filter((e) => e.type !== "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const totalExpense = entries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const netTotal = totalIncome - totalExpense;

  const generateHTML = () => {
    const sectionsHTML = SECTION_CONFIG.map(({ title, filter }) => {
      const items = entries.filter(filter);
      if (items.length === 0) return "";

      const isExpense = items[0].type === "expense";
      return `
        <p class="section-title">${title}</p>
        ${items.map((e) => `
          <div class="row">
            <span class="item-name">${e.name}</span>
            <span class="${isExpense ? "red" : ""}">${isExpense ? "-" : ""}P${e.amount.toFixed(2)}</span>
          </div>
        `).join("")}
        <div class="line-dashed"></div>
      `;
    }).join("");

    return `
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Courier New', Courier, monospace;
              font-size: 11px;
              width: 280px;
              margin: 0 auto;
              padding: 16px 12px;
              color: #000;
            }
            h1 {
              text-align: center;
              font-size: 16px;
              font-weight: bold;
              letter-spacing: 3px;
              margin-bottom: 2px;
            }
            .subtitle {
              text-align: center;
              font-size: 10px;
              margin-bottom: 2px;
            }
            .date {
              text-align: center;
              font-size: 10px;
              margin-bottom: 8px;
            }
            .line { border-top: 1px solid #000; margin: 6px 0; }
            .line-dashed { border-top: 1px dashed #000; margin: 6px 0; }
            .section-title {
              font-size: 10px;
              font-weight: bold;
              text-transform: uppercase;
              margin: 6px 0 3px 0;
            }
            .row {
              display: flex;
              justify-content: space-between;
              padding: 1px 0;
              font-size: 11px;
            }
            .item-name {
              flex: 1;
              padding-right: 8px;
              word-break: break-word;
            }
            .red { color: #000; }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 2px 0;
              font-size: 11px;
            }
            .net-row {
              display: flex;
              justify-content: space-between;
              padding: 3px 0;
              font-size: 13px;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 12px;
              letter-spacing: 1px;
            }
            .thank-you {
              text-align: center;
              font-size: 11px;
              font-weight: bold;
              margin-top: 6px;
              letter-spacing: 2px;
            }
          </style>
        </head>
        <body>
          <h1>TINDATRACK</h1>
          <p class="subtitle">Daily Sales Record</p>
          <p class="date">${format(today, "MM/dd/yyyy hh:mm a")}</p>
          <div class="line"></div>
          ${sectionsHTML}
          <div class="summary-row">
            <span>TOTAL INCOME</span>
            <span>P${totalIncome.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>TOTAL EXPENSES</span>
            <span>-P${totalExpense.toFixed(2)}</span>
          </div>
          <div class="line"></div>
          <div class="net-row">
            <span>NET TOTAL</span>
            <span>${netTotal < 0 ? "-" : ""}P${Math.abs(netTotal).toFixed(2)}</span>
          </div>
          <div class="line"></div>
          <p class="thank-you">*** END OF REPORT ***</p>
          <p class="footer">POWERED BY TINDATRACK</p>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    await Print.printAsync({ html: generateHTML() });
  };

  const handleShare = async () => {
    const { uri } = await Print.printToFileAsync({ html: generateHTML() });
    await Sharing.shareAsync(uri);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100">
        <ActivityIndicator size="large" color="#16a34a" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-100 px-4 py-6 mb-20">
      {/* Header */}
      <Text className="text-2xl font-bold text-green-600 text-center mb-1">TindaTrack</Text>
      <Text className="text-xs text-gray-400 text-center mb-6">
        {format(today, "EEEE, MMMM d, yyyy • h:mm a")}
      </Text>

      {entries.length === 0 ? (
        <View className="bg-white rounded-2xl p-6 shadow items-center">
          <Text className="text-gray-400 text-sm">No entries for today.</Text>
        </View>
      ) : (
        <>
          {/* Sections */}
          {SECTION_CONFIG.map(({ title, filter }) => {
            const items = entries.filter(filter);
            if (items.length === 0) return null;
            const isExpense = items[0].type === "expense";

            return (
              <View key={title} className="bg-white rounded-2xl p-4 shadow mb-3">
                <Text className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">
                  {title}
                </Text>
                {items.map((entry) => (
                  <View key={entry.id} className="flex-row justify-between py-2 border-b border-gray-50">
                    <Text className="text-sm text-gray-700 flex-1">{entry.name}</Text>
                    {isExpense ? (
                      <Text className="text-sm font-semibold text-red-500">-₱{entry.amount}</Text>
                    ) : (
                      <Text className="text-sm font-semibold text-green-600">₱{entry.amount}</Text>
                    )}
                  </View>
                ))}
              </View>
            );
          })}

          {/* Summary */}
          <View className="bg-white rounded-2xl p-4 shadow mb-4">
            <View className="flex-row justify-between mb-1">
              <Text className="text-sm text-gray-500">Total Income</Text>
              <Text className="text-sm font-semibold text-green-600">₱{totalIncome}</Text>
            </View>
            <View className="flex-row justify-between mb-3">
              <Text className="text-sm text-gray-500">Total Expenses</Text>
              <Text className="text-sm font-semibold text-red-500">-₱{totalExpense}</Text>
            </View>
            <View className="flex-row justify-between border-t border-gray-100 pt-3">
              <Text className="text-base font-bold text-gray-800">Net Total</Text>
              {netTotal >= 0 ? (
                <Text className="text-base font-bold text-green-600">₱{netTotal}</Text>
              ) : (
                <Text className="text-base font-bold text-red-500">-₱{Math.abs(netTotal)}</Text>
              )}
            </View>
          </View>
        </>
      )}

      {/* Actions */}
      <TouchableOpacity
        onPress={handlePrint}
        className="bg-green-600 rounded-xl py-4 items-center mb-3"
      >
        <Text className="text-white font-bold text-base">Print Receipt</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleShare}
        className="bg-white border border-green-600 rounded-xl py-4 items-center mb-6"
      >
        <Text className="text-green-600 font-bold text-base">Download / Share</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

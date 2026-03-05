import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, format } from "date-fns";

const BAR_WIDTH = 32;
const MAX_HEIGHT = 120;

type ChartData = {
  day: string;
  fullDate: string;
  income: number;
  isFuture: boolean;
};

export default function SalesChart() {
  const router = useRouter();
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);

      // Last 7 days clamped to current month
      const pastDays = Array.from({ length: 7 }, (_, i) => subDays(now, 6 - i))
        .filter((d) => d >= monthStart);

      // Fill remaining slots with future days
      const allDays = [...pastDays];
      let next = new Date(now);
      while (allDays.length < 7) {
        next = new Date(next);
        next.setDate(next.getDate() + 1);
        if (next <= monthEnd) allDays.push(new Date(next));
        else break;
      }

      const results = await Promise.all(
        allDays.map(async (day) => {
          const isFuture = day > now;

          if (isFuture) {
            return {
              day: format(day, "EEE"),
              fullDate: format(day, "MMM d"),
              income: 0,
              isFuture: true,
            };
          }

          const { data } = await supabase
            .from("entries")
            .select("amount, type")
            .gte("created_at", startOfDay(day).toISOString())
            .lte("created_at", endOfDay(day).toISOString());

          const income = (data ?? [])
            .filter((e) => e.type !== "expense")
            .reduce((sum, e) => sum + e.amount, 0);

          return {
            day: format(day, "EEE"),
            fullDate: format(day, "MMM d"),
            income,
            isFuture: false,
          };
        })
      );

      setData(results);
      setLoading(false);
    };
    load();
  }, []);

  const maxIncome = Math.max(...data.map((d) => d.income), 1);

  return (
    <View className="bg-white rounded-2xl p-4 shadow">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-bold text-gray-800">Daily Sales (7 Days)</Text>
        <TouchableOpacity onPress={() => router.push("/(tabs)/reports")}>
          <Text className="text-green-600 text-sm font-semibold">View More</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="h-40 items-center justify-center">
          <ActivityIndicator color="#16a34a" />
        </View>
      ) : (
        <View className="flex-row items-end justify-around" style={{ height: MAX_HEIGHT + 60 }}>
          {data.map((item, i) => {
            const barHeight = item.isFuture
              ? 4
              : Math.max((item.income / maxIncome) * MAX_HEIGHT, 4);

            return (
              <View key={i} className="items-center" style={{ width: BAR_WIDTH }}>
                {/* Income label on top */}
                <Text style={{ fontSize: 8 }} className="text-gray-500 mb-1" numberOfLines={1}>
                  {!item.isFuture && item.income > 0 ? `₱${item.income}` : ""}
                </Text>

                {/* Bar */}
                <View
                  style={{ height: barHeight, width: BAR_WIDTH - 6, borderRadius: 4 }}
                  className={item.isFuture ? "bg-gray-200" : "bg-green-500"}
                />

                {/* Date label at bottom */}
                <Text
                  style={{ fontSize: 8 }}
                  className={`mt-1 text-center ${item.isFuture ? "text-gray-300" : "text-gray-400"}`}
                >
                  {item.day}
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

type Stat = {
  label: string;
  income: number;
  expense: number;
  net: number;
};

const fetchNet = async (from: Date, to: Date) => {
  const { data } = await supabase
    .from("entries")
    .select("amount, type")
    .gte("created_at", from.toISOString())
    .lte("created_at", to.toISOString());

  const income = (data ?? [])
    .filter((e) => e.type !== "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const expense = (data ?? [])
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  return { income, expense, net: income - expense };
};

export default function QuickStats() {
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const now = new Date();
      const [today, week, month] = await Promise.all([
        fetchNet(startOfDay(now), endOfDay(now)),
        fetchNet(startOfWeek(now), endOfWeek(now)),
        fetchNet(startOfMonth(now), endOfMonth(now)),
      ]);

      setStats([
        { label: "Today", ...today },
        { label: "This Week", ...week },
        { label: "This Month", ...month },
      ]);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <ActivityIndicator color="#16a34a" />;

  return (
    <View className="gap-2">
      {stats.map((stat) => (
        <View key={stat.label} className="bg-white rounded-2xl p-4 shadow">
          <Text className="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">
            {stat.label}
          </Text>
          <View className="flex-row justify-between">
            <View>
              <Text className="text-xs text-gray-400">Income</Text>
              <Text className="text-sm font-bold text-green-600">₱{stat.income}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400">Expenses</Text>
              <Text className="text-sm font-bold text-red-500">-₱{stat.expense}</Text>
            </View>
            <View>
              <Text className="text-xs text-gray-400">Net</Text>
              {stat.net >= 0 ? (
                <Text className="text-sm font-bold text-green-600">₱{stat.net}</Text>
              ) : (
                <Text className="text-sm font-bold text-red-500">-₱{Math.abs(stat.net)}</Text>
              )}
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

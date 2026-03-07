import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useCallback } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths, addMonths, isSameMonth, startOfWeek, endOfWeek, addWeeks, isBefore } from "date-fns";

type PeriodData = {
  label: string;
  fullDate: string;
  income: number;
  expense: number;
  net: number;
  isFuture: boolean;
};

type Bill = {
  id: string;
  name: string;
  amount: number;
  is_paid: boolean;
  month: number;
  year: number;
};

const BAR_WIDTH = 28;
const MAX_HEIGHT = 100;
const FILTERS = ["Weekly", "Monthly"] as const;
type Filter = typeof FILTERS[number];

export default function ReportsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("Weekly");
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [chartData, setChartData] = useState<PeriodData[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [monthlyNet, setMonthlyNet] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isCurrentMonth = isSameMonth(selectedMonth, new Date());
  const isPastMonth = selectedMonth < startOfMonth(new Date());

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchChartData(), fetchBills(), fetchMonthlyNet()]);
    setLoading(false);
  };

  const fetchChartData = async () => {
    const now = new Date();
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const today = isCurrentMonth ? now : monthEnd;

    if (filter === "Weekly") {
      const pastDays = Array.from({ length: 7 }, (_, i) => subDays(today, 6 - i));

      const results = await Promise.all(
        pastDays.map(async (day) => {
          const isFuture = isCurrentMonth && day > now;
          if (isFuture) {
            return { label: format(day, "EEE"), fullDate: format(day, "MMM d"), income: 0, expense: 0, net: 0, isFuture: true };
          }

          const { data } = await supabase
            .from("entries")
            .select("amount, type")
            .gte("created_at", startOfDay(day).toISOString())
            .lte("created_at", endOfDay(day).toISOString());

          const income = (data ?? []).filter((e) => e.type !== "expense").reduce((sum, e) => sum + e.amount, 0);
          const expense = (data ?? []).filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
          return { label: format(day, "EEE"), fullDate: format(day, "MMM d"), income, expense, net: income - expense, isFuture: false };
        })
      );
      setChartData(results);

    } else {
      // Build actual Mon-Sun calendar weeks that overlap with the month
      const weeks: { weekStart: Date; weekEnd: Date }[] = [];
      // Start from first Monday of the month (skip Sunday if month starts on Sunday)
      let current = startOfWeek(monthStart, { weekStartsOn: 1 });
      if (isBefore(current, monthStart)) current = addWeeks(current, 1);

      while (isBefore(current, monthEnd)) {
        const weekStart = current;
        const weekEnd = endOfWeek(current, { weekStartsOn: 1 });

        // Clamp to month boundaries
        const clampedStart = weekStart;
        const clampedEnd = isBefore(weekEnd, monthEnd) ? weekEnd : monthEnd;

        weeks.push({ weekStart: clampedStart, weekEnd: clampedEnd });
        current = addWeeks(current, 1);
      }

      const results = await Promise.all(
        weeks.map(async ({ weekStart, weekEnd }, i) => {
          const isFuture = isCurrentMonth && weekStart > now;

          if (isFuture) {
            return {
              label: `Week ${i + 1}`,
              fullDate: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
              income: 0, expense: 0, net: 0, isFuture: true,
            };
          }

          const { data } = await supabase
            .from("entries")
            .select("amount, type")
            .gte("created_at", startOfDay(weekStart).toISOString())
            .lte("created_at", endOfDay(weekEnd).toISOString());

          const income = (data ?? []).filter((e) => e.type !== "expense").reduce((sum, e) => sum + e.amount, 0);
          const expense = (data ?? []).filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
          return {
            label: `Week ${i + 1}`,
            fullDate: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d")}`,
            income, expense, net: income - expense, isFuture: false,
          };
        })
      );
      setChartData(results);
    }
  };

  const fetchMonthlyNet = async () => {
    const { data } = await supabase
      .from("entries")
      .select("amount, type")
      .gte("created_at", startOfMonth(selectedMonth).toISOString())
      .lte("created_at", endOfMonth(selectedMonth).toISOString());

    const income = (data ?? []).filter((e) => e.type !== "expense").reduce((sum, e) => sum + e.amount, 0);
    const expense = (data ?? []).filter((e) => e.type === "expense").reduce((sum, e) => sum + e.amount, 0);
    setMonthlyNet(income - expense);
  };

  const fetchBills = async () => {
    const { data, error } = await supabase
      .from("bills")
      .select("*")
      .eq("month", selectedMonth.getMonth() + 1)
      .eq("year", selectedMonth.getFullYear())
      .order("created_at", { ascending: true });

    if (error) console.error("Error fetching bills:", error);
    else setBills(data ?? []);
  };

  const togglePaid = async (bill: Bill) => {
    if (isPastMonth) return;
    const { error } = await supabase
      .from("bills")
      .update({ is_paid: !bill.is_paid })
      .eq("id", bill.id);
    if (!error) fetchBills();
  };

  const deleteBill = async (id: string) => {
    if (isPastMonth) return;
    const { error } = await supabase.from("bills").delete().eq("id", id);
    if (!error) fetchBills();
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [selectedMonth, filter])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const maxIncome = Math.max(...chartData.map((d) => d.income), 1);
  const totalBills = bills.reduce((sum, b) => sum + b.amount, 0);
  const totalPaid = bills.filter((b) => b.is_paid).reduce((sum, b) => sum + b.amount, 0);
  const remaining = monthlyNet - totalPaid;

  return (
    <ScrollView
      className="flex-1 bg-gray-100 px-4 py-4"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#16a34a"]} />}
    >

      {/* Month Selector */}
      <View className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-3 shadow mb-4">
        <TouchableOpacity
          onPress={() => setSelectedMonth((m) => subMonths(m, 1))}
          className="p-2"
        >
          <Text className="text-green-600 font-bold text-xl">‹</Text>
        </TouchableOpacity>

        <View className="items-center">
          <Text className="text-lg font-bold text-gray-800">
            {format(selectedMonth, "MMMM yyyy")}
          </Text>
          {isPastMonth && (
            <Text className="text-sm text-gray-400">Archive — Read Only</Text>
          )}
          {isCurrentMonth && (
            <Text className="text-sm text-green-500">Current Month</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={() => {
            const next = addMonths(selectedMonth, 1);
            if (next <= new Date()) setSelectedMonth(next);
          }}
          className="p-2"
        >
          <Text className={`font-bold text-xl ${isSameMonth(selectedMonth, new Date()) ? "text-gray-300" : "text-green-600"}`}>
            ›
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filter Toggle */}
      <View className="flex-row gap-2 mb-4">
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`flex-1 py-2 rounded-xl items-center border ${filter === f ? "bg-green-600 border-green-600" : "bg-white border-gray-200"}`}
          >
            {filter === f ? (
              <Text className="text-white font-semibold text-base">{f}</Text>
            ) : (
              <Text className="text-gray-600 text-base">{f}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#16a34a" className="mt-10" />
      ) : (
        <>
          {/* Chart */}
          <View className="bg-white rounded-2xl p-4 shadow mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">
              {filter} Income — {format(selectedMonth, "MMMM yyyy")}
            </Text>
            <View className="flex-row items-end justify-around" style={{ height: MAX_HEIGHT + 50 }}>
              {chartData.map((item, i) => {
                const barHeight = Math.max((item.income / maxIncome) * MAX_HEIGHT, 4);
                return (
                  <View key={i} className="items-center" style={{ width: BAR_WIDTH }}>
                    <Text style={{ fontSize: 7 }} className="text-gray-500 mb-1" numberOfLines={1}>
                      {item.income > 0 ? `₱${item.income}` : ""}
                    </Text>
                    <View
                      style={{ height: item.isFuture ? 4 : barHeight, width: BAR_WIDTH - 6, borderRadius: 4 }}
                      className={item.isFuture ? "bg-gray-200" : "bg-green-500"}
                    />
                    <Text style={{ fontSize: 7 }} className={`mt-1 text-center ${item.isFuture ? "text-gray-300" : "text-gray-400"}`}>
                      {item.label}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Summary */}
          <View className="bg-white rounded-2xl p-4 shadow mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-3">
              {filter} Summary
            </Text>
            {filter === "Weekly" ? (
              chartData.map((item, i) => (
                <View key={i} className="flex-row justify-between py-2 border-b border-gray-50">
                  <Text className={`text-base ${item.isFuture ? "text-gray-300" : "text-gray-600"}`}>
                    {item.fullDate}
                  </Text>
                  {item.isFuture ? (
                    <Text className="text-base text-gray-300">—</Text>
                  ) : item.net >= 0 ? (
                    <Text className="text-base font-semibold text-green-600">₱{item.net}</Text>
                  ) : (
                    <Text className="text-base font-semibold text-red-500">-₱{Math.abs(item.net)}</Text>
                  )}
                </View>
              ))
            ) : (
              chartData.map((item, i) => (
                <View key={i} className="flex-row justify-between py-2 border-b border-gray-50">
                  <View>
                    <Text className={`text-base ${item.isFuture ? "text-gray-300" : "text-gray-600"}`}>
                      {item.label}
                    </Text>
                    <Text className="text-sm text-gray-300">{item.fullDate}</Text>
                  </View>
                  {item.isFuture ? (
                    <Text className="text-base text-gray-300">—</Text>
                  ) : item.net >= 0 ? (
                    <Text className="text-base font-semibold text-green-600">₱{item.net}</Text>
                  ) : (
                    <Text className="text-base font-semibold text-red-500">-₱{Math.abs(item.net)}</Text>
                  )}
                </View>
              ))
            )}
            <View className="flex-row justify-between pt-3">
              <Text className="text-lg font-bold text-gray-800">
                {filter} Net Total
              </Text>
              {chartData.reduce((sum, d) => sum + d.net, 0) >= 0 ? (
                <Text className="text-lg font-bold text-green-600">
                  ₱{chartData.reduce((sum, d) => sum + d.net, 0)}
                </Text>
              ) : (
                <Text className="text-lg font-bold text-red-500">
                  -₱{Math.abs(chartData.reduce((sum, d) => sum + d.net, 0))}
                </Text>
              )}
            </View>
          </View>

          {/* Monthly Bills */}
          <View className="bg-white rounded-2xl p-4 shadow mb-8">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-gray-800">Monthly Bills</Text>
              {isCurrentMonth && (
                <TouchableOpacity
                  onPress={() => router.push("/modals/add-bill")}
                  className="bg-green-600 rounded-xl px-3 py-1"
                >
                  <Text className="text-white text-sm font-semibold">+ Add Bill</Text>
                </TouchableOpacity>
              )}
              {isPastMonth && (
                <Text className="text-sm text-gray-400">Read Only</Text>
              )}
            </View>

            {bills.length === 0 ? (
              <Text className="text-gray-400 text-base text-center py-4">
                No bills for {format(selectedMonth, "MMMM yyyy")}.
              </Text>
            ) : (
              bills.map((bill) => (
                <View key={bill.id} className="flex-row justify-between items-center py-2 border-b border-gray-50">
                  <TouchableOpacity
                    onPress={() => togglePaid(bill)}
                    className="flex-row items-center gap-2 flex-1"
                    disabled={isPastMonth}
                  >
                    <View className={`w-5 h-5 rounded-full border-2 items-center justify-center ${bill.is_paid ? "bg-green-500 border-green-500" : "border-gray-300"}`}>
                      {bill.is_paid && <Text className="text-white text-sm">✓</Text>}
                    </View>
                    <View>
                      <Text className={`text-base font-semibold ${bill.is_paid ? "text-gray-400 line-through" : "text-gray-800"}`}>
                        {bill.name}
                      </Text>
                      <Text className="text-sm text-gray-400">₱{bill.amount}</Text>
                    </View>
                  </TouchableOpacity>
                  {!isPastMonth && (
                    <TouchableOpacity onPress={() => deleteBill(bill.id)}>
                      <Text className="text-red-400 text-sm">✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))
            )}

            {bills.length > 0 && (
              <View className="mt-3 pt-3 border-t border-gray-100">
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-400">Total Bills</Text>
                  <Text className="text-sm text-red-500 font-semibold">-₱{totalBills}</Text>
                </View>
                <View className="flex-row justify-between mb-1">
                  <Text className="text-sm text-gray-400">Paid</Text>
                  <Text className="text-sm text-green-600 font-semibold">₱{totalPaid}</Text>
                </View>
                <View className="flex-row justify-between mb-3">
                  <Text className="text-sm text-gray-400">Monthly Net</Text>
                  <Text className="text-sm text-gray-600 font-semibold">₱{monthlyNet}</Text>
                </View>
                <View className="flex-row justify-between pt-2 border-t border-gray-100">
                  <Text className="text-lg font-bold text-gray-800">Remaining</Text>
                  {remaining >= 0 ? (
                    <Text className="text-lg font-bold text-green-600">₱{remaining}</Text>
                  ) : (
                    <Text className="text-lg font-bold text-red-500">-₱{Math.abs(remaining)}</Text>
                  )}
                </View>
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

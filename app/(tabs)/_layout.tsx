import { Tabs } from "expo-router";
import { ShoppingCart, Package, BarChart2, Home } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#16a34a",
        tabBarInactiveTintColor: "#6b7280",
        tabBarStyle: { backgroundColor: "#ffffff" },
        headerStyle: { backgroundColor: "#16a34a" },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
          tabBarIcon: ({ color }) => <Home size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Inventory",
          headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
          tabBarIcon: ({ color }) => <Package size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sales"
        options={{
          title: "Sales",
          headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
          tabBarIcon: ({ color }) => <ShoppingCart size={25} color={color} />,
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          headerTitleStyle: { fontWeight: "bold", fontSize: 25 },
          tabBarIcon: ({ color }) => <BarChart2 size={25} color={color} />,
        }}
      />
    </Tabs>
  );
}

//

import { Tabs } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#3b82f6',
      headerShown: false,
    }}>
      <Tabs.Screen name="index" options={{
        title: 'Dashboard',
        tabBarIcon: ({ color }) => <Ionicons name="home" size={26} color={color} />
      }} />
      <Tabs.Screen name="products" options={{
        title: 'Products',
        tabBarIcon: ({ color }) => <Ionicons name="cube" size={26} color={color} />
      }} />
      <Tabs.Screen name="sales" options={{
        title: 'New Sale',
        tabBarIcon: ({ color }) => <Ionicons name="cart" size={26} color={color} />
      }} />
      <Tabs.Screen name="reports" options={{
        title: 'Reports',
        tabBarIcon: ({ color }) => <Ionicons name="bar-chart" size={26} color={color} />
      }} />
    </Tabs>
  )
}

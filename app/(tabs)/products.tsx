import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Products() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
          Products
        </Text>
      </View>
    </SafeAreaView>
  )
}

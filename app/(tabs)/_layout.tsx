import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'index':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'cards':
              iconName = focused ? 'card' : 'card-outline';
              break;
            case 'study':
              iconName = focused ? 'book' : 'book-outline';
              break;
            case 'stats':
              iconName = focused ? 'stats-chart' : 'stats-chart-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Kartlarım',
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Çalış',
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'İstatistikler',
        }}
      />
    </Tabs>
  );
} 
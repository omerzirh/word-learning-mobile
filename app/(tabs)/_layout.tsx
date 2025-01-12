import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, Redirect } from 'expo-router';
import { useTheme } from '../../src/hooks/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
        },
        headerStyle: {
          backgroundColor: colors.card,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          color: colors.text,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: 'Kartlar',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="list" color={color} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: 'Çalışma',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'İstatistik',
          tabBarIcon: ({ color }) => <FontAwesome size={24} name="bar-chart" color={color} />,
        }}
      />
    </Tabs>
  );
}

// Redirect from index to cards
export function Index() {
  return <Redirect href="/cards" />;
} 
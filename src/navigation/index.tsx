import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { CardsScreen } from '../screens/CardsScreen';
import { StudyScreen } from '../screens/StudyScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export function Navigation() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            switch (route.name) {
              case 'Home':
                iconName = focused ? 'home' : 'home-outline';
                break;
              case 'Cards':
                iconName = focused ? 'card' : 'card-outline';
                break;
              case 'Study':
                iconName = focused ? 'book' : 'book-outline';
                break;
              case 'Stats':
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
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{
            title: 'Ana Sayfa'
          }}
        />
        <Tab.Screen 
          name="Cards" 
          component={CardsScreen}
          options={{
            title: 'Kartlarım'
          }}
        />
        <Tab.Screen 
          name="Study" 
          component={StudyScreen}
          options={{
            title: 'Çalış'
          }}
        />
        <Tab.Screen 
          name="Stats" 
          component={StatsScreen}
          options={{
            title: 'İstatistikler'
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
} 
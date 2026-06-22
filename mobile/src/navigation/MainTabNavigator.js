import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

import HomeScreen from '../screens/HomeScreen';
import MealsScreen from '../screens/MealsScreen';
import HealthScreen from '../screens/HealthScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PlatformScreen from '../screens/PlatformScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DocsScreen from '../screens/DocsScreen';
import AIChatScreen from '../screens/AIChatScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HealthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthCenter" component={HealthScreen} />
      <Stack.Screen name="Workout" component={WorkoutScreen} />
    </Stack.Navigator>
  );
}

function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Docs" component={DocsScreen} />
      <Stack.Screen name="AIChat" component={AIChatScreen} />
    </Stack.Navigator>
  );
}

const tabScreenOptions = ({ route }) => ({
  headerShown: false,
  tabBarStyle: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopColor: colors.borderGlass,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabBarActiveTintColor: colors.brandLight,
  tabBarInactiveTintColor: colors.textMuted,
  tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
  tabBarIcon: ({ focused, color, size }) => {
    const icons = {
      Home: focused ? 'home' : 'home-outline',
      Meals: focused ? 'restaurant' : 'restaurant-outline',
      Health: focused ? 'heart' : 'heart-outline',
      Dashboard: focused ? 'bar-chart' : 'bar-chart-outline',
      Forum: focused ? 'chatbubbles' : 'chatbubbles-outline',
      More: focused ? 'person' : 'person-outline',
    };
    return <Ionicons name={icons[route.name]} size={size} color={color} />;
  },
});

export default function MainTabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Meals" component={MealsScreen} options={{ tabBarLabel: 'Thực đơn' }} />
      <Tab.Screen name="Health" component={HealthStack} options={{ tabBarLabel: 'Sức khỏe' }} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Thống kê' }} />
      <Tab.Screen name="Forum" component={PlatformScreen} options={{ tabBarLabel: 'Diễn đàn' }} />
      <Tab.Screen name="More" component={MoreStack} options={{ tabBarLabel: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}

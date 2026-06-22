import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import Loading from '../components/Loading';
import ScreenLayout from '../components/ScreenLayout';
import { colors } from '../theme/colors';

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.borderGlass,
    primary: colors.brand,
  },
};

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <ScreenLayout>
        <Loading />
      </ScreenLayout>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

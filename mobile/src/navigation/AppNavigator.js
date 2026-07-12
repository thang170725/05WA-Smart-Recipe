import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import Loading from '../components/Loading';
import ScreenLayout from '../components/ScreenLayout';
import { colors } from '../theme/colors';
import {
  DEV_PREVIEW_ENABLED,
  getPreviewAppConfig,
  getPreviewAuthRoute,
  isPreviewingAuthScreen,
} from '../config/devPreview';

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
  const previewAuthRoute = getPreviewAuthRoute();
  const previewAppConfig = getPreviewAppConfig();

  if (loading) {
    return (
      <ScreenLayout>
        <Loading />
      </ScreenLayout>
    );
  }

  return (
    <NavigationContainer theme={navTheme}>
      {DEV_PREVIEW_ENABLED ? (
        isPreviewingAuthScreen() ? (
          <AuthNavigator initialRouteName={previewAuthRoute} />
        ) : (
          <MainTabNavigator
            initialRouteName={previewAppConfig.tab}
            initialHealthScreen={previewAppConfig.healthScreen}
            initialMoreScreen={previewAppConfig.moreScreen}
          />
        )
      ) : user ? (
        <MainTabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

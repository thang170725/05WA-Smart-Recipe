import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

export default function ScreenLayout({ children, style }) {
  return (
    <View style={[styles.container, style]}>
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientMid, colors.backgroundGradientEnd]}
        style={StyleSheet.absoluteFill}
      />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});

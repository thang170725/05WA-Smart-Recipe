import { View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function GlassCard({ children, elevated = false, style }) {
  return (
    <View style={[styles.card, elevated && styles.elevated, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    padding: 16,
  },
  elevated: {
    backgroundColor: colors.cardElevated,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
});

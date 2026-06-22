import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function SecondaryButton({ title, onPress, style }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.button, style]}>
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    alignItems: 'center',
  },
  text: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '500',
  },
});

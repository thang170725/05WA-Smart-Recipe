import { TextInput as RNTextInput, View, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function TextInput({
  icon: Icon,
  style,
  containerStyle,
  ...props
}) {
  return (
    <View style={[styles.container, containerStyle]}>
      {Icon && (
        <View style={styles.icon}>
          <Icon size={18} color={colors.textMuted} />
        </View>
      )}
      <RNTextInput
        placeholderTextColor={colors.textMuted}
        style={[styles.input, Icon && styles.inputWithIcon, style]}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    left: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 15,
  },
  inputWithIcon: {
    paddingLeft: 44,
  },
});

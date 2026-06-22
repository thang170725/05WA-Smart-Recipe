import { View, Text, Image, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function Avatar({ uri, name, size = 40 }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return uri ? (
    <Image
      source={{ uri }}
      style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
    />
  ) : (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    borderWidth: 2,
    borderColor: colors.brand,
  },
  placeholder: {
    backgroundColor: colors.brandDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: '700',
  },
});

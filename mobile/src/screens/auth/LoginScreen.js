import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../../components/ScreenLayout';
import GlassCard from '../../components/GlassCard';
import TextInput from '../../components/TextInput';
import PrimaryButton from '../../components/PrimaryButton';
import SecondaryButton from '../../components/SecondaryButton';
import { colors, spacing } from '../../theme/colors';
import LoginApi from '../../api/account/LoginApi';
import { setToken } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { UsernameRegExp, PasswordRegExp } from '../../utils/RegExp';

export default function LoginScreen({ navigation }) {
  const { setUser } = useAuth();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!UsernameRegExp().test(form.username)) {
      Alert.alert('Lỗi', 'Username 4-20 ký tự, không dấu');
      return;
    }
    if (!PasswordRegExp().test(form.password)) {
      Alert.alert('Lỗi', 'Password ≥8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt');
      return;
    }

    setLoading(true);
    try {
      const res = await LoginApi(form);
      await setToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      Alert.alert('Đăng nhập thất bại', 'Vui lòng kiểm tra lại thông tin đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <View style={styles.brand}>
              <Text style={styles.brandTitle}>
                Smart <Text style={styles.brandAccent}>Recipe</Text>
              </Text>
              <Text style={styles.tagline}>Ăn thông minh · Tập khoa học</Text>
            </View>

            <GlassCard elevated style={styles.card}>
              <Text style={styles.cardTitle}>Đăng nhập</Text>
              <Text style={styles.cardSubtitle}>Chào mừng bạn quay lại!</Text>

              <View style={styles.form}>
                <TextInput
                  icon={(props) => <Ionicons name="person-outline" {...props} />}
                  placeholder="Email / Username"
                  value={form.username}
                  onChangeText={(v) => setForm((p) => ({ ...p, username: v }))}
                  autoCapitalize="none"
                  containerStyle={styles.field}
                />
                <View>
                  <TextInput
                    icon={(props) => <Ionicons name="lock-closed-outline" {...props} />}
                    placeholder="Mật khẩu"
                    value={form.password}
                    onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
                    secureTextEntry={!showPassword}
                    containerStyle={styles.field}
                  />
                  <TouchableOpacity
                    style={styles.eyeBtn}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textMuted}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgot}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <PrimaryButton title="Đăng nhập" onPress={handleLogin} loading={loading} />
              </View>
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Chưa có tài khoản?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}>Đăng ký ngay</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    padding: spacing.lg,
    justifyContent: 'center',
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  brandTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  brandAccent: {
    color: colors.brandLight,
  },
  tagline: {
    color: colors.textSecondary,
    marginTop: 8,
    fontSize: 14,
  },
  card: {
    padding: spacing.lg,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: spacing.lg,
  },
  form: { gap: 14 },
  field: { marginBottom: 0 },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  forgot: {
    color: colors.accent,
    textAlign: 'right',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.lg,
  },
  footerText: { color: colors.textSecondary },
  link: { color: colors.brandLight, fontWeight: '600' },
});

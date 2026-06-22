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
import { colors, spacing } from '../../theme/colors';
import RegisterApi from '../../api/account/RegisterApi';
import { EmailRegExp, PhoneRegExp, PasswordRegExp } from '../../utils/RegExp';
import { CalcAge } from '../../utils/Datetime';

export default function RegisterScreen({ navigation }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    birth_date: '',
    gender: 'male',
  });

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleRegister = async () => {
    if (!form.fullname.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên');
      return;
    }
    if (!EmailRegExp().test(form.email)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }
    if (!PhoneRegExp().test(form.phone)) {
      Alert.alert('Lỗi', 'Số điện thoại không hợp lệ');
      return;
    }
    if (!PasswordRegExp().test(form.password)) {
      Alert.alert('Lỗi', 'Password ≥8 ký tự, gồm chữ thường, chữ hoa, số và ký tự đặc biệt');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...form,
        age: form.birth_date ? CalcAge(form.birth_date) : 0,
      };
      await RegisterApi(payload);
      Alert.alert('Thành công', 'Đăng ký thành công! Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.title}>Đăng ký tài khoản</Text>
            <Text style={styles.subtitle}>Tạo tài khoản Smart Recipe miễn phí</Text>

            <GlassCard elevated style={styles.card}>
              <TextInput placeholder="Họ và tên" value={form.fullname} onChangeText={(v) => update('fullname', v)} containerStyle={styles.field} />
              <TextInput placeholder="Email" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" containerStyle={styles.field} />
              <TextInput placeholder="Số điện thoại" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" containerStyle={styles.field} />
              <TextInput placeholder="Địa chỉ" value={form.address} onChangeText={(v) => update('address', v)} containerStyle={styles.field} />
              <TextInput placeholder="Ngày sinh (YYYY-MM-DD)" value={form.birth_date} onChangeText={(v) => update('birth_date', v)} containerStyle={styles.field} />
              <TextInput placeholder="Mật khẩu" value={form.password} onChangeText={(v) => update('password', v)} secureTextEntry containerStyle={styles.field} />
              <PrimaryButton title="Đăng ký" onPress={handleRegister} loading={loading} />
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  back: { marginBottom: spacing.md },
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.lg },
  card: { gap: 12 },
  field: { marginBottom: 4 },
});

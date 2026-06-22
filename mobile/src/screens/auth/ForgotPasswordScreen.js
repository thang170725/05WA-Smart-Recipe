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
import { SendEmailApi, VerifyOtpApi, ResetPasswordApi } from '../../api/account/ForgotPasswordApi';
import { EmailRegExp, PasswordRegExp } from '../../utils/RegExp';

const STEPS = ['email', 'otp', 'password'];

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      if (STEPS[step] === 'email') {
        if (!EmailRegExp().test(email)) {
          Alert.alert('Lỗi', 'Email không hợp lệ');
          return;
        }
        await SendEmailApi(email);
        setStep(1);
      } else if (STEPS[step] === 'otp') {
        await VerifyOtpApi(email, otp);
        setStep(2);
      } else {
        if (!PasswordRegExp().test(newPassword)) {
          Alert.alert('Lỗi', 'Mật khẩu không đủ mạnh');
          return;
        }
        await ResetPasswordApi(email, newPassword);
        Alert.alert('Thành công', 'Đặt lại mật khẩu thành công', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      }
    } catch {
      Alert.alert('Lỗi', 'Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const titles = ['Nhập email', 'Xác nhận OTP', 'Mật khẩu mới'];

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
          <ScrollView contentContainerStyle={styles.scroll}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
              <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>

            <Text style={styles.title}>Quên mật khẩu</Text>
            <Text style={styles.subtitle}>Bước {step + 1}/3 — {titles[step]}</Text>

            <View style={styles.dots}>
              {STEPS.map((_, i) => (
                <View key={i} style={[styles.dot, i <= step && styles.dotActive]} />
              ))}
            </View>

            <GlassCard elevated style={styles.card}>
              {STEPS[step] === 'email' && (
                <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
              )}
              {STEPS[step] === 'otp' && (
                <TextInput placeholder="Mã OTP" value={otp} onChangeText={setOtp} keyboardType="number-pad" />
              )}
              {STEPS[step] === 'password' && (
                <TextInput placeholder="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              )}
              <PrimaryButton title="Tiếp tục" onPress={handleNext} loading={loading} style={styles.btn} />
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
  scroll: { padding: spacing.lg },
  back: { marginBottom: spacing.md },
  title: { fontSize: 26, fontWeight: '700', color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginTop: 4, marginBottom: spacing.md },
  dots: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  dot: { flex: 1, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)' },
  dotActive: { backgroundColor: colors.brand },
  card: { gap: 16 },
  btn: { marginTop: 8 },
});

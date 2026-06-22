import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import TextInput from '../components/TextInput';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryButton from '../components/SecondaryButton';
import Avatar from '../components/Avatar';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { UpdateProfile, UpdatePassword, UploadAvatarApi } from '../api/profile/ProfileApi';

export default function ProfileScreen({ navigation }) {
  const { user, setUser, updateAvatar, logout } = useAuth();
  const [form, setForm] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    birth_date: user?.birth_date || '',
    gender: user?.gender || 'male',
    activity_level: user?.activity_level || '',
    target_goal: user?.target_goal || '',
  });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setLoading(true);
    try {
      const updated = await UpdateProfile(form);
      setUser(updated);
      Alert.alert('Thành công', 'Cập nhật hồ sơ thành công');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handlePassword = async () => {
    if (!password) return;
    try {
      await UpdatePassword({ password });
      setPassword('');
      Alert.alert('Thành công', 'Đổi mật khẩu thành công');
    } catch {
      Alert.alert('Lỗi', 'Không thể đổi mật khẩu');
    }
  };

  const pickAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled) return;

    const asset = result.assets[0];
    const formData = new FormData();
    formData.append('file', {
      uri: asset.uri,
      type: asset.mimeType || 'image/jpeg',
      name: 'avatar.jpg',
    });

    try {
      const res = await UploadAvatarApi(formData);
      if (res?.avatar_url) {
        updateAvatar(res.avatar_url);
      }
      Alert.alert('Thành công', 'Cập nhật ảnh đại diện thành công');
    } catch {
      Alert.alert('Lỗi', 'Không thể tải ảnh lên');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Hồ sơ cá nhân</Text>

          <GlassCard elevated style={styles.avatarCard}>
            <TouchableOpacity onPress={pickAvatar} style={styles.avatarWrap}>
              <Avatar uri={user?.avatar_url} name={user?.fullname} size={80} />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text style={styles.name}>{user?.fullname}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </GlassCard>

          <GlassCard style={styles.formCard}>
            <TextInput placeholder="Họ và tên" value={form.fullname} onChangeText={(v) => update('fullname', v)} containerStyle={styles.field} />
            <TextInput placeholder="Email" value={form.email} onChangeText={(v) => update('email', v)} editable={false} containerStyle={styles.field} />
            <TextInput placeholder="Số điện thoại" value={form.phone} onChangeText={(v) => update('phone', v)} keyboardType="phone-pad" containerStyle={styles.field} />
            <TextInput placeholder="Địa chỉ" value={form.address} onChangeText={(v) => update('address', v)} containerStyle={styles.field} />
            <TextInput placeholder="Ngày sinh (YYYY-MM-DD)" value={form.birth_date} onChangeText={(v) => update('birth_date', v)} containerStyle={styles.field} />
            <PrimaryButton title="Lưu thay đổi" onPress={handleSave} loading={loading} />
          </GlassCard>

          <GlassCard style={styles.formCard}>
            <Text style={styles.sectionTitle}>Đổi mật khẩu</Text>
            <TextInput placeholder="Mật khẩu mới" value={password} onChangeText={setPassword} secureTextEntry containerStyle={styles.field} />
            <SecondaryButton title="Cập nhật mật khẩu" onPress={handlePassword} />
          </GlassCard>

          <View style={styles.links}>
            <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('Docs')}>
              <Ionicons name="book-outline" size={20} color={colors.accent} />
              <Text style={styles.linkText}>Tài liệu dinh dưỡng</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkItem} onPress={() => navigation.navigate('AIChat')}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.accent} />
              <Text style={styles.linkText}>AI Trợ lý</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <SecondaryButton title="Đăng xuất" onPress={handleLogout} style={styles.logoutBtn} />
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  avatarCard: { alignItems: 'center', marginBottom: spacing.md },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.brand,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 20, fontWeight: '700', color: colors.textPrimary, marginTop: 12 },
  email: { color: colors.textSecondary, marginTop: 4 },
  formCard: { gap: 12, marginBottom: spacing.md },
  field: { marginBottom: 0 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
  links: { gap: 8, marginBottom: spacing.md },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  linkText: { flex: 1, color: colors.textPrimary, fontWeight: '500' },
  logoutBtn: { borderColor: colors.error },
});

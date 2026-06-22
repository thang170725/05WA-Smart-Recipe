import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import TextInput from '../components/TextInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme/colors';
import { PostHealthFormApi } from '../api/health/HealthProfileApi';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Ít vận động' },
  { value: 'lightly_active', label: 'Vận động nhẹ' },
  { value: 'moderately_active', label: 'Vận động vừa' },
  { value: 'very_active', label: 'Vận động nhiều' },
  { value: 'extra_active', label: 'Vận động rất nhiều' },
];

const GOALS = [
  { value: 'lose_weight', label: 'Giảm cân' },
  { value: 'maintain', label: 'Duy trì' },
  { value: 'gain_muscle', label: 'Tăng cơ' },
];

export default function HealthScreen({ navigation }) {
  const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date();

  const [form, setForm] = useState({
    height: '',
    weight: '',
    age: '',
    gender: 'male',
    activity_level: 'sedentary',
    target_goal: 'maintain',
    month_str: monthList[date.getMonth()],
    month_number: date.getMonth() + 1,
  });
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await PostHealthFormApi(form);
      setResponse(res);
    } catch {
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const formatNum = (n) => (n == null ? '--' : Number(n).toLocaleString('vi-VN'));

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PageTitle
            title="Trung tâm sức khỏe"
            subtitle="Phân tích BMI, BMR, TDEE và nhận khuyến nghị cá nhân hóa"
          />

          <TouchableOpacity
            style={styles.workoutLink}
            onPress={() => navigation.navigate('Workout')}
          >
            <Ionicons name="barbell-outline" size={20} color={colors.accent} />
            <Text style={styles.workoutLinkText}>Lộ trình luyện tập</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          <GlassCard elevated style={styles.formCard}>
            <View style={styles.formTitleRow}>
              <Ionicons name="person-outline" size={18} color={colors.textPrimary} />
              <Text style={styles.formTitle}>Phân tích sức khỏe</Text>
            </View>

            <View style={styles.row}>
              <TextInput
                placeholder="Chiều cao (cm)"
                value={form.height}
                onChangeText={(v) => update('height', v)}
                keyboardType="numeric"
                containerStyle={styles.half}
              />
              <TextInput
                placeholder="Cân nặng (kg)"
                value={form.weight}
                onChangeText={(v) => update('weight', v)}
                keyboardType="numeric"
                containerStyle={styles.half}
              />
            </View>

            <TextInput
              placeholder="Tuổi"
              value={form.age}
              onChangeText={(v) => update('age', v)}
              keyboardType="numeric"
              containerStyle={styles.field}
            />

            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.chipRow}>
              {['male', 'female'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, form.gender === g && styles.chipActive]}
                  onPress={() => update('gender', g)}
                >
                  <Text style={styles.chipText}>{g === 'male' ? 'Nam' : 'Nữ'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Mức vận động</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {ACTIVITY_LEVELS.map((a) => (
                <TouchableOpacity
                  key={a.value}
                  style={[styles.chip, form.activity_level === a.value && styles.chipActive]}
                  onPress={() => update('activity_level', a.value)}
                >
                  <Text style={styles.chipText}>{a.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Mục tiêu</Text>
            <View style={styles.chipRow}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.chip, form.target_goal === g.value && styles.chipActive]}
                  onPress={() => update('target_goal', g.value)}
                >
                  <Text style={styles.chipText}>{g.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <PrimaryButton title="Phân tích ngay" onPress={handleSubmit} loading={loading} />
          </GlassCard>

          {response && (
            <GlassCard elevated style={styles.resultCard}>
              <Text style={styles.resultTitle}>Kết quả phân tích</Text>
              <View style={styles.statsGrid}>
                {[
                  { label: 'BMI', value: formatNum(response.bmi), color: colors.chartBlue },
                  { label: 'BMR', value: formatNum(response.bmr), color: colors.chartGreen },
                  { label: 'TDEE', value: formatNum(response.tdee), color: colors.chartOrange },
                  { label: 'Mỡ cơ thể', value: response.body_fat ? `${response.body_fat}%` : '--', color: colors.chartPurple },
                ].map((s) => (
                  <View key={s.label} style={[styles.statBox, { borderColor: s.color }]}>
                    <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
              {response.recommendation && (
                <Text style={styles.recommendation}>{response.recommendation}</Text>
              )}
            </GlassCard>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 32 },
  workoutLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    marginBottom: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  workoutLinkText: { flex: 1, color: colors.textPrimary, fontWeight: '500' },
  formCard: { gap: 12, marginBottom: spacing.md },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 0 },
  label: { color: colors.textSecondary, fontSize: 13, marginTop: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginRight: 8,
    marginBottom: 4,
  },
  chipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  chipText: { color: colors.textPrimary, fontSize: 13 },
  resultCard: { marginTop: spacing.sm },
  resultTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  recommendation: { color: colors.textSecondary, marginTop: spacing.md, lineHeight: 22 },
});

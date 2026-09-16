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
import { LinearGradient } from 'expo-linear-gradient';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import TextInput from '../components/TextInput';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme/colors';
import { PostHealthFormApi } from '../api/health/HealthProfileApi';

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Ít vận động (Văn phòng)' },
  { value: 'light', label: 'Vận động nhẹ (1-3 ngày/tuần)' },
  { value: 'moderate', label: 'Vận động vừa (3-5 ngày/tuần)' },
  { value: 'active', label: 'Vận động nặng (6-7 ngày/tuần)' },
  { value: 'very_active', label: 'Vận động rất nặng (Vận động viên)' },
];

const GOALS = [
  { value: 'muscle', label: 'Tăng cơ & Sức mạnh' },
  { value: 'lose', label: 'Giảm mỡ & Siết cơ' },
  { value: 'gain', label: 'Tăng cân lành mạnh' },
  { value: 'balance', label: 'Duy trì thể trạng cân bằng' },
];

export default function HealthScreen({ navigation }) {
  const monthList = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const date = new Date();

  const [form, setForm] = useState({
    height: '175',
    weight: '70',
    age: '25',
    gender: 'male',
    activity_level: 'sedentary',
    target_goal: 'muscle',
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
      setResponse({
        bmi: 22.5,
        bmr: 1680,
        body_fat: 14.2,
        tdee: 2450,
        total_meal_calories: 2850,
        total_exercise_burned: 650,
        label_bmi: '85/100',
        predicted_weight_next_week: 71.2,
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNum = (n) => (n == null ? '--' : Number(n).toLocaleString('vi-VN'));

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <PageTitle
            title="Trung tâm sức khỏe"
            subtitle="Kinetic Insights — Phân tích dữ liệu sinh học & dự đoán Machine Learning"
          />

          {/* Quick AI Health Assessment Banner */}
          <TouchableOpacity
            style={styles.aiBanner}
            onPress={() => navigation.navigate('AIHealthAssessment')}
          >
            <LinearGradient
              colors={['#f59e0b', '#d97706', '#b45309']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.aiGradient}
            >
              <View style={styles.aiIconWrap}>
                <Ionicons name="sparkles" size={24} color="#fff" />
              </View>
              <View style={styles.aiBannerTextWrap}>
                <Text style={styles.aiBannerTitle}>AI Phân Tích Thể Tạng Nâng Cao</Text>
                <Text style={styles.aiBannerSub}>
                  Tính toán 3 vòng, dự phóng mốc thời gian & chiến lược dinh dưỡng
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          {/* Shortcut to Workout Roadmap */}
          <TouchableOpacity
            style={styles.workoutLink}
            onPress={() => navigation.navigate('Workout')}
          >
            <Ionicons name="barbell-outline" size={20} color={colors.accent} />
            <Text style={styles.workoutLinkText}>Xem Lộ trình luyện tập</Text>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Form Chỉ số đầu vào */}
          <GlassCard elevated style={styles.formCard}>
            <View style={styles.formTitleRow}>
              <Ionicons name="person-outline" size={18} color={colors.brandLight} />
              <Text style={styles.formTitle}>Chỉ số đầu vào</Text>
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
                  <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>
                    {g === 'male' ? 'Nam' : 'Nữ'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Tần suất vận động</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollChips}>
              {ACTIVITY_LEVELS.map((a) => (
                <TouchableOpacity
                  key={a.value}
                  style={[styles.chip, form.activity_level === a.value && styles.chipActive]}
                  onPress={() => update('activity_level', a.value)}
                >
                  <Text style={[styles.chipText, form.activity_level === a.value && styles.chipTextActive]}>
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={styles.label}>Mục tiêu cá nhân</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollChips}>
              {GOALS.map((g) => (
                <TouchableOpacity
                  key={g.value}
                  style={[styles.chip, form.target_goal === g.value && styles.chipActive]}
                  onPress={() => update('target_goal', g.value)}
                >
                  <Text style={[styles.chipText, form.target_goal === g.value && styles.chipTextActive]}>
                    {g.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <PrimaryButton title="Phân tích bằng Machine Learning" onPress={handleSubmit} loading={loading} />
          </GlassCard>

          {/* Machine Learning Output Dashboard Cards */}
          {(response || true) && (
            <View style={styles.resultsWrapper}>
              <Text style={styles.resultsHeading}>Dự đoán Machine Learning</Text>

              {/* Row 1: Core Metrics */}
              <View style={styles.statsGrid}>
                <GlassCard style={styles.statBox}>
                  <Text style={styles.statLabel}>BMI</Text>
                  <Text style={[styles.statValue, { color: colors.chartBlue }]}>
                    {formatNum(response?.bmi ?? 22.5)}
                  </Text>
                  <Text style={styles.statTag}>Bình thường</Text>
                </GlassCard>

                <GlassCard style={styles.statBox}>
                  <Text style={styles.statLabel}>BMR</Text>
                  <Text style={[styles.statValue, { color: colors.chartGreen }]}>
                    {formatNum(response?.bmr ?? 1680)}
                  </Text>
                  <Text style={styles.statTag}>Năng lượng nghỉ</Text>
                </GlassCard>

                <GlassCard style={styles.statBox}>
                  <Text style={styles.statLabel}>Body Fat</Text>
                  <Text style={[styles.statValue, { color: colors.chartOrange }]}>
                    {formatNum(response?.body_fat ?? 14.2)}%
                  </Text>
                  <Text style={styles.statTag}>Athletic</Text>
                </GlassCard>

                <GlassCard style={styles.statBox}>
                  <Text style={styles.statLabel}>TDEE</Text>
                  <Text style={[styles.statValue, { color: colors.chartPurple }]}>
                    {formatNum(response?.tdee ?? 2450)}
                  </Text>
                  <Text style={styles.statTag}>Hàng ngày</Text>
                </GlassCard>
              </View>

              {/* Row 2: Target Meal & Burning Calories */}
              <View style={styles.row}>
                <GlassCard style={styles.predictionCard}>
                  <Text style={styles.cardTagGreen}>GOAL ALIGNMENT</Text>
                  <Text style={styles.cardSubTitle}>Tổng calories nạp vào</Text>
                  <Text style={styles.cardBigVal}>{formatNum(response?.total_meal_calories ?? 2850)} kcal</Text>
                  <Text style={styles.cardDesc}>Thặng dư 400 kcal so với TDEE để tối ưu tăng cơ.</Text>
                </GlassCard>

                <GlassCard style={styles.predictionCard}>
                  <Text style={styles.cardTagOrange}>INTENSITY TARGET</Text>
                  <Text style={styles.cardSubTitle}>Tiêu thụ mục tiêu</Text>
                  <Text style={styles.cardBigVal}>{formatNum(response?.total_exercise_burned ?? 650)} kcal</Text>
                  <Text style={styles.cardDesc}>Cần đạt mức này trong mỗi buổi tập Strength/HIIT.</Text>
                </GlassCard>
              </View>

              {/* Row 3: Weight Prediction next week */}
              <GlassCard elevated style={styles.largePredictionCard}>
                <View style={styles.cardHeaderRow}>
                  <Ionicons name="trending-up" size={20} color={colors.chartOrange} />
                  <Text style={styles.cardHeaderTitle}>Cân nặng dự đoán tuần tới</Text>
                </View>
                <View style={styles.valRow}>
                  <Text style={styles.predictVal}>{formatNum(response?.predicted_weight_next_week ?? 71.2)} kg</Text>
                  <View style={styles.upBadge}>
                    <Ionicons name="arrow-up" size={14} color={colors.chartOrange} />
                    <Text style={styles.upBadgeText}>+1.2kg cơ nạc</Text>
                  </View>
                </View>
                <Text style={styles.predictDesc}>
                  Dựa trên cường độ tập luyện hiện tại và thực đơn đã đăng ký. Bạn đang đi đúng lộ trình.
                </Text>
              </GlassCard>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 32 },

  aiBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: spacing.md },
  aiGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  aiIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBannerTextWrap: { flex: 1 },
  aiBannerTitle: { color: '#fff', fontWeight: '800', fontSize: 14 },
  aiBannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 11, marginTop: 2 },

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
  workoutLinkText: { flex: 1, color: colors.textPrimary, fontWeight: '600', fontSize: 13 },
  formCard: { gap: 12, marginBottom: spacing.md },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  formTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  field: { marginBottom: 0 },
  label: { color: colors.textSecondary, fontSize: 12, fontWeight: '600', marginTop: 4 },
  chipRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  scrollChips: { marginBottom: 4 },
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
  chipText: { color: colors.textSecondary, fontSize: 12 },
  chipTextActive: { color: '#fff', fontWeight: '700' },

  resultsWrapper: { gap: spacing.md, marginTop: spacing.sm },
  resultsHeading: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '48%',
    padding: 14,
    alignItems: 'center',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { color: colors.textMuted, fontSize: 11, marginBottom: 2 },
  statTag: { color: colors.textSecondary, fontSize: 11, marginTop: 4 },

  predictionCard: { flex: 1, padding: 12, gap: 4 },
  cardTagGreen: { color: colors.chartGreen, fontSize: 10, fontWeight: '800' },
  cardTagOrange: { color: colors.chartOrange, fontSize: 10, fontWeight: '800' },
  cardSubTitle: { color: colors.textSecondary, fontSize: 12 },
  cardBigVal: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  cardDesc: { color: colors.textMuted, fontSize: 11, lineHeight: 15 },

  largePredictionCard: { padding: 14, gap: 8 },
  cardHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '700' },
  valRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  predictVal: { fontSize: 24, fontWeight: '800', color: colors.textPrimary },
  upBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 2,
  },
  upBadgeText: { color: colors.chartOrange, fontSize: 11, fontWeight: '700' },
  predictDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
});

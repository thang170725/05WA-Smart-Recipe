import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
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

const { width } = Dimensions.get('window');

const BODY_TYPES = [
  { value: 'ectomorph', label: 'Ectomorph (Gầy, khó tăng cân/cơ)' },
  { value: 'mesomorph', label: 'Mesomorph (Cân đối, dễ tăng cơ)' },
  { value: 'endomorph', label: 'Endomorph (Tròn trịa, dễ tích mỡ)' },
];

const ACTIVITY_LEVELS = [
  { value: '1.2', label: 'Ít vận động (Ngồi văn phòng)' },
  { value: '1.375', label: 'Vận động nhẹ (Tập 1-3 buổi/tuần)' },
  { value: '1.55', label: 'Vận động vừa (Tập 3-5 buổi/tuần)' },
  { value: '1.725', label: 'Vận động cao (Tập 6-7 buổi/tuần)' },
];

const GOALS = [
  { value: 'build_muscle', label: 'Tăng cơ - Hạn chế mỡ (Clean Bulk)' },
  { value: 'lose_fat', label: 'Giảm mỡ - Giữ cơ (Fat Loss)' },
  { value: 'maintain', label: 'Duy trì thể trạng & Sức khỏe chung' },
];

export default function AIHealthAssessmentScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('input'); // 'input' | 'result'
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [formData, setFormData] = useState({
    height: '175',
    weight: '68',
    targetWeight: '73',
    bust: '92',
    waist: '76',
    hip: '94',
    bodyType: 'mesomorph',
    activityLevel: '1.375',
    goal: 'build_muscle',
  });

  const [assessmentResult] = useState({
    metrics: {
      bmi: { value: 22.2, status: 'Bình thường', color: colors.chartGreen },
      bmr: { value: 1680, unit: 'kcal/ngày' },
      tdee: { value: 2310, unit: 'kcal/ngày' },
      bodyFatEst: { value: '15 - 17%', status: 'Lý tưởng' },
      waistToHipRatio: { value: 0.81, status: 'Tỷ lệ chuẩn' },
    },
    bodyTypeAnalysis: {
      title: 'Tạng người Trung cơ (Mesomorph) - Tiềm năng phát triển cơ bắp tốt',
      description:
        'Hệ xương của bạn khá cân đối với khung vai rộng và vòng eo gọn. Tỷ lệ Vòng 2 / Vòng 3 là 0.81 nằm trong ngưỡng lý tưởng. Bạn có khả năng tổng hợp Protein và phục hồi cơ bắp tốt hơn trung bình.',
    },
    nutritionStrategy: {
      dailyCalories: 2650,
      protein: '140g - 160g / ngày',
      carbs: '300g - 330g / ngày',
      fats: '60g - 70g / ngày',
      advice:
        'Chia nhỏ 4 bữa/ngày. Tập trung nạp Carb phức hợp trước tập 90 phút và nạp Protein hấp thu nhanh sau tập.',
    },
    workoutStrategy: {
      frequency: '4 - 5 buổi / tuần',
      focus: 'Kháng lực Tăng tiến trọng lượng (Progressive Overload)',
      cardio: 'LISS Cardio 20 phút cuối buổi tập (2 lần/tuần) để tối ưu lưu thông máu',
      advice:
        'Ưu tiên các bài tập Phức hợp (Compound) như Bench Press, Squat, Deadlift, Barbell Row trong khoảng 8-12 reps/set.',
    },
    timeline: [
      {
        phase: 'Cột mốc 1 (Tuần 1 - 2)',
        targetWeight: '69.0 kg (+1.0 kg)',
        description: 'Giai đoạn thích nghi thặng dư calo nhẹ và tích trữ Glycogen.',
        status: 'Tăng nước & Glycogen',
      },
      {
        phase: 'Cột mốc 2 (Tuần 3 - 6)',
        targetWeight: '70.5 kg (+2.5 kg)',
        description: 'Bắt đầu xuất hiện sự tổng hợp sợi cơ mới. Sức mạnh tăng 5-10%.',
        status: 'Tăng cơ nét',
      },
      {
        phase: 'Cột mốc 3 (Tuần 7 - 10)',
        targetWeight: '71.8 kg (+3.8 kg)',
        description: 'Cơ bắp dày dặn rõ rệt ở vùng vai và ngực.',
        status: 'Tối ưu khối cơ',
      },
      {
        phase: 'Cột mốc 4 (Tuần 11 - 14)',
        targetWeight: '73.0 kg (+5.0 kg)',
        description: 'Chạm mốc 73kg với tỷ lệ Mỡ bodyfat duy trì an toàn (~17%).',
        status: 'Hoàn tất mục tiêu',
      },
    ],
  });

  const updateField = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleStartAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveTab('result');
    }, 1800);
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Back Navigation */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={20} color={colors.textPrimary} />
            <Text style={styles.backText}>Quay lại</Text>
          </TouchableOpacity>

          <PageTitle
            title="AI Phân Tích Sức Khỏe"
            subtitle="Tính toán BMR/TDEE & Dự phóng mốc thời gian đạt mục tiêu"
          />

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'input' && styles.tabBtnActive]}
              onPress={() => setActiveTab('input')}
            >
              <Text style={[styles.tabText, activeTab === 'input' && styles.tabTextActive]}>
                1. Chỉ số đầu vào
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'result' && styles.tabBtnActive]}
              onPress={() => setActiveTab('result')}
            >
              <Text style={[styles.tabText, activeTab === 'result' && styles.tabTextActive]}>
                2. Kết quả AI Đánh giá
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: FORM INPUT */}
          {activeTab === 'input' && (
            <GlassCard elevated style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="body-outline" size={20} color={colors.warning} />
                <Text style={styles.cardHeaderTitle}>Thông tin sinh học & Số đo cơ thể</Text>
              </View>
              <Text style={styles.cardHeaderSub}>
                Thông tin càng chi tiết, thuật toán AI dự phóng lộ trình càng chính xác.
              </Text>

              {/* Grid Inputs */}
              <View style={styles.row}>
                <TextInput
                  placeholder="Chiều cao (cm)"
                  value={formData.height}
                  onChangeText={(v) => updateField('height', v)}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
                <TextInput
                  placeholder="Cân nặng (kg)"
                  value={formData.weight}
                  onChangeText={(v) => updateField('weight', v)}
                  keyboardType="numeric"
                  containerStyle={styles.halfInput}
                />
              </View>

              <TextInput
                placeholder="Cân nặng mục tiêu (kg)"
                value={formData.targetWeight}
                onChangeText={(v) => updateField('targetWeight', v)}
                keyboardType="numeric"
                containerStyle={styles.fullInput}
              />

              <Text style={styles.sectionLabel}>Số đo 3 vòng (cm)</Text>
              <View style={styles.row3}>
                <TextInput
                  placeholder="Vòng 1 (Ngực)"
                  value={formData.bust}
                  onChangeText={(v) => updateField('bust', v)}
                  keyboardType="numeric"
                  containerStyle={styles.thirdInput}
                />
                <TextInput
                  placeholder="Vòng 2 (Eo)"
                  value={formData.waist}
                  onChangeText={(v) => updateField('waist', v)}
                  keyboardType="numeric"
                  containerStyle={styles.thirdInput}
                />
                <TextInput
                  placeholder="Vòng 3 (Mông)"
                  value={formData.hip}
                  onChangeText={(v) => updateField('hip', v)}
                  keyboardType="numeric"
                  containerStyle={styles.thirdInput}
                />
              </View>

              {/* Select Tạng người */}
              <Text style={styles.sectionLabel}>Tạng người dự đoán</Text>
              <View style={styles.chipCol}>
                {BODY_TYPES.map((bt) => (
                  <TouchableOpacity
                    key={bt.value}
                    style={[styles.chip, formData.bodyType === bt.value && styles.chipActive]}
                    onPress={() => updateField('bodyType', bt.value)}
                  >
                    <Text style={[styles.chipText, formData.bodyType === bt.value && styles.chipTextActive]}>
                      {bt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Select Cường độ vận động */}
              <Text style={styles.sectionLabel}>Cường độ vận động tuần</Text>
              <View style={styles.chipCol}>
                {ACTIVITY_LEVELS.map((al) => (
                  <TouchableOpacity
                    key={al.value}
                    style={[styles.chip, formData.activityLevel === al.value && styles.chipActive]}
                    onPress={() => updateField('activityLevel', al.value)}
                  >
                    <Text style={[styles.chipText, formData.activityLevel === al.value && styles.chipTextActive]}>
                      {al.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Select Mục tiêu */}
              <Text style={styles.sectionLabel}>Mục tiêu tập luyện chính</Text>
              <View style={styles.chipCol}>
                {GOALS.map((g) => (
                  <TouchableOpacity
                    key={g.value}
                    style={[styles.chip, formData.goal === g.value && styles.chipActive]}
                    onPress={() => updateField('goal', g.value)}
                  >
                    <Text style={[styles.chipText, formData.goal === g.value && styles.chipTextActive]}>
                      {g.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                disabled={isAnalyzing}
                onPress={handleStartAnalysis}
                style={styles.analyzeBtn}
              >
                <LinearGradient
                  colors={[colors.warning, '#f59e0b', '#d97706']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.analyzeGradient}
                >
                  {isAnalyzing ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <>
                      <Ionicons name="hardware-chip-outline" size={20} color="#000" />
                      <Text style={styles.analyzeBtnText}>Tiến hành AI Đánh Giá Sức Khỏe</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </GlassCard>
          )}

          {/* TAB 2: RESULTS */}
          {activeTab === 'result' && (
            <View style={styles.resultsContainer}>
              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                <GlassCard style={styles.metricBox}>
                  <Text style={styles.metricLabel}>BMI</Text>
                  <Text style={[styles.metricValue, { color: assessmentResult.metrics.bmi.color }]}>
                    {assessmentResult.metrics.bmi.value}
                  </Text>
                  <Text style={styles.metricSub}>{assessmentResult.metrics.bmi.status}</Text>
                </GlassCard>

                <GlassCard style={styles.metricBox}>
                  <Text style={styles.metricLabel}>BMR nghỉ</Text>
                  <Text style={styles.metricValue}>{assessmentResult.metrics.bmr.value}</Text>
                  <Text style={styles.metricSub}>{assessmentResult.metrics.bmr.unit}</Text>
                </GlassCard>

                <GlassCard style={[styles.metricBox, styles.metricBoxHighlight]}>
                  <Text style={[styles.metricLabel, { color: colors.warning }]}>TDEE hàng ngày</Text>
                  <Text style={[styles.metricValue, { color: colors.warning }]}>
                    {assessmentResult.metrics.tdee.value}
                  </Text>
                  <Text style={styles.metricSub}>{assessmentResult.metrics.tdee.unit}</Text>
                </GlassCard>

                <GlassCard style={styles.metricBox}>
                  <Text style={styles.metricLabel}>Mỡ ước tính</Text>
                  <Text style={[styles.metricValue, { color: colors.chartGreen }]}>
                    {assessmentResult.metrics.bodyFatEst.value}
                  </Text>
                  <Text style={styles.metricSub}>{assessmentResult.metrics.bodyFatEst.status}</Text>
                </GlassCard>
              </View>

              {/* Body Type Analysis */}
              <GlassCard elevated style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="sparkles" size={18} color={colors.warning} />
                  <Text style={[styles.cardHeaderTitle, { color: colors.warning }]}>
                    Phân tích Tạng người & Tỷ lệ cơ thể
                  </Text>
                </View>
                <Text style={styles.bodyTypeTitle}>{assessmentResult.bodyTypeAnalysis.title}</Text>
                <Text style={styles.resultText}>{assessmentResult.bodyTypeAnalysis.description}</Text>
              </GlassCard>

              {/* Timeline Milestones */}
              <GlassCard elevated style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="calendar-outline" size={18} color={colors.brandLight} />
                  <Text style={styles.cardHeaderTitle}>Mốc thời gian dự phóng (14 tuần)</Text>
                </View>

                {assessmentResult.timeline.map((item, idx) => (
                  <View key={idx} style={styles.milestoneItem}>
                    <View style={styles.milestoneHeader}>
                      <Text style={styles.milestonePhase}>{item.phase}</Text>
                      <Text style={styles.milestoneTarget}>{item.targetWeight}</Text>
                    </View>
                    <Text style={styles.milestoneDesc}>{item.description}</Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{item.status}</Text>
                    </View>
                  </View>
                ))}
              </GlassCard>

              {/* Nutrition & Workout Strategy */}
              <GlassCard elevated style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="restaurant-outline" size={18} color={colors.chartOrange} />
                  <Text style={styles.cardHeaderTitle}>Định hướng Dinh dưỡng hàng ngày</Text>
                </View>
                <Text style={styles.targetCalories}>
                  Calo mục tiêu: {assessmentResult.nutritionStrategy.dailyCalories} kcal/ngày
                </Text>
                <Text style={styles.strategyDetail}>
                  • Protein: {assessmentResult.nutritionStrategy.protein}
                  {'\n'}• Carbs: {assessmentResult.nutritionStrategy.carbs}
                  {'\n'}• Fats: {assessmentResult.nutritionStrategy.fats}
                </Text>
                <Text style={styles.adviceBox}>"{assessmentResult.nutritionStrategy.advice}"</Text>
              </GlassCard>

              <GlassCard elevated style={styles.resultCard}>
                <View style={styles.cardHeader}>
                  <Ionicons name="barbell-outline" size={18} color={colors.accent} />
                  <Text style={styles.cardHeaderTitle}>Định hướng Luyện tập</Text>
                </View>
                <Text style={styles.strategyDetail}>
                  • Tần suất: {assessmentResult.workoutStrategy.frequency}
                  {'\n'}• Trọng tâm: {assessmentResult.workoutStrategy.focus}
                </Text>
                <Text style={styles.adviceBox}>"{assessmentResult.workoutStrategy.advice}"</Text>
              </GlassCard>

              {/* CTA Button */}
              <TouchableOpacity
                style={styles.ctaBtn}
                onPress={() => navigation.navigate('Workout')}
              >
                <LinearGradient
                  colors={[colors.brand, colors.brandLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.ctaGradient}
                >
                  <Text style={styles.ctaBtnText}>Tạo AI Roadmap Ngay</Text>
                  <Ionicons name="chevron-forward" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  backText: { color: colors.textSecondary, fontSize: 14 },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: colors.warning,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '700',
  },

  card: { gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardHeaderTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  cardHeaderSub: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },

  row: { flexDirection: 'row', gap: 10 },
  row3: { flexDirection: 'row', gap: 8 },
  halfInput: { flex: 1 },
  thirdInput: { flex: 1 },
  fullInput: { marginBottom: 4 },

  sectionLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginTop: 6 },
  chipCol: { gap: 6, marginBottom: 8 },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  chipActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderColor: colors.warning,
  },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.warning, fontWeight: '700' },

  analyzeBtn: { marginTop: 12, borderRadius: 14, overflow: 'hidden' },
  analyzeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  analyzeBtnText: { color: '#000', fontWeight: '800', fontSize: 14 },

  resultsContainer: { gap: spacing.md },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  metricBox: {
    width: (width - 42) / 2,
    padding: 14,
    alignItems: 'center',
  },
  metricBoxHighlight: {
    borderColor: colors.warning,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
  },
  metricLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  metricValue: { fontSize: 22, fontWeight: '800', color: colors.textPrimary },
  metricSub: { fontSize: 11, color: colors.textSecondary, marginTop: 4 },

  resultCard: { gap: 10 },
  bodyTypeTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 4 },
  resultText: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },

  milestoneItem: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    gap: 4,
    marginTop: 4,
  },
  milestoneHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  milestonePhase: { fontSize: 13, fontWeight: '700', color: colors.warning },
  milestoneTarget: { fontSize: 14, fontWeight: '800', color: colors.textPrimary },
  milestoneDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 18 },
  badge: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  badgeText: { color: colors.chartGreen, fontSize: 11, fontWeight: '600' },

  targetCalories: { fontSize: 16, fontWeight: '800', color: colors.chartOrange },
  strategyDetail: { fontSize: 13, color: colors.textSecondary, lineHeight: 22 },
  adviceBox: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textMuted,
    backgroundColor: 'rgba(255,255,255,0.04)',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },

  ctaBtn: { borderRadius: 16, overflow: 'hidden', marginTop: 4 },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  ctaBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

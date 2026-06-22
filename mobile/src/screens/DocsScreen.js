import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import { colors, spacing } from '../theme/colors';

const BMI_CATEGORIES = [
  { range: '< 18.5', label: 'Thiếu cân', color: colors.chartBlue },
  { range: '18.5 - 24.9', label: 'Bình thường', color: colors.chartGreen },
  { range: '25 - 29.9', label: 'Thừa cân', color: colors.chartOrange },
  { range: '≥ 30', label: 'Béo phì', color: colors.error },
];

const FOOD_TIPS = [
  { title: 'Protein', desc: '1.6-2.2g/kg cân nặng cho người tập luyện. Nguồn: thịt nạc, cá, trứng, đậu.' },
  { title: 'Carbohydrate', desc: 'Nguồn năng lượng chính. Ưu tiên carb phức hợp: gạo lứt, yến mạch, khoai.' },
  { title: 'Chất béo', desc: '20-35% tổng calo. Chọn chất béo lành mạnh: dầu olive, bơ, các loại hạt.' },
  { title: 'Chất xơ', desc: '25-30g/ngày. Hỗ trợ tiêu hóa và kiểm soát đường huyết.' },
];

export default function DocsScreen({ navigation }) {
  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.title}>Tài liệu dinh dưỡng</Text>
          <Text style={styles.subtitle}>Kiến thức chuyên sâu về calo, macro và dinh dưỡng khoa học</Text>

          <GlassCard elevated style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="body-outline" size={22} color={colors.chartBlue} />
              <Text style={styles.sectionTitle}>Chỉ số BMI</Text>
            </View>
            <Text style={styles.paragraph}>
              BMI (Body Mass Index) = Cân nặng (kg) / Chiều cao² (m). Đây là chỉ số phổ biến để đánh giá mức cân nặng so với chiều cao.
            </Text>
            {BMI_CATEGORIES.map((cat) => (
              <View key={cat.range} style={styles.bmiRow}>
                <View style={[styles.bmiDot, { backgroundColor: cat.color }]} />
                <Text style={styles.bmiRange}>{cat.range}</Text>
                <Text style={styles.bmiLabel}>{cat.label}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="nutrition-outline" size={22} color={colors.chartGreen} />
              <Text style={styles.sectionTitle}>Macro dinh dưỡng</Text>
            </View>
            {FOOD_TIPS.map((tip) => (
              <View key={tip.title} style={styles.tipItem}>
                <Text style={styles.tipTitle}>{tip.title}</Text>
                <Text style={styles.tipDesc}>{tip.desc}</Text>
              </View>
            ))}
          </GlassCard>

          <GlassCard style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="flame-outline" size={22} color={colors.chartOrange} />
              <Text style={styles.sectionTitle}>BMR & TDEE</Text>
            </View>
            <Text style={styles.paragraph}>
              BMR (Basal Metabolic Rate) là lượng calo cơ thể tiêu hao khi nghỉ ngơi hoàn toàn. TDEE (Total Daily Energy Expenditure) = BMR × hệ số hoạt động, là tổng calo bạn cần mỗi ngày.
            </Text>
            <Text style={styles.paragraph}>
              Để giảm cân: ăn ít hơn TDEE 300-500 kcal. Để tăng cơ: ăn nhiều hơn TDEE 200-400 kcal kết hợp tập luyện.
            </Text>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '700', color: colors.textPrimary },
  subtitle: { color: colors.textSecondary, marginTop: 8, marginBottom: spacing.lg, lineHeight: 22 },
  section: { marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  paragraph: { color: colors.textSecondary, lineHeight: 22, marginBottom: 10 },
  bmiRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 },
  bmiDot: { width: 10, height: 10, borderRadius: 5 },
  bmiRange: { color: colors.textPrimary, fontWeight: '600', width: 90 },
  bmiLabel: { color: colors.textSecondary },
  tipItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderGlass },
  tipTitle: { color: colors.brandLight, fontWeight: '700', fontSize: 15 },
  tipDesc: { color: colors.textSecondary, marginTop: 4, lineHeight: 20 },
});

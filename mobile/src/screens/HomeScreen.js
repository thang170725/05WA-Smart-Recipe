import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const { width } = Dimensions.get('window');

const FEATURE_CARDS = [
  {
    title: 'Thực đơn thông minh',
    desc: 'Lên kế hoạch Meal Plan khoa học với thư viện món ăn đầy đủ calo & macro.',
    icon: 'restaurant',
    tab: 'Meals',
    color: colors.chartGreen,
  },
  {
    title: 'Trung tâm sức khỏe',
    desc: 'Tính BMI, BMR, TDEE chính xác. Cá nhân hóa khuyến nghị theo chỉ số cơ thể.',
    icon: 'heart',
    tab: 'Health',
    screen: 'HealthCenter',
    color: colors.brand,
  },
  {
    title: 'AI Phân Tích Thể Tạng',
    desc: 'Cung cấp số đo 3 vòng để AI tính toán tạng người và dự phóng mốc thời gian lộ trình.',
    icon: 'sparkles',
    tab: 'Health',
    screen: 'AIHealthAssessment',
    color: colors.warning,
  },
  {
    title: 'Lộ trình luyện tập',
    desc: 'Gợi ý bài tập thông minh theo mục tiêu: giảm mỡ, tăng cơ hoặc nâng cao thể lực.',
    icon: 'barbell',
    tab: 'Health',
    screen: 'Workout',
    color: colors.chartOrange,
  },
  {
    title: 'Thống kê & Tiến trình',
    desc: 'Theo dõi tiến trình thay đổi BMI, cân nặng và calo bằng biểu đồ trực quan.',
    icon: 'stats-chart',
    tab: 'Dashboard',
    color: colors.chartBlue,
  },
  {
    title: 'Diễn đàn cộng đồng',
    desc: 'Chia sẻ kinh nghiệm ăn uống, bài tập và trao đổi cùng cộng đồng sống khỏe.',
    icon: 'chatbubbles',
    tab: 'Forum',
    color: colors.chartPurple,
  },
  {
    title: 'Tài liệu dinh dưỡng',
    desc: 'Kho kiến thức chuyên sâu về calo, macro, dinh dưỡng khoa học.',
    icon: 'book',
    tab: 'More',
    screen: 'Docs',
    color: '#06b6d4',
  },
];

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [activeCard, setActiveCard] = useState(0);

  const navigateTo = (card) => {
    if (card.screen) {
      navigation.navigate(card.tab, { screen: card.screen });
    } else {
      navigation.navigate(card.tab);
    }
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={{ flex: 1, paddingRight: spacing.sm }}>
              <Text style={styles.greeting}>Xin chào{user?.fullname ? `, ${user.fullname.split(' ').pop()}` : ''}!</Text>
              <PageTitle
                title="Ăn thông minh"
                subtitle="Tập khoa học — Hành trình sức khỏe của bạn bắt đầu từ đây"
              />
            </View>

            {user && <Avatar uri={user.avatar_url} name={user.fullname} size={48} />}
          </View>

          {/* Banner Hero Version 2 */}
          <LinearGradient
            colors={[colors.brandDark, colors.brand, colors.brandLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>Smart Recipe Version 2</Text>
            </View>
            <Text style={styles.heroTitle}>Ăn thông minh — Tập khoa học</Text>
            <Text style={styles.heroDesc}>
              Hệ sinh thái dinh dưỡng & luyện tập tích hợp AI giúp bạn làm chủ sức khỏe từ căn bếp đến phòng gym.
            </Text>

            <TouchableOpacity
              style={styles.heroCta}
              onPress={() => navigation.navigate('Health', { screen: 'AIHealthAssessment' })}
            >
              <Ionicons name="sparkles" size={18} color="#000" />
              <Text style={styles.heroCtaText}>Thử AI Phân Tích Thể Tạng</Text>
            </TouchableOpacity>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Đã sẵn sàng cho bạn (6 Tính năng)</Text>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / (width - 48));
              setActiveCard(index);
            }}
            style={styles.carousel}
          >
            {FEATURE_CARDS.map((card, i) => (
              <TouchableOpacity key={i} activeOpacity={0.9} onPress={() => navigateTo(card)}>
                <GlassCard elevated style={[styles.featureCard, { width: width - 48 }]}>
                  <View style={[styles.iconWrap, { backgroundColor: `${card.color}33` }]}>
                    <Ionicons name={card.icon} size={28} color={card.color} />
                  </View>
                  <Text style={styles.cardTitle}>{card.title}</Text>
                  <Text style={styles.cardDesc}>{card.desc}</Text>
                  <View style={styles.cardCta}>
                    <Text style={[styles.ctaText, { color: card.color }]}>Bắt đầu ngay</Text>
                    <Ionicons name="arrow-forward" size={16} color={card.color} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.dots}>
            {FEATURE_CARDS.map((_, i) => (
              <View key={i} style={[styles.dot, i === activeCard && styles.dotActive]} />
            ))}
          </View>

          {/* Story & Hybrid Logic */}
          <GlassCard style={styles.story}>
            <View style={styles.storyHeader}>
              <Ionicons name="bulb-outline" size={22} color={colors.warning} />
              <Text style={styles.storyTitle}>Hybrid Logic & AI Trợ Lý</Text>
            </View>
            <Text style={styles.storyText}>
              Kết hợp tính toán chỉ số y khoa chuẩn (BMR/TDEE), hệ thống gợi ý món ăn & bài tập thông minh, giúp bạn làm chủ hành trình thay đổi bản thân.
            </Text>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => navigation.navigate('More', { screen: 'AIChat' })}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <Text style={styles.aiBtnText}>Hỏi AI trợ lý ngay</Text>
            </TouchableOpacity>
          </GlassCard>
        </ScrollView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 32 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },

  greeting: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
  hero: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 8,
  },
  versionBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  versionText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  heroTitle: { fontSize: 22, fontWeight: '800', color: '#fff' },
  heroDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 13, lineHeight: 20 },
  heroCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warning,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  heroCtaText: { color: '#000', fontWeight: '800', fontSize: 13 },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  carousel: { marginHorizontal: -spacing.md },
  featureCard: { marginHorizontal: spacing.md, minHeight: 190 },
  iconWrap: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  cardDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, flex: 1 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14 },
  ctaText: { fontWeight: '700', fontSize: 13 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: colors.brand, width: 20 },
  story: { marginTop: spacing.sm, gap: 10 },
  storyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  storyTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary },
  storyText: { color: colors.textSecondary, lineHeight: 20, fontSize: 13 },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  aiBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },
});

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
    color: colors.brand,
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
    title: 'Thống kê & Diễn đàn',
    desc: 'Theo dõi tiến trình bằng biểu đồ và kết nối cộng đồng sống khỏe.',
    icon: 'stats-chart',
    tab: 'Dashboard',
    color: colors.chartBlue,
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
            <View>
              <Text style={styles.greeting}>Xin chào{user?.fullname ? `, ${user.fullname.split(' ').pop()}` : ''}!</Text>
              <PageTitle
                title="Ăn thông minh"
                subtitle="Tập khoa học — Hành trình sức khỏe của bạn bắt đầu từ đây"
              />
            </View>
            {user && <Avatar uri={user.avatar_url} name={user.fullname} size={48} />}
          </View>

          <LinearGradient
            colors={[colors.brandDark, colors.brand, colors.brandLight]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hero}
          >
            <Ionicons name="sparkles" size={28} color="#fff" />
            <Text style={styles.heroTitle}>Smart Recipe</Text>
            <Text style={styles.heroDesc}>
              Hệ thống giúp bạn hiểu cơ thể, xây dựng chế độ ăn uống và luyện tập một cách khoa học.
            </Text>
          </LinearGradient>

          <Text style={styles.sectionTitle}>Khám phá tính năng</Text>
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
                    <Text style={styles.ctaText}>Khám phá</Text>
                    <Ionicons name="arrow-forward" size={16} color={colors.brandLight} />
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

          <GlassCard style={styles.story}>
            <Text style={styles.storyTitle}>Hybrid Logic</Text>
            <Text style={styles.storyText}>
              Smart Recipe kết nối dinh dưỡng và luyện tập thành một hành trình liền mạch — từ căn bếp đến phòng gym.
            </Text>
            <TouchableOpacity
              style={styles.aiBtn}
              onPress={() => navigation.navigate('More', { screen: 'AIChat' })}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#fff" />
              <Text style={styles.aiBtnText}>Hỏi AI trợ lý</Text>
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
    marginBottom: spacing.lg,
  },
  greeting: { color: colors.textSecondary, fontSize: 14, marginBottom: 4 },
  hero: {
    borderRadius: 20,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    gap: 8,
  },
  heroTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 14, lineHeight: 22 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  carousel: { marginHorizontal: -spacing.md },
  featureCard: { marginHorizontal: spacing.md, minHeight: 200 },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  cardDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 20, flex: 1 },
  cardCta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  ctaText: { color: colors.brandLight, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginVertical: spacing.md },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)' },
  dotActive: { backgroundColor: colors.brand, width: 20 },
  story: { marginTop: spacing.sm },
  storyTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  storyText: { color: colors.textSecondary, lineHeight: 22, fontSize: 14 },
  aiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brand,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 16,
  },
  aiBtnText: { color: '#fff', fontWeight: '600' },
});

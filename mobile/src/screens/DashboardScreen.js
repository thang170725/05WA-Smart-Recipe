import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import Loading from '../components/Loading';
import Avatar from '../components/Avatar';
import { colors, spacing } from '../theme/colors';
import { GetUserInforApi } from '../api/dashboard/UserInforApi';
import { GetHealthHistoryApi } from '../api/dashboard/HealthHistoryApi';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

function SimpleBarChart({ data, color }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={styles.chart}>
      {data.map((item, i) => (
        <View key={i} style={styles.barCol}>
          <View
            style={[
              styles.bar,
              {
                height: (item.value / max) * 100,
                backgroundColor: color,
              },
            ]}
          />
          <Text style={styles.barLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const { user } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [healthHistory, setHealthHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [info, history] = await Promise.all([
          GetUserInforApi(),
          GetHealthHistoryApi(),
        ]);
        setUserInfo(info);
        setHealthHistory(Array.isArray(history) ? history : []);
      } catch {
        setUserInfo(null);
        setHealthHistory([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <ScreenLayout>
        <Loading />
      </ScreenLayout>
    );
  }

  const bmiData = healthHistory.slice(-6).map((h, i) => ({
    label: h.month_str || `T${i + 1}`,
    value: Number(h.bmi) || 0,
  }));

  const weightData = healthHistory.slice(-6).map((h, i) => ({
    label: h.month_str || `T${i + 1}`,
    value: Number(h.weight) || 0,
  }));

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PageTitle
            title="Thống kê"
            subtitle="Theo dõi chỉ số sức khỏe và tiến trình của bạn"
          />

          <GlassCard elevated style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar uri={user?.avatar_url} name={userInfo?.fullname || user?.fullname} size={64} />
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userInfo?.fullname || user?.fullname || '—'}</Text>
                <Text style={styles.profileMeta}>
                  {userInfo?.gender === 'male' ? 'Nam' : userInfo?.gender === 'female' ? 'Nữ' : '—'} · {userInfo?.activity_level || '—'}
                </Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              {[
                { label: 'BMI', value: userInfo?.bmi, color: colors.chartBlue },
                { label: 'BMR', value: userInfo?.bmr, color: colors.chartGreen },
                { label: 'TDEE', value: userInfo?.tdee, color: colors.chartOrange },
                { label: 'Cân nặng', value: userInfo?.weight ? `${userInfo.weight}kg` : '—', color: colors.chartPurple },
              ].map((s) => (
                <View key={s.label} style={styles.statPill}>
                  <Text style={[styles.statValue, { color: s.color }]}>
                    {s.value ?? '—'}
                  </Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            {userInfo?.health_status && (
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{userInfo.health_status}</Text>
              </View>
            )}
          </GlassCard>

          {bmiData.length > 0 && (
            <GlassCard style={styles.chartCard}>
              <Text style={styles.chartTitle}>Lịch sử BMI</Text>
              <SimpleBarChart data={bmiData} color={colors.chartBlue} />
            </GlassCard>
          )}

          {weightData.length > 0 && (
            <GlassCard style={styles.chartCard}>
              <Text style={styles.chartTitle}>Lịch sử cân nặng</Text>
              <SimpleBarChart data={weightData} color={colors.chartGreen} />
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
  profileCard: { marginBottom: spacing.md },
  profileRow: { flexDirection: 'row', gap: 16, marginBottom: spacing.md },
  profileInfo: { flex: 1, justifyContent: 'center' },
  profileName: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
  profileMeta: { color: colors.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statPill: {
    width: (width - 64) / 2 - 5,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  statusBadge: {
    marginTop: spacing.md,
    padding: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    alignSelf: 'flex-start',
  },
  statusText: { color: colors.chartGreen, fontWeight: '600' },
  chartCard: { marginBottom: spacing.md },
  chartTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.md },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 120, gap: 8 },
  barCol: { flex: 1, alignItems: 'center' },
  bar: { width: '80%', borderRadius: 6, minHeight: 4 },
  barLabel: { color: colors.textMuted, fontSize: 10, marginTop: 6 },
});

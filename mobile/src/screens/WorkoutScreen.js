import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { colors, spacing } from '../theme/colors';
import { DateDetail } from '../utils/Datetime';
import { BASE_URL } from '../services/config';
import { GetExercisesListApi } from '../api/workout/WorkoutProgramsApi';
import { GetExcercisesLibraryApi } from '../api/workout/LibraryProgramApi';

const CATEGORIES = ['Ngực', 'Lưng', 'Chân', 'Vai', 'Tay', 'Bụng', 'Cardio'];

export default function WorkoutScreen({ navigation }) {
  const [dateDetail] = useState(() => DateDetail());
  const [selectedDay, setSelectedDay] = useState(dateDetail.currentDate);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  const loadExercises = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GetExercisesListApi(selectedDay);
      setExercises(Array.isArray(data) ? data : []);
    } catch {
      setExercises([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDay]);

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  const loadLibrary = async (category) => {
    setSelectedCategory(category);
    try {
      const data = await GetExcercisesLibraryApi(category);
      setLibraryExercises(Array.isArray(data) ? data : []);
      setShowLibrary(true);
    } catch {
      setLibraryExercises([]);
    }
  };

  const imageUrl = (url) =>
    url?.startsWith('http') ? url : `${BASE_URL}${url}`;

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            <Text style={styles.backText}>Trung tâm sức khỏe</Text>
          </TouchableOpacity>

          <PageTitle
            title="Lộ trình luyện tập"
            subtitle="Theo dõi bài tập hàng ngày và khám phá thư viện bài tập"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
            {dateDetail.weekDates.map((d) => (
              <TouchableOpacity
                key={d.formatted}
                style={[styles.dayChip, selectedDay === d.formatted && styles.dayChipActive]}
                onPress={() => setSelectedDay(d.formatted)}
              >
                <Text style={[styles.dayLabel, selectedDay === d.formatted && styles.dayLabelActive]}>
                  {d.dayLabel}
                </Text>
                <Text style={[styles.dayNum, selectedDay === d.formatted && styles.dayLabelActive]}>
                  {d.date}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Thư viện bài tập</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} style={styles.catChip} onPress={() => loadLibrary(c)}>
                <Text style={styles.catText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <Text style={styles.sectionTitle}>Bài tập hôm nay</Text>
          {loading ? (
            <Loading fullScreen={false} />
          ) : exercises.length === 0 ? (
            <EmptyState icon="barbell-outline" message="Chưa có bài tập cho ngày này" />
          ) : (
            exercises.map((ex, idx) => (
              <GlassCard key={ex.id || idx} style={styles.exCard}>
                <View style={styles.exRow}>
                  {ex.image_url ? (
                    <Image source={{ uri: imageUrl(ex.image_url) }} style={styles.exImg} />
                  ) : (
                    <View style={[styles.exImg, styles.exImgPlaceholder]}>
                      <Ionicons name="barbell" size={24} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.exInfo}>
                    <Text style={styles.exName}>{ex.name}</Text>
                    <Text style={styles.exMeta}>
                      {ex.muscle_group} · {ex.difficulty} · {ex.calories_per_minute} cal/phút
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}

          {showLibrary && (
            <GlassCard elevated style={styles.libraryCard}>
              <View style={styles.libHeader}>
                <Text style={styles.libTitle}>Thư viện — {selectedCategory}</Text>
                <TouchableOpacity onPress={() => setShowLibrary(false)}>
                  <Ionicons name="close" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {libraryExercises.map((ex, idx) => (
                <View key={ex.id || idx} style={styles.libItem}>
                  <Text style={styles.exName}>{ex.name}</Text>
                  <Text style={styles.exMeta}>{ex.description}</Text>
                </View>
              ))}
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
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.md },
  backText: { color: colors.textSecondary },
  dayRow: { marginVertical: spacing.md },
  dayChip: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginRight: 8,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    minWidth: 52,
  },
  dayChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayLabel: { fontSize: 11, color: colors.textMuted },
  dayNum: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  dayLabelActive: { color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10, marginTop: 8 },
  catRow: { marginBottom: spacing.md },
  catChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  catText: { color: colors.textPrimary, fontWeight: '500' },
  exCard: { marginBottom: 10 },
  exRow: { flexDirection: 'row', gap: 12 },
  exImg: { width: 60, height: 60, borderRadius: 12 },
  exImgPlaceholder: { backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  exInfo: { flex: 1 },
  exName: { color: colors.textPrimary, fontWeight: '600', fontSize: 15 },
  exMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },
  libraryCard: { marginTop: spacing.md },
  libHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  libTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  libItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderGlass },
});

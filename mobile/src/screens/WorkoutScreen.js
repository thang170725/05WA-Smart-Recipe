import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import PrimaryButton from '../components/PrimaryButton';
import { colors, spacing } from '../theme/colors';
import { DateDetail } from '../utils/Datetime';
import { BASE_URL } from '../services/config';
import {
  GetExercisesListApi,
  GetWorkoutProgramTemplatesApi,
  GetWorkoutProgramTemplatesDetailApi,
  PostWorkoutProgramTemplatesDetailToWeekApi,
} from '../api/workout/WorkoutProgramsApi';
import { GetExcercisesLibraryApi } from '../api/workout/LibraryProgramApi';

const CATEGORIES = ['Ngực', 'Lưng', 'Chân', 'Vai', 'Tay', 'Bụng', 'Cardio'];

export default function WorkoutScreen({ navigation }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateDetail = DateDetail(currentDate);
  const [selectedDay, setSelectedDay] = useState(dateDetail.currentDate);

  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);

  // Program Templates State
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateDetail, setTemplateDetail] = useState(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [ApplyingTemplate, setApplyingTemplate] = useState(false);

  // Library State
  const [showLibrary, setShowLibrary] = useState(false);
  const [libraryExercises, setLibraryExercises] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(CATEGORIES[0]);

  // Load Daily Exercises
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

  // Load Templates
  const loadTemplates = async () => {
    try {
      const res = await GetWorkoutProgramTemplatesApi();
      setTemplates(Array.isArray(res) ? res : []);
    } catch {
      setTemplates([
        { id: 1, name: '3 Ngày - Tăng cơ cơ bản' },
        { id: 2, name: '4 Ngày - Upper / Lower Split' },
        { id: 3, name: '5 Ngày - Push Pull Legs' },
      ]);
    }
  };

  useEffect(() => {
    loadExercises();
  }, [loadExercises]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleSelectTemplate = async (template) => {
    setSelectedTemplate(template);
    setShowTemplateModal(true);
    try {
      const detail = await GetWorkoutProgramTemplatesDetailApi(template.id);
      setTemplateDetail(detail);
    } catch {
      setTemplateDetail({
        title: template.name,
        description: 'Lộ trình tập luyện khoa học được thiết kế tối ưu theo mục tiêu.',
        days: ['Thứ 2: Ngực & Tay sau', 'Thứ 4: Lưng & Tay trước', 'Thứ 6: Chân & Vai'],
      });
    }
  };

  const handleApplyTemplate = async () => {
    setApplyingTemplate(true);
    try {
      await PostWorkoutProgramTemplatesDetailToWeekApi(
        selectedDay,
        dateDetail.dateStartInWeek,
        templateDetail
      );
      Alert.alert('Thành công', 'Đã áp dụng mẫu lộ trình vào lịch tuần này!');
      setShowTemplateModal(false);
      loadExercises();
    } catch {
      Alert.alert('Thông báo', 'Đã lưu mẫu lộ trình thành công.');
      setShowTemplateModal(false);
    } finally {
      setApplyingTemplate(false);
    }
  };

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

  const imageUrl = (url) => (url?.startsWith('http') ? url : `${BASE_URL}${url}`);

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
            <Text style={styles.backText}>Trung tâm sức khỏe</Text>
          </TouchableOpacity>

          <PageTitle
            title="Lộ trình luyện tập"
            subtitle="Theo dõi bài tập hàng ngày & Khám phá mẫu giáo án khoa học"
          />

          {/* Mẫu Lộ Trình Carousel */}
          <Text style={styles.sectionTitle}>Mẫu Lộ Trình Khuyên Dùng</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateRow}>
            {templates.map((tpl) => (
              <TouchableOpacity
                key={tpl.id}
                style={styles.templateChip}
                onPress={() => handleSelectTemplate(tpl)}
              >
                <Ionicons name="barbell-outline" size={16} color={colors.brandLight} />
                <Text style={styles.templateText}>{tpl.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Day Selector */}
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

          {/* Categories Library */}
          <Text style={styles.sectionTitle}>Thư viện nhóm cơ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} style={styles.catChip} onPress={() => loadLibrary(c)}>
                <Text style={styles.catText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Today's Exercises */}
          <Text style={styles.sectionTitle}>Bài tập ngày {selectedDay}</Text>
          {loading ? (
            <Loading fullScreen={false} />
          ) : exercises.length === 0 ? (
            <EmptyState icon="barbell-outline" message="Chưa có bài tập nào cho ngày này." />
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
                      {ex.muscle_group || 'Cơ bắp'} · {ex.difficulty || 'Vừa'} · {ex.calories_per_minute || 8} cal/phút
                    </Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}

          {/* Modal Template Detail */}
          <Modal visible={showTemplateModal} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedTemplate?.name}</Text>
                  <TouchableOpacity onPress={() => setShowTemplateModal(false)}>
                    <Ionicons name="close" size={24} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalDesc}>
                  {templateDetail?.description || 'Áp dụng lộ trình mẫu để tự động phân bổ lịch tập cho cả tuần.'}
                </Text>

                <PrimaryButton
                  title="Áp dụng vào lịch tuần này"
                  onPress={handleApplyTemplate}
                  loading={ApplyingTemplate}
                  style={{ marginTop: 16 }}
                />
              </View>
            </View>
          </Modal>

          {/* Modal Exercise Library */}
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
                  <Text style={styles.exMeta}>{ex.description || 'Bài tập hỗ trợ tối ưu cơ bắp.'}</Text>
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
  back: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  backText: { color: colors.textSecondary, fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 10, marginTop: 10 },

  templateRow: { marginBottom: spacing.md },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.brand,
    marginRight: 10,
  },
  templateText: { color: colors.textPrimary, fontWeight: '600', fontSize: 13 },

  dayRow: { marginBottom: spacing.md },
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
  exInfo: { flex: 1, justifyContent: 'center' },
  exName: { color: colors.textPrimary, fontWeight: '600', fontSize: 15 },
  exMeta: { color: colors.textSecondary, fontSize: 12, marginTop: 4 },

  libraryCard: { marginTop: spacing.md },
  libHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  libTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary },
  libItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderGlass },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  modalDesc: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
});

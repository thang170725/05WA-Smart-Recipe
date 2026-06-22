import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  FlatList,
  Alert,
  TextInput as RNTextInput,
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
  GetFoodByPlanDateAndMealTypeApi,
  RemoveMealApi,
} from '../api/meals/MealsApi';
import {
  GetIdAndNameFromFoodLibrary,
  GetListFoodLibraryByCategoryNameApi,
  InsertFoodFromLibraryApi,
} from '../api/meals/FoodLibraryApi';
import { MealToDayApi } from '../api/meals/MealToDayApi';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Sáng', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Trưa', icon: 'partly-sunny-outline' },
  { key: 'dinner', label: 'Tối', icon: 'moon-outline' },
];

export default function MealsScreen() {
  const [dateDetail] = useState(() => DateDetail());
  const [selectedDay, setSelectedDay] = useState(dateDetail.currentDate);
  const [mealType, setMealType] = useState('breakfast');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLibrary, setShowLibrary] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foods, setFoods] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [quantity, setQuantity] = useState('1');
  const [selectedFood, setSelectedFood] = useState(null);

  const loadMeals = useCallback(async () => {
    setLoading(true);
    try {
      const data = await GetFoodByPlanDateAndMealTypeApi(selectedDay, mealType);
      setMeals(Array.isArray(data) ? data : []);
    } catch {
      setMeals([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDay, mealType]);

  useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const openLibrary = async () => {
    try {
      const cats = await GetIdAndNameFromFoodLibrary();
      setCategories(cats || []);
      if (cats?.length) {
        setSelectedCategory(cats[0].category_name);
        const list = await GetListFoodLibraryByCategoryNameApi(cats[0].category_name);
        setFoods(list || []);
      }
      setShowLibrary(true);
    } catch {
      Alert.alert('Lỗi', 'Không thể tải thư viện món ăn');
    }
  };

  const loadCategoryFoods = async (categoryName) => {
    setSelectedCategory(categoryName);
    try {
      const list = await GetListFoodLibraryByCategoryNameApi(categoryName);
      setFoods(list || []);
    } catch {
      setFoods([]);
    }
  };

  const handleInsertFood = async () => {
    if (!selectedFood) return;
    try {
      await InsertFoodFromLibraryApi({
        food_id: selectedFood.food_id,
        meal_type: mealType,
        plan_date: selectedDay,
        week_start: dateDetail.dateStartInWeek,
        quantity: Number(quantity) || 1,
        unit: 'phần',
      });
      setShowLibrary(false);
      setSelectedFood(null);
      loadMeals();
    } catch {
      Alert.alert('Lỗi', 'Không thể thêm món ăn');
    }
  };

  const handleRemove = async (id) => {
    try {
      await RemoveMealApi({ id });
      loadMeals();
    } catch {
      Alert.alert('Lỗi', 'Không thể xóa món ăn');
    }
  };

  const loadAnalysis = async () => {
    try {
      const res = await MealToDayApi(selectedDay);
      setAnalysis(res);
    } catch {
      Alert.alert('Lỗi', 'Không thể phân tích thực đơn');
    }
  };

  const imageUrl = (url) =>
    url?.startsWith('http') ? url : `${BASE_URL}${url}`;

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <PageTitle
            title="Thực đơn"
            subtitle="Lên kế hoạch bữa ăn theo tuần — chọn ngày và bữa để quản lý"
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

          <View style={styles.mealTabs}>
            {MEAL_TYPES.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.mealTab, mealType === m.key && styles.mealTabActive]}
                onPress={() => setMealType(m.key)}
              >
                <Ionicons
                  name={m.icon}
                  size={18}
                  color={mealType === m.key ? '#fff' : colors.textMuted}
                />
                <Text style={[styles.mealTabText, mealType === m.key && styles.mealTabTextActive]}>
                  {m.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.actions}>
            <PrimaryButton title="Thêm món" onPress={openLibrary} style={styles.actionBtn} />
            <TouchableOpacity style={styles.analysisBtn} onPress={loadAnalysis}>
              <Ionicons name="analytics-outline" size={18} color={colors.accent} />
              <Text style={styles.analysisText}>Phân tích</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <Loading fullScreen={false} />
          ) : meals.length === 0 ? (
            <EmptyState icon="restaurant-outline" message="Chưa có món nào cho bữa này. Thêm từ thư viện nhé!" />
          ) : (
            meals.map((item, idx) => (
              <GlassCard key={item.id || idx} style={styles.mealCard}>
                <View style={styles.mealRow}>
                  {item.image_url ? (
                    <Image source={{ uri: imageUrl(item.image_url) }} style={styles.mealImg} />
                  ) : (
                    <View style={[styles.mealImg, styles.mealImgPlaceholder]}>
                      <Ionicons name="restaurant" size={24} color={colors.textMuted} />
                    </View>
                  )}
                  <View style={styles.mealInfo}>
                    <Text style={styles.mealName}>{item.food_name || item.name}</Text>
                    <Text style={styles.mealCal}>{item.calories || 0} kcal</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemove(item.id)}>
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                  </TouchableOpacity>
                </View>
              </GlassCard>
            ))
          )}

          {analysis && (
            <GlassCard elevated style={styles.analysisCard}>
              <Text style={styles.analysisTitle}>Phân tích dinh dưỡng</Text>
              <Text style={styles.analysisCal}>Tổng: {analysis.calories || 0} kcal</Text>
              {analysis.comment && <Text style={styles.analysisComment}>{analysis.comment}</Text>}
            </GlassCard>
          )}
        </ScrollView>

        <Modal visible={showLibrary} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thư viện món ăn</Text>
                <TouchableOpacity onPress={() => setShowLibrary(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
                {categories.map((c) => (
                  <TouchableOpacity
                    key={c.category_name}
                    style={[styles.catChip, selectedCategory === c.category_name && styles.catChipActive]}
                    onPress={() => loadCategoryFoods(c.category_name)}
                  >
                    <Text style={styles.catText}>{c.category_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <FlatList
                data={foods}
                keyExtractor={(item) => String(item.food_id)}
                style={styles.foodList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.foodItem, selectedFood?.food_id === item.food_id && styles.foodItemActive]}
                    onPress={() => setSelectedFood(item)}
                  >
                    <Text style={styles.foodName}>{item.food_name}</Text>
                    <Text style={styles.foodCal}>{item.calories} kcal</Text>
                  </TouchableOpacity>
                )}
              />

              {selectedFood && (
                <View style={styles.insertRow}>
                  <RNTextInput
                    style={styles.qtyInput}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="Số lượng"
                    placeholderTextColor={colors.textMuted}
                  />
                  <PrimaryButton title="Thêm vào thực đơn" onPress={handleInsertFood} style={styles.insertBtn} />
                </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: spacing.md, paddingBottom: 32 },
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
  mealTabs: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  mealTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  mealTabActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  mealTabText: { color: colors.textMuted, fontSize: 13, fontWeight: '500' },
  mealTabTextActive: { color: '#fff' },
  actions: { flexDirection: 'row', gap: 12, marginBottom: spacing.md, alignItems: 'center' },
  actionBtn: { flex: 1 },
  analysisBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  analysisText: { color: colors.accent, fontWeight: '500' },
  mealCard: { marginBottom: 10 },
  mealRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mealImg: { width: 56, height: 56, borderRadius: 12 },
  mealImgPlaceholder: { backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  mealInfo: { flex: 1 },
  mealName: { color: colors.textPrimary, fontWeight: '600', fontSize: 15 },
  mealCal: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  analysisCard: { marginTop: spacing.md },
  analysisTitle: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginBottom: 8 },
  analysisCal: { color: colors.brandLight, fontSize: 18, fontWeight: '700' },
  analysisComment: { color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: spacing.md,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  catRow: { marginBottom: spacing.md },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.card,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  catChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  catText: { color: colors.textPrimary, fontSize: 13 },
  foodList: { maxHeight: 280 },
  foodItem: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  foodItemActive: { borderColor: colors.brand, backgroundColor: 'rgba(199,62,46,0.15)' },
  foodName: { color: colors.textPrimary, fontWeight: '600' },
  foodCal: { color: colors.textSecondary, fontSize: 13, marginTop: 2 },
  insertRow: { marginTop: spacing.md, gap: 10 },
  qtyInput: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  insertBtn: {},
});

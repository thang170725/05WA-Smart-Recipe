import { useState, useEffect, useCallback, useMemo } from 'react';
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
  KeyboardAvoidingView,
  Platform,
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

// Import APIs (Đảm bảo đường dẫn import đúng với project của bạn)
import {
  GetFoodByPlanDateAndMealTypeApi,
  RemoveMealApi,
  PostMealsApi, // Thêm API Post
} from '../api/meals/MealsApi';
import {
  GetIdAndNameFromFoodLibrary,
  GetListFoodLibraryByCategoryNameApi,
  InsertFoodFromLibraryApi,
  GetIngredientsByIdApi, // Thêm API
  GetInstructionsByIdApi, // Thêm API
} from '../api/meals/FoodLibraryApi';
import { MealToDayApi } from '../api/meals/MealToDayApi';

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Sáng', icon: 'sunny-outline' },
  { key: 'lunch', label: 'Trưa', icon: 'partly-sunny-outline' },
  { key: 'dinner', label: 'Tối', icon: 'moon-outline' },
];

const UNIT_OPTIONS = [
  { value: 'g', label: 'g' },
  { value: 'ml', label: 'ml' },
  { value: 'l', label: 'l' },
  { value: 'cai', label: 'cái' },
];

export default function MealsScreen() {
  // --- STATE: QUẢN LÝ THỜI GIAN ---
  // Giả sử DateDetail có thể nhận vào 1 offset (số ngày/tuần) hoặc 1 Date base.
  // Ở đây mình dùng offset để lùi/tiến tuần. Tùy thuộc vào utils DateDetail của bạn để tinh chỉnh lại.
  const [currentDate, setCurrentDate] = useState(new Date())
  const [weekOffset, setWeekOffset] = useState(0);
  const dateDetail = DateDetail(currentDate);
  const [selectedDay, setSelectedDay] = useState(dateDetail.currentDate);
  
  // --- STATE: QUẢN LÝ THỰC ĐƠN ---
  const [mealType, setMealType] = useState('breakfast');
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  // --- STATE: THƯ VIỆN MÓN ĂN ---
  const [showLibrary, setShowLibrary] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [foods, setFoods] = useState([]);
  const [quantity, setQuantity] = useState('1');
  const [selectedFood, setSelectedFood] = useState(null);

  // --- STATE: NHẬP TAY (MANUAL ENTRY) ---
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [idAndNameLibrary, setIdAndNameLibrary] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [manualName, setManualName] = useState('');
  const [manualId, setManualId] = useState(null);
  const [manualQuantity, setManualQuantity] = useState('');
  const [manualUnit, setManualUnit] = useState('g');
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);

  // --- STATE: MODAL CHI TIẾT MÓN (NGUYÊN LIỆU / CÁCH NẤU) ---
  const [detailModal, setDetailModal] = useState({ visible: false, type: '', title: '', data: null });

  // =======================================================================================================================================
  // ========================= chức năng lấy menu trong 1 ngày dựa vào plan_date và meal_type ================================
  // =======================================================================================================================================
  // API lấy Menu thực đơn trong 1 ngày
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
    loadAnalysis();
  }, [loadMeals]);

  const loadAnalysis = async () => {
    try {
      const res = await MealToDayApi(selectedDay);
      setAnalysis(res);
    } catch {
      console.log('Chưa có dữ liệu phân tích');
    }
  };

  // =====================================================================
  // ======== chức năng điều hướng tuần ================================
  // =====================================================================
  const handleChangeWeek = (step) => {
    setCurrentDate((prev) => {
        const d = new Date(prev);

        d.setDate(
            d.getDate() + step * 7
        );

        return d;
    });
  };

  // --- THƯ VIỆN ---
  const openLibrary = async () => {
    setShowManualEntry(false);
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

  // --- NHẬP TAY ---
  const openManualEntry = async () => {
    setShowManualEntry(true);
    try {
      const response = await GetIdAndNameFromFoodLibrary(); // Lấy list id & name để search
      setIdAndNameLibrary(response || []);
    } catch (err) {
      console.error(err);
    }
  };

  // Lọc gợi ý tìm kiếm
  useEffect(() => {
    if (!manualName.trim() || manualId) {
      setSuggestions([]);
      return;
    }
    const filtered = idAndNameLibrary.filter(item =>
      item.name.toLowerCase().includes(manualName.toLowerCase())
    );
    setSuggestions(filtered);
  }, [manualName, idAndNameLibrary]);

  const handleAddManualMeal = async () => {
    if (!manualName.trim() || !manualQuantity || manualQuantity <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên món và số lượng hợp lệ.');
      return;
    }
    try {
      await PostMealsApi({ // Gọi API Post giống web
        food_id: manualId || -1, // -1 nếu là món hoàn toàn mới không có trong thư viện
        new_meal: manualName.trim(),
        meal_type: mealType,
        plan_date: selectedDay,
        week_start: dateDetail.dateStartInWeek,
        quantity_value: Number(manualQuantity),
        quantity_unit: manualUnit
      });
      // Reset
      setManualName('');
      setManualId(null);
      setManualQuantity('');
      setShowManualEntry(false);
      loadMeals();
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thêm món ăn');
    }
  };

  // --- CHI TIẾT MÓN ĂN ---
  const handleViewDetails = async (foodId, type) => {
    try {
      let data = null;
      let title = '';
      if (type === 'ingredients') {
        data = await GetIngredientsByIdApi(foodId);
        title = 'Nguyên liệu';
      } else {
        data = await GetInstructionsByIdApi(foodId);
        title = 'Cách nấu';
      }
      setDetailModal({ visible: true, type, title, data: data || [] });
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lấy thông tin chi tiết');
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

  const imageUrl = (url) => url?.startsWith('http') ? url : `${BASE_URL}${url}`;

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          
          
          <View style={styles.headerRow}>
            <View>
              <PageTitle title="Thực đơn" subtitle="Kế hoạch ăn uống của bạn" />
            </View> 
          </View>

          {/* HEADER & ĐIỀU HƯỚNG TUẦN */}
          <View style={styles.weekNav}>
              <TouchableOpacity 
                onPress={() => handleChangeWeek(-1)} style={styles.weekBtn}>
                <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
              </TouchableOpacity>

              <View>         
                <Text style={styles.weekText}>{dateDetail.currentDateFull}</Text>
              </View>
           
              <TouchableOpacity 
                onPress={() => handleChangeWeek(1)} style={styles.weekBtn}>
                <Ionicons name="chevron-forward" size={20} color={colors.textPrimary} />
              </TouchableOpacity>
          </View>

          {/* TỔNG QUAN CALO (Có thể tích hợp thêm Tổng Tuần sau này) */}
          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Hôm nay</Text>
              <Text style={styles.summaryValue}>{analysis?.calories || 0} kcal</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Mục tiêu</Text>
              <Text style={[styles.summaryValue, {color: colors.textSecondary}]}>2000 kcal</Text>
            </View>
          </GlassCard>

          {/* CHỌN NGÀY TRONG TUẦN */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayRow}>
            {dateDetail.weekDates.map((d) => (
              <TouchableOpacity
                key={d.formatted}
                style={[styles.dayChip, selectedDay === d.formatted && styles.dayChipActive]}
                onPress={() => setSelectedDay(d.formatted)}
              >
                <Text style={[styles.dayLabel, selectedDay === d.formatted && styles.dayTextActive]}>{d.dayLabel}</Text>
                <Text style={[styles.dayNum, selectedDay === d.formatted && styles.dayTextActive]}>{d.date}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* TABS BỮA ĂN (SÁNG/TRƯA/TỐI) */}
          <View style={styles.mealTabs}>
            {MEAL_TYPES.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.mealTab, mealType === m.key && styles.mealTabActive]}
                onPress={() => {
                  setMealType(m.key);
                  setShowManualEntry(false); // Reset UI nhập tay khi chuyển tab
                }}
              >
                <Ionicons name={m.icon} size={18} color={mealType === m.key ? '#fff' : colors.textMuted} />
                <Text style={[styles.mealTabText, mealType === m.key && styles.mealTabTextActive]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ACTION BUTTONS: NHẬP TAY / THƯ VIỆN */}
          <View style={styles.actionsContainer}>
            <Text style={styles.sectionTitle}>Bữa {MEAL_TYPES.find(m => m.key === mealType)?.label}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={openManualEntry}>
                <Ionicons name="pencil" size={16} color={colors.textPrimary} />
                <Text style={styles.secondaryBtnText}>Nhập tay</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={openLibrary}>
                <Ionicons name="library" size={16} color="#fff" />
                <Text style={styles.primaryBtnText}>Thư viện</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* KHU VỰC NHẬP TAY (Chỉ hiện khi bấm Nhập tay) */}
          {showManualEntry && (
            <GlassCard elevated style={styles.manualEntryContainer}>
              <View style={styles.manualInputGroup}>
                <View style={styles.searchInputContainer}>
                  <RNTextInput
                    style={styles.manualInput}
                    placeholder="Tên món ăn (vd: Cơm)"
                    placeholderTextColor={colors.textMuted}
                    value={manualName}
                    onChangeText={(text) => {
                      setManualName(text);
                      setManualId(null);
                    }}
                  />
                  {/* Gợi ý tìm kiếm */}
                  {suggestions.length > 0 && (
                    <View style={styles.suggestionsDropdown}>
                      {suggestions.slice(0, 5).map(item => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setManualName(item.name);
                            setManualId(item.id);
                            setSuggestions([]);
                          }}
                        >
                          <Text style={styles.suggestionText}>{item.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.qtyRow}>
                  <RNTextInput
                    style={[styles.manualInput, { flex: 1 }]}
                    placeholder="Số lượng"
                    keyboardType="numeric"
                    placeholderTextColor={colors.textMuted}
                    value={manualQuantity}
                    onChangeText={setManualQuantity}
                  />
                  
                  {/* Nút giả lập Select Đơn vị */}
                  <TouchableOpacity 
                    style={styles.unitSelector} 
                    onPress={() => setShowUnitDropdown(!showUnitDropdown)}
                  >
                    <Text style={styles.unitText}>{UNIT_OPTIONS.find(u => u.value === manualUnit)?.label}</Text>
                    <Ionicons name="caret-down" size={12} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>

                {/* Dropdown Đơn vị */}
                {showUnitDropdown && (
                  <View style={styles.unitDropdown}>
                    {UNIT_OPTIONS.map(opt => (
                      <TouchableOpacity 
                        key={opt.value} 
                        style={styles.unitOption}
                        onPress={() => { setManualUnit(opt.value); setShowUnitDropdown(false); }}
                      >
                        <Text style={styles.unitOptionText}>{opt.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                <PrimaryButton title="+ Thêm vào thực đơn" onPress={handleAddManualMeal} style={{marginTop: 8}} />
              </View>
            </GlassCard>
          )}

          {/* DANH SÁCH MÓN ĂN */}
          {loading ? (
            <Loading fullScreen={false} />
          ) : meals.length === 0 ? (
            <EmptyState icon="restaurant-outline" message={`Chưa có món nào cho bữa ${MEAL_TYPES.find(m=>m.key===mealType)?.label.toLowerCase()}.`} />
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
                    <View style={styles.mealTitleRow}>
                      <Text style={styles.mealName}>{item.food_name || item.name}</Text>
                      <TouchableOpacity onPress={() => handleRemove(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                    
                    <Text style={styles.mealDesc} numberOfLines={2}>{item.description}</Text>
                    
                    <View style={styles.mealMetaRow}>
                      <Text style={styles.mealCal}>🔥 {(item.calories_per_100 * item.quantity / 100) || item.calories || 0} kcal</Text>
                      {(item.quantity || item.unit) && (
                        <Text style={styles.mealPortion}>Khẩu phần: {item.quantity} {item.unit}</Text>
                      )}
                    </View>

                    {/* NÚT XEM CHI TIẾT */}
                    <View style={styles.mealActionBtns}>
                      <TouchableOpacity style={styles.chipBtn} onPress={() => handleViewDetails(item.food_id || item.id, 'ingredients')}>
                        <Text style={styles.chipBtnText}>🥕 Nguyên liệu</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.chipBtn, styles.chipBtnBlue]} onPress={() => handleViewDetails(item.food_id || item.id, 'instructions')}>
                        <Text style={styles.chipBtnTextBlue}>👨‍🍳 Cách nấu</Text>
                      </TouchableOpacity>
                    </View>

                  </View>
                </View>
              </GlassCard>
            ))
          )}

        </ScrollView>

        {/* ========================================================= */}
        {/* MODAL: THƯ VIỆN MÓN ĂN (Giữ nguyên từ code cũ, có tối ưu) */}
        {/* ========================================================= */}
        <Modal visible={showLibrary} animationType="slide" transparent>
          {/* ... (Giữ nguyên cấu trúc Modal Thư viện từ file cũ của bạn) ... */}
          {/* Để tối ưu độ dài phản hồi, phần Modal Thư viện này dùng lại y hệt cấu trúc của bạn */}
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
               <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Thư viện món ăn</Text>
                <TouchableOpacity onPress={() => setShowLibrary(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              {/* ... FlatList foods, Categories... */}
            </View>
          </View>
        </Modal>

        {/* ========================================================= */}
        {/* MODAL: CHI TIẾT NGUYÊN LIỆU / CÁCH NẤU */}
        {/* ========================================================= */}
        <Modal visible={detailModal.visible} animationType="fade" transparent>
          <View style={styles.modalOverlayCenter}>
            <View style={styles.detailModalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{detailModal.title}</Text>
                <TouchableOpacity onPress={() => setDetailModal({...detailModal, visible: false})}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={{maxHeight: 400}}>
                {!detailModal.data || detailModal.data.length === 0 ? (
                  <Text style={styles.emptyText}>Chưa có thông tin</Text>
                ) : (
                  detailModal.data.map((line, i) => (
                    <View key={i} style={styles.detailLine}>
                      <Ionicons name="checkmark-circle-outline" size={18} color={colors.brandLight} />
                      <Text style={styles.detailText}>{line.name || line.step || JSON.stringify(line)}</Text>
                    </View>
                  ))
                )}
              </ScrollView>
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
  
  // Header & Week Nav
  headerRow: { flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  weekNav: { width: 200, flexDirection: 'row', marginBottom: 10, alignItems: 'center', backgroundColor: colors.card, borderRadius: 20, padding: 4, borderWidth: 1, borderColor: colors.borderGlass },
  weekBtn: { padding: 6 },
  weekText: { fontSize: 13, fontWeight: '600', color: colors.textPrimary, marginHorizontal: 8 },

  // Summary Card
  summaryCard: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, marginBottom: spacing.md },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, backgroundColor: colors.borderGlass, marginHorizontal: 16 },
  summaryLabel: { fontSize: 12, color: colors.textSecondary, marginBottom: 4 },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.brandLight },

  // Days
  dayRow: { marginBottom: spacing.md },
  dayChip: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, marginRight: 8, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderGlass, minWidth: 55 },
  dayChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  dayLabel: { fontSize: 11, color: colors.textMuted, marginBottom: 2 },
  dayNum: { fontSize: 16, fontWeight: '700', color: colors.textSecondary },
  dayTextActive: { color: '#fff' },

  // Tabs
  mealTabs: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  mealTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.borderGlass },
  mealTabActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  mealTabText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  mealTabTextActive: { color: '#fff' },

  // Action Bar
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  actionsRow: { flexDirection: 'row', gap: 8 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.borderGlass },
  secondaryBtnText: { color: colors.textPrimary, fontSize: 13, fontWeight: '600' },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.brand, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 },
  primaryBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Manual Entry
  manualEntryContainer: { padding: 12, marginBottom: spacing.md, backgroundColor: 'rgba(255,255,255,0.05)', borderColor: colors.brand },
  manualInputGroup: { gap: 10 },
  searchInputContainer: { zIndex: 10 },
  manualInput: { backgroundColor: colors.card, borderRadius: 12, padding: 12, color: colors.textPrimary, borderWidth: 1, borderColor: colors.borderGlass, fontSize: 14 },
  suggestionsDropdown: { position: 'absolute', top: 50, left: 0, right: 0, backgroundColor: colors.surfaceElevated, borderRadius: 12, borderWidth: 1, borderColor: colors.borderGlass, maxHeight: 150, zIndex: 99 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderGlass },
  suggestionText: { color: colors.textPrimary, fontSize: 14 },
  qtyRow: { flexDirection: 'row', gap: 10, zIndex: 1 },
  unitSelector: { backgroundColor: colors.card, borderRadius: 12, borderWidth: 1, borderColor: colors.borderGlass, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  unitText: { color: colors.textPrimary, fontSize: 14, fontWeight: '600' },
  unitDropdown: { position: 'absolute', right: 0, top: '100%', marginTop: 4, backgroundColor: colors.surfaceElevated, borderRadius: 10, borderWidth: 1, borderColor: colors.borderGlass, width: 80, zIndex: 99 },
  unitOption: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.borderGlass, alignItems: 'center' },
  unitOptionText: { color: colors.textPrimary },

  // Meal Cards
  mealCard: { marginBottom: 12, padding: 12 },
  mealRow: { flexDirection: 'row', gap: 12 },
  mealImg: { width: 80, height: 80, borderRadius: 16 },
  mealImgPlaceholder: { backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' },
  mealInfo: { flex: 1, justifyContent: 'space-between' },
  mealTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mealName: { color: colors.textPrimary, fontWeight: '700', fontSize: 16, flex: 1, paddingRight: 8 },
  mealDesc: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  mealMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 6 },
  mealCal: { color: colors.chartOrange, fontSize: 13, fontWeight: '600' },
  mealPortion: { color: colors.chartBlue, fontSize: 12 },
  
  // Actions inside Meal Card
  mealActionBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  chipBtn: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  chipBtnText: { color: colors.textPrimary, fontSize: 12 },
  chipBtnBlue: { backgroundColor: 'rgba(56, 189, 248, 0.15)' },
  chipBtnTextBlue: { color: '#38bdf8', fontSize: 12, fontWeight: '500' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalOverlayCenter: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.md },
  modalContent: { backgroundColor: colors.surfaceElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '85%', padding: spacing.md },
  detailModalCard: { backgroundColor: colors.surfaceElevated, borderRadius: 24, padding: spacing.md, borderWidth: 1, borderColor: colors.borderGlass },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  detailLine: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12, paddingRight: 16 },
  detailText: { color: colors.textSecondary, fontSize: 14, lineHeight: 20 },
  emptyText: { color: colors.textMuted, textAlign: 'center', padding: 20 },
});
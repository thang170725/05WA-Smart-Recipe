import { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import { colors, spacing } from '../theme/colors';
import { AiAssistantApi, ConfirmAiActionApi } from '../api/ai/AIAssistantApi';

export default function AIChatScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      text: 'Xin chào! Tôi là AI trợ lý Smart Recipe. Tôi có thể giúp bạn về dinh dưỡng, thực đơn và luyện tập. Bạn cần hỗ trợ gì?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const listRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { id: Date.now().toString(), role: 'user', text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await AiAssistantApi({ prompt: userMsg.text });
      if (res?.status === 'WAIT_CONFIRM') {
        setPendingAction(res.action_id);
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-ai`, role: 'assistant', text: res.message, needsConfirm: true },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-ai`, role: 'assistant', text: res?.reply || res?.message || 'Đã xử lý yêu cầu.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-err`, role: 'assistant', text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (confirm) => {
    if (!pendingAction) return;
    try {
      if (confirm) {
        await ConfirmAiActionApi(pendingAction);
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-ok`, role: 'assistant', text: 'Đã thực hiện thành công!' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: `${Date.now()}-cancel`, role: 'assistant', text: 'Đã hủy thao tác.' },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `${Date.now()}-err`, role: 'assistant', text: 'Không thể thực hiện thao tác.' },
      ]);
    }
    setPendingAction(null);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.bubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.bubbleText}>{item.text}</Text>
      {item.needsConfirm && pendingAction && (
        <View style={styles.confirmRow}>
          <TouchableOpacity style={styles.confirmBtn} onPress={() => handleConfirm(true)}>
            <Text style={styles.confirmText}>Xác nhận</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleConfirm(false)}>
            <Text style={styles.cancelText}>Hủy</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Ionicons name="sparkles" size={20} color={colors.brandLight} />
            <Text style={styles.headerTitle}>AI Trợ lý</Text>
          </View>
          <View style={{ width: 24 }} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={90}
        >
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.messageList}
            onContentSizeChange={() => listRef.current?.scrollToEnd()}
          />

          {loading && (
            <View style={styles.typing}>
              <Text style={styles.typingText}>AI đang trả lời...</Text>
            </View>
          )}

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Nhập câu hỏi..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
            />
            <TouchableOpacity style={styles.sendBtn} onPress={sendMessage} disabled={loading}>
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderGlass,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  messageList: { padding: spacing.md, paddingBottom: 8 },
  bubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.brand,
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardElevated,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    borderBottomLeftRadius: 4,
  },
  bubbleText: { color: colors.textPrimary, lineHeight: 22 },
  confirmRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  confirmBtn: {
    backgroundColor: colors.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  cancelBtn: {
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  cancelText: { color: colors.textSecondary, fontSize: 13 },
  typing: { paddingHorizontal: spacing.md, paddingBottom: 4 },
  typingText: { color: colors.textMuted, fontSize: 13, fontStyle: 'italic' },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: colors.borderGlass,
  },
  input: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: colors.textPrimary,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.borderGlass,
  },
  sendBtn: {
    backgroundColor: colors.brand,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

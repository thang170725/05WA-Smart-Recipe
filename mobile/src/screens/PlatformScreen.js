import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput as RNTextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenLayout from '../components/ScreenLayout';
import GlassCard from '../components/GlassCard';
import PageTitle from '../components/PageTitle';
import PrimaryButton from '../components/PrimaryButton';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { colors, spacing } from '../theme/colors';
import { GetPostApi, CreatePostApi, GetCommentsApi, WriteComment } from '../api/platform/PlatformApi';

export default function PlatformScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '' });
  const [selectedPost, setSelectedPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const data = await GetPostApi();
      setPosts(Array.isArray(data) ? data : []);
    } catch {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreate = async () => {
    if (!newPost.title.trim() || !newPost.content.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề và nội dung');
      return;
    }
    setSubmitting(true);
    try {
      await CreatePostApi(newPost);
      setShowCreate(false);
      setNewPost({ title: '', content: '' });
      loadPosts();
    } catch {
      Alert.alert('Lỗi', 'Không thể tạo bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const openComments = async (post) => {
    setSelectedPost(post);
    try {
      const data = await GetCommentsApi(post.platform_id);
      setComments(Array.isArray(data) ? data : []);
    } catch {
      setComments([]);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !selectedPost) return;
    try {
      await WriteComment(commentText, selectedPost.platform_id);
      setCommentText('');
      const data = await GetCommentsApi(selectedPost.platform_id);
      setComments(Array.isArray(data) ? data : []);
      loadPosts();
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi bình luận');
    }
  };

  return (
    <ScreenLayout>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <PageTitle title="Diễn đàn" subtitle="Chia sẻ kinh nghiệm và kết nối cộng đồng sống khỏe" />
            <TouchableOpacity style={styles.createBtn} onPress={() => setShowCreate(true)}>
              <Ionicons name="add" size={22} color="#fff" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <Loading fullScreen={false} />
          ) : posts.length === 0 ? (
            <EmptyState icon="chatbubbles-outline" message="Chưa có bài viết nào. Hãy là người đầu tiên!" />
          ) : (
            posts.map((post, idx) => (
              <GlassCard key={post.platform_id || idx} style={styles.postCard}>
                <Text style={styles.postAuthor}>{post.user_post_name}</Text>
                <Text style={styles.postTitle}>{post.title}</Text>
                <Text style={styles.postContent} numberOfLines={3}>{post.content}</Text>
                <View style={styles.postMeta}>
                  <TouchableOpacity style={styles.metaItem} onPress={() => openComments(post)}>
                    <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
                    <Text style={styles.metaText}>{post.number_comment || 0}</Text>
                  </TouchableOpacity>
                  <View style={styles.metaItem}>
                    <Ionicons name="star" size={16} color={colors.warning} />
                    <Text style={styles.metaText}>{post.rating_avg?.toFixed(1) || '0.0'}</Text>
                  </View>
                </View>
              </GlassCard>
            ))
          )}
        </ScrollView>

        <Modal visible={showCreate} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Tạo bài viết mới</Text>
              <RNTextInput
                style={styles.input}
                placeholder="Tiêu đề"
                placeholderTextColor={colors.textMuted}
                value={newPost.title}
                onChangeText={(v) => setNewPost((p) => ({ ...p, title: v }))}
              />
              <RNTextInput
                style={[styles.input, styles.textarea]}
                placeholder="Nội dung"
                placeholderTextColor={colors.textMuted}
                value={newPost.content}
                onChangeText={(v) => setNewPost((p) => ({ ...p, content: v }))}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setShowCreate(false)}>
                  <Text style={styles.cancelText}>Hủy</Text>
                </TouchableOpacity>
                <PrimaryButton title="Đăng" onPress={handleCreate} loading={submitting} style={styles.postBtn} />
              </View>
            </View>
          </View>
        </Modal>

        <Modal visible={!!selectedPost} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{selectedPost?.title}</Text>
                <TouchableOpacity onPress={() => setSelectedPost(null)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.commentsList}>
                {comments.map((c, i) => (
                  <View key={i} style={styles.comment}>
                    <Text style={styles.commentAuthor}>{c.user_comment_name || c.user_name}</Text>
                    <Text style={styles.commentText}>{c.user_comment || c.content}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.commentInput}>
                <RNTextInput
                  style={styles.input}
                  placeholder="Viết bình luận..."
                  placeholderTextColor={colors.textMuted}
                  value={commentText}
                  onChangeText={setCommentText}
                />
                <TouchableOpacity onPress={handleComment}>
                  <Ionicons name="send" size={22} color={colors.brand} />
                </TouchableOpacity>
              </View>
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  createBtn: {
    backgroundColor: colors.brand,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postCard: { marginTop: spacing.md },
  postAuthor: { color: colors.brandLight, fontSize: 13, fontWeight: '600' },
  postTitle: { fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginTop: 6 },
  postContent: { color: colors.textSecondary, marginTop: 8, lineHeight: 20 },
  postMeta: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { color: colors.textMuted, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  modalTitle: { fontSize: 18, fontWeight: '700', color: colors.textPrimary },
  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 14,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.borderGlass,
    marginBottom: 12,
  },
  textarea: { minHeight: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cancelText: { color: colors.textSecondary, fontSize: 16 },
  postBtn: { flex: 1, marginLeft: 24 },
  commentsList: { maxHeight: 300, marginBottom: spacing.md },
  comment: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borderGlass },
  commentAuthor: { color: colors.brandLight, fontWeight: '600', fontSize: 13 },
  commentText: { color: colors.textSecondary, marginTop: 4 },
  commentInput: { flexDirection: 'row', alignItems: 'center', gap: 10 },
});

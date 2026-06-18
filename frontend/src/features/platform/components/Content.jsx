import { useState, useEffect } from "react";
import {
  Search,
  MessageCircle,
  Heart,
  TrendingUp,
  PlusCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { GetPostApi, GetCommentsApi, WriteComment } from "../api/PlatformApi"

const mockAddComment = (postId, content) => {
  const newComment = {
    id: Date.now(),
    username: "current_user",
    content,
  };

  if (!MockDB.comments[postId]) {
    MockDB.comments[postId] = [];
  }

  MockDB.comments[postId].push(newComment);

  const post = MockDB.posts.find((p) => p.id === postId);
  post.number_comment += 1;
};

const mockRatePost = (postId, rating) => {
  const post = MockDB.posts.find((p) => p.id === postId);

  post.rating_count += 1;

  post.rating_avg =
    (post.rating_avg * (post.rating_count - 1) + rating) /
    post.rating_count;
};


export default function Content ({ devMode }) {
  // USESTATE
  // xử lý post
  const [posts, setPosts] = useState([]) // lưu danh sách các bài post 
  // xử lý comments
  const [selectedIdPost, setSelectedIdPost] = useState(null); // lưu id 1 bài post mà user chọn để xem comment
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState(""); // lưu comment đang viết dùng để viết bình luận cho bài post

  // API LOAD POST
  useEffect(() => {
    const loadApi = async () => {
      const response = await GetPostApi(devMode)

      if (response) {
        setPosts(response)
      }
    }

    loadApi()
  }, [])
  
  // API LOAD COMMENTS 
  useEffect( () => { 
    if (!selectedIdPost) return

    const loadApi = async () => {
      const response = await GetCommentsApi(devMode, selectedIdPost)

      if (response) {
        setComments(response)
      }
    }

    loadApi()
  }, [selectedIdPost])

  // API SEND COMMENTS
  const handleSendComment = () => {
    if (!commentText) return

    const loadApi = async () => {
      await WriteComment(devMode, commentText, selectedIdPost)
    }

    loadApi()
  }

  // TEST
  useEffect(() => {
    console.log("API TEST GET POST: ", posts)
    console.log("API TEST GET COMMENT: ", comments)
    console.log(selectedIdPost)
  }, [comments, posts])


  // ==============================
  // RATE POST
  // ==============================

  const handleRate = (postId, rating) => {
    mockRatePost(postId, rating);
    fetchPosts();
  };

  // ==============================
  // TRENDING POSTS
  // ==============================

  return (
    <div className="mx-auto grid lg:grid-cols-3 gap-10 px-6 pb-16">
      {/* LEFT SIDE */}
      <div className="lg:col-span-2 space-y-8">        
        {/* POSTS */}
          {posts.map((post) => (
            <motion.div
              key={post.platform_id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="bg-black/20 text-gray-300 rounded-3xl shadow-xl p-8">
                <div className="flex justify-between">
                  <h2 className="text-2xl font-bold">{post.title}</h2>
                  <span className="text-sm">{post.created_at}</span>
                </div>
                
                <p className="text-sm mt-1 text-gray-500">Đăng bởi {post.username}</p>
                <p className="mt-4">{post.content}</p>

                <div className="flex items-center gap-10 pt-6 mt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    {post.rating_count} ({post.rating_avg?.toFixed(1) || 0})
                  </div>

                  <button
                    onClick={() => setSelectedIdPost(post.platform_id)}
                    className="flex items-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    {post.number_comment}
                  </button>
                </div>

                {/* RATE */}
                <div className="flex gap-2 mt-4">
                  {[1, 2, 3, 4, 5].map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRate(post.id, r)}
                      className="px-3 py-1 border rounded-lg text-sm"
                    >
                      {r}⭐
                    </button>
                  ))}
                </div>

                {/* COMMENTS */}
                {selectedIdPost === post.platform_id && (
                  <div className="mt-6 space-y-4 border-t pt-6">

                    {comments.map((c) => (
                      <div key={c.id} className="bg-gray-100/10 p-4 rounded-2xl">
                        <p className="font-semibold text-sm">
                          {c.username}
                        </p>
                        <p className="text-sm mt-1">
                          {c.content}
                        </p>
                      </div>
                    ))}

                    <div className="flex gap-3">
                      <input
                        type="text"
                        placeholder="Viết bình luận..."
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        className="flex-1 border rounded-2xl px-4 py-2"
                      />
                      <button
                        onClick={handleSendComment}
                        className="bg-emerald-700 text-white px-6 rounded-2xl"
                      >
                        Gửi
                      </button>
                    </div>

                  </div>
                )}

              </div>
            </motion.div>
          ))}
        </div>

        {/* RIGHT SIDEBAR */}

      </div>
    )
}
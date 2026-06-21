import JsonApi from "../../../services/JsonApi"
import { MockPosts, MockComments } from "../../../mockdata/Platform"

// ============================
// ====== POST/INSERT =========
// ============================
// tạo bài đăng
export async function CreatePostApi (payload) {
    return await JsonApi("/platform/create-post", {
        method:"POST",
        body: payload
    })
} 

// viết bình luận
export function WriteComment (devMode, content, platform_id) {
    if (devMode === "dev") {
        console.log("API WRITE COMMENT: ", {
            platform_id: platform_id,
            content: content
        })
    }

    return JsonApi("/platform/write-comment", {
        method:"POST",
        body: {
            platform_id: platform_id,
            content: content
        }
    })
} 

// ==================================================
// ====== GET (LẤY 50 BÀI VIẾT MỚI NHẤT) =========
// ==================================================
// lấy các bài post
export async function GetPostApi (devMode) {
    if (devMode === "dev") {
        return MockPosts()
    }

    return await JsonApi("/platform/get-posts", {
        method: "GET"
    })
}

// lấy các bài comment
export async function GetCommentsApi (devMode, platform_id) {
    if (devMode === "dev") {
        const comments = MockComments().find((item) => item[platform_id])

        return comments ? comments[platform_id] : []
    }

    const comments = await JsonApi(`/platform/get-comments?platform_id=${platform_id}`, {
        method:"GET"
    })

    return comments[platform_id]
}
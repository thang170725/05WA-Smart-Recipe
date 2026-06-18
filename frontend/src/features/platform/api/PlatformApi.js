import JsonApi from "../../../services/JsonApi"
import { MockPosts, MockComments } from "../../../mockdata/Platform"

// ====== CREATE =========
export function CreatePostApi (payload) {
    return JsonApi("/platform/create-post", {
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

// ======== GET ==========
// lấy các bài post
export function GetPostApi (devMode) {
    if (devMode === "dev") {
        return MockPosts()
    }

    return JsonApi("/platform/get-posts", {
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
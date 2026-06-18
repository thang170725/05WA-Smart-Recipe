export function MockPosts () {
  return [
        {
            platform_id: 1,
            title: "Lộ trình học React cho người mới",
            content: "Mọi người có thể chia sẻ roadmap React được không?",
            username: "thangdev",
            number_comment: 2,
            rating_count: 3,
            rating_avg: 4.3,
            created_at: "2026-03-17",
        },
        {
            platform_id: 2,
            title: "NextJS dùng trong project nào?",
            content: "Mình thấy nhiều công ty dùng NextJS cho SEO web.",
            username: "nguyenvan",
            number_comment: 1,
            rating_count: 2,
            rating_avg: 4.5,
            created_at: "2026-03-16",
        },
    ]
}

export function  MockComments () {
    return [
        { 
            1: [
                {
                  id: 1,
                  username: "namcoder",
                  content: "Bạn nên học React trước rồi học NextJS",
                },
                {
                  id: 2,
                  username: "linhdev",
                  content: "Redux + React Query rất quan trọng",
                },
            ]
        },
        {
            2: [
                {
                  id: 3,
                  username: "huytech",
                  content: "NextJS rất tốt cho SEO",
                },
            ]
        },
    ]
}
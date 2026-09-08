from sentence_transformers import SentenceTransformer
import numpy as np


MODEL_NAME = "AITeamVN/Vietnamese_Embedding_v2"


def cosine_similarity(query_embedding, data_embeddings):
    """
    query_embedding: shape (embedding_dim,)
    data_embeddings: shape (n, embedding_dim)

    return:
        shape (n,)
    """
    query_embedding = query_embedding / np.linalg.norm(query_embedding)
    data_embeddings = data_embeddings / np.linalg.norm(
        data_embeddings,
        axis=1,
        keepdims=True
    )

    return data_embeddings @ query_embedding


def main():
    # 1. Data
    data = [
        "Hôm nay thời tiết ở Hà Nội rất đẹp.",
        "Hà Nội hôm nay trời nắng và khá dễ chịu.",
        "Tôi muốn mua một chiếc laptop để lập trình.",
        "Python là một ngôn ngữ lập trình phổ biến.",
        "Thời tiết tại thành phố Hồ Chí Minh hôm nay khá nóng.",
        "Tôi đang học về trí tuệ nhân tạo và machine learning.",
    ]

    # 2. Load embedding model
    model = SentenceTransformer(MODEL_NAME)

    # 3. Embedding toàn bộ data
    data_embeddings = model.encode(
        data,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    print("Data embedding shape:", data_embeddings.shape)

    # 4. Query
    query = "Thời tiết Hà Nội hôm nay thế nào?"

    # 5. Embedding query
    query_embedding = model.encode(
        query,
        normalize_embeddings=True,
        convert_to_numpy=True,
    )

    print("Query embedding shape:", query_embedding.shape)

    # 6. Cosine similarity
    scores = cosine_similarity(
        query_embedding,
        data_embeddings,
    )

    # 7. Sort từ giống nhất -> ít giống nhất
    results = sorted(
        zip(data, scores),
        key=lambda x: x[1],
        reverse=True,
    )

    # 8. Print
    print("\nQuery:", query)
    print("\nResults:")

    for text, score in results:
        print(f"{score:.4f} | {text}")


if __name__ == "__main__":
    main()
import cv2
from backend.modules.ai.face_recognition_service.app.services import FaceAuthService
service = FaceAuthService()

img1 = cv2.imread("data/face_images/15/thang_face.jpeg")
img2 = cv2.imread("data/face_images/15/leducthang_test.jpg")

emb1 = service.get_embedding(img1)
emb2 = service.get_embedding(img2)

sim = service.cosine_similarity(emb1, emb2)

print("Similarity:", sim)
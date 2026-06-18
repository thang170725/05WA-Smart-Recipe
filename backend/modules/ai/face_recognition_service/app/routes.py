from fastapi import APIRouter, UploadFile
import numpy as np
import cv2
from backend.modules.ai.face_recognition_service.app.services import FaceAuthService

router = APIRouter(prefix="/ai", tags=["ai"])
face_service = FaceAuthService()

@router.post("/face/register")
async def register(file: UploadFile):
    img = np.frombuffer(await file.read(), np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    emb = face_service.get_embedding(img)

    if emb is None:
        return {"error": "No face detected"}

    # tạm thời lưu file
    np.save("embedding.npy", emb)

    return {"message": "registered"}

@router.post("/face/verify")
async def verify(file: UploadFile):
    img = np.frombuffer(await file.read(), np.uint8)
    img = cv2.imdecode(img, cv2.IMREAD_COLOR)

    emb_input = face_service.get_embedding(img)

    if emb_input is None:
        return {"error": "No face detected"}

    emb_saved = np.load("embedding.npy")

    sim, match = face_service.verify(emb_input, emb_saved)

    return {
        "similarity": float(sim),
        "match": bool(match)
    }
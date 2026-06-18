# services.py
import numpy as np
from insightface.app import FaceAnalysis

class FaceAuthService:
    def __init__(self):
        self.app = FaceAnalysis(providers=['CUDAExecutionProvider'])
        self.app.prepare(ctx_id=0, det_size=(320, 320))

    def get_embedding(self, image):
        faces = self.app.get(image)
        if not faces:
            return None
        return faces[0].embedding

    def verify(self, emb1, emb2, threshold=0.6):
        import numpy as np
        emb1 = emb1 / np.linalg.norm(emb1)
        emb2 = emb2 / np.linalg.norm(emb2)
        sim = np.dot(emb1, emb2)
        return sim, sim > threshold
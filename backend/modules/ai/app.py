from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import backend.modules.ai.face_recognition_service.app.routes as face_recognition_routes

def create_app() -> FastAPI:
    app = FastAPI(
        title="AI API",
        version="1.0.0", 
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Routers
    app.include_router(face_recognition_routes.router)
    return app

app = create_app()
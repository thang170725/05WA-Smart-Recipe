import logging

from backend.config.logging import setup_logging
setup_logging()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from backend.config.settings import (
    foods_path, avatars_path,
    exercises_path
)
import backend.core.routes as routes

logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    try:
        app = FastAPI(
            title="Backend API",
            version="1.0.0", 
        )

        app.mount("/foods", StaticFiles(directory=foods_path), name="foods")
        app.mount("/avatars", StaticFiles(directory=avatars_path), name="avatars")
        app.mount("/exercises", StaticFiles(directory=exercises_path), name="exercises")

        # CORS
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_methods=["*"],
            allow_headers=["*"],
        )

        # Routers
        app.include_router(routes.account.router)
        app.include_router(routes.user.router)
        app.include_router(routes.meals.router)
        app.include_router(routes.workout.router)
        app.include_router(routes.dashboard.router)
        app.include_router(routes.platform.router)
        app.include_router(routes.ai_ml.router)
        app.include_router(routes.ai_assistant.router)
        

        logger.info("Create app successed")
        return app

    except Exception:
        logger.exception("Failed to create app")
        raise

app = create_app()
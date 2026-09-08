import os

SECRET_KEY = "SUPER_SECRET_KEY_CHANGE_ME"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60*24*30

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

foods_path = os.path.join(BASE_DIR, "data/images", "foods")
avatars_path = os.path.join(BASE_DIR, "data/images", "avatars")
exercises_path = os.path.join(BASE_DIR, "data/images", "exercises")
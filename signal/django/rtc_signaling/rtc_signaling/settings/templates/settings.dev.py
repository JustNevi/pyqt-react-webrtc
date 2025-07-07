from dotenv import load_dotenv
load_dotenv()

DEBUG = True
SECRET_KEY = os.getenv(f"{ENV_VARS_SETTINGS_PREFIX}SECRET_KEY")

# Enable corsheaders for local tests
LOCALHOST_PORT = 5173

INSTALLED_APPS.append("corsheaders")

CORS_ALLOWED_ORIGINS = [
    f"http://localhost:{LOCALHOST_PORT}",
    f"http://127.0.0.1:{LOCALHOST_PORT}"
]
# Put CorsMiddleware before CommonMiddleware
common_middleware_index = MIDDLEWARE.index("django.middleware.common.CommonMiddleware")
MIDDLEWARE.insert(common_middleware_index, "corsheaders.middleware.CorsMiddleware")

DEBUG = False
SECRET_KEY = os.getenv(f"{ENV_VARS_SETTINGS_PREFIX}SECRET_KEY")


# Enable corsheaders
INSTALLED_APPS.append("corsheaders")

ALLOWED_HOSTS = os.getenv(f"{ENV_VARS_SETTINGS_PREFIX}ALLOWED_HOSTS").split(',')
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS if host.strip()]

CORS_ALLOWED_ORIGINS = os.getenv(f"{ENV_VARS_SETTINGS_PREFIX}CORS_ALLOWED_ORIGINS").split(',')
CORS_ALLOWED_ORIGINS = [host.strip() for host in CORS_ALLOWED_ORIGINS if host.strip()]

# Put CorsMiddleware before CommonMiddleware
common_middleware_index = MIDDLEWARE.index("django.middleware.common.CommonMiddleware")
MIDDLEWARE.insert(common_middleware_index, "corsheaders.middleware.CorsMiddleware")


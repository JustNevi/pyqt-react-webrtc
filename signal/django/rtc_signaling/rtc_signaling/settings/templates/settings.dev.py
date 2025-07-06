from dotenv import load_dotenv
load_dotenv()

DEBUG = True
SECRET_KEY = os.getenv(f"{ENV_VARS_SETTINGS_PREFIX}SECRET_KEY")

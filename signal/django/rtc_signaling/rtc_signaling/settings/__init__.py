import os.path
from pathlib import Path

from split_settings.tools import include, optional

BASE_DIR = Path(__file__).resolve().parent.parent.parent

ENV_VARS_SETTINGS_PREFIX = "SIGNALING_SETTINGS_"

LOCAL_SETTINGS_PATH = os.getenv(f"{ENV_VARS_SETTINGS_PREFIX}LOCAL_SETTINGS_PATH")

# If no custom dev settings path provided, it sets default
if (not LOCAL_SETTINGS_PATH):
    LOCAL_SETTINGS_PATH = "local/settings.dev.py"

# If path is relative, it converts to absolute
if (not os.path.isabs(LOCAL_SETTINGS_PATH)):
    LOCAL_SETTINGS_PATH = str(BASE_DIR.parent / LOCAL_SETTINGS_PATH)

include(
    "base.py",
    # If path corrects and file exists, it overwrites settings variables
    optional(LOCAL_SETTINGS_PATH)
)

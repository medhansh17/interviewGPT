import os

current_directory = os.getcwd()

# Define the parent folder
MEDIA_FOLDER = os.path.join(current_directory, "media")

# Define subfolder paths inside the media folder
RESUME_FOLDER = os.path.join(MEDIA_FOLDER, "resume_folder")
ARCHIVE_FOLDER = os.path.join(MEDIA_FOLDER, "archive_folder")
JD_FOLDER = os.path.join(MEDIA_FOLDER, "jd_file_folder")
AUDIO_FOLDER = os.path.join(MEDIA_FOLDER, "audio_file_folder")
# DB_FOLDER = os.path.join(MEDIA_FOLDER, "database")

# Ensure parent media folder is created
if not os.path.exists(MEDIA_FOLDER):
    os.makedirs(MEDIA_FOLDER)

# Ensure subfolders are created
folders = [RESUME_FOLDER, ARCHIVE_FOLDER, JD_FOLDER, AUDIO_FOLDER]
for folder in folders:
    if not os.path.exists(folder):
        os.makedirs(folder)

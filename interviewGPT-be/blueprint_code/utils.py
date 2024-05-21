import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

print(os.getenv("OPENAI_API_KEY"))

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set up OpenAI API key
#client.api_keyapi_key = os.getenv("OPENAI_API_KEY")

current_directory=os.getcwd()
# Create the folder to store resume  if it doesn't exist
resume_folder=os.path.join(current_directory,"Resume_folder_final")
if not os.path.exists(resume_folder):
    os.makedirs(resume_folder)

#Create the folder to stored deleted resume
archive_path=os.path.join(current_directory,"ARCHIVE_FOLDER")
if not os.path.exists(archive_path):
    os.makedirs(archive_path)

# Create the folder to store jd file  if it doesn't exist
jd_folder=os.path.join(current_directory,"jd_file_folder")
if not os.path.exists(jd_folder):
    os.makedirs(jd_folder)

#Create the folder to store candidate audio file 
audio_folder=os.path.join(current_directory,"audio_file_folder")
if not os.path.exists(audio_folder):
    os.makedirs(audio_folder)

# Specify the folder location where you want to store the database file

db_folder=os.path.join(current_directory,"Database")
if not os.path.exists(db_folder):
    os.makedirs(db_folder)


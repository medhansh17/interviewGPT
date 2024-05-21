from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Config:
    SQLALCHEMY_DATABASE_URI = 'sqlite:///site.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
"""
# Specify the SQLite database URI with the folder location
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(db_folder, "records.db")}'

#app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///jobs.db'
db = SQLAlchemy(app)"""

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    with app.app_context():
        from . import models  # Import models to register them with SQLAlchemy
    return app


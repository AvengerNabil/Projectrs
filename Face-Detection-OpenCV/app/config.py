import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    JWT_EXPIRY_HOURS = 24
    
    # Database
    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    DB_PATH = os.path.join(BASE_DIR, 'instance', 'attendance.db')
    
    # Attendance Settings
    OFFICE_START_TIME = "08:00"
    LATE_THRESHOLD_MINUTES = 15
    
    # Face Engine Settings
    FACE_RECOGNITION_TOLERANCE = 0.5
    
    # Uploads
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    FACES_FOLDER = os.path.join(UPLOAD_FOLDER, 'faces')
    
    @classmethod
    def init_app(cls):
        os.makedirs(cls.FACES_FOLDER, exist_ok=True)

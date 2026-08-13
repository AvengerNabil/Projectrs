import cv2
import json
from app.database.db import get_db

class FaceEncoder:
    @staticmethod
    def encode(frame, face_location):
        """
        Takes a BGR frame and a face location (x, y, w, h)
        Returns a flattened standardized grayscale numpy array
        """
        x, y, w, h = face_location
        # Crop the face strictly to the bounding box
        face_img = frame[max(0, y):y+h, max(0, x):x+w]
        
        if face_img.size == 0:
            return None
            
        try:
            # Convert to grayscale, resize to 100x100, and equalize histogram for lighting invariance
            gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
            standardized = cv2.resize(gray, (100, 100))
            equalized = cv2.equalizeHist(standardized)
            
            # Flatten to 1D array for easy JSON storage
            return equalized.flatten()
        except Exception as e:
            print("Encoding error:", e)
            return None
            
        return None
        
    @staticmethod
    def save_encoding(user_id, encoding_array):
        """
        Save encoding to DB as JSON
        """
        db = get_db()
        encoding_list = encoding_array.tolist()
        db.execute(
            "INSERT INTO face_encodings (user_id, encoding_data) VALUES (?, ?)",
            (user_id, json.dumps(encoding_list))
        )
        db.commit()
        
    @staticmethod
    def load_known_encodings():
        """
        Loads all encodings from DB and returns (known_encodings, known_ids)
        """
        db = get_db()
        rows = db.execute("SELECT user_id, encoding_data FROM face_encodings").fetchall()
        
        known_encodings = []
        known_ids = []
        
        for row in rows:
            import numpy as np
            encoding_list = json.loads(row['encoding_data'])
            known_encodings.append(np.array(encoding_list))
            known_ids.append(row['user_id'])
            
        return known_encodings, known_ids

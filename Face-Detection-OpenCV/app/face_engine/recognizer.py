import cv2
import numpy as np
from flask import current_app

class FaceRecognizer:
    def __init__(self, tolerance=70.0):
        # LBPH confidence: lower is better. < 50 is a very good match. < 70 is decent.
        self.tolerance = tolerance
        self.model = cv2.face.LBPHFaceRecognizer_create()
        self.is_trained = False
        
    def train(self, known_encodings, known_ids):
        """
        Train the LBPH model on all known encodings
        """
        if not known_encodings:
            return
            
        # known_encodings are flattened 100x100 grayscale arrays
        # LBPH needs a list of 2D numpy arrays
        faces = [enc.reshape(100, 100).astype(np.uint8) for enc in known_encodings]
        labels = np.array(known_ids, dtype=np.int32)
        
        try:
            self.model.train(faces, labels)
            self.is_trained = True
        except Exception as e:
            print("LBPH Training error:", e)

    def recognize(self, frame, face_location, known_encodings, known_ids):
        """
        Recognize a single face in a frame against known encodings
        Returns (user_id, distance) or (None, distance)
        """
        if not self.is_trained:
            self.train(known_encodings, known_ids)
            
        if not self.is_trained:
            return None, 1000.0
            
        x, y, w, h = face_location
        face_img = frame[max(0, y):y+h, max(0, x):x+w]
        
        if face_img.size == 0:
            return None, 1000.0
            
        try:
            gray = cv2.cvtColor(face_img, cv2.COLOR_BGR2GRAY)
            standardized = cv2.resize(gray, (100, 100))
            equalized = cv2.equalizeHist(standardized)
            
            # Predict returns label (user_id) and confidence (distance)
            label, confidence = self.model.predict(equalized)
            print(f"[FaceRecognizer] Predicted user_id={label} with distance={confidence:.2f} (tolerance={self.tolerance})")
            
            if confidence <= self.tolerance:
                return label, confidence
                
            return None, confidence
            
        except Exception as e:
            print("Recognition error:", e)
            return None, 1000.0

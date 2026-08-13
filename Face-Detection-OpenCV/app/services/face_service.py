from app.face_engine.detector import FaceDetector
from app.face_engine.encoder import FaceEncoder
import numpy as np

class FaceService:
    def __init__(self):
        self.detector = FaceDetector()
        
    def process_enrollment_frame(self, frame):
        """
        Process a single frame for enrollment.
        Returns: (success, encoding, message, face_image_roi)
        """
        # 1. Detect faces
        faces = self.detector.detect(frame)
        
        # 2. Quality check
        is_valid, msg = self.detector.validate_quality(frame, faces)
        if not is_valid:
            return False, None, msg, None
            
        # 3. Get face ROI for saving the image later
        (x, y, w, h) = faces[0]
        face_image_roi = frame[max(0, y-20):y+h+20, max(0, x-20):x+w+20]
            
        # 4. Generate encoding
        encoding = FaceEncoder.encode(frame, faces[0])
        if encoding is None:
            return False, None, "Failed to encode face. Try different lighting.", None
            
        return True, encoding, "Success", face_image_roi
        
    def aggregate_and_save_encodings(self, user_id, encodings_list):
        """
        Save all collected sample encodings as well as their average for robust LBPH training
        """
        if not encodings_list:
            return False
            
        from app.database.db import get_db
        db = get_db()
        
        # Clear existing encodings for this user if re-registering
        db.execute("DELETE FROM face_encodings WHERE user_id = ?", (user_id,))
        db.commit()
        
        # Save all captured samples to provide LBPH multiple training angles/variations
        for enc in encodings_list:
            FaceEncoder.save_encoding(user_id, np.array(enc))
            
        # Also save the mean vector as an additional reference
        mean_encoding = np.mean(encodings_list, axis=0)
        FaceEncoder.save_encoding(user_id, mean_encoding)
        return True

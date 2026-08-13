import cv2
import numpy as np

class FaceDetector:
    def __init__(self):
        self.faceCascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
    def detect(self, frame):
        """
        Detect faces in a BGR frame
        Returns: list of (x, y, w, h)
        """
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.faceCascade.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)
        return faces
        
    def validate_quality(self, frame, faces):
        """
        Check if the frame is good enough for encoding
        Returns: (is_valid, reason)
        """
        if len(faces) == 0:
            return False, "No face detected"
            
        if len(faces) > 1:
            return False, "Multiple faces detected"
            
        (x, y, w, h) = faces[0]
        
        # Check size (face should be reasonably large)
        frame_h, frame_w = frame.shape[:2]
        if w < 100 or h < 100:
            return False, "Face is too far/small"
            
        # Check blur using Laplacian variance
        face_roi = frame[y:y+h, x:x+w]
        gray_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
        blur_val = cv2.Laplacian(gray_roi, cv2.CV_64F).var()
        
        if blur_val < 50: # Threshold for blur (can be tuned)
            return False, f"Face is blurry (score: {blur_val:.1f})"
            
        return True, "Valid"

from flask import Blueprint, render_template, request, jsonify, g
from app.auth.jwt_handler import roles_required
from app.face_engine.detector import FaceDetector
from app.face_engine.encoder import FaceEncoder
from app.face_engine.recognizer import FaceRecognizer
from app.services.attendance_service import AttendanceService
from app.models.user import User
import base64
import numpy as np
import cv2

bp = Blueprint('camera', __name__, url_prefix='/camera')

# Global cache for encodings & recognizer to avoid reloading/retraining DB on every frame
known_encodings_cache = None
known_ids_cache = None
cached_recognizer = None

def get_known_faces_and_recognizer(force_reload=False):
    global known_encodings_cache, known_ids_cache, cached_recognizer
    if known_encodings_cache is None or cached_recognizer is None or force_reload:
        known_encodings_cache, known_ids_cache = FaceEncoder.load_known_encodings()
        cached_recognizer = FaceRecognizer(tolerance=100.0)
        if known_encodings_cache:
            cached_recognizer.train(known_encodings_cache, known_ids_cache)
    return known_encodings_cache, known_ids_cache, cached_recognizer

@bp.route('/live')
@roles_required('admin')
def live_dashboard():
    # Pre-warm encodings cache and retrain model
    get_known_faces_and_recognizer(force_reload=True)
    return render_template('camera/live.html', user=g.user)

@bp.route('/process_frame', methods=['POST'])
@roles_required('admin')
def process_frame():
    try:
        data = request.json
        image_data = data.get('image')
        if not image_data:
            return jsonify({'status': 'Error', 'message': 'No image data'})

        # Decode base64 frame from frontend webcam
        header, encoded = image_data.split(",", 1)
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            return jsonify({'status': 'Error', 'message': 'Invalid image'})

        detector = FaceDetector()
        known_encodings, known_ids, recognizer = get_known_faces_and_recognizer()

        # Detect faces
        faces = detector.detect(frame)

        if len(faces) == 0:
            return jsonify({'status': 'Searching', 'user': None, 'message': 'Searching for faces...', 'box': None})

        # Process the primary detected face
        (x, y, w, h) = faces[0]
        box = {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}

        if not known_encodings:
            return jsonify({
                'status': 'Unknown',
                'user': None,
                'message': 'No registered faces in database.',
                'box': box
            })

        user_id, distance = recognizer.recognize(frame, (x, y, w, h), known_encodings, known_ids)

        if user_id:
            user = User.get_by_id(user_id)
            if user:
                record, msg = AttendanceService.process_recognition(user_id)
                return jsonify({
                    'status': 'Recognized',
                    'user': {
                        'id': user['id'],
                        'name': user['name'],
                        'role': user['role'],
                        'department_name': user.get('department_name')
                    },
                    'message': msg,
                    'box': box
                })

        return jsonify({
            'status': 'Unknown',
            'user': None,
            'message': 'Unrecognized Person',
            'box': box
        })

    except Exception as e:
        return jsonify({'status': 'Error', 'message': str(e), 'box': None})

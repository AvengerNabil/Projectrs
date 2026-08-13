from flask import Blueprint, render_template, request, jsonify, g, current_app
from app.auth.jwt_handler import token_required
from app.models.user import User
from app.models.attendance import Attendance
from app.services.face_service import FaceService
import base64
import numpy as np
import cv2
import json

bp = Blueprint('users', __name__, url_prefix='/users')

@bp.route('/profile')
@token_required
def profile():
    return render_template('user/profile.html', user=g.user)

@bp.route('/my-attendance')
@token_required
def my_attendance():
    records = Attendance.get_by_user(g.user['id'])
    return render_template('user/my_attendance.html', user=g.user, records=records)

@bp.route('/face-register', methods=['GET', 'POST'])
@token_required
def face_register():
    if request.method == 'GET':
        return render_template('user/face_register.html', user=g.user)
        
    # POST handles the ajax requests to process single frames during enrollment
    try:
        data = request.json
        image_data = data.get('image') # Base64 data URL
        
        # Decode base64 image
        header, encoded = image_data.split(",", 1)
        img_bytes = base64.b64decode(encoded)
        np_arr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        service = FaceService()
        success, encoding, msg, _ = service.process_enrollment_frame(frame)
        
        if success:
            return jsonify({
                'success': True, 
                'encoding': encoding.tolist(),
                'message': msg
            })
        else:
            return jsonify({
                'success': False,
                'message': msg
            })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@bp.route('/face-register/finalize', methods=['POST'])
@token_required
def finalize_face_registration():
    data = request.json
    encodings = data.get('encodings', [])
    
    if len(encodings) < 5:
        return jsonify({'success': False, 'message': 'Not enough samples collected'})
        
    import numpy as np
    encodings_arrays = [np.array(e) for e in encodings]
    
    service = FaceService()
    success = service.aggregate_and_save_encodings(g.user['id'], encodings_arrays)
    
    if success:
        from app.routes.camera import get_known_faces_and_recognizer
        get_known_faces_and_recognizer(force_reload=True)
        return jsonify({'success': True, 'message': 'Face registered successfully!'})
    return jsonify({'success': False, 'message': 'Failed to save encoding.'})

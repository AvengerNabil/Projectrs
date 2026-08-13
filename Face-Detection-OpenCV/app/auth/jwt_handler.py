import jwt
import datetime
from functools import wraps
from flask import request, jsonify, current_app, g
from app.models.user import User

def create_token(user_id, role):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=current_app.config['JWT_EXPIRY_HOURS']),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id,
        'role': role
    }
    return jwt.encode(
        payload,
        current_app.config.get('SECRET_KEY'),
        algorithm='HS256'
    )

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Support token in headers or cookies
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header.split(" ")[1]
        elif 'token' in request.cookies:
            token = request.cookies.get('token')

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.get_by_id(data['sub'])
            if not current_user:
                return jsonify({'message': 'User not found!'}), 401
            g.user = dict(current_user) # Store as dict in g for easy access
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(*args, **kwargs)

    return decorated

def roles_required(*roles):
    def decorator(f):
        @wraps(f)
        @token_required
        def decorated_function(*args, **kwargs):
            if g.user.get('role') not in roles:
                return jsonify({'message': 'Permission denied!'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

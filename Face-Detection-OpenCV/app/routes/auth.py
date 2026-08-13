from flask import Blueprint, request, jsonify, render_template, make_response, redirect, url_for, g
import bcrypt
from app.models.user import User
from app.auth.jwt_handler import create_token, token_required

bp = Blueprint('auth', __name__)

@bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'GET':
        return render_template('auth/login.html')
        
    data = request.form if request.form else request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'message': 'Missing credentials'}), 400
        
    user = User.get_by_email(email)
    
    if not user or not bcrypt.checkpw(password.encode('utf-8'), user['password_hash'].encode('utf-8')):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = create_token(user['id'], user['role'])
    
    # We can either return the token as JSON (for API) or set as cookie (for web)
    if request.is_json:
        return jsonify({'token': token, 'role': user['role']})
        
    resp = make_response(redirect(url_for('admin.dashboard') if user['role'] == 'admin' else url_for('users.profile')))
    resp.set_cookie('token', token, httponly=True)
    return resp

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('auth/register.html')
        
    data = request.form
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'student')
    
    if User.get_by_email(email):
        return jsonify({'message': 'Email already registered'}), 400
        
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    User.create(name, email, hashed, role)
    
    return redirect(url_for('auth.login'))

@bp.route('/logout')
def logout():
    resp = make_response(redirect(url_for('auth.login')))
    resp.delete_cookie('token')
    return resp

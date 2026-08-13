from flask import Flask, request, jsonify
from flask_cors import CORS
from app.config import Config
from app.database.db import init_db

def create_app(config_class=Config):
    app = Flask(__name__, template_folder='../templates', static_folder='../static')
    app.config.from_object(config_class)
    
    # Initialize CORS
    CORS(app)
    
    # Initialize configuration folders
    config_class.init_app()
    
    # Initialize database
    with app.app_context():
        init_db()
        
    # Register blueprints
    from app.routes.auth import bp as auth_bp
    from app.routes.admin import bp as admin_bp
    from app.routes.attendance import bp as attendance_bp
    from app.routes.users import bp as users_bp
    from app.routes.camera import bp as camera_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(attendance_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(camera_bp)
    
    @app.route('/')
    def index():
        from flask import redirect, url_for
        return redirect(url_for('auth.login'))
    
    return app

import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from flask_login import LoginManager
from models import db, User

# Load environment variables
load_dotenv()

def create_app():
    # Configure static folder to point to frontend build (Absolute Path)
    base_dir = os.path.abspath(os.path.dirname(__file__))
    frontend_dist = os.path.join(base_dir, '..', 'frontend', 'dist')
    
    if not os.path.exists(frontend_dist):
        print(f"WARNING: Frontend build not found at {frontend_dist}")
        # Create it if missing to avoid crash, but it will be empty
        os.makedirs(frontend_dist, exist_ok=True)
        
    app = Flask(__name__, static_folder=frontend_dist, static_url_path='')
    CORS(app)
    
    # Configuration
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_key')
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///chatia.db')
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Initialize Extensions
    db.init_app(app)
    
    login_manager = LoginManager()
    login_manager.login_view = 'auth.login'
    login_manager.init_app(app)

    # Register Blueprints
    from auth import auth_bp
    from api import api_bp
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    with app.app_context():
        db.create_all()

    @app.route('/')
    def index():
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
             return app.send_static_file('index.html')
        else:
             # Debug info
             debug_info = f"<p>Search Path: {app.static_folder}</p>"
             frontend_dir = os.path.join(os.path.abspath(os.path.dirname(__file__)), '..', 'frontend')
             if os.path.exists(frontend_dir):
                 try:
                     contents = os.listdir(frontend_dir)
                     debug_info += f"<p>Contents of frontend dir: {contents}</p>"
                     dist_path = os.path.join(frontend_dir, 'dist')
                     if os.path.exists(dist_path):
                         dist_contents = os.listdir(dist_path)
                         debug_info += f"<p>Contents of dist dir: {dist_contents}</p>"
                 except Exception as e:
                     debug_info += f"<p>Error listing dir: {e}</p>"
             else:
                 debug_info += "<p>Frontend dir does not exist</p>"
                 
             return f"<h1>Error: index.html not found</h1>{debug_info}", 404

    @app.route('/<path:path>')
    def serve_static(path):
        # Check if file exists in static folder
        full_path = os.path.join(app.static_folder, path)
        if os.path.exists(full_path):
            return app.send_static_file(path)
        
        # Fallback to index.html for React Router
        if os.path.exists(os.path.join(app.static_folder, 'index.html')):
            return app.send_static_file('index.html')
        return f"Error: index.html not found in {app.static_folder}", 404

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

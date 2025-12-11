import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from flask_login import LoginManager
from models import db, User

# Load environment variables
load_dotenv()

def create_app():
    # Configure static folder to point to frontend build
    app = Flask(__name__, static_folder='../frontend/dist', static_url_path='')
    CORS(app) # Simplifies dev, but in prod same-origin applies
    
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
        return app.send_static_file('index.html')

    @app.route('/<path:path>')
    def serve_static(path):
        # Check if file exists in static folder
        full_path = os.path.join(app.static_folder, path)
        if os.path.exists(full_path):
            return app.send_static_file(path)
        # Fallback to index.html for React Router
        return app.send_static_file('index.html')

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

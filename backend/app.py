import os
from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from flask_login import LoginManager
from models import db, User

# Load environment variables
load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}}) # Allow all origins for dev

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
        return jsonify({"message": "ChatIA Backend Running"})

    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)

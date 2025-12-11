import os
import requests
from flask import Blueprint, redirect, url_for, session, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from google_auth_oauthlib.flow import Flow
from models import db, User

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')

# Bypass HTTPS requirement for local development
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET')
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

def get_google_provider_cfg():
    return requests.get(GOOGLE_DISCOVERY_URL).json()

@auth_bp.route('/login')
def login():
    # Configuration for OAuth Flow
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "project_id": "chatia-project",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": GOOGLE_CLIENT_SECRET,
            "redirect_uris": ["http://localhost:5000/auth/callback", "https://chatia.onrender.com/auth/callback"]
        }
    }
    
    # Create Flow
    flow = Flow.from_client_config(
        client_config,
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
    )
    
    # The URI must match one of the redirect_uris in the client_config
    if os.environ.get('FLASK_ENV') == 'production':
        flow.redirect_uri = "https://chatia.onrender.com/auth/callback"
    else:
        flow.redirect_uri = url_for('auth.callback', _external=True)

    authorization_url, state = flow.authorization_url()
    session['state'] = state
    return redirect(authorization_url)

@auth_bp.route('/callback')
def callback():
    client_config = {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "project_id": "chatia-project",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": GOOGLE_CLIENT_SECRET
        }
    }

    flow = Flow.from_client_config(
        client_config,
        scopes=["openid", "https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"],
        state=session['state']
    )
    
    if os.environ.get('FLASK_ENV') == 'production':
        flow.redirect_uri = "https://chatia.onrender.com/auth/callback"
    else:
        flow.redirect_uri = url_for('auth.callback', _external=True)

    flow.fetch_token(authorization_response=request.url)

    credentials = flow.credentials
    request_session = requests.session()
    token_request = google.auth.transport.requests.Request(session=request_session)

    # Note: verify_id_token verification needs google-auth package
    from google.oauth2 import id_token
    import google.auth.transport.requests

    id_info = id_token.verify_oauth2_token(
        id_token=credentials._id_token,
        request=google.auth.transport.requests.Request(),
        audience=GOOGLE_CLIENT_ID
    )

    google_id = id_info.get("sub")
    email = id_info.get("email")
    name = id_info.get("name")
    picture = id_info.get("picture")

    user = User.query.filter_by(google_id=google_id).first()
    
    if not user:
        # Check if user with this email exists (maybe from different provider in future, but now unique)
        user = User.query.filter_by(email=email).first()
        if not user:
            user = User(
                google_id=google_id, 
                email=email, 
                name=name, 
                profile_pic=picture
            )
            # Check admin
            if email == "correodefranciscovalero@gmail.com":
                user.is_admin = True
            
            db.session.add(user)
    else:
        # Update info
        user.name = name
        user.profile_pic = picture
    
    db.session.commit()
    
    login_user(user)
    
    # Redirect to Frontend
    # Local: http://localhost:5173
    # Prod: https://chatia.onrender.com
    if os.environ.get('FLASK_ENV') == 'production':
        return redirect("https://chatia.onrender.com")
    else:
        return redirect("http://localhost:5173")

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"success": True})

@auth_bp.route('/check')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            "authenticated": True, 
            "user": {
                "id": current_user.id,
                "name": current_user.name,
                "email": current_user.email,
                "profile_pic": current_user.profile_pic,
                "is_admin": current_user.is_admin
            }
        })
    else:
        return jsonify({"authenticated": False})

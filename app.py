from flask import Flask, send_from_directory, send_file, redirect, url_for, session, jsonify, request
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os
import secrets

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# Configure CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:5173", "http://localhost:3000", os.environ.get('FRONTEND_URL', '*')],
        "supports_credentials": True
    }
})

# Configure OAuth
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id=os.environ.get('GOOGLE_CLIENT_ID'),
    client_secret=os.environ.get('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# API Routes
@app.route('/api/auth/google')
def google_login():
    redirect_uri = url_for('google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/api/auth/google/callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        user_info = token.get('userinfo')

        if user_info:
            session['user'] = {
                'id': user_info.get('sub'),
                'email': user_info.get('email'),
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'is_admin': False  # You can add admin logic here
            }
            # Redirect to frontend after successful login
            return redirect('/')
        else:
            return redirect('/login?error=no_user_info')
    except Exception as e:
        print(f"Error in Google callback: {str(e)}")
        return redirect('/login?error=auth_failed')

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@app.route('/api/auth/me')
def get_current_user():
    user = session.get('user')
    if user:
        return jsonify(user), 200
    return jsonify({'error': 'Not authenticated'}), 401

# Catch-all route for frontend - Must be at the end
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_static(path):
    # Don't intercept API routes
    if path.startswith('api/'):
        return jsonify({'error': 'Not found'}), 404

    # If path is empty, serve index.html
    if path == '':
        return send_file('frontend/dist/index.html')

    # Try to serve the file from frontend/dist
    file_path = os.path.join('frontend/dist', path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory('frontend/dist', path)

    # If file doesn't exist, return index.html for React Router
    return send_file('frontend/dist/index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)

from flask import Flask, send_from_directory, send_file, redirect, url_for, session, jsonify, request, Blueprint
from flask_cors import CORS
from authlib.integrations.flask_client import OAuth
import os
import secrets
import google.generativeai as genai

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(32))

# Configure Gemini API
gemini_api_key = os.environ.get('GEMINI_API_KEY')
if gemini_api_key:
    genai.configure(api_key=gemini_api_key)

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

# API Blueprint
api = Blueprint('api', __name__, url_prefix='/api')

@api.route('/auth/google')
def google_login():
    redirect_uri = url_for('api.google_callback', _external=True)
    return google.authorize_redirect(redirect_uri)

@api.route('/auth/google/callback')
def google_callback():
    try:
        token = google.authorize_access_token()
        user_info = token.get('userinfo')

        if user_info:
            user_email = user_info.get('email')
            session['user'] = {
                'id': user_info.get('sub'),
                'email': user_email,
                'name': user_info.get('name'),
                'picture': user_info.get('picture'),
                'is_admin': user_email == 'correodefranciscovalero@gmail.com'
            }
            # Redirect to frontend after successful login
            return redirect('/')
        else:
            return redirect('/login?error=no_user_info')
    except Exception as e:
        print(f"Error in Google callback: {str(e)}")
        return redirect('/login?error=auth_failed')

@api.route('/auth/logout', methods=['POST'])
def logout():
    session.pop('user', None)
    return jsonify({'message': 'Logged out successfully'}), 200

@api.route('/auth/me')
def get_current_user():
    user = session.get('user')
    if user:
        return jsonify(user), 200
    return jsonify({'error': 'Not authenticated'}), 401

@api.route('/chat/message', methods=['POST'])
def send_chat_message():
    print("=" * 50)
    print("📨 Received chat message request")
    try:
        data = request.get_json()
        print(f"📝 Request data: {data}")

        message = data.get('message')
        chat_id = data.get('chat_id')

        print(f"💬 Message: {message}")
        print(f"🆔 Chat ID: {chat_id}")

        if not message:
            print("❌ No message provided")
            return jsonify({'error': 'Message is required'}), 400

        # Check if Gemini API is configured
        if not gemini_api_key:
            print("❌ Gemini API key not configured")
            return jsonify({'error': 'Gemini API key not configured'}), 500

        print("✅ Gemini API key is configured")
        print("🤖 Calling Gemini API...")

        # Generate response using Gemini
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(message)

        print(f"✅ Gemini response received: {response.text[:100]}...")

        result = {
            'response': response.text,
            'chat_id': chat_id
        }

        print(f"📤 Sending response back to client")
        print("=" * 50)

        return jsonify(result), 200

    except Exception as e:
        print(f"❌ Error generating AI response: {str(e)}")
        import traceback
        print(f"❌ Traceback: {traceback.format_exc()}")
        print("=" * 50)
        return jsonify({'error': f'Failed to generate response: {str(e)}'}), 500

# Register API Blueprint
app.register_blueprint(api)

# Catch-all route for frontend - Must be registered AFTER API Blueprint
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    dist_dir = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')

    # Try to serve the file from frontend/dist
    if path != '':
        file_path = os.path.join(dist_dir, path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return send_from_directory(dist_dir, path)

    # Otherwise, serve index.html for React Router
    index_path = os.path.join(dist_dir, 'index.html')
    if os.path.exists(index_path):
        return send_file(index_path)
    else:
        return f"Error: index.html not found at {index_path}", 404

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)

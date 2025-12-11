from flask import Flask, send_from_directory, send_file
import os

app = Flask(__name__, static_folder='frontend/dist', static_url_path='')

@app.route('/')
def serve_index():
    return send_file('frontend/dist/index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Try to serve the file
    file_path = os.path.join('frontend/dist', path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return send_from_directory('frontend/dist', path)
    # If file doesn't exist, return index.html (for React Router)
    return send_file('frontend/dist/index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)

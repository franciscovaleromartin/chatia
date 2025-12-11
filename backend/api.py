from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from models import db, User, Chat, ChatParticipant, Message, Settings
from datetime import datetime

api_bp = Blueprint('api', __name__, url_prefix='/api')

@api_bp.route('/me')
@login_required
def me():
    return jsonify({
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "profile_pic": current_user.profile_pic,
        "is_admin": current_user.is_admin
    })

@api_bp.route('/user/update', methods=['POST'])
@login_required
def update_user():
    data = request.json
    name = data.get('name')
    profile_pic = data.get('profile_pic')
    
    if name:
        current_user.name = name
    if profile_pic:
        current_user.profile_pic = profile_pic
        
    db.session.commit()
    return jsonify({"success": True})

# --- Chat Routes ---

@api_bp.route('/chats', methods=['GET'])
@login_required
def get_chats():
    # Get chats where current user is a participant
    # This query might be complex in pure SQLAlchmey without correct joins
    # Using relationship:
    participations = ChatParticipant.query.filter_by(user_id=current_user.id).all()
    chats = []
    for p in participations:
        chat = p.chat
        # Find other participant (assuming 1-on-1 or group, but UI implies list)
        # For simplicity, returning chat details
        last_message = Message.query.filter_by(chat_id=chat.id).order_by(Message.timestamp.desc()).first()
        chats.append({
            "id": chat.id,
            "name": chat.name,
            "last_message": last_message.content if last_message else "",
            "last_message_time": last_message.timestamp.isoformat() if last_message else None
        })
    return jsonify(chats)

@api_bp.route('/chats', methods=['POST'])
@login_required
def create_chat():
    data = request.json
    name = data.get('name', 'New Chat')
    
    chat = Chat(name=name)
    db.session.add(chat)
    db.session.flush()
    
    # Add creator
    participant = ChatParticipant(user_id=current_user.id, chat_id=chat.id)
    db.session.add(participant)
    
    db.session.commit()
    return jsonify({"id": chat.id, "name": chat.name})

@api_bp.route('/chats/<int:chat_id>/messages', methods=['GET'])
@login_required
def get_messages(chat_id):
    # Check participation
    p = ChatParticipant.query.filter_by(user_id=current_user.id, chat_id=chat_id).first()
    if not p and not current_user.is_admin: # Admins maybe can see all?
         return jsonify({"error": "Unauthorized"}), 403
         
    messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.timestamp.asc()).all()
    return jsonify([{
        "id": m.id,
        "content": m.content,
        "sender_id": m.sender_id, # 'AI' or user_id
        "timestamp": m.timestamp.isoformat(),
        "image_url": m.image_url
    } for m in messages])

from ai_service import get_ai_response, should_ai_respond

@api_bp.route('/chats/<int:chat_id>/messages', methods=['POST'])
@login_required
def send_message(chat_id):
    # Check participation
    p = ChatParticipant.query.filter_by(user_id=current_user.id, chat_id=chat_id).first()
    if not p:
         return jsonify({"error": "Unauthorized"}), 403
         
    data = request.json
    content = data.get('content')
    image_url = data.get('image_url')
    
    if not content and not image_url:
        return jsonify({"error": "Empty message"}), 400
        
    msg = Message(
        chat_id=chat_id,
        sender_id=str(current_user.id),
        content=content,
        image_url=image_url
    )
    db.session.add(msg)
    db.session.commit()
    
    # Check AI Response
    chat = Chat.query.get(chat_id)
    if chat.ai_enabled and should_ai_respond(chat_id):
        ai_text = get_ai_response(chat_id)
        ai_msg = Message(
            chat_id=chat_id,
            sender_id='AI',
            content=ai_text
        )
        db.session.add(ai_msg)
        db.session.commit()
    
    return jsonify({
        "id": msg.id,
        "content": msg.content,
        "sender_id": msg.sender_id,
        "timestamp": msg.timestamp.isoformat()
    })

@api_bp.route('/chats/<int:chat_id>/ai', methods=['POST'])
@login_required
def toggle_ai(chat_id):
    # Check participation
    p = ChatParticipant.query.filter_by(user_id=current_user.id, chat_id=chat_id).first()
    if not p:
         return jsonify({"error": "Unauthorized"}), 403
         
    data = request.json
    enabled = data.get('enabled')
    
    chat = Chat.query.get(chat_id)
    chat.ai_enabled = enabled
    db.session.commit()
    
    return jsonify({"success": True, "ai_enabled": chat.ai_enabled})

# --- Admin Routes ---

@api_bp.route('/admin/settings', methods=['GET'])
@login_required
def get_settings():
    if not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403
        
    settings = Settings.query.all()
    return jsonify({s.key: s.value for s in settings})

@api_bp.route('/admin/settings', methods=['POST'])
@login_required
def update_settings():
    if not current_user.is_admin:
        return jsonify({"error": "Forbidden"}), 403
        
    data = request.json
    for key, value in data.items():
        setting = Settings.query.filter_by(key=key).first()
        if not setting:
            setting = Settings(key=key, value=str(value)) # Store as string
            db.session.add(setting)
        else:
            setting.value = str(value)
            
    db.session.commit()
    return jsonify({"success": True})

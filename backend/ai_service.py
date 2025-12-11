import os
import google.generativeai as genai
from models import db, Message, Settings, User

# Configure Gemini
genai.configure(api_key=os.environ.get('GEMINI_API_KEY'))

def get_ai_response(chat_id, history_limit=20):
    try:
        # Get AI settings
        personality_setting = Settings.query.filter_by(key='ai_personality').first()
        personality = personality_setting.value if personality_setting else "Helpful and polite"
        
        # Get chat history
        messages = Message.query.filter_by(chat_id=chat_id).order_by(Message.timestamp.desc()).limit(history_limit).all()
        messages.reverse() # Oldest first
        
        # Build prompt
        prompt = f"You are a helpful AI assistant in a group chat. Your personality is: {personality}.\n\nChat History:\n"
        
        for msg in messages:
            sender_name = "User"
            if msg.sender_id != 'AI':
                user = User.query.get(int(msg.sender_id))
                if user:
                    sender_name = user.name
            else:
                sender_name = "AI"
            
            prompt += f"{sender_name}: {msg.content}\n"
            
        prompt += "AI:"
        
        model = genai.GenerativeModel('gemini-pro')
        response = model.generate_content(prompt)
        
        return response.text
    except Exception as e:
        print(f"Error generating AI response: {e}")
        return "Sorry, I'm having trouble thinking right now."

def should_ai_respond(chat_id):
    # Check frequency setting
    freq_setting = Settings.query.filter_by(key='ai_frequency').first()
    frequency = int(freq_setting.value) if freq_setting else 5
    
    # Count messages since last AI response
    # This is a simple implementation. 
    # Better: count all messages, if count % frequency == 0? 
    # Or count messages since last 'AI' message.
    
    last_ai_msg = Message.query.filter_by(chat_id=chat_id, sender_id='AI').order_by(Message.timestamp.desc()).first()
    
    if last_ai_msg:
        # Count messages after this one
        count = Message.query.filter(Message.chat_id == chat_id, Message.timestamp > last_ai_msg.timestamp).count()
    else:
        # Count all messages
        count = Message.query.filter_by(chat_id=chat_id).count()
        
    return count >= frequency

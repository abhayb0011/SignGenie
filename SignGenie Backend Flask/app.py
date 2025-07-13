import cv2
import numpy as np
import mediapipe as mp
from flask import Flask, jsonify, request
from flask_cors import CORS
import os
import tensorflow as tf
from tensorflow import keras
from db import mongo
import jwt
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from models.user_schema import create_user_document
from models.contactUsMessage_schema import create_contact_message_document
from waitress import serve
from dotenv import load_dotenv
import traceback
#from waitress import serve

load_dotenv()  # load variables from .env

SECRET_KEY = os.getenv('SECRET_KEY')

DEBUG_MODE = False  # Set to False in production mode

app = Flask(__name__)
app.config["MONGO_URI"] = os.environ.get("MONGO_URI")
CORS(app, supports_credentials=True)

# Load the ML Model
model_path = './action.h5' 
if os.path.exists(model_path):
    model = keras.models.load_model(model_path)  # Load the model
else:
    raise FileNotFoundError(f"Model file '{model_path}' not found.")

# Initialize MediaPipe Models
mp_holistic = mp.solutions.holistic  # Holistic model
mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

# Extract Keypoints Function
def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

# MediaPipe Detection
def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results

# Draw Landmarks Function
def draw_styled_landmarks(image, results):
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

# Flask Routes
@app.route('/')
def index():
    return {"message": "Welcome to the Flask API!"}

def generate_token(email):
    payload = {
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=1) 
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload['email']
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        # Validate all fields are present
        if not all([name, username, email, password]):
            return jsonify({'error': 'All fields (name, username, email, password) are required'}), 400

        # Check if email or username already exists
        if mongo.db.users.find_one({'email': email}):
            return jsonify({'error': 'Email already exists'}), 409
        if mongo.db.users.find_one({'username': username}):
            return jsonify({'error': 'Username already exists'}), 409

        # Hash the password
        hashed_password = generate_password_hash(password)

        # Create user document
        user_doc = create_user_document(name, username, email, hashed_password)

        # Insert into DB
        result = mongo.db.users.insert_one(user_doc)

        if result.inserted_id:
            return jsonify({'message': 'User registered successfully'}), 201
        else:
            return jsonify({'error': 'User registration failed'}), 400

    except Exception as e:
        print(f"Registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json(force=True)

        if not data:
            return jsonify({'error': 'Missing JSON body'}), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Missing email or password'}), 400

        user = mongo.db.users.find_one({'email': email})
        if user and check_password_hash(user['password'], password):
            token = jwt.encode({
                'email': user['email'],
                'exp': datetime.now(timezone.utc) + timedelta(hours=24)
            }, SECRET_KEY, algorithm='HS256')

            return jsonify({
                'message': 'Login successful',
                'token': token
            }), 200
        else:
            return jsonify({'error': 'Invalid email or password'}), 401

    except Exception as e:
        return jsonify({'error': {str(e)}}), 500


@app.route('/profile', methods=['GET'])
def get_profile():
    try:
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or invalid"}), 401

        token = auth_header.split(" ")[1]
        email = verify_token(token)

        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        user = mongo.db.users.find_one({"email": email})

        if not user:
            return jsonify({"error": "User not found"}), 404

        user_profile = {
            "email": user["email"],
            "name": user.get("name", ""),
            "username": user.get("username", ""),
            "sign_history": user.get("sign_history", []),
            "quiz_high_score": user.get("quiz_high_score", 0),
            "created_at": user.get("created_at")
        }

        return jsonify(user_profile), 200

    except Exception as e:
        print("error:", e)
        return jsonify({"error": {str(e)}}), 501


@app.route('/update-profile', methods=['PUT'])
def update_profile():
    try:
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401

        token = auth_header.split(" ")[1]

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            email = decoded_token.get('email')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        if not email:
            return jsonify({'error': 'Token missing email field'}), 401

        data = request.get_json()
        new_name = data.get('name')
        new_username = data.get('username')

        if not new_name and not new_username:
            return jsonify({'error': 'No update fields provided'}), 400

        user = mongo.db.users.find_one({'email': email})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if new_username:
            username_conflict = mongo.db.users.find_one({
                'username': new_username,
                'email': {'$ne': email}
            })
            if username_conflict:
                return jsonify({'error': 'Username already taken'}), 409

        update_fields = {}
        if new_name:
            update_fields['name'] = new_name
        if new_username:
            update_fields['username'] = new_username

        mongo.db.users.update_one({'email': email}, {'$set': update_fields})

        updated_user = mongo.db.users.find_one({'email': email})
        updated_profile = {
            "email": updated_user["email"],
            "username": updated_user.get("username", ""),
            "name": updated_user.get("name", ""),
            "sign_history": updated_user.get("sign_history", []),
            "quiz_high_score": updated_user.get("quiz_high_score", 0),
            "created_at": updated_user.get("created_at").isoformat() if updated_user.get("created_at") else None
        }

        return jsonify({
            'message': 'Profile updated successfully',
            'profile': updated_profile
        }), 200

    except Exception as e:
        return jsonify({'error': {str(e)}}), 500


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        # JWT token expected in the headers
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'error': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            current_user = mongo.db.users.find_one({'username': data['username']})
        except Exception as e:
            return jsonify({'error': 'Token is invalid or expired!', 'details': str(e)}), 403

        return f(current_user, *args, **kwargs)

    return decorated

# Initialize MediaPipe Holistic once to avoid re-initialization
mp_holistic = mp.solutions.holistic
mp_holistic_model = mp_holistic.Holistic(
    static_image_mode=False,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5
)

# per-user buffers & state
sequence_map = {}   # email → list of last 30 keypoint arrays
user_state   = {}   # email → {
                    #    "last_displayed": str or None,
                    #    "candidate":      str or None,
                    #    "count":          int
                    # }

# config
WINDOW_LEN           = 30
CONFIDENCE_THRESHOLD = 0.6
REQUIRED_CONS_COUNT  = 3

ACTIONS = ["hello", "thankyou", "I love you", "yes", "no"]

@app.route('/predict-frame', methods=['POST'])
def predict_frame():
    try:
        # 1) Auth
        auth = request.headers.get('Authorization', '')
        if not auth.startswith("Bearer "):
            return jsonify({'error':'Missing/invalid token'}), 401
        token = auth.split(" ",1)[1]
        email = verify_token(token)
        if not email:
            return jsonify({'error':'Invalid or expired token'}), 401

        # 2) Read image
        if 'image' not in request.files:
            return jsonify({'error':'No image provided'}), 400
        file_bytes = np.frombuffer(request.files['image'].read(), np.uint8)
        img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
        if img is None:
            return jsonify({'error':'Invalid image'}), 400

        # 3) Keypoint extraction
        img, results = mediapipe_detection(img, mp_holistic_model)
        kp = extract_keypoints(results)

        # 4) Update frame buffer
        seq = sequence_map.setdefault(email, [])
        seq.append(kp)
        if len(seq) > WINDOW_LEN:
            seq.pop(0)
        sequence_map[email] = seq

        # 5) Only predict once we have WINDOW_LEN frames
        if len(seq) < WINDOW_LEN:
            # on cold start, show waiting once; store in state so you don't repeat
            st = user_state.setdefault(email, {'last_displayed': None, 'candidate': None, 'count': 0})
            if st['last_displayed'] is None:
                st['last_displayed'] = 'Waiting for enough frames...'
                return jsonify({'prediction': st['last_displayed'], 'confidence': 0.0}), 202
            else:
                return jsonify({'prediction': st['last_displayed'], 'confidence': 0.0}), 202

        # 6) Run model
        input_seq = np.expand_dims(seq, axis=0)  # shape (1,30,features)
        res       = model.predict(input_seq, verbose=0)[0]
        idx       = int(np.argmax(res))
        conf      = float(np.max(res))
        label     = ACTIONS[idx]

        st = user_state.setdefault(email, {'last_displayed': None, 'candidate': None, 'count': 0})

        # 7) Confidence gate
        if conf < CONFIDENCE_THRESHOLD:
            # too low: just return last displayed
            return jsonify({'prediction': st['last_displayed'], 'confidence': conf}), 202

        # 8) Candidate counting
        if st['candidate'] == label:
            st['count'] += 1
        else:
            st['candidate'] = label
            st['count']     = 1

        # 9) Emit when stable
        if st['count'] >= REQUIRED_CONS_COUNT:
            # switch to new sign
            st['last_displayed'] = label
            # reset for next detection
            st['candidate'], st['count'] = None, 0
            # clear buffer so next sign starts fresh
            sequence_map[email] = []
            return jsonify({'prediction': label, 'confidence': conf}), 200

        # 10) otherwise: still collecting, return last_displayed
        return jsonify({'prediction': st['last_displayed'], 'confidence': conf}), 202

    except Exception as e:
        print(f"[predict-frame error] {e}")
        traceback.print_exc()
        return jsonify({'error':'Internal server error'}), 500


@app.route('/sign-history', methods=['POST'])
def update_sign_history():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({'error': 'Authorization token missing or invalid'}), 401

        token = auth_header.split(" ")[1]
        email = verify_token(token)

        if not email:
            return jsonify({'error': 'Invalid or expired token'}), 401

        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({"msg": "User not found"}), 404

        data = request.get_json()
        new_sign = data.get("sign")

        # Skip if no sign
        if not new_sign:
            return jsonify({"msg": "Invalid or placeholder sign, not added"}), 200

        history = user.get("sign_history", [])

        # Only add the new sign if it's not the same as the last one
        if not history or history[-1] != new_sign:
            history.append(new_sign)
            history = history[-10:]  # Keep only the last 10 entries

            mongo.db.users.update_one({"email": email}, {"$set": {"sign_history": history}})
            return jsonify({"msg": "Sign history updated", "sign_history": history}), 200
        else:
            return jsonify({"msg": "Same as last sign, not added", "sign_history": history}), 200

    except Exception as e:
        print(f"/sign-history error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/update-high-score', methods=['PUT'])
def update_high_score():
    try:
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({'error': 'Authorization token missing or invalid'}), 401

        token = auth_header.split(" ")[1]
        email = verify_token(token)

        if not email:
            return jsonify({'error': 'Invalid or expired token'}), 401

        user = mongo.db.users.find_one({"email": email})
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        new_score = data.get('score')

        if new_score is None or not isinstance(new_score, int):
            return jsonify({'error': 'Invalid score'}), 400

        current_high_score = user.get('quiz_high_score', 0)

        if new_score > current_high_score:
            mongo.db.users.update_one(
                {"email": email},
                {"$set": {"quiz_high_score": new_score}}
            )
            return jsonify({'message': 'High score updated', 'quiz_high_score': new_score}), 200
        else:
            return jsonify({'message': 'Score not higher than current high score', 'quiz_high_score': current_high_score}), 200

    except Exception as e:
        print(f"/update-high-score error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/contact', methods=['POST'])
def contact_us():
    try:
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({'error': 'Authorization header missing or invalid'}), 401

        token = auth_header.split(" ")[1]

        try:
            decoded_token = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
            email = decoded_token.get('email')
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401

        if not email:
            return jsonify({'error': 'Token missing email field'}), 401

        data = request.get_json()
        name = data.get('name')
        message = data.get('message')

        if not name or not message:
            return jsonify({'error': 'Name and message are required'}), 400

        contact_document = create_contact_message_document(name, email, message)
        mongo.db.contactUsMessages.insert_one(contact_document)

        return jsonify({
            'message': 'Message sent successfully',
            'contact': {
                'name': name,
                'email': email,
                'message': message,
                'submitted_at': contact_document['submitted_at'].isoformat()
            }
        }), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/signs', methods=['GET'])   # No JWT authentication because I want dictionary page to access signs even without login
def get_signs():
    try:
        signs_cursor = mongo.db.signs.find()
        signs = []

        for sign in signs_cursor:
            signs.append({
                "id": str(sign.get("_id")),
                "sign_name": sign.get("sign_name"),
                "video_url": sign.get("video_url"),
                "image_url": sign.get("image_url"),
                "description": sign.get("description"),
                "alphabet": sign.get("alphabet")
            })

        return jsonify(signs), 200

    except Exception as e:
        print(f"Sign fetch error:{str(e)}")
        return jsonify({'error': 'Internal server error'}), 500



#  Run Flask App
if __name__ == '__main__':
    try:
        #app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
        serve(app, port=8080, host="0.0.0.0")
    except Exception as e:
        import traceback
        print("Exception in main:")
        traceback.print_exc()



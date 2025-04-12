import cv2
import numpy as np
import mediapipe as mp
from flask import Flask, Response, jsonify, request
from flask_cors import CORS
import os
import tensorflow as tf
from db import mongo
import jwt
from datetime import datetime, timezone, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from functools import wraps
from models.user_schema import create_user_document
from models.contactUsMessage_schema import create_contact_message_document
from dotenv import load_dotenv
import gc
from waitress import serve

load_dotenv()  # load variables from .env

SECRET_KEY = os.getenv('SECRET_KEY')

DEBUG_MODE = False  # Set to False in production mode

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": ["https://signgenie.vercel.app"]}}, supports_credentials=True)

# Load the ML Model
model_path = './action.h5'
if os.path.exists(model_path):
    model = tf.keras.models.load_model(model_path)  # Load the model
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

"""
# Generator Function for Video Streaming
def gen():
    global sentence
    sequence = []
    sentence = []
    predictions = []
    actions = np.array(['hello', 'my', 'name', 'Abhay', 'Soham', 'Subhadeep', 'Thank you', 'I love you'])
    threshold = 0.74

    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while True:
            success, frame = cap.read()
            if not success:
                break

            # MediaPipe Detection
            image, results = mediapipe_detection(frame, holistic)

            # Skip Landmark Drawing on video in Production
            if DEBUG_MODE:
                draw_styled_landmarks(image, results)

            # Extract Keypoints
            keypoints = extract_keypoints(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]

            # Prediction
            if len(sequence) == 30:
                try:
                    res = model.predict(np.expand_dims(sequence, axis=0))[0]
                    predicted_action = actions[np.argmax(res)]

                    predictions.append(np.argmax(res))
                    predictions = predictions[-10:]

                    if np.bincount(predictions).argmax() == np.argmax(res) and res[np.argmax(res)] > threshold:
                        if not sentence or (predicted_action != sentence[-1]):
                            sentence = [predicted_action]
                except Exception as e:
                    print(f"Error in prediction: {e}")
                    sentence = ["Error"]

            # Skip Prediction printing on video in Production mode
            if DEBUG_MODE:
                cv2.putText(image, sentence[0] if sentence else "Waiting...", (3, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

            # Encode Frame to Byte Format
            ret, buffer = cv2.imencode('.jpg', image)
            frame_bytes = buffer.tobytes()

            # Release Memory
            del frame, buffer  

            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

"""

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

@app.route('/predict-frame', methods=['POST'])
def predict_frame():
    try:
        # --- Token Validation ---
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization token missing or invalid"}), 401

        token = auth_header.split(" ")[1]
        email = verify_token(token)
        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        # --- Image Parsing ---
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']
        file_bytes = np.frombuffer(file.read(), np.uint8)
        image = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

        if image is None:
            return jsonify({'error': 'Invalid image data'}), 400

        # --- MediaPipe Detection ---
        with mp_holistic.Holistic(static_image_mode=False, 
                                  min_detection_confidence=0.5, 
                                  min_tracking_confidence=0.5) as holistic:
            image, results = mediapipe_detection(image, holistic)
            keypoints = extract_keypoints(results)

        # --- Sequence Handling ---
        if not hasattr(predict_frame, 'sequence_map'):
            predict_frame.sequence_map = {}

        # Maintain per-user sequence (using email)
        sequence = predict_frame.sequence_map.get(email, [])
        sequence.append(keypoints)
        sequence = sequence[-30:]  # keep only last 30
        predict_frame.sequence_map[email] = sequence  # update user-specific sequence

        if len(sequence) == 30:
            res = model.predict(np.expand_dims(sequence, axis=0))[0]
            actions = np.array(['hello', 'my', 'name', 'Abhay', 'Soham', 'Subhadeep', 'Thank you', 'I love you'])
            predicted_action = actions[np.argmax(res)]
            confidence = res[np.argmax(res)]

            # Optional: Clear sequence to avoid memory buildup
            predict_frame.sequence_map[email] = []

            # Clean up
            del image, file, file_bytes, results, sequence, keypoints
            gc.collect()

            return jsonify({'prediction': predicted_action, 'confidence': float(confidence)}), 200
        else:
            # Clean up even in waiting case
            del image, file, file_bytes, keypoints
            gc.collect()
            return jsonify({'prediction': 'Waiting for enough frames...'}), 202

    except Exception as e:
        print(f"/predict-frame error: {str(e)}")
        traceback.print_exc()  # <-- prints full stack trace to the console
        return jsonify({'error': 'Internal server error'}), 500


    
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


"""
@app.route('/video')
def video():
    try:
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization header missing or invalid"}), 401

        token = auth_header.split(" ")[1]
        email = verify_token(token)

        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')
    except Exception as e:
        print(f"/video error: {e}")
        return jsonify({"error": "Internal server error"}), 500


@app.route('/prediction')
def prediction():
    global sentence
    try:
        auth_header = request.headers.get('Authorization')

        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"error": "Authorization token missing or invalid"}), 401

        token = auth_header.split(" ")[1]
        email = verify_token(token)

        if not email:
            return jsonify({"error": "Invalid or expired token"}), 401

        prediction_text = sentence[0] if sentence else "Waiting..."
        return jsonify({'prediction': prediction_text}), 200

    except Exception as e:
        print(f"/prediction error: {e}")
        return jsonify({'error': 'Internal server error'}), 500

"""
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
        # app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
        serve(app, port=8080, host="0.0.0.0")
    except Exception as e:
        import traceback
        print("Exception in main:")
        traceback.print_exc()



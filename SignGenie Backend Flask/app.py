import cv2
import numpy as np
import mediapipe as mp
from flask import Flask, render_template, Response, jsonify
from flask_cors import CORS
import os
import tensorflow as tf

app = Flask(__name__)
CORS(app)

<<<<<<< HEAD
# Initialize Video Capture (Webcam)
cap = cv2.VideoCapture(0)

# Load the ML Model
=======
# ✅ Initialize Video Capture (Webcam)
cap = cv2.VideoCapture(0)

# ✅ Load the ML Model
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
model_path = './action.h5'
if os.path.exists(model_path):
    model = tf.keras.models.load_model(model_path)  # Load the model
else:
    raise FileNotFoundError(f"Model file '{model_path}' not found.")

<<<<<<< HEAD
# Initialize MediaPipe Models
mp_holistic = mp.solutions.holistic  # Holistic model
mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

# Extract Keypoints Function
=======
# ✅ Initialize MediaPipe Models
mp_holistic = mp.solutions.holistic  # Holistic model
mp_drawing = mp.solutions.drawing_utils  # Drawing utilities

# ✅ Extract Keypoints Function
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
def extract_keypoints(results):
    pose = np.array([[res.x, res.y, res.z, res.visibility] for res in results.pose_landmarks.landmark]).flatten() if results.pose_landmarks else np.zeros(33*4)
    lh = np.array([[res.x, res.y, res.z] for res in results.left_hand_landmarks.landmark]).flatten() if results.left_hand_landmarks else np.zeros(21*3)
    rh = np.array([[res.x, res.y, res.z] for res in results.right_hand_landmarks.landmark]).flatten() if results.right_hand_landmarks else np.zeros(21*3)
    return np.concatenate([pose, lh, rh])

<<<<<<< HEAD
# MediaPipe Detection
=======
# ✅ MediaPipe Detection
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
def mediapipe_detection(image, model):
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    image.flags.writeable = False
    results = model.process(image)
    image.flags.writeable = True
    image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
    return image, results

<<<<<<< HEAD
# Draw Landmarks Function
=======
# ✅ Draw Landmarks Function
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
def draw_styled_landmarks(image, results):
    mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_holistic.POSE_CONNECTIONS)
    mp_drawing.draw_landmarks(image, results.left_hand_landmarks, mp_holistic.HAND_CONNECTIONS)
    mp_drawing.draw_landmarks(image, results.right_hand_landmarks, mp_holistic.HAND_CONNECTIONS)

<<<<<<< HEAD
# Generator Function for Video Streaming
=======
# ✅ Generator Function for Video Streaming
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
def gen():
    global sentence
    sequence = []
    sentence = []
    predictions = []
    actions = np.array(['hello', 'my', 'name', 'Abhay', 'Soham', 'Subhadeep', 'Thank you', 'I love you'])
    threshold = 0.56

    with mp_holistic.Holistic(min_detection_confidence=0.5, min_tracking_confidence=0.5) as holistic:
        while True:
            success, frame = cap.read()
            if not success:
                break

<<<<<<< HEAD
            # MediaPipe Detection
            image, results = mediapipe_detection(frame, holistic)
            draw_styled_landmarks(image, results)

            # Extract Keypoints
=======
            # ✅ MediaPipe Detection
            image, results = mediapipe_detection(frame, holistic)
            draw_styled_landmarks(image, results)

            # ✅ Extract Keypoints
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
            keypoints = extract_keypoints(results)
            sequence.append(keypoints)
            sequence = sequence[-30:]  # Keep only last 30 frames

<<<<<<< HEAD
            # Prediction
=======
            # ✅ Prediction
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
            if len(sequence) == 30:
                try:
                    res = model.predict(np.expand_dims(sequence, axis=0))[0]
                    predicted_action = actions[np.argmax(res)]

                    predictions.append(np.argmax(res))
                    predictions = predictions[-10:]  # Keep last 10 predictions

                    if np.bincount(predictions).argmax() == np.argmax(res) and res[np.argmax(res)] > threshold:
                        if not sentence or (predicted_action != sentence[-1]):
                            sentence = [predicted_action]
                except Exception as e:
                    print(f"Error in prediction: {e}")
                    sentence = ["Error"]

<<<<<<< HEAD
            # Display Prediction
            cv2.putText(image, sentence[0] if sentence else "Waiting...", (3, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

            # Encode Frame to Byte Format
            ret, buffer = cv2.imencode('.jpg', image)
            frame_bytes = buffer.tobytes()

            # Release Memory
=======
            # ✅ Display Prediction
            cv2.putText(image, sentence[0] if sentence else "Waiting...", (3, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2, cv2.LINE_AA)

            # ✅ Encode Frame to Byte Format
            ret, buffer = cv2.imencode('.jpg', image)
            frame_bytes = buffer.tobytes()

            # ✅ Release Memory
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
            del frame, buffer  

            yield (b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

<<<<<<< HEAD
# Flask Routes
=======
# ✅ Flask Routes
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/video')
def video():
    return Response(gen(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/prediction')
def prediction():
    global sentence
    return jsonify({'prediction': sentence[0] if sentence else "Waiting..."})

<<<<<<< HEAD
# Sign Language Dataset
=======
# ✅ Sign Language Dataset
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74
signs = [
    {"id": 1, "sign_name": "Hello", "video_url": "./static/Videos/Hello sign.mp4",
     "image_url": "./static/images/Signs/hello sign.jpg", "category": "Greetings",
     "description": "A simple wave to greet someone.", "alphabet": "H"},
    {"id": 2, "sign_name": "My", "video_url": "./static/Videos/my sign.mp4",
     "image_url": "./static/images/Signs/my sign.jpg", "category": "Pronouns",
     "description": "Place your hand on your chest to indicate 'My'.", "alphabet": "M"},
    {"id": 3, "sign_name": "Name", "video_url": "./static/Videos/name sign.mp4",
     "image_url": "./static/images/Signs/name sign.jpg", "category": "Identity",
     "description": "Tap two fingers of one hand on the other to sign 'Name'.", "alphabet": "N"},
    {"id": 4, "sign_name": "Abhay", "video_url": "./static/Videos/Abhay Sign.mp4",
     "image_url": "./static/images/Signs/abhay sign.png", "category": "Names",
     "description": "Sign for the name 'Abhay'.", "alphabet": "A"},
    {"id": 5, "sign_name": "Soham", "video_url": "./static/Videos/Soham sign.mp4",
     "image_url": "./static/images/Signs/Soham sign.png", "category": "Names",
     "description": "Sign for the name 'Soham'.", "alphabet": "S"},
    {"id": 6, "sign_name": "Subhadeep", "video_url": "./static/Videos/Subhadeep sign.mp4",
     "image_url": "./static/images/Signs/Subhadeep sign.png", "category": "Names",
     "description": "Sign for the name 'Subhadeep'.", "alphabet": "S"},
    {"id": 7, "sign_name": "Thank you", "video_url": "./static/Videos/Thank you sign.mp4",
     "image_url": "./static/images/Signs/thank you sign.jpg", "category": "Gratitude",
     "description": "Move your hand away from the chin to show gratitude.", "alphabet": "T"},
    {"id": 8, "sign_name": "I love you", "video_url": "./static/Videos/I love you sign.mp4",
     "image_url": "./static/images/Signs/I love you sign.jpg", "category": "Love",
     "description": "Use the 'ILY' hand shape to express love.", "alphabet": "I"}
]

@app.route('/signs', methods=['GET'])
def get_signs():
    return jsonify(signs)

<<<<<<< HEAD
#  Run Flask App
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if no PORT is set
    app.run(host="0.0.0.0", port=port, debug=False)  # Disable debug mode for memory efficiency
=======
# ✅ Run Flask App
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # Default to 5000 if no PORT is set
    app.run(host="0.0.0.0", port=port, debug=False)  # 🚀 Disable debug mode for memory efficiency
>>>>>>> 1a29761d313d853e08cb3581d291e64c9cedda74

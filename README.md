# 🤟 SignGenie

> **SignGenie** is a real‑time sign language recognition web application. It uses a React frontend for user interaction, a Flask backend to serve APIs and perform inference, and a TensorFlow LSTM model trained on MediaPipe-extracted keypoints.

---

## 📁 Project Structure

```plaintext
signgenie/
├── frontend/                 # React application
│   ├── public/
│   ├── src/
│   │   ├── App.js            # Main router
│   │   ├── App.css
│   │   ├── Pages/
│   │   │   ├── Home/
│   │   │   ├── Detection/
│   │   │   ├── Quiz/
│   │   │   ├── Dictionary/
│   │   │   ├── PrivacyPolicy/
│   │   │   ├── ContactUs/
│   │   │   ├── SignUp/
│   │   │   ├── Login/
│   │   │   ├── Profile/
│   │   │   └── UpdateProfile/
│   └── package.json
├── backend/                  # Flask API + model inference
│   ├── app.py                # Main Flask application
│   ├── models/
│   │   ├── user_schema.py
│   │   └── contactUsMessage_schema.py
│   ├── db.py                 # PyMongo connection
│   ├── action.h5             # Trained LSTM model file
│   ├── requirements.txt
│   └── .env                  # SECRET_KEY, MONGO_URI, etc.
├── sign language improved model/                     # contains code for model training
├── README.md                 # ← You are here
└── .gitignore

---

## 🔍 Overview

1. **Frontend (React)**  
   - Routes for Home, Detection, Quiz, Dictionary, PrivacyPolicy, ContactUs, SignUp, Login, Profile, UpdateProfile.  
   - Uses React Router v6, Axios for API calls, and CSS (with Material‑UI) for styling.
2. **Backend (Flask + MongoDB)**  
   - JWT‑based authentication (`/register`, `/login`, `/profile`, `/update-profile`).  
   - Real‑time frame prediction at `/predict-frame`.  
   - Sign history (`/sign-history`), quiz high score update, and contact messages.  
   - Public `/signs` endpoint for dictionary data.
3. **Model (TensorFlow + MediaPipe + LSTM)**  
   - MediaPipe Holistic to extract 258 keypoints per frame (pose + hands).  
   - LSTM network (4 layers + Dense) trained on 5 gesture classes.  
   - Sequence length: 30 frames; sequences per action: 40.

---

## 🔧 Prerequisites

- **Frontend:**  
  - Node.js ≥14, npm or yarn  
- **Backend & Model:**  
  - Python ≥3.8  
  - `pip install -r backend/requirements.txt`  

**Sample `backend/requirements.txt`:**
```text
flask
flask-cors
pymongo
python-dotenv
tensorflow==2.19.0
mediapipe
opencv-python
waitress
numpy
````

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/abhayb0011/signgenie.git
cd signgenie
```

### 2. Frontend

```bash
cd frontend
npm install
npm start
```

* The React app will run on `http://localhost:3000` by default.
* Configure the API base URL via `.env` (e.g. `VITE_APP_API_BASE_URL=http://localhost:8080`).

### 3. Backend

```bash
cd ../backend
cp .env.example .env
# Edit .env to set SECRET_KEY, MONGO_URI, etc.
pip install -r requirements.txt
python app.py
```

* The Flask API serves on `http://0.0.0.0:8080` by default (via Waitress).

---

## 🧠 Model Training & Inference

### Training (optional)

If you want to retrain:

1. Collect keypoints into `data/<action>/<sequence>/<frame>.npy` using the extraction script.
2. In a Python script:

   ```python
   import numpy as np
   from tensorflow.keras.models import Sequential
   from tensorflow.keras.layers import LSTM, Dense
   from tensorflow.keras.utils import to_categorical

   # load your sequences and labels
   X = np.load('X.npy')  # shape: (num_samples, 30, 258)
   y = to_categorical(np.load('Y.npy'))

   model = Sequential([
     LSTM(64, return_sequences=True, activation='relu', input_shape=(30,258)),
     LSTM(128, return_sequences=True, activation='relu'),
     LSTM(128, return_sequences=True, activation='relu'),
     LSTM(64, return_sequences=False, activation='relu'),
     Dense(64, activation='relu'),
     Dense(32, activation='relu'),
     Dense(y.shape[1], activation='softmax')
   ])
   model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
   model.fit(X, y, epochs=200, batch_size=16)
   model.save('action.h5')
   ```
3. Place the resulting `action.h5` in `backend/`.

### Inference Flow (in `app.py`)

1. Client posts a frame image to `/predict-frame` with Bearer token.
2. Backend:

   * Decodes image via OpenCV.
   * Runs MediaPipe Holistic to get landmarks.
   * Builds a rolling window of last 30 frames per user.
   * Feeds sequence to the LSTM model.
   * Returns JSON `{ prediction: <sign>, confidence: <0–1> }`.

---

## 🎯 Features

* **Real‑time detection** of 5 predefined gestures.
* **User accounts** with JWT auth, sign history & quiz scores.
* **Dictionary** of all gestures (no login required).
* **Responsive UI** for desktop & mobile.

---

## 👥 Contributors

* **Abhay Bhardwaj**
* **Soham Dalui**
* **Subhadeep Banik**

```
```

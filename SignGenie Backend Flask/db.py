from flask import Flask
from flask_pymongo import PyMongo
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# MongoDB connection using env variable
app.config["MONGO_URI"] = os.getenv("MONGO_URI")

# Initialize PyMongo
mongo = PyMongo(app)
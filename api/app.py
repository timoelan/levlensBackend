from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "images")
DB_FILE = os.path.join(BASE_DIR, "db.json")

@app.route("/api/images", methods=["GET"])
def get_images():
    with open(DB_FILE, "r") as f:
        data = json.load(f)
    return jsonify(data)

@app.route("/images/<path:filename>", methods=["GET"])
def get_image(filename):
    file_path = os.path.join(IMAGES_DIR, filename)
    print(f"Requesting file: {file_path}") 
    if os.path.exists(file_path):
        return send_from_directory(IMAGES_DIR, filename)
    else:
        print("File not found")  
        print(IMAGES_DIR)
        return "File not found", 404

if __name__ == "__main__":
    app.run(debug=True)
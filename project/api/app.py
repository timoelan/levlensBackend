from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
IMAGES_DIR = os.path.join(BASE_DIR, "../dropServer/images")

@app.route("/api/images", methods=["GET"])
def get_images():
    # Gibt eine Liste aller Bilder im "images"-Ordner zurück
    if not os.path.exists(IMAGES_DIR):
        return jsonify({"error": "Images directory not found"}), 404

    images = []
    for root, dirs, files in os.walk(IMAGES_DIR):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp')):
                relative_path = os.path.relpath(os.path.join(root, file), IMAGES_DIR)
                images.append(relative_path)

    return jsonify({"images": images})

@app.route("/images/<path:filename>", methods=["GET"])
def get_image(filename):
    # Liefert ein bestimmtes Bild aus dem "images"-Ordner
    file_path = os.path.join(IMAGES_DIR, filename)
    if os.path.exists(file_path):
        return send_from_directory(IMAGES_DIR, filename)
    else:
        return "File not found", 404

if __name__ == "__main__":
    app.run(debug=True)
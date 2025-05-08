from flask import Flask, request, jsonify
from flask_cors import CORS
import csv
from rapidfuzz import fuzz
import os
from PIL import Image, ImageDraw, ImageOps
import io
import base64


# Google Cloud Vision
from google.cloud import vision
from google.cloud.vision_v1 import types

# Start debug
print("Starting Flask app...")

app = Flask(__name__)
CORS(app)

# Create uploads folder
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Set Google Credentials
GOOGLE_CREDENTIAL_PATH = "vision-key.json"
if not os.path.exists(GOOGLE_CREDENTIAL_PATH):
    raise FileNotFoundError(f"Could not find {GOOGLE_CREDENTIAL_PATH}")
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = GOOGLE_CREDENTIAL_PATH

# Try to create the Vision client
try:
    vision_client = vision.ImageAnnotatorClient()
    print("Google Vision client initialized.")
except Exception as e:
    print("Error initializing Vision client:", e)


def load_book_list(filepath="book_list.csv"):
    phrases = []
    if not os.path.exists(filepath):
        print(f"Warning: {filepath} not found. No matches loaded.")
        return phrases
    with open(filepath, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            phrase = row.get("phrase")
            if phrase:
                phrases.append(phrase.strip())
    return phrases



def find_matches(ocr_text, phrases, threshold=80):
    matches = []
    for phrase in phrases:
        score = fuzz.partial_ratio(phrase.lower(), ocr_text.lower())
        if score > threshold:
            matches.append({
                "phrase": phrase,
                "score": score
            })
    return matches



@app.route('/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"message": "No image uploaded"}), 400

    image_file = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image_file.filename)
    image_file.save(image_path)

    # Fix orientation before OCR
    img = Image.open(image_path)
    img = ImageOps.exif_transpose(img).convert("RGB")
    img.save(image_path)

    # OCR
    with open(image_path, "rb") as img_file:
        content = img_file.read()

    image = vision.Image(content=content)
    response = vision_client.text_detection(image=image)

    if not response.text_annotations:
        return jsonify({"message": "No text detected.", "matches": []})

    annotations = response.text_annotations
    ocr_text = annotations[0].description

    phrases = load_book_list()
    all_matches = find_matches(ocr_text, phrases)

    # Draw boxes and get filtered matches that were actually found
    encoded_img, visual_matches, filtered_matches = draw_boxes_on_image(
        image_path, annotations, all_matches
    )

    return jsonify({
        "matches": filtered_matches,
        "highlighted_image": encoded_img,
        "visual_match_table": visual_matches
    })



def draw_boxes_on_image(image_path, annotations, matches):
    img = Image.open(image_path)
    img = ImageOps.exif_transpose(img).convert("RGB")
    draw = ImageDraw.Draw(img)

    match_phrases = [match["phrase"].lower() for match in matches]

    # Prepare OCR word list
    ocr_words = []
    for annotation in annotations[1:]:  # skip full block
        ocr_words.append({
            "text": annotation.description.lower(),
            "vertices": annotation.bounding_poly.vertices
        })

    visual_matches = []     # For the table
    drawn_phrases = set()   # Track which were actually drawn

    for phrase in match_phrases:
        phrase_tokens = phrase.split()
        phrase_len = len(phrase_tokens)

        for i in range(len(ocr_words) - phrase_len + 1):
            window = ocr_words[i:i + phrase_len]
            window_text = " ".join(word["text"] for word in window)

            score = fuzz.ratio(window_text, phrase)
            if score >= 85:
                all_x = [v.x for word in window for v in word["vertices"]]
                all_y = [v.y for word in window for v in word["vertices"]]

                pad = 20
                x1 = min(all_x) - pad
                y1 = min(all_y) - pad
                x2 = max(all_x) + pad
                y2 = max(all_y) + pad

                box = [(x1, y1), (x2, y1), (x2, y2), (x1, y2)]

                draw.line(box + [box[0]], width=20, fill="#a1fd32")
                draw.line(box + [box[0]], width=10, fill="#fd4a32")

                drawn_phrases.add(phrase)
                visual_matches.append({
                    "ocr_text": window_text,
                    "matched_phrase": phrase,
                    "score": score
                })

    img.save(image_path)

    with open(image_path, "rb") as img_file:
        encoded_image = base64.b64encode(img_file.read()).decode("utf-8")

    # Only return matches that were drawn
    filtered_matches = [
        match for match in matches if match["phrase"].lower() in drawn_phrases
    ]

    return encoded_image, visual_matches, filtered_matches




if __name__ == "__main__":
    app.run(debug=True, port=8000)

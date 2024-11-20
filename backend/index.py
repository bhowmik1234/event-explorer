from flask import Flask, render_template, jsonify, request
from backend import extract_webpage_data, details
from flask_cors import CORS  # Import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/', methods=['POST'])
def home():
    data = request.get_json()
    url = data.get('url')
    print(url)

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    try:
        # Extract data using the backend function
        extracted_data = extract_webpage_data(url)
        return jsonify({"data": extracted_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

@app.route('/detail', methods=['POST'])
def detail():
    data = request.get_json()
    text = data.get('text')
    print(text)

    if not text:
        return jsonify({"error": "No text provided"}), 400

    try:
        # Extract data using the backend function
        extracted_data = details(text)
        return jsonify({"data": extracted_data}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



if __name__ == '__main__':
    app.run(debug=True)

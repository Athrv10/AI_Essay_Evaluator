from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from openai import OpenAI, AuthenticationError
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
import os
import json
import re
from datetime import datetime, timezone
from dotenv import load_dotenv

# ─── Load environment ───────────────────────────────────────────────────────
load_dotenv()

# ─── Flask app ───────────────────────────────────────────────────────────────
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# ─── LLM API ─────────────────────────────────────────────────────────────────
api_key = os.getenv("OPENROUTER_API_KEY")
if not api_key:
    raise ValueError("OPENROUTER_API_KEY not found. Please set it in your .env file.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# ─── MongoDB (lazy init) ────────────────────────────────────────────────────────
mongo_uri = os.getenv("MONGO_URI")
if not mongo_uri:
    raise ValueError("MONGO_URI not found. Please set it in your .env file.")

_mongo_client = None
_essays_col   = None

def get_essays_col():
    """Return the essays collection, creating the MongoClient on first call."""
    global _mongo_client, _essays_col
    if _essays_col is None:
        _mongo_client = MongoClient(
            mongo_uri,
            serverSelectionTimeoutMS=8000,
            connectTimeoutMS=8000,
            socketTimeoutMS=8000,
        )
        _essays_col = _mongo_client["essay_db"]["essays"]
    return _essays_col


# ─── Helpers ──────────────────────────────────────────────────────────────────
def serialize_essay(essay: dict) -> dict:
    """Convert ObjectId to string so the dict is JSON-serializable."""
    essay["_id"] = str(essay["_id"])
    return essay


def score_to_grade(score: int) -> str:
    if score >= 93: return "A+"
    if score >= 87: return "A"
    if score >= 80: return "A-"
    if score >= 77: return "B+"
    if score >= 73: return "B"
    if score >= 70: return "B-"
    if score >= 65: return "C+"
    if score >= 60: return "C"
    return "D"


def generate_title(content: str, topic: str) -> str:
    """Generate a title from the topic or first words of the essay."""
    if topic and topic.strip():
        return topic.strip()[:80]
    words = content.split()
    return " ".join(words[:7]) + ("…" if len(words) > 7 else "")


def generate_summary(content: str) -> str:
    """Return first ~150 characters as a summary."""
    content = content.strip()
    return content[:150] + ("…" if len(content) > 150 else "")


def pick_icon(mode: str) -> str:
    icons = {"academic": "📖", "creative": "🎭", "ielts": "🎓", "standard": "📝"}
    return icons.get(mode, "📝")


# ─── Routes ───────────────────────────────────────────────────────────────────
@app.route('/')
def home():
    return render_template('index.html')


@app.route('/api/mark_essay', methods=['POST'])
def mark_essay():
    """
    Evaluate an essay using the LLM and store the result in MongoDB.

    Accepts JSON: { topic, content }   (also accepts essay_text for legacy)
    Returns: full essay document with _id as string
    """
    data = request.get_json(silent=True) or {}

    # Accept both 'content' (new) and 'essay_text' (legacy)
    content = (data.get('content') or data.get('essay_text') or '').strip()
    topic   = (data.get('topic') or 'General').strip()
    mode    = (data.get('mode') or 'standard').lower()

    if not content:
        return jsonify({"error": "No essay content provided."}), 400

    if len(content.split()) < 10:
        return jsonify({"error": "Essay is too short. Please provide at least 10 words."}), 400

    # ── LLM evaluation ────────────────────────────────────────────────────
    prompt = f"""You are an expert essay evaluator. Analyze the following essay and return ONLY a valid JSON object (no markdown, no extra text).

Essay Topic: {topic}
Evaluation Mode: {mode}

Essay:
{content}

Return this exact JSON structure:
{{
  "score": <integer 0-100>,
  "grade": "<letter grade A+/A/A-/B+/B/B-/C+/C/D/F>",
  "description": "<2-3 sentence overall assessment>",
  "tags": ["<strength1>", "<strength2>"],
  "grammar": <integer 0-100>,
  "coherence": <integer 0-100>,
  "vocabulary": <integer 0-100>,
  "relevance": <integer 0-100>,
  "structure": <integer 0-100>,
  "suggestions": [
    {{"type": "<category>", "icon": "<emoji>", "color": "<hex color>", "text": "<specific suggestion>"}},
    {{"type": "<category>", "icon": "<emoji>", "color": "<hex color>", "text": "<specific suggestion>"}},
    {{"type": "<category>", "icon": "<emoji>", "color": "<hex color>", "text": "<specific suggestion>"}}
  ]
}}

Use these colors: Grammar=#4F8EF7, Coherence=#F59E0B, Vocabulary=#9B5CF6, Structure=#22D3A5, Relevance=#F87171, Excellence=#F59E0B"""

    try:
        completion = client.chat.completions.create(
            model="nvidia/nemotron-nano-9b-v2:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        response_text = completion.choices[0].message.content.strip()

        # Extract JSON from the response (strip markdown fences if present)
        json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
        if json_match:
            llm_result = json.loads(json_match.group())
        else:
            llm_result = json.loads(response_text)

    except AuthenticationError as e:
        return jsonify({"error": f"API Authentication Error: {str(e)}"}), 401
    except json.JSONDecodeError:
        # Build a minimal fallback so the essay is still saved
        score = 70
        llm_result = {
            "score": score,
            "grade": score_to_grade(score),
            "description": "Evaluation complete. Full AI analysis was unavailable.",
            "tags": ["Writing"],
            "grammar": score, "coherence": score, "vocabulary": score,
            "relevance": score, "structure": score,
            "suggestions": [
                {"type": "AI Note", "icon": "🤖", "color": "#4F8EF7",
                 "text": "The AI evaluator returned an unstructured response. Please try again."}
            ]
        }
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    # ── Build the document to store ───────────────────────────────────────
    score = int(llm_result.get("score", 70))
    doc = {
        "title":    generate_title(content, topic),
        "summary":  generate_summary(content),
        "content":  content,
        "topic":    topic,
        "mode":     mode,
        "icon":     pick_icon(mode),
        "date":     datetime.now(timezone.utc).strftime("%b %d, %Y"),
        "date_iso": datetime.now(timezone.utc).isoformat(),
        "score":    score,
        "grade":    llm_result.get("grade") or score_to_grade(score),
        "description": llm_result.get("description", ""),
        "tags":     [t.lower() for t in llm_result.get("tags", [])],
        "breakdown": {
            "grammar":    int(llm_result.get("grammar",    score)),
            "coherence":  int(llm_result.get("coherence",  score)),
            "vocabulary": int(llm_result.get("vocabulary", score)),
            "relevance":  int(llm_result.get("relevance",  score)),
            "structure":  int(llm_result.get("structure",  score)),
        },
        "suggestions": llm_result.get("suggestions", []),
    }

    inserted = get_essays_col().insert_one(doc)
    doc["_id"] = str(inserted.inserted_id)

    return jsonify(doc), 201


@app.route('/api/essays', methods=['GET'])
def get_essays():
    """Return all essays sorted by latest first."""
    try:
        docs = list(get_essays_col().find().sort("date_iso", -1))
        return jsonify([serialize_essay(d) for d in docs])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/essay/<essay_id>', methods=['GET'])
def get_essay(essay_id):
    """Return a single essay by its MongoDB ObjectId."""
    try:
        oid = ObjectId(essay_id)
    except InvalidId:
        return jsonify({"error": "Invalid essay ID."}), 400

    try:
        doc = get_essays_col().find_one({"_id": oid})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

    if not doc:
        return jsonify({"error": "Essay not found."}), 404

    return jsonify(serialize_essay(doc))


# ─── Legacy route ─────────────────────────────────────────────────────────────
@app.route('/mark_essay', methods=['POST'])
def mark_essay_legacy():
    return mark_essay()


if __name__ == '__main__':
    app.run(debug=True, port=5000)

from flask import Flask, request, jsonify, render_template
from openai import OpenAI, AuthenticationError
import os
import json
import re
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__, static_folder='static', template_folder='templates')

# --- LLM API Setup ---
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    raise ValueError("OPENROUTER_API_KEY not found. Please set it in your .env file.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# --- Flask Routes ---
@app.route('/')
def home():
    """Renders the main EssayIQ HTML page."""
    return render_template('index.html')


@app.route('/api/mark_essay', methods=['POST'])
def mark_essay():
    """
    Receives an essay, topic, and mode from the frontend.
    Returns structured JSON with score, breakdown, and suggestions.
    """
    data = request.get_json()
    essay_text = data.get('essay_text', '').strip()
    topic = data.get('topic', 'General')
    mode = data.get('mode', 'standard')

    if not essay_text:
        return jsonify({"error": "No essay text provided."}), 400

    try:
        prompt = f"""You are an expert essay evaluator. Analyze the following essay and return ONLY a valid JSON object (no markdown, no extra text).

Essay Topic: {topic if topic else 'Not specified'}
Evaluation Mode: {mode}

Essay:
{essay_text}

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

        completion = client.chat.completions.create(
            model="nvidia/nemotron-nano-9b-v2:free",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )

        response_text = completion.choices[0].message.content.strip()

        # Try to parse JSON from response
        try:
            # Extract JSON if wrapped in markdown code blocks
            json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
            else:
                result = json.loads(response_text)
            return jsonify(result)
        except json.JSONDecodeError:
            # Fallback: return as critique text
            return jsonify({"critique": response_text, "score": 75})

    except AuthenticationError as e:
        return jsonify({"error": f"API Authentication Error: {str(e)}"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Legacy route (keep for backward compatibility)
@app.route('/mark_essay', methods=['POST'])
def mark_essay_legacy():
    return mark_essay()


if __name__ == '__main__':
    app.run(debug=True, port=5000)

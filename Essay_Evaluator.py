from flask import Flask, request, jsonify, render_template
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from the .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# --- LLM API Setup ---
# Get the API key from the environment variables
api_key = os.getenv("OPENROUTER_API_KEY")

if not api_key:
    # This will prevent the app from starting if the key is missing
    raise ValueError("OPENROUTER_API_KEY not found. Please set it in your .env file or as an environment variable.")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

# --- Flask Routes ---
@app.route('/')
def home():
    """A simple route to confirm the server is running."""
    return render_template('index.html')

@app.route('/mark_essay', methods=['POST'])
def mark_essay():
    """
    Receives an essay from the user, sends it to the LLM for marking,
    and returns the LLM's response.
    """
    data = request.get_json()
    essay_text = data.get('essay_text')

    if not essay_text:
        return jsonify({"error": "No essay text provided."}), 400

    try:
        # Define the enhanced prompt for the LLM
        prompt = (
    "You are an expert essay marker. Read the following essay carefully and provide a structured critique. "
    "Your response must strictly follow these specifications:\n\n"

    "1. Word Count: Your critique must be between 350 and 400 words.\n"
    "2. Number of Reasons: Identify and evaluate 2 to 3 main reasons in the essay. "
    "If 2–3 reasons are provided with relevant examples, mark this as very good.\n"
    "3. Clarity & Stand: Comment on whether the essay has a clear position or stand, "
    "and how consistently this is maintained.\n"
    "4. Relevance of Reasoning: Evaluate if the reasoning given supports the position effectively.\n"
    "5. Introduction: Assess the quality of the essay’s introduction (clarity, context, engagement).\n"
    "6. Conclusion: Assess the quality of the essay’s conclusion (summarization, reinforcement of position).\n\n"

    "Your critique must be structured in the following sections:\n\n"

    "### Overall Judgment\n"
    "- Provide 2–3 paragraphs describing the strengths and weaknesses of the essay.\n\n"

    "### What to Improve\n"
    "- Provide 3–4 specific, actionable suggestions. Use bullet points.\n\n"

    "### Explanation of the Final Score\n"
    "- Write 1 short paragraph explaining why the essay deserves the score, referring to the above criteria.\n\n"

    "### Final Score\n"
    "- Provide a single integer score from 1 to 10 on its own line. Do not add any extra words.\n\n"

    f"Essay to be marked: {essay_text}"
)


        # Make the API call to OpenRouter using your specified model
        completion = client.chat.completions.create(
            model="nvidia/nemotron-nano-9b-v2:free",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        llm_response = completion.choices[0].message.content
        return jsonify({"critique": llm_response})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)

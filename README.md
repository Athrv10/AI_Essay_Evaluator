🧠 AI Essay Evaluator

🔍 Overview

AI Essay Evaluator is a web-based application built with Flask that uses Large Language Models (LLMs) through the OpenRouter API to evaluate essays automatically. It provides structured feedback, highlights strengths and weaknesses, and assigns a score from 1–10 based on criteria like reasoning, clarity, and coherence.

This project demonstrates how AI can assist educators, students, and researchers in automating essay grading and providing personalized, detailed feedback within seconds.


🚀 Features

Accepts essay text input via a web interface or API.

Uses NVIDIA Nemotron Nano 9B (via OpenRouter API) for natural language evaluation.

Provides structured output with:

Overall Judgment

What to Improve

Explanation of Final Score

Final Score (1–10)

Error-handling for missing input or API issues.

Modular, extendable Flask structure for easy integration.


🏗️ Tech Stack

Python 3.10+

Flask – for backend and API endpoints

OpenRouter API (NVIDIA Nemotron Model) – for LLM-based essay evaluation

dotenv – to manage environment variables securely


📂 Project Structure 

AI_Essay_Evaluator/ │ ├── Essay_Evaluator.py # Main Flask application ├── templates/ │ └── index.html # Frontend interface for essay input ├── .env # Contains your OpenRouter API key └── requirements.txt # Python dependencies


⚙️ Installation & Setup

1.Clone the Repository

    git clone https://github.com/Emperors-data/AI_Essay_Evaluator.git
    cd AI_Essay_Evaluator
    
2.Create a Virtual Environment

    python -m venv venv
    source venv/bin/activate    # On Linux/Mac
    venv\Scripts\activate       # On Windows
    
3.Install Dependencies

    pip install -r requirements.txt
    
4.Add Your API Key

Create a .env file in the root directory and add your OpenRouter API key:

    OPENROUTER_API_KEY=your_api_key_here
    
5.Run the App

    python Essay_Evaluator.py

    
🧠 Example Use Case

Upload an essay or paste the text into the input form.

The system analyzes it and returns:

Strengths and weaknesses

Improvement points

A concise explanation of the score

A final numeric rating

This makes it ideal for students, teachers, and researchers looking for quick, AI-assisted evaluation.


📊 Future Enhancements

Add user authentication and essay history tracking.

Support for multiple evaluation models.

Integration with Google Docs / PDFs for direct uploads.

Visual dashboard using Power BI or Plotly Dash for insights.

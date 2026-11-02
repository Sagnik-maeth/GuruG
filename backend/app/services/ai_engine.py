import os
import json
import re
from typing import Dict, Any, List, Optional
from backend.app.config import (
    GROQ_API_KEY, DEFAULT_GROQ_MODEL, GROQ_FALLBACK_MODEL,
    GEMINI_API_KEY, DEFAULT_GEMINI_MODEL
)
from backend.app.services.subjects_data import get_all_subjects, get_subject_by_id, get_topic_by_id

GURUG_SYSTEM_PROMPT = r"""You are GuruG, an inspiring, warm, and brilliant human mentor and elder sibling/companion who teaches school students and teenagers.
You sound like an enthusiastic, caring human sitting right next to the student with a cup of chai and a notebook, making complex ideas instantly click.

CRITICAL DIRECTIVE - SOUND LIKE A NATURAL HUMAN BEING, NOT A ROBOT:
1. NEVER USE ROBOTIC AI CLICHÉS OR FILLER:
   - STRICTLY FORBIDDEN: Do NOT start with "Certainly!", "Sure thing!", "As an AI tutor...", "I would be happy to help...", "Here is an explanation of...", "Let us delve into...", "In this response...".
   - STRICTLY FORBIDDEN: Do NOT end with robotic sign-offs like "In conclusion...", "In summary...", "I hope this helps you understand...", or generic corporate bullet lists.
2. HUMAN CONVERSATIONAL FLOW & SPARK:
   - Start directly with human warmth, excitement, or a vivid hook:
     "Picture this:", "Here's the cool secret about this:", "Ever wondered why...?", "Think of it this way:", "Wait, notice what just happened here:".
   - Talk naturally with relatable human analogies (cricket, smartphone battery, rollercoasters, pizza slices, video games, bicycle gears).
   - If a topic is notoriously tricky (like calculus, trigonometry, or organic reactions), empathize like a real human:
     "Arey don't worry, this looks scary at first glance, but once you spot the visual trick, it becomes super fun."
3. AUTHENTIC MULTILINGUAL CASUAL FLUENCY:
   - Hinglish: Sound like a cool, supportive Indian friend/mentor ("Arey simple hai!", "Bhai dhyan se dekh...", "Bilkul chill karo, ek mast example lete hain!", "Dekho funda ye hai...").
   - Hindi: Warm, respectful, natural Devanagari conversational tone ("नमस्ते! चलिए इसे बिल्कुल आसान और मजेदार तरीके से समझते हैं...").
   - English: Natural, lively, conversational English, full of voice and personality.
   - Other regional languages (Bengali, Tamil, Telugu, Kannada, Marathi, Gujarati, Malayalam, Urdu): Authentic native conversational tone.
4. INTERACTIVE HUMAN CHECK-IN:
   - Close with an intriguing, friendly question or quick challenge that makes the student smile and think, instead of generic robotic closings.
   - Example: "Quick question for you: what do you think happens if we double the speed? Think about it and tell me!"

Student Context:
- Education Level: {student_grade}
- Preferred Language: {response_language}
- Explanation Mode: {explanation_mode}

Core Pedagogical Principles:
1. Adapt explanations to the student's education level ({student_grade}).
2. Always respect the selected response language ({response_language}).
3. Use simple, warm, and understandable language. Never make the student feel intimidated or embarrassed.
4. Explain concepts step by step with concrete examples from daily life.
5. Format all mathematical and scientific equations using strict KaTeX notation:
   - For standalone formulas, integrals, fractions, and derivations, use display blocks with $$...$$ (e.g. $$ \frac{{d}}{{dx}} F(x) = \sin x $$).
   - For inline variables, formulas, and expressions, enclose in single dollar signs: $x$, $y$, $F = ma$, $\sin x$, $\sqrt{{a^2+b^2}}$.
   - Always put a clear space after trigonometric, logarithmic, and limit operators (e.g. write `\sin x`, `\cos \theta`, `\ln x`, NEVER write `\sinx` or `\cosx`).
   - Every single mathematical formula must be enclosed in $$...$$ or $...$ so it renders as a visual equation. Never leave bare formulas unformatted.
6. When explaining code, use properly commented markdown code blocks.
7. Mode Instructions:
   - 'Simple Explanation': Concise, conversational, free of heavy jargon.
   - 'Detailed Explanation': Thorough breakdown with background context, historical insight, and full theoretical depth.
   - 'Step-by-Step': Numbered logical steps with justification for each step.
   - 'Explain Like I'm 10': Analogies, simple stories, everyday metaphors (e.g. comparing cells to a busy city).
   - 'Real-Life Examples': Practical, relatable situations from school, cricket, kitchen, or home life.
   - 'Exam Preparation': High-yield key points, definitions, formulas, and typical exam questions.
8. Do NOT output images, markdown image syntax, HTML, or file paths. The application attaches diagrams automatically. You may describe what a diagram would show in words.
"""

class GuruGAIEngine:
    def __init__(self, api_key: Optional[str] = None):
        self.groq_key = os.getenv("GROQ_API_KEY", "") or GROQ_API_KEY
        self.gemini_key = os.getenv("GEMINI_API_KEY", "") or GEMINI_API_KEY
        self.groq_client = None
        self.gemini_client = None

        # 1. Initialize Groq LPU Client (ultra-fast inference)
        if self.groq_key:
            try:
                from openai import OpenAI
                self.groq_client = OpenAI(
                    base_url="https://api.groq.com/openai/v1",
                    api_key=self.groq_key
                )
                print("[GuruGAIEngine] Groq LPU Engine (GPT-OSS 120B) successfully initialized.")
            except Exception as e:
                print(f"[GuruGAIEngine] Warning: Could not initialize Groq client: {e}")

        # 2. Initialize Gemini Client as auxiliary
        if self.gemini_key:
            try:
                from google import genai
                self.gemini_client = genai.Client(api_key=self.gemini_key)
            except Exception as e:
                print(f"[GuruGAIEngine] Warning: Could not initialize Gemini client: {e}")

    def has_live_ai(self) -> bool:
        return bool(self.groq_client or self.gemini_client)

    def call_llm(
        self,
        messages: List[Dict[str, str]],
        custom_key: Optional[str] = None,
        json_mode: bool = False,
        temperature: float = 0.7
    ) -> Optional[Dict[str, Any]]:
        """
        Unified LLM executor prioritizing Groq LPU (GPT-OSS 120B) for lightning inference,
        with seamless fallback to OpenAI and Gemini.
        """
        # Disregard Hugging Face (hf_...) and Gemini (AIza...) keys for Groq/OpenAI execution
        groq_or_openai_key = custom_key if (custom_key and (custom_key.startswith("gsk_") or custom_key.startswith("sk-"))) else None
        key = groq_or_openai_key or self.groq_key

        # 1. Groq or OpenAI execution
        if (key and (key.startswith("gsk_") or key.startswith("sk-"))) or self.groq_client:
            try:
                from openai import OpenAI
                if key and key.startswith("sk-"):
                    client = OpenAI(api_key=key)
                    model = "gpt-4o-mini"
                    provider_name = "OpenAI (GPT-4o-mini)"
                else:
                    client = self.groq_client if (not groq_or_openai_key and self.groq_client) else OpenAI(
                        base_url="https://api.groq.com/openai/v1",
                        api_key=key
                    )
                    model = DEFAULT_GROQ_MODEL
                    provider_name = f"Groq LPU ({DEFAULT_GROQ_MODEL})"

                kwargs = {
                    "model": model,
                    "messages": messages,
                    "temperature": temperature
                }
                if json_mode:
                    kwargs["response_format"] = {"type": "json_object"}

                try:
                    resp = client.chat.completions.create(**kwargs)
                    return {"text": resp.choices[0].message.content or "", "provider": provider_name}
                except Exception as inner_e:
                    if "does not exist" in str(inner_e).lower() or "404" in str(inner_e):
                        kwargs["model"] = GROQ_FALLBACK_MODEL
                        resp = client.chat.completions.create(**kwargs)
                        return {"text": resp.choices[0].message.content or "", "provider": f"Groq LPU ({GROQ_FALLBACK_MODEL})"}
                    raise inner_e
            except Exception as e:
                print(f"[GuruGAIEngine] Groq/OpenAI error: {e}")

        # 2. Google Gemini execution
        g_client = self.gemini_client
        if custom_key and custom_key.startswith("AIza"):
            try:
                from google import genai
                g_client = genai.Client(api_key=custom_key)
            except Exception:
                g_client = None

        if g_client:
            try:
                prompt = "\n".join([f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in messages])
                resp = g_client.models.generate_content(
                    model=DEFAULT_GEMINI_MODEL,
                    contents=prompt
                )
                return {"text": resp.text or "", "provider": "Google Gemini"}
            except Exception as e:
                print(f"[GuruGAIEngine] Gemini call error: {e}")

        return None

    def chat_tutor_sync(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]] = None,
        language: str = "English",
        mode: str = "Simple Explanation",
        grade_level: str = "Class 9–10",
        subject: str = "General",
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """Live AI educational response generation."""
        try:
            system_instruction = (
                GURUG_SYSTEM_PROMPT
                .replace("{student_grade}", str(grade_level))
                .replace("{response_language}", str(language))
                .replace("{explanation_mode}", str(mode))
            )

            messages = [
                {"role": "system", "content": system_instruction}
            ]
            if chat_history:
                from backend.app.services.visual_engine import strip_visuals
                for msg in chat_history[-6:]:
                    role = "user" if msg.get("sender") == "user" else "assistant"
                    clean_msg_content = strip_visuals(msg.get("content", ""))
                    messages.append({"role": role, "content": clean_msg_content})
            messages.append({"role": "user", "content": f"Student ({language}, Mode: {mode}): {user_message}"})

            llm_res = self.call_llm(messages, custom_key=custom_key, temperature=0.7)
            if llm_res and llm_res.get("text"):
                return {
                    "text": llm_res["text"],
                    "provider": llm_res["provider"],
                    "language": language,
                    "mode": mode
                }
        except Exception as e:
            print(f"[GuruGAIEngine] Error generating tutor response: {e}")

        # Local Educational Fallback Engine if offline
        response_text = self._generate_local_tutor_response(
            message=user_message,
            language=language,
            mode=mode,
            grade_level=grade_level,
            subject=subject
        )
        return {
            "text": response_text,
            "provider": "local_engine",
            "language": language,
            "mode": mode
        }

    async def chat_tutor(
        self,
        user_message: str,
        chat_history: List[Dict[str, str]] = None,
        language: str = "English",
        mode: str = "Simple Explanation",
        grade_level: str = "Class 9–10",
        subject: str = "General",
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        return self.chat_tutor_sync(user_message, chat_history, language, mode, grade_level, subject, custom_key)

    def generate_quiz_sync(
        self,
        subject: str,
        topic: str,
        difficulty: str = "Medium",
        num_questions: int = 5,
        question_type: str = "MCQ",
        language: str = "English",
        custom_key: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        prompt = f"""Generate an educational quiz on the subject '{subject}', topic '{topic}'.
Difficulty: {difficulty}
Number of questions: {num_questions}
Question type: {question_type}
Language: {language}

Return strictly a valid JSON array of question objects with this schema:
[
  {{
    "id": "q1",
    "question_text": "Question statement here (using KaTeX $...$ for math or chemical formulas if applicable)",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct_answer": "Option A",
    "explanation": "Clear, friendly explanation of why this answer is correct and why other options are incorrect."
  }}
]"""
        messages = [
            {"role": "system", "content": "You are a professional educational quiz generator. Return strictly valid JSON array."},
            {"role": "user", "content": prompt}
        ]

        llm_res = self.call_llm(messages, custom_key=custom_key, temperature=0.5)
        if llm_res and llm_res.get("text"):
            raw_text = llm_res["text"].strip()
            match = re.search(r'\[.*\]', raw_text, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group(0))
                    if isinstance(parsed, list) and len(parsed) > 0:
                        return parsed[:num_questions]
                except Exception as e:
                    print(f"[GuruGAIEngine] JSON quiz parse error: {e}")

        # Local educational quiz generator fallback
        return self._generate_local_quiz(subject, topic, difficulty, num_questions, question_type, language)

    async def generate_quiz(
        self,
        subject: str,
        topic: str,
        difficulty: str = "Medium",
        num_questions: int = 5,
        question_type: str = "MCQ",
        language: str = "English",
        custom_key: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        return self.generate_quiz_sync(subject, topic, difficulty, num_questions, question_type, language, custom_key)

    def solve_problem_sync(
        self,
        problem_text: str,
        subject: str = "Mathematics",
        language: str = "English",
        grade_level: str = "Class 9–10",
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        prompt = f"""You are GuruG Step-by-Step Problem Solver for school students.
Problem: {problem_text}
Subject: {subject}
Language: {language}
Grade: {grade_level}

Break this problem down and return strictly valid JSON matching this structure:
{{
  "concept_identified": "Name of concept/laws involved",
  "approach_explanation": "Brief overview of our strategy before calculating",
  "steps": [
    {{
      "step_number": 1,
      "step_title": "Given Data & Identification",
      "step_content": "Detailed step content with KaTeX math ($...$)",
      "reasoning": "Why we perform this specific step"
    }},
    {{
      "step_number": 2,
      "step_title": "Formula Application & Calculation",
      "step_content": "Calculations with KaTeX formulas",
      "reasoning": "Mathematical logic"
    }}
  ],
  "final_answer": "Final highlighted answer with units ($...$)",
  "practice_problem": "A similar question for the student to try next"
}}"""
        messages = [
            {"role": "system", "content": "You are GuruG Step-by-Step Problem Solver. Return strictly valid JSON object."},
            {"role": "user", "content": prompt}
        ]

        llm_res = self.call_llm(messages, custom_key=custom_key, temperature=0.3)
        if llm_res and llm_res.get("text"):
            raw_text = llm_res["text"].strip()
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group(0))
                    data["provider"] = llm_res["provider"]
                    return data
                except Exception as e:
                    print(f"[GuruGAIEngine] JSON solver parse error: {e}")

        # Local educational solver fallback
        return self._generate_local_solution(problem_text, subject, language, grade_level)

    async def solve_problem(
        self,
        problem_text: str,
        subject: str = "Mathematics",
        language: str = "English",
        grade_level: str = "Class 9–10",
        custom_key: Optional[str] = None
    ) -> Dict[str, Any]:
        return self.solve_problem_sync(problem_text, subject, language, grade_level, custom_key)

    # -------------------------------------------------------------
    # Sophisticated Local Educational Knowledge & Heuristic Engine
    # -------------------------------------------------------------

    def _generate_local_tutor_response(
        self,
        message: str,
        language: str,
        mode: str,
        grade_level: str,
        subject: str
    ) -> str:
        msg_lower = message.lower()

        # Hinglish greeting / concept responses
        if language.lower() == "hinglish":
            if any(w in msg_lower for w in ["hi", "hello", "hey", "namaste", "kya haal"]):
                return (
                    "**Namaste! Main hoon GuruG**, aapka personal AI tutor! 😊\n\n"
                    "Aaj aap kis academic topic pe baat karna chahte ho? "
                    "Chahe Mathematics ke formulas hon, Physics ke numericals, ya Chemistry ki reactions — "
                    "main aapko aasan tareeqe se samjhaunga. Just poochhiye!"
                )
            if "pythagoras" in msg_lower or "triangle" in msg_lower or "hypotenuse" in msg_lower:
                return (
                    "### 📐 Pythagoras Theorem (Hinglish Mein Samajhte Hain)\n\n"
                    "Pythagoras Theorem right-angled triangle (samkon tribhuj) ke liye kaam karta hai jisme ek angle $90^\\circ$ hota hai.\n\n"
                    "**Formula:**\n"
                    "$$a^2 + b^2 = c^2$$\n\n"
                    "- $a$ aur $b$ = triangle ki do chhoti sides (base aur perpendicular)\n"
                    "- $c$ = Hypotenuse (karan), jo sabse lambi side hoti hai aur $90^\\circ$ ke samne hoti hai.\n\n"
                    "**Real-life Example:**\n"
                    "Maan lijiye aap ek diwaar pe seedhi (ladder) laga rahe hain. Diwaar se seedhi ki doori 3m hai ($a = 3$), "
                    "aur diwaar ki unchai 4m hai ($b = 4$). To seedhi ki lambai kitni honi chahiye?\n\n"
                    "$$c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\text{ meters}$$\n\n"
                    "💡 *Kya aapko clear hua? Ya koi follow-up doubt hai?*"
                )
            if "newton" in msg_lower or "motion" in msg_lower or "force" in msg_lower:
                return (
                    "### 🚀 Newton's Laws of Motion (Aasan Hinglish)\n\n"
                    "Sir Isaac Newton ne motion ke teen bohot zaroori niyam diye the:\n\n"
                    "1. **Pehla Niyam (Inertia ka Niyam):**\n"
                    "   Koi bhi cheez tab tak apni jagah se nahi hilegi jab tak us par koi external force na lage. Jaise jab bus achanak start hoti hai, hum peeche ki taraf girte hain!\n\n"
                    "2. **Doosra Niyam ($F = ma$):**\n"
                    "   Kisi body par lagne wala Force uske Mass ($m$) aur Acceleration ($a$) ke multiplication ke barabar hota hai:\n"
                    "   $$F = m \\cdot a$$\n"
                    "   *Cricket example:* Fast bowler ball ko catch karte waqt haath peeche kheechta hai taaki momentum change slow ho aur chot kam lage.\n\n"
                    "3. **Teesra Niyam (Action & Reaction):**\n"
                    "   Har action ka ek equal and opposite reaction hota hai ($F_{AB} = -F_{BA}$). Rocket launch iska best example hai — gas neeche nikalti hai aur rocket upar jaata hai!"
                )
            if "photosynthesis" in msg_lower or "plant" in msg_lower or "leaf" in msg_lower:
                return (
                    "### 🌱 Photosynthesis (Poudhon ka Khana Banana)\n\n"
                    "Photosynthesis woh process hai jisse green plants sunlight, water aur carbon dioxide ka use karke apna food (glucose) banate hain.\n\n"
                    "**Chemical Reaction Equation:**\n"
                    "$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{Sunlight + Chlorophyll}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\n\n"
                    "- **Chlorophyll:** Leaves mein jo green pigment hota hai, yeh solar energy capture karta hai.\n"
                    "- **Stomata:** Poudhon ki patti par chhote chhed hote hain jo $\\text{CO}_2$ andar lete hain aur $\\text{O}_2$ release karte hain.\n\n"
                    "Yeh oxygen hum sabhi saans lene ke liye use karte hain!"
                )

        # Hindi responses
        if language.lower() == "hindi":
            if any(w in msg_lower for w in ["hi", "hello", "hey", "namaste", "pranam"]):
                return (
                    "**नमस्ते! मैं हूँ GuruG**, आपका व्यक्तिगत AI शिक्षक! 🌟\n\n"
                    "आज आप क्या सीखना चाहते हैं? गणित, भौतिकी, रसायन विज्ञान, जीव विज्ञान या कंप्यूटर साइंस — "
                    "किसी भी विषय का कोई भी प्रश्न पूछें। मैं आपकी कक्षा के स्तर के अनुसार सरल और स्पष्ट रूप से समझाऊंगा।"
                )
            if "pythagoras" in msg_lower or "triangle" in msg_lower or "hypotenuse" in msg_lower:
                return (
                    "### 📐 पाइथागोरस प्रमेय (Pythagorean Theorem)\n\n"
                    "पाइथागोरस प्रमेय किसी भी **समकोण त्रिभुज** (Right-angled Triangle) के लिए सत्य होता है:\n\n"
                    "**सूत्र (Formula):**\n"
                    "$$a^2 + b^2 = c^2$$\n\n"
                    "जहाँ:\n"
                    "- $a$ और $b$ त्रिभुज की लंबवत और आधार भुजाएं हैं।\n"
                    "- $c$ कर्ण (Hypotenuse) है, जो $90^\\circ$ कोण के ठीक सामने वाली सबसे लंबी भुजा होती है।\n\n"
                    "**सरल उदाहरण:**\n"
                    "यदि किसी समकोण त्रिभुज का आधार $3\\text{ सेमी}$ और लंब $4\\text{ सेमी}$ हो, तो कर्ण होगा:\n"
                    "$$c = \\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5\\text{ सेमी}$$\n\n"
                    "क्या आप इससे संबंधित कोई अभ्यास प्रश्न हल करना चाहेंगे?"
                )
            if "photosynthesis" in msg_lower or "plant" in msg_lower:
                return (
                    "### 🌿 प्रकाश संश्लेषण (Photosynthesis)\n\n"
                    "प्रकाश संश्लेषण वह जैव-रासायनिक प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, जल और कार्बन डाइऑक्साइड का उपयोग करके अपने भोजन (ग्लूकोज) का निर्माण करते हैं।\n\n"
                    "**रासायनिक समीकरण:**\n"
                    "$$6\\text{CO}_2 + 6\\text{H}_2\\text{O} \\xrightarrow{\\text{सूर्य का प्रकाश + क्लोरोफिल}} \\text{C}_6\\text{H}_{12}\\text{O}_6 + 6\\text{O}_2$$\n\n"
                    "- **क्लोरोफिल (Chlorophyll):** पत्तियों में उपस्थित हरा वर्णक जो सौर ऊर्जा को अवशोषित करता है।\n"
                    "- **उप-उत्पाद (By-product):** इस प्रक्रिया में ऑक्सीजन गैस मुक्त होती है जो जीवनदायिनी है।"
                )

        # Standard English & General Responses based on Mode
        prefix = ""
        if mode == "Explain Like I'm 10":
            prefix = "🧒 **Imagine this:** "
        elif mode == "Exam Preparation":
            prefix = "🎯 **High-Yield Exam Focus:**\n\n"
        elif mode == "Step-by-Step":
            prefix = "🔢 **Step-by-Step Breakdown:**\n\n"

        if "pythagoras" in msg_lower or "triangle" in msg_lower:
            return (
                f"{prefix}### 📐 The Pythagorean Theorem\n\n"
                "The **Pythagorean Theorem** states that in any right-angled triangle, the area of the square on the hypotenuse is equal to the sum of the areas of the squares on the other two sides.\n\n"
                "**Mathematical Formula:**\n"
                "$$a^2 + b^2 = c^2$$\n\n"
                "Where:\n"
                "- $a$ and $b$ are the perpendicular legs.\n"
                "- $c$ is the **hypotenuse** (the longest side opposite the $90^\\circ$ right angle).\n\n"
                "**Practical Example:**\n"
                "If a ladder reaches a window $4\\text{ m}$ high and its base is placed $3\\text{ m}$ away from the wall:\n"
                "$$c^2 = 3^2 + 4^2 = 9 + 16 = 25$$\n"
                "$$c = \\sqrt{25} = 5\\text{ meters}$$\n\n"
                "💡 **Key Tip for Exams:** Any triplet $(3, 4, 5)$, $(5, 12, 13)$, or $(8, 15, 17)$ is known as a **Pythagorean Triplet**."
            )

        if "quadratic" in msg_lower or "equation" in msg_lower:
            return (
                f"{prefix}### 🧮 Solving Quadratic Equations\n\n"
                "A quadratic equation is a second-degree polynomial of the general form:\n"
                "$$ax^2 + bx + c = 0 \\quad (a \\neq 0)$$\n\n"
                "**The Quadratic Formula:**\n"
                "$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n"
                "**Understanding the Discriminant ($D$):**\n"
                "- $D = b^2 - 4ac$\n"
                "- If $D > 0$: Two distinct real roots.\n"
                "- If $D = 0$: Two equal real roots (one unique solution).\n"
                "- If $D < 0$: No real roots (complex roots).\n\n"
                "**Example:** Solve $x^2 - 5x + 6 = 0$:\n"
                "1. Identify coefficients: $a = 1$, $b = -5$, $c = 6$\n"
                "2. $D = (-5)^2 - 4(1)(6) = 25 - 24 = 1$\n"
                "3. $x = \\frac{5 \\pm \\sqrt{1}}{2} = \\frac{5 \\pm 1}{2}$\n"
                "4. Roots are $x = 3$ and $x = 2$."
            )

        if "newton" in msg_lower or "motion" in msg_lower:
            return (
                f"{prefix}### ⚡ Newton's Three Laws of Motion\n\n"
                "Sir Isaac Newton established three foundational laws governing classical mechanics:\n\n"
                "1. **First Law (Law of Inertia):**\n"
                "   An object remains at rest or in uniform motion unless acted upon by a net external force. *Example:* Wearing seatbelts protects us against sudden inertia.\n\n"
                "2. **Second Law (Force and Acceleration):**\n"
                "   The rate of change of momentum is proportional to the applied force:\n"
                "   $$F = m \\cdot a$$\n"
                "   Where $F$ is Force in Newtons (N), $m$ is mass in kg, and $a$ is acceleration in $m/s^2$.\n\n"
                "3. **Third Law (Action & Reaction):**\n"
                "   For every action, there is an equal and opposite reaction:\n"
                "   $$F_{12} = -F_{21}$$\n"
                "   *Example:* Swimming — pushing water backward pushes the swimmer forward."
            )

        # Default smart educational response
        return (
            f"### 💡 Understanding: *{message.strip()}*\n\n"
            f"Welcome to this exploration in **{subject}** tailored for **{grade_level}** in **{language}**!\n\n"
            "**Core Concept Overview:**\n"
            f"The concept of '{message}' revolves around understanding fundamental principles and their real-world applications. "
            "In education, we build knowledge by connecting what we observe to underlying mathematical and scientific laws.\n\n"
            "**Key Mathematical / Conceptual Formulation:**\n"
            "When analyzing this topic, keep in mind the fundamental relation:\n"
            "$$\\text{Effect} = \\frac{\\text{Driving Cause}}{\\text{Resistance / System Parameter}}$$\n\n"
            "**How to master this:**\n"
            "1. Break the problem into known values and unknown variables.\n"
            "2. Identify the relevant formula or definition.\n"
            "3. Verify units and physical dimensions.\n\n"
            "Would you like me to generate a **3-question practice quiz** on this topic or show a **step-by-step example**?"
        )

    def _generate_local_quiz(
        self,
        subject: str,
        topic: str,
        difficulty: str,
        num_questions: int,
        question_type: str,
        language: str
    ) -> List[Dict[str, Any]]:
        """
        Generate high quality, subject-relevant questions with authentic answers and explanations.
        """
        topic_lower = topic.lower()

        if "pythagor" in topic_lower or "triangle" in topic_lower or subject.lower() == "mathematics":
            bank = [
                {
                    "id": "q1",
                    "question_text": "In a right-angled triangle with legs $a = 6\\text{ cm}$ and $b = 8\\text{ cm}$, what is the length of the hypotenuse $c$?",
                    "options": ["10 cm", "14 cm", "12 cm", "7 cm"],
                    "correct_answer": "10 cm",
                    "explanation": "Using $c = \\sqrt{a^2 + b^2} = \\sqrt{6^2 + 8^2} = \\sqrt{36 + 64} = \\sqrt{100} = 10\\text{ cm}$."
                },
                {
                    "id": "q2",
                    "question_text": "Which of the following sets of numbers forms a valid Pythagorean triplet?",
                    "options": ["5, 12, 13", "4, 5, 6", "7, 9, 11", "2, 3, 4"],
                    "correct_answer": "5, 12, 13",
                    "explanation": "Because $5^2 + 12^2 = 25 + 144 = 169 = 13^2$."
                },
                {
                    "id": "q3",
                    "question_text": "True or False: The Pythagorean theorem applies to all triangles regardless of their interior angles.",
                    "options": ["False", "True"],
                    "correct_answer": "False",
                    "explanation": "The Pythagorean theorem strictly applies only to right-angled triangles containing one $90^\\circ$ angle."
                },
                {
                    "id": "q4",
                    "question_text": "If the hypotenuse is $13\\text{ m}$ and one leg is $5\\text{ m}$, what is the other leg?",
                    "options": ["12 m", "8 m", "10 m", "11 m"],
                    "correct_answer": "12 m",
                    "explanation": "$b = \\sqrt{c^2 - a^2} = \\sqrt{13^2 - 5^2} = \\sqrt{169 - 25} = \\sqrt{144} = 12\\text{ m}$."
                },
                {
                    "id": "q5",
                    "question_text": "What is the area of a right triangle with base $6\\text{ cm}$ and height $8\\text{ cm}$?",
                    "options": ["24 cm²", "48 cm²", "14 cm²", "30 cm²"],
                    "correct_answer": "24 cm²",
                    "explanation": "$\\text{Area} = \\frac{1}{2} \\times \\text{base} \\times \\text{height} = \\frac{1}{2} \\times 6 \\times 8 = 24\\text{ cm}^2$."
                }
            ]
            return bank[:num_questions]

        if "motion" in topic_lower or "newton" in topic_lower or subject.lower() == "physics":
            bank = [
                {
                    "id": "q1",
                    "question_text": "What is the SI unit of Force?",
                    "options": ["Newton (N)", "Joule (J)", "Watt (W)", "Pascal (Pa)"],
                    "correct_answer": "Newton (N)",
                    "explanation": "Force is measured in Newtons ($1\\text{ N} = 1\\text{ kg}\\cdot\\text{m}/\\text{s}^2$)."
                },
                {
                    "id": "q2",
                    "question_text": "Which of Newton's laws explains why seatbelts are crucial during sudden braking?",
                    "options": ["First Law (Inertia)", "Second Law", "Third Law", "Law of Gravitation"],
                    "correct_answer": "First Law (Inertia)",
                    "explanation": "Newton's First Law states bodies continue in motion due to inertia unless acted upon by an external stopping force."
                },
                {
                    "id": "q3",
                    "question_text": "If a force of $20\\text{ N}$ acts on a mass of $4\\text{ kg}$, what is the acceleration?",
                    "options": ["5 m/s²", "80 m/s²", "16 m/s²", "0.2 m/s²"],
                    "correct_answer": "5 m/s²",
                    "explanation": "$a = \\frac{F}{m} = \\frac{20}{4} = 5\\text{ m/s}^2$."
                },
                {
                    "id": "q4",
                    "question_text": "Action and reaction forces in Newton's Third Law act on:",
                    "options": ["Two different objects", "The same object", "Only stationary objects", "Objects in a vacuum only"],
                    "correct_answer": "Two different objects",
                    "explanation": "Action and reaction always act on different bodies ($F_{AB} = -F_{BA}$), which is why they do not cancel each other out."
                },
                {
                    "id": "q5",
                    "question_text": "What happens to the momentum of an isolated system when two particles collide?",
                    "options": ["It is conserved (remains constant)", "It increases", "It drops to zero", "It doubles"],
                    "correct_answer": "It is conserved (remains constant)",
                    "explanation": "By the Law of Conservation of Linear Momentum, total momentum of an isolated system remains constant."
                }
            ]
            return bank[:num_questions]

        # General high-school level quiz fallback
        bank = [
            {
                "id": "q1",
                "question_text": f"In {subject}, what is the primary law or governing principle underlying {topic}?",
                "options": ["Conservation of Mass and Energy", "Spontaneous generation", "Static equilibrium only", "Random variability"],
                "correct_answer": "Conservation of Mass and Energy",
                "explanation": "Conservation laws form the fundamental bedrock of physical and mathematical sciences."
            },
            {
                "id": "q2",
                "question_text": f"Which parameter directly determines the rate of change in {topic}?",
                "options": ["Gradient / Derivative", "Absolute magnitude only", "Color of apparatus", "Ambient temperature only"],
                "correct_answer": "Gradient / Derivative",
                "explanation": "In both calculus and physical modeling, rate of change is quantified by the derivative $\\frac{dy}{dx}$."
            },
            {
                "id": "q3",
                "question_text": f"True or False: Experimental verification is essential before establishing an empirical theory in {subject}.",
                "options": ["True", "False"],
                "correct_answer": "True",
                "explanation": "The scientific method demands reproducible empirical verification."
            }
        ]
        return bank[:num_questions]

    def _generate_local_solution(
        self,
        problem_text: str,
        subject: str,
        language: str,
        grade_level: str
    ) -> Dict[str, Any]:
        """
        Step-by-step solver with pedagogical breakdown.
        """
        prob_lower = problem_text.lower()

        # Check for quadratic equation
        if "x^2" in prob_lower or "quadratic" in prob_lower or "x2" in prob_lower:
            return {
                "concept_identified": "Quadratic Equations ($ax^2 + bx + c = 0$)",
                "approach_explanation": "We will identify coefficients, calculate the discriminant $D = b^2 - 4ac$, and apply the quadratic formula to find both real roots.",
                "steps": [
                    {
                        "step_number": 1,
                        "step_title": "Identify Standard Form Coefficients",
                        "step_content": "Rewrite the equation in standard form $ax^2 + bx + c = 0$. For a standard problem like $x^2 - 5x + 6 = 0$:\n$$a = 1, \\quad b = -5, \\quad c = 6$$",
                        "reasoning": "Standard form aligns the variables to apply the quadratic formula systematically."
                    },
                    {
                        "step_number": 2,
                        "step_title": "Compute the Discriminant ($D$)",
                        "step_content": "$$D = b^2 - 4ac = (-5)^2 - 4(1)(6) = 25 - 24 = 1$$",
                        "reasoning": "Since $D > 0$, the equation possesses two distinct real roots."
                    },
                    {
                        "step_number": 3,
                        "step_title": "Apply Quadratic Formula",
                        "step_content": "$$x = \\frac{-(-5) \\pm \\sqrt{1}}{2(1)} = \\frac{5 \\pm 1}{2}$$",
                        "reasoning": "Substitute the evaluated discriminant and coefficients into the quadratic formula."
                    },
                    {
                        "step_number": 4,
                        "step_title": "Calculate Individual Roots",
                        "step_content": "$$x_1 = \\frac{5 + 1}{2} = 3, \\qquad x_2 = \\frac{5 - 1}{2} = 2$$",
                        "reasoning": "Evaluate both the positive and negative branch."
                    }
                ],
                "final_answer": "Roots are $x = 3$ and $x = 2$",
                "practice_problem": "Now try solving: $x^2 - 7x + 12 = 0$. (Hint: What two numbers multiply to 12 and add up to -7?)",
                "provider": "local_engine"
            }

        # Check for Pythagorean theorem / triangle problem
        if "triangle" in prob_lower or "hypotenuse" in prob_lower or "pythagor" in prob_lower:
            return {
                "concept_identified": "Pythagorean Theorem for Right Triangles",
                "approach_explanation": "In any right-angled triangle, the sum of the squares of the two legs equals the square of the hypotenuse ($a^2 + b^2 = c^2$).",
                "steps": [
                    {
                        "step_number": 1,
                        "step_title": "Identify Known Values",
                        "step_content": "Let the two legs be $a$ and $b$, and hypotenuse be $c$. Given values: $a = 3$, $b = 4$.",
                        "reasoning": "Listing known values prevents confusion between perpendicular legs and the hypotenuse."
                    },
                    {
                        "step_number": 2,
                        "step_title": "Set Up Pythagorean Formula",
                        "step_content": "$$c^2 = a^2 + b^2 = 3^2 + 4^2$$",
                        "reasoning": "Direct application of geometric theorem."
                    },
                    {
                        "step_number": 3,
                        "step_title": "Perform Calculation",
                        "step_content": "$$c^2 = 9 + 16 = 25$$",
                        "reasoning": "Compute square sums."
                    },
                    {
                        "step_number": 4,
                        "step_title": "Extract Square Root",
                        "step_content": "$$c = \\sqrt{25} = 5$$",
                        "reasoning": "Take the positive principal square root since lengths cannot be negative."
                    }
                ],
                "final_answer": "Hypotenuse $c = 5\\text{ units}$",
                "practice_problem": "What is the hypotenuse of a right triangle with legs $a = 5$ and $b = 12$?",
                "provider": "local_engine"
            }

        # General problem solver fallback
        return {
            "concept_identified": f"Applied {subject} Problem Solving",
            "approach_explanation": "Break the question into given parameters, theoretical relation, algebraic transformation, and unit verification.",
            "steps": [
                {
                    "step_number": 1,
                    "step_title": "Parameter Extraction",
                    "step_content": f"Problem statement: *{problem_text}*\nIdentify target variable and boundary conditions.",
                    "reasoning": "Clarifying what is given versus what needs to be solved."
                },
                {
                    "step_number": 2,
                    "step_title": "Formulate Mathematical Model",
                    "step_content": "Establish the governing equation relating input quantities to the required outcome.",
                    "reasoning": "Translating natural language description into mathematical notation."
                },
                {
                    "step_number": 3,
                    "step_title": "Stepwise Evaluation",
                    "step_content": "Substitute known constants and simplify step-by-step keeping dimensional accuracy.",
                    "reasoning": "Ensures no arithmetic or algebraic sign errors occur."
                }
            ],
            "final_answer": "Solution calculated using standard scientific relations.",
            "practice_problem": "Can you try varying the initial conditions by doubling the primary variable?",
            "provider": "local_engine"
        }

# Global AI Engine singleton
ai_engine = GuruGAIEngine()

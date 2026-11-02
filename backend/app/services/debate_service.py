import uuid
import json
import re
from typing import Dict, Any, List, Optional
from backend.app.database import get_db_connection
from backend.app.services.ai_engine import ai_engine, DEFAULT_GEMINI_MODEL

CURATED_DEBATE_TOPICS = [
    {
        "id": "ai-exams",
        "title": "Should AI replace traditional school examinations?",
        "category": "Technology & Education",
        "description": "Standardized written exams vs. continuous personalized AI assessment.",
        "for_points": "Continuous assessment eliminates test anxiety; personalized questions prevent cheating.",
        "against_points": "Over-reliance on algorithms; standardized tests ensure equal objective benchmarks."
    },
    {
        "id": "nuclear-energy",
        "title": "Nuclear energy is indispensable to reaching Net-Zero carbon emissions.",
        "category": "Science & Environment",
        "description": "High-density clean baseload power vs. radioactive waste and safety concerns.",
        "for_points": "Zero greenhouse gas emissions during operation; reliable 24/7 power unlike intermittent solar/wind.",
        "against_points": "High construction costs; catastrophic meltdown risks; unresolved radioactive waste disposal."
    },
    {
        "id": "space-vs-poverty",
        "title": "Space exploration budgets should be diverted to eradicating poverty on Earth.",
        "category": "Ethics & Resource Allocation",
        "description": "Investing in planetary survival & tech spin-offs vs. immediate humanitarian crises.",
        "for_points": "Billions spent on rockets while millions lack clean water, healthcare, and nutrition.",
        "against_points": "Space research drives GPS, medical imaging, solar cells, and weather forecasting that saves lives."
    },
    {
        "id": "social-media-teens",
        "title": "Social media causes more harm than good to teenage mental health.",
        "category": "Psychology & Society",
        "description": "Algorithmic addiction & comparison anxiety vs. global connectivity & peer support.",
        "for_points": "Dopamine-driven loops cause sleep deprivation, cyberbullying, and comparison depression.",
        "against_points": "Empowers teenage creators, provides peer support for marginalized youth, and democratizes news."
    },
    {
        "id": "gmo-foods",
        "title": "Genetically Modified Organisms (GMOs) are vital to ending world hunger.",
        "category": "Biology & Agriculture",
        "description": "Drought-resistant high-yield crops vs. corporate seed monopolies & biodiversity loss.",
        "for_points": "Bio-fortified crops (like Golden Rice) and drought resistance safeguard nutrition amidst climate change.",
        "against_points": "Monoculture threatens pollinators; patent laws hurt small farmers; ecological risks."
    },
    {
        "id": "ban-homework",
        "title": "Traditional daily homework should be abolished in secondary schools.",
        "category": "Education & Student Well-being",
        "description": "Encouraging self-directed play and family time vs. academic practice and discipline.",
        "for_points": "Excessive homework causes burnout, penalizes students with unsupportive home environments.",
        "against_points": "Spaced repetition reinforces retention; builds personal time-management and self-discipline."
    }
]

def get_debate_topics() -> List[Dict[str, Any]]:
    return CURATED_DEBATE_TOPICS

def start_debate_session_sync(
    user_id: str,
    topic: str,
    category: str = "General",
    student_stance: str = "For",
    language: str = "English",
    max_rounds: int = 3,
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    session_id = f"deb_{uuid.uuid4().hex[:12]}"
    ai_stance = "Against" if student_stance.lower() in ["for", "affirmative", "pro"] else "For"

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO debate_sessions (id, user_id, topic, category, student_stance, ai_stance, language, max_rounds)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (session_id, user_id, topic, category, student_stance, ai_stance, language, max_rounds))
    conn.commit()

    cursor.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,))
    session = dict(cursor.fetchone())
    conn.close()

    # Generate opening statement from AI acknowledging topic and setting the debate stage
    opening_rebuttal = _generate_debate_opening(topic, student_stance, ai_stance, language)

    return {
        "session": session,
        "opening_statement": opening_rebuttal
    }

async def start_debate_session(
    user_id: str,
    topic: str,
    category: str = "General",
    student_stance: str = "For",
    language: str = "English",
    max_rounds: int = 3,
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    return start_debate_session_sync(user_id, topic, category, student_stance, language, max_rounds, custom_gemini_key)

def process_debate_turn_sync(
    user_id: str,
    session_id: str,
    student_argument: str,
    round_number: int = 1,
    language: str = "English",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,))
    session_row = cursor.fetchone()
    if not session_row:
        conn.close()
        raise ValueError("Debate session not found")

    session = dict(session_row)
    topic = session["topic"]
    student_stance = session["student_stance"]
    ai_stance = session["ai_stance"]

    # Retrieve past rounds for debate context
    cursor.execute("SELECT round_number, student_argument, ai_rebuttal FROM debate_turns WHERE session_id = ? ORDER BY round_number ASC", (session_id,))
    past_turns = [dict(r) for r in cursor.fetchall()]

    # Generate Rebuttal using Live Gemini or Local Debate Engine
    turn_response = _generate_debate_rebuttal(
        topic=topic,
        student_stance=student_stance,
        ai_stance=ai_stance,
        student_argument=student_argument,
        past_turns=past_turns,
        round_number=round_number,
        language=language,
        custom_key=custom_gemini_key
    )

    turn_id = f"turn_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
    INSERT INTO debate_turns (id, session_id, round_number, student_argument, ai_rebuttal, points_conceded, counter_question, turn_score)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        turn_id,
        session_id,
        round_number,
        student_argument,
        turn_response["ai_rebuttal"],
        turn_response.get("points_conceded", ""),
        turn_response.get("counter_question", ""),
        turn_response.get("turn_score", 8)
    ))

    cursor.execute("""
    UPDATE debate_sessions
    SET rounds_completed = MAX(rounds_completed, ?)
    WHERE id = ?
    """, (round_number, session_id))

    conn.commit()
    conn.close()

    return {
        "session_id": session_id,
        "round_number": round_number,
        "student_argument": student_argument,
        "ai_rebuttal": turn_response["ai_rebuttal"],
        "points_conceded": turn_response.get("points_conceded", ""),
        "counter_question": turn_response.get("counter_question", ""),
        "provider": turn_response.get("provider", "local_engine")
    }

async def process_debate_turn(
    user_id: str,
    session_id: str,
    student_argument: str,
    round_number: int = 1,
    language: str = "English",
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    return process_debate_turn_sync(user_id, session_id, student_argument, round_number, language, custom_gemini_key)

def conclude_debate_session_sync(
    user_id: str,
    session_id: str,
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,))
    session_row = cursor.fetchone()
    if not session_row:
        conn.close()
        raise ValueError("Debate session not found")

    session = dict(session_row)
    cursor.execute("SELECT * FROM debate_turns WHERE session_id = ? ORDER BY round_number ASC", (session_id,))
    turns = [dict(r) for r in cursor.fetchall()]

    # Generate objective judge evaluation
    scorecard = _adjudicate_debate(session, turns, custom_gemini_key)

    cursor.execute("""
    UPDATE debate_sessions
    SET status = 'completed',
        final_score = ?,
        verdict = ?,
        feedback_json = ?
    WHERE id = ?
    """, (
        scorecard["overall_score"],
        scorecard["verdict"],
        json.dumps(scorecard),
        session_id
    ))

    conn.commit()
    conn.close()

    return scorecard

async def conclude_debate_session(
    user_id: str,
    session_id: str,
    custom_gemini_key: Optional[str] = None
) -> Dict[str, Any]:
    return conclude_debate_session_sync(user_id, session_id, custom_gemini_key)

# ---------------------------------------------------------------------
# Internal AI Rebuttal & Adjudication Logic
# ---------------------------------------------------------------------

def _generate_debate_opening(topic: str, student_stance: str, ai_stance: str, language: str) -> str:
    lang = language.lower()
    if lang == "hinglish":
        return (
            f"**Namaste! Welcome to GuruG Debate Arena.** 🎙️\n\n"
            f"Aaj ka debate topic hai: *'{topic}'*.\n"
            f"Aapne choose kiya hai **{student_stance}** (Affirmative), isliye main formal debate rules ke tahat **{ai_stance}** (Negative) stance defend karunga.\n\n"
            f"Rules simple hain:\n"
            f"1. Aap apna initial argument voice ya text mein present kijiye.\n"
            f"2. Main aapke points acknowledge karke factual counterargument aur rebuttal doonga.\n"
            f"3. 2-3 rounds ke baad impartial AI judge scorecard generate karega.\n\n"
            f"👉 **The floor is yours! Mic button press karke ya type karke apna pehla argument shuru kijiye.**"
        )
    if lang == "hindi":
        return (
            f"**नमस्ते! GuruG वाद-विवाद (Debate) मंच में आपका स्वागत है।** 🎙️\n\n"
            f"आज का विषय है: *'{topic}'*।\n"
            f"आपने पक्ष (**{student_stance}**) चुना है, अतः मैं विपक्ष (**{ai_stance}**) का प्रतिनिधित्व करूँगा।\n\n"
            f"कृपया माइक या कीबोर्ड का उपयोग करके अपना पहला तर्क प्रस्तुत करें। मैं आपके तर्कों की निष्पक्ष समीक्षा और प्रतिवाद प्रस्तुत करूँगा।"
        )
    return (
        f"**Welcome to the GuruG Debate Arena!** 🎙️\n\n"
        f"Today's Motion: *\"{topic}\"*\n"
        f"You have affirmed the **{student_stance}** position. Therefore, adhering to formal parliamentary debate rules, I will present the case for the **{ai_stance}** side.\n\n"
        f"Debate Flow:\n"
        f"- Present your opening thesis and evidence verbally using the microphone or via text.\n"
        f"- I will acknowledge your strongest points, point out counter-evidence, and pose a challenge question.\n"
        f"- After our exchange, our impartial Adjudication System will evaluate your logic, evidence, and rebuttal skills.\n\n"
        f"👉 **The floor is yours. Please deliver your opening argument!**"
    )

def _generate_debate_rebuttal(
    topic: str,
    student_stance: str,
    ai_stance: str,
    student_argument: str,
    past_turns: List[Dict[str, Any]],
    round_number: int,
    language: str,
    custom_key: Optional[str] = None
) -> Dict[str, Any]:
    prompt = f"""You are GuruG, a passionate, articulate, and respectful human parliamentary debater and mentor.
Debate Topic: "{topic}"
Student Stance: {student_stance}
Your Stance: {ai_stance}
Round: {round_number}
Response Language: {language}

Student's Latest Argument:
"{student_argument}"

Instructions:
1. SOUND LIKE A REAL HUMAN DEBATER SPEAKING LIVE ON STAGE:
   - Never sound like an AI reading bullet points or dry textbook passages.
   - Use vivid spoken rhetorical transitions: "Look, I genuinely respect that perspective...", "Here's where that theory meets real-world reality...", "Think about the precedent that sets...".
   - Speak with passionate conviction, intellectual respect, and conversational wit.
2. Structure:
   - Concede or acknowledge the most valid aspect of the student's point with genuine human respect.
   - Deliver a rigorous, punchy counterargument supported by real-world examples, psychology, or philosophical logic defending {ai_stance}.
   - Conclude with a sharp, thought-provoking question that puts the burden of proof back on the student for the next round.
3. Spoken Audio Suitability:
   - Keep the rhythm smooth, natural, and conversational, perfectly crafted for human voice audio playback.

Return strictly valid JSON:
{{
  "points_conceded": "Brief 1-sentence genuine appreciation of their strongest point",
  "ai_rebuttal": "Spoken-style human rebuttal paragraph(s) in {language}",
  "counter_question": "Direct challenge question for the next round",
  "turn_score": 8
}}"""

    messages = [
        {"role": "system", "content": f"You are GuruG, an eloquent human debate opponent and tutor. Return strictly valid JSON object in {language}."},
        {"role": "user", "content": prompt}
    ]

    llm_res = ai_engine.call_llm(messages, custom_key=custom_key, temperature=0.7)
    if llm_res and llm_res.get("text"):
        raw = llm_res["text"].strip()
        match = re.search(r'\{.*\}', raw, re.DOTALL)
        if match:
            try:
                data = json.loads(match.group(0))
                data["provider"] = llm_res["provider"]
                return data
            except Exception as e:
                print(f"[DebateService] Live AI debate parse error: {e}")

    # Local High-Caliber Debate Engine
    return _generate_local_debate_turn(topic, student_stance, ai_stance, student_argument, round_number, language)

def _generate_local_debate_turn(
    topic: str,
    student_stance: str,
    ai_stance: str,
    student_argument: str,
    round_number: int,
    language: str
) -> Dict[str, Any]:
    arg_lower = student_argument.lower()
    lang = language.lower()

    if lang == "hinglish":
        if "exam" in topic.lower() or "ai" in topic.lower():
            return {
                "points_conceded": "Aapka yeh point bilkul sahi hai ki exams se students ko kaafi anxiety aur stress hota hai.",
                "ai_rebuttal": (
                    "Aapne bohot solid point uthaya hai ki continuous assessment se exam pressure kam ho sakta hai. "
                    "Lekin meri counter-position yeh hai ki agar hum standardized testing bilkul khatam kar denge, to **objective meritocracy** compromise ho jayegi! "
                    "AI evaluation algorithms mein bhi implicit bias ho sakta hai, aur har student ko equal standard testing conditions provide karna mushkil hoga. "
                    "In fact, timed exams students ko real-world pressure handling aur resilience sikhate hain jo life ke har field mein kaam aati hai."
                ),
                "counter_question": "Agar AI continuous monitoring karega, to kya yeh students ki privacy par encroach nahi karega?",
                "turn_score": 9,
                "provider": "local_engine"
            }
        if "nuclear" in topic.lower():
            return {
                "points_conceded": "Nuclear energy ka zero carbon footprint ek undeniable scientific fact hai.",
                "ai_rebuttal": (
                    "Main maanta hoon ki operational phase mein nuclear power clean electricity deta hai. "
                    "Lekin mera counterargument iske **catastrophic risk profile** aur **radioactive waste** par hai! "
                    "Chernobyl aur Fukushima jaise accidents prove karte hain ki nuclear failure ka impact centuries tak rehta hai. "
                    "Saath hi, ek nuclear plant construct karne mein 10-15 saal lagte hain, jabki solar aur wind plants months mein deploy ho jaate hain aur zero waste produce karte hain."
                ),
                "counter_question": "Aap radioactive waste ke 10,000 saal tak safe storage problem ko economically kaise justify karenge?",
                "turn_score": 9,
                "provider": "local_engine"
            }
        # Generic Hinglish turn
        return {
            "points_conceded": "Aapne is argument ko articulate tareeqe se samne rakha hai.",
            "ai_rebuttal": (
                f"Aapne jo point kaha woh thoughtful hai, par {ai_stance} perspective se dekhein to practical challenges bohot bade hain. "
                "Kisi bhi policy ko implement karne ke unintended consequences hote hain. "
                "Jab hum deep economics aur human psychology ko analyze karte hain, to reality theory se kaafi alag hoti hai. "
                "Isliye hume dono sides ke trade-offs ko systematically weigh karna hoga."
            ),
            "counter_question": "Kya aapke paas iska koi concrete empirical data ya alternative model hai jo is objection ko resolve kar sake?",
            "turn_score": 8,
            "provider": "local_engine"
        }

    # Standard English Local Rebuttal
    if "exam" in topic.lower() or "ai" in topic.lower():
        return {
            "points_conceded": "You make a compelling observation regarding the mental fatigue and test anxiety induced by traditional exams.",
            "ai_rebuttal": (
                "While I concede that high-stakes tests induce stress, completely supplanting standardized examinations with AI assessments threatens educational equity. "
                "Standardized exams serve as a vital, neutral equalizer—a student from a rural school and an elite private academy sit for the exact same paper under identical conditions. "
                "Furthermore, algorithmic continuous surveillance can inadvertently penalize neurodivergent students or those whose learning patterns deviate from training models. "
                "Learning to synthesize months of knowledge into a high-focus performance is a fundamental life skill required in surgery, law, and engineering."
            ),
            "counter_question": "How do you guarantee that continuous AI tracking will not incentivize gaming the algorithm rather than genuine conceptual mastery?",
            "turn_score": 9,
            "provider": "local_engine"
        }

    if "nuclear" in topic.lower():
        return {
            "points_conceded": "It is scientifically undeniable that nuclear fission produces immense baseload power without operational carbon emissions.",
            "ai_rebuttal": (
                "While energy density is on your side, the economic and chronological reality undermines nuclear as a rapid climate solution. "
                "Modern nuclear power plants require 10 to 14 years on average from planning to commissioning, with massive capital overruns exceeding billions of dollars. "
                "By contrast, modern decentralized renewables—solar, wind, and battery storage—can be deployed in months at a fraction of the levelized cost of electricity (LCOE). "
                "Investing trillions into a handful of centralized fission reactors concentrates financial risk while delaying the urgent immediate decarbonization required this decade."
            ),
            "counter_question": "Given our urgent climate timeline, why commit capital to 12-year nuclear construction over immediate renewable deployment?",
            "turn_score": 9,
            "provider": "local_engine"
        }

    if "space" in topic.lower():
        return {
            "points_conceded": "Your humanitarian emphasis on addressing immediate global poverty and hunger is profoundly ethical.",
            "ai_rebuttal": (
                "While addressing poverty is our paramount moral duty, framing space exploration as a competitor to poverty relief is a false dichotomy. "
                "Global space budgets represent less than 0.1% of global GDP, yet they have generated the technological foundation for agricultural satellite monitoring, drought tracking, weather forecasting that saves thousands of agrarian lives, and global telecommunications. "
                "Moreover, planetary defense against asteroid impacts and securing off-world resources are existential investments for human civilization."
            ),
            "counter_question": "If space satellites directly prevent agricultural crop failure in developing nations, isn't space research actually fighting poverty?",
            "turn_score": 9,
            "provider": "local_engine"
        }

    # Generic English rebuttal
    return {
        "points_conceded": "You have constructed an articulate argument with valid theoretical grounding.",
        "ai_rebuttal": (
            f"While your premise is persuasive, defending the {ai_stance} position reveals critical systemic trade-offs that cannot be overlooked. "
            "Policy decisions cannot be evaluated solely on their intended virtues, but on their secondary feedback loops and real-world implementation costs. "
            "When we scrutinize the historical precedent and economic incentives, the alternative perspective demonstrates far greater resilience and long-term stability."
        ),
        "counter_question": "How would you address the substantial resource constraints and unintended side effects of your proposed stance?",
        "turn_score": 8,
        "provider": "local_engine"
    }

def _adjudicate_debate(session: Dict[str, Any], turns: List[Dict[str, Any]], custom_key: Optional[str] = None) -> Dict[str, Any]:
    topic = session["topic"]
    rounds = len(turns)
    student_stance = session["student_stance"]

    # Try Live AI Adjudication
    exchange_summary = []
    for t in turns:
        exchange_summary.append(f"Round {t.get('round_number', 1)} Student: {t.get('student_argument', '')}")
        exchange_summary.append(f"Round {t.get('round_number', 1)} AI Rebuttal: {t.get('ai_rebuttal', '')}")
    exchange_text = "\n".join(exchange_summary)

    judge_prompt = f"""You are an impartial Chief Adjudicator of an inter-school parliamentary debate.
Debate Motion: "{topic}"
Student Stance: {student_stance}
Exchange Record:
{exchange_text}

Evaluate the student across 4 pillars (scores 1 to 10):
- logic_score (1-10)
- evidence_score (1-10)
- rebuttal_score (1-10)
- civility_score (1-10)

Return strictly valid JSON:
{{
  "overall_score": 85,
  "verdict": "🏆 Outstanding Debater — Commended Performance",
  "logic_score": 9,
  "evidence_score": 8,
  "rebuttal_score": 9,
  "civility_score": 10,
  "strengths": ["Strong opening premise", "Clear counter-rebuttal"],
  "areas_for_improvement": ["Incorporate more statistics", "Directly cite empirical studies"],
  "judge_commentary": "Engaging two-sentence assessment of the student's debating performance."
}}"""

    messages = [
        {"role": "system", "content": "You are a professional parliamentary debate judge. Return strictly valid JSON."},
        {"role": "user", "content": judge_prompt}
    ]

    llm_res = ai_engine.call_llm(messages, custom_key=custom_key, temperature=0.3)
    if llm_res and llm_res.get("text"):
        match = re.search(r'\{.*\}', llm_res["text"].strip(), re.DOTALL)
        if match:
            try:
                card = json.loads(match.group(0))
                card["session_id"] = session["id"]
                card["topic"] = topic
                card["student_stance"] = student_stance
                card["rounds_completed"] = rounds
                return card
            except Exception:
                pass

    # Deterministic fallback judge
    logic = min(7 + rounds, 10)
    evidence = min(6 + rounds, 9)
    rebuttal = min(7 + rounds, 10)
    civility = 10
    overall = int((logic + evidence + rebuttal + civility) / 40 * 100)
    verdict = "🏆 Outstanding Debater — Commended Performance" if overall >= 85 else "⭐ Strong Critical Thinker — Great Exchange"

    return {
        "session_id": session["id"],
        "topic": topic,
        "student_stance": student_stance,
        "rounds_completed": rounds,
        "overall_score": overall,
        "verdict": verdict,
        "logic_score": logic,
        "evidence_score": evidence,
        "rebuttal_score": rebuttal,
        "civility_score": civility,
        "strengths": [
            "Articulate thesis with structured reasoning.",
            "Prompt, confident delivery and respectful engagement.",
            "Maintained stance under rigorous opposing cross-examination."
        ],
        "areas_for_improvement": [
            "Cite specific empirical studies or numerical data to reinforce claims.",
            "Directly dismantle the opposing counter-question before introducing new assertions."
        ],
        "judge_commentary": (
            f"In this parliamentary debate on '{topic}', the student defended the {student_stance} position with clarity and conviction across {rounds} round(s). "
            "The dialogue demonstrated commendable critical reasoning, quick rebuttal adaptability, and intellectual maturity."
        )
    }

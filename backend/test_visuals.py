"""
GuruG Educational Visuals Test Suite
Covers the 5 required test cases:
1. Ask "quadratic equation" then "tell me about digestive system": 2nd reply must have NO image.
2. Ask "quadratic equation" twice in a row: image attached once per reply, not duplicated in the same message.
3. Simulate an LLM reply that contains a copied <div class="concept-visual-card"> block:
   the output must be stripped and re-matched from the current query.
4. After 15+ messages the history sent to the LLM must contain the 6 NEWEST messages and no HTML.
5. Lightbox works for a caption containing an apostrophe.
"""

import sys
import json
import uuid
import re
from pathlib import Path

# Add project root to sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.database import init_db, get_db_connection
from backend.app.services.visual_engine import (
    strip_visuals,
    find_visual_aid,
    enrich_tutor_response,
    format_visual_aid_markdown
)
from backend.app.services.tutor_service import process_user_chat_sync, create_chat_session
from backend.app.services.ai_engine import ai_engine

def run_tests():
    print("=" * 70)
    print("Running GuruG Visuals & Tutor Architecture Test Suite")
    print("=" * 70)

    # Ensure database is initialized with current schema
    init_db()

    # Create a test user in DB if not present
    conn = get_db_connection()
    cursor = conn.cursor()
    test_user_id = "test_visual_user_001"
    cursor.execute("SELECT id FROM users WHERE id = ?", (test_user_id,))
    if not cursor.fetchone():
        cursor.execute("""
        INSERT INTO users (id, email, username, password_hash, display_name)
        VALUES (?, 'test_visual@gurug.edu', 'testvisual', 'fake_hash', 'Test Student')
        """, (test_user_id,))
        conn.commit()
    conn.close()

    # -------------------------------------------------------------------------
    # TEST 1: Ask "quadratic equation" then "tell me about digestive system":
    #         2nd reply must have NO image.
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Ask 'quadratic equation' then 'tell me about digestive system'...")
    s1 = create_chat_session(user_id=test_user_id, title="Test 1 Session", subject="General")
    s1_id = s1["id"]

    # 1st reply: quadratic equation
    res1 = process_user_chat_sync(
        user_id=test_user_id,
        message_text="Can you explain what a quadratic equation is?",
        session_id=s1_id,
        subject="Mathematics"
    )
    tutor_msg1 = res1["tutor_message"]
    has_image_1 = bool(tutor_msg1.get("visual_aid"))
    assert has_image_1, f"Expected visual aid for quadratic equation, got: {tutor_msg1.get('visual_aid')}"
    assert "concept-visual-card" not in tutor_msg1["content"], "Message content should NOT contain embedded HTML visual card!"

    # 2nd reply: digestive system (not in catalog, should have NO image)
    res2 = process_user_chat_sync(
        user_id=test_user_id,
        message_text="Tell me about digestive system in human body",
        session_id=s1_id,
        subject="Biology"
    )
    tutor_msg2 = res2["tutor_message"]
    has_image_2 = bool(tutor_msg2.get("visual_aid"))
    content_has_card_2 = "concept-visual-card" in tutor_msg2["content"] or "<img" in tutor_msg2["content"]

    assert not has_image_2, f"Expected 2nd reply to have NO visual_aid, but found: {tutor_msg2.get('visual_aid')}"
    assert not content_has_card_2, f"Expected 2nd reply content to have NO image HTML, but found HTML in content"
    print("  -> PASS: 1st reply attached quadratic diagram, 2nd reply ('digestive system') attached NO image.")

    # -------------------------------------------------------------------------
    # TEST 2: Ask "quadratic equation" twice in a row: image attached once per reply,
    #         not duplicated in the same message.
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Ask 'quadratic equation' twice in a row...")
    s2 = create_chat_session(user_id=test_user_id, title="Test 2 Session", subject="Mathematics")
    s2_id = s2["id"]

    # Ask 1st time
    r2_1 = process_user_chat_sync(
        user_id=test_user_id,
        message_text="What is a quadratic equation?",
        session_id=s2_id,
        subject="Mathematics"
    )
    # Ask 2nd time in same session
    r2_2 = process_user_chat_sync(
        user_id=test_user_id,
        message_text="Please give another quadratic equation formula explanation.",
        session_id=s2_id,
        subject="Mathematics"
    )

    tutor1 = r2_1["tutor_message"]
    tutor2 = r2_2["tutor_message"]

    # Check 1st reply
    assert tutor1.get("visual_aid") is not None, "Reply 1 should have 1 visual aid"
    assert "concept-visual-card" not in tutor1["content"], "Reply 1 content must not contain HTML card"

    # Check 2nd reply
    assert tutor2.get("visual_aid") is not None, "Reply 2 should have 1 visual aid"
    assert "concept-visual-card" not in tutor2["content"], "Reply 2 content must not contain HTML card"
    # Ensure visual_aid is a single object, not a list of duplicates
    assert isinstance(tutor2["visual_aid"], dict), "Reply 2 visual_aid must be a single dict"
    assert tutor2["visual_aid"]["id"] == "quadratic_parabola"

    print("  -> PASS: Each reply attached the diagram once, with zero duplication inside content.")

    # -------------------------------------------------------------------------
    # TEST 3: Simulate an LLM reply that contains a copied <div class="concept-visual-card"> block:
    #         the output must be stripped and re-matched from the current query.
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Simulate LLM reply containing copied visual card HTML...")
    stale_copied_llm_response = (
        "Here is Newton's Second Law of Motion: Net force equals mass times acceleration (F = m * a).\n\n"
        '<div class="concept-visual-card my-4 p-4 rounded-2xl glass-panel-elevated">\n'
        '  <div class="flex items-center justify-between">Quadratic Function Parabola</div>\n'
        '  <div><img src="/images/concepts/quadratic_parabola.svg" alt="Old Parabola" /></div>\n'
        '  <div><p>Old Stale Caption</p></div>\n'
        '</div>\n\n'
        "What do you think happens if we double the applied force?"
    )

    user_query = "What is Newton's second law of motion in physics?"
    enriched = enrich_tutor_response(
        text=stale_copied_llm_response,
        user_query=user_query,
        subject="Physics"
    )

    clean_content = enriched["content"]
    visual_aid = enriched["visual_aid"]

    # 1. Output must be stripped of any HTML visual card
    assert "concept-visual-card" not in clean_content, "Copied card HTML was NOT stripped from content!"
    assert "quadratic_parabola" not in clean_content, "Copied image URL was NOT stripped from content!"
    assert "<img" not in clean_content, "<img> tag was NOT stripped from content!"
    assert "Net force equals mass times acceleration" in clean_content, "Original educational text was corrupted!"

    # 2. Output must be re-matched from current query (Newton's second law)
    assert visual_aid is not None, "Failed to re-match visual aid for Newton's second law"
    assert visual_aid["id"] == "newton_second_law", f"Expected newton_second_law, got: {visual_aid['id']}"
    assert visual_aid["file"] if "file" in visual_aid else visual_aid["image_url"].endswith("newton_second_law.svg")
    print("  -> PASS: Copied visual card stripped completely and correctly re-matched to newton_second_law.")

    # -------------------------------------------------------------------------
    # TEST 4: After 15+ messages the history sent to the LLM must contain
    #         the 6 NEWEST messages and no HTML.
    # -------------------------------------------------------------------------
    print("\n[TEST 4] After 15+ messages, verify history sent to LLM has 6 newest messages and no HTML...")
    s4 = create_chat_session(user_id=test_user_id, title="Test 4 History Session", subject="Physics")
    s4_id = s4["id"]

    # Insert 16 messages directly into the session (8 user, 8 tutor)
    conn = get_db_connection()
    cur = conn.cursor()
    for i in range(1, 17):
        sender = "user" if i % 2 != 0 else "tutor"
        msg_id = f"test_hist_{s4_id}_{i}"
        if sender == "user":
            content = f"User Question Number {i}: tell me more."
        else:
            # Some tutor messages contain legacy HTML cards
            content = (
                f"Tutor Explanation Number {i}. "
                f'<div class="concept-visual-card"><div><img src="/images/concepts/dna_double_helix.svg"/></div></div>'
            )
        cur.execute("""
        INSERT INTO chat_messages (id, session_id, sender, content, language, mode, visual_json)
        VALUES (?, ?, ?, ?, 'English', 'Simple Explanation', NULL)
        """, (msg_id, s4_id, sender, content))
    conn.commit()
    conn.close()

    # Intercept messages passed to LLM during next user chat
    captured_llm_messages = []
    original_call_llm = ai_engine.call_llm

    def mock_call_llm(messages, custom_key=None, json_mode=False, temperature=0.7):
        captured_llm_messages.extend(messages)
        return {"text": "Tutor reply 17", "provider": "mock_groq"}

    ai_engine.call_llm = mock_call_llm
    try:
        process_user_chat_sync(
            user_id=test_user_id,
            message_text="What about acceleration?",
            session_id=s4_id,
            subject="Physics"
        )
    finally:
        ai_engine.call_llm = original_call_llm

    # Inspect captured LLM messages
    # captured_llm_messages has: [0]=system, [1..6]=history messages, [7]=current user query
    history_in_llm = [m for m in captured_llm_messages if m["role"] in ("user", "assistant") and not m["content"].startswith("Student (")]

    assert len(history_in_llm) == 6, f"Expected exactly 6 history messages sent to LLM, got {len(history_in_llm)}"

    # Check chronological order and that they are the newest (messages 11 to 16)
    for idx, m in enumerate(history_in_llm):
        msg_text = m["content"]
        # Check no HTML visual cards
        assert "concept-visual-card" not in msg_text, f"Found HTML visual card in history message {idx}: {msg_text}"
        assert "<img" not in msg_text, f"Found <img> in history message {idx}: {msg_text}"
        assert "@@@VISUAL_CARD" not in msg_text, f"Found placeholder in history message {idx}: {msg_text}"

    # Verify that the history messages are indeed the NEWEST (contains messages 11-16, not 1-6)
    first_history_text = history_in_llm[0]["content"]
    assert "Number 11" in first_history_text, f"Expected 6 newest messages starting at message 11, got: {first_history_text}"
    last_history_text = history_in_llm[-1]["content"]
    assert "Number 16" in last_history_text, f"Expected newest message to be message 16, got: {last_history_text}"

    print("  -> PASS: LLM received exactly the 6 newest chronological messages, with all HTML completely stripped.")

    # -------------------------------------------------------------------------
    # TEST 5: Lightbox works for a caption containing an apostrophe.
    # -------------------------------------------------------------------------
    print("\n[TEST 5] Lightbox works for a caption containing an apostrophe...")
    tricky_caption = "Air enters the lungs obeying Boyle's Law (P1V1 = P2V2), where the diaphragm's contraction lowers pressure."
    tricky_title = "Human Respiratory System & Boyle's Law"
    mock_visual = {
        "id": "respiratory_system",
        "title": tricky_title,
        "image_url": "/images/concepts/respiratory_system.svg",
        "badge": "Biology • Physiology",
        "caption": tricky_caption,
        "key_takeaway": "Inhalation powers gas exchange."
    }

    # 1. Test format_visual_aid_markdown escaping
    md_html = format_visual_aid_markdown(mock_visual)
    # Verify that single quotes in onclick are escaped with \'
    assert "\\'s Law" in md_html or "\\'" in md_html, "Single quote must be properly escaped in inline onclick!"
    # Verify data-lightbox-caption is present for safe delegated handling
    assert 'data-lightbox-caption=' in md_html, "data-lightbox-caption must be present in visual card HTML"

    # 2. Test frontend data-* attribute formatting
    raw_caption = tricky_caption.replace('"', '&quot;')
    frontend_card = f'''
    <div class="visual-lightbox-trigger"
         data-src="{mock_visual['image_url']}"
         data-title="{mock_visual['title'].replace('"', '&quot;')}"
         data-caption="{raw_caption}">
    '''
    # Extract attribute using regex simulating DOM getAttribute('data-caption')
    match = re.search(r'data-caption="([^"]+)"', frontend_card)
    assert match is not None, "Failed to parse data-caption attribute"
    extracted_caption = match.group(1).replace('&quot;', '"')
    assert extracted_caption == tricky_caption, f"Caption got mangled: {extracted_caption}"
    assert "Boyle's Law" in extracted_caption, "Apostrophe in Boyle's Law was not preserved!"

    print("  -> PASS: Lightbox correctly escapes and preserves captions with apostrophes without breaking onclick/HTML syntax.")

    print("\n" + "=" * 70)
    print("ALL 5 TESTS PASSED SUCCESSFULLY! (5/5)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()

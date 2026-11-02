#!/usr/bin/env python3
"""
GuruG Chat Messages Visual Cleanup Script
1. Backs up data/gurug.db to data/gurug.db.bak
2. Ensures visual_json column exists
3. Strips embedded HTML concept-visual-card blocks, <img> tags, and markdown images from chat_messages.content
4. Re-evaluates topical relevance for visual_json to remove stale/mismatched diagrams
"""

import sys
import os
import shutil
import json
import sqlite3
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from backend.app.config import DATABASE_PATH
from backend.app.services.visual_engine import strip_visuals, find_visual_aid

def run_cleanup():
    db_path = Path(DATABASE_PATH)
    if not db_path.exists():
        print(f"[CleanVisuals] Database not found at {db_path}. Nothing to clean.")
        return

    # 1. Backup database
    backup_path = db_path.with_suffix(".db.bak")
    print(f"[CleanVisuals] Backing up database from {db_path} to {backup_path}...")
    shutil.copy2(db_path, backup_path)
    print(f"[CleanVisuals] Backup completed successfully ({backup_path.stat().st_size} bytes).")

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 2. Ensure visual_json column exists
    cursor.execute("PRAGMA table_info(chat_messages)")
    cols = [c[1] for c in cursor.fetchall()]
    if "visual_json" not in cols:
        print("[CleanVisuals] Adding visual_json column to chat_messages...")
        cursor.execute("ALTER TABLE chat_messages ADD COLUMN visual_json TEXT")
        conn.commit()

    # 3. Fetch all messages ordered chronologically
    cursor.execute("SELECT id, session_id, sender, content, visual_json FROM chat_messages ORDER BY rowid ASC")
    all_msgs = [dict(r) for r in cursor.fetchall()]

    cleaned_count = 0
    updated_visuals = 0

    # Group messages by session to know the preceding user query for topical re-matching
    session_user_queries = {}

    for msg in all_msgs:
        session_id = msg["session_id"]
        sender = msg["sender"]
        raw_content = msg["content"] or ""
        current_visual_json = msg["visual_json"]

        if sender == "user":
            session_user_queries[session_id] = raw_content
            # Strip any visual tokens that might have been saved in user content
            clean_user = strip_visuals(raw_content)
            if clean_user != raw_content:
                cursor.execute("UPDATE chat_messages SET content = ? WHERE id = ?", (clean_user, msg["id"]))
                cleaned_count += 1
            continue

        # Tutor messages
        has_card = "concept-visual-card" in raw_content or "<img" in raw_content or "@@@VISUAL_CARD" in raw_content or "![" in raw_content
        clean_content = strip_visuals(raw_content)

        # Check topical match using preceding user query
        user_query = session_user_queries.get(session_id, "")
        verified_visual = find_visual_aid(user_query=user_query, tutor_response=clean_content) if user_query else None
        
        # If visual_json is already present and valid, keep it unless it was stale
        new_visual_json = json.dumps(verified_visual) if verified_visual else None

        if has_card or clean_content != raw_content or current_visual_json != new_visual_json:
            cursor.execute(
                "UPDATE chat_messages SET content = ?, visual_json = ? WHERE id = ?",
                (clean_content, new_visual_json, msg["id"])
            )
            cleaned_count += 1
            if verified_visual:
                updated_visuals += 1

    conn.commit()
    conn.close()

    print(f"[CleanVisuals] Successfully cleaned {cleaned_count} messages.")
    print(f"[CleanVisuals] High-confidence topical visual aids assigned: {updated_visuals}.")
    print("[CleanVisuals] Stale / mismatched cards completely purged from chat history.")

if __name__ == "__main__":
    run_cleanup()

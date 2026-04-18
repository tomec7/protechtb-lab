#!/usr/bin/env python3
import json
import os
from pathlib import Path
from datetime import datetime, timezone

from agentmail import AgentMail

WORKSPACE = Path("/home/lenovo/.openclaw/workspace")
STATE_PATH = WORKSPACE / "state" / "agentmail_autobot_state.json"
TASKS_PATH = WORKSPACE / "state" / "agentmail_tasks.md"
INBOX_ID = os.getenv("AGENTMAIL_INBOX_ID", "max.tomec7@agentmail.to")


def load_key() -> str:
    key = os.getenv("AGENTMAIL_API_KEY", "").strip()
    if key:
        return key
    env_file = WORKSPACE / ".env.agentmail"
    if env_file.exists():
        for line in env_file.read_text(encoding="utf-8", errors="ignore").splitlines():
            if line.startswith("AGENTMAIL_API_KEY="):
                return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("AGENTMAIL_API_KEY not found")


def load_state() -> dict:
    if not STATE_PATH.exists():
        return {"processed_message_ids": []}
    try:
        return json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except Exception:
        return {"processed_message_ids": []}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")


def append_task(text: str, sender: str, subject: str) -> None:
    TASKS_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not TASKS_PATH.exists():
        TASKS_PATH.write_text("# AgentMail tasks\n\n", encoding="utf-8")
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    with TASKS_PATH.open("a", encoding="utf-8") as f:
        f.write(f"- [ ] {text} _(from: {sender}, subject: {subject}, {stamp})_\n")


def main() -> int:
    api_key = load_key()
    client = AgentMail(api_key=api_key)

    state = load_state()
    processed = set(state.get("processed_message_ids", []))

    resp = client.inboxes.messages.list(INBOX_ID, limit=50)
    messages = list(getattr(resp, "messages", []) or [])

    new_count = 0
    replied_count = 0
    task_count = 0

    for m in sorted(messages, key=lambda x: (getattr(x, "timestamp", None) or datetime.min.replace(tzinfo=timezone.utc))):
        message_id = getattr(m, "message_id", None)
        if not message_id or message_id in processed:
            continue

        labels = set(getattr(m, "labels", []) or [])
        if "received" not in labels:
            continue

        sender = getattr(m, "from_", "") or ""
        if INBOX_ID in sender:
            continue

        subject = (getattr(m, "subject", "") or "").strip()
        body_preview = (getattr(m, "preview", "") or "").strip()
        low = f"{subject}\n{body_preview}".lower()

        # simple action extraction
        if "task:" in low:
            try:
                idx = low.index("task:")
                raw = (subject + "\n" + body_preview)[idx + 5 :].strip()
                if raw:
                    append_task(raw.splitlines()[0][:180], sender, subject)
                    task_count += 1
            except Exception:
                pass

        reply_text = (
            "Ahoj,\n\n"
            "email som prijal. Som online asistent a správu som zaevidoval. "
            "Ak je potrebné vykonať akciu, spracujem ju podľa inštrukcií.\n\n"
            "Pre prioritu môžeš do predmetu doplniť [URGENT] alebo použiť tvar 'TASK: ...'.\n\n"
            "Ďakujem."
        )

        client.inboxes.messages.reply(INBOX_ID, message_id, text=reply_text)
        replied_count += 1
        new_count += 1
        processed.add(message_id)

    state["processed_message_ids"] = sorted(processed)
    state["last_run_utc"] = datetime.now(timezone.utc).isoformat()
    save_state(state)

    print(f"inbox={INBOX_ID} processed={new_count} replied={replied_count} tasks={task_count} total_seen={len(processed)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

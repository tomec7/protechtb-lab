#!/usr/bin/env python3
import email
import imaplib
import json
import os
import re
from email.header import decode_header
from pathlib import Path
from datetime import datetime, timezone

STATE_PATH = Path(os.getenv("MAIL_STATE_PATH", "/home/lenovo/.openclaw/workspace/memory/mailbox-state.json"))


def decode_mime(value: str) -> str:
    if not value:
        return ""
    parts = decode_header(value)
    out = []
    for text, enc in parts:
        if isinstance(text, bytes):
            out.append(text.decode(enc or "utf-8", errors="replace"))
        else:
            out.append(text)
    return "".join(out)


def load_state() -> dict:
    if not STATE_PATH.exists():
        return {"notified_uids": [], "last_run": None}
    try:
        return json.loads(STATE_PATH.read_text())
    except Exception:
        return {"notified_uids": [], "last_run": None}


def save_state(state: dict) -> None:
    STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    STATE_PATH.write_text(json.dumps(state, ensure_ascii=False, indent=2))


def important_match(subject: str, sender: str) -> bool:
    keywords = [x.strip().lower() for x in os.getenv("MAIL_IMPORTANT_KEYWORDS", "dopyt,ponuka,protech,urgent,cenová ponuka").split(",") if x.strip()]
    froms = [x.strip().lower() for x in os.getenv("MAIL_IMPORTANT_FROMS", "").split(",") if x.strip()]

    s = (subject or "").lower()
    f = (sender or "").lower()

    kw_hit = any(k in s for k in keywords)
    from_hit = any(x in f for x in froms) if froms else False
    return kw_hit or from_hit


def main() -> int:
    host = os.getenv("MAIL_IMAP_HOST", "")
    port = int(os.getenv("MAIL_IMAP_PORT", "993"))
    user = os.getenv("MAIL_USER", "")
    password = os.getenv("MAIL_PASS", "")
    folder = os.getenv("MAIL_FOLDER", "INBOX")

    if not all([host, user, password]):
        print(json.dumps({
            "ok": False,
            "error": "missing_credentials",
            "needed": ["MAIL_IMAP_HOST", "MAIL_USER", "MAIL_PASS"]
        }, ensure_ascii=False))
        return 2

    state = load_state()
    notified = set(state.get("notified_uids", []))
    new_notified = set(notified)

    important_new = []
    all_new = []

    with imaplib.IMAP4_SSL(host, port) as m:
        m.login(user, password)
        m.select(folder)
        typ, data = m.uid("search", None, "ALL")
        if typ != "OK":
            raise RuntimeError("imap_search_failed")

        uids = data[0].split() if data and data[0] else []

        for uid_b in uids[-200:]:
            uid = uid_b.decode()
            if uid in notified:
                continue

            typ, msg_data = m.uid("fetch", uid_b, "(BODY.PEEK[HEADER.FIELDS (FROM SUBJECT DATE)] FLAGS)")
            if typ != "OK" or not msg_data:
                continue

            raw = b""
            for part in msg_data:
                if isinstance(part, tuple) and part[1]:
                    raw += part[1]

            if not raw:
                continue

            msg = email.message_from_bytes(raw)
            subject = decode_mime(msg.get("Subject", ""))
            sender = decode_mime(msg.get("From", ""))
            date = decode_mime(msg.get("Date", ""))

            row = {
                "uid": uid,
                "from": sender,
                "subject": subject,
                "date": date,
                "important": important_match(subject, sender),
            }
            all_new.append(row)
            if row["important"]:
                important_new.append(row)

            new_notified.add(uid)

    state["notified_uids"] = sorted(new_notified, key=lambda x: int(x))[-3000:]
    state["last_run"] = datetime.now(timezone.utc).isoformat()
    save_state(state)

    print(json.dumps({
        "ok": True,
        "new_count": len(all_new),
        "important_count": len(important_new),
        "important": important_new[:10],
    }, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

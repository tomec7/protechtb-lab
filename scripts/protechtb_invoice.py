#!/usr/bin/env python3
from __future__ import annotations

import argparse
import base64
import re
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
from pathlib import Path
from typing import List, Tuple

import cairosvg
from agentmail import AgentMail
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

WS = Path("/home/lenovo/.openclaw/workspace")
OUT_DIR = WS / "exports"
OUT_DIR.mkdir(parents=True, exist_ok=True)

INBOX_ID = "max.tomec7@agentmail.to"
LOGO_SVG_URL = "https://tomec7.github.io/protechtb-lab/assets/logo-protechtb-v2-emblem.svg?v=2"
LOGO_PNG_PATH = OUT_DIR / "protechtb-logo-v2-emblem.png"

# protechtb-lab palette (pro.css)
BG = "#0c111b"
BG2 = "#151d2d"
GOLD = "#d6af63"
GOLD2 = "#b98938"
TEXT = "#eef3ff"
MUTED = "#a8b4ce"
LINE = "#2d3c59"
CARD = "#1b263a"

NAME_MAP = {
    "cpu": "Intel Core Ultra 7 265KF",
    "doska": "ASRock B860M Pro A",
    "chladic": "DeepCool AG400",
    "ram": "Kingston FURY 32GB DDR5 6000MHz CL36 Beast EXPO",
    "grafika": "ASUS Dual GeForce RTX 5060 8G OC",
    "zdroj": "ADATA XPG Pylon Bronze 750 W",
    "skrina": "DarkFlash Aquarius",
    "disk nvme": "Patriot P400 Lite 1TB",
    "monitor": '34" Dahua LM34-E330CA',
}


@dataclass
class InvoiceItem:
    name: str
    price: Decimal


def load_api_key() -> str:
    env_file = WS / ".env.agentmail"
    if not env_file.exists():
        raise RuntimeError(".env.agentmail not found")
    for line in env_file.read_text(encoding="utf-8", errors="ignore").splitlines():
        if line.startswith("AGENTMAIL_API_KEY="):
            return line.split("=", 1)[1].strip().strip('"').strip("'")
    raise RuntimeError("AGENTMAIL_API_KEY not found")


def parse_items_from_email(text: str) -> List[InvoiceItem]:
    line_pat = re.compile(
        r"^\s*\*?\s*([A-Za-zÁÄČĎÉÍĹĽŇÓÔŔŠŤÚÝŽáäčďéíĺľňóôŕšťúýž0-9 ]+?)\s*\*?\s*:?\s+(\d+,\d{2})\s*€\s*$"
    )
    parsed: List[Tuple[str, Decimal]] = []
    for ln in text.splitlines():
        m = line_pat.match(ln.strip())
        if not m:
            continue
        raw_name = m.group(1).strip()
        if raw_name.lower() == "komplet":
            continue
        price = Decimal(m.group(2).replace(",", "."))
        parsed.append((raw_name, price))

    # fallback CPU in markdown format
    if not any(n.lower() == "cpu" for n, _ in parsed):
        m = re.search(r"\*?\s*CPU\s*\*?\s*(\d+,\d{2})\s*€", text, flags=re.IGNORECASE)
        if m:
            parsed.insert(0, ("CPU", Decimal(m.group(1).replace(",", "."))))

    items: List[InvoiceItem] = []
    for raw, price in parsed:
        clean = NAME_MAP.get(raw.lower(), raw)
        items.append(InvoiceItem(name=clean, price=price))
    return items


def ensure_assets() -> None:
    if not LOGO_PNG_PATH.exists():
        cairosvg.svg2png(url=LOGO_SVG_URL, write_to=str(LOGO_PNG_PATH), output_width=900)

    pdfmetrics.registerFont(TTFont("DV", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"))
    pdfmetrics.registerFont(TTFont("DV-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"))


def euro(value: Decimal) -> str:
    return f"{value:.2f}".replace(".", ",") + " €"


def build_invoice_pdf(
    invoice_no: str,
    customer_company: str,
    customer_address: str,
    customer_city: str,
    customer_ico: str,
    customer_dic: str,
    items: List[InvoiceItem],
    non_vat: bool = True,
) -> Path:
    out = OUT_DIR / f"faktura-{invoice_no}.pdf"
    c = canvas.Canvas(str(out), pagesize=A4)
    W, H = A4

    subtotal = sum((it.price for it in items), Decimal("0.00"))

    c.setFillColor(colors.HexColor(BG))
    c.rect(0, H - 56 * mm, W, 56 * mm, fill=1, stroke=0)
    c.setFillColor(colors.HexColor(GOLD2))
    c.rect(0, H - 56 * mm, W, 2.2 * mm, fill=1, stroke=0)

    if LOGO_PNG_PATH.exists():
        c.drawImage(ImageReader(str(LOGO_PNG_PATH)), 16 * mm, H - 45 * mm, width=66 * mm, height=28 * mm, mask="auto", preserveAspectRatio=True, anchor="sw")

    c.setFillColor(colors.HexColor(TEXT))
    c.setFont("DV-Bold", 19)
    c.drawRightString(195 * mm, H - 20 * mm, "FAKTÚRA")
    c.setFont("DV", 9.8)
    c.drawRightString(195 * mm, H - 26.5 * mm, f"Číslo: {invoice_no}")
    c.drawRightString(195 * mm, H - 31.5 * mm, f"Vystavená: {datetime.now().strftime('%d.%m.%Y')}")
    c.drawRightString(195 * mm, H - 36.5 * mm, f"Splatnosť: {(datetime.now() + timedelta(days=7)).strftime('%d.%m.%Y')}")

    y0 = H - 66 * mm
    c.setFillColor(colors.HexColor(CARD))
    c.roundRect(15 * mm, y0 - 32 * mm, 87 * mm, 32 * mm, 2.8 * mm, fill=1, stroke=0)
    c.roundRect(108 * mm, y0 - 32 * mm, 87 * mm, 32 * mm, 2.8 * mm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor(TEXT))
    c.setFont("DV-Bold", 10)
    c.drawString(20 * mm, y0 - 8 * mm, "Dodávateľ")
    c.setFont("DV", 9.4)
    c.drawString(20 * mm, y0 - 14 * mm, "protechtb s.r.o.")
    c.drawString(20 * mm, y0 - 19 * mm, "Slavicia 42, Chorvátsky Grob 90025")
    c.drawString(20 * mm, y0 - 24 * mm, "Telefón: 0949093573")

    c.setFont("DV-Bold", 10)
    c.drawString(113 * mm, y0 - 8 * mm, "Odberateľ")
    c.setFont("DV", 9.4)
    c.drawString(113 * mm, y0 - 14 * mm, customer_company)
    c.drawString(113 * mm, y0 - 19 * mm, customer_address)
    c.drawString(113 * mm, y0 - 24 * mm, customer_city)
    c.drawString(113 * mm, y0 - 29 * mm, f"IČO: {customer_ico}   DIČ: {customer_dic}")

    top = y0 - 41 * mm
    c.setFillColor(colors.HexColor(BG2))
    c.rect(15 * mm, top - 8 * mm, 180 * mm, 8 * mm, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor(LINE))
    c.line(15 * mm, top - 8 * mm, 195 * mm, top - 8 * mm)

    c.setFillColor(colors.HexColor(TEXT))
    c.setFont("DV-Bold", 9)
    c.drawString(18 * mm, top - 5.4 * mm, "#")
    c.drawString(26 * mm, top - 5.4 * mm, "Názov položky")
    c.drawRightString(156 * mm, top - 5.4 * mm, "Množstvo")
    c.drawRightString(176 * mm, top - 5.4 * mm, "J. cena")
    c.drawRightString(192 * mm, top - 5.4 * mm, "Spolu")

    row = top - 13 * mm
    for i, it in enumerate(items, start=1):
        if i % 2 == 0:
            c.setFillColor(colors.HexColor("#f7f9fd"))
            c.rect(15 * mm, row - 4 * mm, 180 * mm, 6.8 * mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#111827"))
        c.setFont("DV", 8.8)
        c.drawString(18 * mm, row, str(i))
        n = it.name if len(it.name) <= 67 else it.name[:64] + "..."
        c.drawString(26 * mm, row, n)
        c.drawRightString(156 * mm, row, "1 ks")
        c.drawRightString(176 * mm, row, euro(it.price))
        c.drawRightString(192 * mm, row, euro(it.price))
        c.setStrokeColor(colors.HexColor("#e5e7eb"))
        c.line(15 * mm, row - 4.5 * mm, 195 * mm, row - 4.5 * mm)
        row -= 6.8 * mm

    sy = row - 4 * mm
    c.setFillColor(colors.HexColor(BG2))
    c.roundRect(118 * mm, sy - 19 * mm, 77 * mm, 19 * mm, 2.2 * mm, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor(GOLD2))
    c.roundRect(118 * mm, sy - 19 * mm, 77 * mm, 19 * mm, 2.2 * mm, fill=0, stroke=1)

    c.setFillColor(colors.HexColor(GOLD))
    c.setFont("DV-Bold", 10)
    c.drawString(122 * mm, sy - 12.5 * mm, "Celkom na úhradu:")
    c.drawRightString(191 * mm, sy - 12.5 * mm, euro(subtotal))

    c.setFillColor(colors.HexColor(MUTED))
    c.setFont("DV", 8.4)
    if non_vat:
        c.drawString(15 * mm, 16 * mm, "Dodávateľ nie je platiteľ DPH.")
    c.drawString(15 * mm, 11 * mm, "Ďakujeme za objednávku. Faktúra bola vystavená elektronicky.")

    c.showPage()
    c.save()
    return out


def main() -> int:
    p = argparse.ArgumentParser(description="Generate ProTechTB branded invoice PDF and optionally send by email reply.")
    p.add_argument("--message-id", required=True, help="Source email message-id to parse and reply to")
    p.add_argument("--section", default="BUILD", help="Invoice section code in invoice number, e.g. BUILD")
    p.add_argument("--customer-company", default="Michal Mitter")
    p.add_argument("--customer-address", default="")
    p.add_argument("--customer-city", default="")
    p.add_argument("--customer-ico", default="")
    p.add_argument("--customer-dic", default="")
    p.add_argument("--service-name", default="PC Build - praca, testovanie a optimalizacia")
    p.add_argument("--service-price", type=Decimal, default=Decimal("199.00"))
    p.add_argument("--send", action="store_true", help="Send invoice as email reply")
    args = p.parse_args()

    ensure_assets()
    client = AgentMail(api_key=load_api_key())
    full = client.inboxes.messages.get(INBOX_ID, args.message_id)
    text = (getattr(full, "text", "") or "")

    items = parse_items_from_email(text)
    items.append(InvoiceItem(name=args.service_name, price=args.service_price))

    ts = datetime.now().strftime("%Y%m%d-%H%M")
    invoice_no = f"PTB-{args.section.upper()}-{ts}"
    pdf = build_invoice_pdf(
        invoice_no=invoice_no,
        customer_company=args.customer_company,
        customer_address=args.customer_address,
        customer_city=args.customer_city,
        customer_ico=args.customer_ico,
        customer_dic=args.customer_dic,
        items=items,
        non_vat=True,
    )

    if args.send:
        b64 = base64.b64encode(pdf.read_bytes()).decode("ascii")
        msg = (
            "Ahoj,\n\n"
            f"posielam upravenú faktúru (sekcia {args.section.upper()}) so správnym logom/farbami brandu a bez DPH riadkov.\n"
            "V prílohe je finálna PDF verzia.\n\n"
            "Max"
        )
        client.inboxes.messages.reply(
            INBOX_ID,
            args.message_id,
            text=msg,
            attachments=[
                {
                    "filename": pdf.name,
                    "content_type": "application/pdf",
                    "content_disposition": "attachment",
                    "content": b64,
                }
            ],
        )

    print(f"invoice_no={invoice_no}")
    print(f"pdf={pdf}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

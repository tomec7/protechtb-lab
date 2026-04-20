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

SERVICE_TEMPLATES = {
    "sk": {
        "BUILD": ("PC Build – zostavenie, testovanie a optimalizácia", Decimal("199.00")),
        "HA": ("Home Assistant & Smart Home - navrh, implementacia a automatizacie", Decimal("199.00")),
        "NAS": ("NAS & Backup - nasadenie, zalohovanie a recovery test", Decimal("249.00")),
        "MULTI": ("Multi-Hub Integracie - prepojenie platforiem a zariadeni", Decimal("199.00")),
        "ITCARE": ("IT Care Monthly - monitoring, podpora a pravidelny health-check", Decimal("49.00")),
    },
    "en": {
        "BUILD": ("PC Build - assembly, testing and optimization", Decimal("199.00")),
        "HA": ("Home Assistant & Smart Home - design, implementation and automations", Decimal("199.00")),
        "NAS": ("NAS & Backup - deployment, backups and recovery test", Decimal("249.00")),
        "MULTI": ("Multi-Hub Integrations - platform and device integration", Decimal("199.00")),
        "ITCARE": ("IT Care Monthly - monitoring, support and regular health check", Decimal("49.00")),
    },
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


def t(lang: str, key: str) -> str:
    sk = {
        "title": "FAKTÚRA",
        "invoice_no": "Číslo",
        "issued": "Vystavená",
        "due": "Splatnosť",
        "supplier": "Dodávateľ",
        "customer": "Odberateľ",
        "item": "Názov položky",
        "qty": "Množstvo",
        "unit": "J. cena",
        "sum": "Spolu",
        "total": "Celkom na úhradu:",
        "non_vat": "Dodávateľ nie je platiteľ DPH.",
        "thanks": "Ďakujeme za objednávku. Faktúra bola vystavená elektronicky.",
        "pcs": "1 ks",
    }
    en = {
        "title": "INVOICE",
        "invoice_no": "Number",
        "issued": "Issue date",
        "due": "Due date",
        "supplier": "Supplier",
        "customer": "Customer",
        "item": "Item description",
        "qty": "Quantity",
        "unit": "Unit price",
        "sum": "Total",
        "total": "Amount due:",
        "non_vat": "Supplier is not a VAT payer.",
        "thanks": "Thank you for your order. Invoice issued electronically.",
        "pcs": "1 pc",
    }
    d = en if lang == "en" else sk
    return d[key]


def build_invoice_pdf(
    invoice_no: str,
    customer_company: str,
    customer_address: str,
    customer_city: str,
    customer_ico: str,
    customer_dic: str,
    items: List[InvoiceItem],
    non_vat: bool = True,
    lang: str = "sk",
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
        c.drawImage(
            ImageReader(str(LOGO_PNG_PATH)),
            16 * mm,
            H - 45 * mm,
            width=66 * mm,
            height=28 * mm,
            mask="auto",
            preserveAspectRatio=True,
            anchor="sw",
        )

    c.setFillColor(colors.HexColor(TEXT))
    c.setFont("DV-Bold", 19)
    c.drawRightString(195 * mm, H - 20 * mm, t(lang, "title"))
    c.setFont("DV", 9.8)
    c.drawRightString(195 * mm, H - 26.5 * mm, f"{t(lang, 'invoice_no')}: {invoice_no}")
    c.drawRightString(195 * mm, H - 31.5 * mm, f"{t(lang, 'issued')}: {datetime.now().strftime('%d.%m.%Y')}")
    c.drawRightString(195 * mm, H - 36.5 * mm, f"{t(lang, 'due')}: {(datetime.now() + timedelta(days=7)).strftime('%d.%m.%Y')}")

    y0 = H - 66 * mm
    c.setFillColor(colors.HexColor(CARD))
    c.roundRect(15 * mm, y0 - 32 * mm, 87 * mm, 32 * mm, 2.8 * mm, fill=1, stroke=0)
    c.roundRect(108 * mm, y0 - 32 * mm, 87 * mm, 32 * mm, 2.8 * mm, fill=1, stroke=0)

    c.setFillColor(colors.HexColor(TEXT))
    c.setFont("DV-Bold", 10)
    c.drawString(20 * mm, y0 - 8 * mm, t(lang, "supplier"))
    c.setFont("DV", 9.4)
    c.drawString(20 * mm, y0 - 14 * mm, "protechtb s.r.o.")
    c.drawString(20 * mm, y0 - 19 * mm, "Slavicia 42, Chorvátsky Grob 90025")
    c.drawString(20 * mm, y0 - 24 * mm, "Telefón: 0949093573")

    c.setFont("DV-Bold", 10)
    c.drawString(113 * mm, y0 - 8 * mm, t(lang, "customer"))
    c.setFont("DV", 9.4)
    c.drawString(113 * mm, y0 - 14 * mm, customer_company)
    c.drawString(113 * mm, y0 - 19 * mm, customer_address)
    c.drawString(113 * mm, y0 - 24 * mm, customer_city)
    if customer_ico or customer_dic:
        c.drawString(113 * mm, y0 - 29 * mm, f"IČO: {customer_ico}   DIČ: {customer_dic}")

    top = y0 - 41 * mm
    c.setFillColor(colors.HexColor(BG2))
    c.rect(15 * mm, top - 8 * mm, 180 * mm, 8 * mm, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor(LINE))
    c.line(15 * mm, top - 8 * mm, 195 * mm, top - 8 * mm)

    c.setFillColor(colors.HexColor(TEXT))
    c.setFont("DV-Bold", 9)
    c.drawString(18 * mm, top - 5.4 * mm, "#")
    c.drawString(26 * mm, top - 5.4 * mm, t(lang, "item"))
    c.drawRightString(156 * mm, top - 5.4 * mm, t(lang, "qty"))
    c.drawRightString(176 * mm, top - 5.4 * mm, t(lang, "unit"))
    c.drawRightString(192 * mm, top - 5.4 * mm, t(lang, "sum"))

    # Increased spacing + neutral row colors for better readability
    row_h = 8.6 * mm
    row = top - 13 * mm
    for i, it in enumerate(items, start=1):
        c.setFillColor(colors.HexColor("#ffffff" if i % 2 else "#f8fafc"))
        c.rect(15 * mm, row - 5.0 * mm, 180 * mm, 8.0 * mm, fill=1, stroke=0)
        c.setFillColor(colors.HexColor("#0f172a"))
        c.setFont("DV", 8.8)
        c.drawString(18 * mm, row, str(i))
        n = it.name if len(it.name) <= 67 else it.name[:64] + "..."
        c.drawString(26 * mm, row, n)
        c.drawRightString(156 * mm, row, t(lang, "pcs"))
        c.drawRightString(176 * mm, row, euro(it.price))
        c.drawRightString(192 * mm, row, euro(it.price))
        c.setStrokeColor(colors.HexColor("#e2e8f0"))
        c.line(15 * mm, row - 5.2 * mm, 195 * mm, row - 5.2 * mm)
        row -= row_h

    sy = row - 4 * mm
    c.setFillColor(colors.HexColor(BG2))
    c.roundRect(118 * mm, sy - 19 * mm, 77 * mm, 19 * mm, 2.2 * mm, fill=1, stroke=0)
    c.setStrokeColor(colors.HexColor(GOLD2))
    c.roundRect(118 * mm, sy - 19 * mm, 77 * mm, 19 * mm, 2.2 * mm, fill=0, stroke=1)

    c.setFillColor(colors.HexColor(GOLD))
    c.setFont("DV-Bold", 10)
    c.drawString(122 * mm, sy - 12.5 * mm, t(lang, "total"))
    c.drawRightString(191 * mm, sy - 12.5 * mm, euro(subtotal))

    c.setFillColor(colors.HexColor(MUTED))
    c.setFont("DV", 8.4)
    if non_vat:
        c.drawString(15 * mm, 16 * mm, t(lang, "non_vat"))
    c.drawString(15 * mm, 11 * mm, t(lang, "thanks"))

    c.showPage()
    c.save()
    return out


def service_template(section: str, lang: str) -> Tuple[str, Decimal]:
    section = section.upper()
    pool = SERVICE_TEMPLATES.get(lang, SERVICE_TEMPLATES["sk"])
    if section in pool:
        return pool[section]
    return ("Služba", Decimal("0.00")) if lang == "sk" else ("Service", Decimal("0.00"))


def main() -> int:
    p = argparse.ArgumentParser(description="Generate ProTechTB branded invoice PDF and optionally send by email reply.")
    p.add_argument("--message-id", required=True, help="Source email message-id to parse and reply to")
    p.add_argument("--section", default="BUILD", help="Invoice section code, e.g. BUILD, NAS, HA, MULTI, ITCARE")
    p.add_argument("--lang", choices=["sk", "en"], default="sk", help="Invoice language")
    p.add_argument("--customer-company", default="")
    p.add_argument("--customer-address", default="")
    p.add_argument("--customer-city", default="")
    p.add_argument("--customer-ico", default="")
    p.add_argument("--customer-dic", default="")
    p.add_argument("--service-name", default="", help="Override template service name")
    p.add_argument("--service-price", default="", help="Override template service price, e.g. 199.00")
    p.add_argument("--only-service", action="store_true", help="Do not parse component items from email; invoice only service template")
    p.add_argument("--send", action="store_true", help="Send invoice as email reply")
    args = p.parse_args()

    ensure_assets()
    client = AgentMail(api_key=load_api_key())
    full = client.inboxes.messages.get(INBOX_ID, args.message_id)
    text = (getattr(full, "text", "") or "")

    items: List[InvoiceItem] = [] if args.only_service else parse_items_from_email(text)

    tpl_name, tpl_price = service_template(args.section, args.lang)
    final_service_name = args.service_name.strip() if args.service_name.strip() else tpl_name
    final_service_price = Decimal(args.service_price) if args.service_price.strip() else tpl_price
    items.append(InvoiceItem(name=final_service_name, price=final_service_price))

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
        lang=args.lang,
    )

    if args.send:
        b64 = base64.b64encode(pdf.read_bytes()).decode("ascii")
        if args.lang == "en":
            msg = (
                f"Hi,\n\nI’m sending the updated invoice (section {args.section.upper()}) in the requested style.\n"
                "The PDF attachment is final.\n\n"
                "Max"
            )
        else:
            msg = (
                f"Ahoj,\n\nposielam upravenú faktúru (sekcia {args.section.upper()}) s profi layoutom a väčším rozostupom riadkov položiek.\n"
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

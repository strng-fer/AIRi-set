from pathlib import Path

import fitz


def extract_pages(pdf_path: Path) -> list[dict]:
    pages: list[dict] = []
    with fitz.open(pdf_path) as doc:
        for page_index, page in enumerate(doc, start=1):
            text = page.get_text("text").strip()
            if text:
                pages.append({"page": page_index, "text": text})
    return pages


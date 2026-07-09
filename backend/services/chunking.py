from pathlib import Path
import hashlib


def chunk_pages(pdf_path: Path, pages: list[dict], chunk_size: int = 1200, overlap: int = 180) -> list[dict]:
    chunks: list[dict] = []
    path_hash = hashlib.sha1(str(pdf_path).encode("utf-8")).hexdigest()[:10]
    for page in pages:
        text = " ".join(page["text"].split())
        start = 0
        while start < len(text):
            end = start + chunk_size
            chunk_text = text[start:end].strip()
            if chunk_text:
                chunks.append(
                    {
                        "id": f"{path_hash}-{page['page']}-{start}",
                        "text": chunk_text,
                        "paper": pdf_path.name,
                        "page": page["page"],
                        "path": str(pdf_path),
                    }
                )
            if end >= len(text):
                break
            start = max(end - overlap, start + 1)
    return chunks

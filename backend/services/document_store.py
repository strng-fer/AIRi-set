import re
from hashlib import sha1
from pathlib import Path

from core.config import settings
from fastapi import HTTPException, UploadFile
from models.schemas import Paper


class DocumentStore:
    def __init__(self) -> None:
        settings.knowledge_base_dir.mkdir(parents=True, exist_ok=True)
        settings.uploads_dir.mkdir(parents=True, exist_ok=True)

    def list_papers(self) -> list[Paper]:
        papers: list[Paper] = []
        for base_dir, source in (
            (settings.knowledge_base_dir, "knowledge_base"),
            (settings.uploads_dir, "upload"),
        ):
            for path in sorted(base_dir.rglob("*.pdf")):
                category = path.parent.name if path.parent != base_dir else "uploads"
                papers.append(
                    Paper(
                        id=self._paper_id(path),
                        title=path.stem,
                        category=category,
                        path=self._display_path(path),
                        source=source,
                    )
                )
        return papers

    async def save_upload(self, file: UploadFile) -> Path:
        safe_name = self._safe_filename(file.filename or "paper.pdf")
        target = settings.uploads_dir / safe_name
        suffix = 1
        while target.exists():
            target = settings.uploads_dir / f"{Path(safe_name).stem}_{suffix}.pdf"
            suffix += 1

        content = await file.read()
        target.write_bytes(content)
        return target

    def delete_upload(self, paper_id: str) -> Paper:
        paper = next((item for item in self.list_papers() if item.id == paper_id), None)
        if not paper:
            raise HTTPException(status_code=404, detail="Paper tidak ditemukan.")
        if paper.source != "upload":
            raise HTTPException(status_code=400, detail="Hanya paper upload yang bisa dihapus dari aplikasi.")

        target = Path(paper.path)
        if not target.is_absolute():
            target = settings.root_dir / target
        resolved_uploads = settings.uploads_dir.resolve()
        resolved_target = target.resolve()
        if not str(resolved_target).startswith(str(resolved_uploads)):
            raise HTTPException(status_code=400, detail="Path upload tidak valid.")

        if resolved_target.exists():
            resolved_target.unlink()
        return paper

    def _paper_id(self, path: Path) -> str:
        try:
            value = str(path.relative_to(settings.root_dir))
        except ValueError:
            digest = sha1(str(path).encode("utf-8")).hexdigest()[:10]
            value = f"{path.name}-{digest}"
        return re.sub(r"[^a-zA-Z0-9]+", "-", value).strip("-").lower()

    def _display_path(self, path: Path) -> str:
        try:
            return str(path.relative_to(settings.root_dir))
        except ValueError:
            return str(path)

    def _safe_filename(self, filename: str) -> str:
        cleaned = re.sub(r"[^a-zA-Z0-9._-]+", "_", filename).strip("._")
        return cleaned or "paper.pdf"


document_store = DocumentStore()

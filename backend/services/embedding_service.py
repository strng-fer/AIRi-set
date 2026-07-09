import hashlib

import google.generativeai as genai
import numpy as np
from core.config import settings


class EmbeddingService:
    def __init__(self) -> None:
        self.enabled = bool(settings.gemini_api_key)
        if self.enabled:
            genai.configure(api_key=settings.gemini_api_key)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [self._embed(text, "retrieval_document") for text in texts]

    def embed_query(self, text: str) -> list[float]:
        return self._embed(text, "retrieval_query")

    def _embed(self, text: str, task_type: str) -> list[float]:
        if self.enabled:
            result = genai.embed_content(
                model=settings.gemini_embedding_model,
                content=text,
                task_type=task_type,
            )
            return result["embedding"]
        return self._fallback_embedding(text)

    def _fallback_embedding(self, text: str, dimensions: int = 384) -> list[float]:
        vector = np.zeros(dimensions, dtype=float)
        for token in text.lower().split():
            digest = hashlib.sha256(token.encode("utf-8")).digest()
            index = int.from_bytes(digest[:4], "big") % dimensions
            vector[index] += 1.0
        norm = np.linalg.norm(vector)
        if norm:
            vector = vector / norm
        return vector.tolist()


embedding_service = EmbeddingService()

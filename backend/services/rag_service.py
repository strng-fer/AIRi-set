from pathlib import Path

import chromadb
from core.config import settings
from models.schemas import ChatResponse, Citation
from services.chunking import chunk_pages
from services.document_store import document_store
from services.embedding_service import embedding_service
from services.llm_service import llm_service
from services.pdf_service import extract_pages


class RAGService:
    def __init__(self) -> None:
        settings.chroma_dir.mkdir(parents=True, exist_ok=True)
        self.client = chromadb.PersistentClient(path=str(settings.chroma_dir))
        self.collection = self.client.get_or_create_collection("airi_set_papers")

    def index_knowledge_base(self) -> int:
        self._reset_collection()
        paths = [Path(p.path) if Path(p.path).is_absolute() else settings.root_dir / p.path for p in document_store.list_papers()]
        return self.index_files(paths)

    def index_files(self, paths: list[Path]) -> int:
        all_chunks: list[dict] = []
        for path in paths:
            if path.exists() and path.suffix.lower() == ".pdf":
                all_chunks.extend(chunk_pages(path, extract_pages(path)))

        if not all_chunks:
            return 0

        texts = [chunk["text"] for chunk in all_chunks]
        embeddings = embedding_service.embed_documents(texts)
        self.collection.upsert(
            ids=[chunk["id"] for chunk in all_chunks],
            embeddings=embeddings,
            documents=texts,
            metadatas=[
                {"paper": chunk["paper"], "page": chunk["page"], "path": chunk["path"]}
                for chunk in all_chunks
            ],
        )
        return len(all_chunks)

    def answer(self, question: str, top_k: int = 5) -> ChatResponse:
        if self.collection.count() == 0:
            return ChatResponse(
                answer="Knowledge base masih kosong. Upload PDF atau jalankan index knowledge base terlebih dahulu.",
                citations=[],
            )

        query_embedding = embedding_service.embed_query(question)
        result = self.collection.query(query_embeddings=[query_embedding], n_results=top_k)

        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        contexts = []
        for doc, metadata in zip(documents, metadatas):
            contexts.append(
                {
                    "text": doc,
                    "paper": str(metadata.get("paper", "Unknown paper")),
                    "page": int(metadata.get("page", 0)),
                }
            )

        answer = llm_service.answer(question, contexts)
        citations = [
            Citation(paper=item["paper"], page=item["page"], snippet=item["text"][:240])
            for item in contexts
        ]
        return ChatResponse(answer=answer, citations=citations)

    def _reset_collection(self) -> None:
        try:
            self.client.delete_collection("airi_set_papers")
        except ValueError:
            pass
        self.collection = self.client.get_or_create_collection("airi_set_papers")


rag_service = RAGService()

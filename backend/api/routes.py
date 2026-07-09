from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse
from models.schemas import ChatRequest, ChatResponse, Paper
from services.document_store import document_store
from services.rag_service import get_rag_service

router = APIRouter(prefix="/api")


@router.get("/health")
def health():
    return {"status": "ok"}


@router.get("/papers", response_model=list[Paper])
def list_papers():
    return document_store.list_papers()


@router.post("/index")
def index_knowledge_base():
    result = get_rag_service().index_knowledge_base()
    return {"indexed_chunks": result}


@router.post("/upload")
async def upload_papers(files: list[UploadFile] = File(...)):
    if not files:
        raise HTTPException(status_code=400, detail="No PDF files uploaded.")

    saved_paths: list[Path] = []
    for file in files:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF.")
        saved_paths.append(await document_store.save_upload(file))

    indexed = get_rag_service().index_files(saved_paths)
    return JSONResponse({"uploaded": len(saved_paths), "indexed_chunks": indexed})


@router.delete("/papers/{paper_id}")
def delete_uploaded_paper(paper_id: str):
    paper = document_store.delete_upload(paper_id)
    indexed = get_rag_service().index_knowledge_base()
    return {"deleted": paper.id, "indexed_chunks": indexed}


@router.post("/chat", response_model=ChatResponse)
def chat(payload: ChatRequest):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")
    return get_rag_service().answer(payload.question)

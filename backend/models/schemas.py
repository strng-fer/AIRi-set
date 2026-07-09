from pydantic import BaseModel


class Paper(BaseModel):
    id: str
    title: str
    category: str
    path: str
    source: str


class Citation(BaseModel):
    paper: str
    page: int
    snippet: str


class ChatRequest(BaseModel):
    question: str


class ChatResponse(BaseModel):
    answer: str
    citations: list[Citation]


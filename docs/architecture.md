# Architecture

```text
PDF files
   |
   v
PyMuPDF text extraction
   |
   v
Chunking with page metadata
   |
   v
Gemini embedding or local fallback
   |
   v
ChromaDB
   |
   v
Similarity search
   |
   v
Gemini answer generation
   |
   v
Answer with paper and page citations
```


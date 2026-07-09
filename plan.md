# AI PLAN

## Project Information

**Project Name**

> AIRi-set (AI Riset)

**Tagline**

> AI Research Assistant powered by Retrieval-Augmented Generation (RAG)

**Goal**
Membangun aplikasi web yang membantu mahasiswa, peneliti, dan dosen mencari informasi dari kumpulan paper ilmiah menggunakan Large Language Model (LLM) dan Retrieval-Augmented Generation (RAG), lengkap dengan sitasi sumber.

---

# Problem Statement

Mahasiswa sering harus membaca puluhan paper untuk mencari informasi tertentu seperti:

* metode penelitian
* dataset yang digunakan
* hasil penelitian
* research gap
* kesimpulan

Proses tersebut memakan waktu karena harus membuka banyak dokumen satu per satu.

---

# Solution

AIRi-set memungkinkan pengguna untuk:

* menggunakan kumpulan paper bawaan (Knowledge Base)
* mengunggah paper sendiri
* bertanya menggunakan bahasa alami
* memperoleh jawaban berdasarkan isi paper
* melihat sumber paper dan nomor halaman

---

# Target User

### Primary

* Mahasiswa S1
* Mahasiswa S2
* Mahasiswa S3

### Secondary

* Dosen
* Peneliti

---

# Scope Project (MVP)

## In Scope

✅ Upload PDF

✅ Multiple PDF

✅ Extract Text

✅ Chunking

✅ Embedding

✅ Vector Database

✅ Semantic Search

✅ Chat dengan AI

✅ Citation

✅ Page Number

---

## Out of Scope

❌ Login

❌ Multi User

❌ Dashboard Admin

❌ OCR

❌ Fine Tuning

❌ AI Agent

---

# User Flow

## Flow 1 — Menggunakan Knowledge Base

```text
Open Website

↓

Knowledge Base sudah tersedia

↓

User bertanya

↓

AI mencari paper

↓

AI menjawab

↓

Menampilkan sumber
```

---

## Flow 2 — Upload Paper

```text
Open Website

↓

Upload PDF

↓

Processing

↓

Paper masuk Knowledge Base

↓

User bertanya

↓

AI menjawab

↓

Menampilkan sumber
```

---

# Functional Requirements

## FR-01

User dapat melihat daftar paper.

---

## FR-02

User dapat mengunggah satu atau beberapa PDF.

---

## FR-03

Sistem mengekstrak isi PDF.

---

## FR-04

Sistem melakukan chunking.

---

## FR-05

Sistem membuat embedding.

---

## FR-06

Sistem menyimpan embedding ke Vector Database.

---

## FR-07

User dapat bertanya.

---

## FR-08

Sistem mencari chunk yang relevan.

---

## FR-09

LLM menghasilkan jawaban.

---

## FR-10

Jawaban menampilkan:

* nama paper
* halaman

---

# Non Functional Requirements

Website harus:

* mudah digunakan
* responsif
* loading cepat
* tampilan modern
* mudah dipahami recruiter

---

# Knowledge Base

Folder

```text
knowledge_base/

Computer Vision/

NLP/

LLM/

Machine Learning/
```

Contoh

```text
Computer Vision/

YOLOv11.pdf

RF-DETR.pdf

DETR.pdf

SAM.pdf

GroundingDINO.pdf
```

Target

20–30 paper.

---

# User Upload Folder

```text
uploads/

paper_upload_1.pdf

paper_upload_2.pdf
```

Paper ini akan diproses sama seperti paper bawaan.

---

# System Workflow

## Indexing Pipeline

```text
Knowledge Base
        +
User Upload
        │
        ▼
Extract Text
        ▼
Chunking
        ▼
Embedding
        ▼
Vector Database
```

---

## Query Pipeline

```text
Question

↓

Embedding

↓

Similarity Search

↓

Top Chunks

↓

LLM

↓

Answer

↓

Citation
```

---

# Pages

## Home

Berisi

* Hero
* Deskripsi
* Tombol Start

---

## Research Assistant

Berisi

* Sidebar Paper
* Upload PDF
* Chat

---

## About

Berisi

* Cara kerja RAG
* Architecture
* Tech Stack

---

# UI Components

Sidebar

```text
Knowledge Base

Computer Vision

NLP

Machine Learning

+ Upload Paper
```

---

Main Chat

```text
Ask a question...

____________________

[ Ask ]
```

---

Answer

```text
Answer

.....................................

Sources

Paper A

Page 12

Paper C

Page 5
```

---

# Tech Stack

## Frontend

Next.js

TailwindCSS

---

## Backend

FastAPI

---

## AI

Gemini API

Gemini Embedding

---

## Document

PyMuPDF

---

## Vector Database

ChromaDB

---

## Deployment

Frontend

Vercel

Backend

Render

---

# Folder Structure

```text
AIRi-set/

backend/
│
├── api/
├── services/
├── rag/
├── models/
├── utils/
└── main.py

frontend/
│
├── app/
├── components/
├── public/
└── styles/

knowledge_base/
│
├── computer_vision/
├── nlp/
├── llm/
└── machine_learning/

uploads/

docs/

README.md
```

---

# Checkpoint

## Checkpoint 1 — Blueprint Siap

Status saat ini:

* ✅ Goal project sudah jelas
* ✅ Scope MVP sudah dibatasi
* ✅ User flow sudah disusun
* ✅ Arsitektur awal dan milestone sudah ditentukan

Fokus berikutnya:

* implementasi backend ingestion PDF
* chunking, embedding, dan retrieval
* frontend chat dan upload UI
* integrasi citation nama paper dan halaman

---

# Development Milestones

## Milestone 1

Planning

Output

* Nama project
* Scope
* Architecture
* Wireframe

---

## Milestone 2

Knowledge Base

Output

* 20–30 paper

---

## Milestone 3

RAG Backend

Output

* Upload
* Parsing
* Chunking
* Embedding
* Retrieval
* Answer

---

## Milestone 4

Frontend

Output

* Chat UI
* Upload UI
* Document List

---

## Milestone 5

Integration

Output

Frontend ↔ Backend ↔ Gemini ↔ ChromaDB

---

## Milestone 6

Deployment

Output

Website online

---

## Milestone 7

Portfolio

Output

* GitHub Repository
* Live Demo
* README
* Architecture Diagram
* Demo Video

---

# Definition of Done (DoD)

Proyek dianggap selesai jika memenuhi semua poin berikut:

* ✅ Website dapat diakses publik.
* ✅ Tersedia **Knowledge Base** bawaan berisi minimal 20 paper.
* ✅ Pengguna dapat mengunggah PDF sendiri.
* ✅ Sistem melakukan ekstraksi teks, chunking, embedding, dan menyimpan ke ChromaDB.
* ✅ Pengguna dapat bertanya dalam bahasa alami.
* ✅ Jawaban dihasilkan berdasarkan dokumen yang relevan (RAG), bukan sekadar pengetahuan bawaan model.
* ✅ Setiap jawaban menampilkan **nama paper** dan **nomor halaman** sebagai sitasi.
* ✅ Frontend dan backend terintegrasi dengan baik.
* ✅ Repository GitHub memiliki README, diagram arsitektur, screenshot aplikasi, dan panduan menjalankan proyek.

Dengan AI Plan ini, kamu sudah memiliki blueprint yang cukup lengkap untuk mengembangkan AIRi-set secara bertahap tanpa membuat scope proyek menjadi terlalu besar atau rumit.

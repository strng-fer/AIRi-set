# AIRi-set

AI Research Assistant powered by Retrieval-Augmented Generation (RAG).

AIRi-set membantu pengguna bertanya ke kumpulan paper PDF dan mendapatkan jawaban dengan sumber berupa nama paper serta nomor halaman.

## Stack

- Frontend: Next.js, TailwindCSS
- Backend: FastAPI
- AI: Gemini API dan Gemini Embedding
- PDF: PyMuPDF
- Vector Database: ChromaDB

## Struktur

```text
backend/
frontend/
knowledge_base/
uploads/
docs/
```

## Menjalankan Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Isi `GEMINI_API_KEY` di `.env` untuk jawaban dan embedding Gemini. Jika belum diisi, backend memakai mode fallback lokal sederhana untuk development.

## Menjalankan Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend berjalan di `http://localhost:3000` dan backend di `http://localhost:8000`.

Saat development lokal, jalankan frontend di `http://localhost:3000` dan backend di `http://localhost:8000`.

## Deployment

### 1. Siapkan Gemini API Key

Buat API key dari Google AI Studio, lalu simpan sebagai environment variable bernama `GEMINI_API_KEY`. Jangan taruh key di kode frontend atau commit ke Git.

### 2. Deploy Backend ke Render

Render dapat memakai file `render.yaml` di root project ini. Setelah repository dihubungkan ke Render:

- Service name: `airi-set-api`
- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`

Tambahkan environment variable di Render:

```text
GEMINI_API_KEY=isi_api_key_kamu
GEMINI_MODEL=gemini-2.5-flash
GEMINI_EMBEDDING_MODEL=models/gemini-embedding-001
FRONTEND_ORIGIN=https://nama-app-kamu.vercel.app
CORS_ORIGINS=https://nama-app-kamu.vercel.app,http://localhost:3000,http://127.0.0.1:3000
```

Setelah deploy selesai, backend akan punya URL seperti:

```text
https://airi-set-api.onrender.com
```

Tes endpoint:

```text
https://airi-set-api.onrender.com/api/health
```

### 3. Deploy ke Vercel Services

Import repository ke Vercel dengan Root Directory di root repository, lalu gunakan Framework Preset `Services`. File `vercel.json` mendeklarasikan dua service:

- `frontend`: Next.js dari folder `frontend`
- `backend`: FastAPI dari folder `backend`

Request `/api/*` akan diarahkan ke service backend, sedangkan route lain diarahkan ke frontend.

Tambahkan environment variable `GEMINI_API_KEY` di Vercel untuk backend. Setelah URL Vercel sudah final, set `FRONTEND_ORIGIN` dan `CORS_ORIGINS` ke URL Vercel tersebut.

### Catatan ChromaDB di Render

Pada konfigurasi sederhana ini, ChromaDB dan upload PDF disimpan di filesystem service. Untuk demo portfolio ini cukup, tetapi data bisa hilang saat redeploy/rebuild jika tidak memakai persistent disk. Untuk production, gunakan persistent disk Render atau vector database terpisah.

## Folder Paper

Letakkan paper bawaan di:

```text
knowledge_base/computer_vision/
knowledge_base/nlp/
knowledge_base/llm/
knowledge_base/machine_learning/
```

PDF yang diunggah dari aplikasi akan masuk ke folder `uploads/`.

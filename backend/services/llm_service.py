import google.generativeai as genai
from core.config import settings


class LLMService:
    def __init__(self) -> None:
        self.enabled = bool(settings.gemini_api_key)
        if self.enabled:
            genai.configure(api_key=settings.gemini_api_key)
            self.model = genai.GenerativeModel(settings.gemini_model)
        else:
            self.model = None

    def answer(self, question: str, contexts: list[dict]) -> str:
        if not contexts:
            return "Saya belum menemukan konteks yang relevan di knowledge base."

        context_text = "\n\n".join(
            f"[{item['paper']} halaman {item['page']}]\n{item['text']}" for item in contexts
        )

        if self.enabled and self.model:
            prompt = (
                "Kamu adalah AIRi-set, asisten riset yang ramah, hangat, dan membantu. "
                "Jawab hanya berdasarkan konteks paper yang diberikan, tetapi gunakan gaya bahasa Indonesia "
                "yang natural, friendly, dan tidak kaku. Mulai dengan jawaban langsung, lalu beri poin-poin "
                "jika itu membuat jawaban lebih mudah dibaca. Jangan mengarang di luar konteks. Jika konteks "
                "belum cukup, katakan dengan sopan bagian mana yang belum ditemukan. Selalu sertakan rujukan "
                "singkat seperti (NamaPaper halaman X) untuk klaim penting.\n\n"
                f"Konteks:\n{context_text}\n\nPertanyaan: {question}"
            )
            response = self.model.generate_content(prompt)
            return response.text.strip()

        bullets = "\n".join(f"- {item['text'][:260]}..." for item in contexts[:3])
        return (
            "Mode development tanpa GEMINI_API_KEY. Berikut konteks paling relevan yang ditemukan:\n"
            f"{bullets}"
        )


llm_service = LLMService()

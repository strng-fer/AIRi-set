from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"
    gemini_embedding_model: str = "models/gemini-embedding-001"
    frontend_origin: str = "http://localhost:3000"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"

    root_dir: Path = Path(__file__).resolve().parents[2]
    knowledge_base_dir: Path = root_dir / "knowledge_base"
    uploads_dir: Path = root_dir / "uploads"
    chroma_dir: Path = root_dir / "backend" / ".chroma"

    model_config = SettingsConfigDict(env_file=Path(__file__).resolve().parents[1] / ".env")

    @property
    def allowed_origins(self) -> list[str]:
        origins = [self.frontend_origin, *self.cors_origins.split(",")]
        return list(dict.fromkeys(origin.strip() for origin in origins if origin.strip()))


settings = Settings()

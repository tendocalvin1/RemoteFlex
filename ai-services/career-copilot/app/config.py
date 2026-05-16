"""
Application configuration for the AI Career Copilot service.

This module centralizes all environment-based settings using
Pydantic Settings. It provides strongly typed configuration
with sensible defaults for local development while keeping
production secrets externalized through environment variables.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ==========================================================
    # Application Metadata
    # ==========================================================
    app_name: str = "RemoteFlex AI Career Copilot"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    # ==========================================================
    # API Configuration
    # ==========================================================
    api_prefix: str = "/api/v1"

    # ==========================================================
    # Embedding Model Configuration
    # ==========================================================
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dimension: int = 384

    # ==========================================================
    # Matching Configuration
    # ==========================================================
    similarity_threshold: float = 0.65
    top_k_matches: int = 10

    # ==========================================================
    # CORS Configuration
    # ==========================================================
    allowed_origins: list[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # ==========================================================
    # Logging Configuration
    # ==========================================================
    log_level: str = "INFO"

    # ==========================================================
    # OpenAI Configuration (Future Phases)
    # ==========================================================
    openai_api_key: str | None = None
    openai_model: str = "gpt-5"

    # ==========================================================
    # Neo4j Configuration (Future Phases)
    # ==========================================================
    neo4j_uri: str = "bolt://localhost:7687"
    neo4j_username: str = "neo4j"
    neo4j_password: str = "password"

    # ==========================================================
    # MongoDB Configuration (Optional Integration)
    # ==========================================================
    mongodb_uri: str = "mongodb://localhost:27017/remoteflex"

    # ==========================================================
    # Pydantic Settings Configuration
    # ==========================================================
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


# Singleton settings object
settings = Settings()


"""
Embedding service for generating semantic vector representations.

The SentenceTransformer model is loaded lazily on first use to:
- Reduce application startup time
- Prevent deployment hangs on Render Free
- Avoid unnecessary memory usage until embeddings are needed

This service is used for:
- Resume-to-job matching
- Skill similarity
- Semantic search
- Recommendation systems
"""

from typing import List, Optional

from sentence_transformers import SentenceTransformer

from app.config import settings


class EmbeddingService:
    """
    Generates embeddings using a SentenceTransformer model.

    The model is not loaded during application startup.
    Instead, it is loaded the first time encode() or encode_batch()
    is called.
    """

    def __init__(self) -> None:
        # Model starts as None and will be initialized on demand.
        self.model: Optional[SentenceTransformer] = None

    def _load_model(self) -> None:
        """
        Load the embedding model only when needed.
        """
        if self.model is None:
            print(f"Loading embedding model: {settings.embedding_model}")
            self.model = SentenceTransformer(settings.embedding_model)
            print("Embedding model loaded successfully.")

    def encode(self, text: str) -> List[float]:
        """
        Convert a single text string into an embedding vector.
        """
        self._load_model()
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Convert multiple text strings into embeddings in a single batch.
        """
        self._load_model()
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()


# Singleton instance reused across requests.
embedding_service = EmbeddingService()
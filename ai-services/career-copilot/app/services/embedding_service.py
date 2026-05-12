"""
Embedding service for generating semantic vector representations.

This service loads a SentenceTransformer model once at startup and
reuses it to encode text into numerical embeddings suitable for:
- Resume-to-job matching
- Skill similarity
- Semantic search
- Recommendation systems
"""

from typing import List

from sentence_transformers import SentenceTransformer

from app.config import settings


class EmbeddingService:
    """
    Generates embeddings using a SentenceTransformer model.
    """

    def __init__(self) -> None:
        # Load the model once. This is expensive, so it should not be
        # reloaded for every request.
        self.model = SentenceTransformer(settings.embedding_model)

    def encode(self, text: str) -> List[float]:
        """
        Convert a single text string into an embedding vector.
        """
        embedding = self.model.encode(text, convert_to_numpy=True)
        return embedding.tolist()

    def encode_batch(self, texts: List[str]) -> List[List[float]]:
        """
        Convert multiple texts into embeddings in a single batch.
        """
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()


# Singleton instance reused across requests.
embedding_service = EmbeddingService()
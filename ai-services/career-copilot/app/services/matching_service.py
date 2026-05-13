from sklearn.metrics.pairwise import cosine_similarity

from app.services.embedding_service import embedding_service


class MatchingService:
    """
    Service responsible for semantic similarity matching between
    a candidate resume and multiple job descriptions.
    """

    def compute_similarity(
        self,
        source_text: str,
        documents: list[str],
    ) -> list[float]:
        """
        Compute cosine similarity scores between a source text and
        a list of target documents.
        """

        # Generate embedding for the source text (resume)
        source_embedding = embedding_service.encode(source_text)

        # Generate embeddings for all job descriptions
        document_embeddings = embedding_service.encode_batch(documents)

        # Compute cosine similarity
        similarities = cosine_similarity(
            [source_embedding],
            document_embeddings,
        )[0]

        return similarities.tolist()

    def match(
        self,
        candidate_text: str,
        documents: list[str],
    ) -> list[float]:
        """
        Public API used by routers.

        Delegates to compute_similarity() to generate semantic
        similarity scores between a candidate resume and job descriptions.
        """
        return self.compute_similarity(
            source_text=candidate_text,
            documents=documents,
        )


# Singleton instance
matching_service = MatchingService()
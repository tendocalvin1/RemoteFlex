"""
Matching service for semantic resume-to-job matching.

This service:
- Generates embeddings for the resume and job descriptions
- Computes cosine similarity scores
- Ranks jobs by relevance
- Returns the best matches
"""

from sklearn.metrics.pairwise import cosine_similarity

from app.schemas import JobDocument, JobMatchResult
from app.services.embedding_service import embedding_service


class MatchingService:
    """
    Performs semantic similarity matching between a resume and jobs.
    """

    def match_jobs(
        self,
        resume_text: str,
        jobs: list[JobDocument],
        top_k: int = 10,
    ) -> list[JobMatchResult]:
        """
        Match a resume against a list of jobs and return ranked results.

        Args:
            resume_text: Raw resume text.
            jobs: List of job documents.
            top_k: Maximum number of top matches to return.

        Returns:
            Sorted list of JobMatchResult objects.
        """
        if not jobs:
            return []

        # Generate embedding for the resume.
        resume_embedding = embedding_service.encode(resume_text)

        # Build job text representations.
        job_texts = [
            f"{job.title}. {job.company}. {job.description}"
            for job in jobs
        ]

        # Generate embeddings for all jobs in one batch.
        job_embeddings = embedding_service.encode_batch(job_texts)

        # Compute cosine similarity between the resume and all jobs.
        similarities = cosine_similarity(
            [resume_embedding],
            job_embeddings,
        )[0]

        # Build ranked results.
        results: list[JobMatchResult] = []

        for job, similarity in zip(jobs, similarities):
            similarity_score = float(similarity)
            match_percentage = round(similarity_score * 100, 2)

            results.append(
                JobMatchResult(
                    job_id=job.job_id,
                    title=job.title,
                    company=job.company,
                    similarity_score=round(similarity_score, 4),
                    match_percentage=match_percentage,
                    explanation="",  # Filled later by explanation_service
                )
            )

        # Sort by highest similarity.
        results.sort(
            key=lambda result: result.similarity_score,
            reverse=True,
        )

        return results[:top_k]


# Singleton instance reused throughout the application.
matching_service = MatchingService()
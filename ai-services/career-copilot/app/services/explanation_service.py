"""
Explanation service for semantic job matching results.

This service generates human-readable explanations that describe
why a resume matches a particular job posting.
"""

from app.schemas import JobDocument


class ExplanationService:
    """
    Generates plain-English explanations for job match results.
    """

    def generate_explanation(
        self,
        resume_text: str,
        job: JobDocument,
        match_percentage: float,
    ) -> str:
        """
        Generate a human-readable explanation for a job match.

        Args:
            resume_text: Raw resume text.
            job: Job document being evaluated.
            match_percentage: Match score as a percentage.

        Returns:
            Explanation string.
        """
        score = round(match_percentage)

        # Basic score-based explanation.
        if score >= 85:
            strength = "a very strong match"
        elif score >= 70:
            strength = "a strong match"
        elif score >= 50:
            strength = "a moderate match"
        else:
            strength = "a weaker match"

        # Simple keyword overlap detection.
        resume_lower = resume_text.lower()
        matched_keywords = []

        for keyword in [
            "python",
            "javascript",
            "typescript",
            "react",
            "next.js",
            "node.js",
            "express",
            "fastapi",
            "docker",
            "kubernetes",
            "aws",
            "mongodb",
            "postgresql",
            "machine learning",
            "tensorflow",
            "pytorch",
        ]:
            if keyword in resume_lower and keyword in job.description.lower():
                matched_keywords.append(keyword)

        # Build explanation.
        if matched_keywords:
            top_keywords = ", ".join(matched_keywords[:5])

            return (
                f"This role is {strength} ({score}% match) because your "
                f"experience aligns with key technologies such as "
                f"{top_keywords}."
            )

        return (
            f"This role is {strength} ({score}% match) based on the overall "
            f"semantic similarity between your resume and the job description."
        )


# Singleton instance reused throughout the application.
explanation_service = ExplanationService()
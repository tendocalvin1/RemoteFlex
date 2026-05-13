class ExplanationService:
    """
    Service responsible for generating human-readable explanations
    for why a candidate matches a specific job.
    """

    def generate_explanation(
        self,
        resume_text: str,
        job_title: str,
        similarity_score: float,
    ) -> str:
        """
        Generate a concise explanation based on similarity score.
        """

        match_percentage = round(similarity_score * 100, 2)

        if similarity_score >= 0.80:
            strength = "an excellent"
        elif similarity_score >= 0.65:
            strength = "a strong"
        elif similarity_score >= 0.50:
            strength = "a moderate"
        else:
            strength = "a weak"

        return (
            f"The candidate shows {strength} match for the "
            f"{job_title} role with a similarity score of "
            f"{match_percentage}%. Relevant skills and experience "
            f"appear to align well with the job requirements."
        )


# Singleton instance
explanation_service = ExplanationService()
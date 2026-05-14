class RecommendationService:
    """
    Service responsible for generating actionable recommendations
    based on missing skills identified during job matching.
    """

    def generate_recommendations(
        self,
        missing_skills: list[str],
    ) -> list[str]:
        """
        Generate personalized learning recommendations for each
        missing skill.

        Example:
            Input:
                ["kubernetes", "ci/cd", "pytorch"]

            Output:
                [
                    "Learn Kubernetes to strengthen your deployment and orchestration skills.",
                    "Study CI/CD pipelines to automate testing and deployment.",
                    "Build projects with PyTorch to deepen your machine learning expertise."
                ]
        """

        # If no missing skills are detected, return a positive message.
        if not missing_skills:
            return [
                "Your resume already covers the key skills required for this role."
            ]

        recommendations = []

        # Skill-specific recommendation templates
        custom_templates = {
            "kubernetes": (
                "Learn Kubernetes to strengthen your deployment and orchestration skills."
            ),
            "docker": (
                "Deepen your Docker expertise to improve containerization and deployment workflows."
            ),
            "ci/cd": (
                "Study CI/CD pipelines to automate testing and deployment."
            ),
            "aws": (
                "Build cloud projects on AWS to strengthen your infrastructure skills."
            ),
            "pytorch": (
                "Build projects with PyTorch to deepen your machine learning expertise."
            ),
            "tensorflow": (
                "Create advanced machine learning projects with TensorFlow."
            ),
            "react": (
                "Develop production-grade React applications to improve frontend engineering skills."
            ),
            "next.js": (
                "Build full-stack applications with Next.js to strengthen modern web development skills."
            ),
        }

        for skill in missing_skills:
            normalized_skill = skill.lower()

            if normalized_skill in custom_templates:
                recommendations.append(custom_templates[normalized_skill])
            else:
                recommendations.append(
                    f"Develop practical projects using {skill} to strengthen your expertise."
                )

        return recommendations


# Singleton instance
recommendation_service = RecommendationService()
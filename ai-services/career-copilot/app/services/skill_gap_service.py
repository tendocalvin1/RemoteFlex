
import re


class SkillGapService:
    """
    Service responsible for identifying skills present in a job
    description but missing from the candidate's resume.
    """

    # Common technical terms to detect.
    # This list can be expanded significantly over time.
    KNOWN_SKILLS = {
        "python",
        "fastapi",
        "django",
        "flask",
        "javascript",
        "typescript",
        "react",
        "next.js",
        "node.js",
        "docker",
        "kubernetes",
        "aws",
        "azure",
        "gcp",
        "tensorflow",
        "pytorch",
        "machine learning",
        "deep learning",
        "nlp",
        "postgresql",
        "mongodb",
        "redis",
        "graphql",
        "rest api",
        "ci/cd",
        "git",
        "linux",
        "airflow",
        "spark",
        "hadoop",
        "scikit-learn",
        "pandas",
        "numpy",
    }

    def _normalize(self, text: str) -> str:
        """
        Normalize text for case-insensitive matching.
        """
        text = text.lower()
        text = re.sub(r"\s+", " ", text)
        return text

    def extract_skills(self, text: str) -> set[str]:
        """
        Extract known skills that appear in the text.
        """
        normalized_text = self._normalize(text)

        found_skills = {
            skill
            for skill in self.KNOWN_SKILLS
            if skill in normalized_text
        }

        return found_skills

    def identify_missing_skills(
        self,
        resume_text: str,
        job_description: str,
    ) -> list[str]:
        """
        Return skills present in the job description but absent
        from the resume.
        """
        resume_skills = self.extract_skills(resume_text)
        job_skills = self.extract_skills(job_description)

        missing_skills = sorted(job_skills - resume_skills)

        return missing_skills


# Singleton instance
skill_gap_service = SkillGapService()
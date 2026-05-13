
from pydantic import BaseModel, Field
from typing import List


# ==========================================================
# Input Schemas
# ==========================================================

class JobDocument(BaseModel):
    """
    Represents a job posting document used for semantic matching.
    """
    job_id: str = Field(..., description="Unique identifier of the job")
    title: str = Field(..., description="Job title")
    company: str = Field(..., description="Company name")
    description: str = Field(..., description="Full job description")


class MatchRequest(BaseModel):
    """
    Request payload for semantic job matching.
    """
    resume_text: str = Field(
        ...,
        min_length=50,
        description="Raw resume text extracted from the user's resume"
    )
    jobs: List[JobDocument] = Field(
        ...,
        min_length=1,
        description="List of job documents to compare against"
    )


# ==========================================================
# Output Schemas
# ==========================================================

class JobMatchResult(BaseModel):
    """
    Individual job match result.
    """
    job_id: str
    title: str
    company: str
    similarity_score: float
    match_percentage: float
    explanation: str
    missing_skills: List[str]


class MatchResponse(BaseModel):
    """
    Response returned by the semantic matching endpoint.
    """
    total_jobs_analyzed: int
    top_matches: List[JobMatchResult]
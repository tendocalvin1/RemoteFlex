from fastapi import APIRouter

from app.schemas import (
    MatchRequest,
    MatchResponse,
    JobMatchResult,
)
from app.services.matching_service import matching_service
from app.services.explanation_service import explanation_service
from app.services.skill_gap_service import skill_gap_service

# Create router instance
router = APIRouter(
    prefix="/api/v1",
    tags=["Semantic Job Matching"],
)


@router.post(
    "/match-jobs",
    response_model=MatchResponse,
    summary="Match a resume against multiple job postings",
    description="""
Analyze a candidate's resume and compare it against a list of job postings
using semantic embeddings. Returns ranked matches with similarity scores,
percentages, human-readable explanations, and missing skills.
""",
)
def match_jobs(request: MatchRequest) -> MatchResponse:
    """
    Perform semantic job matching and return ranked recommendations.
    """

    # Extract job descriptions for embedding and similarity comparison
    job_descriptions = [job.description for job in request.jobs]

    # Compute similarity scores
    similarity_scores = matching_service.match(
        candidate_text=request.resume_text,
        documents=job_descriptions,
    )

    # Build structured results
    results = []

    for job, score in zip(request.jobs, similarity_scores):
        match_percentage = round(score * 100, 2)

        explanation = explanation_service.generate_explanation(
            resume_text=request.resume_text,
            job_title=job.title,
            similarity_score=score,
        )

        # Identify skills required by the job but missing from the resume
        missing_skills = skill_gap_service.identify_missing_skills(
            resume_text=request.resume_text,
            job_description=job.description,
        )

        results.append(
            JobMatchResult(
                job_id=job.job_id,
                title=job.title,
                company=job.company,
                similarity_score=round(score, 4),
                match_percentage=match_percentage,
                explanation=explanation,
                missing_skills=missing_skills,
            )
        )

    # Sort results from highest to lowest match score
    results.sort(
        key=lambda item: item.similarity_score,
        reverse=True,
    )

    # Return API response
    return MatchResponse(
        total_jobs_analyzed=len(request.jobs),
        top_matches=results,
    )
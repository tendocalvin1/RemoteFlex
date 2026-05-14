from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")

    assert response.status_code == 200

    data = response.json()

    assert "message" in data
    assert data["message"] == "RemoteFlex AI Career Copilot is running."


def test_health_check():
    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert "service" in data
    assert "version" in data


def test_match_jobs_endpoint():
    payload = {
        "resume_text": """
        Senior Software Engineer with 5 years of experience in Python,
        FastAPI, Machine Learning, TensorFlow, Docker, AWS, and REST APIs.
        Built scalable AI systems and recommendation engines.
        """,
        "jobs": [
            {
                "job_id": "job-001",
                "title": "Machine Learning Engineer",
                "company": "OpenAI",
                "description": """
                Looking for an engineer with experience in Python,
                TensorFlow, machine learning, Docker, and cloud deployment.
                """
            },
            {
                "job_id": "job-002",
                "title": "Frontend Developer",
                "company": "TechCorp",
                "description": """
                Seeking a React developer with experience in TypeScript,
                Tailwind CSS, and Next.js.
                """
            }
        ]
    }

    response = client.post("/api/v1/match-jobs", json=payload)

    assert response.status_code == 200

    data = response.json()

    # Validate top-level response structure
    assert "total_jobs_analyzed" in data
    assert "top_matches" in data

    # Verify total jobs
    assert data["total_jobs_analyzed"] == 2

    # Verify results exist
    assert len(data["top_matches"]) == 2

    # Validate first (best) match
    top_match = data["top_matches"][0]

    assert "job_id" in top_match
    assert "title" in top_match
    assert "company" in top_match
    assert "similarity_score" in top_match
    assert "match_percentage" in top_match
    assert "explanation" in top_match
    assert "missing_skills" in top_match
    assert "recommendations" in top_match

    # Ensure list types are returned
    assert isinstance(top_match["missing_skills"], list)
    assert isinstance(top_match["recommendations"], list)

    # Ensure best match is Machine Learning Engineer
    assert top_match["job_id"] == "job-001"

    # Ensure score is within valid range
    assert 0 <= top_match["match_percentage"] <= 100

    # If missing skills exist, recommendations should also exist
    if top_match["missing_skills"]:
        assert len(top_match["recommendations"]) >= 1
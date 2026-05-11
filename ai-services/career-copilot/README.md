# RemoteFlex Career Copilot

AI microservice powering semantic resume-to-job matching, skill gap analysis, and career intelligence.

## Run Locally

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
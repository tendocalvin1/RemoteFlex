
from fastapi import FastAPI
from app.config import settings
from app.routers.matching import router as matching_router

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug,
)


@app.get("/")
def root():
    return {
        "message": "RemoteFlex AI Career Copilot is running."
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }


# Register API routers
app.include_router(matching_router)
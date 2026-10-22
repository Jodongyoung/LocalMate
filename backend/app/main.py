from typing import Literal

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="LocalMate", version="0.0.0")


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    """Report process liveness only; no database or provider checks."""
    return HealthResponse()

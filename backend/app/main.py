from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import auth, submissions, exports

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Machin & Co. Tax Services API", version="1.0.0")

import os

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(submissions.router)
app.include_router(exports.router)


@app.get("/")
def root():
    return {"message": "Machin & Co. Tax Services API", "status": "running"}

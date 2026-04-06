import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import auth, submissions, exports, users
from . import models
from .auth import hash_password

# Create all tables
Base.metadata.create_all(bind=engine)


def seed_admin():
    """Create default admin user if no accountants exist."""
    db = SessionLocal()
    try:
        exists = db.query(models.Accountant).first()
        if not exists:
            admin_name     = os.getenv("ADMIN_NAME",     "Admin")
            admin_email    = os.getenv("ADMIN_EMAIL",    "admin@machinco.com")
            admin_password = os.getenv("ADMIN_PASSWORD", "Admin12345")

            admin = models.Accountant(
                name=admin_name,
                email=admin_email,
                hashed_password=hash_password(admin_password),
            )
            db.add(admin)
            db.commit()
            print(f"✅ Admin user created: {admin_email}")
        else:
            print("ℹ️  Admin user already exists, skipping seed.")
    finally:
        db.close()


# Run seed on startup
seed_admin()

app = FastAPI(title="Machin & Co. Tax Services API", version="1.0.0")

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
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "Machin & Co. Tax Services API", "status": "running"}

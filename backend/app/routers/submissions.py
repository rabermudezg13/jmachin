from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import get_current_accountant

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


def _apply_submission_data(submission: models.Submission, data: schemas.SubmissionCreate):
    fields = data.model_dump(exclude={"dependents"})
    for key, value in fields.items():
        setattr(submission, key, value)


@router.post("/", response_model=schemas.SubmissionOut)
def create_submission(data: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    submission = models.Submission()
    _apply_submission_data(submission, data)
    db.add(submission)
    db.flush()

    for dep in (data.dependents or []):
        if dep.name:
            db.add(models.Dependent(
                submission_id=submission.id,
                **dep.model_dump()
            ))

    db.commit()
    db.refresh(submission)
    return submission


@router.put("/{token}", response_model=schemas.SubmissionOut)
def update_submission(token: str, data: schemas.SubmissionCreate, db: Session = Depends(get_db)):
    submission = db.query(models.Submission).filter(models.Submission.client_token == token).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")

    _apply_submission_data(submission, data)

    # Replace dependents
    db.query(models.Dependent).filter(models.Dependent.submission_id == submission.id).delete()
    for dep in (data.dependents or []):
        if dep.name:
            db.add(models.Dependent(
                submission_id=submission.id,
                **dep.model_dump()
            ))

    db.commit()
    db.refresh(submission)
    return submission


@router.get("/by-token/{token}", response_model=schemas.SubmissionOut)
def get_by_token(token: str, db: Session = Depends(get_db)):
    submission = db.query(models.Submission).filter(models.Submission.client_token == token).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


# ─── Accountant-only routes ──────────────────────────────────────────────────

@router.get("/", response_model=List[schemas.SubmissionSummary])
def list_submissions(
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant)
):
    return db.query(models.Submission).order_by(models.Submission.submitted_at.desc()).all()


@router.get("/{submission_id}", response_model=schemas.SubmissionOut)
def get_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant)
):
    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    return submission


@router.delete("/{submission_id}")
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant)
):
    submission = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(submission)
    db.commit()
    return {"detail": "Deleted"}

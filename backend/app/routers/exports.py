from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from io import BytesIO
from ..database import get_db
from .. import models
from ..auth import get_current_accountant
from ..utils.pdf_gen import generate_pdf
from ..utils.excel_gen import generate_excel

router = APIRouter(prefix="/api/export", tags=["exports"])


def _get_submission(db: Session, submission_id: int):
    s = db.query(models.Submission).filter(models.Submission.id == submission_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    return s


@router.get("/{submission_id}/pdf")
def export_pdf(
    submission_id: int,
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant),
):
    submission = _get_submission(db, submission_id)
    pdf_bytes = generate_pdf(submission)
    filename = f"tax_questionnaire_{submission.taxpayer_name or submission_id}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{submission_id}/excel")
def export_excel(
    submission_id: int,
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant),
):
    submission = _get_submission(db, submission_id)
    excel_bytes = generate_excel(submission)
    filename = f"tax_questionnaire_{submission.taxpayer_name or submission_id}.xlsx"
    return StreamingResponse(
        BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/by-token/{token}/pdf")
def export_pdf_by_token(token: str, db: Session = Depends(get_db)):
    s = db.query(models.Submission).filter(models.Submission.client_token == token).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    pdf_bytes = generate_pdf(s)
    filename = f"tax_questionnaire_{s.taxpayer_name or token[:8]}.pdf"
    return StreamingResponse(
        BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/by-token/{token}/excel")
def export_excel_by_token(token: str, db: Session = Depends(get_db)):
    s = db.query(models.Submission).filter(models.Submission.client_token == token).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    excel_bytes = generate_excel(s)
    filename = f"tax_questionnaire_{s.taxpayer_name or token[:8]}.xlsx"
    return StreamingResponse(
        BytesIO(excel_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

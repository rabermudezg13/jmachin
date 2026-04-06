from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, get_current_accountant

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=List[schemas.AccountantOut])
def list_users(
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant),
):
    return db.query(models.Accountant).order_by(models.Accountant.created_at.desc()).all()


@router.post("/", response_model=schemas.AccountantOut)
def create_user(
    data: schemas.AccountantCreate,
    db: Session = Depends(get_db),
    _: models.Accountant = Depends(get_current_accountant),
):
    existing = db.query(models.Accountant).filter(models.Accountant.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.Accountant(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current: models.Accountant = Depends(get_current_accountant),
):
    if current.id == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    user = db.query(models.Accountant).filter(models.Accountant.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"detail": "User deleted"}

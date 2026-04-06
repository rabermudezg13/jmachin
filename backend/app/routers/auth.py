from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=schemas.AccountantOut)
def register(data: schemas.AccountantCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Accountant).filter(models.Accountant.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    accountant = models.Accountant(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
    )
    db.add(accountant)
    db.commit()
    db.refresh(accountant)
    return accountant


@router.post("/login", response_model=schemas.Token)
def login(data: schemas.AccountantLogin, db: Session = Depends(get_db)):
    accountant = db.query(models.Accountant).filter(models.Accountant.email == data.email).first()
    if not accountant or not verify_password(data.password, accountant.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    token = create_access_token({"sub": accountant.email})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.AccountantOut)
def me(current=Depends(__import__("..auth", fromlist=["get_current_accountant"]).get_current_accountant)):
    return current

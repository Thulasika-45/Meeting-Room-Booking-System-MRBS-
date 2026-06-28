from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import re

from app.db.database import get_db
from app.models.user import User
from app.schemas.user import (
    LoginRequest,
    ChangePasswordRequest,
    ResetPasswordRequest
)
from app.core.security import (
    verify_password,
    create_access_token,
    hash_password,
    get_current_user_email
)

router = APIRouter(prefix="/auth", tags=["Auth"])

#PASSWORD VALIDATION (STRICT RULES)

def validate_password(password: str):
    if len(password) < 8 or len(password) > 16:
        raise HTTPException(status_code=400, detail="Password must be 8-16 characters")

    if not re.search(r"[A-Z]", password):
        raise HTTPException(status_code=400, detail="Must contain at least one uppercase letter")

    if not re.search(r"[0-9]", password):
        raise HTTPException(status_code=400, detail="Must contain at least one number")

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(status_code=400, detail="Must contain at least one special character")


# LOGIN

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(request.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": user.email} , user.token_version)

    # 🔥 TEMP PASSWORD FLOW
    if user.is_temp_password:
        return {
            "message": "Password change required",
            "force_change": True,
            "access_token": token,
            "token_type": "bearer",
            "role": user.role
        }

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": user.role
    }

#CHANGE PASSWORD (FORCED / NORMAL)

@router.post("/change-password")
def change_password(
    request: ChangePasswordRequest,
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email)
):

    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    #  Verify old password
    if not verify_password(request.old_password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect old password")

    # Validate new password
    validate_password(request.new_password)

    #confirm password match
    if request.new_password != request.confirm_password:
        raise HTTPException(400, "Passwords do not match")

    # Prevent reuse
    if verify_password(request.new_password, user.password_hash):
        raise HTTPException(status_code=400, detail="New password cannot be same as old password")

    user.password_hash = hash_password(request.new_password)
    user.is_temp_password = False
    user.token_version += 1
    db.commit()

    return {"message": "Password updated successfully. Please Login Again."}


# GET CURRENT USER

@router.get("/users/me")
def get_current_user(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email)
):

    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "locations":user.locations
    }


# RESET PASSWORD

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == request.email).first()

    # 🔴 Check email
    if not user:
        raise HTTPException(404, "User not found")

    # 🔴 Validate password format
    validate_password(request.new_password)

    # 🔴 Confirm password
    if request.new_password != request.confirm_password:
        raise HTTPException(400, "Passwords do not match")

    # 🔴 Prevent reuse
    if verify_password(request.new_password, user.password_hash):
        raise HTTPException(400, "Password already exists")

    # ✅ Save
    user.password_hash = hash_password(request.new_password)
    user.is_temp_password = False
    user.token_version += 1

    db.commit()

    return {"message": "Password reset successful"}


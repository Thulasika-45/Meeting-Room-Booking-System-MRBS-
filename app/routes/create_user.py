from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.schemas.create_user import UserCreate, UserResponse, UserUpdate
from app.core.security import hash_password, get_current_user_email
import json

router = APIRouter(prefix="/users", tags=["Users"])


# 🔐 USER
def get_current_user(db: Session = Depends(get_db), user_email: str = Depends(get_current_user_email)):
    user = db.query(User).filter(User.email == user_email).first()
    if not user:
        raise HTTPException(404, "User not found")
    return user


# 🔐 ADMIN
def get_current_admin(db: Session = Depends(get_db), user_email: str = Depends(get_current_user_email)):
    user = db.query(User).filter(User.email == user_email).first()
    if not user or user.role != "admin":
        raise HTTPException(403, "Admin access required")
    return user


# 📋 GET USERS
@router.get("/", response_model=list[UserResponse])
def get_all_users(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):

    users = db.query(User).all()

    return [
        {
            **user.__dict__,
            "locations": json.loads(user.locations or "[]")
        }
        for user in users
    ]


# ➕ CREATE USER
@router.post("/", response_model=UserResponse)
def create_user(request: UserCreate, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):

    if request.role not in ["admin", "user"]:
        raise HTTPException(400, "Invalid role")

    existing = db.query(User).filter(
        (User.email == request.email) |
        (User.employee_id == request.employee_id)
    ).first()

    if existing:
        raise HTTPException(400, "User already exists")

    if not request.locations:
        raise HTTPException(400, "At least one location required")

    # 🔥 normalize
    locations = [loc.strip().lower() for loc in request.locations]

    temp_password = f"Hinduja@{request.employee_id}"

    new_user = User(
        employee_id=request.employee_id,
        name=request.name,
        email=request.email,
        password_hash=hash_password(temp_password),
        role=request.role,
        locations=json.dumps(locations),
        is_temp_password=True
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        **new_user.__dict__,
        "locations": locations
    }


# ✏️ UPDATE USER
@router.put("/{employee_id}")
def update_user(employee_id: str, request: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    user = db.query(User).filter(User.employee_id == employee_id).first()
    if not user:
        raise HTTPException(404, "User not found")

    if current_user.role != "admin" and current_user.id != user.id:
        raise HTTPException(403, "Not authorized")

    if request.name:
        user.name = request.name

    if request.email:
        user.email = request.email

    if request.role:
        if current_user.role != "admin":
            raise HTTPException(403, "Only admin can change role")

        if request.role not in ["admin", "user"]:
            raise HTTPException(400, "Invalid role")

        user.role = request.role

    if request.locations:
        if current_user.role != "admin":
            raise HTTPException(403, "Only admin can change location")

        user.locations = json.dumps(
            [loc.strip().lower() for loc in request.locations]
        )

    db.commit()
    db.refresh(user)

    return {"message": "User updated successfully"}
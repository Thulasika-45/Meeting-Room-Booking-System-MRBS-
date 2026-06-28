from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.amenity import Amenity
from pydantic import BaseModel
router = APIRouter(prefix="/amenities", tags=["Amenities"])



class AmenityCreate(BaseModel):
    name: str

@router.post("/")
def create_amenity(request: AmenityCreate, db: Session = Depends(get_db)):
    name = request.name.strip().lower()

    existing = db.query(Amenity).filter(Amenity.name == name).first()
    if existing:
        raise HTTPException(400, "Amenity already exists")

    amenity = Amenity(name=name)
    db.add(amenity)
    db.commit()
    db.refresh(amenity)

    return amenity


# 📋 GET ALL AMENITIES
@router.get("/")
def get_amenities(db: Session = Depends(get_db)):
    return db.query(Amenity).all()


# ❌ DELETE AMENITY
@router.delete("/{amenity_id}")
def delete_amenity(amenity_id: int, db: Session = Depends(get_db)):
    amenity = db.query(Amenity).filter(Amenity.id == amenity_id).first()

    if not amenity:
        raise HTTPException(404, "Amenity not found")

    db.delete(amenity)
    db.commit()

    return {"message": "Deleted"}


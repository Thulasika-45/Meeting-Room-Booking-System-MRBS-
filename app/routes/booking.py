from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
import json
from app.db.database import get_db
from app.models.booking import Booking
from app.models.room import Room
from app.models.user import User
from app.schemas.booking import BookingCreate, BookingResponse
from app.core.security import get_current_user_email

router = APIRouter(prefix="/bookings", tags=["Bookings"])

def serialize_booking(b, db):
    room = db.query(Room).filter(Room.id == b.room_id).first()
    user = db.query(User).filter(User.id == b.user_id).first()

    return {
        "id": b.id,
        "room_id": b.room_id,
        "room_name": room.name if room else "",
        "user_id": b.user_id,
        "user_name": user.name if user else "",
        "booking_date": b.booking_date,
        "start_time": b.start_time,
        "end_time": b.end_time,
        "attendees": b.attendees,
        "purpose": b.purpose,
        "status": b.status,
    }


# 🔧 HELPER (FIXED)
def get_user_locations(user):
    try:
        return [loc.lower() for loc in json.loads(user.locations or "[]")]
    except:
        raise HTTPException(500, "Invalid location data")


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
        raise HTTPException(403, "Admin required")
    return user


# ➕ CREATE BOOKING
@router.post("/", response_model=BookingResponse)
def create_booking(request: BookingCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):

    room = db.query(Room).filter(Room.id == request.room_id).first()
    if not room:
        raise HTTPException(404, "Room not found")

    user_locations = get_user_locations(user)

    if room.location.lower() not in user_locations:
        raise HTTPException(403, "Cannot book from different location")

    if request.start_time >= request.end_time:
        raise HTTPException(400, "Invalid time range")

    if request.booking_date < datetime.utcnow().date():
        raise HTTPException(400, "Cannot book past date")

    if request.attendees <= 0:
        raise HTTPException(400, "Invalid attendees")

    conflict = db.query(Booking).filter(
        Booking.room_id == request.room_id,
        Booking.booking_date == request.booking_date,
        Booking.start_time < request.end_time,
        Booking.end_time > request.start_time,
        Booking.status == "approved"
    ).first()

    if conflict:
        raise HTTPException(400, "Room already booked")

    booking = Booking(
        room_id=request.room_id,
        user_id=user.id,
        booking_date=request.booking_date,
        start_time=request.start_time,
        end_time=request.end_time,
        attendees=request.attendees,
        purpose=request.purpose,
        status="pending"
    )

    db.add(booking)
    db.commit()
    db.refresh(booking)

    return {
    "id": booking.id,
    "room_id": booking.room_id,
    "room_name": room.name,
    "user_id": user.id,
    "user_name": user.name,
    "booking_date": booking.booking_date,
    "start_time": booking.start_time,
    "end_time": booking.end_time,
    "attendees": booking.attendees,
    "purpose": booking.purpose,
    "status": booking.status
}


# 📋 MY BOOKINGS
@router.get("/", response_model=list[BookingResponse])
def get_my_bookings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bookings = db.query(Booking).filter(
        Booking.user_id == user.id
    ).order_by(desc(Booking.booking_date)).all()

    return [serialize_booking(b, db) for b in bookings]


# 📋 ROOM BOOKINGS
@router.get("/room/{room_id}", response_model=list[BookingResponse])

def get_room_bookings(room_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):

    user_locations = get_user_locations(user)

    bookings = db.query(Booking).join(Room).filter(
        Booking.room_id == room_id,
        Room.location.in_(user_locations)
    ).all()

    return [serialize_booking(b, db) for b in bookings]


# 📋 ALL BOOKINGS (ADMIN)
@router.get("/all", response_model=list[BookingResponse])
def get_all_bookings(db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):

    admin_locations = get_user_locations(admin)

    bookings = db.query(Booking).join(Room).filter(
        Room.location.in_(admin_locations)
    ).order_by(desc(Booking.id)).all()

    return [serialize_booking(b, db) for b in bookings]

#update booking
@router.put("/{booking_id}")
def update_booking(
    booking_id: int,
    request: BookingCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(404, "Booking not found")

    # 🔒 Only owner can edit
    if booking.user_id != user.id:
        raise HTTPException(403, "Not authorized")

    # ❌ Cannot edit approved / cancelled
    if booking.status in ["approved", "cancelled"]:
        raise HTTPException(400, "Cannot edit this booking")

    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(404, "Room not found")

    # 🌍 Location validation
    if room.location.lower() not in get_user_locations(user):
        raise HTTPException(403, "Invalid location")

    # ⏱️ Time validation
    if request.start_time >= request.end_time:
        raise HTTPException(400, "Invalid time range")

    if request.booking_date < datetime.utcnow().date():
        raise HTTPException(400, "Cannot edit past booking")

    if request.attendees <= 0:
        raise HTTPException(400, "Invalid attendees")

    # ⚠️ Conflict check (exclude current booking)
    conflict = db.query(Booking).filter(
        Booking.room_id == booking.room_id,
        Booking.booking_date == request.booking_date,
        Booking.start_time < request.end_time,
        Booking.end_time > request.start_time,
        Booking.status == "approved",
        Booking.id != booking_id
    ).first()

    if conflict:
        raise HTTPException(400, "Time slot already booked")

    # ✅ UPDATE FIELDS
    booking.booking_date = request.booking_date
    booking.start_time = request.start_time
    booking.end_time = request.end_time
    booking.attendees = request.attendees
    booking.purpose = request.purpose

    db.commit()
    db.refresh(booking)

    return serialize_booking(booking, db)


# ❌ CANCEL
@router.put("/{booking_id}/cancel")
def cancel_booking(booking_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking.user_id != user.id and user.role != "admin":
        raise HTTPException(403, "Not authorized")

    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(404, "Room not found")

    if room.location.lower() not in get_user_locations(user):
        raise HTTPException(403, "Not allowed for this location")

    booking.status = "cancelled"
    db.commit()

    return {"message": "Cancelled"}


# ✅ APPROVE / REJECT
@router.put("/{booking_id}/status")
def update_booking_status(booking_id: int, status: str, db: Session = Depends(get_db), admin: User = Depends(get_current_admin)):

    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking.status == "cancelled":
        raise HTTPException(400, "Cannot modify cancelled booking")

    room = db.query(Room).filter(Room.id == booking.room_id).first()
    if not room:
        raise HTTPException(404, "Room not found")

    if room.location.lower() not in get_user_locations(admin):
        raise HTTPException(403, "Not allowed")

    if status not in ["approved", "rejected"]:
        raise HTTPException(400, "Invalid status")

    booking.status = status
    db.commit()

    return {"message": f"{status} done"}


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking_by_id(
    booking_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()

    if not booking:
        raise HTTPException(404, "Booking not found")

    if booking.user_id != user.id:
        raise HTTPException(403, "Not authorized")

    return serialize_booking(booking, db)
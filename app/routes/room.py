from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, time
import json
from app.models.amenity import Amenity, RoomAmenity
from app.db.database import get_db
from app.models.room import Room
from app.models.user import User
from app.models.booking import Booking
from app.schemas.room import RoomCreate, RoomUpdate, RoomResponse
from app.core.security import get_current_user_email

router = APIRouter(prefix="/rooms", tags=["Rooms"])


# 🔐 GET CURRENT USER
def get_current_user(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email)
):
    user = db.query(User).filter(User.email == user_email).first()

    if not user:
        raise HTTPException(404, "User not found")

    if not user.is_active:
        raise HTTPException(403, "User inactive")

    return user


# 🔐 ADMIN CHECK
def get_current_admin(
    db: Session = Depends(get_db),
    user_email: str = Depends(get_current_user_email)
):
    user = db.query(User).filter(User.email == user_email).first()

    if not user or user.role != "admin":
        raise HTTPException(403, "Admin access required")

    return user


# 🔧 HELPER
def get_user_locations(user):
    try:
        return [loc.lower() for loc in json.loads(user.locations or "[]")]
    except:
        raise HTTPException(500, "Invalid location data format")


# 🔧 SERIALIZER
def serialize_room(room, db):
    room_dict = {
        "id": room.id,
        "name": room.name,
        "capacity": room.capacity,
        "location": room.location,
        "status": room.status,
        "amenities": []
    }

    amenities = db.query(Amenity.name).join(
        RoomAmenity,
        Amenity.id == RoomAmenity.amenity_id
    ).filter(RoomAmenity.room_id == room.id).all()

    room_dict["amenities"] = [a[0] for a in amenities]

    return room_dict

# ➕ CREATE ROOM (ADMIN)
@router.post("/", response_model=RoomResponse)
def create_room(
    request: RoomCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    if db.query(Room).filter(Room.name == request.name).first():
        raise HTTPException(400, "Room already exists")

    if request.capacity <= 0:
        raise HTTPException(400, "Capacity must be > 0")

    if request.status not in ["active", "inactive"]:
        raise HTTPException(400, "Invalid status")

    room = Room(
    name=request.name,
    capacity=request.capacity,
    location=request.location.strip().lower(),
    status=request.status
    )

    db.add(room)
    db.commit()
    db.refresh(room)

# 🔥 insert mapping
    for amenity_id in request.amenities:
        db.add(RoomAmenity(room_id=room.id, amenity_id=amenity_id))

    db.commit()

    return serialize_room(room, db)


# 📋 GET ALL ROOMS (LOCATION FILTERED)
@router.get("/", response_model=List[RoomResponse])
def get_rooms(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    user_locations = get_user_locations(user)
    if not user_locations:
        raise HTTPException(403, "No locations assigned to user")

    query = db.query(Room).filter(
        # Room.status == "active",
        Room.location.in_(user_locations)
    )
    if user.role != "admin":
        query = query.filter(Room.status=="active")
        
    rooms = query.all()

    return [serialize_room(r, db) for r in rooms]


# 🔍 GET ROOM BY ID (SECURE)
@router.get("/{room_id}", response_model=RoomResponse)
def get_room(
    room_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(404, "Room not found")

    if user.role!="admin" and room.status != "active":
        raise HTTPException(400, "Room is inactive")

    user_locations = get_user_locations(user)
    if not user_locations:
        raise HTTPException(403, "No locations assigned to user")


    if room.location not in user_locations:
        raise HTTPException(403, "Access denied")

    return serialize_room(room,db)


# 🔄 UPDATE ROOM (ADMIN)
@router.patch("/{room_id}", response_model=RoomResponse)
def update_room(
    room_id: int,
    request: RoomUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(404, "Room not found")

    update_data = request.dict(exclude_unset=True, exclude_none=True)

    if "capacity" in update_data and update_data["capacity"] <= 0:
        raise HTTPException(400, "Capacity must be > 0")

    if "status" in update_data and update_data["status"] not in ["active", "inactive"]:
        raise HTTPException(400, "Invalid status")

    if "name" in update_data:
        existing = db.query(Room).filter(
            Room.name == update_data["name"],
            Room.id != room_id
        ).first()
        if existing:
            raise HTTPException(400, "Room name already exists")

    if "location" in update_data:
        update_data["location"] = update_data["location"].strip().lower()  

    if "amenities" in update_data:
        db.query(RoomAmenity).filter(RoomAmenity.room_id == room_id).delete()

        for amenity_id in update_data["amenities"]:
            db.add(RoomAmenity(room_id=room_id, amenity_id=amenity_id))

        update_data.pop("amenities")

    for key, value in update_data.items():
        setattr(room, key, value)

    db.commit()
    db.refresh(room)

    return serialize_room(room, db)


# ❌ DELETE ROOM (ADMIN)
@router.delete("/{room_id}")
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(404, "Room not found")

    if db.query(Booking).filter(Booking.room_id == room_id).first():
        raise HTTPException(400, "Room has bookings, cannot delete")

    db.delete(room)
    db.commit()

    return {"message": "Room deleted successfully"}


# 🔍 SEARCH ROOMS (LOCATION + TIME + AMENITIES)
@router.get("/search/")
def search_rooms(
    date: str,
    capacity: int,
    start_time: str,
    end_time: str,
    location: Optional[str] = None,
    amenities: Optional[List[str]] = Query(None),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        booking_date = datetime.strptime(date, "%Y-%m-%d").date()
        req_start = datetime.strptime(start_time, "%H:%M").time()
        req_end = datetime.strptime(end_time, "%H:%M").time()
    except:
        raise HTTPException(400, "Invalid date/time format")

    if req_start >= req_end:
        raise HTTPException(400, "Invalid time range")

    now = datetime.utcnow()
    user_locations = get_user_locations(user)
    if not user_locations:
        raise HTTPException(403, "No locations assigned to user")


    query = db.query(Room).filter(
        Room.capacity >= capacity,
        Room.status == "active",
        Room.location.in_(user_locations)
    )

    if location:
        if location not in user_locations:
            raise HTTPException(403,"Invalid location selection.")
        query = query.filter(Room.location==location.lower())
    rooms=query.all()
    available_rooms = []

    for room in rooms:

        # 🔥 AMENITIES FILTER
        if amenities:
            room_amenity_ids = db.query(RoomAmenity.amenity_id).filter(
                RoomAmenity.room_id == room.id
            ).all()

            room_amenity_ids = [a[0] for a in room_amenity_ids]

            if not all(a in room_amenity_ids for a in amenities):
                continue

        bookings = db.query(Booking).filter(
            Booking.room_id == room.id,
            Booking.booking_date == booking_date
        ).all()

        conflict = False

        for b in bookings:
            if b.status == "approved" or (
                b.status == "pending" and b.expires_at and b.expires_at > now
            ):
                if (b.start_time < req_end) and (b.end_time > req_start):
                    conflict = True
                    break

        if not conflict:
            available_rooms.append(serialize_room(room,db))

    return available_rooms


# ⏱ ROOM AVAILABILITY
@router.get("/{room_id}/availability")
def get_room_availability(
    room_id: int,
    date: str = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user)
):
    try:
        booking_date = datetime.strptime(date, "%Y-%m-%d").date()
    except:
        raise HTTPException(400, "Invalid date format")

    room = db.query(Room).filter(Room.id == room_id).first()

    if not room:
        raise HTTPException(404, "Room not found")

    if user.role!="admin" and room.status != "active":
        raise HTTPException(400, "Room is inactive")

    user_locations = get_user_locations(user)
    if not user_locations:
        raise HTTPException(403, "No locations assigned to user")

    if room.location not in user_locations:
        raise HTTPException(403, "Access denied")

    now = datetime.utcnow()

    bookings = db.query(Booking).filter(
        Booking.room_id == room_id,
        Booking.booking_date == booking_date
    ).all()

    valid_bookings = []

    for b in bookings:
        if b.status == "approved":
            valid_bookings.append(b)
        elif b.status == "pending" and b.expires_at and b.expires_at > now:
            valid_bookings.append(b)

    valid_bookings.sort(key=lambda x: x.start_time)

    WORK_START = time(9, 0)
    WORK_END = time(18, 0)

    free_slots = []
    current_start = WORK_START

    for booking in valid_bookings:
        if current_start < booking.start_time:
            free_slots.append({
                "start": current_start.strftime("%H:%M"),
                "end": booking.start_time.strftime("%H:%M")
            })
        current_start = max(current_start, booking.end_time)

    if current_start < WORK_END:
        free_slots.append({
            "start": current_start.strftime("%H:%M"),
            "end": WORK_END.strftime("%H:%M")
        })

    return free_slots

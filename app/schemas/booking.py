from pydantic import BaseModel
from datetime import date, time




class BookingCreate(BaseModel):
    room_id: int
    booking_date: date
    start_time: time
    end_time: time
    attendees: int     # ✅ NEW
    purpose: str       # ✅ NEW








class BookingResponse(BaseModel):
    id: int
    room_id: int
    room_name: str
    user_id: int
    user_name: str
    booking_date: date
    start_time: time
    end_time: time
    attendees: int
    purpose: str
    status: str




    class Config:
        from_attributes = True



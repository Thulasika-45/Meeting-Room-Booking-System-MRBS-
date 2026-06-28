from sqlalchemy import Column, Integer, ForeignKey, Date, Time, String
from app.db.database import Base


class Booking(Base):
    __tablename__ = "bookings"


    id = Column(Integer, primary_key=True, index=True)


    room_id = Column(Integer, ForeignKey("rooms.id"))
    user_id = Column(Integer, ForeignKey("users.id"))


    booking_date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)


    # ✅ NEW FIELDS (from your UI)
    attendees = Column(Integer)
    purpose = Column(String)


    # ✅ STATUS (for approval system)
    status = Column(String, default="pending")

from sqlalchemy import Column, Integer, String, ForeignKey
from app.db.database import Base


# 🧾 MASTER TABLE
class Amenity(Base):
    __tablename__ = "amenities"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)


# 🔗 MAPPING TABLE (ROOM ↔ AMENITY)
class RoomAmenity(Base):
    __tablename__ = "room_amenities"

    id = Column(Integer, primary_key=True, index=True)

    room_id = Column(Integer, ForeignKey("rooms.id", ondelete="CASCADE"))
    amenity_id = Column(Integer, ForeignKey("amenities.id", ondelete="CASCADE"))

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.db.database import Base
from datetime import datetime
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    employee_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)

    password_hash = Column(String, nullable=False)
    # 🔥 IMPORTANT
    role = Column(String, nullable=False)   # remove default → must be passed
    is_temp_password = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    #token validation
    token_version = Column(Integer, default=0) 
    locations = Column(String, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
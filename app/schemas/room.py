from pydantic import BaseModel
from typing import List,Optional




class RoomCreate(BaseModel):
    name: str
    capacity: int
    # floor: str
    # building: str
    location: str
    status: str
    amenities: List[int]




class RoomUpdate(BaseModel):
    name: Optional[str] = None
    capacity: Optional[int] = None
    # floor: Optional[str] = None
    # building: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None
    amenities: Optional[List[int]] = None




class RoomResponse(BaseModel):
    id: int
    name: str
    capacity: int
    # floor: str
    # building: str
    location:str
    status: str
    amenities: List[str]


    class Config:
        from_attributes = True
from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserCreate(BaseModel):
    employee_id: str
    name: str
    email: EmailStr




    # ✅ NEW FIELD
    role: str   # "admin" or "user"
    locations: List[str]






class UserResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: str
    role: str
    locations: List[str]
    is_temp_password: bool




    class Config:
        from_attributes = True




class UserUpdate(BaseModel):
    name: Optional[str]=None
    email: Optional[EmailStr]=None
    role: Optional[str]=None
    locations: Optional[List[str]] = None






class UserListResponse(BaseModel):
    id: int
    employee_id: str
    name: str
    email: EmailStr
    role: str
    is_temp_password: bool


    class Config:
        from_attributes = True



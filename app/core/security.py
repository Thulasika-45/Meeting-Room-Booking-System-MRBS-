from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User


# 🔐 CONFIG
SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

# 🔐 PASSWORD HASHING
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 🔐 AUTH SCHEME
security = HTTPBearer()


# 🔑 HASH PASSWORD
def hash_password(password: str):
    return pwd_context.hash(password)


# 🔑 VERIFY PASSWORD
def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)


# 🔑 CREATE JWT TOKEN
def create_access_token(data: dict , token_version: int):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire,"token_version": token_version })
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


# 🔑 GET CURRENT USER FROM TOKEN
def get_current_user_email(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])


        email = payload.get("sub")
        token_version = payload.get("token_version")


        user = db.query(User).filter(User.email == email).first()


        if not user:
            raise HTTPException(status_code=401, detail="Invalid user")


        # 🔥 CRITICAL CHECK
        if user.token_version != token_version:
            raise HTTPException(status_code=401, detail="Token expired. Please login again")


        return email


    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
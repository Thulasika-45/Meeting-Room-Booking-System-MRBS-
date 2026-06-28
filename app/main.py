from fastapi import FastAPI
from app.db.database import Base, engine, SessionLocal
from app.models.user import User
from app.routes import auth
from app.routes import room
from app.models import booking as booking_model
from app.routes import booking
from app.models import room as room_model
from app.routes import create_user
import json
from app.core.security import hash_password
from app.routes import amenities
from fastapi.middleware.cors import CORSMiddleware



app = FastAPI()
# create tables

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # your frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)


# create test user (ONLY FOR FIRST RUN)
def create_test_user():
    db = SessionLocal()

    if not db.query(User).filter(User.email == "admin@test.com").first():
        user = User(
            employee_id="00001",
            name="Admin",
            email="admin@test.com",
            password_hash=hash_password("Hinduja@00001"),
            role="admin",
            is_temp_password=True,
            is_active=True,
            locations=json.dumps(['guindy','perungalathur'])
        )
        db.add(user)
        db.commit()
        print("✅ Test user created")

    db.close()


create_test_user()



# create tables
Base.metadata.create_all(bind=engine)


app.include_router(auth.router)
app.include_router(room.router)
app.include_router(booking.router)
app.include_router(create_user.router)
app.include_router(amenities.router)





@app.get("/")
def root():
    return {"status": "OK"}

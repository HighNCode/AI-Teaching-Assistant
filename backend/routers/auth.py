from fastapi import APIRouter, HTTPException, Depends
from models.user import User
from pymongo.database import Database
from database import get_db
import jwt

router = APIRouter()

@router.post("/signup")
async def signup(user: User, db: Database = Depends(get_db)):
    print(f"Signup request received for email: {user.email}")
    # Check if user already exists
    if db.users.find_one({"email": user.email}):
        print(f"User with email {user.email} already exists.")
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password before saving
    user.hash_password()
    
    # Save the user to the database
    user_dict = user.dict()
    db.users.insert_one(user_dict)
    
    # Generate a JWT token
    token = jwt.encode({"email": user.email}, "secret", algorithm="HS256")

    return {"token": token, "user": {"email": user.email, "full_name": user.full_name}}

@router.post("/login")
async def login(user: User, db: Database = Depends(get_db)):
    # Find user in the database
    db_user = db.users.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create a User instance from the db data to use the verification method
    user_in_db = User(**db_user)

    # Verify the password
    if not user_in_db.verify_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Generate a JWT token
    token = jwt.encode({"email": user.email}, "secret", algorithm="HS256")
    return {"token": token, "user": {"email": user.email, "full_name": user_in_db.full_name}}

@router.post("/logout")
async def logout():
    # This endpoint can be used to invalidate tokens on the server-side if needed.
    # For now, it will just confirm the logout action.
    return {"message": "Logout successful"}
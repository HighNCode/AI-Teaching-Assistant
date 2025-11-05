import asyncio
from pymongo import MongoClient
from bson.objectid import ObjectId
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# It's good practice to secure your database credentials
MONGO_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "testdb" # You might want to extract this from the URI if it's present

# This would be your actual hashing function from your app
# For this test, we'll simulate it.
def hash_password(password: str) -> str:
    # In a real app, you'd use something like passlib or bcrypt
    # Example: from passlib.context import CryptContext
    # pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    # return pwd_context.hash(password)
    return f"hashed_{password}"

async def test_signup():
    """
    Tests the user signup process by directly inserting a user
    into the database and verifying the insertion.
    """
    client = None  # Initialize client to None
    try:
        # Connect to MongoDB
        client = MongoClient(MONGO_URI)
        db = client[DATABASE_NAME]
        users_collection = db.users

        # 1. Define a sample user
        # Using a unique email to avoid conflicts on re-runs
        import time
        email = f"testuser_{int(time.time())}@example.com"
        password = "a_secure_password"
        
        # 2. Hash the password
        hashed_password = hash_password(password)

        # 3. Directly insert the new user data
        user_data = {
            "email": email,
            "hashed_password": hashed_password,
            "full_name": "Test User"
        }
        result = await asyncio.to_thread(users_collection.insert_one, user_data)
        
        print(f"Attempted to insert user with email: {email}")
        
        # 4. Query the database to confirm creation
        inserted_id = result.inserted_id
        created_user = await asyncio.to_thread(users_collection.find_one, {"_id": inserted_id})

        # 5. Print success or error message
        if created_user:
            print("\n--- Test Result ---")
            print(f"✅ Success: User '{created_user['email']}' was created successfully.")
            print(f"   - User ID: {created_user['_id']}")
            print("   - Full Name:", created_user.get("full_name", "N/A"))
            print("-------------------\n")
        else:
            print("\n--- Test Result ---")
            print(f"❌ Error: Failed to find the user with email '{email}' after insertion.")
            print("-------------------\n")

    except Exception as e:
        print(f"\n--- Test Error ---")
        print(f"An error occurred: {e}")
        print("--------------------\n")
    finally:
        # Ensure the client connection is closed
        if client:
            client.close()
            print("MongoDB connection closed.")

if __name__ == "__main__":
    # Running the async test function
    asyncio.run(test_signup())
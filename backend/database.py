import os
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
from dotenv import load_dotenv

load_dotenv()

client = None
db = None

def connect_to_mongo():
    global client, db
    try:
        mongo_uri = os.getenv("MONGODB_URI")
        if not mongo_uri:
            raise ValueError("MONGODB_URI environment variable not set")
        client = MongoClient(mongo_uri)
        client.admin.command('ismaster')
        db = client.get_database("testdb") # Or your specific database name
        print("Successfully connected to MongoDB.")
    except (ValueError, ConnectionFailure) as e:
        print(f"Error connecting to MongoDB: {e}")
        client = None
        db = None

def get_db():
    if db is None:
        # This is a fallback, but connect_to_mongo should be called on startup.
        connect_to_mongo()
    return db

def close_mongo_connection():
    global client
    if client:
        client.close()
        print("MongoDB connection closed.")
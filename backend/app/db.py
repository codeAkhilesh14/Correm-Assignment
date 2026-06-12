import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None
    db = None

db_instance = Database()

async def connect_db():
    try:
        logger.info(f"Connecting to MongoDB at: {settings.MONGO_URI.split('@')[-1] if '@' in settings.MONGO_URI else settings.MONGO_URI}")
        db_instance.client = AsyncIOMotorClient(settings.MONGO_URI)
        db_instance.db = db_instance.client[settings.DB_NAME]
        
        # Test connection
        await db_instance.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB.")
        
        # Initialize Indexes
        await init_indexes()
        
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise e

async def close_db():
    if db_instance.client:
        db_instance.client.close()
        logger.info("MongoDB connection closed.")

async def init_indexes():
    """Create indexes for performance and constraints."""
    db = db_instance.db
    if db is None:
        return
        
    try:
        # User indexes
        await db["users"].create_index("email", unique=True)
        
        # Statement indexes
        await db["statements"].create_index("userId")
        await db["statements"].create_index("createdAt")
        
        # Transaction indexes
        await db["transactions"].create_index("statementId")
        await db["transactions"].create_index("userId")
        await db["transactions"].create_index("date")
        await db["transactions"].create_index("category")
        
        logger.info("Database indexes verified/created successfully.")
    except Exception as e:
        logger.error(f"Failed to create database indexes: {e}")

def get_db():
    """Dependency helper to get the database instance."""
    return db_instance.db

import asyncio
import logging
from sqlalchemy import select
from src.app.core.config import settings
from src.app.core.database import async_session_maker
from src.app.core.security import get_password_hash
from src.app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def create_first_superuser() -> None:
    email = settings.FIRST_SUPERUSER_EMAIL
    password = settings.FIRST_SUPERUSER_PASSWORD
    
    if not email or not password:
        logger.error("FIRST_SUPERUSER_EMAIL or FIRST_SUPERUSER_PASSWORD not set in environment.")
        return

    logger.info(f"Creating superuser: {email}")
    async with async_session_maker() as session:
        # Check if user already exists
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            logger.info(f"Superuser {email} already exists.")
            return
        
        username = email.split('@')[0]
        # Check if username exists
        result_username = await session.execute(select(User).where(User.username == username))
        existing_username = result_username.scalar_one_or_none()
        if existing_username:
            username = f"{username}_{abs(hash(email)) % 1000}"

        superuser = User(
            email=email,
            username=username,
            hashed_password=get_password_hash(password),
            full_name="System Admin",
            is_active=True,
            is_superuser=True,
        )
        session.add(superuser)
        await session.commit()
        logger.info(f"Superuser {email} successfully created.")

if __name__ == "__main__":
    asyncio.run(create_first_superuser())

import logging
logger = logging.getLogger(__name__)

from backend.modules.account import repositories


async def check_email_service(db, email: str):
    try:
        response = await repositories.check_email_repo(db, email)
        
        return response
    except:
        logger.exception("check email failed!")
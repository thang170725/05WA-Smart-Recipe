import logging
import os

from dotenv import load_dotenv

load_dotenv()

#
# ====== CONSTRAINT =======
#
# ANSI colors 
RESET = "\033[0m" 
GREEN = "\033[32m" 
YELLOW = "\033[33m"
RED = "\033[31m" 
BOLD_RED = "\033[1;31m"
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()

class ColoredFormatter(logging.Formatter): 
    COLORS = { 
        logging.DEBUG: "", 
        logging.INFO: GREEN, 
        logging.WARNING: YELLOW, 
        logging.ERROR: RED, 
        logging.CRITICAL: BOLD_RED, 
    } 
    
    def format(self, record): 
        message = super().format(record) 
        color = self.COLORS.get(record.levelno, RESET) 
        if not color: 
            return message 
        return f"{color}{message}{RESET}"

def setup_logging():
    handler = logging.StreamHandler()

    formatter = ColoredFormatter( "%(levelname)s | %(name)s | %(message)s" )
    handler.setFormatter(formatter)

    logging.basicConfig(
        level=LOG_LEVEL,
        handlers=[handler],
    )
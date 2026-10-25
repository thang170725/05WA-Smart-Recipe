import logging
import os
import sys

from dotenv import load_dotenv

load_dotenv()

class ColorFormatter(logging.Formatter):
    """Tô màu log level bằng ANSI escape codes."""

    RESET = "\033[0m"
    COLORS = {
        logging.DEBUG: "\033[90m",      # Xám
        logging.INFO: "\033[92m",       # Xanh lá
        logging.WARNING: "\033[93m",    # Vàng
        logging.ERROR: "\033[91m",      # Đỏ
        logging.CRITICAL: "\033[97;41m",  # Chữ trắng, nền đỏ
    }

    def format(self, record):
        # Sao chép record để không ảnh hưởng đến handler khác
        record = logging.makeLogRecord(record.__dict__.copy())

        color = self.COLORS.get(record.levelno, "")
        record.levelname = f"{color}{record.levelname}{self.RESET}"

        return super().format(record)

def setup_logging():
    """Cấu hình logging có màu cho terminal."""

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        ColorFormatter("%(levelname)s | %(name)s | %(message)s")
    )

    root_logger = logging.getLogger()
    root_logger.setLevel(
        getattr(
            logging,
            os.getenv("LOG_LEVEL", "DEBUG").upper(),
            logging.DEBUG,
        )
    )

    # Xóa handler cũ để tránh log bị in trùng
    root_logger.handlers.clear()
    root_logger.addHandler(handler)
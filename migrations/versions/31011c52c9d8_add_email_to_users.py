"""add email to users

Revision ID: 31011c52c9d8
Revises: 
Create Date: 2026-02-25 16:15:45.314044
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers
revision: str = '31011c52c9d8'
down_revision: Union[str, Sequence[str], None] = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "gender",
        existing_type=sa.Enum("male", "female", "other"), 
        nullable=False
    )


def downgrade() -> None:
    op.drop_column("users", "gender")
"""change datatype gender column

Revision ID: 8ae63ed89286
Revises: 31011c52c9d8
Create Date: 2026-02-26 19:46:15.221981

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8ae63ed89286'
down_revision: Union[str, Sequence[str], None] = '31011c52c9d8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "gender",
        existing_type=sa.Enum("male", "female", "other"), 
        nullable=False
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "gender",
        existing_type=sa.Enum("male", "female"),
        nullable=True
    )

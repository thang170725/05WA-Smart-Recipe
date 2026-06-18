from pydantic import BaseModel
from typing import List

class IngredientsSchema(BaseModel):
    ingredients: List[str]

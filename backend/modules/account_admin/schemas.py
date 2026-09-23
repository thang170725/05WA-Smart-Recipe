from pydantic import BaseModel

class InputLoginSchema(BaseModel):
    email: str
    password: str
from pydantic import BaseModel

class A(BaseModel):
  """đây là class A"""
  pass

print(A.__doc__)
from pydantic import BaseModel
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from typing import Optional

class User(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

    def hash_password(self):
        self.password = pwd_context.hash(self.password)

    def verify_password(self, plain_password):
        return pwd_context.verify(plain_password, self.password)
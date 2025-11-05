from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer
import jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def get_current_user(request: Request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        scheme, token = auth_header.split()
        if scheme.lower() != "bearer":
            raise HTTPException(status_code=401, detail="Invalid authentication scheme")
        
        payload = jwt.decode(token, "secret", algorithms=["HS256"])
        return payload
    except (ValueError, jwt.PyJWTError) as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
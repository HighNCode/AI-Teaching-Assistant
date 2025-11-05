from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
import jwt

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.url.path.startswith("/api/v1/projects"):
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                raise HTTPException(status_code=401, detail="Not authenticated")

            try:
                scheme, token = auth_header.split()
                if scheme.lower() != "bearer":
                    raise HTTPException(status_code=401, detail="Invalid authentication scheme")
                
                # In a real app, use a more secure secret and proper validation
                jwt.decode(token, "secret", algorithms=["HS256"])
            except (ValueError, jwt.PyJWTError) as e:
                raise HTTPException(status_code=401, detail=f"Invalid token: {e}")

        response = await call_next(request)
        return response
from dataclasses import dataclass

from fastapi import Depends, Header, HTTPException

from .config import Settings, get_settings


@dataclass(frozen=True)
class Principal:
    sub: str
    name: str
    email: str


def get_principal(authorization: str | None = Header(default=None), settings: Settings = Depends(get_settings)) -> Principal:
    if settings.mock_auth:
        return Principal(sub="demo-user-001", name="Alex Morgan", email="alex@echoscript.local")
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    raise HTTPException(status_code=501, detail="Configure Cognito JWT verification before disabling mock authentication")


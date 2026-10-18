from functools import lru_cache

import jwt
from fastapi import HTTPException


@lru_cache
def jwks_client(issuer: str) -> jwt.PyJWKClient:
    return jwt.PyJWKClient(f"{issuer.rstrip('/')}/.well-known/jwks.json", cache_jwk_set=True, lifespan=3600)


def verify_access_token(token: str, issuer: str, client_id: str) -> dict:
    if not issuer or not client_id:
        raise HTTPException(status_code=503, detail="Cognito verification is not configured")
    try:
        signing_key = jwks_client(issuer).get_signing_key_from_jwt(token)
        claims = jwt.decode(token, signing_key.key, algorithms=["RS256"], issuer=issuer, options={"require": ["exp", "iss", "sub", "token_use"]})
    except jwt.PyJWTError as error:
        raise HTTPException(status_code=401, detail="Invalid or expired access token") from error
    if claims.get("token_use") != "access" or claims.get("client_id") != client_id:
        raise HTTPException(status_code=401, detail="Token is not valid for this application")
    return claims


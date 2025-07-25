from pydantic import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "Aloo"
    SECRET_KEY: str = "your-secret-key-here"  # Change this in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SQLALCHEMY_DATABASE_URL: str = "postgresql://user:password@localhost/aloo"  # Update with your DB credentials

    class Config:
        case_sensitive = True

settings = Settings()

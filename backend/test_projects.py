import pytest
from httpx import AsyncClient
from main import app
from database import get_db
from dependencies import get_current_user
from models.user import UserInDB
from bson import ObjectId

# Mock database
@pytest.fixture
def db_mock(mocker):
    mock_db = mocker.MagicMock()
    mock_db.users = mocker.MagicMock()
    mock_db.projects = mocker.MagicMock()
    return mock_db

# Override get_db dependency
async def override_get_db(db_mock):
    yield db_mock

# Mock current user
@pytest.fixture
def current_user_mock(mocker):
    mock_user = {
        "email": "test@example.com",
        "username": "testuser",
        "user_id": str(ObjectId())
    }
    return mock_user

# Override get_current_user dependency
async def override_get_current_user(current_user_mock):
    return current_user_mock

@pytest.mark.asyncio
async def test_delete_project(db_mock, current_user_mock):
    app.dependency_overrides[get_db] = lambda: db_mock
    app.dependency_overrides[get_current_user] = lambda: current_user_mock

    user_id = current_user_mock["user_id"]
    project_id = str(ObjectId())

    db_mock.users.find_one.return_value = {"_id": user_id, "email": current_user_mock["email"]}
    db_mock.projects.find_one.return_value = {"_id": ObjectId(project_id), "userId": user_id}
    db_mock.projects.delete_one.return_value.deleted_count = 1

    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.delete(f"/api/v1/projects/{project_id}")

    assert response.status_code == 204

    db_mock.projects.delete_one.assert_called_once_with({"_id": ObjectId(project_id)})

    # Clean up overrides
    app.dependency_overrides = {}